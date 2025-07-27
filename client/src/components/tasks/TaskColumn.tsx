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
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  id,
  title,
  color,
  tasks,
  onEditTask,
  onDeleteTask
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className={`${color} rounded-t-lg px-4 py-3 border-b border-gray-200`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="bg-white text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks Container */}
      <div
        ref={setNodeRef}
        className={`flex-1 bg-white rounded-b-lg p-4 space-y-3 overflow-y-auto min-h-96 ${
          isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : 'border border-gray-200'
        }`}
      >
        <SortableContext items={tasks.map(task => task._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task._id)}
            />
          ))}
          
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              No tasks in {title.toLowerCase()}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default TaskColumn;