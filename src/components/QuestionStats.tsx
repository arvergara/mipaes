import React, { useState, useEffect } from 'react';
import { BarChart3, BookOpen, Target, TrendingUp } from 'lucide-react';
import { getQuestionStatsLocal } from '../lib/questionsLocal';

interface QuestionStatsProps {
  className?: string;
}

interface Stats {
  total: number;
  bySubject: Record<string, number>;
  byArea: Record<string, number>;
}

export function QuestionStats({ className = '' }: QuestionStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const questionStats = await getQuestionStatsLocal();
        setStats(questionStats);
      } catch (error) {
        console.error('Error loading question stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const getSubjectName = (code: string) => {
    const names = {
      'M1': 'Matemática 1',
      'M2': 'Matemática 2',
      'L': 'Lenguaje',
      'CB': 'Biología',
      'CF': 'Física',
      'CQ': 'Química',
      'H': 'Historia'
    };
    return names[code as keyof typeof names] || code;
  };

  const getSubjectColor = (code: string) => {
    const colors = {
      'M1': 'bg-blue-500',
      'M2': 'bg-indigo-500',
      'L': 'bg-green-500',
      'CB': 'bg-orange-500',
      'CF': 'bg-red-500',
      'CQ': 'bg-purple-500',
      'H': 'bg-yellow-500'
    };
    return colors[code as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center mb-4">
            <div className="h-6 w-6 bg-gray-200 rounded mr-3"></div>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No se pudieron cargar las estadísticas</p>
        </div>
      </div>
    );
  }

  const topAreas = Object.entries(stats.byArea)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6);

  const maxSubjectCount = Math.max(...Object.values(stats.bySubject));

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      <div className="flex items-center mb-6">
        <BarChart3 className="h-6 w-6 text-indigo-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-900">
          Estadísticas de la Base de Preguntas
        </h3>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Preguntas</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-green-600 font-medium">Materias</p>
              <p className="text-2xl font-bold text-green-900">{Object.keys(stats.bySubject).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-purple-600 font-medium">Áreas Temáticas</p>
              <p className="text-2xl font-bold text-purple-900">{Object.keys(stats.byArea).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Distribution */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Distribución por Materia</h4>
        <div className="space-y-3">
          {Object.entries(stats.bySubject)
            .sort(([,a], [,b]) => b - a)
            .map(([subject, count]) => (
              <div key={subject} className="flex items-center">
                <div className="w-24 text-sm font-medium text-gray-700 flex-shrink-0">
                  {getSubjectName(subject)}
                </div>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 rounded-full h-3 relative overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getSubjectColor(subject)} transition-all duration-500`}
                      style={{ width: `${(count / maxSubjectCount) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right text-sm font-semibold text-gray-900">
                  {count}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Top Areas */}
      {topAreas.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Áreas Temáticas Principales</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topAreas.map(([area, count]) => (
              <div key={area} className="bg-gray-50 p-3 rounded-lg border">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {area}
                  </span>
                  <span className="text-sm font-bold text-gray-900 ml-2">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Datos extraídos de exámenes PAES oficiales 2019-2024
        </p>
      </div>
    </div>
  );
}