'use client'

import { FavoritesProvider } from "@/context/FavoritesContext";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FavoritesProvider>{children}</FavoritesProvider>;
}
