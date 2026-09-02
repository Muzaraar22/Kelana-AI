import Link from "next/link";
import Button from "../shared/Button";

export default function LoggedOutCta() {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-6 text-center backdrop-blur sm:p-8">
      <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
        Masuk untuk mulai merencanakan
      </h2>
      <p className="mt-2 text-sm text-zinc-200">
        Buat akun gratis untuk menyimpan trip, menyusun itinerary AI, dan mengaturnya kapan saja.
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button href="/register" className="sm:px-6">
          Daftar
        </Button>
        <Button href="/login" variant="secondary" className="sm:px-6">
          Masuk
        </Button>
      </div>
      <p className="mt-4 text-xs text-zinc-300">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-white underline">
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
