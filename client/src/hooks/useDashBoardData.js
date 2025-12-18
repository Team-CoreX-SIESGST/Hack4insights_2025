import { useState, useEffect, useMemo } from "react";
import {
  cleanOrdersData,
  cleanOrderItemsData,
  cleanRefundsData,
  cleanProductsData,
  aggregateRevenueByMonth,
  aggregateRevenueByYear,
  calculateTotalRevenue,
  calculateTotalRefunds,
  calculateRefundRate,
  calculateAOV,
  getRefundsByProduct,
  getOrdersByProduct,
  cleanSessionsData,
  cleanPageviewsData,
  calculateSessionMetrics,
  calculateConversionFunnel,
  calculateChannelPerformance,
} from "@/utils/dataCleaners";

// Import JSON data
import ordersRaw from "../../public/data/orders.json";
import orderItemsRaw from "../../public/data/order_items.json";
import refundsRaw from "../../public/data/order_item_refunds.json";
import productsRaw from "../../public/data/products.json";
import sessionsRaw from "../../public/data/website_sessions.json";
import pageviewsRaw from "../../public/data/website_pageviews.json";

const useDashboardData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clean and process all data
  const processedData = useMemo(() => {
    try {
      const orders = cleanOrdersData(ordersRaw);
      const orderItems = cleanOrderItemsData(orderItemsRaw);
      const refunds = cleanRefundsData(refundsRaw);
      const products = cleanProductsData(productsRaw);
      const sessions = cleanSessionsData(sessionsRaw);
      const pageviews = cleanPageviewsData(pageviewsRaw);

      return { orders, orderItems, refunds, products, sessions, pageviews };
    } catch (err) {
      console.error("Error processing data:", err);
      setError("Failed to process data");
      return {
        orders: [],
        orderItems: [],
        refunds: [],
        products: [],
        sessions: [],
        pageviews: [],
      };
    }
  }, []);

  const { orders, orderItems, refunds, products, sessions, pageviews } =
    processedData;

  // Calculate all metrics
  const metrics = useMemo(() => {
    try {
      const totalRevenue = calculateTotalRevenue(orders);
      const totalRefunds = calculateTotalRefunds(refunds);
      const sessionMetrics = calculateSessionMetrics(sessions);
      const conversionMetrics = calculateConversionFunnel(
        sessions,
        pageviews,
        orders
      );

      return {
        // Revenue metrics
        totalOrders: orders.length,
        totalRevenue,
        totalRefunds,
        refundRate: calculateRefundRate(orders, refunds),
        aov: calculateAOV(orders),
        netRevenue: totalRevenue - totalRefunds,

        // Session metrics
        totalSessions: sessionMetrics.totalSessions,
        repeatSessions: sessionMetrics.repeatSessions,
        mobileSessions: sessionMetrics.mobileSessions,
        desktopSessions: sessionMetrics.desktopSessions,
        repeatSessionRate: sessionMetrics.repeatSessionRate,
        mobileSessionRate: sessionMetrics.mobileSessionRate,
        desktopSessionRate: sessionMetrics.desktopSessionRate,

        // Conversion metrics
        sessionToOrderRate: conversionMetrics.sessionToOrderRate,
        cartToOrderRate: conversionMetrics.cartToOrderRate,
        sessionsWithPageviews: conversionMetrics.sessionsWithPageviews,
        sessionsWithProductViews: conversionMetrics.sessionsWithProductViews,
        sessionsWithCartViews: conversionMetrics.sessionsWithCartViews,
        sessionsWithCheckout: conversionMetrics.sessionsWithCheckout,
      };
    } catch (err) {
      console.error("Error calculating metrics:", err);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        totalRefunds: 0,
        refundRate: 0,
        aov: 0,
        netRevenue: 0,
        totalSessions: 0,
        repeatSessions: 0,
        mobileSessions: 0,
        desktopSessions: 0,
        repeatSessionRate: 0,
        mobileSessionRate: 0,
        desktopSessionRate: 0,
        sessionToOrderRate: 0,
        cartToOrderRate: 0,
        sessionsWithPageviews: 0,
        sessionsWithProductViews: 0,
        sessionsWithCartViews: 0,
        sessionsWithCheckout: 0,
      };
    }
  }, [orders, refunds, sessions, pageviews]);

  // Aggregate data for charts
  const revenueByMonth = useMemo(
    () => aggregateRevenueByMonth(orders),
    [orders]
  );
  const revenueByYear = useMemo(() => aggregateRevenueByYear(orders), [orders]);
  const refundsByProduct = useMemo(
    () => getRefundsByProduct(refunds, orderItems, products),
    [refunds, orderItems, products]
  );
  const ordersByProduct = useMemo(
    () => getOrdersByProduct(orderItems, products),
    [orderItems, products]
  );

  // Calculate channel performance data
  const channelPerformance = useMemo(
    () => calculateChannelPerformance(sessions, orders),
    [sessions, orders]
  );

  // Calculate sessions trend data
  const sessionsTrendData = useMemo(() => {
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

    return Object.keys(sessionsByDate)
      .sort()
      .map((date) => ({
        date,
        sessions: sessionsByDate[date].sessions,
        orders: sessionsByDate[date].orders,
      }));
  }, [sessions, orders]);

  // Calculate bounce rate
  const bounceRate = useMemo(() => {
    const bounceSessions = sessions.filter((session) => {
      const sessionPageviews = pageviews.filter(
        (p) => p.website_session_id === session.website_session_id
      );
      return sessionPageviews.length === 1;
    }).length;

    return sessions.length > 0 ? (bounceSessions / sessions.length) * 100 : 0;
  }, [sessions, pageviews]);

  // Calculate average session duration
  const avgSessionDuration = useMemo(() => {
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
  }, [sessions, pageviews]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (orders.length === 0 && sessions.length === 0) {
        setError("Failed to load data");
      }
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [orders.length, sessions.length]);

  return {
    // Raw data
    orders,
    orderItems,
    refunds,
    products,
    sessions,
    pageviews,

    // Metrics
    metrics,

    // Chart data
    revenueByMonth,
    revenueByYear,
    refundsByProduct,
    ordersByProduct,
    channelPerformance,
    sessionsTrendData,

    // Additional calculated metrics
    bounceRate,
    avgSessionDuration,
    totalPageviews: pageviews.length,

    // State
    isLoading,
    error,
  };
};

export default useDashboardData;
