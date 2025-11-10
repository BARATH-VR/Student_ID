
import React, { useState } from 'react';
import { Page } from './types';
import Sidebar from './components/Sidebar';
import BulkUpload from './components/BulkUpload';
import Settings from './components/Settings';
import Login from './components/Login';
import QRScanner from './components/QRScanner';
import { UserIcon } from './components/Icons';
import StudentIdGenerator from './components/StudentIdGenerator';
import EventIdGenerator from './components/EventIdGenerator';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>(Page.SingleStudentId);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage(Page.SingleStudentId);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case Page.BulkUpload:
        return 'Bulk ID Generation';
      case Page.QRScanner:
        return 'ID Verification Scanner';
      case Page.Settings:
          return 'System Settings';
      case Page.SingleStudentId:
          return 'Student ID Generator';
      case Page.SingleEventId:
          return 'Event ID Generator';
      default:
        return 'CampusID Pro';
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.BulkUpload:
        return <BulkUpload />;
      case Page.QRScanner:
        return <QRScanner />;
      case Page.Settings:
        return <Settings />;
      case Page.SingleStudentId:
        return <StudentIdGenerator />;
      case Page.SingleEventId:
        return <EventIdGenerator />;
      default:
        return <StudentIdGenerator />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-6 bg-white/60 backdrop-blur-lg border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{getPageTitle()}</h1>
            <p className="text-sm text-slate-500 hidden md:block">Welcome to your ID Management dashboard.</p>
          </div>
          <button className="flex items-center space-x-4 group">
            <div className="text-right">
                <span className="text-sm font-semibold text-slate-800 group-hover:text-primary-600 transition-colors">Admin</span>
                <p className="text-xs text-slate-500">Administrator</p>
            </div>
            <img className="w-11 h-11 rounded-full ring-2 ring-offset-2 ring-offset-white ring-primary-500 group-hover:ring-primary-600 transition-all" src="sample.webp" alt="User" />
          </button>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 md:p-10">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;