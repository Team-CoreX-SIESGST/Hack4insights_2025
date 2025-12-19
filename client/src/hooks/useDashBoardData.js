import { useState, useEffect, useMemo, useCallback } from "react";
import {
  cleanOrdersData,
  cleanOrderItemsData,
  cleanRefundsData,
  cleanProductsData,
  cleanSessionsData,
  cleanPageviewsData,
  aggregateRevenueByMonth,
  aggregateRevenueByYear,
  calculateTotalRevenue,
  calculateTotalRefunds,
  calculateRefundRate,
  calculateAOV,
  getRefundsByProduct,
  getOrdersByProduct,
  sortByDate,
} from "@/utils/dataCleaners";

// Import JSON data
import ordersRaw from "../../public/data/orders.json";
import orderItemsRaw from "../../public/data/order_items.json";
import refundsRaw from "../../public/data/order_item_refunds.json";
import productsRaw from "../../public/data/products.json";
import sessionsRaw from "../../public/data/website_sessions.json";
import pageviewsRaw from "../../public/data/website_pageviews.json";

// Pre-sort and clean static data once
const preSortedOrders = sortByDate(ordersRaw);
const preSortedOrderItems = sortByDate(orderItemsRaw);
const preSortedRefunds = sortByDate(refundsRaw);
const preSortedProducts = sortByDate(productsRaw);
const preSortedSessions = sortByDate(sessionsRaw);
const preSortedPageviews = sortByDate(pageviewsRaw);

