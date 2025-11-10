
import React, { useState, useRef, useEffect } from 'react';
import { UploadIcon, DownloadIcon, CheckCircleIcon, XCircleIcon, UserIcon } from './Icons';
import { EventIdData, StudentIdData, IdData, TemplateDefinition } from '../types';
import CardPreview from './CardPreview';
import * as htmlToImage from 'html-to-image';
import JSZip from 'jszip';
import jsPDF from 'jspdf';
import { generateTagline, enhancePhoto } from '../services/geminiService';
import { ALL_TEMPLATES, DUMMY_EVENT_PARTICIPANT, DUMMY_STUDENT } from '../constants';

type IdType = 'event' | 'student';

const parseCSV = (csvText: string, idType: IdType): (IdData | null)[] => {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, ''));
    const headerIndices: { [key: string]: number } = {};

    let requiredHeaders: string[];
    let optionalHeaders: string[];

    if (idType === 'event') {
        requiredHeaders = ['name', 'role', 'eventname', 'eventdate'];
        optionalHeaders = ['photourl', 'tagline', 'participantid'];
    } else { // student
        requiredHeaders = ['name', 'regno', 'dept'];
        optionalHeaders = ['gender', 'address', 'dob', 'phone', 'bloodgroup', 'photourl'];
    }

    requiredHeaders.forEach(header => {
        const index = headers.indexOf(header);
        if (index === -1) throw new Error(`CSV file is missing required header for ${idType} ID: '${header}'.`);
        headerIndices[header] = index;
    });

    optionalHeaders.forEach(header => {
        const index = headers.indexOf(header);
        if (index !== -1) headerIndices[header] = index;
    });

    return lines.slice(1).map((line, i) => {
        const values = line.split(',');
        if (values.length === 1 && values[0] === '') return null; // Skip empty lines

        if (idType === 'event') {
            return {
                name: values[headerIndices['name']]?.trim() || 'N/A',
                role: values[headerIndices['role']]?.trim() || 'N/A',
                eventName: values[headerIndices['eventname']]?.trim() || 'N/A',
                eventDate: values[headerIndices['eventdate']]?.trim() || 'N/A',
                photoURL: values[headerIndices['photourl']]?.trim() || undefined,
                tagline: values[headerIndices['tagline']]?.trim() || 'Innovate. Create. Inspire.',
                participantId: values[headerIndices['participantid']]?.trim() || `P-${Date.now()}-${i}`,
                photo: null,
            } as EventIdData;
        } else { // student
            return {
                name: values[headerIndices['name']]?.trim() || 'N/A',
                regNo: values[headerIndices['regno']]?.trim() || 'N/A',
                dept: values[headerIndices['dept']]?.trim() || 'N/A',
                gender: values[headerIndices['gender']]?.trim() || '',
                address: values[headerIndices['address']]?.trim() || '',
                dob: values[headerIndices['dob']]?.trim() || '',
                phone: values[headerIndices['phone']]?.trim() || '',
                bloodGroup: values[headerIndices['bloodgroup']]?.trim() || '',
                photoURL: values[headerIndices['photourl']]?.trim() || undefined,
                photo: null,
                logo: DUMMY_STUDENT.logo,
                signature: DUMMY_STUDENT.signature,
            } as StudentIdData;
        }
    });
};

const urlToDataUrl = async (url: string): Promise<string | null> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`Failed to fetch image from ${url}: ${response.status} ${response.statusText}`);
            return null;
        }
        const blob = await response.blob();
        if (!blob.type.startsWith('image/')) {
            console.warn(`URL did not point to an image: ${url}. MIME type: ${blob.type}`);
            return null;
        }
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = (error) => {
                console.error(`FileReader error for blob from ${url}:`, error);
                reject(error);
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.warn(`Error fetching image from ${url}:`, error);
        return null;
    }
};

const generatePlaceholder = (name: string, bgColor: string, randomize: boolean): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    if (randomize) {
        const colors = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80', '#34d399', '#22d3ee', '#60a5fa', '#818cf8', '#c084fc'];
        const colorIndex = (name.charCodeAt(0) || 0) % colors.length;
        ctx.fillStyle = colors[colorIndex];
    } else {
        ctx.fillStyle = bgColor;
    }
    
    ctx.fillRect(0, 0, 200, 200);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    ctx.fillText(initials, 100, 105);

    return canvas.toDataURL('image/png');
};


