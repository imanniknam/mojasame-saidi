import ProductCard from "@/components/ProductCard";

export default function Home() {
  return (
    <div className="p-6 flex gap-4 flex-wrap justify-center">
      <ProductCard
        title="کفش ورزشی نایک Air Max"
        price={2490000}
        originalPrice={3200000}
        image="https://images.unsplash.com/photo-1542291026-7eec264c27ff"
        onAddToCart={() => alert("Added!")}
      />
    </div>
  );
}