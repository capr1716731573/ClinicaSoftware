import { CommonModule, Location } from '@angular/common';
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
  InterconsultaSolicitud,
} from './interconsulta.interface';
import { CabeceraDetalleService } from '../../../../services/cabecera_detalle/cabecera-detalle.service';
import { UsuarioService } from '../../../../services/usuario/usuario.service';

type CaracteristicasSolicitud = {
  servicio: {
    emergencia: boolean;
    consulta_externa: boolean;
    hospitalizacion: boolean;
  };
  especialidad: {
    especialidad_origen: string;
    id_especialidad_origen: number | null;
    especialidad_destino: string;
    id_especialidad_destino: number | null;
    numero_cama: string;
    numero_sala: string;
  };
  urgente: 'SI' | 'NO';
  descripcion_motivo: string;
  especialista_id: number | null;
  especialista_nombre: string;
};

declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-form-interconsulta-solicitud',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MenuHospitalizacionComponent,
    NgSelectModule,
    SkeletonCrudComponent,
  ],
  templateUrl: './form-interconsulta-solicitud.component.html',
  styles: ``,
})
export class FormInterconsultaSolicitudComponent {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _interconsultaService = inject(InterconsultaService);
  private _casaSaludService = inject(CasasSaludService);
  private _loginService = inject(LoginService);
  private _cieService = inject(CieService);
  private _especilidadesMedicas = inject(CabeceraDetalleService);
  private _usuariosMedicos = inject(UsuarioService);
  private location = inject(Location);

  tabActivo: 'B' | 'C' | 'D' | 'E' | 'F' = 'B';
  opcion: 'I' | 'U' = 'I';
  accionVer = false;
  idNum = 0;
  casaSaludBody: any = {};
  cabecera: any;

  listEspecialidades: any[] = [];
  listMedicos: any[] = [];

  interconsultaBody!: InterconsultaSolicitud;
  caracteristicasSolicitud!: CaracteristicasSolicitud;
  private hcuData: any;

  listDiagnosticos: any[] = [];
  diagnosticoBody: InterconsultaDiagnostico = {
    pk_interdiag: 0,
    fk_interconsulta: 0,
    tipo_interconsulta: 'S',
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
    this.hcuData = this._loginService.getHcuLocalStorage();
    this.getCasaSalud();
    this.getEspecialidades();
    this.getMedicos();
    this.inicializarInterconsultaSolicitud();
  }

