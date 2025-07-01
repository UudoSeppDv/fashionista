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
  public_users?: {
    id: string;
    display_name?: string | null;
    avatar_url?: string | null;
    location?: string | null;
    bio?: string | null;
    social_media?: Record<string, { url: string; icon?: string }>;
    sold_products_count?: number | null;
    created_at?: string;
  };
};

export default function ProductPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          public_users (
            id,
            display_name,
            avatar_url,
            location,
            sold_products_count
          )
        `)
        .eq("id", id)
        .single();

      if (!error) setProduct(data);
      else console.error("Viga toote laadimisel:", error);

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
