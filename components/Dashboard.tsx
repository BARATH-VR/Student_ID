
import React from 'react';
import { Page } from '../types';
import { IdCardIcon } from './Icons';
import { ALL_IDS_DATA } from '../constants';

interface DashboardProps {
  setCurrentPage: (page: Page) => void;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between transition-all hover:shadow-lg hover:-translate-y-1">
        <div>
            <p className="text-sm text-slate-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className="bg-primary-50 p-3 rounded-lg text-primary-600">
            {icon}
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ setCurrentPage }) => {
  const recentCreations = ALL_IDS_DATA
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 4)
    .map(item => ({
        ...item,
        type: item.role === 'Student' ? 'Student' : 'Staff' // 'Staff' for both Staff and Faculty
    }));

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total IDs Created" value={ALL_IDS_DATA.length.toLocaleString()} icon={<IdCardIcon className="w-7 h-7"/>}/>
      </div>
      
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900">Recent ID Creations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-slate-500 uppercase bg-slate-50">
                <th className="py-3 px-6 font-semibold">Name</th>
                <th className="py-3 px-6 font-semibold">Type</th>
                <th className="py-3 px-6 font-semibold">Department</th>
                <th className="py-3 px-6 font-semibold">Date Created</th>
              </tr>
            </thead>
            <tbody>
              {recentCreations.map((item, index) => (
                <tr key={index} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6 font-semibold text-slate-800">{item.name}</td>
                  <td className="py-4 px-6">
                    <span className={`text-xs font-bold py-1 px-2.5 rounded-full ${
                      item.type === 'Student' ? 'bg-primary-50 text-primary-700' : 'bg-amber-50 text-amber-700'
                    }`}>{item.type}</span>
                  </td>
                  <td className="py-4 px-6 text-slate-500">{item.department}</td>
                  <td className="py-4 px-6 text-slate-500">{item.createdDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;