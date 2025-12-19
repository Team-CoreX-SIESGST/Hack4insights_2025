import { useState, useEffect, useMemo } from "react";
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

const useDashboardData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataRange, setDataRange] = useState({ start: 0, end: 500 });
  const [totalRecords, setTotalRecords] = useState({
    orders: ordersRaw.length,
    sessions: sessionsRaw.length,
    orderItems: orderItemsRaw.length,
    refunds: refundsRaw.length,
    products: productsRaw.length,
    pageviews: pageviewsRaw.length,
  });

  // Generate range options for dropdown
  const rangeOptions = useMemo(() => {
    const ranges = [];
    const chunkSize = 500;
    const maxOrders = ordersRaw.length;

    for (let i = 0; i < maxOrders; i += chunkSize) {
      const end = Math.min(i + chunkSize, maxOrders);
      ranges.push({
        label: `${i} - ${end}`,
        value: { start: i, end },
      });
    }
    return ranges;
  }, []);

  // Clean and process data with proper error handling and range limiting
  const processedData = useMemo(() => {
    try {
      console.log("Processing data...");
      console.log("Current range:", dataRange);

      // Sort raw data by created_at to ensure consistent ordering
      const sortByDate = (a, b) =>
        new Date(a.created_at) - new Date(b.created_at);

      // Apply range to each dataset
      const ordersSliced = [...ordersRaw]
        .sort(sortByDate)
        .slice(dataRange.start, dataRange.end);
      const orderItemsSliced = [...orderItemsRaw]
        .sort(sortByDate)
        .slice(dataRange.start, dataRange.end);
      const refundsSliced = [...refundsRaw]
        .sort(sortByDate)
        .slice(dataRange.start, dataRange.end);
      const sessionsSliced = [...sessionsRaw]
        .sort(sortByDate)
        .slice(dataRange.start, dataRange.end);
      const pageviewsSliced = [...pageviewsRaw]
        .sort(sortByDate)
        .slice(dataRange.start, dataRange.end);

      // Products don't need slicing as they're a small lookup table
      const productsSliced = [...productsRaw];

      const orders = cleanOrdersData(ordersSliced);
      const orderItems = cleanOrderItemsData(orderItemsSliced);
      const refunds = cleanRefundsData(refundsSliced);
      const products = cleanProductsData(productsSliced);
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
  }, [dataRange]);

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
    }, 500);

    return () => clearTimeout(timer);
  }, [orders.length, sessions.length, error, dataRange]);

  const handleRangeChange = (start, end) => {
    setIsLoading(true);
    setDataRange({ start, end });
  };

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
  };
};

export default useDashboardData;
