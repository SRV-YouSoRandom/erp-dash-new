import React, { useState, useEffect } from 'react';
import { fetchGroups } from '../services/api';

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadGroups = async () => {
      try {
        setLoading(true);
        const data = await fetchGroups();
        setGroups(data.Group || []);
        setError('');
      } catch (err) {
        console.error('Error loading groups:', err);
        setError('Failed to load groups. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, []);

  if (loading) {
    return <div className="loading">Loading groups...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (groups.length === 0) {
    return <div className="no-data">No groups found. Create a new group to get started.</div>;
  }

  return (
    <div className="group-list">
      <h2>Accounting Groups</h2>
      
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Creator</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group.id}>
              <td>{group.id}</td>
              <td>{group.name}</td>
              <td>{group.description}</td>
              <td>{group.creator}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupList;