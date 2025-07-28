import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { Task } from '../../pages/TaskBoard';

interface TaskColumnProps {
  id: string;
  title: string;
  color: string;
  count: number;
  tasks: Task[];
  onDeleteTask: (taskId: string) => void;
  isLoading?: boolean;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  id,
  title,
  color,
  count,
  tasks,
  onDeleteTask,
  isLoading = false
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className={`${color} rounded-t-lg px-4 py-3 border-b border-gray-200 flex-shrink-0`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="bg-white text-gray-600 text-xs font-medium px-2 py-1 rounded-full min-w-[24px] text-center">
            {count}
          </span>
        </div>
      </div>

      {/* Tasks Container */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 bg-white rounded-b-lg p-3 space-y-3 overflow-y-auto min-h-[500px] max-h-[calc(100vh-300px)] border-l border-r border-b border-gray-200
          ${isOver ? 'bg-blue-50 border-blue-300 border-dashed border-2' : ''}
          transition-all duration-200
        `}
      >
        <SortableContext items={tasks.map(task => task._id)} strategy={verticalListSortingStrategy}>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onDelete={() => onDeleteTask(task._id)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-gray-300 text-lg">○</span>
              </div>
              <p>No tasks in {title.toLowerCase()}</p>
              {id === 'TODO' && (
                <p className="text-xs mt-1 text-center">Drag tasks here or create new ones</p>
              )}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default TaskColumn;