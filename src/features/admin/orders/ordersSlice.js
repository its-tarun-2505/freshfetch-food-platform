import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCollection, updateDocument } from '../../../services/firestore';
import { parseFirestoreDocument } from '../../../utils/firestoreUtils';

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async ({ restaurantId, token }, { rejectWithValue }) => {
    try {
      const response = await getCollection(`restaurants/${restaurantId}/orders`, token);
      return response.map(parseFirestoreDocument);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ restaurantId, token, orderId, newStatus }, { rejectWithValue }) => {
    try {
      const updatedOrder = {
        status: { stringValue: newStatus },
      };
      const response = await updateDocument(`restaurants/${restaurantId}/orders/${orderId}`, updatedOrder, token);
      return parseFirestoreDocument(response);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default ordersSlice.reducer;
