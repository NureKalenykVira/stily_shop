import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, type ChartData, type ChartOptions } from 'chart.js';
import { AdminAnalyticsService, SummaryDTO, ByDayDTO } from '../../../services/admin-analytics.service';
Chart.register(...registerables);

@Component({
  standalone: true,
  selector: 'app-admin-analytics',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent {
  constructor(private api: AdminAnalyticsService) { this.load(); }

  private _summary = signal<SummaryDTO | null>(null);
  totalRevenueMonth()   { return this._summary()?.revenue_month ?? 0; }
  totalCustomers()      { return this._summary()?.total_customers ?? 0; }
  avgCheck()            { return this._summary()?.avg_check ?? 0; }
  medianCheck()         { return this._summary()?.median_check ?? 0; }
  mostFrequentProduct() { return this._summary()?.most_frequent_product ?? '—'; }
  minDay()              { return this._summary()?.min_day ?? null; }
  maxDay()              { return this._summary()?.max_day ?? null; }

  customersByDayBarData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Покупці', borderWidth: 0, barThickness: 18, maxBarThickness: 22 }
    ]
  };

  customersByDayBarOpts: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { left: 8, right: 12, top: 8, bottom: 18 } },
    plugins: { legend: { display: false } },
    scales: {
      x: {
        offset: true,
        grid: { display: false },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
          padding: 6
        },
        grace: '10%'
      },
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  topProductsData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Од., шт.', borderWidth: 0, barThickness: 22, maxBarThickness: 26 }]
  };
  topProductsOpts: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0 } },
      y: { grid: { display: false } }
    }
  };

  companionsData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Замовлень разом', borderWidth: 0, barThickness: 22, maxBarThickness: 26 }]
  };
  companionsOpts: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0 } },
      y: { grid: { display: false } }
    }
  };

  barHeight(data: ChartData<'bar'>): number {
    const n = (data.labels?.length ?? 0);
    return Math.max(320, n * 28);
  }

  pairsFrequentData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Замовлень', borderWidth: 0, barThickness: 22, maxBarThickness: 26 }] };
  pairsRareData:     ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Замовлень', borderWidth: 0, barThickness: 22, maxBarThickness: 26 }] };

  pairsOpts: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    layout: { padding: { right: 12 } },
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0, padding: 4 }, grace: '10%' },
      y: { grid: { display: false } }
    }
  };

  private load() {
    this.api.summary().subscribe(s => this._summary.set(s));
    this.api.byDay().subscribe(rows => {
      const labels = rows.map(r => r.date.slice(5));
      const data   = rows.map(r => r.customers);
      this.customersByDayBarData = { labels, datasets: [{ data, label: 'Покупці', borderWidth: 0, barThickness: 18, maxBarThickness: 22 }] };
    });

    this.api.topProducts().subscribe(rows => {
      this.topProductsData = {
        labels: rows.map(r => r.label),
        datasets: [{ data: rows.map(r => r.value), label: 'Од., шт.', borderWidth: 0, barThickness: 24, maxBarThickness: 28 }]
      };
    });

    this.api.companionsPopular().subscribe(rows => {
      this.companionsData = {
        labels: rows.map(r => r.label),
        datasets: [{ data: rows.map(r => r.value), label: 'К-сть замовлень разом', borderWidth: 0, barThickness: 24, maxBarThickness: 28 }]
      };
    });

    this.api.pairsFrequent().subscribe(rows => {
      this.pairsFrequentData = {
        labels: rows.map(r => r.label),
        datasets: [{ data: rows.map(r => r.value), label: 'Замовлень', borderWidth: 0, barThickness: 22, maxBarThickness: 26 }]
      };
    });

    this.api.pairsRare().subscribe(rows => {
      this.pairsRareData = {
        labels: rows.map(r => r.label),
        datasets: [{ data: rows.map(r => r.value), label: 'Замовлень', borderWidth: 0, barThickness: 22, maxBarThickness: 26 }]
      };
    });

    this.api.paymentMethods().subscribe(rows => {
      this.paymentData  = { labels: (rows as any[]).map(r => (r as any).Label),
                          datasets: [{ data: (rows as any[]).map(r => (r as any).Value) }] };
    });

    this.api.deliveryMethods().subscribe(rows => {
      this.deliveryData = { labels: (rows as any[]).map(r => (r as any).Label),
                            datasets: [{ data: (rows as any[]).map(r => (r as any).Value) }] };
    });

    this.api.revenueByDay().subscribe(rows => {
      this.revenueLineData = {
        labels: rows.map(r=>r.date),
        datasets: [{ data: rows.map(r=>r.revenue), label: 'Виручка', tension: 0.25, pointRadius: 3, fill: false }]
      };
    });
  }

  paymentData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [] }] };
  paymentOpts: ChartOptions<'doughnut'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    layout: { padding: { top: 0, bottom: 0 } }
  };

  deliveryData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [] }] };
  deliveryOpts: ChartOptions<'doughnut'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    layout: { padding: { top: 0, bottom: 0 } }
  };

  revenueLineData: ChartData<'line'> = {
    labels: [], datasets: [{ data: [], label: 'Виручка', tension: 0.25, pointRadius: 3, fill: false }]
  };
  revenueLineOpts: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          callback: function (value) {
            const lbl = (this as any).getLabelForValue(value as number) as string;
            return (Number(value) % 3 === 0) ? lbl.slice(5) : '';
          }
        }
      },
      y: { beginAtZero: true }
    }
  };
}
