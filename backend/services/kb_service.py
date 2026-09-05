"""
Assistant knowledge-base service.

Two steps per question, both real billed AWS calls:
  1. `bedrock-agent-runtime.retrieve` pulls the most relevant passages from the
     managed Bedrock Knowledge Base (`KNOWLEDGE_BASE_ID`). Managed KBs support
     Retrieve, not RetrieveAndGenerate, so we retrieve here...
  2. ...then feed those passages to the same bearer-token `bedrock-runtime`
     `converse` client used for itineraries and let the model write the answer.

This module itself is DB-free and stateless — each call re-retrieves and
re-generates from scratch; conversation persistence and history-trimming live
in main.py, which passes prior turns in via the `history` argument below.
"""

import os

import boto3

from services.bedrock_service import get_bedrock_client

NUM_RESULTS = 5
MAX_OUTPUT_TOKENS = 1024
# low temperature -> stay close to the retrieved references, less invention
TEMPERATURE = 0.2

_SYSTEM_PROMPT = """
You are KelanaAI's travel assistant. Answer the traveller's question using ONLY
the reference material provided. If the references do not contain the answer, say
so honestly and briefly in the traveller's language — never invent facts.

Formatting rules (the client renders Markdown):
- Keep the answer concise and easy to scan.
- Wrap the key takeaways, place names, prices, and dates in **bold**.
- Mark critical warnings or must-know caveats with `backticks`.
- Use "- " bullet lists when you enumerate more than two items.
""".strip()

_agent_client = None


def _get_agent_client():
    """Cached bedrock-agent-runtime client (KB retrieval lives here, not on bedrock-runtime)."""
    global _agent_client
    if _agent_client is None:
        _agent_client = boto3.client(
            service_name="bedrock-agent-runtime",
            region_name=os.getenv("AWS_REGION"),
        )
    return _agent_client


def _retrieve(question: str) -> list[dict]:
    kb_id = os.getenv("KNOWLEDGE_BASE_ID")
    if not kb_id:
        raise RuntimeError("KNOWLEDGE_BASE_ID is not set. Check your .env file.")

    # managed (fully-managed) knowledge bases reject vectorSearchConfiguration —
    # they take managedSearchConfiguration instead.
    response = _get_agent_client().retrieve(
        knowledgeBaseId=kb_id,
        retrievalQuery={"text": question},
        retrievalConfiguration={
            "managedSearchConfiguration": {"numberOfResults": NUM_RESULTS},
        },
    )

    passages: list[dict] = []
    for item in response.get("retrievalResults", []):
        text = (item.get("content") or {}).get("text", "").strip()
        if not text:
            continue
        location = item.get("location") or {}
        source = (
            location.get("s3Location", {}).get("uri")
            or location.get("webLocation", {}).get("url")
            or location.get("confluenceLocation", {}).get("url")
            or location.get("salesforceLocation", {}).get("url")
        )
        passages.append({"text": text, "source": source})
    return passages


def ask_knowledge_base(question: str, history: list[dict] | None = None) -> dict:
    """Retrieve → generate. Returns {"answer": str, "sources": list[str]}.

    `history` is an optional list of {"role": "user"|"assistant", "content": str}
    turns, oldest first, already trimmed and alternation-sanitised by the caller
    (this function stays DB-free — it never queries anything itself, same as
    bedrock_service.generate_ai_recommendation() takes a plain object). Prior
    turns are replayed verbatim so the model has real dialogue context; freshly
    retrieved KB passages are injected only into the current/latest question.
    """
    passages = _retrieve(question)

    if not passages:
        return {
            "answer": (
                "Maaf, aku belum menemukan informasi soal itu di knowledge base "
                "KelanaAI. Coba tanyakan dengan kata kunci lain, ya."
            ),
            "sources": [],
        }

    context = "\n\n".join(
        f"[Reference {i + 1}]\n{p['text']}" for i, p in enumerate(passages)
    )

    messages = [
        {"role": turn["role"], "content": [{"text": turn["content"]}]}
        for turn in (history or [])
    ]
    messages.append(
        {
            "role": "user",
            "content": [
                {
                    "text": (
                        f"Reference material:\n{context}\n\n"
                        f"Traveller question: {question}"
                    )
                }
            ],
        }
    )

    client = get_bedrock_client()
    response = client.converse(
        modelId=os.getenv("MODEL_ID", "amazon.nova-lite-v1:0"),
        system=[{"text": _SYSTEM_PROMPT}],
        messages=messages,
        inferenceConfig={
            "maxTokens": MAX_OUTPUT_TOKENS,
            "temperature": TEMPERATURE,
        },
    )

    answer = response["output"]["message"]["content"][0]["text"].strip()

    sources: list[str] = []
    for p in passages:
        if p["source"] and p["source"] not in sources:
            sources.append(p["source"])

    return {"answer": answer, "sources": sources}
