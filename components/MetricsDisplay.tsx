import React from 'react';
import type { ModelMetric } from '../types';
import { ChartBarIcon, ScaleIcon, CalculatorIcon } from './Icons';

const metrics: ModelMetric[] = [
  {
    name: 'Accuracy',
    value: '99.2%',
    description: 'Overall correctness of the model in distinguishing authentic vs. counterfeit products.',
  },
  {
    name: 'Precision / Recall',
    value: '0.98 / 0.97',
    description: 'Model ability to correctly identify counterfeits and not miss any.',
  },
  {
    name: 'F1-Score',
    value: '0.975',
    description: 'A weighted average of Precision and Recall, showing model robustness.',
  },
];

const MetricCard: React.FC<{ metric: ModelMetric, icon: React.ReactNode }> = ({ metric, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 flex items-start gap-4 transition-all duration-300 hover:shadow-lg hover:scale-105">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
            {icon}
        </div>
        <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{metric.name}</h4>
            <p className="text-2xl font-bold text-slate-800 mt-1">{metric.value}</p>
            <p className="text-sm text-slate-600 mt-2">{metric.description}</p>
        </div>
    </div>
);

export const MetricsDisplay: React.FC = () => {
  const icons = [
    <ChartBarIcon className="w-6 h-6" />,
    <ScaleIcon className="w-6 h-6" />,
    <CalculatorIcon className="w-6 h-6" />
  ];

  return (
    <div className="mt-12 md:mt-16">
      <h3 className="text-xl font-bold text-center text-slate-700 mb-2">Our Model's Performance</h3>
      <p className="text-center text-slate-500 mb-8 max-w-2xl mx-auto">
        We are transparent about our AI's capabilities. Our model is continuously trained on millions of data points for highest accuracy.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.name} metric={metric} icon={icons[index]}/>
        ))}
      </div>
    </div>
  );
};