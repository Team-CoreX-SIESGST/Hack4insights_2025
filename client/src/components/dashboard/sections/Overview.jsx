import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  RotateCcw,
  Wallet,
  Package,
} from "lucide-react";
import KpiCard from "../KpiCard";
import RevenueChart from "../charts/RevenueChart";
import YearlyComparisonChart from "../charts/YearlyComparisionChart";
import {
  formatCurrency,
  formatPercentage,
  formatNumber,
} from "@/utils/dataCleaners";
import RangeSelector from "../RangeSelector";

const OverviewSection = ({
  metrics,
  revenueByMonth,
  revenueByYear,
  dataRange,
  setDataRange,
  rangeOptions,
  totalRecords,
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header with Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Your business performance at a glance
          </p>
        </div>
        <RangeSelector
          dataRange={dataRange}
          setDataRange={setDataRange}
          rangeOptions={rangeOptions}
          totalRecords={totalRecords}
        />
      </div>

      {/* Data Range Info */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Currently viewing records{" "}
            <span className="font-semibold text-foreground">
              {dataRange.start + 1} -{" "}
              {Math.min(dataRange.end, totalRecords?.orders || 0)}
            </span>{" "}
            of {totalRecords?.orders || 0} total orders
          </div>
          <div className="text-xs text-muted-foreground">
            Data is sorted by date (oldest to newest)
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          change={12.5}
          changeLabel="vs last period"
          trend="up"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KpiCard
          title="Net Revenue"
          value={formatCurrency(metrics.netRevenue)}
          change={10.2}
          changeLabel="vs last period"
          trend="up"
          icon={<Wallet className="w-4 h-4" />}
        />
        <KpiCard
          title="Total Orders"
          value={formatNumber(metrics.totalOrders)}
          change={8.3}
          changeLabel="vs last period"
          trend="up"
          icon={<ShoppingCart className="w-4 h-4" />}
        />
        <KpiCard
          title="Average Order Value"
          value={formatCurrency(metrics.aov)}
          change={2.1}
          changeLabel="vs last period"
          trend="up"
          icon={<Package className="w-4 h-4" />}
        />
        <KpiCard
          title="Refund Rate"
          value={formatPercentage(metrics.refundRate)}
          change={-0.5}
          changeLabel="vs last period"
          trend="up"
          icon={<RotateCcw className="w-4 h-4" />}
        />
        <KpiCard
          title="Total Refunds"
          value={formatCurrency(metrics.totalRefunds)}
          change={-2.3}
          changeLabel="vs last period"
          trend="down"
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueByMonth} />
        <YearlyComparisonChart data={revenueByYear} />
      </div>
    </div>
  );
};

export default OverviewSection;
