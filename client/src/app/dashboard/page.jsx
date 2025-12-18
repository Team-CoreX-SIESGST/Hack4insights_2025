"use client";

import { useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import OverviewSection from "../../components/dashboard/sections/Overview";
import RevenueSection from "../../components/dashboard/sections/Revenue";
import RefundSection from "../../components/dashboard/sections/Refund";
import ProductsSection from "../../components/dashboard/sections/Products";
import TrafficSection from "../../components/dashboard/sections/TrafficSection";
import ConversionSection from "../../components/dashboard/sections/ConversionSection";
import LoadingState from "../../components/dashboard/LoadingState";
import useDashboardData from "@/hooks/useDashBoardData";

const Index = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const {
    products,
    refunds,
    orders,
    sessions,
    pageviews,
    metrics,
    revenueByMonth,
    revenueByYear,
    refundsByProduct,
    ordersByProduct,
    channelPerformance,
    sessionsTrendData,
    bounceRate,
    avgSessionDuration,
    totalPageviews,
    isLoading,
    error,
  } = useDashboardData();

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
          />
        );
      case "traffic":
        return (
          <TrafficSection
            sessions={sessions}
            pageviews={pageviews}
            orders={orders}
            bounceRate={bounceRate}
            avgSessionDuration={avgSessionDuration}
            totalPageviews={totalPageviews}
            channelPerformance={channelPerformance}
            sessionsTrendData={sessionsTrendData}
          />
        );
      case "conversion":
        return (
          <ConversionSection
            sessions={sessions}
            pageviews={pageviews}
            orders={orders}
          />
        );
      case "revenue":
        return (
          <RevenueSection
            metrics={metrics}
            revenueByMonth={revenueByMonth}
            ordersByProduct={ordersByProduct}
          />
        );
      case "refunds":
        return (
          <RefundSection
            metrics={metrics}
            refundsByProduct={refundsByProduct}
            totalRefundCount={refunds.length}
          />
        );
      case "products":
        return (
          <ProductsSection
            products={products}
            ordersByProduct={ordersByProduct}
            refundsByProduct={refundsByProduct}
          />
        );
      default:
        return (
          <OverviewSection
            metrics={metrics}
            revenueByMonth={revenueByMonth}
            revenueByYear={revenueByYear}
          />
        );
    }
  };

  return (
    <DashboardLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      {renderSection()}
    </DashboardLayout>
  );
};

export default Index;
