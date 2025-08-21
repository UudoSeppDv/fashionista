import { useFavorites } from "@/context/FavoritesContext";
import Link from "next/link";
import Image from "next/image";

type ProductProps = {
  id: string;
  brand: string;
  price: string | number;
  filter?: string;
  images: string[];
  visible?: boolean; // ← uus väli
};

export default function ProductCard({
  id,
  brand,
  price,
  images,
}: ProductProps) {
  const { favorites, toggleFavorite, isLoading } = useFavorites();

  const isFavorited = favorites.has(id);

  const firstImage =
    Array.isArray(images) && images.length > 0 && images[0].startsWith("http")
      ? images[0]
      : "/placeholder.png";

  const handleCardClick = () => {
    const viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    const updated = [id, ...viewed.filter((itemId: string) => itemId !== id)];
    localStorage.setItem("recentlyViewed", JSON.stringify(updated.slice(0, 5)));
  };

  return (
   <div className="z-11 relative flex-1 min-w-[120px] max-w-[300px] group cursor-pointer">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(id);
        }}
        aria-label="Toggle favorite"
        className="absolute top-3 right-3 p-2 z-20 focus:outline-none"
        style={{ backgroundColor: "rgba(75, 85, 99, 0.4)" }}
        disabled={isLoading}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 transition-colors duration-300 ${
            isFavorited
              ? "fill-pink-200 stroke-pink-200"
              : "fill-none stroke-white"
          }`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
               2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
               C13.09 3.81 14.76 3 16.5 3 
               19.58 3 22 5.42 22 8.5
               c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
      </button>

    <Link href={`/products/${id}`} onClick={handleCardClick} className="block">
    <div className="relative w-full aspect-[2/3] overflow-hidden border border-gray-600 bg-white transition-all duration-300 group-hover:[box-shadow:0_6px_8px_rgba(0,0,0,0.15)]">
      <Image
        src={firstImage}
        alt={brand || "Toote pilt"}
        fill
        sizes="(max-width: 768px) 100vw, 300px"
        priority
        className="object-cover"
      />
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-300 z-10 pointer-events-none" />
    </div>

    <div className="py-3">
  <p className="font-montserrat text-xs sm:text-sm text-gray-700">{brand}</p>
  <p className="font-montserrat text-xl sm:text-2xl font-bold mt-1">
    {price != null ? `${Number(price).toFixed(2)} €` : "Hind puudub"}
  </p>
</div>

  </Link>
    </div>
  );
}
