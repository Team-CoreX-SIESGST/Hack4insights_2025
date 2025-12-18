const maven_fuzzy_factory_data_dictionary = {
  table: "orders",
  field: "order_id",
  description: "Unique identifier for each order (PK)",
};

const order_item_refunds_json = {
  order_item_refund_id: "1",
  created_at: "2012-04-06 11:32:43",
  order_item_id: "57",
  order_id: "57",
  refund_amount_usd: "49.99",
  created_at_date: "2012-04-06",
  created_at_time: "11:32:43",
};

const order_items_json = {
  order_item_id: "1",
  created_at: "2012-03-19 10:42:46",
  order_id: "1",
  product_id: "1",
  is_primary_item: "1",
  price_usd: "49.99",
  cogs_usd: "19.49",
  created_at_date: "2012-03-19",
  created_at_time: "10:42:46",
};

const orders = {
  order_id: "1",
  created_at: "2012-03-19 10:42:46",
  website_session_id: "20",
  user_id: "20.0",
  primary_product_id: "1",
  items_purchased: "1",
  price_usd: "49.99",
  cogs_usd: "19.49",
  created_at_date: "2012-03-19",
  created_at_time: "10:42:46",
};

const products = {
  product_id: "1",
  created_at: "2012-03-19 08:00:00",
  product_name: "The Original Mr. Fuzzy",
};

const website_pageviews = {
  website_pageview_id: "1",
  created_at: "2012-03-19 08:04:16",
  website_session_id: "1",
  pageview_url: "/home",
  created_at_date: "2012-03-19",
  created_at_time: "10:42:46",
};

const website_sessions = {
  website_session_id: "1",
  created_at: "2012-03-19 08:04:16",
  user_id: "1",
  is_repeat_session: "0",
  utm_source: "gsearch",
  utm_campaign: "nonbrand",
  utm_content: "g_ad_1",
  device_type: "mobile",
  http_referer: "https://www.gsearch.com",
  created_at_date: "2012-03-19",
  created_at_time: "10:42:46",
};
