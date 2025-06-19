import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

type Product = {
  id: string;
  brand: string;
  price: number;
  images: string[];
  description?: string;
};

// Supabase kliendi initsialiseerimine (paned oma keskkonnamuutujad)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// See komponent on serverikomponent, sest page.tsx on Next.js 13 app-directory juures serveri pool
export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const { data: product, error } = await supabase
    .from<Product>('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">{product.brand}</h1>

      <div className="flex gap-4 mb-6">
        {/* Suur esimene pilt */}
        {product.images && product.images.length > 0 && (
          <img
            src={product.images[0]}
            alt={`${product.brand} - esipilt`}
            className="w-2/3 object-cover rounded"
          />
        )}

        {/* Väiksemad kõrval olevad pildid */}
        <div className="flex flex-col gap-2 w-1/3 overflow-y-auto max-h-[350px]">
          {product.images && product.images.length > 1 && product.images.slice(1).map((imgUrl, index) => (
            <img
              key={index}
              src={imgUrl}
              alt={`${product.brand} - pilt ${index + 2}`}
              className="object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
              style={{ height: '80px', width: '100%' }}
            />
          ))}
        </div>
      </div>

      <p className="text-xl font-semibold mb-2">
        Hind: {product.price != null ? Number(product.price).toFixed(2) : "Hind puudub"} €
      </p>

      {product.description && (
        <p className="text-gray-700">{product.description}</p>
      )}
    </div>
  );
}
