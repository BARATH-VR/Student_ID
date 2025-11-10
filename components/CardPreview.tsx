import React from 'react';
import { IdData, StudentIdData, EventIdData, TemplateDefinition, TemplateElement, TextElement, ImageElement, ShapeElement, QRCodeElement } from '../types';
import { UserIcon, BuildingIcon } from './Icons';

const isStudent = (data: IdData): data is StudentIdData => {
    return 'regNo' in data;
};

const createQrCodeUrl = (element: QRCodeElement, data: IdData): string => {
    const qrDataObject = {
        id: isStudent(data) ? data.regNo : data.participantId,
        name: data.name,
        org: isStudent(data) ? data.organization : data.organization,
    };
    const encodedData = encodeURIComponent(JSON.stringify(qrDataObject));
    const size = element.width;
    const errorCorrection = element.errorCorrectionLevel || 'M';
    const margin = element.margin ?? 1;

    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}&ecc=${errorCorrection}&margin=${margin}`;
};

const getDynamicValue = (data: IdData, key: string): string | null => {
    const typedData = data as any;
    if (key in typedData) {
        if (key === 'eventDate' && typedData[key]) {
             try {
                return new Date(typedData[key] + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                });
             } catch (e) { return typedData[key]; }
        }
        return typedData[key];
    }
    return null;
};

const renderElement = (element: TemplateElement, data: IdData): React.ReactNode => {
    const style: React.CSSProperties = {
        position: 'absolute',
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
    };

    switch (element.type) {
        case 'text':
            const textElement = element as TextElement;
            const content = textElement.content.replace(/\{(\w+)\}/g, (match, key) => {
                return getDynamicValue(data, key) || match;
            });
            return (
                <div style={{
                    ...style,
                    fontFamily: textElement.fontFamily,
                    fontSize: `${textElement.fontSize}px`,
                    fontWeight: textElement.fontWeight,
                    color: textElement.color,
                    textAlign: textElement.textAlign,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                }}>
                    {content}
                </div>
            );
        case 'image':
            const imageElement = element as ImageElement;
            const src = getDynamicValue(data, imageElement.imageType) as string | null;
            if (!src) return <div style={style} className="bg-gray-200 flex items-center justify-center"><UserIcon className="w-1/2 h-1/2 text-gray-400" /></div>;
            return (
                <img src={src} alt={imageElement.imageType} style={{
                    ...style,
                    objectFit: imageElement.objectFit,
                    borderRadius: imageElement.borderRadius ? `${imageElement.borderRadius}px` : undefined,
                    borderWidth: imageElement.borderWidth ? `${imageElement.borderWidth}px` : undefined,
                    borderColor: imageElement.borderColor,
                    borderStyle: imageElement.borderWidth ? 'solid' : undefined,
                }} />
            );
        case 'qr':
            const qrElement = element as QRCodeElement;
            return <img src={createQrCodeUrl(qrElement, data)} alt="QR Code" style={style} />;
        case 'shape':
            const shapeElement = element as ShapeElement;
             return (
                <div style={{
                    ...style,
                    backgroundColor: shapeElement.backgroundColor,
                    borderRadius: shapeElement.borderRadius ? `${shapeElement.borderRadius}px` : undefined,
                    borderWidth: shapeElement.borderWidth ? `${shapeElement.borderWidth}px` : undefined,
                    borderColor: shapeElement.borderColor,
                    borderStyle: shapeElement.borderWidth ? 'solid' : undefined,
                }}></div>
            );
        default:
            return null;
    }
};

interface CardPreviewProps {
  data: IdData;
  template: TemplateDefinition;
}

const CardPreview = React.forwardRef<HTMLDivElement, CardPreviewProps>(({ data, template }, ref) => {
  const getBackgroundStyle = (): React.CSSProperties => {
    const { background } = template;
    switch (background.type) {
        case 'solid':
            return { backgroundColor: background.color };
        case 'gradient':
            return { backgroundImage: `linear-gradient(${background.angle}deg, ${background.colors[0]}, ${background.colors[1]})` };
        case 'image':
             // In creative template, the photo is used as background
            const bgImage = template.id === 'creative' && data.photo ? data.photo : background.src;
            return {
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            };
        default:
            return { backgroundColor: '#ffffff' };
    }
  };
  
  return (
    <div ref={ref} style={{ width: `${template.width}px`, height: `${template.height}px` }} 
         className="rounded-xl transform transition-all duration-300 overflow-hidden relative shadow-lg border font-sans"
    >
      <div style={{ position: 'absolute', inset: 0, ...getBackgroundStyle() }}></div>
      {template.elements.map(element => (
        <React.Fragment key={element.id}>
            {renderElement(element, data)}
        </React.Fragment>
      ))}
    </div>
  );
});

export default CardPreview;