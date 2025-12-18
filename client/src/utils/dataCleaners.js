// Data cleaning utilities for handling messy JSON data

// Safe number parser with fallback
export const safeNumber = (value, fallback = 0) => {
    if (value === null || value === undefined || value === '') return fallback;
    const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(parsed) ? fallback : parsed;
  };
  
  // Safe date parser
  export const safeDate = (value) => {
    if (!value) return null;
    const date = new Date(String(value));
    return isNaN(date.getTime()) ? null : date;
  };
  
  // Clean orders data
  export const cleanOrdersData = (rawData) => {
    if (!Array.isArray(rawData)) return [];
    
    return rawData
      .filter(item => item && typeof item === 'object')
      .map(item => {
        const obj = item;
        const createdAt = safeDate(obj.created_at);
        if (!createdAt) return null;
        
        return {
          order_id: safeNumber(obj.order_id),
          created_at: createdAt,
          website_session_id: safeNumber(obj.website_session_id),
          user_id: safeNumber(obj.user_id),
          primary_product_id: safeNumber(obj.primary_product_id),
          items_purchased: safeNumber(obj.items_purchased),
          price_usd: safeNumber(obj.price_usd),
          cogs_usd: safeNumber(obj.cogs_usd),
        };
      })
      .filter((item) => item !== null);
  };
  
  // Clean order items data
  export const cleanOrderItemsData = (rawData) => {
    if (!Array.isArray(rawData)) return [];
    
    return rawData
      .filter(item => item && typeof item === 'object')
      .map(item => {
        const obj = item;
        const createdAt = safeDate(obj.created_at);
        if (!createdAt) return null;
        
        return {
          order_item_id: safeNumber(obj.order_item_id),
          created_at: createdAt,
          order_id: safeNumber(obj.order_id),
          product_id: safeNumber(obj.product_id),
          is_primary_item: safeNumber(obj.is_primary_item) === 1,
          price_usd: safeNumber(obj.price_usd),
          cogs_usd: safeNumber(obj.cogs_usd),
        };
      })
      .filter((item) => item !== null);
  };
  
  // Clean refunds data
  export const cleanRefundsData = (rawData) => {
    if (!Array.isArray(rawData)) return [];
    
    return rawData
      .filter(item => item && typeof item === 'object')
      .map(item => {
        const obj = item;
        const createdAt = safeDate(obj.created_at);
        if (!createdAt) return null;
        
        return {
          order_item_refund_id: safeNumber(obj.order_item_refund_id),
          created_at: createdAt,
          order_item_id: safeNumber(obj.order_item_id),
          order_id: safeNumber(obj.order_id),
          refund_amount_usd: safeNumber(obj.refund_amount_usd),
        };
      })
      .filter((item) => item !== null);
  };
  
  // Clean products data
  export const cleanProductsData = (rawData) => {
    if (!Array.isArray(rawData)) return [];
    
    return rawData
      .filter(item => item && typeof item === 'object')
      .map(item => {
        const obj = item;
        const createdAt = safeDate(obj.created_at);
        if (!createdAt) return null;
        
        return {
          product_id: safeNumber(obj.product_id),
          created_at: createdAt,
          product_name: String(obj.product_name || 'Unknown Product'),
        };
      })
      .filter((item) => item !== null);
  };
  
  // Aggregate revenue by month
  export const aggregateRevenueByMonth = (orders) => {
    const grouped = new Map();
    
    orders.forEach(order => {
      const monthKey = `${order.created_at.getFullYear()}-${String(order.created_at.getMonth() + 1).padStart(2, '0')}`;
      const existing = grouped.get(monthKey) || { revenue: 0, orders: 0 };
      grouped.set(monthKey, {
        revenue: existing.revenue + order.price_usd,
        orders: existing.orders + 1,
      });
    });
    
    return Array.from(grouped.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };
  
  // Aggregate revenue by year
  export const aggregateRevenueByYear = (orders) => {
    const grouped = new Map();
    
    orders.forEach(order => {
      const year = order.created_at.getFullYear();
      const existing = grouped.get(year) || { revenue: 0, orders: 0 };
      grouped.set(year, {
        revenue: existing.revenue + order.price_usd,
        orders: existing.orders + 1,
      });
    });
    
    return Array.from(grouped.entries())
      .map(([year, data]) => ({ year, ...data }))
      .sort((a, b) => a.year - b.year);
  };
  
  // Calculate refund rate
  export const calculateRefundRate = (orders, refunds) => {
    if (orders.length === 0) return 0;
    return (refunds.length / orders.length) * 100;
  };
  
  // Calculate total revenue
  export const calculateTotalRevenue = (orders) => {
    return orders.reduce((sum, order) => sum + order.price_usd, 0);
  };
  
  // Calculate total refunds
  export const calculateTotalRefunds = (refunds) => {
    return refunds.reduce((sum, refund) => sum + refund.refund_amount_usd, 0);
  };
  
  // Calculate AOV (Average Order Value)
  export const calculateAOV = (orders) => {
    if (orders.length === 0) return 0;
    return calculateTotalRevenue(orders) / orders.length;
  };
  
  // Get refunds by product
  export const getRefundsByProduct = (refunds, orderItems, products) => {
    const refundOrderItemIds = new Set(refunds.map(r => r.order_item_id));
    
    const productRefunds = new Map();
    
    orderItems.forEach(item => {
      if (refundOrderItemIds.has(item.order_item_id)) {
        const refund = refunds.find(r => r.order_item_id === item.order_item_id);
        const existing = productRefunds.get(item.product_id) || { count: 0, amount: 0 };
        productRefunds.set(item.product_id, {
          count: existing.count + 1,
          amount: existing.amount + (refund?.refund_amount_usd || 0),
        });
      }
    });
    
    return Array.from(productRefunds.entries()).map(([productId, data]) => {
      const product = products.find(p => p.product_id === productId);
      return {
        product: product?.product_name || `Product ${productId}`,
        refunds: data.count,
        amount: data.amount,
      };
    });
  };
  
  // Get orders by product
  export const getOrdersByProduct = (orderItems, products) => {
    const productOrders = new Map();
    
    orderItems.filter(item => item.is_primary_item).forEach(item => {
      const existing = productOrders.get(item.product_id) || { count: 0, revenue: 0 };
      productOrders.set(item.product_id, {
        count: existing.count + 1,
        revenue: existing.revenue + item.price_usd,
      });
    });
    
    return Array.from(productOrders.entries()).map(([productId, data]) => {
      const product = products.find(p => p.product_id === productId);
      return {
        product: product?.product_name || `Product ${productId}`,
        orders: data.count,
        revenue: data.revenue,
      };
    });
  };
  
  // Format currency
  export const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Format percentage
  export const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };
  
  // Format large numbers
  export const formatNumber = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  // Add these cleaning functions to your existing dataCleaners.js

