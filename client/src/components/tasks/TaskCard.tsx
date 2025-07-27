import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Calendar, 
  Clock, 
  MoreVertical, 
  AlertCircle, 
  Bug, 
  BookOpen, 
  CheckSquare,
  Zap
} from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { Task } from '../../pages/TaskBoard';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  isDragging?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  isDragging = false 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800'
  };

  const typeIcons = {
    TASK: CheckSquare,
    BUG: Bug,
    STORY: BookOpen,
    EPIC: Zap
  };

  const typeColors = {
    TASK: 'text-blue-600',
    BUG: 'text-red-600',
    STORY: 'text-green-600',
    EPIC: 'text-purple-600'
  };

  const TypeIcon = typeIcons[task.type];
  const isOverdue = task.dueDate && isAfter(new Date(), new Date(task.dueDate));
  const isDueSoon = task.dueDate && 
    isBefore(new Date(), new Date(task.dueDate)) && 
    isBefore(new Date(task.dueDate), new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)); // 3 days

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-grab
        ${sortableIsDragging || isDragging ? 'opacity-50 rotate-2 shadow-lg' : ''}
        ${isOverdue ? 'border-red-300' : ''}
        ${isDueSoon ? 'border-yellow-300' : ''}
      `}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <TypeIcon size={16} className={typeColors[task.type]} />
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
          >
            <MoreVertical size={16} />
          </button>
        </div>

        {/* Title & Description */}
        <div className="mb-3">
          <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-gray-600 text-xs line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="text-gray-500 text-xs">
                +{task.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className={`flex items-center gap-1 mb-3 text-xs ${
            isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-gray-500'
          }`}>
            <Calendar size={12} />
            <span>Due {format(new Date(task.dueDate), 'MMM d')}</span>
            {isOverdue && <AlertCircle size={12} />}
          </div>
        )}

        {/* Story Points & Hours */}
        {(task.storyPoints || task.estimatedHours) && (
          <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
            {task.storyPoints && (
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xs font-medium">{task.storyPoints}</span>
                </div>
                <span>SP</span>
              </div>
            )}
            {task.estimatedHours && (
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{task.estimatedHours}h</span>
              </div>
            )}
          </div>
        )}

        {/* Assignee */}
        <div className="flex items-center justify-between">
          {task.assignee ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {task.assignee.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-gray-600">{task.assignee.name}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-500">Unassigned</span>
          )}

          {/* Task ID */}
          <span className="text-xs text-gray-400">
            #{task._id.slice(-6)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;