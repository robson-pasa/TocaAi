import { useEffect, useMemo, useState } from "react";

const BANNER_INTERVAL_MS = 4000;

export default function BannerCarousel({ banners }) {
  const active = useMemo(() => banners.filter((b) => b.hasImage), [banners]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (active.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % active.length);
    }, BANNER_INTERVAL_MS);
    return () => clearInterval(id);
  }, [active.length]);

  if (active.length === 0) return null;

  return (
    <div className="relative w-full aspect-[16/6] sm:aspect-[3/1] rounded-2xl overflow-hidden mb-6 bg-accent-light border border-border">
      {active.map((b, i) => (
        <img
          key={b.slot}
          src={`/api/banners/${b.slot}/file?v=${b.updatedAt}`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: i === index % active.length ? 1 : 0 }}
        />
      ))}
    </div>
  );
}
