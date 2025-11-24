import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { MenuHospitalizacionComponent } from '../../../../componentes_reutilizables/menu_izq/menu.component';
import { EpicrisisService } from '../../../../services/hospitalizacion/epicrisis/epicrisis.service';
import { CasasSaludService } from '../../../../services/casas_salud/casas_salud.service';
import { LoginService } from '../../../../services/login.service';
import { environment } from '../../../../../enviroments/enviroments';
import Swal from 'sweetalert2';
import {
  Epicrisis,
  EpicrisisDiagnostico,
  EpicrisisMedico,
} from './epicrisis.interface';
import { CieService } from '../../../../services/cie/cie.service';
import { Subject } from 'rxjs';
import { EspecialidadMedicoService } from '../../../../services/especilidades_medicos/especialidad_medico.service';
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-form-epicrisis',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MenuHospitalizacionComponent,
    NgSelectModule,
  ],
  templateUrl: './form-epicrisis.component.html',
  styles: ``,
})
export class FormEpicrisisComponent {
  private _routerService = inject(ActivatedRoute);
  public _routerService2 = inject(Router);
  private _epicrisisService = inject(EpicrisisService);
  private _loginService = inject(LoginService);
  private _casaSaludService = inject(CasasSaludService);
  private _cieService = inject(CieService);
  private _especialidadMedicoService = inject(EspecialidadMedicoService);

  opcion: string = 'I';
  hcu: any;
  casaSaludBody: any = {};
  epicrisisBody: Epicrisis;
  idNum: number = 0;
  accionVer: any;

  //Variables de Diagnosticos
  listDiagnosticos: any[];
  diagnosticoBody: EpicrisisDiagnostico = {
    pk_epidiag: 0,
    fk_epi: 0,
    fk_cie: 0,
    fecha_creacion_epidiag: null,
    fecha_modificacion_epidiag: null,
    tipo_epidiag: null,
  };
  listCie10: any[];
  idCie: any;
  typeahead = new Subject<string>();

  //variables del loading
  loading: boolean = true;
  isLoading = false;

  //Variables Medicos
  listMedicosEpicrisis: any[];
  medicosBody: EpicrisisMedico = {
    pk_epimed: 0, // serial4 (PK)
    fk_epi: 0, // FK epicrisis (puede ser NULL)
    fk_espemed: 0, // FK especialidad médica
    fecha_creacion_epimed: null, // json
    fecha_modificacion_epimed: null, // json
    periodo_desde_epimed: null, // date (YYYY-MM-DD)
    periodo_hasta_epimed: null, // date (YYYY-MM-DD)
  };
  listMedicos: any[];
  idMedico: any;
  typeaheadMedicos = new Subject<string>();

