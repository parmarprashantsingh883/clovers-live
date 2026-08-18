import { useEffect, useState } from "react";
import { IndianRupee, ShoppingCart, Users, Package } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { api } from "@/lib/api";
import Header from "../components/Header";

const inr = (n: number) => `₹${(n || 0).toLocaleString("en-IN")}`;
const STATUS_ORDER = ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const Analytics = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get("/admin/stats").then((res) => setStats(res.data)).catch(console.error);
  }, []);

  const metrics = [
    { label: "Revenue", value: stats ? inr(stats.revenue) : "—", sub: "excl. cancelled", icon: IndianRupee },
    { label: "Orders", value: stats ? String(stats.orders) : "—", sub: "all time", icon: ShoppingCart },
    { label: "Customers", value: stats ? String(stats.customers) : "—", sub: "registered", icon: Users },
    {
      label: "Products Sold",
      value: stats ? String((stats.topProducts || []).reduce((s: number, p: any) => s + (p.sold || 0), 0)) : "—",
      sub: "top sellers", icon: Package,
    },
  ];

  const chartData = STATUS_ORDER.map((s) => ({ status: s, orders: stats?.byStatus?.[s] || 0 }));

  return (
    <div>
      <Header title="Analytics" subtitle="Track your business performance" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <div key={metric.label} className="bg-card rounded-xl border border-border p-6">
              <metric.icon className="h-5 w-5 text-muted-foreground" />
              <p className="text-2xl font-bold text-foreground mt-4">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.label} · {metric.sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">Orders by status</h3>
          <p className="text-sm text-muted-foreground mb-6">Live distribution across the order lifecycle</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip cursor={{ fill: "hsl(var(--secondary))" }} />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
