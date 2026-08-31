import Image from "next/image";
import TripPlanner from "./components/trip-planner/TripPlanner";
import TripCategories from "./components/home/TripCategories";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <section id="destinasi" className="relative flex min-h-[560px] w-full scroll-mt-16 items-center justify-center overflow-hidden sm:min-h-[640px]">
        <Image
          src="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=1920&auto=format&fit=crop"
          alt="Pemandangan sawah berundak di Bali saat matahari terbenam"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-20 text-center">
          <h1 className="max-w-2xl font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Rencanakan Perjalanan Impianmu, Ditemani AI
          </h1>
          <p className="mt-4 max-w-xl text-base text-zinc-200 sm:text-lg">
            Masukkan destinasi dan budgetmu, KelanaAI bantu susun rekomendasi transportasi,
            estimasi biaya harian, dan tempat wisata terbaik.
          </p>

          <div className="mt-10 w-full max-w-3xl">
            <TripPlanner />
          </div>
        </div>
      </section>

      <TripCategories />
    </div>
  );
}
