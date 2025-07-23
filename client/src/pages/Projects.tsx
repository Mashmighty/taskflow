import React from 'react';

const Projects: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <button className="btn-primary">
          New Project
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Website Redesign</h3>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
          </div>
          <p className="text-gray-600 mb-4">Redesigning the company website with modern UI/UX principles.</p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>12 tasks</span>
            <span>Due: Jan 30, 2025</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Mobile App Development</h3>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Planning</span>
          </div>
          <p className="text-gray-600 mb-4">Building a cross-platform mobile application for task management.</p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>8 tasks</span>
            <span>Due: Mar 15, 2025</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">API Integration</h3>
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Review</span>
          </div>
          <p className="text-gray-600 mb-4">Integrating third-party APIs for enhanced functionality.</p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>5 tasks</span>
            <span>Due: Feb 10, 2025</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;

