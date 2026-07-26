import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/products';
import { ProductPage } from '@/components/marketing/product-page';

const SLUG = 'decreasing-term';

export function generateMetadata(): Metadata {
  const product = getProduct(SLUG);
  return {
    title: product?.name ?? 'Life insurance',
    description: product?.summary,
  };
}

export default function Page() {
  const product = getProduct(SLUG);
  if (!product) notFound();
  return <ProductPage product={product} />;
}
