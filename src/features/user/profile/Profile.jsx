import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfileFirebase } from '../../../services/firebaseAuth';
import { updateDocument, getDocument } from '../../../services/firestore';
import { parseFirestoreDocument } from '../../../utils/firestoreUtils';
import { updateUserProfile } from '../auth/userAuthSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { token, userId, email, name: currentName, address: currentAddress } = useSelector((state) => state.userAuth);

  const [name, setName] = useState(currentName || '');
  const [address, setAddress] = useState(currentAddress || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userId && token) {
        setLoading(true);
        try {
          const userDoc = await getDocument(`users/${userId}`, token);
          const parsedUser = parseFirestoreDocument(userDoc);
          setName(parsedUser.name);
          setAddress(parsedUser.address);
          dispatch(updateUserProfile({ name: parsedUser.name, address: parsedUser.address }));
        } catch (err) {
          setError(err.message || 'Failed to fetch user profile.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserProfile();
  }, [userId, token, dispatch]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await updateUserProfileFirebase(token, name, address);

      await updateDocument(`users/${userId}`, {
        name: { stringValue: name },
        address: { stringValue: address },
      }, token);

      dispatch(updateUserProfile({ name, address }));
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">User Profile</h2>
        <form onSubmit={handleUpdateProfile}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-200"
              value={email}
              disabled
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
              Address
            </label>
            <textarea
              id="address"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows="3"
            ></textarea>
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          {success && <p className="text-green-500 text-xs italic mb-4">{success}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