export const cleanSessionsData = (sessionsRaw) => {
  return sessionsRaw.map(session => ({
    website_session_id: parseInt(session.website_session_id) || 0,
    created_at: session.created_at || '',
    created_at_date: session.created_at_date || '',
    created_at_time: session.created_at_time || '',
    user_id: parseInt(session.user_id) || 0,
    is_repeat_session: session.is_repeat_session || '0',
    utm_source: session.utm_source || 'direct',
    utm_campaign: session.utm_campaign || '',
    utm_content: session.utm_content || '',
    device_type: session.device_type || 'desktop',
    http_referer: session.http_referer || ''
  }));
};

export const cleanPageviewsData = (pageviewsRaw) => {
  return pageviewsRaw.map(pageview => ({
    website_pageview_id: parseInt(pageview.website_pageview_id) || 0,
    created_at: pageview.created_at || '',
    created_at_date: pageview.created_at_date || '',
    created_at_time: pageview.created_at_time || '',
    website_session_id: parseInt(pageview.website_session_id) || 0,
    pageview_url: pageview.pageview_url || ''
  }));
};

// New helper functions for session metrics
export const calculateSessionMetrics = (sessions) => {
  const totalSessions = sessions.length;
  const repeatSessions = sessions.filter(s => s.is_repeat_session === "1").length;
  const mobileSessions = sessions.filter(s => s.device_type === "mobile").length;
  const desktopSessions = sessions.filter(s => s.device_type === "desktop").length;
  
  return {
    totalSessions,
    repeatSessions,
    mobileSessions,
    desktopSessions,
    repeatSessionRate: totalSessions > 0 ? (repeatSessions / totalSessions) * 100 : 0,
    mobileSessionRate: totalSessions > 0 ? (mobileSessions / totalSessions) * 100 : 0,
    desktopSessionRate: totalSessions > 0 ? (desktopSessions / totalSessions) * 100 : 0
  };
};

