import prisma from '../config/database';

export interface ReviewData {
  title: string;
  content: string;
  rating: number;
  lessons?: string;
  improvements?: string;
  tags?: string;
  isPublic?: boolean;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  totalWords: number;
  reviewsByMonth: Record<string, number>;
  commonKeywords: Array<{
    word: string;
    frequency: number;
  }>;
  improvementTrends: Array<{
    month: string;
    averageRating: number;
    reviewCount: number;
  }>;
}

export interface ReviewSummary {
  executionId: string;
  workflowName?: string;
  executionDate: string;
  rating: number;
  content: string;
  lessons?: string | null;
  improvements?: string | null;
  stepsCompleted: number;
  totalSteps: number;
}

export class ReviewService {
  // 创建复盘记录
  async createReview(
    executionId: string,
    userId: string,
    reviewData: ReviewData
  ) {
    // 验证执行记录是否存在且属于用户
    const execution = await prisma.execution.findFirst({
      where: {
        id: executionId,
        userId
      }
    });

    if (!execution) {
      throw new Error('执行记录不存在或无权限访问');
    }

    // 检查是否已有复盘记录
    const existingReview = await prisma.review.findFirst({
      where: { executionId }
    });

    if (existingReview) {
      throw new Error('该执行记录已有复盘记录');
    }

    const review = await prisma.review.create({
      data: {
        executionId,
        createdBy: userId,
        title: reviewData.title,
        content: reviewData.content,
        rating: reviewData.rating,
        lessons: reviewData.lessons,
        improvements: reviewData.improvements,
        tags: reviewData.tags,
        isPublic: reviewData.isPublic || false
      }
    });

    return review;
  }

