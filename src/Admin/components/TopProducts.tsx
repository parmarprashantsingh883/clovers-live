const products = [
  {
    name: "Fresh Organic Vegetables Mix",
    category: "Fresh Produce",
    revenue: "$2,103.66",
    sold: "234 sold",
    emoji: "🥗",
  },
  {
    name: "Premium Dairy Selection",
    category: "Dairy",
    revenue: "$3,022.11",
    sold: "189 sold",
    emoji: "🧀",
  },
  {
    name: "Premium Organic Salad Bowl",
    category: "Fresh Produce",
    revenue: "$1,090.44",
    sold: "156 sold",
    emoji: "🥬",
  },
  {
    name: "Fresh Premium Meat Cuts",
    category: "Meat & Seafood",
    revenue: "$3,548.58",
    sold: "142 sold",
    emoji: "🥩",
  },
];

const TopProducts = () => {
  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Top Products</h2>
        <p className="text-sm text-muted-foreground">
          Best selling items this month
        </p>
      </div>

      <div className="p-4 space-y-4">
        {products.map((product, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-2xl">
              {product.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {product.name}
              </p>
              <p className="text-xs text-muted-foreground">{product.category}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                {product.revenue}
              </p>
              <p className="text-xs text-muted-foreground">{product.sold}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProducts;
