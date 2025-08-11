import EditProductPageClient from '../../../components/product-edit-page/EditProductPageClient'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const awaitedParams = await params;
  return <EditProductPageClient productId={awaitedParams.id} />
}

