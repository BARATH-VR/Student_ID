
import React from 'react';

export enum Page {
  BulkUpload = 'bulk-upload',
  Settings = 'settings',
  QRScanner = 'qr-scanner',
  SingleStudentId = 'single-student-id',
  SingleEventId = 'single-event-id',
}

export interface StudentIdData {
  name: string;
  regNo: string;
  dept: string;
  gender: string;
  address: string;
  dob: string;
  phone: string;
  bloodGroup: string;
  photo: string | null;
  logo: string | null;
  signature: string | null;
  // Added for dynamic templates
  participantId?: string; 
  organization?: string;
  photoURL?: string;
  studentId?: string;
  major?: string;
  year?: string;
}

export interface EventIdData {
  name: string;
  role: string;
  eventName: string;
  eventDate: string;
  photo: string | null;
  tagline: string;
  department?: string;
  eventType?: 'Tech' | 'Non-Tech' | '';
  eventCategory?: 'Paper Presentation' | 'Workshop' | 'Seminar' | 'Hackathon' | 'Exhibition' | '';
  photoURL?: string;
  participantId?: string;
  organization?: string;
  templateId?: string;
}

export type IdData = StudentIdData | EventIdData;

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

// Data-driven Template Definitions for Dynamic Rendering
export type TemplateElementType = 'text' | 'image' | 'qr' | 'shape';
export type ImageType = 'photo' | 'logo' | 'signature';
export type FontWeight = 'normal' | 'bold' | '500' | '600' | '700' | '800';
export type TextAlign = 'left' | 'center' | 'right';
export type ObjectFit = 'cover' | 'contain' | 'fill';

export interface BaseTemplateElement {
  id: string;
  type: TemplateElementType;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextElement extends BaseTemplateElement {
  type: 'text';
  content: string; // Can contain placeholders like {name}
  fontFamily: string;
  fontSize: number;
  fontWeight: FontWeight;
  color: string;
  textAlign: TextAlign;
}

export interface ImageElement extends BaseTemplateElement {
  type: 'image';
  imageType: ImageType;
  objectFit: ObjectFit;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
}

export interface QRCodeElement extends BaseTemplateElement {
  type: 'qr';
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
}

export interface ShapeElement extends BaseTemplateElement {
  type: 'shape';
  backgroundColor: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
}

export type TemplateElement = TextElement | ImageElement | QRCodeElement | ShapeElement;

export type BackgroundType = 'solid' | 'gradient' | 'image';
export interface SolidBackground { type: 'solid'; color: string; }
export interface GradientBackground { type: 'gradient'; colors: [string, string]; angle: number; }
export interface ImageBackground { type: 'image'; src: string; }
export type Background = SolidBackground | GradientBackground | ImageBackground;

export interface TemplateDefinition {
  id: string;
  name: string;
  type: 'student' | 'event';
  width: number; // in px
  height: number; // in px
  background: Background;
  elements: TemplateElement[];
  // For UI in carousels
  category: 'tech' | 'non-tech' | 'neutral' | 'student';
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

// Re-aliasing for component compatibility
export type Template = TemplateDefinition;