import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js/auto';

@Component({
  selector: 'app-graficas',
  imports: [],
  templateUrl: './graficas.component.html',
  styles: ``
})
export class GraficasComponent implements AfterViewInit {
  @Input('tipoGrafico') tipoGrafico: string = "linea";
  @Input('leyenda') leyenda: string = "leyenda";
  @Input('labels') labels: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'];
  @Input('valores') valores: number[] = [11, 11, 11, 11, 11];
  @Input('label_x') label_x: string = "Label X";
  @Input('label_y') label_y: string = "Label Y";

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    if(this.tipoGrafico=="linea"){
      this.dibujarChartLinea();
    } else if(this.tipoGrafico=="donut"){
      this.dibujarCharDonut();
    }    
  }

  dibujarChartLinea(){
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [
          {
            label: this.leyenda,
            data: this.valores,
            fill: false,
            borderColor: 'rgba(75, 192, 192, 1)',
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: this.label_x,
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: this.label_y,
            },
          },
        },
      },
    }
    new Chart(ctx, config);
  }

  dibujarCharDonut(){
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: this.labels,
        datasets: [
          {
            label: this.leyenda,
            data: this.valores,
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      },
    };

    new Chart(ctx, config);
  
  }
}