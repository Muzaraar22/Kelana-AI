import Icon from "../shared/Icon";

const categories = [
  {
    name: "Backpacker",
    description: "Trip hemat dengan transportasi umum dan penginapan sederhana. Cocok buat kamu yang eksplor dengan budget terbatas.",
    icon: "compass",
  },
  {
    name: "Standard",
    description: "Keseimbangan antara kenyamanan dan harga. Transportasi dan akomodasi kelas menengah untuk perjalanan yang santai.",
    icon: "briefcase",
  },
  {
    name: "Luxury",
    description: "Pengalaman perjalanan premium dengan penerbangan dan hotel bintang lima. Nikmati liburan tanpa kompromi.",
    icon: "gem",
  },
];

export default function TripCategories() {
  return (
    <section id="cara-kerja" className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          Kategori Trip Ditentukan Otomatis dari Budgetmu
        </h2>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Kamu tidak perlu memilih kategori secara manual — cukup masukkan budget di form di atas,
          dan KelanaAI otomatis menentukan kategori, rekomendasi transportasi, hingga itinerary yang sesuai.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.name}
            className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
              <Icon name={category.icon} className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {category.name}
            </h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {category.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
