import React, { useState, useEffect } from 'react';
import { getAllUsers, deleteUser, blockUser, unblockUser } from '../../api/adminApi';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data || []);
    } catch (err) { console.error(err); }
  };

  const remove = async (id) => { if (!window.confirm('Delete user?')) return; try { await deleteUser(id); fetch(); } catch (err) { console.error(err); } };
  const block = async (id) => { try { await blockUser(id); fetch(); } catch (err) { console.error(err); } };
  const unblock = async (id) => { try { await unblockUser(id); fetch(); } catch (err) { console.error(err); } };

  return (
    <div>
      <h2>Users</h2>
      <ul className="um-list">
        {users.map(u => (
          <li key={u._id} className="um-item">
            <div>
              <strong>{u.name}</strong> — {u.email} — {u.role} — {u.isBlocked ? 'Blocked' : 'Active'}
            </div>
            <div className="um-actions">
              {!u.isBlocked ? <button className="block" onClick={() => block(u._id)}>Block</button> : <button onClick={() => unblock(u._id)}>Unblock</button>}
              <button className="delete" onClick={() => remove(u._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManagement;
