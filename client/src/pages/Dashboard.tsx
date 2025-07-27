import React from 'react';

const Dashboard = () => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats Grid - Full Width */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Tasks</div>
          <div className="text-3xl font-bold text-blue-600">24</div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Completed</div>
          <div className="text-3xl font-bold text-green-600">18</div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">In Progress</div>
          <div className="text-3xl font-bold text-orange-600">4</div>
        </div>

        {/* Overdue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Overdue</div>
          <div className="text-3xl font-bold text-red-600">2</div>
        </div>
      </div>

      {/* Recent Tasks - Full Width */}
      <div className="w-full bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Tasks</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-500">Your recent tasks will appear here...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;