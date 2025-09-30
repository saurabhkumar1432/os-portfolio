import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, HardDrive, Activity, Zap, X, TrendingUp, TrendingDown } from 'lucide-react';
import { useWindowStore } from '../store/windowStore';
import type { WindowState } from '../types';

interface ProcessInfo {
  id: string;
  name: string;
  type: 'app' | 'system';
  cpu: number;
  memory: number;
  status: 'running' | 'suspended' | 'not responding';
}

export const TaskManagerApp: React.FC = () => {
  const { windows, closeWindow } = useWindowStore();
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [systemStats, setSystemStats] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
  });
  const [sortBy, setSortBy] = useState<keyof ProcessInfo>('cpu');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Generate process data from open windows
  useEffect(() => {
    const updateProcesses = () => {
      const windowProcesses: ProcessInfo[] = Object.values(windows).map((window: WindowState) => ({
        id: window.id,
        name: window.title,
        type: 'app' as const,
        cpu: Math.random() * 30, // Simulated CPU usage
        memory: Math.random() * 200 + 50, // Simulated memory usage in MB
        status: window.minimized ? 'suspended' : 'running' as const,
      }));

      // Add system processes
      const systemProcesses: ProcessInfo[] = [
        {
          id: 'system-1',
          name: 'System',
          type: 'system',
          cpu: Math.random() * 5,
          memory: 150 + Math.random() * 50,
          status: 'running',
        },
        {
          id: 'system-2',
          name: 'Desktop Window Manager',
          type: 'system',
          cpu: Math.random() * 10,
          memory: 80 + Math.random() * 30,
          status: 'running',
        },
        {
          id: 'system-3',
          name: 'Service Host',
          type: 'system',
          cpu: Math.random() * 3,
          memory: 120 + Math.random() * 40,
          status: 'running',
        },
      ];

      setProcesses([...windowProcesses, ...systemProcesses]);

      // Update system stats
      setSystemStats({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100,
        network: Math.random() * 10, // MB/s
      });
    };

    updateProcesses();
    const interval = setInterval(updateProcesses, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [windows]);

  // Sort processes
  const sortedProcesses = [...processes].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const handleSort = (key: keyof ProcessInfo) => {
    if (sortBy === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  const handleEndTask = (process: ProcessInfo) => {
    if (process.type === 'app') {
      closeWindow(process.id);
    } else {
      alert('Cannot end system processes');
    }
  };

  const getStatusColor = (status: ProcessInfo['status']) => {
    switch (status) {
      case 'running':
        return 'text-green-500';
      case 'suspended':
        return 'text-yellow-500';
      case 'not responding':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPerformanceColor = (value: number, max: number = 100) => {
    const percentage = (value / max) * 100;
    if (percentage > 80) return 'text-red-500 bg-red-500/10';
    if (percentage > 60) return 'text-yellow-500 bg-yellow-500/10';
    return 'text-green-500 bg-green-500/10';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Performance Overview */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          System Performance
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CPU */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CPU</span>
              </div>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {systemStats.cpu.toFixed(1)}%
            </div>
            <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-600 dark:bg-blue-400"
                initial={{ width: 0 }}
                animate={{ width: `${systemStats.cpu}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Memory */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Memory</span>
              </div>
              <TrendingDown className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {systemStats.memory.toFixed(1)}%
            </div>
            <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-purple-600 dark:bg-purple-400"
                initial={{ width: 0 }}
                animate={{ width: `${systemStats.memory}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Disk */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Disk</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {systemStats.disk.toFixed(1)}%
            </div>
            <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-600 dark:bg-green-400"
                initial={{ width: 0 }}
                animate={{ width: `${systemStats.disk}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Network */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Network</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {systemStats.network.toFixed(1)} MB/s
            </div>
            <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-orange-600 dark:bg-orange-400"
                initial={{ width: 0 }}
                animate={{ width: `${(systemStats.network / 10) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Processes Table */}
      <div className="flex-1 overflow-hidden flex flex-col p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Processes ({processes.length})
          </h2>
        </div>

        <div className="flex-1 overflow-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('type')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Type {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('cpu')}
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  CPU {sortBy === 'cpu' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('memory')}
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Memory {sortBy === 'memory' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedProcesses.map((process) => (
                <motion.tr
                  key={process.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {process.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      process.type === 'app'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {process.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getStatusColor(process.status)}`}>
                      {process.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <span className={`inline-flex px-2 py-1 text-sm font-medium rounded ${
                      getPerformanceColor(process.cpu)
                    }`}>
                      {process.cpu.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {process.memory.toFixed(0)} MB
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    {process.type === 'app' && (
                      <button
                        onClick={() => handleEndTask(process)}
                        aria-label={`End task ${process.name}`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                        End Task
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskManagerApp;
