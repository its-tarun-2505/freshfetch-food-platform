import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCart, updateQuantity } from './cartSlice';
import styles from './Cart.module.css';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart } from 'react-icons/fa';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, total } = useSelector((state) => state.cart);

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/categories');
  };

  if (items.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <FaShoppingCart className={styles.emptyIcon} />
        <h1>Your Cart</h1>
        <p>Your cart is empty.</p>
        <button onClick={handleContinueShopping} className={styles.primaryBtn}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.heading}>Your Cart</h1>

      <div className={styles.cartGrid}>
        {/* Cart Items */}
        <div className={styles.cartItems}>
          <h2>Cart Items</h2>

          {items.map((item) => (
            <div key={item.id} className={styles.cartItem}>
              <img
                src={item.image}
                alt={item.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                }}
              />

              <div className={styles.itemDetails}>
                <h3>{item.name}</h3>
                <p>${item.price}</p>
              </div>

              <div className={styles.quantityControl}>
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  <FaMinus />
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <FaPlus />
                </button>
              </div>

              <div className={styles.itemPrice}>
                <p>${(item.price * item.quantity).toFixed(2)}</p>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className={styles.removeBtn}
                >
                  <FaTrash /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className={styles.summaryBox}>
          <h2>Order Summary</h2>
          <div className={styles.summaryDetails}>
            <div>
              <span>Subtotal:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div>
              <span>Delivery Fee:</span>
              <span>$0.00</span>
            </div>
            <hr />
            <div className={styles.summaryTotal}>
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={items.length === 0}
            className={styles.checkoutBtn}
          >
            Proceed to Checkout
          </button>

          <button
            onClick={handleContinueShopping}
            className={styles.secondaryBtn}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