const BulkUpload: React.FC = () => {
    const [idType, setIdType] = useState<IdType>('event');
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<IdData[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('modern');
    const [aiGenerateTaglines, setAiGenerateTaglines] = useState(false);
    const [aiEnhancePhotos, setAiEnhancePhotos] = useState(false);
    const [outputFormat, setOutputFormat] = useState<'zip' | 'pdf'>('zip');
    const [step, setStep] = useState(1);
    const [placeholderColor, setPlaceholderColor] = useState('#60a5fa');
    const [randomizePlaceholderColor, setRandomizePlaceholderColor] = useState(true);

    const cardRef = useRef<HTMLDivElement>(null);
    const [cardToRender, setCardToRender] = useState<IdData | null>(null);

    const resetState = (resetType = true) => {
        setFile(null);
        setParsedData([]);
        setError(null);
        setIsProcessing(false);
        setProgress(0);
        setStatusMessage('');
        if (resetType) {
            setIdType('event');
            setSelectedTemplateId('modern');
        }
        setAiGenerateTaglines(false);
        setAiEnhancePhotos(false);
        setOutputFormat('zip');
        setStep(1);
    };

    useEffect(() => {
        resetState(false);
        setSelectedTemplateId(idType === 'student' ? 'nandha-student' : 'modern');
    }, [idType]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            resetState(false);
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const text = event.target?.result as string;
                    const data = parseCSV(text, idType).filter((item): item is IdData => item !== null);
                    if (data.length === 0) {
                        setError("No valid data rows found in the CSV file.");
                        return;
                    }
                    setParsedData(data);
                    setStep(2);

                    data.forEach(async (participant, index) => {
                        const photoURL = 'photoURL' in participant ? participant.photoURL : undefined;
                        let photoDataUrl: string | null = null;
                        if (photoURL) {
                            photoDataUrl = await urlToDataUrl(photoURL);
                        }
                        if (!photoDataUrl) {
                            photoDataUrl = generatePlaceholder(participant.name, placeholderColor, randomizePlaceholderColor);
                        }
                        
                        setParsedData(prev => {
                            const newData = [...prev];
                            if (newData[index]) {
                                newData[index].photo = photoDataUrl;
                            }
                            return newData;
                        });
                    });
                } catch (err: any) {
                    setError(err.message);
                    setFile(null);
                    setParsedData([]);
                    setStep(1);
                }
            };
            reader.readAsText(selectedFile);
        }
    };
    
    const handlePhotoReplace = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const photoDataUrl = event.target?.result as string;
                setParsedData(prev => {
                    const newData = [...prev];
                    newData[index].photo = photoDataUrl;
                    return newData;
                });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

     const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        setPlaceholderColor(newColor);
        setParsedData(prevData =>
            prevData.map(participant => {
                const hasPhotoUrl = 'photoURL' in participant && participant.photoURL;
                if (!hasPhotoUrl) {
                    return { ...participant, photo: generatePlaceholder(participant.name, newColor, false) };
                }
                return participant;
            })
        );
    };

    const handleRandomizeCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newRandomize = e.target.checked;
        setRandomizePlaceholderColor(newRandomize);
        setParsedData(prevData =>
            prevData.map(participant => {
                const hasPhotoUrl = 'photoURL' in participant && participant.photoURL;
                if (!hasPhotoUrl) {
                    return { ...participant, photo: generatePlaceholder(participant.name, placeholderColor, newRandomize) };
                }
                return participant;
            })
        );
    };

    const handleGenerateAndDownload = async () => {
        if (!parsedData.length) return;
        setIsProcessing(true);
        setProgress(0);
        setError(null);
        
        let processedData: IdData[] = parsedData.map(d => ({ ...d, templateId: selectedTemplateId }));
        const totalRecords = processedData.length;

        const useTaglines = aiGenerateTaglines && idType === 'event';
        const stepWeights = {
            generateTaglines: useTaglines ? 40 : 0,
            enhancePhotos: aiEnhancePhotos ? 40 : 0,
            generateCards: 20,
        };
        const totalWeight = Object.values(stepWeights).reduce((a, b) => a + b, 0);
        let progressOffset = 0;

        if (useTaglines) {
            setStatusMessage('Generating AI taglines...');
            const generateTaglinesWeight = (stepWeights.generateTaglines / totalWeight) * 100;
            for (let i = 0; i < totalRecords; i++) {
                try {
                    const eventData = processedData[i] as EventIdData;
                    processedData[i] = { ...eventData, tagline: await generateTagline(eventData.role, eventData.eventName)};
                } catch (err) { console.warn(`Failed to generate tagline for ${processedData[i].name}.`); }
                setProgress(progressOffset + (((i + 1) / totalRecords) * generateTaglinesWeight));
            }
            progressOffset += generateTaglinesWeight;
        }

        if (aiEnhancePhotos) {
            setStatusMessage('Enhancing photos...');
            const enhancePhotosWeight = (stepWeights.enhancePhotos / totalWeight) * 100;
            for (let i = 0; i < totalRecords; i++) {
                if (processedData[i].photo) {
                    try {
                        processedData[i].photo = await enhancePhoto(processedData[i].photo!);
                    } catch (err) { console.warn(`Failed to enhance photo for ${processedData[i].name}.`); }
                }
                setProgress(progressOffset + (((i + 1) / totalRecords) * enhancePhotosWeight));
            }
            progressOffset += enhancePhotosWeight;
        }

        setStatusMessage('Creating ID cards...');
        const cardImages: string[] = [];
        const generateCardsWeight = (stepWeights.generateCards / totalWeight) * 100;
        try {
            for (let i = 0; i < totalRecords; i++) {
                setCardToRender(processedData[i]);
                // A short delay to allow React to re-render the component with new data.
                await new Promise(resolve => setTimeout(resolve, 50));

                if (cardRef.current) {
                    // Wait for all images inside the card preview to load before capturing.
                    // This is crucial for externally loaded images like QR codes.
                    const images = Array.from(cardRef.current.getElementsByTagName('img'));
                    // fix: Explicitly type `img` as HTMLImageElement to resolve properties like 'complete', 'onload', and 'onerror'.
                    const imageLoadPromises = images.map((img: HTMLImageElement) => {
                        if (img.complete) {
                            return Promise.resolve();
                        }
                        return new Promise<void>(resolve => {
                            img.onload = () => resolve();
                            img.onerror = () => {
                                console.warn(`Could not load image: ${img.src}`);
                                resolve(); // Resolve on error to avoid halting the entire process.
                            };
                        });
                    });

                    await Promise.all(imageLoadPromises);
                    
                    // Add a tiny extra delay for rendering post-load, just in case.
                    await new Promise(resolve => setTimeout(resolve, 20));
                    
                    const dataUrl = await htmlToImage.toPng(cardRef.current, { quality: 1, pixelRatio: 2 });
                    cardImages.push(dataUrl);
                }
                setProgress(progressOffset + (((i + 1) / totalRecords) * generateCardsWeight));
            }
            
            setStatusMessage('Packaging files...');
            const availableTemplates = ALL_TEMPLATES.filter(t => t.type === idType);
            const template = ALL_TEMPLATES.find(t => t.id === selectedTemplateId) || availableTemplates[0];

            if (outputFormat === 'zip') {
                const zip = new JSZip();
                for (let i = 0; i < cardImages.length; i++) {
                    const dataUrl = cardImages[i];
                    const blob = await (await fetch(dataUrl)).blob();
                    const fileName = `${processedData[i].name.replace(/\s/g, '_')}.png`;
                    zip.file(fileName, blob);
                }
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(zipBlob);
                link.download = `Generated_${idType}_IDs.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else { // PDF generation
                const cardWidthMM = template.width * 0.264583;
                const cardHeightMM = template.height * 0.264583;
                const doc = new jsPDF({ orientation: cardWidthMM > cardHeightMM ? 'l' : 'p', unit: 'mm', format: [cardWidthMM, cardHeightMM] });
                
                cardImages.forEach((dataUrl, index) => {
                    if (index > 0) doc.addPage();
                    doc.addImage(dataUrl, 'PNG', 0, 0, cardWidthMM, cardHeightMM);
                });
                doc.save(`Generated_${idType}_IDs.pdf`);
            }
            setStatusMessage('Download complete!');
        } catch (err) {
            setError('An error occurred while generating the files.');
            console.error(err);
        } finally {
            setIsProcessing(false);
            setCardToRender(null);
        }
    };
    
    const StepCard: React.FC<{ number: number; title: string; children: React.ReactNode; active?: boolean; done?: boolean;}> = ({ number, title, children, active = false, done = false }) => (
        <div className={`transition-all duration-500 ${active ? 'opacity-100' : 'opacity-60'}`}>
            <div className={`p-8 rounded-2xl border ${active ? 'bg-white shadow-lg border-primary-200' : 'bg-slate-50 border-slate-200'}`}>
                <h3 className={`text-xl font-bold mb-6 flex items-center ${active ? 'text-slate-900' : 'text-slate-500'}`}>
                    <span className={`mr-4 inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                        done ? 'bg-success-500 text-white' :
                        active ? 'bg-primary-500 text-white ring-4 ring-primary-100' : 'bg-slate-200 text-slate-500'
                    }`}>
                        {done ? '✓' : number}
                    </span>
                    {title}
                </h3>
                {active && <div className="pl-12 animate-fadeIn">{children}</div>}
            </div>
        </div>
    );

  const arePhotosLoading = parsedData.some(p => 'photoURL' in p && p.photoURL && typeof p.photo === 'undefined');
  const availableTemplates = ALL_TEMPLATES.filter(t => t.type === idType);
  const selectedTemplate = ALL_TEMPLATES.find(t => t.id === selectedTemplateId) || availableTemplates[0];
  const previewData = idType === 'student' ? DUMMY_STUDENT : DUMMY_EVENT_PARTICIPANT;

  const eventCSVTemplate = "data:text/csv;charset=utf-8,name,role,eventName,eventDate,photoURL,tagline,participantId%0APriya%20Sharma,Participant,TechFest%202025,2025-12-05,https://i.imgur.com/8b23K1b.jpg,Innovate%20and%20Inspire,TFP-12345";
  const studentCSVTemplate = "data:text/csv;charset=utf-8,name,regNo,dept,gender,address,dob,phone,bloodGroup,photoURL%0AAAKASH,23CS067,CSE,M,Chennai%20-%20Tamil%20Nadu,26-12-2004,953514874,O%2B,https://i.imgur.com/O9aDoT6.jpg";

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm sticky top-8">
            <h3 className="text-xl font-bold mb-6 text-slate-900">Bulk Generation Guide</h3>
             <div className="mb-6">
                <label className="text-sm font-medium text-slate-700">Select ID Type</label>
                <fieldset className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                    <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="idType" value="event" checked={idType === 'event'} onChange={() => setIdType('event')} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300"/> <span className="text-sm text-slate-600">Event IDs</span></label>
                    <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="idType" value="student" checked={idType === 'student'} onChange={() => setIdType('student')} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300"/> <span className="text-sm text-slate-600">Student IDs</span></label>
                </fieldset>
            </div>
            <div className="space-y-6">
                <div>
                    <h4 className="font-semibold text-slate-700">1. Download Template</h4>
                    <p className="text-sm text-slate-500 mt-2">Download the CSV template for <strong>{idType} IDs</strong>. This ensures you have the correct columns.</p>
                     <a href={idType === 'event' ? eventCSVTemplate : studentCSVTemplate}
                       download={`${idType}_bulk_upload_template.csv`}
                       className="mt-4 inline-block w-full text-center bg-slate-100 text-slate-700 font-semibold py-3 px-4 rounded-lg hover:bg-slate-200 transition-colors">
                        Download {idType === 'event' ? 'Event' : 'Student'} CSV Template
                    </a>
                </div>
              <div>
                <h4 className="font-semibold text-slate-700">2. CSV File Requirements</h4>
                <p className="text-sm text-slate-500 mt-2">Required headers:</p>
                <code className="block bg-slate-100 text-slate-800 p-2 rounded-md text-xs mt-2 break-all">
                    {idType === 'event' ? 'name, role, eventName, eventDate' : 'name, regNo, dept'}
                </code>
                 <p className="text-sm text-slate-500 mt-2">Optional headers:</p>
                 <code className="block bg-slate-100 text-slate-800 p-2 rounded-md text-xs mt-2 break-all">
                    {idType === 'event' ? 'photoURL, tagline, participantId' : 'gender, address, dob, phone, bloodGroup, photoURL'}
                 </code>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700">3. Using Image URLs</h4>
                <p className="text-sm text-slate-500 mt-2">If you use the <code className="text-xs bg-slate-100 p-1 rounded">photoURL</code> column, ensure links are public. The app will fetch them, or generate a placeholder if a URL is missing or invalid.</p>
              </div>
            </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
            <StepCard number={1} title="Upload CSV File" active={step === 1} done={step > 1}>
                <div className="mt-1 relative block w-full border-2 border-slate-300 border-dashed rounded-lg p-12 text-center hover:border-primary-400 transition-colors">
                    <UploadIcon className="mx-auto h-12 w-12 text-slate-400" />
                    <span className="mt-2 block text-sm font-medium text-slate-900">
                        <label htmlFor="file-upload" className="relative cursor-pointer font-semibold text-primary-600 hover:text-primary-500">
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv" />
                        </label>
                        {' '}or drag and drop
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">CSV for {idType} IDs</span>
                </div>
                {error && (<div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md"><div className="flex"><XCircleIcon className="h-5 w-5 text-red-500 mr-3"/><div><p className="font-bold">Error</p><p>{error}</p></div></div></div>)}
                 {step > 1 && file && !error && (<div className="mt-4 bg-success-50 border-l-4 border-success-500 text-success-700 p-4 rounded-md"><div className="flex"><CheckCircleIcon className="h-5 w-5 text-success-500 mr-3"/><div><p className="font-bold">File Loaded: {file.name}</p><p>Found {parsedData.length} valid records.</p></div></div></div>)}
            </StepCard>
            
            <StepCard number={2} title="Review Data & Photos" active={step === 2} done={step > 2}>
                <div className="mb-6 p-4 bg-slate-100 rounded-lg border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-3">Placeholder Customization</h4>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                        <label htmlFor="randomize-color" className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                id="randomize-color"
                                checked={randomizePlaceholderColor}
                                onChange={handleRandomizeCheckboxChange}
                                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-slate-700">Randomize background color</span>
                        </label>
                        <div className="flex items-center space-x-2">
                            <label htmlFor="placeholder-color" className={`text-sm text-slate-700 transition-opacity ${randomizePlaceholderColor ? 'opacity-50' : ''}`}>
                                Background color:
                            </label>
                            <input
                                type="color"
                                id="placeholder-color"
                                value={placeholderColor}
                                onChange={handleColorInputChange}
                                disabled={randomizePlaceholderColor}
                                className={`w-24 h-8 p-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${randomizePlaceholderColor ? 'border-slate-200' : 'border-slate-300'}`}
                            />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3">Changes apply to generated placeholders. Manually replaced photos for entries without a photo URL will also be updated.</p>
                </div>

                <p className="text-sm text-slate-500 mb-4">We've loaded photos from URLs or generated placeholders. Review and replace if needed.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                    {parsedData.map((participant, index) => (
                        <div key={index} className="bg-white p-2 rounded-lg shadow-sm border flex flex-col">
                             <div className="w-full aspect-square bg-slate-200 rounded-md mb-2 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {('photoURL' in participant && participant.photoURL) && typeof participant.photo === 'undefined' && (<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>)}
                                {participant.photo && (<img src={participant.photo} alt={participant.name} className="w-full h-full object-cover" />)}
                                {!('photoURL' in participant && participant.photoURL) && !participant.photo && (<UserIcon className="w-10 h-10 text-slate-400" />)}
                                {('photoURL' in participant && participant.photoURL) && participant.photo === null && (<XCircleIcon className="w-10 h-10 text-danger" />)}
                            </div>
                            <p className="text-xs font-semibold truncate text-center mb-1 text-slate-700">{participant.name}</p>
                            <label htmlFor={`photo-replace-${index}`} className="mt-auto text-center w-full block text-xs font-medium text-primary-600 hover:text-primary-500 cursor-pointer">Replace <input id={`photo-replace-${index}`} type="file" className="sr-only" onChange={(e) => handlePhotoReplace(index, e)} accept="image/*" /></label>
                        </div>
                    ))}
                </div>
                <div className="flex justify-start items-center mt-6 gap-4">
                    <button onClick={() => setStep(3)} disabled={arePhotosLoading} className="bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors flex items-center shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed">Confirm & Continue</button>
                    {arePhotosLoading && <p className="text-sm text-slate-500">Loading photos...</p>}
                </div>
            </StepCard>

            <StepCard number={3} title="Select ID Card Template" active={step === 3} done={step > 3}>
                <div className="flex space-x-4 overflow-x-auto py-4 -mx-4 px-4">
                    {availableTemplates.map((template) => (
                        <div key={template.id} onClick={() => setSelectedTemplateId(template.id)} className="cursor-pointer flex-shrink-0 group">
                            <div className={`w-44 p-1.5 rounded-xl border-4 transition-all ${selectedTemplateId === template.id ? 'border-primary-500 shadow-lg' : 'border-transparent group-hover:border-slate-200'}`}>
                               <div className="w-full h-72 transform scale-[0.4] origin-top-left -mb-40 pointer-events-none">
                                  <CardPreview data={previewData} template={template} />
                               </div>
                               <div className="bg-slate-50 text-slate-800 text-center py-2 px-3 rounded-lg mt-1 group-hover:bg-slate-100 transition">
                                   <div className="flex items-center justify-center space-x-2"><template.icon className="w-4 h-4" /><span className="text-xs font-semibold">{template.name}</span></div>
                               </div>
                            </div>
                        </div>
                    ))}
                </div>
                 <button onClick={() => setStep(4)} className="mt-6 bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors flex items-center shadow-lg shadow-primary-500/30">Continue</button>
            </StepCard>

            <StepCard number={4} title="AI Enhancements (Optional)" active={step === 4} done={step > 4}>
                <div className="space-y-4">
                    {idType === 'event' && (
                        <label htmlFor="ai-taglines" className="flex items-center p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" id="ai-taglines" checked={aiGenerateTaglines} onChange={(e) => setAiGenerateTaglines(e.target.checked)} className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"/>
                            <span className="ml-3 text-sm font-medium text-slate-700">Generate AI Taglines<p className="text-xs text-slate-500 font-normal">Automatically create a unique tagline for each participant.</p></span>
                        </label>
                    )}
                    <label htmlFor="ai-photos" className="flex items-center p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                        <input type="checkbox" id="ai-photos" checked={aiEnhancePhotos} onChange={(e) => setAiEnhancePhotos(e.target.checked)} className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"/>
                        <span className="ml-3 text-sm font-medium text-slate-700">Enhance All Photos with AI<p className="text-xs text-slate-500 font-normal">Improve lighting and sharpness for a professional look.</p></span>
                    </label>
                </div>
                 <button onClick={() => setStep(5)} className="mt-6 bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors flex items-center shadow-lg shadow-primary-500/30">Continue to Download</button>
            </StepCard>

            <StepCard number={5} title="Generate & Download" active={step === 5}>
                <div className="mb-6">
                    <label className="text-sm font-medium text-slate-700">Select Output Format</label>
                    <fieldset className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                        <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="outputFormat" value="zip" checked={outputFormat === 'zip'} onChange={() => setOutputFormat('zip')} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300"/> <span className="text-sm text-slate-600">ZIP (PNG Images)</span></label>
                        <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="outputFormat" value="pdf" checked={outputFormat === 'pdf'} onChange={() => setOutputFormat('pdf')} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300"/> <span className="text-sm text-slate-600">PDF (Single File)</span></label>
                    </fieldset>
                </div>
                <p className="text-sm text-slate-500 mb-4">This will generate {parsedData.length} ID cards and download them as a single {outputFormat.toUpperCase()} file.</p>
                {isProcessing && (<div className="mt-6 mb-4"><p className="text-sm font-medium text-slate-700">{statusMessage} {Math.round(progress)}%</p><div className="w-full bg-slate-200 rounded-full h-2.5 mt-2"><div className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div></div></div>)}
                <div className="flex justify-start space-x-4">
                    <button onClick={handleGenerateAndDownload} disabled={parsedData.length === 0 || isProcessing || !!error} className="bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30"><DownloadIcon className="w-5 h-5 mr-2"/>{isProcessing ? 'Generating...' : `Generate as ${outputFormat.toUpperCase()}`}</button>
                    <button onClick={() => resetState()} className="bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors">Start Over</button>
                </div>
            </StepCard>

        </div>
      </div>
      
      {cardToRender && (
          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
              <div ref={cardRef}>
                  <CardPreview data={cardToRender} template={selectedTemplate} />
              </div>
          </div>
      )}
    </>
  );
};

export default BulkUpload;