  constructor(private route: ActivatedRoute) {
    this.getCasaSalud();
    this.inicializacionEpicrisis();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((pm) => {
      this.idNum = Number(pm.get('id') ?? 0);

      const accion = (pm.get('accion') ?? '').toLowerCase();
      // considera "ver", "v", "true", "1" como VER (solo lectura)
      this.accionVer =
        accion === 'ver' ||
        accion === 'v' ||
        accion === 'true' ||
        accion === '1';

      if (this.idNum !== 0 && !isNaN(this.idNum)) {
        this.opcion = 'U';
        this.editarEpicrisis(this.idNum);
        this.getListaDiagnosticos();
        this.getListaMedicos();
      } else {
        this.inicializacionEpicrisis();
      }
    });
  }
  getCasaSalud() {
    this._casaSaludService.getCasaSaludPrincipal().subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.casaSaludBody = resp.rows;
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Casas de Salud - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  inicializacionEpicrisis(): void {
    this.epicrisisBody = {
      _a: {
        pk_epi: 0,
        casalud_id_fk: this.casaSaludBody.casalud_id_pk,
        fk_hcu: this._loginService.getHcuLocalStorage().fk_hcu,
        estado_epi: false, // Abierto por defecto
      },
      _b: {
        resumen_cuadro_clinico: null,
      },
      _c: {
        resumen_evolucion: null,
      },
      _d: {
        hallazgos_relevantes: null,
      },
      _e: {
        resumen_tratamiento: null,
      },
      _f: {
        indicaciones_alta: null, // JSON libre (objeto) o null
        prox_control: null, // campo adicional manejado en UI
      },
      _h: {
        vivo: false,
        fallecido: false,
        alta_medica: false,
        alta_voluntaria: false,
        asintomatico: false,
        discapacidad: false,
        retiro_no_autorizado: false,
        def_menor_48: false,
        def_mayor_48: false,
        dias_estada: null, // numérico cuando lo calcules
        dias_reposo: null, // numérico cuando lo definas
        observacion_h: null,
      },
      _j: {
        medico_usu_id_fk: null, // se llenará con el usuario que cierre/valide
      },
    };
  }

  // Supongo que tienes declarada la interfaz Epicrisis y la propiedad:
  // epicrisisBody!: Epicrisis;

  parametrizarEpicrisis(src: any): void {
    // Helpers de conversión segura
    const asBool = (v: any): boolean => !!v;
    const asNumOrNull = (v: any): number | null =>
      v === undefined || v === null || v === '' || Number.isNaN(Number(v))
        ? null
        : Number(v);
    const asStrOrNull = (v: any): string | null =>
      v === undefined || v === null ? null : String(v);

    // Bloques del JSON fuente (con nullish coalescing para evitar errores)
    const indic = src?.indicaciones_alta_epi ?? null;
    const cond = src?.condiciones_alta_epi ?? null;

    this.epicrisisBody = {
      _a: {
        pk_epi: Number(src?.pk_epi ?? 0),
        casalud_id_fk: Number(src?.casalud_id_fk ?? 0),
        fk_hcu: Number(src?.fk_hcu ?? 0),
        estado_epi: asBool(src?.estado_epi),
      },

      _b: {
        // resumen_cuadro_clinico_epi  →  _b.resumen_cuadro_clinico
        resumen_cuadro_clinico: asStrOrNull(src?.resumen_cuadro_clinico_epi),
      },

      _c: {
        // resumen_evolucion_complic_epi → _c.resumen_evolucion
        resumen_evolucion: asStrOrNull(src?.resumen_evolucion_complic_epi),
      },

      _d: {
        // hallazgos_relevantes_epi → _d.hallazgos_relevantes
        hallazgos_relevantes: asStrOrNull(src?.hallazgos_relevantes_epi),
      },

      _e: {
        // resumen_tratamiento_procedimiento_epi → _e.resumen_tratamiento
        resumen_tratamiento: asStrOrNull(
          src?.resumen_tratamiento_procedimiento_epi
        ),
      },

      _f: {
        // JSON libre + prox_control (si viene dentro de indicaciones_alta_epi)
        indicaciones_alta: asStrOrNull(
          src?.indicaciones_alta_epi.indicaciones_alta
        ),
        prox_control: asStrOrNull(indic?.prox_control ?? null),
      },

      _h: {
        vivo: asBool(cond?.vivo),
        fallecido: asBool(cond?.fallecido),
        alta_medica: asBool(cond?.alta_medica),
        alta_voluntaria: asBool(cond?.alta_voluntaria),
        asintomatico: asBool(cond?.asintomatico),
        discapacidad: asBool(cond?.discapacidad),
        retiro_no_autorizado: asBool(cond?.retiro_no_autorizado),
        def_menor_48: asBool(cond?.def_menor_48),
        def_mayor_48: asBool(cond?.def_mayor_48),

        // En tu interfaz son number | null
        dias_estada: asNumOrNull(cond?.dias_estada),
        dias_reposo: asNumOrNull(cond?.dias_reposo),

        observacion_h: asStrOrNull(cond?.observacion_h),
      },

      _j: {
        // En tu interfaz actual sólo tienes este campo
        medico_usu_id_fk: asNumOrNull(src?.medico_usu_id_fk),
      },
    };
  }

  editarEpicrisis(pk_epi: number) {
    this.opcion = 'U';
    this._epicrisisService.getEpicrisisId(pk_epi, 1).subscribe({
      next: (resp) => {
        /* console.log(JSON.stringify(resp.data)) */
        this.parametrizarEpicrisis(resp.data);
        this.epicrisisBody._a.casalud_id_fk = this.casaSaludBody.casalud_id_pk;
        this.epicrisisBody._j.medico_usu_id_fk =
          this._loginService.getUserLocalStorage().pk_usuario;
      },
      error: (err) => {
        // manejo de error
        toastr.error(
          'Error',
          `${err} - Datos no cargados de la epicrsis  ${pk_epi}`
        );
      },
    });
  }

  //Cambiar si encuentra en comillas simples a dobles
  sanitizeEpicrisisBodyStrings(obj: any): any {
    // Recorremos el objeto de forma recursiva
    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      if (typeof value === 'string' && value !== null) {
        // Reemplaza todas las comillas simples por dobles
        obj[key] = value.replace(/'/g, '"');
      } else if (typeof value === 'object' && value !== null) {
        // Si es un objeto, llamamos de nuevo la función
        this.sanitizeEpicrisisBodyStrings(value);
      }
      // Si es number, boolean o null no hacemos nada
    });

    return obj;
  }

