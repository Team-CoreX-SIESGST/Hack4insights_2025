// utils/insightGenerator.js

export const generateConversionInsights = (data) => {
  const {
    overallConversionRate,
    totalOrders,
    totalRevenue,
    aov,
    revenuePerSession,
    profitMargin,
    totalProfit,
    deviceData,
    sourceData,
    campaignData,
    newConversionRate,
    returningConversionRate,
    timelineData,
    productData,
    landingPageData,
    funnelData,
    newVisitors,
    returningVisitors,
  } = data;

  const insights = [];

  // 1. Overall Conversion Rate Insight
  if (overallConversionRate < 2) {
    insights.push({
      type: "warning",
      title: "Low Conversion Rate Detected",
      message: `Your overall conversion rate is ${overallConversionRate.toFixed(
        2
      )}%, which is below industry average. Consider improving landing page optimization and simplifying the checkout process.`,
      recommendation:
        "Implement A/B testing on your checkout page, add trust signals (reviews, security badges), and reduce form fields.",
    });
  } else if (overallConversionRate > 5) {
    insights.push({
      type: "success",
      title: "Excellent Conversion Performance",
      message: `Great work! Your ${overallConversionRate.toFixed(
        2
      )}% conversion rate is above average. This indicates strong product-market fit and effective marketing.`,
      recommendation:
        "Focus on maintaining this rate while scaling your marketing efforts. Consider increasing ad spend on top-performing channels.",
    });
  }

  // 2. AOV Insight
  if (aov < 50) {
    insights.push({
      type: "info",
      title: "Opportunity to Increase Average Order Value",
      message: `Your current AOV is $${aov.toFixed(
        2
      )}. Customers are making smaller purchases than ideal.`,
      recommendation:
        "Implement upselling strategies, bundle products, offer free shipping thresholds, and showcase premium products more prominently.",
    });
  } else if (aov > 150) {
    insights.push({
      type: "success",
      title: "Strong Average Order Value",
      message: `Your AOV of $${aov.toFixed(
        2
      )} indicates customers are making substantial purchases.`,
      recommendation:
        "Leverage this by offering loyalty programs and exclusive access to high-value customers.",
    });
  }

  // 3. New vs Returning Visitor Insight
  const returningRatio = returningVisitors / (newVisitors + returningVisitors);
  if (returningConversionRate > newConversionRate * 1.5) {
    insights.push({
      type: "warning",
      title: "New Visitor Conversion Gap",
      message: `Returning visitors convert at ${returningConversionRate.toFixed(
        2
      )}% vs ${newConversionRate.toFixed(
        2
      )}% for new visitors. New visitors need more guidance.`,
      recommendation:
        "Improve onboarding, add product tutorials, create clear value propositions, and implement exit-intent popups for first-time visitors.",
    });
  }

  // 4. Device Performance Insight
  const desktopConv =
    deviceData.find((d) => d.device === "desktop")?.conversionRate || 0;
  const mobileConv =
    deviceData.find((d) => d.device === "mobile")?.conversionRate || 0;

  if (mobileConv < desktopConv * 0.7 && mobileConv > 0) {
    insights.push({
      type: "warning",
      title: "Mobile Conversion Lag",
      message: `Mobile conversion rate (${mobileConv.toFixed(
        2
      )}%) is significantly lower than desktop (${desktopConv.toFixed(2)}%).`,
      recommendation:
        "Optimize for mobile: improve page speed, simplify forms, ensure one-click checkout, and test mobile-specific layouts.",
    });
  }

  // 5. Top Performing Source Insight
  if (sourceData.length > 0) {
    const topSource = sourceData.sort(
      (a, b) => b.conversionRate - a.conversionRate
    )[0];
    const bottomSource = sourceData.sort(
      (a, b) => a.conversionRate - b.conversionRate
    )[0];

    if (topSource.conversionRate > bottomSource.conversionRate * 2) {
      insights.push({
        type: "opportunity",
        title: "Channel Performance Discrepancy",
        message: `${
          topSource.source
        } converts at ${topSource.conversionRate.toFixed(2)}% while ${
          bottomSource.source
        } is at ${bottomSource.conversionRate.toFixed(2)}%.`,
        recommendation: `Reallocate budget from ${bottomSource.source} to ${topSource.source}. Also, analyze what ${topSource.source} is doing right and apply those learnings to underperforming channels.`,
      });
    }
  }

  // 6. Funnel Drop-off Insight
  const engagedToOrderRate =
    funnelData.find((f) => f.stage === "Engaged (>1 page)")?.rate || 0;
  if (engagedToOrderRate < 20) {
    insights.push({
      type: "warning",
      title: "High Engagement-to-Order Drop-off",
      message: `Only ${engagedToOrderRate.toFixed(
        2
      )}% of engaged visitors are converting to orders.`,
      recommendation:
        "Add urgency (limited-time offers), social proof (live sales notifications), and reduce friction in the checkout process.",
    });
  }

  // 7. Profit Margin Insight
  if (profitMargin < 20) {
    insights.push({
      type: "warning",
      title: "Low Profit Margin",
      message: `Your profit margin is ${profitMargin.toFixed(
        2
      )}%, which may not be sustainable for growth.`,
      recommendation:
        "Review COGS, consider price optimization, negotiate with suppliers, and focus on higher-margin products.",
    });
  }

  // 8. Revenue Concentration Insight
  if (productData.length > 0) {
    const topProduct = productData.sort((a, b) => b.revenue - a.revenue)[0];
    const totalProductRevenue = productData.reduce(
      (sum, p) => sum + p.revenue,
      0
    );
    const topProductPercentage =
      (topProduct.revenue / totalProductRevenue) * 100;

    if (topProductPercentage > 60) {
      insights.push({
        type: "warning",
        title: "Revenue Concentration Risk",
        message: `${
          topProduct.productName
        } accounts for ${topProductPercentage.toFixed(2)}% of total revenue.`,
        recommendation:
          "Diversify product offerings, create complementary products, and develop marketing campaigns for underperforming products.",
      });
    }
  }

  // 9. Seasonal Trend Insight
  if (timelineData.length >= 3) {
    const recentMonths = timelineData.slice(-3);
    const trend =
      (recentMonths[2].conversionRate - recentMonths[0].conversionRate) /
      recentMonths[0].conversionRate;

    if (trend < -0.1) {
      insights.push({
        type: "alert",
        title: "Declining Conversion Trend",
        message: "Conversion rate has been declining over the last 3 periods.",
        recommendation:
          "Investigate recent changes to website, pricing, or competition. Consider running promotional campaigns.",
      });
    } else if (trend > 0.2) {
      insights.push({
        type: "success",
        title: "Positive Momentum",
        message: "Conversion rate shows strong positive trend recently.",
        recommendation:
          "Double down on what's working. Scale successful campaigns and replicate strategies across channels.",
      });
    }
  }

  // 10. Landing Page Insight
  if (landingPageData.length > 0) {
    const topLandingPage = landingPageData[0];
    const avgConvRate =
      landingPageData.reduce((sum, item) => sum + item.conversionRate, 0) /
      landingPageData.length;

    if (topLandingPage.conversionRate > avgConvRate * 1.5) {
      insights.push({
        type: "opportunity",
        title: "High-Performing Landing Page",
        message: `${
          topLandingPage.url
        } converts at ${topLandingPage.conversionRate.toFixed(
          2
        )}% (well above average).`,
        recommendation:
          "Analyze this page's elements (copy, design, CTAs) and apply similar patterns to underperforming pages.",
      });
    }
  }

  return insights.slice(0, 5); // Return top 5 insights
};

