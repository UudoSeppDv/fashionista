"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import ProductClient from "@/components/ProductClient";

type Product = {
  id: string;
  title: string;
  brand: string;
  description: string;
  price: number;
  images: string[];
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
        .select("*")
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

  return <ProductClient product={product} />;
    }
