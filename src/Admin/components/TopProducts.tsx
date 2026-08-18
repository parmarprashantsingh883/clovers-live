/** Best sellers computed server-side from real order lines. */
const TopProducts = ({ products = [] }: { products?: any[] }) => {
  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Top Products</h2>
        <p className="text-sm text-muted-foreground">Best selling items</p>
      </div>

      <div className="p-4 space-y-4">
        {products.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">No sales yet</p>
        )}
        {products.map((product) => (
          <div key={product._id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            {product.image ? (
              <img src={product.image} alt="" className="h-12 w-12 rounded-full object-cover border border-border" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-2xl">🛒</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground">{product.sold} sold</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">₹{(product.revenue || 0).toLocaleString("en-IN")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProducts;
