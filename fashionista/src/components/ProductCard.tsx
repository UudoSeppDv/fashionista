export default function ProductCard({ title, price, image }: ProductProps) {
  return (
    <div className="relative w-[250px] group">
      
      {/* Favorite icon */}
      <div className="absolute top-4 right-4 bg-gray-700 bg-opacity-50 p-2 z-20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </div>

      {/* Image wrapper with hover shadow and gradient overlay */}
      <div
  className="w-[250px] h-[350px] overflow-hidden border border-gray-600 bg-white relative transition-all duration-300 group-hover:[box-shadow:0_6px_8px_rgba(0,0,0,0.15)]"
>

        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Shadow overlay on image itself */}
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-300 z-10 pointer-events-none" />
      </div>

      {/* Product info */}
      <div className="py-3">
        <p className="font-montserrat text-sm text-gray-700">{title}</p>
        <p className="font-montserrat text-black text-2xl font-bold mt-1">{price.toFixed(2)} €</p>
      </div>
    </div>
  );
}
