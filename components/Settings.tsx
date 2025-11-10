
import React, { useState } from 'react';
import { ALL_TEMPLATES, DUMMY_EVENT_PARTICIPANT, DUMMY_STUDENT } from '../constants';
import { TemplateDefinition, TemplateElement, IdData, Background, TextElement, ImageElement, QRCodeElement, FontWeight, TextAlign } from '../types';
import { SettingsIcon, ArrowLeftIcon, PlusCircleIcon, ModernIcon, ClassicIcon, MinimalIcon, CreativeIcon, IdCardIcon, ChevronDownIcon } from './Icons';
import CardPreview from './CardPreview';
// EmailTemplateManager is not used here but can be integrated in the 'main' view
// import EmailTemplateManager from './EmailTemplateManager';

type SettingsView = 'main' | 'template_manager' | 'template_editor';

const iconMap: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  modern: ModernIcon,
  classic: ClassicIcon,
  minimal: MinimalIcon,
  creative: CreativeIcon,
  'nandha-student': IdCardIcon,
};

const CollapsibleSection: React.FC<{title: string, children: React.ReactNode, defaultOpen?: boolean}> = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border border-slate-200 rounded-lg bg-white">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-t-lg">
                <h4 className="font-semibold text-sm text-slate-800">{title}</h4>
                <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-4 space-y-4">{children}</div>}
        </div>
    )
}

