import React, { useState, useRef, useEffect } from 'react';
import { SearchIcon, ChevronDownIcon, EmailIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from './Icons';
import { generateBulkEmailBody, sendBulkIdsByEmail } from '../services/geminiService';
import { exportToCSV, exportToPDF } from '../services/exportService';
import { DUMMY_EMAIL_TEMPLATES, ALL_IDS_DATA } from '../constants';

const ExportDropdown: React.FC<{
    allData: any[],
    selectedData: any[],
    disabled: boolean,
}> = ({ allData, selectedData, disabled }) => {
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
    
    const headers = [
        { label: 'Full Name', key: 'name' },
        { label: 'College ID', key: 'collegeId' },
        { label: 'Role', key: 'role' },
        { label: 'Department', key: 'department' },
        { label: 'Expiry Date', key: 'expiry' },
        { label: 'Status', key: 'status' }
    ];

    const handleExport = (format: 'csv' | 'pdf', scope: 'all' | 'selected') => {
        const dataToExport = scope === 'selected' ? selectedData : allData;
        const filename = `${scope}_ids_export.${format}`;
        const title = `ID List (${scope})`;
        
        if (format === 'csv') {
            exportToCSV(headers, dataToExport, filename);
        } else {
            exportToPDF(title, headers, dataToExport, filename);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={wrapperRef}>
            <div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex justify-center w-full rounded-md border border-slate-300 shadow-sm px-4 py-2.5 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    aria-haspopup="true" aria-expanded={isOpen}
                >
                    Export
                    <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" />
                </button>
            </div>
            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        <button onClick={() => handleExport('csv', 'all')} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem">
                            Export All as CSV
                        </button>
                        <button onClick={() => handleExport('pdf', 'all')} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem">
                            Export All as PDF
                        </button>
                        <div className="border-t border-slate-100 my-1" />
                        <button onClick={() => handleExport('csv', 'selected')} disabled={disabled} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed" role="menuitem">
                            Export Selected as CSV
                        </button>
                        <button onClick={() => handleExport('pdf', 'selected')} disabled={disabled} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed" role="menuitem">
                            Export Selected as PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


const ManageIDs: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIDs, setSelectedIDs] = useState<string[]>([]);
    const [toast, setToast] = useState<{ message: string; success: boolean } | null>(null);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [recipientEmail, setRecipientEmail] = useState('');

    const filteredIDs = ALL_IDS_DATA.filter(id =>
        id.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        id.collegeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        id.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const showToast = (message: string, success: boolean) => {
        setToast({ message, success });
        setTimeout(() => setToast(null), 3000);
    };
    
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-success-100 text-success-700';
            case 'Revoked': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getExpiryInfo = (expiryDate: string): { daysRemaining: number | null, isExpiringSoon: boolean } => {
        const now = new Date();
        const expiry = new Date(expiryDate);
        // Set time to 0 to compare dates only, preventing timezone issues from affecting the day count.
        now.setHours(0, 0, 0, 0);
        expiry.setHours(0, 0, 0, 0);

        if (isNaN(expiry.getTime())) {
            return { daysRemaining: null, isExpiringSoon: false };
        }

        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
            daysRemaining: diffDays,
            isExpiringSoon: diffDays >= 0 && diffDays <= 30,
        };
    };

    const allVisibleSelected = filteredIDs.length > 0 && filteredIDs.every(id => selectedIDs.includes(id.collegeId));

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const visibleIds = filteredIDs.map(id => id.collegeId);
        if (e.target.checked) {
            setSelectedIDs(prev => [...new Set([...prev, ...visibleIds])]);
        } else {
            setSelectedIDs(prev => prev.filter(id => !visibleIds.includes(id)));
        }
    };

    const handleSelectRow = (collegeId: string) => {
        setSelectedIDs(prev => 
            prev.includes(collegeId)
                ? prev.filter(id => id !== collegeId)
                : [...prev, collegeId]
        );
    };

    const handleOpenEmailModal = () => {
        if (selectedIDs.length === 0) return;
        setRecipientEmail('');
        setIsEmailModalOpen(true);
    };

    const handleConfirmAndSendEmail = async () => {
        if (!recipientEmail || !recipientEmail.includes('@')) {
            showToast("Please enter a valid email address.", false);
            return;
        }

        setIsSendingEmail(true);

        try {
            const selectedIdData = ALL_IDS_DATA.filter(id => selectedIDs.includes(id.collegeId));
            const recipientNames = selectedIdData.map(id => id.name);

            const emailBody = await generateBulkEmailBody(recipientNames);
            
            const notificationTemplate = DUMMY_EMAIL_TEMPLATES.find(t => t.id === 'notification');
            const emailSubject = notificationTemplate ? notificationTemplate.subject.replace('[User Name]', 'Recipient') : 'Your Digital ID Cards are Ready';

            const result = await sendBulkIdsByEmail(recipientEmail, emailSubject, emailBody, selectedIDs.length);
            
            showToast(result.message, result.success);
            if (result.success) {
                setSelectedIDs([]);
                setIsEmailModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to process and send bulk email:", error);
            showToast("An error occurred while generating the email.", false);
        } finally {
            setIsSendingEmail(false);
        }
    };

    return (
        <>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full md:w-1/2 lg:w-1/3">
                        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Name, College ID, or Department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <ExportDropdown 
                            allData={filteredIDs}
                            selectedData={ALL_IDS_DATA.filter(id => selectedIDs.includes(id.collegeId))}
                            disabled={selectedIDs.length === 0}
                        />
                        <button
                            onClick={handleOpenEmailModal}
                            disabled={selectedIDs.length === 0 || isSendingEmail}
                            className="flex items-center bg-primary-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <EmailIcon className="w-5 h-5 mr-2" />
                            Email ({selectedIDs.length})
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th scope="col" className="p-4 w-12">
                                    <input 
                                        type="checkbox" 
                                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                        onChange={handleSelectAll}
                                        checked={allVisibleSelected}
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3 font-semibold">Full Name</th>
                                <th scope="col" className="px-6 py-3 font-semibold">College ID</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Role</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Department</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Expiry Date</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredIDs.map((id, index) => {
                                const { daysRemaining, isExpiringSoon } = getExpiryInfo(id.expiry);
                                return (
                                <tr key={index} className="bg-white border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                                    <td className="p-4">
                                        <input 
                                            type="checkbox" 
                                            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                            checked={selectedIDs.includes(id.collegeId)}
                                            onChange={() => handleSelectRow(id.collegeId)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-slate-800">{id.name}</td>
                                    <td className="px-6 py-4 text-slate-500 font-mono">{id.collegeId}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold py-1 px-2.5 rounded-full ${
                                            id.role === 'Student' ? 'bg-primary-50 text-primary-700' : 
                                            id.role === 'Staff' ? 'bg-amber-50 text-amber-700' : 'bg-purple-50 text-purple-700'
                                        }`}>{id.role}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{id.department}</td>
                                    <td className="px-6 py-4 text-slate-500">
                                        <div className="relative group flex items-center gap-2">
                                            <span className={isExpiringSoon ? 'text-amber-600 font-semibold' : ''}>
                                                {id.expiry}
                                            </span>
                                            {isExpiringSoon && (
                                                <>
                                                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                        {daysRemaining === 0 ? 'Expires today' : `Expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold py-1 px-2.5 rounded-full ${getStatusBadge(id.status)}`}>
                                            {id.status}
                                        </span>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center mt-6">
                    <p className="text-sm text-slate-500">Showing 1 to {filteredIDs.length} of {ALL_IDS_DATA.length} results</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-100">Previous</button>
                        <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-100">Next</button>
                    </div>
                </div>
            </div>
            {toast && (
                <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-xl text-white ${toast.success ? 'bg-success-600' : 'bg-danger'}`}>
                    <div className="flex items-center space-x-2">
                        {toast.success ? <CheckCircleIcon className="w-6 h-6" /> : <XCircleIcon className="w-6 h-6" />}
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}
            {isEmailModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
                    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md m-4 transform transition-all">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Confirm Email Delivery</h2>
                        <p className="text-slate-600 mb-6">
                            You are about to send details for <span className="font-bold">{selectedIDs.length}</span> selected ID(s). 
                            Please enter the recipient's email address below.
                        </p>
                        <div>
                            <label htmlFor="recipient-email" className="block text-sm font-medium text-slate-700 mb-1">
                                Recipient Email
                            </label>
                            <input
                                id="recipient-email"
                                type="email"
                                value={recipientEmail}
                                onChange={(e) => setRecipientEmail(e.target.value)}
                                placeholder="e.g., admin@university.edu"
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
                            />
                        </div>
                        <div className="mt-8 flex justify-end space-x-4">
                            <button
                                onClick={() => setIsEmailModalOpen(false)}
                                className="bg-slate-100 text-slate-700 font-semibold py-2.5 px-5 rounded-lg hover:bg-slate-200 transition-colors"
                                disabled={isSendingEmail}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAndSendEmail}
                                disabled={isSendingEmail}
                                className="flex items-center justify-center w-36 bg-primary-600 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSendingEmail ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : 'Confirm & Send'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ManageIDs;