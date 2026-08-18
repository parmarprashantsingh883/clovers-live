import { useEffect, useState } from "react";
import { IndianRupee, ShoppingCart, Package, Users } from "lucide-react";
import { api } from "@/lib/api";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import RecentOrders from "../components/RecentOrders";
import TopProducts from "../components/TopProducts";

const inr = (n: number) => `₹${(n || 0).toLocaleString("en-IN")}`;

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get("/admin/stats").then((res) => setStats(res.data)).catch(console.error);
  }, []);

  return (
    <div>
      <Header title="Dashboard" subtitle="Welcome back, Admin" />

      <div className="p-6 space-y-6">
        {/* Stats Grid — live numbers from the database */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Revenue"
            value={stats ? inr(stats.revenue) : "—"}
            subtitle="excluding cancelled orders"
            icon={IndianRupee}
            iconBgColor="bg-success/10"
            iconColor="text-success"
          />
          <StatsCard
            title="Total Orders"
            value={stats ? String(stats.orders) : "—"}
            subtitle={stats ? `${stats.byStatus?.Processing || 0} processing` : ""}
            icon={ShoppingCart}
            iconBgColor="bg-info/10"
            iconColor="text-info"
          />
          <StatsCard
            title="Active Products"
            value={stats ? String(stats.products) : "—"}
            subtitle="in catalog"
            icon={Package}
            iconBgColor="bg-warning/10"
            iconColor="text-warning"
          />
          <StatsCard
            title="Total Customers"
            value={stats ? String(stats.customers) : "—"}
            subtitle="registered accounts"
            icon={Users}
            iconBgColor="bg-primary/10"
            iconColor="text-primary"
          />
        </div>

        {/* Orders and Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentOrders orders={stats?.recentOrders || []} />
          </div>
          <div>
            <TopProducts products={stats?.topProducts || []} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
