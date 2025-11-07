import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkflowStatusType } from '@prisma/client';

@Injectable()
export class WorkflowsService {
  constructor(private prisma: PrismaService) {}

  async createDefaultWorkflow(orgId: string, projectId: string) {
    const workflow = await this.prisma.workflow.create({
      data: {
        orgId,
        projectId,
        name: 'Default Workflow',
        isDefault: true,
      },
    });

    // Tambahkan status default (Todo, In Progress, Done)
    await this.prisma.workflowStatus.createMany({
      data: [
        {
          orgId,
          workflowId: workflow.id,
          name: 'To Do',
          key: 'todo',
          position: 1,
          type: WorkflowStatusType.todo,
        },
        {
          orgId,
          workflowId: workflow.id,
          name: 'In Progress',
          key: 'in_progress',
          position: 2,
          type: WorkflowStatusType.in_progress,
        },
        {
          orgId,
          workflowId: workflow.id,
          name: 'Done',
          key: 'done',
          position: 3,
          type: WorkflowStatusType.done,
        },
      ],
    });

    return workflow;
  }
}
