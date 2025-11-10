
import React, { useState, useRef, useCallback } from 'react';
import { EventIdData, Template } from '../types';
import { DUMMY_EVENT_PARTICIPANT, TEMPLATES } from '../constants';
import CardPreview from './CardPreview';
import TemplateCarousel from './TemplateCarousel';
import { generateTagline, enhancePhoto } from '../services/geminiService';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { DownloadIcon, SparklesIcon, ResetIcon, UploadIcon, UserIcon } from './Icons';


const EventIdGenerator: React.FC = () => {
    const [data, setData] = useState<EventIdData>(DUMMY_EVENT_PARTICIPANT);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('modern');
    const [isGeneratingTagline, setIsGeneratingTagline] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);

    const cardRef = useRef<HTMLDivElement>(null);
    const selectedTemplate = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setData(prev => ({ ...prev, photo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleGenerateTagline = async () => {
        if (!data.role || !data.eventName) {
            console.warn("Role and Event Name must be filled to generate a tagline.");
            return;
        }
        setIsGeneratingTagline(true);
        try {
            const tagline = await generateTagline(data.role, data.eventName);
            setData(prev => ({ ...prev, tagline }));
        } catch (error) {
            console.error("Failed to generate tagline:", error);
        } finally {
            setIsGeneratingTagline(false);
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
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleDownload = async (format: 'png' | 'pdf') => {
        if (!cardRef.current) return;

        const images = Array.from(cardRef.current.getElementsByTagName('img'));
        const imageLoadPromises = images.map((img: HTMLImageElement) => {
            if (img.complete) return Promise.resolve();
            return new Promise<void>(resolve => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
            });
        });

        await Promise.all(imageLoadPromises);
        await new Promise(resolve => setTimeout(resolve, 50));

        const filename = `${data.name.replace(/\s/g, '_')}_${data.eventName.replace(/\s/g, '_')}`;

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
    
    const InputField: React.FC<{label: string, name: keyof EventIdData, value: string, type?: string}> = ({label, name, value, type='text'}) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <input type={type} id={name} name={name} value={value} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm" />
        </div>
    );
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Participant Details</h3>
                    <button onClick={() => setData(DUMMY_EVENT_PARTICIPANT)} className="text-sm font-semibold text-slate-500 hover:text-primary-600 flex items-center" title="Reset form">
                        <ResetIcon className="w-4 h-4 mr-1" /> Reset
                    </button>
                </div>
                <div className="space-y-4">
                    <InputField label="Full Name" name="name" value={data.name} />
                    <InputField label="Role" name="role" value={data.role} />
                    <InputField label="Event Name" name="eventName" value={data.eventName} />
                    <InputField label="Event Date" name="eventDate" value={data.eventDate} type="date"/>
                    <div>
                        <label htmlFor="tagline" className="block text-sm font-medium text-slate-700 mb-1">Tagline</label>
                        <div className="flex items-center space-x-2">
                             <input type="text" id="tagline" name="tagline" value={data.tagline} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm" />
                             <button 
                                onClick={handleGenerateTagline} 
                                disabled={isGeneratingTagline || !data.role || !data.eventName} 
                                className="p-2 bg-slate-100 rounded-md hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title={!data.role || !data.eventName ? "Please enter a role and event name first" : "Generate AI Tagline"}
                              >
                                {isGeneratingTagline ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div> : <SparklesIcon className="w-5 h-5 text-primary-500"/>}
                             </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Photo</label>
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center overflow-hidden border">
                                {data.photo ? <img src={data.photo} alt="Preview" className="w-full h-full object-cover" /> : <UserIcon className="w-8 h-8 text-slate-400"/>}
                            </div>
                            <label htmlFor="photo" className="cursor-pointer bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-100 transition-colors text-sm">
                                <UploadIcon className="w-4 h-4 inline mr-2" />
                                Upload
                            </label>
                            <input id="photo" name="photo" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                             <button onClick={handleEnhancePhoto} disabled={!data.photo || isEnhancing} className="p-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition disabled:opacity-50">
                                {isEnhancing ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div> : <SparklesIcon className="w-5 h-5 text-primary-500"/>}
                             </button>
                        </div>
                    </div>
                     <div className="border-t pt-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Event Details (for recommendations)</label>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="eventType" className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                                <select id="eventType" name="eventType" value={data.eventType} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm">
                                    <option value="">Select</option>
                                    <option value="Tech">Tech</option>
                                    <option value="Non-Tech">Non-Tech</option>
                                </select>
                            </div>
                         </div>
                    </div>

                </div>
            </div>

            <div className="lg:col-span-3">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Select Template</h3>
                    <div className="relative group">
                        <button onClick={() => handleDownload('png')} className="bg-primary-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center shadow-lg shadow-primary-500/30">
                            <DownloadIcon className="w-5 h-5 mr-2" /> Download
                        </button>
                        <div className="absolute top-full mt-2 right-0 w-32 bg-white rounded-md shadow-lg border z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleDownload('png'); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-t-md">as PNG</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleDownload('pdf'); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-b-md">as PDF</a>
                        </div>
                    </div>
                </div>
                
                <TemplateCarousel
                    onSelectTemplate={(id) => setSelectedTemplateId(id)}
                    selectedTemplateId={selectedTemplateId}
                    eventType={data.eventType}
                />

                <div className="mt-8 flex justify-center items-start">
                    <div className="transform scale-110 origin-top">
                        <CardPreview ref={cardRef} data={data} template={selectedTemplate} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventIdGenerator;
