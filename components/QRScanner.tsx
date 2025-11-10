import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircleIcon, XCircleIcon, UserIcon, IdCardIcon, BuildingIcon, QrCodeIcon, UploadIcon } from './Icons';

interface ScannedData {
    id: string;
    name: string;
    org: string;
}

const QRScanner: React.FC = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [scannedData, setScannedData] = useState<ScannedData | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<'checked-in' | 'verified' | null>(null);
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getScanner = () => {
        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode('qr-reader', { verbose: false });
        }
        return scannerRef.current;
    };

    const startScanner = () => {
        Html5Qrcode.getCameras().then(cameras => {
            if (cameras && cameras.length) {
                const cameraId = cameras[0].id;
                const scanner = getScanner();
                
                scanner.start(
                    cameraId,
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 }
                    },
                    (decodedText, decodedResult) => {
                        handleScanSuccess(decodedText);
                    },
                    (error) => {
                        // on failure - do nothing, scanner continues
                    }
                ).then(() => {
                    setIsScanning(true);
                    setErrorMessage(null);
                    setScannedData(null);
                    setVerificationStatus(null);
                }).catch(err => {
                    setErrorMessage("Failed to start scanner. Please ensure camera permissions are granted.");
                    console.error(err);
                });
            } else {
                setErrorMessage("No cameras found on this device.");
            }
        }).catch(err => {
             setErrorMessage("Could not access camera. Please grant permission and refresh.");
        });
    };

    const stopScanner = () => {
        if (scannerRef.current && (scannerRef.current as any).isScanning) {
            scannerRef.current.stop().then(() => {
                setIsScanning(false);
            }).catch(err => {
                console.error("Failed to stop scanner:", err);
                setIsScanning(false); // Force state update even if stop fails
            });
        }
    };

    const handleFileScan = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        resetScanner();
        setIsProcessingFile(true);

        const scanner = getScanner();
        scanner.scanFile(file, false)
            .then(decodedText => {
                handleScanSuccess(decodedText);
            })
            .catch(err => {
                setErrorMessage("No QR code found in the uploaded image.");
            })
            .finally(() => {
                setIsProcessingFile(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            });
    };

    const handleScanSuccess = (decodedText: string) => {
        if (isScanning) {
            stopScanner();
        }
        try {
            const data: ScannedData = JSON.parse(decodedText);
            if (data.id && data.name && data.org) {
                setScannedData(data);
                setVerificationStatus('verified');
                setErrorMessage(null);
            } else {
                setErrorMessage("Invalid QR Code format.");
                setScannedData(null);
            }
        } catch (e) {
            setErrorMessage("Scanned QR Code does not contain valid data.");
            setScannedData(null);
        }
    };
    
    const handleVerificationAction = (action: 'checked-in') => {
        setVerificationStatus(action);
        setTimeout(() => {
            resetScanner();
        }, 2000);
    };

    const resetScanner = () => {
        setScannedData(null);
        setErrorMessage(null);
        setVerificationStatus(null);
        if (isScanning) {
            stopScanner();
        }
    };
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current && (scannerRef.current as any).isScanning) {
                scannerRef.current.stop().catch((err: any) => console.error("Cleanup stop failed", err));
            }
        };
    }, []);

    const showPlaceholder = !isScanning && !scannedData && !errorMessage && !isProcessingFile;

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col items-center justify-center">
                    <div id="qr-reader" className="w-full max-w-md border-4 border-slate-200 rounded-lg overflow-hidden"></div>
                     
                     {isProcessingFile && (
                        <div className="mt-6 flex flex-col items-center text-center p-8 border-2 border-dashed border-slate-300 rounded-lg w-full max-w-md">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                            <h3 className="text-lg font-semibold text-slate-700">Scanning Image...</h3>
                        </div>
                    )}
                    
                    {showPlaceholder && (
                         <div className="mt-6 flex flex-col items-center text-center p-8 border-2 border-dashed border-slate-300 rounded-lg w-full max-w-md">
                            <QrCodeIcon className="w-16 h-16 text-slate-400 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-700">Ready to Scan</h3>
                            <p className="text-slate-500 text-sm mt-1">Start your camera or upload an image to verify an ID card.</p>
                         </div>
                     )}
                     
                    <div className="mt-6">
                        {isScanning ? (
                            <button onClick={stopScanner} className="bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors flex items-center">
                                Stop Scanning
                            </button>
                        ) : !isProcessingFile && (
                            <div className="flex flex-col items-center gap-4">
                                <button onClick={startScanner} className="w-full max-w-xs bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center shadow-lg shadow-primary-500/30">
                                    Start Camera Scan
                                </button>
                                <div className="flex w-full max-w-xs items-center text-sm text-slate-500">
                                    <hr className="flex-grow border-slate-300" />
                                    <span className="px-2">OR</span>
                                    <hr className="flex-grow border-slate-300" />
                                </div>
                                <label htmlFor="qr-file-upload" className="w-full max-w-xs text-center bg-white border border-slate-300 text-slate-700 font-semibold py-3 px-6 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center">
                                    <UploadIcon className="w-5 h-5 mr-2" />
                                    Upload QR Code Image
                                    <input ref={fileInputRef} id="qr-file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileScan} />
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center min-h-[400px]">
                    {errorMessage && (
                        <div className="text-center animate-fadeIn">
                            <XCircleIcon className="w-16 h-16 text-danger mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-800">Scan Error</h3>
                            <p className="text-slate-500 mt-2">{errorMessage}</p>
                            <button onClick={resetScanner} className="mt-6 bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300">Try Again</button>
                        </div>
                    )}
                    {scannedData && verificationStatus === 'verified' && (
                         <div className="text-center w-full animate-fadeIn">
                            <div className="relative inline-block">
                                <div className="w-24 h-24 bg-success-100 rounded-full flex items-center justify-center">
                                    <CheckCircleIcon className="w-16 h-16 text-success-500" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mt-4">ID Verified</h3>
                            <div className="mt-6 text-left space-y-3 bg-white/60 p-6 rounded-xl shadow-inner-sm">
                                <div className="flex items-center">
                                    <UserIcon className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0"/>
                                    <div>
                                        <p className="text-xs text-slate-500">Name</p>
                                        <p className="font-semibold text-slate-700">{scannedData.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <IdCardIcon className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0"/>
                                    <div>
                                        <p className="text-xs text-slate-500">ID</p>
                                        <p className="font-semibold text-slate-700 font-mono">{scannedData.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <BuildingIcon className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0"/>
                                    <div>
                                        <p className="text-xs text-slate-500">Organization</p>
                                        <p className="font-semibold text-slate-700">{scannedData.org}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-center space-x-4">
                                 <button onClick={() => handleVerificationAction('checked-in')} className="bg-success-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-success-700 transition-transform hover:scale-105">Mark as Checked-in</button>
                                 <button onClick={resetScanner} className="bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 transition-colors">Scan Another</button>
                            </div>
                        </div>
                    )}
                    {verificationStatus === 'checked-in' && (
                        <div className="text-center animate-fadeIn">
                            <CheckCircleIcon className="w-16 h-16 text-success-500 mx-auto mb-4 animate-pulse" />
                            <h3 className="text-2xl font-bold text-slate-800 capitalize">Checked-In!</h3>
                            <p className="text-slate-500 mt-2">Action for <strong>{scannedData?.name}</strong> recorded successfully.</p>
                        </div>
                    )}
                    {!errorMessage && !scannedData && (
                        <div className="text-center">
                            <QrCodeIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-800">Awaiting Scan</h3>
                            <p className="text-slate-500 mt-2 max-w-xs">Point your camera at a QR code, or upload an image. The results will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QRScanner;