"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import ProductClient from "@/components/ProductClient";

type Product = {
  id: string;
  title?: string;
  brand: string;
  description: string;
  category: string;
  filter: string;
  price: number | string;
  images: string[];
  user_id: string;
  location?: string | null;
  public_users?: {
    id: string;
    display_name?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
    social_media?: Record<string, { url: string; icon?: string }>;
    sold_products_count?: number | null;
    created_at?: string;
  };
};

type SupabaseProductResponse = {
  id: string;
  title?: string | null;
  brand: string | null;
  description: string | null;
  category: string | null;
  filter: string | null;
  price: number | string | null;
  images: string[] | null;
  user_id: string | null;
  location?: string | null;
  public_users?: {
    id: string;
    display_name?: string | null;
    avatar_url?: string | null;
    location?: string | null;
    sold_products_count?: number | null;
  } | null;
};

function normalizeProductData(data: SupabaseProductResponse): Product {
  return {
    id: data.id,
    title: data.title ?? '',
    brand: data.brand ?? '',
    description: data.description ?? '',
    category: data.category ?? '',
    filter: data.filter ?? '',
    price: data.price ?? 0,
    images: data.images ?? [],
    user_id: data.user_id ?? '',
    location: data.location ?? null,
    public_users: data.public_users ?? undefined,
  };
}

export default function ProductPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("public_products")
        .select(`
          *,
          public_users (
            id,
            first_name,
            surname, 
            avatar_url,
            location,
            sold_products_count
          )
        `)
        .eq("id", id)
        .single();

      if (!error && data) setProduct(normalizeProductData(data));
      else alert("Viga toote laadimisel:");

      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div>Laen...</div>;
  if (!product) return <div>Toode ei leitud</div>;

  return (
    <>
      <ProductClient product={product} />
    </>
  );
}
