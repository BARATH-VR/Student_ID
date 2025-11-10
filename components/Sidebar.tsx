
import React from 'react';
import { Page } from '../types';
import { IdCardIcon, UploadIcon, SettingsIcon, QrCodeIcon } from './Icons';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onLogout: () => void;
}

const NavLink: React.FC<{
  icon: React.ReactElement;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group border-l-4 ${
        isActive
          ? 'bg-primary-50 border-primary-500 text-primary-600'
          : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {React.cloneElement(icon, { className: `w-5 h-5 ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}` })}
      <span className="ml-3 font-semibold">{label}</span>
    </a>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, onLogout }) => {
  return (
    <div className="flex flex-col w-72 bg-white border-r border-slate-200">
      <div className="flex items-center justify-center h-20 border-b border-slate-200">
        <IdCardIcon className="w-8 h-8 text-primary-600" />
        <span className="ml-3 text-xl font-bold text-slate-800">CampusID Pro</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="flex flex-col space-y-1.5">
          <p className="px-4 pt-4 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Creation</p>
          <NavLink
            icon={<IdCardIcon />}
            label="Student ID"
            isActive={currentPage === Page.SingleStudentId}
            onClick={() => setCurrentPage(Page.SingleStudentId)}
          />
          <NavLink
            icon={<IdCardIcon />}
            label="Event ID"
            isActive={currentPage === Page.SingleEventId}
            onClick={() => setCurrentPage(Page.SingleEventId)}
          />
          <NavLink
            icon={<UploadIcon />}
            label="Bulk Generation"
            isActive={currentPage === Page.BulkUpload}
            onClick={() => setCurrentPage(Page.BulkUpload)}
          />
           <p className="px-4 pt-4 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tools</p>
          <NavLink
            icon={<QrCodeIcon />}
            label="QR Scanner"
            isActive={currentPage === Page.QRScanner}
            onClick={() => setCurrentPage(Page.QRScanner)}
          />
           <p className="px-4 pt-4 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">System</p>
           <NavLink
            icon={<SettingsIcon />}
            label="Settings"
            isActive={currentPage === Page.Settings}
            onClick={() => setCurrentPage(Page.Settings)}
          />
        </nav>
      </div>
       <div className="p-4 border-t border-slate-200">
        <button onClick={onLogout} className="w-full bg-slate-100 text-slate-600 font-semibold py-3 px-4 rounded-lg hover:bg-slate-200 hover:text-slate-800 transition-colors duration-200">
            Logout
        </button>
       </div>
    </div>
  );
};

export default Sidebar;