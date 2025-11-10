import React from 'react';
import { StudentIdData, EventIdData, EmailTemplate, TemplateDefinition } from './types';
import { ModernIcon, ClassicIcon, MinimalIcon, CreativeIcon, IdCardIcon } from './components/Icons';

// --- Template Definitions (New Data-Driven Format) ---

export const NANDHA_TEMPLATE_DEFINITION: TemplateDefinition = {
  id: 'nandha-student',
  name: 'Nandha College ID',
  type: 'student',
  width: 450,
  height: 284,
  category: 'student',
  icon: IdCardIcon,
  background: { type: 'solid', color: '#ffffff' },
  elements: [
    { id: 'header-bg', type: 'shape', x: 0, y: 0, width: 450, height: 70, backgroundColor: '#0f4c81' },
    { id: 'logo', type: 'image', imageType: 'logo', x: 8, y: 5, width: 60, height: 60, objectFit: 'contain' },
    { id: 'college-name', type: 'text', content: 'NANDHA ENGINEERING COLLEGE', x: 80, y: 12, width: 360, height: 20, fontFamily: 'Segoe UI', fontSize: 18, fontWeight: 'bold', color: '#ffffff', textAlign: 'left' },
    { id: 'college-sub1', type: 'text', content: '(Approved by AICTE & Affiliated to Anna University)', x: 80, y: 34, width: 360, height: 14, fontFamily: 'Segoe UI', fontSize: 11, fontWeight: '600', color: '#ffffff', textAlign: 'left' },
    { id: 'college-sub2', type: 'text', content: 'Perundurai, Erode - 638052, Tamil Nadu', x: 80, y: 48, width: 360, height: 14, fontFamily: 'Segoe UI', fontSize: 11, fontWeight: 'normal', color: '#ffffff', textAlign: 'left' },
    { id: 'photo', type: 'image', imageType: 'photo', x: 15, y: 80, width: 100, height: 133, objectFit: 'cover', borderWidth: 2, borderColor: '#e5e7eb' },
    { id: 'qr-code', type: 'qr', x: 350, y: 80, width: 80, height: 80, errorCorrectionLevel: 'M', margin: 1 },
    { id: 'signature', type: 'image', imageType: 'signature', x: 345, y: 180, width: 90, height: 40, objectFit: 'contain' },
    { id: 'principal-label', type: 'text', content: 'Principal', x: 345, y: 220, width: 90, height: 14, fontFamily: 'Segoe UI', fontSize: 12, fontWeight: 'bold', color: '#111827', textAlign: 'center' },
    { id: 'details-name', type: 'text', content: 'Name\t: {name}', x: 130, y: 85, width: 200, height: 16, fontFamily: 'Segoe UI', fontSize: 12, fontWeight: 'bold', color: '#111827', textAlign: 'left' },
    { id: 'details-reg', type: 'text', content: 'Reg No.\t: {regNo}', x: 130, y: 105, width: 200, height: 16, fontFamily: 'Segoe UI', fontSize: 12, fontWeight: 'bold', color: '#111827', textAlign: 'left' },
    { id: 'details-dept', type: 'text', content: 'Dept\t\t: {dept}', x: 130, y: 125, width: 200, height: 16, fontFamily: 'Segoe UI', fontSize: 12, fontWeight: 'bold', color: '#111827', textAlign: 'left' },
    { id: 'details-gender', type: 'text', content: 'Gender\t: {gender}', x: 130, y: 145, width: 200, height: 16, fontFamily: 'Segoe UI', fontSize: 12, fontWeight: 'bold', color: '#111827', textAlign: 'left' },
    { id: 'details-address', type: 'text', content: 'Address\t: {address}', x: 130, y: 165, width: 200, height: 40, fontFamily: 'Segoe UI', fontSize: 12, fontWeight: 'bold', color: '#111827', textAlign: 'left' },
    { id: 'footer-dob', type: 'text', content: 'DOB: {dob}', x: 15, y: 255, width: 120, height: 16, fontFamily: 'Segoe UI', fontSize: 12, fontWeight: 'bold', color: '#111827', textAlign: 'left' },
    { id: 'footer-phone', type: 'text', content: 'Phone: {phone}', x: 150, y: 255, width: 120, height: 16, fontFamily: 'Segoe UI', fontSize: 12, fontWeight: 'bold', color: '#111827', textAlign: 'left' },
    { id: 'footer-blood', type: 'text', content: 'Blood Group: {bloodGroup}', x: 280, y: 255, width: 150, height: 16, fontFamily: 'Segoe UI', fontSize: 12, fontWeight: 'bold', color: '#dc2626', textAlign: 'left' },
    { id: 'footer-line', type: 'shape', x: 0, y: 283, width: 450, height: 1, backgroundColor: '#e5e7eb' },
  ],
};

