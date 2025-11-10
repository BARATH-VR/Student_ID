import React, { useState } from 'react';
import { TEMPLATES } from '../constants';
import CardPreview from './CardPreview';
import { DUMMY_EVENT_PARTICIPANT } from '../constants';
import { EventIdData, Template } from '../types';
import { XCircleIcon } from './Icons';

interface TemplateCarouselProps {
    onSelectTemplate: (templateId: string) => void;
    selectedTemplateId: string;
    eventType?: 'Tech' | 'Non-Tech' | '';
}

const TemplateCarousel: React.FC<TemplateCarouselProps> = ({ onSelectTemplate, selectedTemplateId, eventType }) => {
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

    const getRecommendationStatus = (template: Template) => {
        if (!eventType) return null;
        if (eventType === 'Tech' && template.category === 'tech') return 'tech';
        if (eventType === 'Non-Tech' && template.category === 'non-tech') return 'non-tech';
        return null;
    };

    return (
        <>
            <div className="flex space-x-4 overflow-x-auto py-4 px-2 -mx-2">
                {TEMPLATES.map((template) => {
                     const recommendation = getRecommendationStatus(template);
                     const isSelected = selectedTemplateId === template.id;
                     const isRecommended = !!recommendation;

                     const borderColor = isSelected 
                        ? (recommendation === 'tech' ? 'border-indigo-500' : recommendation === 'non-tech' ? 'border-orange-500' : 'border-primary-500')
                        : 'border-transparent';

                     const badgeColor = recommendation === 'tech' 
                        ? 'bg-indigo-100 text-indigo-800' 
                        : 'bg-orange-100 text-orange-800';

                    return (
                        <div
                            key={template.id}
                            onClick={() => setPreviewTemplate(template)}
                            className="cursor-pointer flex-shrink-0"
                            aria-label={`Preview ${template.name} template`}
                        >
                            <div className={`w-48 p-2 rounded-xl border-4 transition-all ${borderColor}`}>
                               <div className="w-full h-72 transform scale-[0.38] origin-top-left -mb-40 pointer-events-none">
                                  <CardPreview data={DUMMY_EVENT_PARTICIPANT} template={template} />
                               </div>
                               <div className="bg-white text-slate-800 text-center py-2 px-3 rounded-b-lg relative mt-1 border-t border-slate-200">
                                    <div className="flex items-center justify-center space-x-2">
                                        <template.icon className="w-5 h-5" />
                                        <span className="text-sm font-semibold">{template.name}</span>
                                    </div>
                                    {isRecommended && <div className={`absolute -top-3 right-2 text-xs font-bold py-0.5 px-2 rounded-full ${badgeColor}`}>Recommended</div>}
                               </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {previewTemplate && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300 animate-fadeIn"
                    onClick={() => setPreviewTemplate(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="card-preview-title"
                >
                    <div
                        className="relative animate-scaleUp text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 id="card-preview-title" className="sr-only">Card Preview: {previewTemplate.name}</h2>
                        <div className="transform scale-125 mb-8">
                            <CardPreview data={DUMMY_EVENT_PARTICIPANT} template={previewTemplate} />
                        </div>
                         <button
                            onClick={() => {
                                onSelectTemplate(previewTemplate.id);
                                setPreviewTemplate(null);
                            }}
                            className="bg-primary-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30"
                        >
                            Use This Template
                        </button>
                        <button
                            onClick={() => setPreviewTemplate(null)}
                            className="absolute -top-5 -right-5 text-white bg-gray-600 rounded-full p-1 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
                            aria-label="Close preview"
                        >
                            <XCircleIcon className="w-8 h-8" />
                        </button>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
                .animate-scaleUp { animation: scaleUp 0.2s ease-out forwards; }
            `}</style>
        </>
    );
};

export default TemplateCarousel;