import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { placeOrder } from '../orders/userOrdersSlice';
import { clearCart } from '../cart/cartSlice';
import styles from './Checkout.module.css';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, total } = useSelector((state) => state.cart);
  const { userId, name, address, token } = useSelector((state) => state.userAuth);
  const { loading } = useSelector((state) => state.userOrders);

  const [deliveryAddress, setDeliveryAddress] = useState(address || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      alert('Please enter a delivery address');
      return;
    }

    if (!phoneNumber.trim()) {
      alert('Please enter a phone number');
      return;
    }

    if (!items || items.length === 0) {
      alert('Your cart is empty. Please add items before placing an order.');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.id || !item.name || typeof item.price !== 'number' || !item.quantity) {
        alert(`Invalid item data at position ${i + 1}. Please refresh and try again.`);
        return;
      }
    }

    const restaurantId = items[0]?.restaurantId || 'default-restaurant';
    // console.log('Order items:', items);
    // console.log('Restaurant ID:', restaurantId);

    const orderData = {
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || '',
      })),
      totalAmount: total,
      deliveryAddress: deliveryAddress.trim(),
      phoneNumber: phoneNumber.trim(),
      orderNotes: orderNotes.trim(),
      paymentMethod: 'Cash on Delivery',
    };

    // console.log('Order data being sent:', orderData);

    try {
      const result = await dispatch(placeOrder({ 
        orderData, 
        userId, 
        restaurantId, 
        token 
      })).unwrap();
      
      // console.log('Order placed successfully:', result);
      dispatch(clearCart());
      navigate('/orders');
    } catch (error) {
      // console.error('Order placement failed:', error);
      alert(`Failed to place order: ${error.message || 'Please try again.'}`);
    }
  };

  const handleBackToCart = () => {
    navigate('/cart');
  };

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyCart}>
          <h1>Checkout</h1>
          <p>Your cart is empty.</p>
          <button onClick={() => navigate('/categories')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Checkout</h1>
      
      <div className={styles.grid}>
        <div className={styles.summary}>
          <h2>Order Summary</h2>
          <div className={styles.itemList}>
            {items.map((item) => (
              <div key={item.id} className={styles.item}>
                <img
                  src={item.image}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                  }}
                />
                <div className={styles.itemDetails}>
                  <h3>{item.name}</h3>
                  <p>Qty: {item.quantity}</p>
                </div>
                <p className={styles.itemPrice}>
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          
          <div className={styles.totals}>
            <div>
              <span>Subtotal:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div>
              <span>Delivery Fee:</span>
              <span>$0.00</span>
            </div>
            <div className={styles.total}>
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className={styles.delivery}>
          <h2>Delivery Information</h2>
          
          <label>
            Customer Name
            <input type="text" value={name || ''} disabled />
          </label>

          <label>
            Delivery Address *
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Enter your delivery address"
              rows="3"
              required
            />
          </label>

          <label>
            Phone Number *
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </label>

          <label>
            Order Notes (Optional)
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Any special instructions for delivery"
              rows="2"
            />
          </label>

          <div className={styles.paymentBox}>
            <h3>Payment Method</h3>
            <p>Cash on Delivery (COD)</p>
            <small>Pay with cash when your order is delivered</small>
          </div>

          <div className={styles.buttons}>
            <button
              onClick={handlePlaceOrder}
              disabled={loading || !deliveryAddress.trim() || !phoneNumber.trim()}
              className={styles.placeOrder}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
            
            <button
              onClick={handleBackToCart}
              className={styles.back}
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