export const calculateConversionFunnel = (sessions, pageviews, orders) => {
  const totalSessions = sessions.length;
  
  const sessionsWithPageviews = sessions.filter(session => 
    pageviews.some(p => p.website_session_id === session.website_session_id)
  ).length;
  
  const sessionsWithProductViews = sessions.filter(session => 
    pageviews.some(p => 
      p.website_session_id === session.website_session_id && 
      p.pageview_url.includes('/products')
    )
  ).length;
  
  const sessionsWithCartViews = sessions.filter(session => 
    pageviews.some(p => 
      p.website_session_id === session.website_session_id && 
      p.pageview_url.includes('/cart')
    )
  ).length;
  
  const sessionsWithCheckout = sessions.filter(session => 
    pageviews.some(p => 
      p.website_session_id === session.website_session_id && 
      p.pageview_url.includes('/checkout')
    )
  ).length;
  
  return {
    totalSessions,
    sessionsWithPageviews,
    sessionsWithProductViews,
    sessionsWithCartViews,
    sessionsWithCheckout,
    totalOrders: orders.length,
    sessionToOrderRate: totalSessions > 0 ? (orders.length / totalSessions) * 100 : 0,
    cartToOrderRate: sessionsWithCartViews > 0 ? (orders.length / sessionsWithCartViews) * 100 : 0
  };
};

export const calculateChannelPerformance = (sessions, orders) => {
  const channelData = sessions.reduce((acc, session) => {
    const source = session.utm_source || 'direct';
    const campaign = session.utm_campaign || 'none';
    const key = `${source}|${campaign}`;
    
    if (!acc[key]) {
      acc[key] = {
        source,
        campaign,
        sessions: 0,
        orders: 0,
        revenue: 0
      };
    }
    acc[key].sessions++;
    
    // Find orders for this session
    const sessionOrders = orders.filter(o => o.website_session_id === session.website_session_id);
    acc[key].orders += sessionOrders.length;
    acc[key].revenue += sessionOrders.reduce((sum, o) => sum + parseFloat(o.price_usd || 0), 0);
    
    return acc;
  }, {});
  
  return Object.values(channelData).map(channel => ({
    ...channel,
    conversionRate: channel.sessions > 0 ? (channel.orders / channel.sessions) * 100 : 0,
    avgOrderValue: channel.orders > 0 ? channel.revenue / channel.orders : 0
  }));
};

// Helper function for device conversion rates
export const calculateDeviceConversion = (deviceType, sessions, orders) => {
  const deviceSessions = sessions.filter(s => s.device_type === deviceType);
  const deviceOrders = orders.filter(order => {
    const session = sessions.find(s => s.website_session_id === order.website_session_id);
    return session?.device_type === deviceType;
  });
  
  return {
    sessions: deviceSessions.length,
    orders: deviceOrders.length,
    conversionRate: deviceSessions.length > 0 ? (deviceOrders.length / deviceSessions.length) * 100 : 0
  };
};