import { Users, Eye, Activity, Clock, Globe, TrendingUp } from "lucide-react";
import KpiCard from "../KpiCard";
import ChannelPieChart from "../charts/ChannelPieChart";
import SessionTrendChart from "../charts/SessionTrendChart";
import { formatNumber, formatPercentage } from "@/utils/dataCleaners";

const TrafficSection = ({ sessions, pageviews, orders }) => {
  // Calculate advanced metrics
  const totalSessions = sessions.length;
  const totalPageviews = pageviews.length;

  // Calculate bounce rate (sessions with only 1 pageview)
  const bounceSessions = sessions.filter((session) => {
    const sessionPageviews = pageviews.filter(
      (p) => p.website_session_id === session.website_session_id
    );
    return sessionPageviews.length === 1;
  }).length;
  const bounceRate = (bounceSessions / totalSessions) * 100;

  // Calculate session duration (requires pageview timestamps)
  const avgSessionDuration = calculateAvgSessionDuration(sessions, pageviews);

  // Calculate conversion rate
  const sessionToOrderRate = (orders.length / totalSessions) * 100;

  // Group by channel
  const channelData = sessions.reduce((acc, session) => {
    const source = session.utm_source || "direct";
    if (!acc[source]) acc[source] = { sessions: 0, orders: 0, revenue: 0 };
    acc[source].sessions++;

    // Find orders for this session
    const sessionOrders = orders.filter(
      (o) => o.website_session_id === session.website_session_id
    );
    acc[source].orders += sessionOrders.length;
    acc[source].revenue += sessionOrders.reduce(
      (sum, o) => sum + parseFloat(o.price_usd || 0),
      0
    );
    return acc;
  }, {});

  const channelArray = Object.keys(channelData).map((source) => ({
    source,
    ...channelData[source],
    conversionRate:
      (channelData[source].orders / channelData[source].sessions) * 100,
  }));

  // Sessions over time
  const sessionsByDate = sessions.reduce((acc, session) => {
    const date = session.created_at_date;
    if (!acc[date]) acc[date] = { sessions: 0, orders: 0 };
    acc[date].sessions++;

    const sessionOrders = orders.filter(
      (o) => o.website_session_id === session.website_session_id
    );
    acc[date].orders += sessionOrders.length;
    return acc;
  }, {});

  const sessionsTrendData = Object.keys(sessionsByDate)
    .sort()
    .map((date) => ({
      date,
      sessions: sessionsByDate[date].sessions,
      orders: sessionsByDate[date].orders,
    }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-foreground">
          Traffic & Engagement
        </h1>
        <p className="text-muted-foreground mt-1">
          Website traffic and user behavior analysis
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Sessions"
          value={formatNumber(totalSessions)}
          change={8.5}
          changeLabel="vs last period"
          trend="up"
          icon={<Users className="w-4 h-4" />}
        />
        <KpiCard
          title="Total Pageviews"
          value={formatNumber(totalPageviews)}
          change={12.3}
          changeLabel="vs last period"
          trend="up"
          icon={<Eye className="w-4 h-4" />}
        />
        <KpiCard
          title="Bounce Rate"
          value={formatPercentage(bounceRate)}
          change={-1.2}
          changeLabel="vs last period"
          trend="down"
          icon={<Activity className="w-4 h-4" />}
        />
        <KpiCard
          title="Avg Session Duration"
          value={`${Math.floor(avgSessionDuration / 60)}m ${Math.floor(
            avgSessionDuration % 60
          )}s`}
          change={5.7}
          changeLabel="vs last period"
          trend="up"
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      {/* Advanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Session to Order Rate
            </h3>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold font-display text-foreground">
              {formatPercentage(sessionToOrderRate)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {formatNumber(orders.length)} orders from{" "}
              {formatNumber(totalSessions)} sessions
            </p>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-success/10">
              <Users className="w-5 h-5 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Repeat Sessions
            </h3>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold font-display text-foreground">
              {formatPercentage(
                (sessions.filter((s) => s.is_repeat_session === "1").length /
                  totalSessions) *
                  100
              )}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {sessions.filter((s) => s.is_repeat_session === "1").length}{" "}
              repeat sessions
            </p>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Globe className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Mobile vs Desktop
            </h3>
          </div>
          <div className="flex justify-between">
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">
                {formatPercentage(
                  (sessions.filter((s) => s.device_type === "mobile").length /
                    totalSessions) *
                    100
                )}
              </p>
              <p className="text-sm text-muted-foreground">Mobile</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">
                {formatPercentage(
                  (sessions.filter((s) => s.device_type === "desktop").length /
                    totalSessions) *
                    100
                )}
              </p>
              <p className="text-sm text-muted-foreground">Desktop</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SessionTrendChart data={sessionsTrendData} />
        <ChannelPieChart data={channelArray} />
      </div>

      {/* Channel Performance Table */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold font-display text-foreground mb-6">
          Marketing Channel Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Channel
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Sessions
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Orders
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Conversion Rate
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {channelArray
                .sort((a, b) => b.conversionRate - a.conversionRate)
                .map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-foreground capitalize">
                      {item.source}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground text-right">
                      {formatNumber(item.sessions)}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground text-right">
                      {formatNumber(item.orders)}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground text-right">
                      {formatPercentage(item.conversionRate)}
                    </td>
                    <td className="py-3 px-4 text-sm text-success text-right">
                      ${item.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate average session duration
const calculateAvgSessionDuration = (sessions, pageviews) => {
  let totalDuration = 0;
  let sessionsWithMultipleViews = 0;

  sessions.forEach((session) => {
    const sessionPageviews = pageviews
      .filter((p) => p.website_session_id === session.website_session_id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    if (sessionPageviews.length > 1) {
      const firstView = new Date(sessionPageviews[0].created_at);
      const lastView = new Date(
        sessionPageviews[sessionPageviews.length - 1].created_at
      );
      totalDuration += (lastView - firstView) / 1000; // Convert to seconds
      sessionsWithMultipleViews++;
    }
  });

  return sessionsWithMultipleViews > 0
    ? totalDuration / sessionsWithMultipleViews
    : 0;
};

export default TrafficSection;