  guardarEpicrisis() {
    this.epicrisisBody._a.casalud_id_fk = this.casaSaludBody.casalud_id_pk;
    this.epicrisisBody._j.medico_usu_id_fk =
      this._loginService.getUserLocalStorage().pk_usuario;
    this.epicrisisBody = this.sanitizeEpicrisisBodyStrings(this.epicrisisBody);
    Swal.fire({
      title: '¿Está seguro?',
      text: `Desea guardar la información de la epicrisis`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._epicrisisService
          .guardarEpicrisis(this.epicrisisBody, this.opcion)
          .subscribe({
            next: (resp) => {
              this.opcion = `U`;
              if (resp.status && resp.status === 'ok') {
                console.log(JSON.stringify(resp.data));
                //this.epicrisisBody = resp.data;
                //this.parametrizarEpicrisis(this.epicrisisBody);
                this._routerService2.navigate([
                  '/form_epicrisis',
                  resp.data._a.pk_epi,
                  false,
                ]);

                toastr.success('Éxito', `Epicrisis Guardada!`);
              } else {
                // manejo de error
                toastr.error('Error', `Problema al registrar epicrisis`);
              }
            },
            error: (err) => {
              // manejo de error
              toastr.error(
                'Error',
                `${err} - Problema al registrar epicrisis 2`
              );
            },
          });
      }
    });
  }

  cerrarEpicrisis() {
    this._routerService2.navigate(['/epicrisis']);
  }

  validarGuardar() {
    if (
      !this.epicrisisBody ||
      !this.epicrisisBody._a.fk_hcu ||
      this.epicrisisBody._a.fk_hcu === null ||
      this.epicrisisBody._a.fk_hcu == undefined ||
      !this.epicrisisBody._b.resumen_cuadro_clinico ||
      this.epicrisisBody._b.resumen_cuadro_clinico === null ||
      this.epicrisisBody._b.resumen_cuadro_clinico == undefined
    ) {
      return false;
    }
    return true;
  }

  //@@@@@@@@@@  Diagnosticos  @@@@@@@@@@@@@@@
  getListaDiagnosticos() {
    this._epicrisisService.getDiagnosticos(this.idNum).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listDiagnosticos = resp.rows;
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Diagnosticos - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  nuevoDiagnostico() {
    this.diagnosticoBody = {
      pk_epidiag: 0,
      fk_epi: this.epicrisisBody._a.pk_epi,
      fk_cie: 0,
      fecha_creacion_epidiag: null,
      fecha_modificacion_epidiag: null,
      tipo_epidiag: null,
    };
    // ✅ Abre el modal con jQuery Bootstrap
    $('#diagnosticoModal').modal('show');
    this.listCie10 = [];
    this.idCie = null;
  }

  validarGuardarDiagnostico() {
    if (
      !this.diagnosticoBody ||
      !this.diagnosticoBody.fk_epi ||
      this.diagnosticoBody.fk_epi === null ||
      this.diagnosticoBody.fk_epi == undefined ||
      !this.diagnosticoBody.fk_cie ||
      this.diagnosticoBody.fk_cie === null ||
      this.diagnosticoBody.fk_cie == undefined ||
      !this.diagnosticoBody.tipo_epidiag ||
      this.diagnosticoBody.tipo_epidiag === null ||
      this.diagnosticoBody.tipo_epidiag == undefined
    ) {
      return false;
    }
    return true;
  }

  guardarDiagnostico() {
    Swal.fire({
      title: '¿Está seguro?',
      text: `Desea guardar el diagnostico seleccionado a la epicrisis`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._epicrisisService
          .guardarDiagnostico(this.diagnosticoBody, 'I')
          .subscribe({
            next: (resp) => {
              if (resp.status && resp.status === 'ok') {
                //Cargar Diagnosticos
                this.getListaDiagnosticos();
                //Cerra Modal
                // ✅ Abre el modal con jQuery Bootstrap
                $('#diagnosticoModal').modal('hide');
                toastr.success('Éxito', `Diagnostico creado!`);
              } else {
                // manejo de error
                toastr.error(
                  'Error',
                  `Problema al crear diagnostico - Posiblemente Duplicado`
                );
              }
            },
            error: (err) => {
              // manejo de error
              toastr.error(
                'Error',
                `${err} - Problema al crear diagnostico - Posiblemente Duplicado 2`
              );
            },
          });
      }
    });
  }

  eliminarDiagnostico(diagnostico: any) {
    Swal.fire({
      title: '¿Está seguro?',
      text: `Desea eliminar el diagnostico seleccionado a la epicrisis`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._epicrisisService.guardarDiagnostico(diagnostico, 'D').subscribe({
          next: (resp) => {
            if (resp.status && resp.status === 'ok') {
              //Cargar Diagnosticos
              this.getListaDiagnosticos();
              //Cerra Modal
              toastr.success('Éxito', `Diagnostico eliminado!`);
            } else {
              // manejo de error
              toastr.error('Error', `Problema al eliminar diagnostico`);
            }
          },
          error: (err) => {
            // manejo de error
            toastr.error(
              'Error',
              `${err} - Problema al eliminar diagnostico 2`
            );
          },
        });
      }
    });
  }

  onSearchCie(term: any) {
    let bsq = term.term;

    if (bsq.length >= 3) {
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
    } else {
      this.listCie10 = [];
    }
  }

  seleccionCie(cie: any) {
    this.diagnosticoBody.fk_cie = cie.pk_cie;
  }

  //@@@@@@@@@@  Medicos  @@@@@@@@@@@@@@@
  getListaMedicos() {
    this._epicrisisService.getMedicos(this.idNum).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listMedicosEpicrisis = resp.rows;
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Médicos Epicrisis - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  nuevoMedico() {
    this.medicosBody = {
      pk_epimed: 0,
      fk_epi: this.epicrisisBody._a.pk_epi,
      fk_espemed: 0,
      fecha_creacion_epimed: {},
      fecha_modificacion_epimed: null,
      periodo_desde_epimed: null,
      periodo_hasta_epimed: null,
    };
    // ✅ Abre el modal con jQuery Bootstrap
    $('#medicoModal').modal('show');
    this.listMedicos = [];
    this.idMedico = null;
  }

  validarGuardarMedico() {
    if (
      !this.medicosBody ||
      !this.medicosBody.fk_epi ||
      this.medicosBody.fk_epi === null ||
      this.medicosBody.fk_epi == undefined ||
      !this.medicosBody.fk_espemed ||
      this.medicosBody.fk_espemed === null ||
      this.medicosBody.fk_espemed == undefined ||
      !this.medicosBody.periodo_desde_epimed ||
      this.medicosBody.periodo_desde_epimed === null ||
      this.medicosBody.periodo_desde_epimed == undefined ||
      !this.medicosBody.periodo_hasta_epimed ||
      this.medicosBody.periodo_hasta_epimed === null ||
      this.medicosBody.periodo_hasta_epimed == undefined
    ) {
      return false;
    }
    return true;
  }

  guardarMedico() {
    Swal.fire({
      title: '¿Está seguro?',
      text: `Desea agregar el médico con su especialidad/subespecialidad a la epicrisis`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._epicrisisService.guardarMedicos(this.medicosBody, 'I').subscribe({
          next: (resp) => {
            if (resp.status && resp.status === 'ok') {
              //Cargar Diagnosticos
              this.getListaMedicos();
              //Cerra Modal
              // ✅ Abre el modal con jQuery Bootstrap
              $('#medicoModal').modal('hide');
              toastr.success(
                'Éxito',
                `Periodo de Médico agregado a la epicrisis!`
              );
            } else {
              // manejo de error
              toastr.error(
                'Error',
                `Problema al agregar médico - Posiblemente Duplicado`
              );
            }
          },
          error: (err) => {
            // manejo de error
            toastr.error(
              'Error',
              `${err} - Problema al agregar médico - Posiblemente Duplicado 2`
            );
          },
        });
      }
    });
  }

  eliminarMedico(medicoEspecialidad: any) {
    Swal.fire({
      title: '¿Está seguro?',
      text: `Desea eliminar el periodo del médico seleccionado a la epicrisis`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._epicrisisService
          .guardarMedicos(medicoEspecialidad, 'D')
          .subscribe({
            next: (resp) => {
              if (resp.status && resp.status === 'ok') {
                //Cargar Diagnosticos
                this.getListaMedicos();
                //Cerra Modal
                toastr.success('Éxito', `Periodo del Médico eliminado!`);
              } else {
                // manejo de error
                toastr.error('Error', `Problema al eliminar periodo`);
              }
            },
            error: (err) => {
              // manejo de error
              toastr.error('Error', `${err} - Problema al eliminar periodo 2`);
            },
          });
      }
    });
  }

  onSearchMedico(term: any) {
    let bsq = term.term;
    if (bsq.length >= 3) {
      this.isLoading = true;
      this._especialidadMedicoService.getBsqEspecialidadMedico(bsq).subscribe({
        next: (resp) => {
          this.isLoading = false;
          this.listMedicos =
            resp.status === 'ok' && resp.rows?.length > 0 ? resp.rows : [];
        },
        error: (err) => {
          this.isLoading = false;
          console.error(err);
        },
      });
    } else {
      this.listMedicos = [];
    }
  }

  seleccionMedico(medico: any) {
    this.medicosBody.fk_espemed = medico.pk_espemed;
  }
}
