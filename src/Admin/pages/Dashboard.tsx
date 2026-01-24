import { DollarSign, ShoppingCart, Package, Users } from "lucide-react";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import RecentOrders from "../components/RecentOrders";
import TopProducts from "../components/TopProducts";

const Dashboard = () => {
  return (
    <div>
      <Header title="Dashboard" subtitle="Welcome back, Admin" />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Revenue"
            value="$48,352"
            change="+12.5% from last month"
            changeType="positive"
            icon={DollarSign}
            iconBgColor="bg-success/10"
            iconColor="text-success"
          />
          <StatsCard
            title="Total Orders"
            value="1,284"
            change="+8.2% from last month"
            changeType="positive"
            icon={ShoppingCart}
            iconBgColor="bg-info/10"
            iconColor="text-info"
          />
          <StatsCard
            title="Active Products"
            value="432"
            subtitle="12 new this week"
            icon={Package}
            iconBgColor="bg-warning/10"
            iconColor="text-warning"
          />
          <StatsCard
            title="Total Customers"
            value="3,842"
            change="+5.8% from last month"
            changeType="positive"
            icon={Users}
            iconBgColor="bg-primary/10"
            iconColor="text-primary"
          />
        </div>

        {/* Orders and Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentOrders />
          </div>
          <div>
            <TopProducts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
