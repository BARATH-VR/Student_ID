import React, { useState } from 'react';
import { DUMMY_EMAIL_TEMPLATES } from '../constants';
import { EmailTemplate } from '../types';
import { ChevronDownIcon, PlusCircleIcon, BoldIcon, ItalicIcon, UnderlineIcon, ListIcon, ArrowLeftIcon } from './Icons';

interface EmailTemplateManagerProps {
  onBack: () => void;
}

const EmailTemplateManager: React.FC<EmailTemplateManagerProps> = ({ onBack }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(DUMMY_EMAIL_TEMPLATES[0]);
  const [subject, setSubject] = useState(selectedTemplate.subject);
  const [content, setContent] = useState(selectedTemplate.content);
  const contentRef = React.useRef<HTMLTextAreaElement>(null);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const template = DUMMY_EMAIL_TEMPLATES.find(t => t.id === e.target.value);
    if (template) {
      setSelectedTemplate(template);
      setSubject(template.subject);
      setContent(template.content);
    }
  };

  const placeholders = [
    { label: "User Name", value: "[User Name]" },
    { label: "Expiry Date", value: "[Expiry Date]" },
    { label: "Card Number", value: "[Card Number]" },
    { label: "Activation Link", value: "[Activation Link]" },
  ];

  const handleInsertPlaceholder = (placeholder: string) => {
    if (contentRef.current) {
        const { selectionStart, selectionEnd, value } = contentRef.current;
        const newContent = value.substring(0, selectionStart) + placeholder + value.substring(selectionEnd);
        setContent(newContent);
    }
  };

  return (
    <div>
        <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-600 hover:text-dark mb-6">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Settings
        </button>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-dark">Email Template Management</h2>
                    <p className="text-secondary mt-1">Customize system emails for system notifications.</p>
                </div>
                 <button className="bg-primary-600 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-primary-700 transition-colors">
                    Save Changes
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Template</label>
                        <div className="relative">
                            <select 
                                value={selectedTemplate.id}
                                onChange={handleTemplateChange}
                                className="w-full appearance-none bg-white border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm">
                                {DUMMY_EMAIL_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Template Content</label>
                        <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                             <div className="p-2 bg-gray-50 border-b border-gray-300 flex items-center space-x-2">
                                <button className="p-2 rounded hover:bg-gray-200"><BoldIcon className="w-5 h-5"/></button>
                                <button className="p-2 rounded hover:bg-gray-200"><ItalicIcon className="w-5 h-5"/></button>
                                <button className="p-2 rounded hover:bg-gray-200"><UnderlineIcon className="w-5 h-5"/></button>
                                <button className="p-2 rounded hover:bg-gray-200"><ListIcon className="w-5 h-5"/></button>
                             </div>
                            <textarea
                                ref={contentRef}
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                className="w-full h-64 p-4 border-0 focus:ring-0 text-sm"
                                placeholder="Enter email content here..."
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-800">Available Placeholders</h4>
                    <div className="space-y-2">
                        {placeholders.map(p => (
                            <div key={p.value} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                <span className="text-xs font-mono text-gray-600">{p.label}</span>
                                <button onClick={() => handleInsertPlaceholder(p.value)} className="p-1 rounded hover:bg-gray-200">
                                    <PlusCircleIcon className="w-5 h-5 text-primary-600"/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default EmailTemplateManager;
