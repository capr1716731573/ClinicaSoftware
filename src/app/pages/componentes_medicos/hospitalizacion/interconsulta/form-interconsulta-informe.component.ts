import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';

import { MenuHospitalizacionComponent } from '../../../../componentes_reutilizables/menu_izq/menu.component';
import { SkeletonCrudComponent } from '../../../../componentes_reutilizables/skeleton/skeleton-crud.component';
import { CasasSaludService } from '../../../../services/casas_salud/casas_salud.service';
import { CieService } from '../../../../services/cie/cie.service';
import { InterconsultaService } from '../../../../services/hospitalizacion/interconsulta/interconsulta.service';
import { LoginService } from '../../../../services/login.service';
import {
  InterconsultaDiagnostico,
  InterconsultaRespuesta,
} from './interconsulta.interface';

declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-form-interconsulta-informe',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MenuHospitalizacionComponent,
    NgSelectModule,
    SkeletonCrudComponent,
  ],
  templateUrl: './form-interconsulta-informe.component.html',
  styles: ``,
})
export class FormInterconsultaInformeComponent {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _interconsultaService = inject(InterconsultaService);
  private _casaSaludService = inject(CasasSaludService);
  private _loginService = inject(LoginService);
  private _cieService = inject(CieService);

  tabActivo: 'B' | 'C' | 'D' | 'E' | 'F' = 'B';
  opcion: 'I' | 'U' = 'I';
  accionVer = false;
  idSol = 0;
  idInf = 0;
  casaSaludBody: any = {};

  informeBody!: InterconsultaRespuesta;

  listDiagnosticos: any[] = [];
  diagnosticoBody: InterconsultaDiagnostico = {
    pk_interdiag: 0,
    fk_interconsulta: 0,
    tipo_interconsulta: 'R',
    fk_cie: 0,
    fecha_creacion_interdiag: null,
    fecha_modificacion_interdiag: null,
    tipo_interdiag: '',
  };
  diagnosticoTipos = [
    { value: 'presuntivos', label: 'Presuntivo' },
    { value: 'definitivos', label: 'Definitivo' },
  ];
  listCie10: any[] = [];
  idCie: any;
  typeahead = new Subject<string>();
  isLoading = false;
  loading = false;

  constructor() {
    this.getCasaSalud();
    this.inicializarInforme();
  }

  ngOnInit(): void {
    this._route.paramMap.subscribe((pm) => {
      this.idSol = Number(pm.get('id_sol') ?? 0);
      this.idInf = Number(pm.get('id_inf') ?? 0);
      const accionParam = (pm.get('accion') ?? '').toLowerCase();
      this.accionVer =
        accionParam === 'true' || accionParam === '1' || accionParam === 'ver';

      if (this.idInf && !isNaN(this.idInf) && this.idInf !== 0) {
        this.opcion = 'U';
        this.loading = true;
        this.editarInforme(this.idInf);
        this.getListaDiagnosticos();
      } else {
        this.opcion = 'I';
        this.loading = false;
        this.inicializarInforme();
      }
    });
  }

