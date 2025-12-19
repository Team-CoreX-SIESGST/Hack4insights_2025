"use client";

import { useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import OverviewSection from "../../components/dashboard/sections/Overview";
import RevenueSection from "../../components/dashboard/sections/Revenue";
import RefundSection from "../../components/dashboard/sections/Refund";
import ProductsSection from "../../components/dashboard/sections/Products";
import TrafficSection from "../../components/dashboard/sections/Traffic";
import ConversionSection from "../../components/dashboard/sections/Conversion";
import LoadingState from "../../components/dashboard/LoadingState";
import AskAI from "../../components/dashboard/sections/AskAI";
import useDashboardData from "@/hooks/useDashBoardData";

const Index = () => {
  const [activeSection, setActiveSection] = useState("overview");

  // Pass activeSection to the hook
  const {
    products,
    refunds,
    metrics,
    revenueByMonth,
    revenueByYear,
    refundsByProduct,
    ordersByProduct,
    sessions,
    pageviews,
    isLoading,
    error,
    orders,
    orderItems,
    dateRange,
    setDateRange,
    totalDateRange,
    getCurrentDateRangeDisplay,
  } = useDashboardData(activeSection);

  const renderSection = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive text-lg font-semibold">
              Error loading data
            </p>
            <p className="text-muted-foreground mt-2">{error}</p>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case "overview":
        return (
          <OverviewSection
            metrics={metrics}
            revenueByMonth={revenueByMonth}
            revenueByYear={revenueByYear}
            dateRange={dateRange}
            setDateRange={setDateRange}
            totalDateRange={totalDateRange}
            getCurrentDateRangeDisplay={getCurrentDateRangeDisplay}
          />
        );
      case "revenue":
        return (
          <RevenueSection
            metrics={metrics}
            revenueByMonth={revenueByMonth}
            ordersByProduct={ordersByProduct}
            dateRange={dateRange}
            setDateRange={setDateRange}
            totalDateRange={totalDateRange}
            getCurrentDateRangeDisplay={getCurrentDateRangeDisplay}
          />
        );
      case "refunds":
        return (
          <RefundSection
            metrics={metrics}
            refundsByProduct={refundsByProduct}
            totalRefundCount={refunds.length}
            dateRange={dateRange}
            setDateRange={setDateRange}
            totalDateRange={totalDateRange}
            getCurrentDateRangeDisplay={getCurrentDateRangeDisplay}
          />
        );
      case "products":
        return (
          <ProductsSection
            products={products}
            ordersByProduct={ordersByProduct}
            refundsByProduct={refundsByProduct}
            dateRange={dateRange}
            setDateRange={setDateRange}
            totalDateRange={totalDateRange}
            getCurrentDateRangeDisplay={getCurrentDateRangeDisplay}
          />
        );
      case "ask_ai":
        return <AskAI />;
      case "traffic":
        return (
          <TrafficSection
            sessions={sessions}
            pageviews={pageviews}
            dateRange={dateRange}
            setDateRange={setDateRange}
            totalDateRange={totalDateRange}
            getCurrentDateRangeDisplay={getCurrentDateRangeDisplay}
          />
        );
      case "conversion":
        return (
          <ConversionSection
            sessions={sessions}
            orders={orders}
            orderItems={orderItems}
            products={products}
            pageviews={pageviews}
            dateRange={dateRange}
            setDateRange={setDateRange}
            totalDateRange={totalDateRange}
            getCurrentDateRangeDisplay={getCurrentDateRangeDisplay}
          />
        );
      default:
        return (
          <OverviewSection
            metrics={metrics}
            revenueByMonth={revenueByMonth}
            revenueByYear={revenueByYear}
            dateRange={dateRange}
            setDateRange={setDateRange}
            totalDateRange={totalDateRange}
            getCurrentDateRangeDisplay={getCurrentDateRangeDisplay}
          />
        );
    }
  };

  return (
    <DashboardLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      dateRange={dateRange}
      setDateRange={setDateRange}
      totalDateRange={totalDateRange}
      getCurrentDateRangeDisplay={getCurrentDateRangeDisplay}
      isLoading={isLoading}
    >
      {renderSection()}
    </DashboardLayout>
  );
};

export default Index;
