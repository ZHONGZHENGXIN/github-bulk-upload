export interface Execution {
  id: string;
  workflowId: string;
  userId: string;
  status: string;
  priority: string;
  progress: number;
  tags?: string | null;
  metadata?: string | null;
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date;
  completedAt?: Date | null;
  error?: string | null;
  records?: ExecutionRecord[];
}

export interface ExecutionRecord {
  id: string;
  executionId: string;
  stepId: string;
  status: string;
  notes?: string | null;
  actualTime?: number | null;
  data?: string | null;
  result?: string | null;
  reviewNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date | null;
  completedAt?: Date | null;
}

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url?: string;
  description?: string;
  tags?: string;
  metadata?: string;
  uploadedAt: Date;
  uploadedBy: string;
  executionId?: string;
}

export interface CreateExecutionDto {
  workflowId: string;
}

export interface UpdateExecutionRecordDto {
  status?: StepStatus;
  notes?: string;
  data?: Record<string, any>;
  reviewNotes?: string;
}

export interface UpdateExecutionDto {
  status?: ExecutionStatus;
  reviewNotes?: string;
}

export enum ExecutionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED'
}

export enum StepStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED'
}

export enum FileType {
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  TEXT = 'TEXT'
}