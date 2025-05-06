import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider, useWallet } from './contexts/WalletContext';
import Navigation from './components/Navigation';
import WalletImport from './components/WalletImport';
import GroupList from './components/GroupList';
import GroupForm from './components/GroupForm';
import JournalEntryList from './components/JournalEntryList';
import JournalEntryForm from './components/JournalEntryForm';
import SendAndRecordForm from './components/SendAndRecordForm';
import './index.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { wallet } = useWallet();
  
  if (!wallet) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Home page component
const Home = () => {
  const { wallet } = useWallet();
  
  return (
    <div className="home-container">
      <h1>ERP Rollup Dashboard</h1>
      
      {!wallet ? (
        <WalletImport />
      ) : (
        <div className="dashboard-intro">
          <h2>Welcome to your ERP Dashboard</h2>
          <p>Use the navigation menu to manage your accounting groups and journal entries.</p>
          <div className="dashboard-actions">
            <a href="/groups" className="dashboard-link">Manage Groups</a>
            <a href="/journal-entries" className="dashboard-link">View Journal Entries</a>
            <a href="/send" className="dashboard-link">Send & Record Transaction</a>
          </div>
        </div>
      )}
    </div>
  );
};

// Groups page component
const GroupsPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleGroupCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="groups-container">
      <h1>Accounting Groups</h1>
      <div className="content-grid">
        <GroupForm onGroupCreated={handleGroupCreated} />
        <GroupList key={refreshTrigger} />
      </div>
    </div>
  );
};

// Journal entries page component
const JournalEntriesPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleEntryCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="journal-entries-container">
      <h1>Journal Entries</h1>
      <div className="content-grid">
        <JournalEntryForm onEntryCreated={handleEntryCreated} />
        <JournalEntryList key={refreshTrigger} />
      </div>
    </div>
  );
};

// Send page component
const SendPage = () => {
  return (
    <div className="send-container">
      <h1>Send & Record Transaction</h1>
      <SendAndRecordForm />
    </div>
  );
};

// Main App component
const AppContent = () => {
  return (
    <Router>
      <div className="app">
        <Navigation />
        
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            
            <Route 
              path="/groups" 
              element={
                <ProtectedRoute>
                  <GroupsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/journal-entries" 
              element={
                <ProtectedRoute>
                  <JournalEntriesPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/send" 
              element={
                <ProtectedRoute>
                  <SendPage />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <footer className="footer">
          <p>ERP Rollup Frontend &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
};

export default App;