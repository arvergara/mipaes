import React from 'react';
import { BookOpen, Brain, Calculator, FlaskRound as Flask, TestTube, Atom, History } from 'lucide-react';
import type { Subject } from '../types';

interface SubjectCardProps {
  subject: Subject;
  onSelect: (subject: Subject) => void;
}

const subjectConfig = {
  M1: {
    title: 'Matemática 1',
    description: 'Álgebra y funciones',
    icon: Calculator,
    color: 'bg-blue-600',
  },
  M2: {
    title: 'Matemática 2',
    description: 'Geometría y probabilidad',
    icon: Brain,
    color: 'bg-purple-600',
  },
  L: {
    title: 'Lenguaje',
    description: 'Comprensión lectora',
    icon: BookOpen,
    color: 'bg-orange-500',
  },
  CB: {
    title: 'Ciencias - Biología',
    description: 'Biología',
    icon: Flask,
    color: 'bg-emerald-600',
  },
  CF: {
    title: 'Ciencias - Física',
    description: 'Física',
    icon: Atom,
    color: 'bg-green-600',
  },
  CQ: {
    title: 'Ciencias - Química',
    description: 'Química',
    icon: TestTube,
    color: 'bg-teal-600',
  },
  H: {
    title: 'Historia',
    description: 'Historia y ciencias sociales',
    icon: History,
    color: 'bg-amber-500',
  },
  ALL: {
    title: 'Todas las Materias',
    description: 'Práctica completa',
    icon: BookOpen,
    color: 'bg-gray-700',
  },
};

export function SubjectCard({ subject, onSelect }: SubjectCardProps) {
  const config = subjectConfig[subject];
  const Icon = config.icon;

  return (
    <button
      onClick={() => onSelect(subject)}
      className={`${config.color} text-white p-6 rounded-xl shadow-lg hover:scale-105 transition-transform duration-200 w-full`}
    >
      <div className="flex items-center space-x-4">
        <Icon className="h-8 w-8" />
        <div className="text-left">
          <h3 className="text-xl font-bold">{config.title}</h3>
          <p className="text-sm opacity-90">{config.description}</p>
        </div>
      </div>
    </button>
  );
}