type ProductProps = {
  title: string;
  price: number;
  image: string;
}

export default function ProductCard({ title, price, image }: ProductProps) {
  return (
    <div className="rounded-xl shadow-md overflow-hidden bg-white">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-gray-600">{price} €</p>
      </div>
    </div>
  );
}
