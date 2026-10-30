import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  labels: string[];
  incomeData: number[];
  expenseData: number[];
  incomeLabel: string;
  expenseLabel: string;
}

export function BarChart({ labels, incomeData, expenseData, incomeLabel, expenseLabel }: Props) {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? 'rgba(148,163,184,0.1)' : 'rgba(100,116,139,0.1)';

  const data = {
    labels,
    datasets: [
      {
        label: incomeLabel,
        data: incomeData,
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: expenseLabel,
        data: expenseData,
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { color: textColor, boxWidth: 12, padding: 16 } },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${ctx.dataset.label}: Rp ${ctx.raw.toLocaleString('id-ID')}`,
        },
      },
    },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: textColor } },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, callback: (v: any) => 'Rp ' + (v / 1000000).toFixed(1) + 'jt' },
      },
    },
  };

  return <Bar data={data} options={options} />;
}