const TemplateEditor: React.FC<{
    template: TemplateDefinition;
    onSave: (updatedTemplate: TemplateDefinition) => void;
    onCancel: () => void;
}> = ({ template, onSave, onCancel }) => {
    const [editedTemplate, setEditedTemplate] = useState<TemplateDefinition>(template);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

    const handleTemplateChange = (field: keyof TemplateDefinition, value: any) => {
        setEditedTemplate(prev => ({ ...prev, [field]: value }));
    };
    
    const handleElementChange = (elementId: string, field: string, value: any) => {
        setEditedTemplate(prev => ({
            ...prev,
            elements: prev.elements.map(el => el.id === elementId ? ({ ...el, [field]: value } as TemplateElement) : el)
        }));
    };
    
    const selectedElement = editedTemplate.elements.find(el => el.id === selectedElementId);
    const previewData = editedTemplate.type === 'student' ? DUMMY_STUDENT : DUMMY_EVENT_PARTICIPANT;

    const addElement = (type: 'text' | 'image' | 'qr' | 'shape') => {
        let newElement: TemplateElement;
        const common = { id: `el-${Date.now()}`, x: 20, y: 20 };
        switch (type) {
            case 'text':
                newElement = { ...common, type: 'text', width: 200, height: 24, content: 'New Text', fontFamily: 'Inter', fontSize: 16, fontWeight: 'normal', color: '#000000', textAlign: 'left' };
                break;
            case 'image':
                newElement = { ...common, type: 'image', imageType: 'photo', width: 100, height: 100, objectFit: 'cover', borderRadius: 0 };
                break;
            case 'qr':
                 newElement = { ...common, type: 'qr', width: 80, height: 80, errorCorrectionLevel: 'M', margin: 1 };
                 break;
            case 'shape':
                newElement = { ...common, type: 'shape', width: 100, height: 50, backgroundColor: '#3b82f6', borderRadius: 0 };
                break;
        }
        setEditedTemplate(prev => ({ ...prev, elements: [...prev.elements, newElement] }));
        setSelectedElementId(newElement.id);
    };

    const inputStyle = "w-full bg-slate-100 border border-slate-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 transition";
    const labelStyle = "block text-xs font-medium text-slate-500 mb-1";

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <button onClick={onCancel} className="flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 mb-1">
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to Templates
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900">Template Editor</h2>
                </div>
                <button onClick={() => onSave(editedTemplate)} className="bg-primary-600 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-primary-700 transition-colors">
                    Save Template
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-center bg-slate-100 p-8 rounded-lg border-4 border-dashed border-slate-200 aspect-[1.6/1]">
                        <CardPreview data={previewData} template={editedTemplate} />
                    </div>
                </div>
                <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
                    <CollapsibleSection title="Template Settings">
                        <div>
                            <label className={labelStyle}>Template Name</label>
                            <input type="text" value={editedTemplate.name} onChange={e => handleTemplateChange('name', e.target.value)} className={inputStyle} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className={labelStyle}>Width (px)</label>
                                <input type="number" value={editedTemplate.width} onChange={e => handleTemplateChange('width', parseInt(e.target.value))} className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>Height (px)</label>
                                <input type="number" value={editedTemplate.height} onChange={e => handleTemplateChange('height', parseInt(e.target.value))} className={inputStyle} />
                            </div>
                        </div>
                    </CollapsibleSection>
                    
                    <CollapsibleSection title="Elements">
                       <div className="grid grid-cols-2 gap-2 mb-2">
                           <button onClick={() => addElement('text')} className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1.5 rounded-md text-slate-700 font-semibold">Add Text</button>
                           <button onClick={() => addElement('image')} className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1.5 rounded-md text-slate-700 font-semibold">Add Image</button>
                           <button onClick={() => addElement('qr')} className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1.5 rounded-md text-slate-700 font-semibold">Add QR</button>
                           <button onClick={() => addElement('shape')} className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1.5 rounded-md text-slate-700 font-semibold">Add Shape</button>
                       </div>
                       <div className="max-h-48 overflow-y-auto space-y-1 pr-2 -mr-2">
                        {editedTemplate.elements.map(el => (
                            <div key={el.id} onClick={() => setSelectedElementId(el.id)}
                                 className={`p-2 rounded-md text-sm cursor-pointer border ${selectedElementId === el.id ? 'bg-primary-100 text-primary-800 font-semibold border-primary-300' : 'hover:bg-slate-50 border-transparent'}`}>
                                {el.type === 'text' ? (el.content.length > 20 ? el.content.substring(0,20)+'...' : el.content) : `${el.type} (${(el as ImageElement).imageType || ''})`}
                            </div>
                        ))}
                       </div>
                    </CollapsibleSection>

                    {selectedElement && (
                        <div className="space-y-2">
                            <CollapsibleSection title="Position & Size">
                                <div className="grid grid-cols-2 gap-2">
                                    <div><label className={labelStyle}>X</label><input type="number" value={selectedElement.x} onChange={(e) => handleElementChange(selectedElement.id, 'x', parseInt(e.target.value))} className={inputStyle}/></div>
                                    <div><label className={labelStyle}>Y</label><input type="number" value={selectedElement.y} onChange={(e) => handleElementChange(selectedElement.id, 'y', parseInt(e.target.value))} className={inputStyle}/></div>
                                    {selectedElement.type === 'qr' ? (
                                        <div className="col-span-2">
                                            <label className={labelStyle}>Size</label>
                                            <input type="number" value={selectedElement.width} onChange={(e) => {
                                                const size = parseInt(e.target.value);
                                                handleElementChange(selectedElement.id, 'width', size);
                                                handleElementChange(selectedElement.id, 'height', size);
                                            }} className={inputStyle}/>
                                        </div>
                                    ) : (
                                        <>
                                            <div><label className={labelStyle}>Width</label><input type="number" value={selectedElement.width} onChange={(e) => handleElementChange(selectedElement.id, 'width', parseInt(e.target.value))} className={inputStyle}/></div>
                                            <div><label className={labelStyle}>Height</label><input type="number" value={selectedElement.height} onChange={(e) => handleElementChange(selectedElement.id, 'height', parseInt(e.target.value))} className={inputStyle}/></div>
                                        </>
                                    )}
                                </div>
                            </CollapsibleSection>
                            {selectedElement.type === 'text' && (
                                <CollapsibleSection title="Text Properties" defaultOpen={false}>
                                    <div><label className={labelStyle}>Content</label><input type="text" value={(selectedElement as TextElement).content} onChange={(e) => handleElementChange(selectedElement.id, 'content', e.target.value)} className={inputStyle}/></div>
                                    <div><label className={labelStyle}>Color</label><input type="color" value={(selectedElement as TextElement).color} onChange={(e) => handleElementChange(selectedElement.id, 'color', e.target.value)} className="w-full h-8 p-1 border border-slate-300 rounded"/></div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className={labelStyle}>Font Size</label><input type="number" value={(selectedElement as TextElement).fontSize} onChange={(e) => handleElementChange(selectedElement.id, 'fontSize', parseInt(e.target.value))} className={inputStyle}/></div>
                                        <div><label className={labelStyle}>Font Weight</label><input type="text" value={(selectedElement as TextElement).fontWeight} onChange={(e) => handleElementChange(selectedElement.id, 'fontWeight', e.target.value as FontWeight)} className={inputStyle}/></div>
                                        <div><label className={labelStyle}>Font Family</label><input type="text" value={(selectedElement as TextElement).fontFamily} onChange={(e) => handleElementChange(selectedElement.id, 'fontFamily', e.target.value)} className={inputStyle}/></div>
                                        <div>
                                          <label className={labelStyle}>Align</label>
                                          <select value={(selectedElement as TextElement).textAlign} onChange={(e) => handleElementChange(selectedElement.id, 'textAlign', e.target.value as TextAlign)} className={inputStyle}>
                                            <option value="left">Left</option>
                                            <option value="center">Center</option>
                                            <option value="right">Right</option>
                                          </select>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            )}
                             {selectedElement.type === 'image' && (
                                <CollapsibleSection title="Image Properties" defaultOpen={false}>
                                    <div>
                                        <label className={labelStyle}>Image Type</label>
                                        <select value={(selectedElement as ImageElement).imageType} onChange={(e) => handleElementChange(selectedElement.id, 'imageType', e.target.value)} className={inputStyle}>
                                            <option value="photo">Photo</option>
                                            <option value="logo">Logo</option>
                                            <option value="signature">Signature</option>
                                        </select>
                                    </div>
                                    <div><label className={labelStyle}>Border Radius (px)</label><input type="number" value={(selectedElement as ImageElement).borderRadius || 0} onChange={(e) => handleElementChange(selectedElement.id, 'borderRadius', parseInt(e.target.value))} className={inputStyle}/></div>
                                </CollapsibleSection>
                            )}
                            {selectedElement.type === 'qr' && (
                                <CollapsibleSection title="QR Code Properties" defaultOpen={false}>
                                    <div>
                                        <label className={labelStyle}>Error Correction</label>
                                        <select value={(selectedElement as QRCodeElement).errorCorrectionLevel || 'M'} onChange={(e) => handleElementChange(selectedElement.id, 'errorCorrectionLevel', e.target.value)} className={inputStyle}>
                                            <option value="L">Low (L)</option>
                                            <option value="M">Medium (M)</option>
                                            <option value="Q">Quartile (Q)</option>
                                            <option value="H">High (H)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Margin (Quiet Zone)</label>
                                        <input type="number" min="0" max="10" value={(selectedElement as QRCodeElement).margin ?? 1} onChange={(e) => handleElementChange(selectedElement.id, 'margin', parseInt(e.target.value))} className={inputStyle}/>
                                    </div>
                                </CollapsibleSection>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TemplateManager: React.FC<{
    onEdit: (templateId: string) => void;
    onBack: () => void;
}> = ({ onEdit, onBack }) => {
    const [templates, setTemplates] = useState<TemplateDefinition[]>(ALL_TEMPLATES);

    const handleDuplicate = (templateId: string) => {
        const templateToDuplicate = templates.find(t => t.id === templateId);
        if (templateToDuplicate) {
            const newTemplate: TemplateDefinition = {
                ...templateToDuplicate,
                id: `copy-${Date.now()}`,
                name: `${templateToDuplicate.name} (Copy)`,
            };
            setTemplates(prev => [...prev, newTemplate]);
        }
    };

    const handleDelete = (templateId: string) => {
        if (confirm('Are you sure you want to delete this template?')) {
            setTemplates(prev => prev.filter(t => t.id !== templateId));
        }
    };

    return (
        <div>
             <button onClick={onBack} className="flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 mb-6">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Settings
            </button>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">ID Card Template Management</h2>
                    <p className="text-slate-500 mt-1">Create, edit, and manage your ID card designs.</p>
                </div>
                <button onClick={() => onEdit('new')} className="bg-primary-600 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-primary-700 transition-colors flex items-center">
                   <PlusCircleIcon className="w-5 h-5 mr-2" />
                    Create New Template
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                    <div key={template.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group transition-all hover:shadow-lg hover:-translate-y-1">
                        <div className="p-4 bg-slate-50 flex items-center justify-center">
                            <div className="transform scale-50 -m-16">
                                <CardPreview data={template.type === 'student' ? DUMMY_STUDENT : DUMMY_EVENT_PARTICIPANT} template={template} />
                            </div>
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-slate-800">{template.name}</h4>
                            <p className="text-sm text-slate-500 capitalize">{template.type} Template</p>
                            <div className="flex space-x-2 mt-4">
                                <button onClick={() => onEdit(template.id)} className="text-sm font-semibold text-primary-600 hover:underline">Edit</button>
                                <button onClick={() => handleDuplicate(template.id)} className="text-sm font-semibold text-primary-600 hover:underline">Duplicate</button>
                                <button onClick={() => handleDelete(template.id)} className="text-sm font-semibold text-red-600 hover:underline">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Settings: React.FC = () => {
    const [view, setView] = useState<SettingsView>('main');
    const [allTemplates, setAllTemplates] = useState<TemplateDefinition[]>(ALL_TEMPLATES);
    const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

    const handleEditTemplate = (templateId: string) => {
        setEditingTemplateId(templateId);
        setView('template_editor');
    };

    const handleSaveTemplate = (updatedTemplate: TemplateDefinition) => {
        if (editingTemplateId === 'new') {
            setAllTemplates(prev => [...prev, { ...updatedTemplate, id: `custom-${Date.now()}` }]);
        } else {
            setAllTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
        }
        setView('template_manager');
    };

    const renderView = () => {
        switch (view) {
            case 'template_editor':
                const templateToEdit = editingTemplateId === 'new'
                    ? { id: 'new', name: 'New Event Template', type: 'event', width: 350, height: 520, category: 'neutral', icon: ModernIcon, background: { type: 'solid', color: '#ffffff' }, elements: [] } as TemplateDefinition
                    : allTemplates.find(t => t.id === editingTemplateId)!;

                return <TemplateEditor template={templateToEdit} onSave={handleSaveTemplate} onCancel={() => setView('template_manager')} />;
            
            case 'template_manager':
                return <TemplateManager onEdit={handleEditTemplate} onBack={() => setView('main')} />;

            case 'main':
            default:
                return (
                     <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">System Settings</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div onClick={() => setView('template_manager')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-primary-300 cursor-pointer transition-all">
                                <SettingsIcon className="w-8 h-8 text-primary-500 mb-3" />
                                <h3 className="text-lg font-bold text-slate-800">ID Card Templates</h3>
                                <p className="text-slate-500 mt-1 text-sm">Manage the design and layout of all ID cards.</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-not-allowed opacity-60">
                                <SettingsIcon className="w-8 h-8 text-slate-400 mb-3" />
                                <h3 className="text-lg font-bold text-slate-800">Email Templates</h3>
                                <p className="text-slate-500 mt-1 text-sm">Customize system-generated emails (coming soon).</p>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="p-0">
           {renderView()}
        </div>
    );
};

export default Settings;