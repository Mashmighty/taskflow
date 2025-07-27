import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { Plus, Filter, Search } from 'lucide-react';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TaskColumn from '../components/tasks/TaskColumn';
import TaskCard from '../components/tasks/TaskCard';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import EditTaskModal from '../components/tasks/EditTaskModal';
import { useTasks } from '../hooks/useTasks';
import { useProject } from '../hooks/useProject';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE'
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: 'TASK' | 'BUG' | 'STORY' | 'EPIC';
  assignee?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  reporter: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  estimatedHours?: number;
  actualHours?: number;
  storyPoints?: number;
  tags: string[];
  dueDate?: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

const TaskBoard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('');

  const { project, loading: projectLoading } = useProject(projectId!);
  const { 
    tasksByStatus, 
    loading: tasksLoading, 
    createTask, 
    updateTask, 
    updateTaskPosition,
    deleteTask 
  } = useTasks(projectId!);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  const columns = [
    { id: TaskStatus.TODO, title: 'To Do', color: 'bg-gray-100' },
    { id: TaskStatus.IN_PROGRESS, title: 'In Progress', color: 'bg-blue-100' },
    { id: TaskStatus.IN_REVIEW, title: 'In Review', color: 'bg-yellow-100' },
    { id: TaskStatus.DONE, title: 'Done', color: 'bg-green-100' }
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = Object.values(tasksByStatus)
      .flat()
      .find(task => task._id === active.id);
    
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeTaskId = active.id as string;
    const overTaskId = over.id as string;

    // Find the active task
    const activeTask = Object.values(tasksByStatus)
      .flat()
      .find(task => task._id === activeTaskId);

    if (!activeTask) return;

    // Determine if we're over a column or a task
    const overColumn = columns.find(col => col.id === overTaskId);
    const overTask = Object.values(tasksByStatus)
      .flat()
      .find(task => task._id === overTaskId);

    const newStatus = overColumn ? overColumn.id : overTask?.status;

    if (newStatus && activeTask.status !== newStatus) {
      // Update task status locally for smooth UX
      updateTaskPosition(activeTaskId, newStatus, 0);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overTaskId = over.id as string;

    // Find the active task
    const activeTask = Object.values(tasksByStatus)
      .flat()
      .find(task => task._id === activeTaskId);

    if (!activeTask) return;

    // Determine the new status and position
    const overColumn = columns.find(col => col.id === overTaskId);
    const overTask = Object.values(tasksByStatus)
      .flat()
      .find(task => task._id === overTaskId);

    const newStatus = overColumn ? overColumn.id : overTask?.status || activeTask.status;
    const tasksInNewStatus = tasksByStatus[newStatus] || [];

    let newPosition = 0;

    if (overTask && !overColumn) {
      // Dropped on a task - calculate position
      const overTaskIndex = tasksInNewStatus.findIndex(task => task._id === overTaskId);
      newPosition = overTaskIndex;
    } else {
      // Dropped on column - add to end
      newPosition = tasksInNewStatus.length;
    }

    // Update task position via API
    try {
      await updateTaskPosition(activeTaskId, newStatus, newPosition);
    } catch (error) {
      console.error('Failed to update task position:', error);
    }
  };

  const filteredTasks = (tasks: Task[]) => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = !filterPriority || task.priority === filterPriority;
      
      return matchesSearch && matchesPriority;
    });
  };

  if (projectLoading || tasksLoading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading task board...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">Project not found</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>

            {/* Add Task Button */}
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* Task Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="h-full px-4 sm:px-6 lg:px-8 py-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-4 gap-6 h-full">
              {columns.map((column) => {
                const tasks = filteredTasks(tasksByStatus[column.id] || []);
                
                return (
                  <TaskColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    color={column.color}
                    tasks={tasks}
                    onEditTask={setEditingTask}
                    onDeleteTask={deleteTask}
                  />
                );
              })}
            </div>

            <DragOverlay
              dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                  styles: {
                    active: {
                      opacity: '0.5',
                    },
                  },
                }),
              }}
            >
              {activeTask ? (
                <TaskCard
                  task={activeTask}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  isDragging
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={createTask}
        projectId={projectId!}
      />

      {editingTask && (
        <EditTaskModal
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onUpdateTask={updateTask}
          task={editingTask}
        />
      )}
    </div>
  );
};

export default TaskBoard;