const useDashboardData = (activeSection = "overview") => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataRange, setDataRange] = useState({ start: 0, end: 1000 });

  // Get total records for each dataset
  const totalRecords = useMemo(
    () => ({
      orders: preSortedOrders?.length || 0,
      sessions: preSortedSessions?.length || 0,
      orderItems: preSortedOrderItems?.length || 0,
      refunds: preSortedRefunds?.length || 0,
      products: preSortedProducts?.length || 0,
      pageviews: preSortedPageviews?.length || 0,
    }),
    []
  );

  // Determine which dataset to use for pagination based on active section
  const getActiveDatasetLength = useCallback(() => {
    switch (activeSection) {
      case "overview":
      case "revenue":
      case "refunds":
      case "products":
        return totalRecords.orders;
      case "traffic":
        return totalRecords.sessions;
      case "conversion":
        return Math.min(totalRecords.sessions, totalRecords.orders);
      case "ask_ai":
        return 0;
      default:
        return totalRecords.orders;
    }
  }, [activeSection, totalRecords]);

  // Generate range options based on active section
  const rangeOptions = useMemo(() => {
    const activeLength = getActiveDatasetLength();
    const ranges = [];
    const chunkSize = 1000;

    if (activeLength === 0) return [];

    for (let i = 0; i < activeLength; i += chunkSize) {
      const end = Math.min(i + chunkSize, activeLength);
      ranges.push({
        label: `${i} - ${end}`,
        value: { start: i, end },
        count: end - i,
      });
    }

    if (ranges.length === 0 && activeLength > 0) {
      ranges.push({
        label: `0 - ${activeLength}`,
        value: { start: 0, end: activeLength },
        count: activeLength,
      });
    }

    return ranges;
  }, [getActiveDatasetLength]);

  // Create lookup maps for efficient filtering
  const orderLookupMaps = useMemo(() => {
    // Create maps for quick lookups
    const orderIdToSessionId = new Map();
    const sessionIdToOrderIds = new Map();

    preSortedOrders.forEach((order) => {
      orderIdToSessionId.set(order.order_id, order.website_session_id);

      if (!sessionIdToOrderIds.has(order.website_session_id)) {
        sessionIdToOrderIds.set(order.website_session_id, new Set());
      }
      sessionIdToOrderIds.get(order.website_session_id).add(order.order_id);
    });

    return { orderIdToSessionId, sessionIdToOrderIds };
  }, []);

  // Clean and process data with optimization
  const processedData = useMemo(() => {
    try {
      console.time("Data processing");

      let orders, orderItems, refunds, products, sessions, pageviews;

      if (activeSection === "traffic") {
        // For traffic section, slice sessions
        const sessionsSlice = preSortedSessions.slice(
          dataRange.start,
          dataRange.end
        );

        // Get session IDs from sliced sessions
        const sessionIds = new Set(
          sessionsSlice.map((s) => s.website_session_id)
        );

        // Get orders for these sessions using the lookup map
        const orderIds = new Set();
        sessionIds.forEach((sessionId) => {
          const ordersForSession =
            orderLookupMaps.sessionIdToOrderIds.get(sessionId);
          if (ordersForSession) {
            ordersForSession.forEach((orderId) => orderIds.add(orderId));
          }
        });

        // Filter related data efficiently
        const ordersFiltered = preSortedOrders.filter((order) =>
          orderIds.has(order.order_id)
        );
        const orderItemsFiltered = preSortedOrderItems.filter((item) =>
          orderIds.has(item.order_id)
        );
        const refundsFiltered = preSortedRefunds.filter((refund) =>
          orderIds.has(refund.order_id)
        );
        const pageviewsFiltered = preSortedPageviews.filter((pv) =>
          sessionIds.has(pv.website_session_id)
        );

        orders = cleanOrdersData(ordersFiltered);
        orderItems = cleanOrderItemsData(orderItemsFiltered);
        refunds = cleanRefundsData(refundsFiltered);
        products = cleanProductsData(preSortedProducts);
        sessions = cleanSessionsData(sessionsSlice);
        pageviews = cleanPageviewsData(pageviewsFiltered);
      } else {
        // For other sections, slice orders
        const ordersSlice = preSortedOrders.slice(
          dataRange.start,
          dataRange.end
        );

        // Get order IDs and session IDs from sliced orders
        const orderIds = new Set(ordersSlice.map((o) => o.order_id));
        const sessionIds = new Set(
          ordersSlice.map((o) => o.website_session_id)
        );

        // Filter related data efficiently
        const orderItemsFiltered = preSortedOrderItems.filter((item) =>
          orderIds.has(item.order_id)
        );
        const refundsFiltered = preSortedRefunds.filter((refund) =>
          orderIds.has(refund.order_id)
        );
        const sessionsFiltered = preSortedSessions.filter((session) =>
          sessionIds.has(session.website_session_id)
        );
        const pageviewsFiltered = preSortedPageviews.filter((pv) =>
          sessionIds.has(pv.website_session_id)
        );

        orders = cleanOrdersData(ordersSlice);
        orderItems = cleanOrderItemsData(orderItemsFiltered);
        refunds = cleanRefundsData(refundsFiltered);
        products = cleanProductsData(preSortedProducts);
        sessions = cleanSessionsData(sessionsFiltered);
        pageviews = cleanPageviewsData(pageviewsFiltered);
      }

      console.timeEnd("Data processing");
      console.log("Data processed successfully:", {
        orders: orders.length,
        orderItems: orderItems.length,
        refunds: refunds.length,
        products: products.length,
        sessions: sessions.length,
        pageviews: pageviews.length,
      });

      return { orders, orderItems, refunds, products, sessions, pageviews };
    } catch (err) {
      console.error("Error processing data:", err);
      setError(err.message || "Failed to process data");
      return {
        orders: [],
        orderItems: [],
        refunds: [],
        products: [],
        sessions: [],
        pageviews: [],
      };
    }
  }, [dataRange, activeSection, orderLookupMaps]);

  const { orders, orderItems, refunds, products, sessions, pageviews } =
    processedData;

  // Calculate metrics
  const metrics = useMemo(() => {
    try {
      const totalRevenue = calculateTotalRevenue(orders);
      const totalRefunds = calculateTotalRefunds(refunds);
      const refundRate = calculateRefundRate(orders, refunds);
      const aov = calculateAOV(orders);

      return {
        totalOrders: orders.length,
        totalRevenue,
        totalRefunds,
        refundRate,
        aov,
        netRevenue: totalRevenue - totalRefunds,
        totalSessions: sessions.length,
        totalPageviews: pageviews.length,
        totalProducts: products.length,
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
        totalPageviews: 0,
        totalProducts: 0,
      };
    }
  }, [orders, refunds, sessions, pageviews, products.length]);

  // Aggregate data for charts - memoized separately
  const revenueByMonth = useMemo(() => {
    return aggregateRevenueByMonth(orders);
  }, [orders]);

  const revenueByYear = useMemo(() => {
    return aggregateRevenueByYear(orders);
  }, [orders]);

  const refundsByProduct = useMemo(() => {
    return getRefundsByProduct(refunds, orderItems, products);
  }, [refunds, orderItems, products]);

  const ordersByProduct = useMemo(() => {
    return getOrdersByProduct(orderItems, products);
  }, [orderItems, products]);

  // Handle section changes
  useEffect(() => {
    setIsLoading(true);
    // Use requestAnimationFrame to ensure UI updates smoothly
    requestAnimationFrame(() => {
      setDataRange({ start: 0, end: 1000 });
      setIsLoading(false);
    });
  }, [activeSection]);

  // Handle range changes
  const handleRangeChange = (start, end) => {
    setIsLoading(true);
    // Use requestAnimationFrame for smoother UI updates
    requestAnimationFrame(() => {
      setDataRange({ start, end });
      setIsLoading(false);
    });
  };

  // Get current range display text
  const getCurrentRangeDisplay = useCallback(() => {
    const activeLength = getActiveDatasetLength();
    const currentEnd = Math.min(dataRange.end, activeLength);

    switch (activeSection) {
      case "traffic":
        return {
          label: "sessions",
          current: `${dataRange.start + 1} - ${currentEnd}`,
          total: activeLength,
        };
      case "conversion":
        return {
          label: "data points",
          current: `${dataRange.start + 1} - ${currentEnd}`,
          total: activeLength,
        };
      default:
        return {
          label: "orders",
          current: `${dataRange.start + 1} - ${currentEnd}`,
          total: totalRecords.orders,
        };
    }
  }, [activeSection, dataRange, getActiveDatasetLength, totalRecords]);

  return {
    // Raw cleaned data
    orders,
    orderItems,
    refunds,
    products,
    sessions,
    pageviews,

    // Calculated metrics
    metrics,

    // Aggregated data for charts
    revenueByMonth,
    revenueByYear,
    refundsByProduct,
    ordersByProduct,

    // State
    isLoading,
    error,

    // Pagination controls
    dataRange,
    setDataRange: handleRangeChange,
    rangeOptions,
    totalRecords,
    getCurrentRangeDisplay,
  };
};

export default useDashboardData;
