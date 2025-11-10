
import React, { useState, useRef, useCallback } from 'react';
import { StudentIdData, TemplateDefinition } from '../types';
import { DUMMY_STUDENT, ALL_TEMPLATES } from '../constants';
import CardPreview from './CardPreview';
import { enhancePhoto } from '../services/geminiService';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { DownloadIcon, SparklesIcon, ResetIcon, UploadIcon, UserIcon } from './Icons';

const StudentIdGenerator: React.FC = () => {
    const [data, setData] = useState<StudentIdData>(DUMMY_STUDENT);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('nandha-student');
    const [isEnhancing, setIsEnhancing] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const studentTemplates = ALL_TEMPLATES.filter(t => t.type === 'student');
    const selectedTemplate = studentTemplates.find(t => t.id === selectedTemplateId) || studentTemplates[0];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof StudentIdData) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setData(prev => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEnhancePhoto = async () => {
        if (!data.photo) return;
        setIsEnhancing(true);
        try {
            const enhanced = await enhancePhoto(data.photo);
            setData(prev => ({ ...prev, photo: enhanced }));
        } catch (error) {
            console.error("Failed to enhance photo:", error);
            // Optionally, show a toast notification to the user
        } finally {
            setIsEnhancing(false);
        }
    };
    
    const handleDownload = async (format: 'png' | 'pdf') => {
        if (!cardRef.current) return;

        // Wait for images to load before capturing
        const images = Array.from(cardRef.current.getElementsByTagName('img'));
        const imageLoadPromises = images.map((img: HTMLImageElement) => {
            if (img.complete) return Promise.resolve();
            return new Promise<void>(resolve => {
                img.onload = () => resolve();
                img.onerror = () => {
                    console.warn(`Could not load image: ${img.src}`);
                    resolve();
                };
            });
        });

        await Promise.all(imageLoadPromises);
        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay for render

        const filename = `${data.name.replace(/\s/g, '_')}_${data.regNo}`;

        if (format === 'png') {
            const dataUrl = await htmlToImage.toPng(cardRef.current, { quality: 1, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `${filename}.png`;
            link.href = dataUrl;
            link.click();
        } else {
            const cardWidthMM = selectedTemplate.width * 0.264583;
            const cardHeightMM = selectedTemplate.height * 0.264583;
            const doc = new jsPDF({
                orientation: cardWidthMM > cardHeightMM ? 'l' : 'p',
                unit: 'mm',
                format: [cardWidthMM, cardHeightMM]
            });
            const dataUrl = await htmlToImage.toPng(cardRef.current, { quality: 1, pixelRatio: 2 });
            doc.addImage(dataUrl, 'PNG', 0, 0, cardWidthMM, cardHeightMM);
            doc.save(`${filename}.pdf`);
        }
    };

    const InputField: React.FC<{label: string, name: keyof StudentIdData, value: string, placeholder?: string}> = ({label, name, value, placeholder}) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <input type="text" id={name} name={name} value={value} onChange={handleInputChange} placeholder={placeholder} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm" />
        </div>
    );
    
    const FileInputField: React.FC<{label: string, field: keyof StudentIdData, currentFile: string | null}> = ({ label, field, currentFile }) => (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center overflow-hidden border">
                    {currentFile ? <img src={currentFile} alt="Preview" className="w-full h-full object-cover" /> : <UserIcon className="w-8 h-8 text-slate-400" />}
                </div>
                <label htmlFor={field as string} className="cursor-pointer bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-100 transition-colors text-sm">
                    <UploadIcon className="w-4 h-4 inline mr-2" />
                    Upload
                </label>
                <input id={field as string} type="file" className="sr-only" onChange={(e) => handleFileChange(e, field)} accept="image/*" />
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Student Details</h3>
                    <button onClick={() => setData(DUMMY_STUDENT)} className="text-sm font-semibold text-slate-500 hover:text-primary-600 flex items-center" title="Reset form">
                        <ResetIcon className="w-4 h-4 mr-1" /> Reset
                    </button>
                </div>
                <div className="space-y-4">
                    <InputField label="Full Name" name="name" value={data.name} />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Register No." name="regNo" value={data.regNo} />
                        <InputField label="Department" name="dept" value={data.dept} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Date of Birth" name="dob" value={data.dob} placeholder="DD-MM-YYYY"/>
                        <InputField label="Blood Group" name="bloodGroup" value={data.bloodGroup} />
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <textarea id="address" name="address" value={data.address} onChange={handleInputChange} rows={2} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Gender" name="gender" value={data.gender} />
                        <InputField label="Phone" name="phone" value={data.phone} />
                    </div>
                     <div className="grid grid-cols-3 gap-4 pt-2">
                        <FileInputField label="Photo" field="photo" currentFile={data.photo} />
                        <FileInputField label="Logo" field="logo" currentFile={data.logo} />
                        <FileInputField label="Signature" field="signature" currentFile={data.signature} />
                    </div>
                </div>
            </div>

            <div className="lg:col-span-3">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                     <div>
                        <label htmlFor="template" className="block text-sm font-medium text-slate-700 mb-1">Select Template</label>
                        <select id="template" value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)} className="w-full md:w-auto bg-white border border-slate-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm">
                            {studentTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 self-end">
                        <button onClick={handleEnhancePhoto} disabled={!data.photo || isEnhancing} className="bg-white border border-slate-300 text-slate-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-slate-100 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                            {isEnhancing ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mr-2"></div> Enhancing...</> : <><SparklesIcon className="w-5 h-5 mr-2 text-primary-500"/> Enhance Photo</>}
                        </button>
                         <div className="relative group">
                            <button onClick={() => handleDownload('png')} className="bg-primary-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center shadow-lg shadow-primary-500/30"><DownloadIcon className="w-5 h-5 mr-2"/> Download</button>
                            <div className="absolute top-full mt-2 right-0 w-32 bg-white rounded-md shadow-lg border z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                                <a href="#" onClick={(e) => { e.preventDefault(); handleDownload('png'); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-t-md">as PNG</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleDownload('pdf'); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-b-md">as PDF</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center items-start">
                    <div className="transform scale-110 origin-top">
                         <CardPreview ref={cardRef} data={data} template={selectedTemplate} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentIdGenerator;
