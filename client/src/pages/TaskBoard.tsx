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
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Plus, Search, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TaskColumn from '../components/tasks/TaskColumn';
import TaskCard from '../components/tasks/TaskCard';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import { useTasks } from '../hooks/useTasks';
import { useProject } from '../hooks/useProject';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum TaskType {
  TASK = 'TASK',
  BUG = 'BUG',
  STORY = 'STORY',
  EPIC = 'EPIC'
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('');

  const { project, loading: projectLoading } = useProject(projectId!);
  const { 
    tasksByStatus, 
    loading: tasksLoading, 
    createTask, 
    updateTaskPosition,
    deleteTask 
  } = useTasks(projectId!);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns = [
    { id: TaskStatus.TODO, title: 'To Do', color: 'bg-slate-100', count: tasksByStatus[TaskStatus.TODO]?.length || 0 },
    { id: TaskStatus.IN_PROGRESS, title: 'In Progress', color: 'bg-blue-100', count: tasksByStatus[TaskStatus.IN_PROGRESS]?.length || 0 },
    { id: TaskStatus.IN_REVIEW, title: 'In Review', color: 'bg-yellow-100', count: tasksByStatus[TaskStatus.IN_REVIEW]?.length || 0 },
    { id: TaskStatus.DONE, title: 'Done', color: 'bg-green-100', count: tasksByStatus[TaskStatus.DONE]?.length || 0 }
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overTaskId = over.id as string;

    const activeTask = Object.values(tasksByStatus)
      .flat()
      .find(task => task._id === activeTaskId);

    if (!activeTask) return;

    const overColumn = columns.find(col => col.id === overTaskId);
    const overTask = Object.values(tasksByStatus)
      .flat()
      .find(task => task._id === overTaskId);

    const newStatus = overColumn ? overColumn.id : overTask?.status || activeTask.status;
    const tasksInNewStatus = tasksByStatus[newStatus] || [];

    let newPosition = 0;

    if (overTask && !overColumn) {
      const overTaskIndex = tasksInNewStatus.findIndex(task => task._id === overTaskId);
      newPosition = overTaskIndex;
    } else {
      newPosition = tasksInNewStatus.length;
    }

    if (activeTask.status !== newStatus) {
      try {
        await updateTaskPosition(activeTaskId, newStatus, newPosition);
      } catch (error) {
        console.error('Failed to update task position:', error);
      }
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

  if (projectLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
          <Link to="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col space-y-4">
          {/* Back Button & Title */}
          <div className="flex items-center space-x-4">
            <Link to="/projects">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Back to Projects
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600 mt-1">{project.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              {/* Priority Filter */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={16} />
                Add Task
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Board */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-4 sm:p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
              {columns.map((column) => {
                const tasks = filteredTasks(tasksByStatus[column.id] || []);
                
                return (
                  <TaskColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    color={column.color}
                    count={tasks.length}
                    tasks={tasks}
                    onDeleteTask={deleteTask}
                    isLoading={tasksLoading}
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
                  onDelete={() => {}}
                  isDragging
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={createTask}
        projectId={projectId!}
      />
    </div>
  );
};

export default TaskBoard;