export const MODERN_EVENT_DEFINITION: TemplateDefinition = {
  id: 'modern',
  name: 'Modern',
  type: 'event',
  width: 350,
  height: 520,
  category: 'tech',
  icon: ModernIcon,
  background: { type: 'solid', color: '#ffffff' },
  elements: [
    { id: 'icon-bg', type: 'shape', x: 24, y: 24, width: 52, height: 52, backgroundColor: '#dbeafe', borderRadius: 8 },
    { id: 'qr-code', type: 'qr', x: 246, y: 24, width: 80, height: 80, errorCorrectionLevel: 'M', margin: 1 },
    { id: 'photo', type: 'image', imageType: 'photo', x: 111, y: 110, width: 128, height: 128, objectFit: 'cover', borderRadius: 64, borderWidth: 4, borderColor: '#ffffff' },
    { id: 'name', type: 'text', content: '{name}', x: 20, y: 255, width: 310, height: 32, fontFamily: 'Inter', fontSize: 24, fontWeight: 'bold', color: '#111827', textAlign: 'center' },
    { id: 'role', type: 'text', content: '{role}', x: 20, y: 290, width: 310, height: 20, fontFamily: 'Inter', fontSize: 16, fontWeight: '500', color: '#6B7280', textAlign: 'center' },
    { id: 'divider', type: 'shape', x: 40, y: 325, width: 270, height: 1, backgroundColor: '#e5e7eb' },
    { id: 'event-name', type: 'text', content: '{eventName}', x: 20, y: 345, width: 310, height: 28, fontFamily: 'Inter', fontSize: 18, fontWeight: 'bold', color: '#1d4ed8', textAlign: 'center' },
    { id: 'event-details', type: 'text', content: '{eventType} – {eventCategory}', x: 20, y: 375, width: 310, height: 20, fontFamily: 'Inter', fontSize: 14, fontWeight: 'normal', color: '#6B7280', textAlign: 'center' },
    { id: 'event-date', type: 'text', content: '{eventDate}', x: 20, y: 395, width: 310, height: 20, fontFamily: 'Inter', fontSize: 14, fontWeight: 'normal', color: '#6B7280', textAlign: 'center' },
    { id: 'tagline', type: 'text', content: '“{tagline}”', x: 20, y: 460, width: 310, height: 20, fontFamily: 'Inter', fontSize: 14, fontWeight: 'normal', color: '#6B7280', textAlign: 'center' },
  ],
};

