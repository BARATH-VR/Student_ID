
import React, { useState, useRef, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { exportToCSV, exportToPDF } from '../services/exportService';
import { ChevronDownIcon } from './Icons';

const verificationTrend = [
  { name: 'Mon', Verifications: 120 }, { name: 'Tue', Verifications: 150 },
  { name: 'Wed', Verifications: 110 }, { name: 'Thu', Verifications: 180 },
  { name: 'Fri', Verifications: 210 }, { name: 'Sat', Verifications: 250 },
  { name: 'Sun', Verifications: 230 },
];

const verificationsByRole = [
  { name: 'Student', count: 750 },
  { name: 'Faculty', count: 150 },
  { name: 'Staff', count: 100 },
];

const libraryUsageByHour = [
  { hour: '8am', checkIns: 5, checkOuts: 0 }, { hour: '9am', checkIns: 12, checkOuts: 2 },
  { hour: '10am', checkIns: 25, checkOuts: 8 }, { hour: '11am', checkIns: 30, checkOuts: 15 },
  { hour: '12pm', checkIns: 18, checkOuts: 25 }, { hour: '1pm', checkIns: 22, checkOuts: 20 },
  { hour: '2pm', checkIns: 28, checkOuts: 18 }, { hour: '3pm', checkIns: 35, checkOuts: 25 },
  { hour: '4pm', checkIns: 20, checkOuts: 30 }, { hour: '5pm', checkIns: 10, checkOuts: 38 },
];

const libraryAttendanceByRole = [
  { role: 'Student', present: 850, absent: 150 },
  { role: 'Faculty', present: 95, absent: 25 },
  { role: 'Staff', present: 40, absent: 10 },
];

const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-white p-6 rounded-2xl shadow-md">
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
);

const ExportDropdown: React.FC<{
    data: any[];
    headers: {label: string, key: string}[];
    title: string;
    filenamePrefix: string;
}> = ({ data, headers, title, filenamePrefix }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    const handleExport = (format: 'csv' | 'pdf') => {
        if (format === 'csv') {
            exportToCSV(headers, data, `${filenamePrefix}.csv`);
        } else {
            exportToPDF(title, headers, data, `${filenamePrefix}.pdf`);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={wrapperRef}>
            <div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex justify-center w-full rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                >
                    Export
                    <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" />
                </button>
            </div>
            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <button onClick={() => handleExport('csv')} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem">
                            Export as CSV
                        </button>
                        <button onClick={() => handleExport('pdf')} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem">
                            Export as PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const Analytics: React.FC = () => {
  return (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Verifications" value="15,000" />
            <StatCard title="Successful" value="14,500" />
            <StatCard title="Failed" value="500" />
            <StatCard title="Avg. Resolution Time" value="2.5h" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Verification Trends (Last 7 Days)</h3>
                    <ExportDropdown
                        data={verificationTrend}
                        headers={[{ label: 'Day', key: 'name' }, { label: 'Verifications', key: 'Verifications' }]}
                        title="Verification Trends"
                        filenamePrefix="verification_trends"
                    />
                </div>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={verificationTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                            <Line type="monotone" dataKey="Verifications" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 5, fill: '#0ea5e9' }} activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Verifications by Role</h3>
                     <ExportDropdown
                        data={verificationsByRole}
                        headers={[{ label: 'Role', key: 'name' }, { label: 'Verifications', key: 'count' }]}
                        title="Verifications by Role"
                        filenamePrefix="verifications_by_role"
                    />
                </div>
                <div style={{ width: '100%', height: 300 }}>
                     <ResponsiveContainer>
                        <BarChart layout="vertical" data={verificationsByRole} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }}/>
                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}/>
                            <Bar dataKey="count" fill="#0ea5e9" name="Verifications" barSize={20} radius={[0, 10, 10, 0]}/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Library Analytics Section */}
        <div className="pt-8 border-t border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Library Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">Library Usage by Hour</h3>
                        <ExportDropdown
                            data={libraryUsageByHour}
                            headers={[{ label: 'Hour', key: 'hour' }, { label: 'Check-ins', key: 'checkIns' }, { label: 'Check-outs', key: 'checkOuts' }]}
                            title="Library Usage by Hour"
                            filenamePrefix="library_usage_by_hour"
                        />
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={libraryUsageByHour} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }}/>
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }}/>
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}/>
                                <Legend wrapperStyle={{ fontSize: '14px', color: '#334155' }}/>
                                <Line type="monotone" dataKey="checkIns" name="Check-ins" stroke="#0ea5e9" strokeWidth={3} />
                                <Line type="monotone" dataKey="checkOuts" name="Check-outs" stroke="#16a34a" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">Library Attendance by Role</h3>
                        <ExportDropdown
                            data={libraryAttendanceByRole}
                            headers={[{ label: 'Role', key: 'role' }, { label: 'Present', key: 'present' }, { label: 'Absent', key: 'absent' }]}
                            title="Library Attendance by Role"
                            filenamePrefix="library_attendance_by_role"
                        />
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={libraryAttendanceByRole} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="role" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }}/>
                                <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: '#64748b' }}/>
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}/>
                                <Legend wrapperStyle={{ fontSize: '14px', color: '#334155' }}/>
                                <Bar dataKey="present" stackId="a" name="Present" fill="#22c55e" barSize={30} />
                                <Bar dataKey="absent" stackId="a" name="Absent" fill="#e2e8f0" barSize={30} radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Analytics;
