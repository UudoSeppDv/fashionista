import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import ProductClient from '../../../components/ProductClient'; // tee õige path vastavalt
import type { Product } from '../../../components/ProductClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

type Props = {
  params: {
    id: string;
  };
};

export default async function ProductPage({ params }: Props) {
  const { id } = params;

  const { data: product, error } = await supabase
    .from<Product>('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    notFound();
  }

  // Edasta andmed client komponendile
  return <ProductClient product={product} />;
}
