
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import Header from "../components/Header";

const metrics = [
  { label: "Revenue", value: "$48,352", change: "+12.5%", trend: "up", icon: DollarSign },
  { label: "Orders", value: "1,284", change: "+8.2%", trend: "up", icon: ShoppingCart },
  { label: "Customers", value: "3,842", change: "+5.8%", trend: "up", icon: Users },
  { label: "Products Sold", value: "8,421", change: "-2.1%", trend: "down", icon: Package },
];

const Analytics = () => {
  return (
    <div>
      <Header title="Analytics" subtitle="Track your business performance" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between">
                <metric.icon className="h-5 w-5 text-muted-foreground" />
                <div className={`flex items-center gap-1 text-sm ${metric.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                  {metric.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {metric.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground mt-4">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Sales Overview</h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <p>Chart placeholder - Connect to data source</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
