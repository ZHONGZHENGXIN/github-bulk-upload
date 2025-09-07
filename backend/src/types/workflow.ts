export interface Workflow {
  id: string;
  name: string;
  description?: string | null;
  version: string;
  category?: string | null;
  tags?: string | null;
  isActive: boolean;
  status: string;
  metadata?: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  steps?: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  workflowId: string;
  title: string;
  description?: string | null;
  type: string;
  order: number;
  isRequired: boolean;
  estimatedTime?: number | null;
  dependencies?: string | null;
  conditions?: string | null;
  metadata?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkflowDto {
  name: string;
  description?: string;
  steps: CreateWorkflowStepDto[];
}

export interface CreateWorkflowStepDto {
  title: string;
  description?: string;
  type?: string;
  order: number;
  isRequired: boolean;
  estimatedTime?: number;
  dependencies?: string;
  conditions?: string;
  metadata?: string;
}

export interface UpdateWorkflowDto {
  name?: string;
  description?: string;
  version?: string;
  category?: string;
  tags?: string;
  isActive?: boolean;
  status?: string;
  metadata?: string;
  steps?: UpdateWorkflowStepDto[];
}

export interface UpdateWorkflowStepDto {
  id?: string;
  title?: string;
  description?: string;
  type?: string;
  order?: number;
  isRequired?: boolean;
  estimatedTime?: number;
  dependencies?: string;
  conditions?: string;
  metadata?: string;
}

export enum StepType {
  CHECKLIST = 'CHECKLIST',
  INPUT = 'INPUT',
  DECISION = 'DECISION'
}