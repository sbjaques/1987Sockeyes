export function Hero() {
  return (
    <section className="relative bg-navy text-cream">
      <img
        src="/assets/hero-centennial.jpg"
        alt="Richmond Sockeyes hoisting the Centennial Cup, May 1987"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="relative mx-auto max-w-6xl px-6 py-32 text-center">
        <p className="uppercase tracking-[0.3em] text-crimson text-sm">1987</p>
        <h1 className="font-display text-5xl md:text-7xl mt-4">
          Centennial Cup Champions
        </h1>
        <p className="mt-4 text-lg">Richmond Sockeyes — Mowat · Doyle · Abbott · Centennial</p>
      </div>
    </section>
  );
}