  ngOnInit(): void {
    this._route.paramMap.subscribe((pm) => {
      this.idNum = Number(pm.get('id') ?? 0);
      const accionParam = (pm.get('accion') ?? '').toLowerCase();
      const cabParam = (pm.get('cab') ?? '').toLowerCase();
      this.accionVer =
        accionParam === 'true' || accionParam === '1' || accionParam === 'ver';
      this.cabecera =
        cabParam === 'true' || cabParam === '1' || cabParam === 'ver';

      if (this.idNum && !isNaN(this.idNum)) {
        this.opcion = 'U';
        this.loading = true;
        this.editarInterconsultaSolicitud(this.idNum);
        this.getListaDiagnosticos();
      } else {
        this.opcion = 'I';
        this.loading = false;
        this.inicializarInterconsultaSolicitud();
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

  getEspecialidades(): void {
    this._especilidadesMedicas
      .getAllCabecerasDetalle2('ESPEC_MED', true)
      .subscribe({
        next: (resp) => {
          if (resp.status === 'ok') {
            this.listEspecialidades = resp.rows;
          }
        },
        error: (err) => {
          Swal.fire({
            title: '¡Error!',
            icon: 'error',
            text: `Especialidades Médicas - ${err.message}`,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  getMedicos(): void {
    this._usuariosMedicos.getAllUsuarioMedicos().subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listMedicos = resp.rows;
        }
      },
      error: (err) => {
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Médicos - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  inicializarInterconsultaSolicitud(): void {
    const defaultCaracteristicas = this.buildDefaultCaracteristicas();
    this.caracteristicasSolicitud = defaultCaracteristicas;

    this.interconsultaBody = {
      pk_intersol: 0,
      fecha_creacion_intersol: null,
      fecha_modificacion_intersol: null,
      fecha_inicio: '',
      hora_inicio: '',
      fecha_fin: '',
      hora_fin: '',
      casalud_id_fk: this.casaSaludBody?.casalud_id_pk ?? 0,
      fk_hcu: this._loginService.getHcuLocalStorage()?.fk_hcu ?? 0,
      medico_usu_id_fk:
        this._loginService.getUserLocalStorage()?.pk_usuario ?? 0,
      caracteristicas_solicitud_intersol: defaultCaracteristicas,
      cuadro_clinico_intersol: '',
      resultados_examenes_intersol: '',
      plan_terapeutico_intersol: '',
    };
  }

  private buildDefaultCaracteristicas(): CaracteristicasSolicitud {
    const numeroSala = this.hcuData?.sala ?? '';
    const numeroCama = this.hcuData?.ubicacion ?? '';
    return {
      servicio: {
        emergencia: false,
        consulta_externa: false,
        hospitalizacion: true,
      },
      especialidad: {
        especialidad_origen: '',
        id_especialidad_origen: null,
        especialidad_destino: '',
        id_especialidad_destino: null,
        numero_cama: numeroCama,
        numero_sala: numeroSala,
      },
      urgente: 'NO',
      descripcion_motivo: '',
      especialista_id: null,
      especialista_nombre: '',
    };
  }

  private todayIso(): string {
    return new Date().toISOString().split('T')[0];
  }

  private nowHour(): string {
    return new Date().toTimeString().substring(0, 5);
  }

  editarInterconsultaSolicitud(pk_intersol: number): void {
    this._interconsultaService
      .getInterconsultaSolicitudId(pk_intersol, 1)
      .subscribe({
        next: (resp) => {
          if (resp.status === 'ok') {
            this.parametrizarInterconsulta(resp.data);
          }
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          toastr.error(
            'Error',
            `${err} - Datos no cargados de Interconsulta ${pk_intersol}`
          );
        },
      });
  }

  private parametrizarInterconsulta(src: any): void {
    const caracteristicas = this.mergeCaracteristicas(
      src?.caracteristicas_solicitud_intersol
    );
    this.caracteristicasSolicitud = caracteristicas;

    this.interconsultaBody = {
      pk_intersol: Number(src?.pk_intersol) || 0,
      fecha_creacion_intersol: src?.fecha_creacion_intersol ?? null,
      fecha_modificacion_intersol: src?.fecha_modificacion_intersol ?? null,
      fecha_inicio: src?.fecha_inicio ?? this.todayIso(),
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
      caracteristicas_solicitud_intersol: caracteristicas,
      cuadro_clinico_intersol: src?.cuadro_clinico_intersol ?? '',
      resultados_examenes_intersol: src?.resultados_examenes_intersol ?? '',
      plan_terapeutico_intersol: src?.plan_terapeutico_intersol ?? '',
    };
  }

  private mergeCaracteristicas(src: any): CaracteristicasSolicitud {
    const base = this.buildDefaultCaracteristicas();
    if (!src) {
      return base;
    }

    base.servicio = {
      emergencia: !!src?.servicio?.emergencia,
      consulta_externa: !!src?.servicio?.consulta_externa,
      hospitalizacion: !!src?.servicio?.hospitalizacion,
    };
    base.especialidad = {
      ...base.especialidad,
      ...(src.especialidad ?? {}),
    };
    base.descripcion_motivo = src?.descripcion_motivo ?? '';
    base.urgente = src?.urgente === 'SI' ? 'SI' : 'NO';
    base.especialista_id = src?.especialista_id ?? null;
    base.especialista_nombre = src?.especialista_nombre ?? '';
    return base;
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

  guardarInterconsultaSolicitud(): void {
    if (!this.validarGuardar()) {
      toastr.warning('Atención', 'Complete la información obligatoria.');
      return;
    }

    this.interconsultaBody.casalud_id_fk =
      this.casaSaludBody?.casalud_id_pk ?? 0;
    /* this.interconsultaBody.fk_hcu =
      this._loginService.getHcuLocalStorage()?.fk_hcu ?? 0; */
    if (this.interconsultaBody.fk_hcu === 0) {
      this.interconsultaBody.fk_hcu =
        this._loginService.getHcuLocalStorage()?.fk_hcu ?? 0;
    }
    this.interconsultaBody.medico_usu_id_fk =
      this._loginService.getUserLocalStorage()?.pk_usuario ?? 0;

    const payload = this.sanitizeStrings(
      JSON.parse(JSON.stringify(this.interconsultaBody))
    );

    Swal.fire({
      title: '¿Está seguro?',
      text: `Desea guardar la solicitud de interconsulta`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._interconsultaService
          .guardarInterconsultaSolicitud(payload, this.opcion)
          .subscribe({
            next: (resp) => {
              if (resp.status === 'ok') {
                this.opcion = 'U';
                this.interconsultaBody.pk_intersol = resp.data.pk_intersol;
                this.idNum = resp.data.pk_intersol;
                toastr.success('Éxito', `Solicitud guardada correctamente`);
                // IMPORTANTE: replaceUrl evita agregar una nueva entrada al history
                // (si no, el primer "Cerrar" vuelve al mismo formulario previo al guardado)
                this._router.navigate(
                  [
                    '/form_interconsulta_solicitud',
                    resp.data.pk_intersol,
                    false,
                    this.cabecera,
                  ],
                  { replaceUrl: true }
                );
                this.getListaDiagnosticos();
              } else {
                toastr.error(
                  'Error',
                  `Problema al registrar la solicitud de interconsulta`
                );
              }
            },
            error: (err) => {
              toastr.error(
                'Error',
                `${err} - Problema al registrar la solicitud`
              );
            },
          });
      }
    });
  }

  cerrarFormulario(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this._router.navigate(['/interconsultas']);
    }
  }

  validarGuardar(): boolean {
    const b = this.interconsultaBody;
    /* if (!b || !b.fk_hcu) return false; */
    if (!b) return false;

    const car = b.caracteristicas_solicitud_intersol;
    if (!car) return false;

    // Al menos un servicio seleccionado
    const servicioOk =
      car.servicio?.emergencia ||
      car.servicio?.consulta_externa ||
      car.servicio?.hospitalizacion;

    // Especialidades con id y descripción
    const esp = car.especialidad;
    const especialidadOk =
      !!esp?.especialidad_origen &&
      !!esp?.id_especialidad_origen &&
      !!esp?.especialidad_destino &&
      !!esp?.id_especialidad_destino;

    return servicioOk && especialidadOk;
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

  onServicioChange(
    servicio: keyof CaracteristicasSolicitud['servicio'],
    value: boolean
  ): void {
    if (!this.caracteristicasSolicitud) {
      this.caracteristicasSolicitud = this.buildDefaultCaracteristicas();
      this.interconsultaBody.caracteristicas_solicitud_intersol =
        this.caracteristicasSolicitud;
    }

    if (value) {
      Object.keys(this.caracteristicasSolicitud.servicio).forEach((key) => {
        this.caracteristicasSolicitud.servicio[key as any] =
          key === servicio ? value : false;
      });
    } else {
      this.caracteristicasSolicitud.servicio[servicio] = false;
    }
  }

  setUrgente(valor: 'SI' | 'NO'): void {
    this.caracteristicasSolicitud.urgente = valor;
  }

  onSeleccionEspecialidadOrigen(pk: number | null): void {
    this.caracteristicasSolicitud.especialidad.id_especialidad_origen =
      pk ?? null;
    if (!pk) {
      this.caracteristicasSolicitud.especialidad.especialidad_origen = '';
      return;
    }
    const found = this.listEspecialidades.find(
      (esp) => esp.pk_catdetalle === pk
    );
    if (found) {
      this.caracteristicasSolicitud.especialidad.especialidad_origen = (
        found.desc_catdetalle ?? ''
      ).toUpperCase();
    }
  }

  onSeleccionEspecialidadDestino(pk: number | null): void {
    this.caracteristicasSolicitud.especialidad.id_especialidad_destino =
      pk ?? null;
    if (!pk) {
      this.caracteristicasSolicitud.especialidad.especialidad_destino = '';
      return;
    }
    const found = this.listEspecialidades.find(
      (esp) => esp.pk_catdetalle === pk
    );
    if (found) {
      this.caracteristicasSolicitud.especialidad.especialidad_destino = (
        found.desc_catdetalle ?? ''
      ).toUpperCase();
    }
  }

  onSeleccionEspecialista(pk: number | null): void {
    this.caracteristicasSolicitud.especialista_id = pk ?? null;
    if (!pk) {
      this.caracteristicasSolicitud.especialista_nombre = '';
      return;
    }
    const found = this.listMedicos.find((m) => m.pk_usuario === pk);
    if (found) {
      const nombreCompleto = [
        found.apellidopat_persona ?? '',
        found.apellidomat_persona ?? '',
        found.nombre_primario_persona ?? '',
        found.nombre_secundario_persona ?? '',
      ]
        .filter((p) => p.trim())
        .join(' ')
        .toUpperCase();
      this.caracteristicasSolicitud.especialista_nombre = nombreCompleto;
    }
  }

  // ---------------- Diagnósticos -----------------
  getListaDiagnosticos(): void {
    if (!this.idNum) {
      this.listDiagnosticos = [];
      return;
    }
    this._interconsultaService.getDiagnosticos(this.idNum, 'S').subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listDiagnosticos = resp.rows ?? [];
        }
      },
      error: (err) => {
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Diagnósticos Interconsulta - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  nuevoDiagnostico(): void {
    this.diagnosticoBody = {
      pk_interdiag: 0,
      fk_interconsulta: this.interconsultaBody.pk_intersol,
      tipo_interconsulta: 'S',
      fk_cie: 0,
      fecha_creacion_interdiag: null,
      fecha_modificacion_interdiag: null,
      tipo_interdiag: '',
    };
    this.idCie = null;
    this.listCie10 = [];
    $('#diagnosticoInterconsultaModal').modal('show');
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
                $('#diagnosticoInterconsultaModal').modal('hide');
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
              toastr.error(
                'Error',
                `${err} - Problema al eliminar diagnóstico`
              );
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
