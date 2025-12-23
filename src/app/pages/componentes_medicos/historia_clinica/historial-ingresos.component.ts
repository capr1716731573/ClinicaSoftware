import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, map, distinctUntilChanged, switchMap, finalize, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CicloHospitalizacionService } from '../../../services/ciclo_hospitalizacion/ciclo_hospitalizacion.service';
import { HistoriaClinicaService } from '../../../services/historia_clinica/historia_clinica.service';
import { LoginService } from '../../../services/login.service';
import { InfoPacienteComponent } from '../../../componentes_reutilizables/info_paciente/info-paciente.component';
import { SkeletonTableComponent } from '../../../componentes_reutilizables/skeleton/skeleton-table.component';

@Component({
  selector: 'app-historial-ingresos',
  imports: [CommonModule, InfoPacienteComponent, SkeletonTableComponent],
  templateUrl: './historial-ingresos.component.html',
  styles: ``
})
export class HistorialIngresosComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _cicloHospService = inject(CicloHospitalizacionService);
  private readonly _historiaClinicaService = inject(HistoriaClinicaService);
  private readonly _loginService = inject(LoginService);

  loading = true;
  hcuParam = 0;

  pacienteInfo: any = null;
  ingresosList: any[] = [];
  count = 0;

  ngOnInit(): void {
    this._route.paramMap
      .pipe(
        map((pm) => Number(pm.get('hcu') ?? 0)),
        distinctUntilChanged(),
        switchMap((hcu) => {
          this.hcuParam = hcu;
          this.loading = true;
          this.pacienteInfo = null;
          this.ingresosList = [];
          this.count = 0;

          if (!hcu) {
            return of({ ingresos: null, hcu: null }).pipe(
              finalize(() => {
                this.loading = false;
              })
            );
          }

          return forkJoin({
            ingresos: this._cicloHospService.getIngresosXHcu(hcu),
            hcu: this._historiaClinicaService.getAllHistoriaClinicaId(hcu, 1),
          }).pipe(
            finalize(() => {
              this.loading = false;
            })
          );
        }),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe(({ ingresos, hcu }: any) => {
        // Historia clínica (para encabezado)
        const hcuData = hcu?.data ?? null;
        if (hcuData) {
          this.pacienteInfo = hcuData;
          this._loginService.setHcuLocalStorage(hcuData); // para mantener consistencia del app-info-paciente en todo el sistema
        }

        // Ingresos
        const rows = ingresos?.rows ?? ingresos?.data ?? [];
        this.ingresosList = Array.isArray(rows) ? rows : [];
        this.count = Number(ingresos?.count ?? this.ingresosList.length ?? 0);
      });
  }

  abrirFormularios(pkCicloHosp: number): void {
    if (!pkCicloHosp) return;
    this._router.navigate(['/historial_forms', pkCicloHosp]);
  }
}
