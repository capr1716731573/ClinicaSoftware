import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-skeleton-table',
  imports: [],
  templateUrl: './skeleton-table.component.html',
  styles: `
    .skeleton-table-container {
      border: 1px solid rgba(0, 0, 0, 0.06);
      border-radius: 10px;
      background: #fff;
    }

    /* Hacemos que esta tabla se vea como una data-table moderna (sin depender del CSS global de table) */
    .skeleton-table {
      border: 0;
      border-collapse: separate;
      border-spacing: 0;
      table-layout: fixed;
    }

    .skeleton-table thead th {
      background: #fafafa;
    }

    .skeleton-table tr {
      background-color: transparent;
      border: 0;
    }

    .skeleton-table tbody tr:nth-child(odd) td {
      background: #fff;
    }

    .skeleton-table tbody tr:nth-child(even) td {
      background: #fcfcfc;
    }

    .skeleton-table th,
    .skeleton-table td {
      vertical-align: middle;
      border: 0;
    }

    .skeleton-table thead th {
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }

    .skeleton-table tbody td {
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }

    .skeleton-table tbody tr:last-child td {
      border-bottom: 0;
    }

    .skeleton-th {
      height: 12px;
      width: 90px;
      margin: 6px 0;
    }

    .skeleton-td {
      height: 12px;
      width: 100%;
      max-width: 180px;
      margin: 6px 0;
    }

    .skeleton-td--short {
      max-width: 90px;
    }

    .skeleton-td--medium {
      max-width: 130px;
    }

    /* Variación de anchos para que se vea más natural (encabezados) */
    .skeleton-table thead th:nth-child(1) .skeleton-th { width: 70px; }
    .skeleton-table thead th:nth-child(2) .skeleton-th { width: 140px; }
    .skeleton-table thead th:nth-child(3) .skeleton-th { width: 120px; }
    .skeleton-table thead th:nth-child(4) .skeleton-th { width: 90px; }
    .skeleton-table thead th:nth-child(5) .skeleton-th { width: 110px; }
    .skeleton-table thead th:nth-child(6) .skeleton-th { width: 80px; }

    .skeleton-cell-actions {
      display: flex;
      justify-content: center;
      gap: 8px;
    }

    .skeleton-icon-btn {
      width: 26px;
      height: 26px;
      border-radius: 4px;
    }
  `
})
export class SkeletonTableComponent implements OnChanges {
  // Estructuras para renderizar la tabla skeleton sin depender de data real
  @Input() cols = 6;
  @Input() rowsCount = 6;

  headerCols: any[] = [];
  rows: any[] = [];

  ngOnChanges(_changes: SimpleChanges): void {
    const cols = Number.isFinite(Number(this.cols)) ? Math.max(1, Number(this.cols)) : 6;
    const rows = Number.isFinite(Number(this.rowsCount)) ? Math.max(1, Number(this.rowsCount)) : 6;

    this.headerCols = Array.from({ length: cols });
    this.rows = Array.from({ length: rows });
  }

  constructor() {
    // valores iniciales (por si no hay cambios de inputs)
    this.headerCols = Array.from({ length: this.cols });
    this.rows = Array.from({ length: this.rowsCount });
  }
}
