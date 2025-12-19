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
} from "@/utils/dataCleaners";

// Import JSON data
import ordersRaw from "../../public/data/orders.json";
import orderItemsRaw from "../../public/data/order_items.json";
import refundsRaw from "../../public/data/order_item_refunds.json";
import productsRaw from "../../public/data/products.json";
import sessionsRaw from "../../public/data/website_sessions.json";
import pageviewsRaw from "../../public/data/website_pageviews.json";

const useDashboardData = (activeSection = "overview") => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataRange, setDataRange] = useState({ start: 0, end: 1000 });

  // Get total records for each dataset
  const totalRecords = useMemo(
    () => ({
      orders: ordersRaw?.length || 0,
      sessions: sessionsRaw?.length || 0,
      orderItems: orderItemsRaw?.length || 0,
      refunds: refundsRaw?.length || 0,
      products: productsRaw?.length || 0,
      pageviews: pageviewsRaw?.length || 0,
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
        return totalRecords.orders; // Order-based sections
      case "traffic":
        return totalRecords.sessions; // Session-based section
      case "conversion":
        return Math.min(totalRecords.sessions, totalRecords.orders); // Mixed, use smaller one
      case "ask_ai":
        return 0; // AI section doesn't need pagination
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

    // If we have less than chunkSize data, still add one range
    if (ranges.length === 0 && activeLength > 0) {
      ranges.push({
        label: `0 - ${activeLength}`,
        value: { start: 0, end: activeLength },
        count: activeLength,
      });
    }

    return ranges;
  }, [getActiveDatasetLength]);

  // Clean and process data with proper error handling and range limiting
  const processedData = useMemo(() => {
    try {
      console.log("Processing data for section:", activeSection);
      console.log("Current range:", dataRange);

      // Helper function to sort by date
      const sortByDate = (a, b) => {
        try {
          return new Date(a.created_at) - new Date(b.created_at);
        } catch (e) {
          return 0;
        }
      };

      // Slice orders based on range
      const ordersSliced = [...ordersRaw]
        .sort(sortByDate)
        .slice(dataRange.start, dataRange.end);

      // Get order IDs from sliced orders
      const slicedOrderIds = new Set(ordersSliced.map((o) => o.order_id));
      const slicedSessionIds = new Set(
        ordersSliced.map((o) => o.website_session_id)
      );

      // For traffic section, slice sessions instead
      let sessionsSliced;
      if (activeSection === "traffic") {
        sessionsSliced = [...sessionsRaw]
          .sort(sortByDate)
          .slice(dataRange.start, dataRange.end);

        const sessionIds = new Set(
          sessionsSliced.map((s) => s.website_session_id)
        );

        // Filter related data based on session IDs
        const ordersSlicedBySession = [...ordersRaw]
          .sort(sortByDate)
          .filter((order) => sessionIds.has(order.website_session_id));

        const orderIds = new Set(ordersSlicedBySession.map((o) => o.order_id));

        const orderItemsSliced = [...orderItemsRaw]
          .sort(sortByDate)
          .filter((item) => orderIds.has(item.order_id));

        const refundsSliced = [...refundsRaw]
          .sort(sortByDate)
          .filter((refund) => orderIds.has(refund.order_id));

        const pageviewsSliced = [...pageviewsRaw]
          .sort(sortByDate)
          .filter((pv) => sessionIds.has(pv.website_session_id));

        const orders = cleanOrdersData(ordersSlicedBySession);
        const orderItems = cleanOrderItemsData(orderItemsSliced);
        const refunds = cleanRefundsData(refundsSliced);
        const products = cleanProductsData(productsRaw);
        const sessions = cleanSessionsData(sessionsSliced);
        const pageviews = cleanPageviewsData(pageviewsSliced);

        return { orders, orderItems, refunds, products, sessions, pageviews };
      } else {
        // For other sections, filter related data based on order IDs
        const orderItemsSliced = [...orderItemsRaw]
          .sort(sortByDate)
          .filter((item) => slicedOrderIds.has(item.order_id));

        const refundsSliced = [...refundsRaw]
          .sort(sortByDate)
          .filter((refund) => slicedOrderIds.has(refund.order_id));

        const sessionsSliced = [...sessionsRaw]
          .sort(sortByDate)
          .filter((session) =>
            slicedSessionIds.has(session.website_session_id)
          );

        const pageviewsSliced = [...pageviewsRaw]
          .sort(sortByDate)
          .filter((pv) => slicedSessionIds.has(pv.website_session_id));

        const orders = cleanOrdersData(ordersSliced);
        const orderItems = cleanOrderItemsData(orderItemsSliced);
        const refunds = cleanRefundsData(refundsSliced);
        const products = cleanProductsData(productsRaw);
        const sessions = cleanSessionsData(sessionsSliced);
        const pageviews = cleanPageviewsData(pageviewsSliced);

        console.log("Data processed successfully:", {
          orders: orders.length,
          orderItems: orderItems.length,
          refunds: refunds.length,
          products: products.length,
          sessions: sessions.length,
          pageviews: pageviews.length,
        });

        return { orders, orderItems, refunds, products, sessions, pageviews };
      }
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
  }, [dataRange, activeSection]);

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
  }, [orders, refunds, sessions, pageviews]);

  // Aggregate data for charts
  const revenueByMonth = useMemo(() => {
    try {
      return aggregateRevenueByMonth(orders);
    } catch (err) {
      console.error("Error aggregating revenue by month:", err);
      return [];
    }
  }, [orders]);

  const revenueByYear = useMemo(() => {
    try {
      return aggregateRevenueByYear(orders);
    } catch (err) {
      console.error("Error aggregating revenue by year:", err);
      return [];
    }
  }, [orders]);

  const refundsByProduct = useMemo(() => {
    try {
      return getRefundsByProduct(refunds, orderItems, products);
    } catch (err) {
      console.error("Error calculating refunds by product:", err);
      return [];
    }
  }, [refunds, orderItems, products]);

  const ordersByProduct = useMemo(() => {
    try {
      return getOrdersByProduct(orderItems, products);
    } catch (err) {
      console.error("Error calculating orders by product:", err);
      return [];
    }
  }, [orderItems, products]);

  useEffect(() => {
    // Reset to first page when section changes
    setDataRange({ start: 0, end: 1000 });
    setIsLoading(true);
  }, [activeSection]);

  useEffect(() => {
    // Simulate loading state and validate data
    const timer = setTimeout(() => {
      if (orders.length === 0 && ordersRaw.length > 0) {
        setError("Failed to load order data");
      } else if (sessions.length === 0 && sessionsRaw.length > 0) {
        setError("Failed to load session data");
      } else if (error) {
        // Error was already set during processing
      } else {
        setError(null);
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [orders.length, sessions.length, error]);

  const handleRangeChange = (start, end) => {
    setIsLoading(true);
    setDataRange({ start, end });
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
