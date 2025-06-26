// User Service Patterns
export const GET_ALL_USERS_QUERY = 'get_all_users_query';
export const GET_USER_BY_ID_QUERY = 'get_user_by_id_query';
export const CREATE_USER_COMMAND = 'create_user_command';
export const USER_CREATED_EVENT = 'user_created_event';

// Product Service Patterns
export const GET_ALL_PRODUCTS_QUERY = 'get_all_products_query';
export const GET_PRODUCT_BY_ID_QUERY = 'get_product_by_id_query';
export const CREATE_PRODUCT_COMMAND = 'create_product_command';
export const UPDATE_PRODUCT_COMMAND = 'update_product_command';
export const DECREMENT_PRODUCT_STOCK_COMMAND = 'decrement_product_stock_command'; // <-- ใหม่
export const STOCK_DECREMENTED_EVENT = 'stock_decremented_event'; // <-- ใหม่
export const STOCK_DECREMENT_FAILED_EVENT = 'stock_decrement_failed_event'; // <-- ใหม่
export const PRODUCT_UPDATED_EVENT = 'product_updated_event';

// Order Service Patterns
export const CREATE_ORDER_COMMAND = 'create_order_command'; // <-- ใหม่
export const GET_ORDER_BY_ID_QUERY = 'get_order_by_id_query'; // <-- ใหม่
export const GET_ORDERS_BY_USER_ID_QUERY = 'get_orders_by_user_id_query'; // <-- ใหม่
export const ORDER_CREATED_EVENT = 'order_created_event'; // <-- ใหม่
export const ORDER_COMPLETED_EVENT = 'order_completed_event'; // <-- ใหม่
export const ORDER_FAILED_EVENT = 'order_failed_event'; // <-- ใหม่