export const CLASSIC_EVENT_DEFINITION: TemplateDefinition = {
  id: 'classic',
  name: 'Classic',
  type: 'event',
  width: 350,
  height: 520,
  category: 'non-tech',
  icon: ClassicIcon,
  background: { type: 'solid', color: '#ffffff' },
  elements: [
    { id: 'header-bg', type: 'shape', x: 0, y: 0, width: 350, height: 60, backgroundColor: '#1e3a8a' },
    { id: 'org-name', type: 'text', content: '{organization}', x: 10, y: 18, width: 330, height: 24, fontFamily: 'serif', fontSize: 20, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' },
    { id: 'photo', type: 'image', imageType: 'photo', x: 109, y: 80, width: 132, height: 132, objectFit: 'cover', borderWidth: 4, borderColor: '#e5e7eb' },
    { id: 'name', type: 'text', content: '{name}', x: 20, y: 230, width: 310, height: 36, fontFamily: 'serif', fontSize: 30, fontWeight: 'bold', color: '#111827', textAlign: 'center' },
    { id: 'role', type: 'text', content: '{role}', x: 20, y: 270, width: 310, height: 24, fontFamily: 'serif', fontSize: 18, fontWeight: '500', color: '#6B7280', textAlign: 'center' },
    { id: 'divider', type: 'shape', x: 50, y: 310, width: 250, height: 1, backgroundColor: '#e5e7eb' },
    { id: 'event-name', type: 'text', content: '{eventName}', x: 20, y: 330, width: 310, height: 28, fontFamily: 'serif', fontSize: 18, fontWeight: 'bold', color: '#1d4ed8', textAlign: 'center' },
    { id: 'event-date', type: 'text', content: '{eventDate}', x: 20, y: 360, width: 310, height: 20, fontFamily: 'serif', fontSize: 14, fontWeight: 'normal', color: '#6B7280', textAlign: 'center' },
    { id: 'qr-code', type: 'qr', x: 135, y: 410, width: 80, height: 80, errorCorrectionLevel: 'M', margin: 1 },
  ],
};

export const MINIMAL_EVENT_DEFINITION: TemplateDefinition = {
  id: 'minimal',
  name: 'Minimal',
  type: 'event',
  width: 350,
  height: 520,
  category: 'neutral',
  icon: MinimalIcon,
  background: { type: 'solid', color: '#ffffff' },
  elements: [
    { id: 'name', type: 'text', content: '{name}', x: 24, y: 24, width: 220, height: 32, fontFamily: 'Inter', fontSize: 24, fontWeight: '600', color: '#111827', textAlign: 'left' },
    { id: 'role', type: 'text', content: '{role}', x: 24, y: 58, width: 220, height: 20, fontFamily: 'Inter', fontSize: 16, fontWeight: 'normal', color: '#6B7280', textAlign: 'left' },
    { id: 'photo', type: 'image', imageType: 'photo', x: 246, y: 24, width: 80, height: 80, objectFit: 'cover', borderRadius: 40 },
    { id: 'event-name', type: 'text', content: '{eventName}', x: 24, y: 390, width: 302, height: 24, fontFamily: 'Inter', fontSize: 18, fontWeight: '600', color: '#111827', textAlign: 'left' },
    { id: 'event-date', type: 'text', content: '{eventDate}', x: 24, y: 418, width: 302, height: 20, fontFamily: 'Inter', fontSize: 14, fontWeight: 'normal', color: '#6B7280', textAlign: 'left' },
    { id: 'qr-code', type: 'qr', x: 266, y: 436, width: 60, height: 60, errorCorrectionLevel: 'M', margin: 1 },
  ],
};

export const CREATIVE_EVENT_DEFINITION: TemplateDefinition = {
  id: 'creative',
  name: 'Creative',
  type: 'event',
  width: 350,
  height: 520,
  category: 'tech',
  icon: CreativeIcon,
  background: { type: 'image', src: 'https://i.imgur.com/8b23K1b.jpg' }, // default bg
  elements: [
    { id: 'bg-overlay', type: 'shape', x: 0, y: 0, width: 350, height: 520, backgroundColor: 'rgba(0,0,0,0.5)' },
    { id: 'event-name', type: 'text', content: '{eventName}', x: 24, y: 24, width: 302, height: 32, fontFamily: 'Inter', fontSize: 24, fontWeight: 'bold', color: '#ffffff', textAlign: 'left' },
    { id: 'event-date', type: 'text', content: '{eventDate}', x: 24, y: 58, width: 302, height: 24, fontFamily: 'Inter', fontSize: 18, fontWeight: '600', color: '#ffffff', textAlign: 'left' },
    { id: 'name', type: 'text', content: '{name}', x: 24, y: 420, width: 302, height: 36, fontFamily: 'Inter', fontSize: 30, fontWeight: 'bold', color: '#ffffff', textAlign: 'right' },
    { id: 'role', type: 'text', content: '{role}', x: 150, y: 460, width: 176, height: 28, fontFamily: 'Inter', fontSize: 18, fontWeight: '500', color: '#ffffff', textAlign: 'center' },
    { id: 'role-bg', type: 'shape', x: 150, y: 460, width: 176, height: 28, backgroundColor: '#3b82f6', borderRadius: 4 },
    { id: 'qr-code', type: 'qr', x: 24, y: 430, width: 64, height: 64, errorCorrectionLevel: 'M', margin: 1 },
    { id: 'qr-bg', type: 'shape', x: 22, y: 428, width: 68, height: 68, backgroundColor: '#ffffff', borderRadius: 4 },
  ],
};

export const GENERIC_STUDENT_TEMPLATE_DEFINITION: TemplateDefinition = {
  id: 'generic-student',
  name: 'Generic Student ID',
  type: 'student',
  width: 450,
  height: 284,
  category: 'student',
  icon: IdCardIcon,
  background: { type: 'solid', color: '#ffffff' },
  elements: [
    // Header
    { id: 'header-bg', type: 'shape', x: 0, y: 0, width: 450, height: 65, backgroundColor: '#1e3a8a' },
    { id: 'logo', type: 'image', imageType: 'logo', x: 15, y: 8, width: 50, height: 50, objectFit: 'contain' },
    { id: 'org-name', type: 'text', content: '{organization}', x: 80, y: 15, width: 350, height: 20, fontFamily: 'Inter', fontSize: 18, fontWeight: 'bold', color: '#ffffff', textAlign: 'left' },
    { id: 'id-card-label', type: 'text', content: 'STUDENT IDENTIFICATION CARD', x: 80, y: 38, width: 350, height: 14, fontFamily: 'Inter', fontSize: 10, fontWeight: '600', color: '#a5b4fc', textAlign: 'left' },
    
    // Photo
    { id: 'photo', type: 'image', imageType: 'photo', x: 20, y: 80, width: 110, height: 140, objectFit: 'cover', borderWidth: 3, borderColor: '#e5e7eb', borderRadius: 8 },
    
    // Details
    { id: 'name', type: 'text', content: '{name}', x: 145, y: 85, width: 285, height: 28, fontFamily: 'Inter', fontSize: 22, fontWeight: 'bold', color: '#111827', textAlign: 'left' },
    
    { id: 'id-label', type: 'text', content: 'STUDENT ID', x: 145, y: 125, width: 100, height: 12, fontFamily: 'Inter', fontSize: 10, fontWeight: '600', color: '#6b7280', textAlign: 'left' },
    { id: 'student-id', type: 'text', content: '{studentId}', x: 145, y: 140, width: 100, height: 16, fontFamily: 'Inter', fontSize: 14, fontWeight: '500', color: '#334155', textAlign: 'left' },
    
    { id: 'major-label', type: 'text', content: 'MAJOR', x: 145, y: 165, width: 150, height: 12, fontFamily: 'Inter', fontSize: 10, fontWeight: '600', color: '#6b7280', textAlign: 'left' },
    { id: 'major', type: 'text', content: '{major}', x: 145, y: 180, width: 150, height: 16, fontFamily: 'Inter', fontSize: 14, fontWeight: '500', color: '#334155', textAlign: 'left' },
    
    { id: 'year-label', type: 'text', content: 'YEAR', x: 310, y: 165, width: 120, height: 12, fontFamily: 'Inter', fontSize: 10, fontWeight: '600', color: '#6b7280', textAlign: 'left' },
    { id: 'year', type: 'text', content: '{year}', x: 310, y: 180, width: 120, height: 16, fontFamily: 'Inter', fontSize: 14, fontWeight: '500', color: '#334155', textAlign: 'left' },
    
    // QR Code
    { id: 'qr-code', type: 'qr', x: 350, y: 200, width: 70, height: 70, errorCorrectionLevel: 'M', margin: 1 },
    
    // Footer section
    { id: 'footer-line', type: 'shape', x: 0, y: 240, width: 330, height: 1, backgroundColor: '#e5e7eb' },
    { id: 'footer-dob', type: 'text', content: 'DOB: {dob}', x: 20, y: 250, width: 90, height: 16, fontFamily: 'Inter', fontSize: 11, fontWeight: '500', color: '#475569', textAlign: 'left' },
    { id: 'footer-blood', type: 'text', content: 'Blood Group: {bloodGroup}', x: 120, y: 250, width: 120, height: 16, fontFamily: 'Inter', fontSize: 11, fontWeight: '500', color: '#475569', textAlign: 'left' },
  ],
};

export const GENERIC_STUDENT_CLASSIC_DEFINITION: TemplateDefinition = {
  id: 'generic-student-classic',
  name: 'Generic Student (Classic)',
  type: 'student',
  width: 450,
  height: 284,
  category: 'student',
  icon: IdCardIcon,
  background: { type: 'solid', color: '#ffffff' },
  elements: [
    { id: 'header-bg', type: 'shape', x: 0, y: 0, width: 450, height: 70, backgroundColor: '#0f4c81' },
    { id: 'logo', type: 'image', imageType: 'logo', x: 8, y: 5, width: 60, height: 60, objectFit: 'contain' },
    { id: 'college-name', type: 'text', content: 'YOUR INSTITUTION NAME', x: 80, y: 20, width: 360, height: 20, fontFamily: 'Segoe UI', fontSize: 18, fontWeight: 'bold', color: '#ffffff', textAlign: 'left' },
    { id: 'college-sub', type: 'text', content: 'STUDENT IDENTITY CARD', x: 80, y: 42, width: 360, height: 14, fontFamily: 'Segoe UI', fontSize: 11, fontWeight: 'normal', color: '#e0f2fe', textAlign: 'left' },
    { id: 'photo', type: 'image', imageType: 'photo', x: 20, y: 85, width: 110, height: 140, objectFit: 'cover', borderWidth: 2, borderColor: '#e5e7eb' },
    { id: 'qr-code', type: 'qr', x: 345, y: 180, width: 85, height: 85, errorCorrectionLevel: 'M', margin: 1 },
    { id: 'details-name', type: 'text', content: 'Name   : {name}', x: 145, y: 95, width: 250, height: 18, fontFamily: 'Segoe UI', fontSize: 14, fontWeight: 'bold', color: '#111827', textAlign: 'left' },
    { id: 'details-id', type: 'text', content: 'ID No. : {studentId}', x: 145, y: 120, width: 200, height: 16, fontFamily: 'Segoe UI', fontSize: 12, fontWeight: '500', color: '#111827', textAlign: 'left' },
    { id: 'details-major', type: 'text', content: 'Major  : {major}', x: 145, y: 140, width: 200, height: 16, fontFamily: 'Segoe UI', fontSize: 12, fontWeight: '500', color: '#111827', textAlign: 'left' },
    { id: 'details-year', type: 'text', content: 'Year   : {year}', x: 145, y: 160, width: 200, height: 16, fontFamily: 'Segoe UI', fontSize: 12, fontWeight: '500', color: '#111827', textAlign: 'left' },
    { id: 'footer-line', type: 'shape', x: 0, y: 280, width: 450, height: 4, backgroundColor: '#0f4c81' },
  ],
};

// --- DATA ---

export const ALL_IDS_DATA = [
  { name: 'Sophia Clark', collegeId: 'CC2023001', role: 'Student', department: 'Computer Science', expiry: '2025-05-31', status: 'Active', createdDate: '2024-07-20' },
  { name: 'Ethan Bennett', collegeId: 'CC2022002', role: 'Student', department: 'Electrical Engineering', expiry: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'Active', createdDate: '2024-07-19' },
  { name: 'Olivia Carter', collegeId: 'CC2021003', role: 'Staff', department: 'Mathematics', expiry: '2026-08-20', status: 'Active', createdDate: '2024-07-19' },
  { name: 'Liam Davis', collegeId: 'CC2023004', role: 'Student', department: 'Mechanical Engineering', expiry: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'Revoked', createdDate: '2024-07-18' },
  { name: 'Ava Evans', collegeId: 'CC2022005', role: 'Student', department: 'Physics', expiry: '2024-11-22', status: 'Active', createdDate: '2024-07-15' },
  { name: 'Noah Foster', collegeId: 'CC2021006', role: 'Staff', department: 'Administration', expiry: '2026-09-05', status: 'Active', createdDate: '2024-07-14' },
  { name: 'Isabella Garcia', collegeId: 'CC2023007', role: 'Student', department: 'Computer Science', expiry: '2025-05-31', status: 'Active', createdDate: '2024-07-12' },
  { name: 'James Green', collegeId: 'CC2022008', role: 'Faculty', department: 'Physics', expiry: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'Active', createdDate: '2024-07-10' },
];

export const DUMMY_STUDENT: StudentIdData = {
  name: 'AAKASH',
  regNo: '23CS067',
  dept: 'CSE',
  gender: 'M',
  address: 'Chennai\nTamil Nadu',
  dob: '26-12-2004',
  phone: '953514874',
  bloodGroup: 'O+',
  photo: 'sample.webp',
  logo: 'logo.jpg',
  signature: 'sign.jpg',
  organization: 'Nandha Engineering College',
  participantId: 'SID-23CS067',
};

export const DUMMY_EVENT_PARTICIPANT: EventIdData = {
  name: 'Priya Sharma',
  role: 'Participant',
  eventName: 'TechFest 2025',
  eventDate: '2025-12-05',
  photo: 'https://i.imgur.com/8b23K1b.jpg',
  tagline: 'Innovating Beyond Limits 🚀',
  department: 'Computer Science',
  eventType: 'Tech',
  eventCategory: 'Workshop',
  participantId: 'PID-12345',
  organization: 'Innovate Corp',
  templateId: 'modern',
};

export const TEMPLATES: TemplateDefinition[] = [
  MODERN_EVENT_DEFINITION,
  CLASSIC_EVENT_DEFINITION,
  MINIMAL_EVENT_DEFINITION,
  CREATIVE_EVENT_DEFINITION,
];

export const ALL_TEMPLATES: TemplateDefinition[] = [
    NANDHA_TEMPLATE_DEFINITION,
    GENERIC_STUDENT_TEMPLATE_DEFINITION,
    GENERIC_STUDENT_CLASSIC_DEFINITION,
    ...TEMPLATES,
];


export const ATTENDANCE_DATA = [
    { name: 'Day 1', checkedIn: 90, total: 120 },
    { name: 'Day 2', checkedIn: 110, total: 120 },
    { name: 'Day 3', checkedIn: 105, total: 120 },
];

export const ID_GENERATION_DATA = [
    { name: 'Students', count: 450 },
    { name: 'Staff', count: 75 },
    { name: 'Event A', count: 120 },
    { name: 'Event B', count: 250 },
];

export const DUMMY_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'activation',
    name: 'Account Activation',
    subject: 'Activate Your CampusCard Account',
    content: 'Hello [User Name],\n\nWelcome to CampusCard! Please click the link below to activate your account and access your new digital ID.\n\nActivation Link: [Activation Link]\n\nIf you did not sign up for this service, please ignore this email.'
  },
  {
    id: 'notification',
    name: 'ID Card Notification',
    subject: 'Your New Digital ID Card is Ready!',
    content: 'Hello [User Name],\n\nYour new digital ID card with number [Card Number] has been generated. It is valid until [Expiry Date].\n\nYou can view and manage your ID through the student portal.\n\nThank you,\nThe CampusID Team'
  }
];