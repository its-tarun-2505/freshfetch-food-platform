import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCollection, createDocument } from '../../../services/firestore';
import { parseFirestoreDocument } from '../../../utils/firestoreUtils';

export const fetchUserOrders = createAsyncThunk(
  'userOrders/fetchUserOrders',
  async ({ userId, restaurantId, token }) => {
    try {
      const response = await getCollection(`restaurants/${restaurantId}/orders`, token);
      const orders = response.documents || [];
      
      const userOrders = orders
        .filter(order => order.fields?.userId?.stringValue === userId)
        .map(order => parseFirestoreDocument(order))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return userOrders;
    } catch (error) {
      throw error;
    }
  }
);

export const placeOrder = createAsyncThunk(
  'userOrders/placeOrder',
  async ({ orderData, userId, restaurantId, token }) => {
    try {
      console.log('Starting order creation with data:', { orderData, userId, restaurantId });
      
      if (!orderData || !userId || !restaurantId || !token) {
        throw new Error('Missing required order data');
      }
      
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error('Order must contain at least one item');
      }
      
      const orderWithMetadata = {
        userId: { stringValue: userId },
        restaurantId: { stringValue: restaurantId },
        items: { arrayValue: { values: orderData.items.map(item => ({ mapValue: { fields: {
          id: { stringValue: item.id },
          name: { stringValue: item.name },
          price: { doubleValue: item.price },
          quantity: { integerValue: item.quantity },
          image: { stringValue: item.image || '' }
        }}})) }},
        totalAmount: { doubleValue: orderData.totalAmount },
        deliveryAddress: { stringValue: orderData.deliveryAddress || '' },
        phoneNumber: { stringValue: orderData.phoneNumber || '' },
        orderNotes: { stringValue: orderData.orderNotes || '' },
        paymentMethod: { stringValue: orderData.paymentMethod || 'Cash on Delivery' },
        status: { stringValue: 'Pending' },
        createdAt: { timestampValue: new Date().toISOString() },
        updatedAt: { timestampValue: new Date().toISOString() }
      };
      
      console.log('Formatted order data for Firestore:', orderWithMetadata);
      
      const response = await createDocument(`restaurants/${restaurantId}/orders`, orderWithMetadata, token);
      console.log('Order creation response:', response);
      
      let orderId;
      if (response.name) {
        orderId = response.name.split('/').pop();
      } else if (response.documentId) {
        orderId = response.documentId;
      } else {
        orderId = `temp_${Date.now()}`;
      }
      
      console.log('Extracted order ID:', orderId);
      
      const createdOrder = {
        id: orderId,
        userId: userId,
        restaurantId: restaurantId,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        deliveryAddress: orderData.deliveryAddress,
        phoneNumber: orderData.phoneNumber,
        orderNotes: orderData.orderNotes,
        paymentMethod: orderData.paymentMethod,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('Created order object for store:', createdOrder);
      return createdOrder;
    } catch (error) {
      console.error('Error placing order:', error);
      if (error.code === 'PERMISSION_DENIED') {
        throw new Error('Permission denied. Please check your authentication.');
      } else if (error.code === 'INVALID_ARGUMENT') {
        throw new Error('Invalid order data. Please check your input.');
      } else if (error.code === 'UNAVAILABLE') {
        throw new Error('Service temporarily unavailable. Please try again.');
      } else {
        throw new Error(`Failed to place order: ${error.message || 'Unknown error'}`);
      }
    }
  }
);

const userOrdersSlice = createSlice({
  name: 'userOrders',
  initialState: {
    orders: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearOrders: (state) => {
      state.orders = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearOrders } = userOrdersSlice.actions;
export default userOrdersSlice.reducer;
