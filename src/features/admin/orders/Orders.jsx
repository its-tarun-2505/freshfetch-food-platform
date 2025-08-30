import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrders, updateOrderStatus } from './ordersSlice';
import styles from './Orders.module.css';

const OrderStatus = {
  PENDING: 'Pending',
  PREPARING: 'Preparing',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
};

const Orders = () => {
  const { token, restaurantId } = useSelector((state) => state.adminAuth);
  const { orders, status, error } = useSelector((state) => state.orders);
  const dispatch = useDispatch();

  useEffect(() => {
    if (restaurantId && token) {
      dispatch(fetchOrders({ restaurantId, token }));
    }
  }, [restaurantId, token, dispatch]);

  const handleStatusChange = (orderId, newStatus) => {
    if (restaurantId && token) {
      dispatch(updateOrderStatus({ restaurantId, token, orderId, newStatus }));
    }
  };

  if (status === 'loading') {
    return <div className={styles.container}>Loading orders...</div>;
  }

  if (status === 'failed') {
    return <div className={`${styles.container} ${styles.error}`}>Error: {error.message || error}</div>;
  }

return (
  <div className={styles.container}>
    <h2 className={styles.heading}>Orders Management</h2>

    <div className={styles.ordersGrid}>
      {orders.length > 0 ? (
        orders.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderDetails}>
              <h3 className={styles.orderId}>Order ID: {order.id}</h3>
              <p className={styles.customer}>Customer: {order.customerName} ({order.customerEmail})</p>
              <p className={styles.customer}>Address: {order.customerAddress}</p>
              <div className={styles.itemsSection}>
                <p className={styles.itemsTitle}>Items:</p>
                <ul className={styles.itemsList}>
                  {order.items && order.items.arrayValue && order.items.arrayValue.values.map((item, index) => (
                    <li key={index} className={styles.item}>
                      {item.mapValue.fields.name.stringValue} x {item.mapValue.fields.quantity.integerValue} - ${item.mapValue.fields.price.doubleValue} each
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className={styles.orderControls}>
              <p className={styles.total}>Total Price: ${order.totalPrice}</p>
              <div className={styles.statusRow}>
                <label htmlFor={`status-${order.id}`} className={styles.statusLabel}>Status:</label>
                <select
                  id={`status-${order.id}`}
                  className={styles.statusSelect}
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  {Object.values(OrderStatus).map((statusOption) => (
                    <option key={statusOption} value={statusOption}>{statusOption}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          ))
        ) : (!status.includes('loading') &&
          <p className={styles.noOrders}>No orders found for this restaurant.</p>
        )}
      </div>
    </div>
  );
};

export default Orders;
