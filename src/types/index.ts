export interface ClientInfo {
  clientName: string;
  address: string;
  dateOfInformation: string;
}

export interface ChangeRequest {
  id: string;
  hdiNumber: string;
  country: string;
  typeOfChange: string;
}

export interface Document {
  id: string;
  name: string;
  required: boolean;
  uploaded: boolean;
  file?: File;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  target: 'client-info' | 'change-request';
  targetId?: string;
}

export interface Case {
  id: string;
  clientInfo: ClientInfo;
  changeRequests: ChangeRequest[];
  documents: Document[];
  comments: Comment[];
  status: 'pending' | 'with-okw' | 'with-cdd' | 'approved' | 'rejected';
  currentAssignee: string;
  submittedAt: Date;
  updatedAt: Date;
}

export type UserRole = 'client' | 'okw' | 'cdd';

export interface User {
  role: UserRole;
  name: string;
}