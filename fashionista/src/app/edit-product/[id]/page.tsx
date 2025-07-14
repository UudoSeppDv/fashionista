import EditProductPageClient from '../../../components/EditProductPageClient'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const awaitedParams = await params;
  return <EditProductPageClient productId={awaitedParams.id} />
}