  // 更新复盘记录
  async updateReview(
    reviewId: string,
    userId: string,
    reviewData: Partial<ReviewData>
  ) {
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        createdBy: userId
      }
    });

    if (!review) {
      throw new Error('复盘记录不存在或无权限访问');
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        title: reviewData.title,
        content: reviewData.content,
        rating: reviewData.rating,
        lessons: reviewData.lessons,
        improvements: reviewData.improvements,
        tags: reviewData.tags,
        isPublic: reviewData.isPublic
      }
    });

    return updatedReview;
  }

  // 删除复盘记录
  async deleteReview(reviewId: string, userId: string) {
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        createdBy: userId
      }
    });

    if (!review) {
      throw new Error('复盘记录不存在或无权限访问');
    }

    await prisma.review.delete({
      where: { id: reviewId }
    });
  }

  // 获取用户的复盘记录列表
  async getUserReviews(
    userId: string,
    page: number = 1,
    limit: number = 10,
    filters?: {
      rating?: number;
      dateRange?: {
        start: Date;
        end: Date;
      };
      searchTerm?: string;
    }
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = {
      createdBy: userId
    };

    if (filters?.rating) {
      where.rating = filters.rating;
    }

    if (filters?.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end
      };
    }

    if (filters?.searchTerm) {
      where.OR = [
        { title: { contains: filters.searchTerm, mode: 'insensitive' } },
        { content: { contains: filters.searchTerm, mode: 'insensitive' } },
        { lessons: { contains: filters.searchTerm, mode: 'insensitive' } },
        { improvements: { contains: filters.searchTerm, mode: 'insensitive' } }
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          execution: {
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
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.review.count({ where })
    ]);

    return {
      reviews: reviews.map(review => ({
        id: review.id,
        executionId: review.executionId,
        workflowName: review.execution.workflow?.name,
        title: review.title,
        content: review.content,
        rating: review.rating,
        lessons: review.lessons,
        improvements: review.improvements,
        tags: review.tags,
        isPublic: review.isPublic,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        stepsCompleted: review.execution.records?.filter(r => r.status === 'COMPLETED').length || 0,
        totalSteps: review.execution.records?.length || 0
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

  // 获取复盘统计信息
  async getReviewStats(userId: string): Promise<ReviewStats> {
    const reviews = await prisma.review.findMany({
      where: { createdBy: userId },
      include: {
        execution: {
          include: {
            records: {
              select: {
                status: true
              }
            }
          }
        }
      }
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    const totalWords = reviews.reduce((sum, review) => {
      const wordCount = (review.content?.length || 0) + 
                       (review.lessons?.length || 0) + 
                       (review.improvements?.length || 0);
      return sum + wordCount;
    }, 0);

    // 按月统计复盘数量
    const reviewsByMonth: Record<string, number> = {};
    reviews.forEach(review => {
      const month = new Date(review.createdAt).toISOString().slice(0, 7); // YYYY-MM
      reviewsByMonth[month] = (reviewsByMonth[month] || 0) + 1;
    });

    // 提取常用关键词（简单实现）
    const allText = reviews
      .map(review => `${review.content || ''} ${review.lessons || ''} ${review.improvements || ''}`)
      .join(' ')
      .toLowerCase();
    
    const words = allText.match(/\b\w{3,}\b/g) || [];
    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    const commonKeywords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, frequency]) => ({ word, frequency }));

    // 改进趋势
    const improvementTrends: Array<{
      month: string;
      averageRating: number;
      reviewCount: number;
    }> = [];

    Object.entries(reviewsByMonth).forEach(([month, count]) => {
      const monthReviews = reviews.filter(review => 
        new Date(review.createdAt).toISOString().slice(0, 7) === month
      );
      const avgRating = monthReviews.reduce((sum, review) => sum + review.rating, 0) / count;
      
      improvementTrends.push({
        month,
        averageRating: avgRating,
        reviewCount: count
      });
    });

    improvementTrends.sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalReviews,
      averageRating,
      totalWords,
      reviewsByMonth,
      commonKeywords,
      improvementTrends
    };
  }

  // 搜索复盘记录
  async searchReviews(
    userId: string,
    searchTerm: string,
    options?: {
      includePublic?: boolean;
      minRating?: number;
      maxRating?: number;
    }
  ) {
    const where: any = {
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { content: { contains: searchTerm, mode: 'insensitive' } },
        { lessons: { contains: searchTerm, mode: 'insensitive' } },
        { improvements: { contains: searchTerm, mode: 'insensitive' } }
      ]
    };

    if (!options?.includePublic) {
      where.createdBy = userId;
    } else {
      where.OR.push({ createdBy: userId }, { isPublic: true });
    }

    if (options?.minRating !== undefined) {
      where.rating = { gte: options.minRating };
    }

    if (options?.maxRating !== undefined) {
      where.rating = { ...where.rating, lte: options.maxRating };
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        execution: {
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
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reviews.map(review => ({
      id: review.id,
      executionId: review.executionId,
      workflowName: review.execution.workflow?.name,
      title: review.title,
      content: review.content,
      rating: review.rating,
      lessons: review.lessons,
      improvements: review.improvements,
      tags: review.tags,
      isPublic: review.isPublic,
      createdAt: review.createdAt,
      stepsCompleted: review.execution.records?.filter(r => r.status === 'COMPLETED').length || 0,
      totalSteps: review.execution.records?.length || 0
    }));
  }

  // 生成复盘报告
  async generateReviewReport(
    userId: string,
    options?: {
      dateRange?: {
        start: Date;
        end: Date;
      };
      workflowIds?: string[];
      format?: 'summary' | 'detailed';
    }
  ) {
    const where: any = {
      createdBy: userId
    };

    if (options?.dateRange) {
      where.createdAt = {
        gte: options.dateRange.start,
        lte: options.dateRange.end
      };
    }

    if (options?.workflowIds && options.workflowIds.length > 0) {
      where.execution = {
        workflowId: {
          in: options.workflowIds
        }
      };
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        execution: {
          include: {
            workflow: {
              select: {
                name: true,
                category: true
              }
            },
            records: {
              select: {
                status: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const stats = {
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0,
      totalExecutions: reviews.length,
      completionRate: reviews.length > 0 
        ? reviews.reduce((sum, r) => {
            const completed = r.execution.records?.filter(rec => rec.status === 'COMPLETED').length || 0;
            const total = r.execution.records?.length || 0;
            return sum + (total > 0 ? completed / total : 0);
          }, 0) / reviews.length * 100
        : 0
    };

    const summaries: ReviewSummary[] = reviews.map(review => ({
      executionId: review.executionId,
      workflowName: review.execution.workflow?.name,
      executionDate: review.execution.startedAt.toISOString(),
      rating: review.rating,
      content: review.content,
      lessons: review.lessons,
      improvements: review.improvements,
      stepsCompleted: review.execution.records?.filter(r => r.status === 'COMPLETED').length || 0,
      totalSteps: review.execution.records?.length || 0
    }));

    return {
      stats,
      summaries: options?.format === 'summary' ? summaries.slice(0, 5) : summaries,
      generatedAt: new Date().toISOString()
    };
  }

  // 获取复盘详情
  async getReviewDetail(reviewId: string, userId: string) {
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        OR: [
          { createdBy: userId },
          { isPublic: true }
        ]
      },
      include: {
        execution: {
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
          }
        }
      }
    });

    if (!review) {
      throw new Error('复盘记录不存在或无权限访问');
    }

    return {
      id: review.id,
      executionId: review.executionId,
      title: review.title,
      content: review.content,
      rating: review.rating,
      lessons: review.lessons,
      improvements: review.improvements,
      tags: review.tags,
      isPublic: review.isPublic,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      execution: {
        id: review.execution.id,
        workflowName: review.execution.workflow?.name,
        workflowDescription: review.execution.workflow?.description,
        workflowCategory: review.execution.workflow?.category,
        status: review.execution.status,
        startedAt: review.execution.startedAt,
        completedAt: review.execution.completedAt,
        steps: review.execution.records?.map(record => ({
          id: record.id,
          stepName: record.step?.title,
          stepDescription: record.step?.description,
          stepType: record.step?.type,
          status: record.status,
          notes: record.notes,
          reviewNotes: record.reviewNotes,
          completedAt: record.completedAt
        })) || []
      }
    };
  }
}