import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  Bug, 
  BookOpen, 
  CheckSquare,
  Zap,
  Trash2
} from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { Task, TaskPriority, TaskType } from '../../pages/TaskBoard';

interface TaskCardProps {
  task: Task;
  onDelete: () => void;
  isDragging?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
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

  const priorityConfig = {
    [TaskPriority.LOW]: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-400' },
    [TaskPriority.MEDIUM]: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-400' },
    [TaskPriority.HIGH]: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-400' },
    [TaskPriority.CRITICAL]: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-400' }
  };

  const typeConfig = {
    [TaskType.TASK]: { icon: CheckSquare, color: 'text-blue-600' },
    [TaskType.BUG]: { icon: Bug, color: 'text-red-600' },
    [TaskType.STORY]: { icon: BookOpen, color: 'text-green-600' },
    [TaskType.EPIC]: { icon: Zap, color: 'text-purple-600' }
  };

  const TypeIcon = typeConfig[task.type].icon;
  const priority = priorityConfig[task.priority];
  const typeColor = typeConfig[task.type].color;
  
  const isOverdue = task.dueDate && isAfter(new Date(), new Date(task.dueDate));
  const isDueSoon = task.dueDate && 
    isBefore(new Date(), new Date(task.dueDate)) && 
    isBefore(new Date(task.dueDate), new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing
        ${sortableIsDragging || isDragging ? 'opacity-50 rotate-1 shadow-lg scale-105 z-50' : ''}
        ${isOverdue ? 'border-red-300 bg-red-50' : ''}
        ${isDueSoon ? 'border-yellow-300 bg-yellow-50' : ''}
      `}
    >
      <div className="p-4">
        {/* Header with Type, Priority and Delete */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <TypeIcon size={16} className={typeColor} />
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${priority.dot}`}></div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${priority.bg} ${priority.text}`}>
                {task.priority}
              </span>
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Title & Description */}
        <div className="mb-3">
          <h4 className="font-medium text-gray-900 text-sm leading-tight mb-1">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
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
                className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="text-gray-500 text-xs">
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className={`flex items-center gap-1 mb-3 text-xs ${
            isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-700' : 'text-gray-500'
          }`}>
            <Calendar size={12} />
            <span>Due {format(new Date(task.dueDate), 'MMM d')}</span>
            {isOverdue && <AlertCircle size={12} className="text-red-500" />}
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
                {task.actualHours && (
                  <span className="text-gray-400">/ {task.actualHours}h</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer with Assignee and Task ID */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {task.assignee ? (
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: `hsl(${task.assignee.name.charCodeAt(0) * 10}, 70%, 50%)` }}
              >
                {task.assignee.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-gray-600 truncate max-w-20">
                {task.assignee.name.split(' ')[0]}
              </span>
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">Unassigned</span>
          )}

          <span className="text-xs text-gray-400 font-mono">
            #{task._id.slice(-6).toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;