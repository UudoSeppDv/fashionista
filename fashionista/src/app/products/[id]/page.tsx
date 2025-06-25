import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import ProductClient from '../../../components/ProductClient';


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    notFound();
  }

  return <ProductClient product={product} />;
}
