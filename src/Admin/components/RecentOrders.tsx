const orders = [
  {
    id: "#ORD-7352",
    customer: "Sarah Johnson",
    items: 8,
    total: "$124.99",
    status: "Delivered",
    date: "Today, 2:30 PM",
  },
  {
    id: "#ORD-7351",
    customer: "Michael Chen",
    items: 3,
    total: "$45.50",
    status: "Processing",
    date: "Today, 1:15 PM",
  },
  {
    id: "#ORD-7350",
    customer: "Emily Davis",
    items: 12,
    total: "$198.00",
    status: "Shipped",
    date: "Today, 11:45 AM",
  },
  {
    id: "#ORD-7349",
    customer: "James Wilson",
    items: 5,
    total: "$87.25",
    status: "Pending",
    date: "Yesterday, 6:20 PM",
  },
];

const statusColors: Record<string, string> = {
  Delivered: "bg-success/10 text-success border-success/20",
  Processing: "bg-info/10 text-info border-info/20",
  Shipped: "bg-warning/10 text-warning border-warning/20",
  Pending: "bg-destructive/10 text-destructive border-destructive/20",
};

const RecentOrders = () => {
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
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                Order ID
              </th>
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                Customer
              </th>
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                Items
              </th>
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                Total
              </th>
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
              >
                <td className="py-4 px-6 text-sm font-medium text-foreground">
                  {order.id}
                </td>
                <td className="py-4 px-6 text-sm text-foreground">
                  {order.customer}
                </td>
                <td className="py-4 px-6 text-sm text-foreground">
                  {order.items}
                </td>
                <td className="py-4 px-6 text-sm font-medium text-foreground">
                  {order.total}
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-muted-foreground">
                  {order.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;
