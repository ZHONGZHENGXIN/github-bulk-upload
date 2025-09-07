import prisma from '../config/database';
import { Execution } from '../types/execution';

export interface HistoryFilters {
  status?: string;
  workflowId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}

export interface HistorySearchOptions {
  sortBy?: 'createdAt' | 'completedAt' | 'duration';
  sortOrder?: 'asc' | 'desc';
  completionRateRange?: {
    min: number;
    max: number;
  };
}

export interface HistoryStats {
  totalExecutions: number;
  completedExecutions: number;
  averageExecutionTime: number;
  totalWorkflows: number;
  mostUsedWorkflow: {
    id: string;
    name: string;
    count: number;
  } | null;
  completionRate: number;
}

export interface PaginatedHistory {
  executions: Array<{
    id: string;
    workflowId: string;
    workflowName?: string;
    status: string;
    startedAt: Date;
    completedAt?: Date | null;
    duration: number | null;
    completionRate: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class HistoryService {
  // 获取用户的执行历史（分页）
  async getUserHistory(
    userId: string,
    page: number = 1,
    limit: number = 10,
    filters?: HistoryFilters,
    searchOptions?: HistorySearchOptions
  ): Promise<PaginatedHistory> {
    const skip = (page - 1) * limit;
    
    // 构建查询条件
    const where: any = {
      userId
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.workflowId) {
      where.workflowId = filters.workflowId;
    }

    if (filters?.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end
      };
    }

    if (filters?.searchTerm) {
      where.OR = [
        { workflow: { name: { contains: filters.searchTerm, mode: 'insensitive' } } },
        { workflow: { description: { contains: filters.searchTerm, mode: 'insensitive' } } }
      ];
    }

    // 获取执行记录
    const executions = await prisma.execution.findMany({
      where,
      include: {
        workflow: {
          select: {
            name: true,
            description: true
          }
        },
        records: {
          select: {
            status: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        [searchOptions?.sortBy || 'createdAt']: searchOptions?.sortOrder || 'desc'
      }
    });

    const total = await prisma.execution.count({ where });

    return {
      executions: executions.map(execution => ({
        id: execution.id,
        workflowId: execution.workflowId,
        workflowName: execution.workflow?.name,
        status: execution.status,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
        duration: execution.completedAt && execution.startedAt
          ? new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()
          : null,
        completionRate: execution.records.length > 0
          ? (execution.records.filter(r => r.status === 'COMPLETED').length / execution.records.length) * 100
          : 0
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  // 获取历史统计信息
  async getHistoryStats(userId: string): Promise<HistoryStats> {
    // 基础统计
    const [totalExecutions, completedExecutions, workflows] = await Promise.all([
      prisma.execution.count({ where: { userId } }),
      prisma.execution.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.workflow.count({ where: { createdBy: userId } })
    ]);

    // 平均执行时间
    const completedExecutionsWithTime = await prisma.execution.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: { not: null }
      },
      select: {
        startedAt: true,
        completedAt: true
      }
    });

    const averageExecutionTime = completedExecutionsWithTime.length > 0
      ? completedExecutionsWithTime.reduce((sum, exec) => {
          const duration = new Date(exec.completedAt!).getTime() - new Date(exec.startedAt).getTime();
          return sum + duration;
        }, 0) / completedExecutionsWithTime.length
      : 0;

    // 最常用的工作流
    const workflowUsage = await prisma.execution.groupBy({
      by: ['workflowId'],
      where: { userId },
      _count: {
        workflowId: true
      },
      orderBy: {
        _count: {
          workflowId: 'desc'
        }
      },
      take: 1
    });

    let mostUsedWorkflow: {
      id: string;
      name: string;
      count: number;
    } | null = null;
    
    if (workflowUsage.length > 0) {
      const workflow = await prisma.workflow.findUnique({
        where: { id: workflowUsage[0].workflowId },
        select: { id: true, name: true }
      });
      
      if (workflow) {
        mostUsedWorkflow = {
          id: workflow.id,
          name: workflow.name,
          count: workflowUsage[0]._count.workflowId
        };
      }
    }

    const completionRate = totalExecutions > 0 ? (completedExecutions / totalExecutions) * 100 : 0;

    return {
      totalExecutions,
      completedExecutions,
      averageExecutionTime,
      totalWorkflows: workflows,
      mostUsedWorkflow,
      completionRate
    };
  }

  // 搜索执行历史
  async searchHistory(
    userId: string,
    searchTerm: string,
    searchOptions?: HistorySearchOptions
  ): Promise<Array<{
    id: string;
    workflowId: string;
    workflowName?: string;
    status: string;
    startedAt: Date;
    completedAt?: Date;
    duration: number | null;
    completionRate: number;
  }>> {
    const executions = await prisma.execution.findMany({
      where: {
        userId,
        OR: [
          { workflow: { name: { contains: searchTerm, mode: 'insensitive' } } },
          { workflow: { description: { contains: searchTerm, mode: 'insensitive' } } }
        ]
      },
      include: {
        workflow: {
          select: {
            name: true
          }
        },
        records: {
          select: {
            status: true
          }
        }
      },
      orderBy: {
        [searchOptions?.sortBy || 'createdAt']: searchOptions?.sortOrder || 'desc'
      }
    });

    let filteredExecutions = executions;

    // 应用完成率过滤
    if (searchOptions?.completionRateRange) {
      filteredExecutions = filteredExecutions.filter(exec => {
        const total = exec.records.length;
        const completed = exec.records.filter(r => r.status === 'COMPLETED').length;
        const rate = total > 0 ? (completed / total) * 100 : 0;
        return rate >= searchOptions.completionRateRange!.min && rate <= searchOptions.completionRateRange!.max;
      });
    }

    return filteredExecutions.map(execution => ({
      id: execution.id,
      workflowId: execution.workflowId,
      workflowName: execution.workflow?.name,
      status: execution.status,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      duration: execution.completedAt && execution.startedAt
        ? new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()
        : null,
      completionRate: execution.records.length > 0
        ? (execution.records.filter(r => r.status === 'COMPLETED').length / execution.records.length) * 100
        : 0
    }));
  }

  // 获取执行详情
  async getExecutionDetail(
    executionId: string,
    userId: string,
    options?: {
      includeSteps?: boolean;
      includeReviews?: boolean;
    }
  ) {
    const execution = await prisma.execution.findFirst({
      where: {
        id: executionId,
        userId
      },
      include: {
        workflow: {
          select: {
            name: true,
            description: true,
            category: true
          }
        },
        records: options?.includeSteps ? {
          include: {
            step: {
              select: {
                title: true,
                description: true,
                type: true
              }
            }
          }
        } : false
      }
    });

    if (!execution) {
      throw new Error('执行记录不存在或无权限访问');
    }

    const baseData = {
      id: execution.id,
      workflowId: execution.workflowId,
      workflowName: execution.workflow?.name,
      workflowDescription: execution.workflow?.description,
      workflowCategory: execution.workflow?.category,
      status: execution.status,
      priority: execution.priority,
      progress: execution.progress,
      startedAt: execution.startedAt.toISOString(),
      completedAt: execution.completedAt?.toISOString(),
      duration: execution.completedAt && execution.startedAt
        ? new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()
        : null,
      completionRate: execution.records && execution.records.length > 0
        ? (execution.records.filter(r => r.status === 'COMPLETED').length / execution.records.length) * 100
        : 0,
      tags: execution.tags,
      metadata: execution.metadata,
      error: execution.error
    };

    if (options?.includeSteps && execution.records) {
      return {
        ...baseData,
        steps: execution.records.map(record => ({
          id: record.id,
          stepId: record.stepId,
          stepName: record.step?.title,
          stepDescription: record.step?.description,
          stepType: record.step?.type,
          status: record.status,
          notes: record.notes,
          actualTime: record.actualTime,
          data: record.data,
          result: record.result,
          reviewNotes: record.reviewNotes,
          startedAt: record.startedAt?.toISOString(),
          completedAt: record.completedAt?.toISOString()
        }))
      };
    }

    return baseData;
  }

  // 导出历史数据
  async exportHistory(
    userId: string,
    format: 'json' | 'csv' = 'json',
    filters?: HistoryFilters
  ) {
    const where: any = { userId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.workflowId) {
      where.workflowId = filters.workflowId;
    }

    if (filters?.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end
      };
    }

    const executions = await prisma.execution.findMany({
      where,
      include: {
        workflow: {
          select: {
            name: true,
            description: true,
            category: true
          }
        },
        records: {
          include: {
            step: {
              select: {
                title: true,
                description: true,
                type: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const exportData = executions.map(execution => ({
      id: execution.id,
      workflowName: execution.workflow?.name,
      workflowCategory: execution.workflow?.category,
      status: execution.status,
      priority: execution.priority,
      progress: execution.progress,
      startedAt: execution.startedAt.toISOString(),
      completedAt: execution.completedAt?.toISOString(),
      duration: execution.completedAt && execution.startedAt
        ? new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()
        : null,
      completionRate: execution.records.length > 0
        ? (execution.records.filter(r => r.status === 'COMPLETED').length / execution.records.length) * 100
        : 0,
      totalSteps: execution.records.length,
      completedSteps: execution.records.filter(r => r.status === 'COMPLETED').length,
      tags: execution.tags,
      error: execution.error
    }));

    if (format === 'csv') {
      // 简单的CSV转换
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => 
            JSON.stringify(row[header as keyof typeof row] || '')
          ).join(',')
        )
      ].join('\n');
      
      return csvContent;
    }

    return exportData;
  }
}