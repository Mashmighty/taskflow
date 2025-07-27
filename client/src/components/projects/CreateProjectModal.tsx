import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  key: z.string().min(2, 'Project key must be at least 2 characters').max(10, 'Project key must be at most 10 characters').regex(/^[A-Z]+$/, 'Project key must contain only uppercase letters'),
  description: z.string().optional(),
  endDate: z.string().optional()
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (data: ProjectFormData) => Promise<void>;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema)
  });

  const projectName = watch('name', '');

  // Auto-generate project key from name
  React.useEffect(() => {
    if (projectName) {
      const key = projectName
        .toUpperCase()
        .replace(/[^A-Z\s]/g, '')
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .slice(0, 10);
      
      // You might want to set this value programmatically
    }
  }, [projectName]);

  const onSubmit = async (data: ProjectFormData) => {
    try {
      await onCreateProject(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Project" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Project Name"
          placeholder="Enter project name"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Project Key"
          placeholder="e.g., TASK, PROJ, DEV"
          helperText="2-10 uppercase letters that will prefix your tasks"
          error={errors.key?.message}
          {...register('key')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Describe your project..."
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <Input
          label="End Date (Optional)"
          type="date"
          error={errors.endDate?.message}
          {...register('endDate')}
        />

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
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;