  getCasaSalud(): void {
    this._casaSaludService.getCasaSaludPrincipal().subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.casaSaludBody = resp.rows;
        }
      },
      error: (err) => {
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Casas de Salud - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  inicializarInforme(): void {
    this.informeBody = {
      pk_interresp: 0,
      fecha_creacion_interresp: null,
      fecha_modificacion_interresp: null,
      fecha_inicio: '',
      hora_inicio: '',
      fecha_fin: '',
      hora_fin: '',
      casalud_id_fk: this.casaSaludBody?.casalud_id_pk ?? 0,
      fk_hcu: this._loginService.getHcuLocalStorage()?.fk_hcu ?? 0,
      medico_usu_id_fk:
        this._loginService.getUserLocalStorage()?.pk_usuario ?? 0,
      fk_intersol: this.idSol || null,
      cuadro_clinico_interresp: '',
      resultados_criterio_interresp: '',
      plan_diagnostico_interresp: '',
      plan_terapeutico_interresp: '',
    };
  }

  editarInforme(pk_interresp: number): void {
    this._interconsultaService
      .getInterconsultaRespuestaId(pk_interresp, 1)
      .subscribe({
        next: (resp) => {
          if (resp.status === 'ok') {
            this.parametrizarInforme(resp.data);
          }
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          toastr.error(
            'Error',
            `${err} - Datos no cargados de Informe Interconsulta ${pk_interresp}`
          );
        },
      });
  }

  private parametrizarInforme(src: any): void {
    this.informeBody = {
      pk_interresp: Number(src?.pk_interresp) || 0,
      fecha_creacion_interresp: src?.fecha_creacion_interresp ?? null,
      fecha_modificacion_interresp: src?.fecha_modificacion_interresp ?? null,
      fecha_inicio: src?.fecha_inicio ?? '',
      hora_inicio: this.normalizeHour(src?.hora_inicio),
      fecha_fin: src?.fecha_fin ?? '',
      hora_fin: this.normalizeHour(src?.hora_fin),
      casalud_id_fk:
        Number(src?.casalud_id_fk) || this.casaSaludBody?.casalud_id_pk || 0,
      fk_hcu:
        Number(src?.fk_hcu) ||
        this._loginService.getHcuLocalStorage()?.fk_hcu ||
        0,
      medico_usu_id_fk:
        Number(src?.medico_usu_id_fk) ||
        this._loginService.getUserLocalStorage()?.pk_usuario ||
        0,
      fk_intersol: Number(src?.fk_intersol) || this.idSol || null,
      cuadro_clinico_interresp: src?.cuadro_clinico_interresp ?? '',
      resultados_criterio_interresp: src?.resultados_criterio_interresp ?? '',
      plan_diagnostico_interresp: src?.plan_diagnostico_interresp ?? '',
      plan_terapeutico_interresp: src?.plan_terapeutico_interresp ?? '',
    };
  }

  private normalizeHour(hour: any): string {
    if (!hour) return '';
    const val = String(hour).trim();
    if (val.length === 5) {
      return val;
    }
    if (val.length >= 8) {
      return val.substring(0, 5);
    }
    return val;
  }

  guardarInforme(): void {
    if (!this.validarGuardar()) {
      toastr.warning('Atención', 'Complete la información obligatoria.');
      return;
    }

    this.informeBody.casalud_id_fk = this.casaSaludBody?.casalud_id_pk ?? 0;
    this.informeBody.fk_hcu =
      this._loginService.getHcuLocalStorage()?.fk_hcu ?? 0;
    this.informeBody.medico_usu_id_fk =
      this._loginService.getUserLocalStorage()?.pk_usuario ?? 0;
    this.informeBody.fk_intersol = this.idSol || null;

    const payload = this.sanitizeStrings(
      JSON.parse(JSON.stringify(this.informeBody))
    );

    Swal.fire({
      title: '¿Está seguro?',
      text: `Desea guardar el informe de interconsulta`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._interconsultaService
          .guardarInterconsultaRespuesta(payload, this.opcion)
          .subscribe({
            next: (resp) => {
              if (resp.status === 'ok') {
                this.opcion = 'U';
                this.informeBody.pk_interresp = resp.data.pk_interresp;
                this.idInf = resp.data.pk_interresp;
                toastr.success('Éxito', `Informe guardado correctamente`);
                this._router.navigate([
                  '/form_interconsulta_informe',
                  this.idSol,
                  resp.data.pk_interresp,
                  false,
                ]);
                this.getListaDiagnosticos();
              } else {
                toastr.error(
                  'Error',
                  `Problema al registrar el informe de interconsulta`
                );
              }
            },
            error: (err) => {
              toastr.error('Error', `${err} - Problema al registrar el informe`);
            },
          });
      }
    });
  }

  cerrarFormulario(): void {
    this._router.navigate(['/interconsultas']);
  }

  validarGuardar(): boolean {
    const b = this.informeBody;
    if (!b) return false;

    const fkHcuOk = b.fk_hcu !== null && b.fk_hcu !== undefined && b.fk_hcu !== 0;
    const medicoOk =
      b.medico_usu_id_fk !== null &&
      b.medico_usu_id_fk !== undefined &&
      b.medico_usu_id_fk !== 0;
    const fkIntersolOk =
      b.fk_intersol !== null && b.fk_intersol !== undefined && b.fk_intersol !== 0;
    const cuadroOk =
      b.cuadro_clinico_interresp !== null &&
      b.cuadro_clinico_interresp !== undefined &&
      (b.cuadro_clinico_interresp ?? '').trim() !== '';

    return fkHcuOk && medicoOk && fkIntersolOk && cuadroOk;
  }

  private sanitizeStrings(obj: any): any {
    Object.keys(obj || {}).forEach((key) => {
      const value = obj[key];
      if (typeof value === 'string') {
        obj[key] = value.replace(/'/g, '"');
      } else if (typeof value === 'object' && value !== null) {
        this.sanitizeStrings(value);
      }
    });
    return obj;
  }

  // ---------------- Diagnósticos -----------------
  getListaDiagnosticos(): void {
    if (!this.idInf) {
      this.listDiagnosticos = [];
      return;
    }
    this._interconsultaService.getDiagnosticos(this.idInf, 'R').subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listDiagnosticos = resp.rows ?? [];
        }
      },
      error: (err) => {
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Diagnósticos Informe - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  nuevoDiagnostico(): void {
    this.diagnosticoBody = {
      pk_interdiag: 0,
      fk_interconsulta: this.informeBody.pk_interresp,
      tipo_interconsulta: 'R',
      fk_cie: 0,
      fecha_creacion_interdiag: null,
      fecha_modificacion_interdiag: null,
      tipo_interdiag: '',
    };
    this.idCie = null;
    this.listCie10 = [];
    $('#diagnosticoInformeModal').modal('show');
  }

  validarGuardarDiagnostico(): boolean {
    return (
      !!this.diagnosticoBody.fk_interconsulta &&
      !!this.diagnosticoBody.fk_cie &&
      (this.diagnosticoBody.tipo_interdiag ?? '').trim() !== ''
    );
  }

  guardarDiagnostico(): void {
    if (!this.validarGuardarDiagnostico()) {
      toastr.warning(
        'Atención',
        'Debe seleccionar un diagnóstico CIE10 y un tipo.'
      );
      return;
    }

    Swal.fire({
      title: '¿Está seguro?',
      text: `Desea guardar el diagnóstico seleccionado`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._interconsultaService
          .guardarDiagnostico(this.diagnosticoBody, 'I')
          .subscribe({
            next: (resp) => {
              if (resp.status === 'ok') {
                this.getListaDiagnosticos();
                $('#diagnosticoInformeModal').modal('hide');
                toastr.success('Éxito', `Diagnóstico agregado!`);
              } else {
                toastr.error(
                  'Error',
                  `Problema al crear diagnóstico - Posible duplicado`
                );
              }
            },
            error: (err) => {
              toastr.error('Error', `${err} - Problema al crear diagnóstico`);
            },
          });
      }
    });
  }

  eliminarDiagnostico(diagnostico: any): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: `Desea eliminar el diagnóstico seleccionado`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._interconsultaService
          .guardarDiagnostico(diagnostico, 'D')
          .subscribe({
            next: (resp) => {
              if (resp.status === 'ok') {
                this.getListaDiagnosticos();
                toastr.success('Éxito', `Diagnóstico eliminado!`);
              } else {
                toastr.error('Error', `Problema al eliminar diagnóstico`);
              }
            },
            error: (err) => {
              toastr.error('Error', `${err} - Problema al eliminar diagnóstico`);
            },
          });
      }
    });
  }

  onSearchCie(term: any): void {
    const bsq = term.term;
    if (bsq.length < 3) {
      this.listCie10 = [];
      return;
    }

    this.isLoading = true;
    this._cieService.getBsqCie(bsq).subscribe({
      next: (resp) => {
        this.isLoading = false;
        this.listCie10 =
          resp.status === 'ok' && resp.rows?.length > 0 ? resp.rows : [];
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
      },
    });
  }

  seleccionCie(cie: any): void {
    this.diagnosticoBody.fk_cie = cie?.pk_cie ?? 0;
  }
}
