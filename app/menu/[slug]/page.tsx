import { notFound } from "next/navigation";
import { getMenuItemBySlug, menuItems } from "@/lib/data/menu";
import ItemCustomizer from "@/components/ItemCustomizer";
import PlaceholderImage from "@/components/PlaceholderImage";
import Button from "@/components/Button";

export function generateStaticParams() {
  return menuItems.map((item) => ({ slug: item.slug }));
}

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getMenuItemBySlug(slug);

  if (!item) notFound();

  if (item.soldOut) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <PlaceholderImage
          label={item.name}
          src={`/images/menu/${item.slug}.jpg`}
          category={item.category}
          fit={item.category === "drinks" ? "contain" : "cover"}
          className="mx-auto h-56 w-full max-w-md rounded-2xl shadow-soft"
        />
        <h1 className="mt-8 font-display text-4xl font-black text-brown">
          {item.name}
        </h1>
        <p className="mt-4 font-display text-xl italic text-brown-light">
          {`Sold out of the ${item.name.toLowerCase()}. Tomorrow, I promise.`}
        </p>
        <Button href="/menu" className="mt-8">
          Back to menu
        </Button>
      </div>
    );
  }

  return <ItemCustomizer item={item} />;
}
