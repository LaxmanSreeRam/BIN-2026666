import React from 'react';
import { Student } from '../types';
import { SupportView } from './SupportView';

interface ReportIssueViewProps {
  currentStudent: Student | null;
  onOpenCredentials?: () => void;
}

export const ReportIssueView: React.FC<ReportIssueViewProps> = (props) => {
  return <SupportView {...props} />;
};