export const generateOverviewInsights = (data) => {
  const {
    totalRevenue,
    netRevenue,
    totalOrders,
    aov,
    refundRate,
    totalRefunds,
  } = data;

  const insights = [];

  // Revenue growth insight
  insights.push({
    type: "success",
    title: "Revenue Performance",
    message: `Total revenue of $${(totalRevenue / 1000).toFixed(
      1
    )}K with ${totalOrders} orders shows healthy business activity.`,
    recommendation: "Focus on customer retention to boost recurring revenue.",
  });

  // AOV insight
  if (aov < 75) {
    insights.push({
      type: "opportunity",
      title: "Increase Order Value",
      message: `Average order value of $${aov.toFixed(
        2
      )} suggests room for growth.`,
      recommendation: "Implement product bundles and cross-selling strategies.",
    });
  }

  // Refund insight
  if (refundRate > 5) {
    insights.push({
      type: "warning",
      title: "High Refund Rate",
      message: `Refund rate of ${refundRate.toFixed(
        2
      )}% is above acceptable threshold.`,
      recommendation:
        "Review product quality and improve customer communication.",
    });
  }

  return insights;
};

export const generateProductInsights = (data) => {
  const insights = [];

  if (data.avgRefundRate > 5) {
    insights.push({
      type: "warning",
      title: "Product Quality Concerns",
      message: `Average refund rate of ${data.avgRefundRate.toFixed(
        2
      )}% indicates potential product issues.`,
      recommendation:
        "Conduct product quality review and gather customer feedback.",
    });
  }

  if (parseInt(data.topProductPercent) > 50) {
    insights.push({
      type: "info",
      title: "Product Concentration",
      message: `${data.topProduct} generates ${data.topProductPercent}% of revenue.`,
      recommendation:
        "Diversify product offerings and promote complementary products.",
    });
  }

  return insights;
};

export const generateRefundInsights = (data) => {
  const insights = [];

  if (data.refundRate > 5) {
    insights.push({
      type: "warning",
      title: "High Refund Rate Alert",
      message: `${data.refundRate.toFixed(
        2
      )}% refund rate exceeds industry benchmarks.`,
      recommendation:
        "Implement better quality control and customer expectation management.",
    });
  }

  return insights;
};

export const generateTrafficInsights = (data) => {
  const insights = [];

  if (data.bounceRate > 60) {
    insights.push({
      type: "warning",
      title: "High Bounce Rate",
      message: `${data.bounceRate.toFixed(
        2
      )}% bounce rate suggests poor landing page relevance.`,
      recommendation:
        "Improve page load speed and ensure content matches ad promises.",
    });
  }

  if (parseInt(data.mobilePercent) > 70) {
    insights.push({
      type: "success",
      title: "Mobile Dominance",
      message: `${data.mobilePercent}% of traffic comes from mobile devices.`,
      recommendation:
        "Ensure mobile experience is optimized with fast loading and easy navigation.",
    });
  }

  return insights;
};
