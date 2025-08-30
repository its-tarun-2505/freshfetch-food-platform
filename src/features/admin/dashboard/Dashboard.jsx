import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCollection } from '../../../services/firestore';
import { parseFirestoreDocument } from '../../../utils/firestoreUtils';
import { syncAllToPublic, getSyncStatus } from '../../../services/syncService';
import { getPublicCollection } from '../../../services/publicFirestore';
import LoadingSpinner from '../../../components/LoadingSpinner';
import styles from './Dashboard.module.css';
import { FaUtensils, FaBook, FaShoppingCart, FaClock, FaSync, FaArrowRight } from 'react-icons/fa';

const Dashboard = () => {
  const { token, restaurantId } = useSelector((state) => state.adminAuth);
  const navigate = useNavigate();

  const [counts, setCounts] = useState({
    categories: 0,
    recipes: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncStatus, setSyncStatus] = useState({});
  const [publicData, setPublicData] = useState({
    categories: [],
    recipes: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token || !restaurantId) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        
        const categoriesCollection = await getCollection(`restaurants/${restaurantId}/categories`, token);
        const parsedCategories = categoriesCollection.map(parseFirestoreDocument);

        const recipesCollection = await getCollection(`restaurants/${restaurantId}/recipes`, token);
        const parsedRecipes = recipesCollection.map(parseFirestoreDocument);

        const ordersCollection = await getCollection(`restaurants/${restaurantId}/orders`, token);
        const parsedOrders = ordersCollection.map(parseFirestoreDocument);

        setCounts({
          categories: parsedCategories.length,
          recipes: parsedRecipes.length,
          totalOrders: parsedOrders.length,
          pendingOrders: parsedOrders.filter(order => order.status === 'Pending').length,
        });
      } catch (err) {
        // console.error('Dashboard data fetch error:', err);
        setError(err.message || 'Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, restaurantId]);

  useEffect(() => {
    const updateSyncStatus = () => {
      setSyncStatus(getSyncStatus());
    };

    const interval = setInterval(updateSyncStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncToPublic = async () => {
    if (!token || !restaurantId) return;
    
    setSyncing(true);
    setSyncMessage('');
    setError(null);
    
    try {
      await syncAllToPublic(restaurantId, token);
      setSyncMessage('✅ Successfully synced all data to public collections!');
      await checkPublicCollections();
    } catch (error) {
      // console.error('Sync error:', error);
      setError(`Sync failed: ${error.message}`);
      setSyncMessage('');
    } finally {
      setSyncing(false);
    }
  };

  const checkPublicCollections = async () => {
    try {
      const publicCategories = await getPublicCollection('public-categories');
      const publicRecipes = await getPublicCollection('public-recipes');
      
      setPublicData({
        categories: publicCategories,
        recipes: publicRecipes
      });
    } catch (error) {
      // console.error('Error checking public collections:', error);
    }
  };

  useEffect(() => {
    checkPublicCollections();
  }, []);

  if (loading) {
    return (
      <div className={styles.center}>
        <LoadingSpinner size="xl" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.center}>
        <div className={styles.errorBox}>
          <strong>Error:</strong> {error}
        </div>
        <button onClick={() => window.location.reload()} className={styles.retryBtn}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>📊 Dashboard</h1>
      
      <div className={styles.cards}>
        <div className={`${styles.card} ${styles.cardBlue}`}>
          <FaBook className={styles.icon} />
          <h1>Categories</h1>
          <p>{counts.categories}</p>
          <button className={styles.cardBtn} onClick={() => navigate('/categories')}>
            View Categories <FaArrowRight />
          </button>
        </div>
        
        <div className={`${styles.card} ${styles.cardGreen}`}>
          <FaUtensils className={styles.icon} />
          <h1>Recipes</h1>
          <p>{counts.recipes}</p>
          <button className={styles.cardBtn} onClick={() => navigate('/recipes')}>
            View Recipes <FaArrowRight />
          </button>
        </div>
        
        <div className={`${styles.card} ${styles.cardPurple}`}>
          <FaShoppingCart className={styles.icon} />
          <h1>Total Orders</h1>
          <p>{counts.totalOrders}</p>
          <button className={styles.cardBtn} onClick={() => navigate('/orders')}>
            View Orders <FaArrowRight />
          </button>
        </div>
        
        <div className={`${styles.card} ${styles.cardOrange}`}>
          <FaClock className={styles.icon} />
          <h1>Pending Orders</h1>
          <p>{counts.pendingOrders}</p>
          <button className={styles.cardBtn} onClick={() => navigate('/orders?status=pending')}>
            View Pending <FaArrowRight />
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2>🔄 Data Synchronization</h2>
        <button 
          onClick={handleSyncToPublic} 
          disabled={syncing || !token || !restaurantId}
          className={styles.syncBtn}
        >
          <FaSync className={styles.syncIcon} /> {syncing ? 'Syncing...' : 'Sync All to Public'}
        </button>

        {syncMessage && <div className={styles.successMsg}>{syncMessage}</div>}
      </div>

      <div className={styles.section}>
        <h2>🌍 Public Collections Status</h2>
        <div className={styles.publicData}>
          <div>
            <h3>Public Categories</h3>
            <p>{publicData.categories.length}</p>
          </div>
          <div>
            <h3>Public Recipes</h3>
            <p>{publicData.recipes.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
