const statusColors: Record<string, string> = {
  Delivered: "bg-success/10 text-success border-success/20",
  Confirmed: "bg-info/10 text-info border-info/20",
  Processing: "bg-info/10 text-info border-info/20",
  Shipped: "bg-warning/10 text-warning border-warning/20",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

/** Latest orders straight from the database (passed by the Dashboard). */
const RecentOrders = ({ orders = [] }: { orders?: any[] }) => {
  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
        <p className="text-sm text-muted-foreground">Latest customer orders</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Order ID", "Customer", "Items", "Total", "Status", "Date"].map((h) => (
                <th key={h} className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={6} className="py-8 px-6 text-center text-sm text-muted-foreground">No orders yet</td></tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                <td className="py-4 px-6 text-sm font-medium text-foreground">{order.id}</td>
                <td className="py-4 px-6 text-sm text-foreground">{order.address?.name || "—"}</td>
                <td className="py-4 px-6 text-sm text-foreground">
                  {(order.items || []).reduce((s: number, i: any) => s + (i.qty || 0), 0)}
                </td>
                <td className="py-4 px-6 text-sm font-medium text-foreground">
                  ₹{(order.total || 0).toLocaleString("en-IN")}
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[order.status] || "bg-secondary text-foreground border-border"}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-muted-foreground">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;
