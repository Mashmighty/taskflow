import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const taskSchema = z.object({
  title: z.string().min(3, 'Task title must be at least 3 characters'),
  description: z.string().optional(),
  type: z.enum(['TASK', 'BUG', 'STORY', 'EPIC']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  assigneeId: z.string().optional(),
  estimatedHours: z.number().min(0).optional(),
  storyPoints: z.number().min(1).max(100).optional(),
  tags: z.string().optional(),
  dueDate: z.string().optional()
});

type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (data: any) => Promise<void>;
  projectId: string;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  projectId
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      type: 'TASK',
      priority: 'MEDIUM'
    }
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      const taskData = {
        ...data,
        projectId,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        estimatedHours: data.estimatedHours || undefined,
        storyPoints: data.storyPoints || undefined
      };
      
      await onCreateTask(taskData);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Task" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <Input
              label="Task Title"
              placeholder="Enter task title"
              error={errors.title?.message}
              {...register('title')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Describe the task..."
                {...register('description')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  {...register('type')}
                >
                  <option value="TASK">Task</option>
                  <option value="BUG">Bug</option>
                  <option value="STORY">Story</option>
                  <option value="EPIC">Epic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  {...register('priority')}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <Input
              label="Due Date"
              type="date"
              error={errors.dueDate?.message}
              {...register('dueDate')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Story Points"
                type="number"
                min="1"
                max="100"
                placeholder="1-100"
                error={errors.storyPoints?.message}
                {...register('storyPoints', { valueAsNumber: true })}
              />

              <Input
                label="Estimated Hours"
                type="number"
                min="0"
                step="0.5"
                placeholder="0.5, 1, 2..."
                error={errors.estimatedHours?.message}
                {...register('estimatedHours', { valueAsNumber: true })}
              />
            </div>

            <Input
              label="Tags"
              placeholder="frontend, urgent, feature (comma separated)"
              helperText="Separate multiple tags with commas"
              {...register('tags')}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
          >
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;