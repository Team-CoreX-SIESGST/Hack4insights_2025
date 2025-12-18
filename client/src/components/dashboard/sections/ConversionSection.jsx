import {
  Target,
  Filter,
  TrendingUp,
  BarChart3,
  ArrowRight,
  Users,
} from "lucide-react";
import KpiCard from "../KpiCard";
import FunnelChart from "../charts/FunnelChart";
import ConversionTrendChart from "../charts/ConversionTrendChart";
import { formatNumber, formatPercentage } from "@/utils/dataCleaners";

const ConversionSection = ({ sessions, pageviews, orders }) => {
  // Funnel data calculation
  const totalSessions = sessions.length;

  // Get sessions with at least 1 pageview
  const sessionsWithPageviews = sessions.filter((session) =>
    pageviews.some((p) => p.website_session_id === session.website_session_id)
  ).length;

  // Get sessions that reached product pages
  const sessionsWithProductViews = sessions.filter((session) =>
    pageviews.some(
      (p) =>
        p.website_session_id === session.website_session_id &&
        p.pageview_url.includes("/products")
    )
  ).length;

  // Get sessions with cart activity
  const sessionsWithCartViews = sessions.filter((session) =>
    pageviews.some(
      (p) =>
        p.website_session_id === session.website_session_id &&
        p.pageview_url.includes("/cart")
    )
  ).length;

  const sessionsWithCheckout = sessions.filter((session) =>
    pageviews.some(
      (p) =>
        p.website_session_id === session.website_session_id &&
        p.pageview_url.includes("/checkout")
    )
  ).length;

  const totalOrders = orders.length;

  const funnelData = [
    { stage: "Sessions", count: totalSessions, percentage: 100 },
    {
      stage: "Viewed Page",
      count: sessionsWithPageviews,
      percentage: (sessionsWithPageviews / totalSessions) * 100,
    },
    {
      stage: "Product View",
      count: sessionsWithProductViews,
      percentage: (sessionsWithProductViews / totalSessions) * 100,
    },
    {
      stage: "Cart View",
      count: sessionsWithCartViews,
      percentage: (sessionsWithCartViews / totalSessions) * 100,
    },
    {
      stage: "Checkout",
      count: sessionsWithCheckout,
      percentage: (sessionsWithCheckout / totalSessions) * 100,
    },
    {
      stage: "Order",
      count: totalOrders,
      percentage: (totalOrders / totalSessions) * 100,
    },
  ];

  // Calculate conversion rates
  const sessionToCartRate = (sessionsWithCartViews / totalSessions) * 100;
  const cartToCheckoutRate =
    sessionsWithCartViews > 0
      ? (sessionsWithCheckout / sessionsWithCartViews) * 100
      : 0;
  const checkoutToOrderRate =
    sessionsWithCheckout > 0 ? (totalOrders / sessionsWithCheckout) * 100 : 0;
  const overallCVR = (totalOrders / totalSessions) * 100;

  // Device type conversion rates
  const deviceConversionRates = {
    mobile: calculateDeviceConversion("mobile", sessions, orders),
    desktop: calculateDeviceConversion("desktop", sessions, orders),
  };

  // Channel conversion rates
  const channelConversionRates = calculateChannelConversionRates(
    sessions,
    orders
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-foreground">
          Conversion Analysis
        </h1>
        <p className="text-muted-foreground mt-1">
          User journey and conversion funnel analysis
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Overall CVR"
          value={formatPercentage(overallCVR)}
          change={2.3}
          changeLabel="vs last period"
          trend="up"
          icon={<Target className="w-4 h-4" />}
        />
        <KpiCard
          title="Session to Cart"
          value={formatPercentage(sessionToCartRate)}
          change={1.8}
          changeLabel="vs last period"
          trend="up"
          icon={<Filter className="w-4 h-4" />}
        />
        <KpiCard
          title="Cart to Checkout"
          value={formatPercentage(cartToCheckoutRate)}
          change={-0.5}
          changeLabel="vs last period"
          trend="down"
          icon={<ArrowRight className="w-4 h-4" />}
        />
        <KpiCard
          title="Checkout to Order"
          value={formatPercentage(checkoutToOrderRate)}
          change={3.2}
          changeLabel="vs last period"
          trend="up"
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      {/* Main Funnel Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold font-display text-foreground">
            Conversion Funnel
          </h3>
          <p className="text-sm text-muted-foreground">
            Total Sessions: {formatNumber(totalSessions)}
          </p>
        </div>
        <FunnelChart data={funnelData} />
      </div>

      {/* Device & Channel Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Performance */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold font-display text-foreground mb-6">
            Device Performance
          </h3>
          <div className="space-y-4">
            {Object.entries(deviceConversionRates).map(([device, data]) => (
              <div
                key={device}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      device === "mobile"
                        ? "bg-blue-500/10"
                        : "bg-purple-500/10"
                    }`}
                  >
                    <BarChart3
                      className={`w-4 h-4 ${
                        device === "mobile"
                          ? "text-blue-500"
                          : "text-purple-500"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground capitalize">
                      {device}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(data.sessions)} sessions,{" "}
                      {formatNumber(data.orders)} orders
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">
                    {formatPercentage(data.conversionRate)}
                  </p>
                  <p
                    className={`text-xs ${
                      data.change >= 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {data.change >= 0 ? "+" : ""}
                    {data.change.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Converting Channels */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold font-display text-foreground mb-6">
            Top Converting Channels
          </h3>
          <div className="space-y-4">
            {channelConversionRates
              .sort((a, b) => b.conversionRate - a.conversionRate)
              .slice(0, 5)
              .map((channel, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground capitalize">
                        {channel.channel}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Campaign: {channel.campaign}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">
                      {formatPercentage(channel.conversionRate)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(channel.orders)} /{" "}
                      {formatNumber(channel.sessions)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Conversion Trends */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold font-display text-foreground mb-6">
          Conversion Trends Over Time
        </h3>
        <ConversionTrendChart sessions={sessions} orders={orders} />
      </div>
    </div>
  );
};

// Helper functions
const calculateDeviceConversion = (deviceType, sessions, orders) => {
  const deviceSessions = sessions.filter((s) => s.device_type === deviceType);
  const deviceOrders = orders.filter((order) => {
    const session = sessions.find(
      (s) => s.website_session_id === order.website_session_id
    );
    return session?.device_type === deviceType;
  });

  return {
    sessions: deviceSessions.length,
    orders: deviceOrders.length,
    conversionRate:
      deviceSessions.length > 0
        ? (deviceOrders.length / deviceSessions.length) * 100
        : 0,
    change: 2.5, // This would come from comparison data
  };
};

const calculateChannelConversionRates = (sessions, orders) => {
  const channelMap = {};

  sessions.forEach((session) => {
    const key = `${session.utm_source || "direct"}|${
      session.utm_campaign || "none"
    }`;
    if (!channelMap[key]) {
      channelMap[key] = {
        channel: session.utm_source || "direct",
        campaign: session.utm_campaign || "none",
        sessions: 0,
        orders: 0,
      };
    }
    channelMap[key].sessions++;
  });

  orders.forEach((order) => {
    const session = sessions.find(
      (s) => s.website_session_id === order.website_session_id
    );
    if (session) {
      const key = `${session.utm_source || "direct"}|${
        session.utm_campaign || "none"
      }`;
      if (channelMap[key]) {
        channelMap[key].orders++;
      }
    }
  });

  return Object.values(channelMap).map((channel) => ({
    ...channel,
    conversionRate:
      channel.sessions > 0 ? (channel.orders / channel.sessions) * 100 : 0,
  }));
};

export default ConversionSection;
