import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { MenuHospitalizacionComponent } from '../../../../componentes_reutilizables/menu_izq/menu.component';
import { PosOperatorioService } from '../../../../services/hospitalizacion/posoperatorio/posoperatorio.service';
import { CasasSaludService } from '../../../../services/casas_salud/casas_salud.service';
import { LoginService } from '../../../../services/login.service';
import { environment } from '../../../../../enviroments/enviroments';
import Swal from 'sweetalert2';
import {
  ProtocoloOperatorio,
  ProtocoloOperatorioDiagnostico,
  ProtocoloOperatorioMedico,
} from './postoperatorio.interface';
import { CieService } from '../../../../services/cie/cie.service';
import { Subject } from 'rxjs';
import { EspecialidadMedicoService } from '../../../../services/especilidades_medicos/especialidad_medico.service';
import { UsuarioService } from '../../../../services/usuario/usuario.service';
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-form-postoperatorio',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MenuHospitalizacionComponent,
    NgSelectModule,
  ],
  templateUrl: './form-postoperatorio.component.html',
  styles: ``,
})
export class FormPostoperatorioComponent {
  private _routerService = inject(ActivatedRoute);
  public _routerService2 = inject(Router);
  private _postoperatorioService = inject(PosOperatorioService);
  private _loginService = inject(LoginService);
  private _casaSaludService = inject(CasasSaludService);
  private _cieService = inject(CieService);
  private _especialidadMedicoService = inject(EspecialidadMedicoService);

  // Variables principales
  opcion: string = 'I';
  hcu: any;
  casaSaludBody: any = {};
  protocoloBody!: ProtocoloOperatorio;
  idNum: number = 0;
  accionVer: any;

  // Variables de Diagnósticos
  listDiagnosticos: any[] = [];
  diagnosticoBody: ProtocoloOperatorioDiagnostico = {
    pk_protope_diag: 0,
    fk_protope: 0,
    fk_cie: 0,
    fecha_creacion_protope_diag: null,
    fecha_modificacion_protope_diag: null,
    tipo_protope_diag: null,
  };
  listCie10: any[] = [];
  idCie: any;
  typeahead = new Subject<string>();

  // Variables del loading
  loading: boolean = true;
  isLoading = false;

  // Variables Médicos
  listMedicosProtocolo: any[] = [];
  medicosBody: ProtocoloOperatorioMedico = {
    pk_protope_med: 0,
    fk_protope: 0,
    fecha_creacion_protope_med: null,
    fecha_modificacion_protope_med: null,
    medico_usu_id_fk: 0,
  };
  listMedicos: any[] = [];
  idMedico: any;
  typeaheadMedicos = new Subject<string>();

  //Imagenes a subir
  public imgDiagrama: File;
  public imgDiagramaTemp: any = null;

  tabActivo: string = 'B'; // o el que corresponda al primer tab al iniciar

  constructor(private route: ActivatedRoute) {
    this.getCasaSalud();
    this.inicializacionPostOperatorio();
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
        this.editarProtocolo(this.idNum);
        this.getListaDiagnosticos();
        this.getListaMedicos();
      } else {
        this.inicializacionPostOperatorio();
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
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Casas de Salud - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  inicializacionPostOperatorio(): void {
    this.protocoloBody = {
      _a: {
        pk_protope: 0,
        casalud_id_fk: this.casaSaludBody.casalud_id_pk,
        fk_hcu: this._loginService.getHcuLocalStorage().fk_hcu,
        estado_protope: false, // Abierto por defecto
        medico_usu_id_fk: 0, // Se llenará con el usuario que guarde/cierre
      },
      _c: {
        electiva: false,
        emergencia: false,
        urgencia: false,
        proyectado: '',
        realizado: '',
      },
      _d: {
        cirujano_1: '',
        cirujano_2: '',
        primer_ayudante: '',
        segundo_ayudante: '',
        tercer_ayudante: '',
        anestesiologo: '',
        instrumentista: '',
        circulante: '',
        ayudanteanesteciologia: '',
        otros: '',
      },
      _e: {
        general: false,
        regional: false,
        sedacion: false,
        otros: false,
      },

      _f: {
        fecha_operacion: '',
        hora_inicio: '',
        hora_terminacion: '',
        dieresis: '',
        exposicion: '',
        hallazgos: '',
        procedimiento: '',
      },
      _g: {
        observacion: '',
        descripcion: '',
        perdida: 0,
        sangrado: 0,
        uso: 'NO', // Por defecto NO
      },
      _h: {
        transquirurgico: '',
        biopsia: 'NO', // Por defecto NO
        resultado: '',
        histopatologico: 'NO', // Por defecto NO
        muestra: '',
        medico_nombre:''
      },
      _i: {
        diagrama_protope: '',
      },
    };
  }

  /*  parametrizarPostOperatorio(src: any): void {
    // Helpers de conversión segura
    const asBool = (v: any): boolean => !!v;
    const asNum = (v: any): number =>
      v === undefined || v === null || v === '' || Number.isNaN(Number(v))
        ? 0
        : Number(v);
    const asNumOrNull = (v: any): number | null =>
      v === undefined || v === null || v === '' || Number.isNaN(Number(v))
        ? null
        : Number(v);
    const asStr = (v: any): string =>
      v === undefined || v === null ? '' : String(v);
    const asSiNo = (v: any): 'SI' | 'NO' =>
      v === 'SI' || v === true || v === 1 ? 'SI' : 'NO';
    const asTipoAnestesia = (v: any): 'GE' | 'RE' | 'SE' | 'OT' => {
      const valid = ['GE', 'RE', 'SE', 'OT'];
      return valid.includes(v) ? v : 'GE';
    };

    // Bloques del JSON fuente (con nullish coalescing para evitar errores)
    const tipo_anestecia = src?.tipo_anestecia_protope ?? null;
    const tipo_cirugia = src?.tipo_cirugia_protope ?? null;
    const personal = src?.personal_quirurgico_protope ?? null;
    const detalles_operacion = src?.detalles_operacion_protope ?? null;
    const complicaciones = src?.complicaciones_protope ?? null;
    const incidentes = src?.incidentes_transoperatorios_protope ?? null;

    this.protocoloBody = {
      _a: {
        pk_protope: asNum(src?.pk_protope),
        casalud_id_fk: asNum(src?.casalud_id_fk),
        fk_hcu: asNum(src?.fk_hcu),
        estado_protope: asBool(src?.estado_protope),
        medico_usu_id_fk: asNum(src?.medico_usu_id_fk),
      },

      _c: {
        electiva: asBool(tipo_cirugia?.electiva),
        emergencia: asBool(tipo_cirugia?.emergencia),
        urgencia: asBool(tipo_cirugia?.urgencia),
        proyectado: asStr(tipo_cirugia?.proyectado),
        realizado: asStr(tipo_cirugia?.realizado),
      },

      _d: {
        cirujano_1: asStr(personal?.cirujano_1),
        cirujano_2: asStr(personal?.cirujano_2),
        primer_ayudante: asStr(personal?.primer_ayudante),
        segundo_ayudante: asStr(personal?.segundo_ayudante),
        tercer_ayudante: asStr(personal?.tercer_ayudante),
        anestesiologo: asStr(personal?.anestesiologo),
        instrumentista: asStr(personal?.instrumentista),
        circulante: asStr(personal?.circulante),
        ayudanteanesteciologia: asStr(personal?.ayudanteanesteciologia),
        otros: asStr(personal?.otros),
      },

      _e: {
        general: asBool(tipo_anestecia?.electiva),
        regional: asBool(tipo_anestecia?.electiva),
        sedacion: asBool(tipo_anestecia?.electiva),
        otros: asBool(tipo_anestecia?.electiva),
      },

      _f: {
        fecha_operacion: asStr(detalles_operacion?.fecha_operacion),
        hora_inicio: asStr(detalles_operacion?.hora_inicio),
        hora_terminacion: asStr(detalles_operacion?.hora_terminacion),
        dieresis: asStr(detalles_operacion?.dieresis),
        exposicion: asStr(detalles_operacion?.exposicion),
        hallazgos: asStr(detalles_operacion?.hallazgos),
        procedimiento: asStr(detalles_operacion?.procedimiento),
      },

      _g: {
        observacion: asStr(complicaciones?.observacion),
        descripcion: asStr(complicaciones?.descripcion),
        perdida: asNum(complicaciones?.perdida),
        sangrado: asNum(complicaciones?.sangrado),
        uso: asSiNo(complicaciones?.uso),
      },

      _h: {
        transquirurgico: asStr(incidentes?.transquirurgico),
        biopsia: asSiNo(incidentes?.biopsia),
        resultado: asStr(incidentes?.resultado),
        histopatologico: asSiNo(incidentes?.histopatologico),
        muestra: asStr(incidentes?.muestra),
      },

      _i: {
        diagrama_protope: asStr(src?.diagrama_protope),
      },
    };
  } */

  parametrizarPostOperatorio(src: any): void {
    // Helpers de conversión segura
    const asBool = (v: any): boolean => !!v;

    const asNum = (v: any): number =>
      v === undefined || v === null || v === '' || Number.isNaN(Number(v))
        ? 0
        : Number(v);

    const asStr = (v: any): string =>
      v === undefined || v === null ? '' : String(v);

    const asSiNo = (v: any): 'SI' | 'NO' =>
      v === 'SI' || v === true || v === 1 ? 'SI' : 'NO';

    // === MAPEO CORRECTO SEGÚN EL JSON DEL API ===
    const tipoCirugia = src?.procedimiento_protope ?? {};
    const personal = src?.integrantes_protope ?? {};
    const tipoAnestesia = src?.tipoanestesia_protope ?? {};
    const detallesOperacion = src?.tiemposquirurgicos_protope ?? {};
    const complicaciones = src?.complicaciones_protope ?? {};
    const histopatologicos = src?.histopatologicos_protope ?? {};

    this.protocoloBody = {
      _a: {
        pk_protope: asNum(src?.pk_protope),
        casalud_id_fk: asNum(src?.casalud_id_fk),
        fk_hcu: asNum(src?.fk_hcu),
        estado_protope: asBool(src?.estado_protope),
        medico_usu_id_fk: asNum(src?.medico_usu_id_fk),
      },

      _c: {
        electiva: asBool(tipoCirugia?.electiva),
        emergencia: asBool(tipoCirugia?.emergencia),
        urgencia: asBool(tipoCirugia?.urgencia),
        proyectado: asStr(tipoCirugia?.proyectado),
        realizado: asStr(tipoCirugia?.realizado),
      },

      _d: {
        cirujano_1: asStr(personal?.cirujano_1),
        cirujano_2: asStr(personal?.cirujano_2),
        primer_ayudante: asStr(personal?.primer_ayudante),
        segundo_ayudante: asStr(personal?.segundo_ayudante),
        tercer_ayudante: asStr(personal?.tercer_ayudante),
        anestesiologo: asStr(personal?.anestesiologo),
        instrumentista: asStr(personal?.instrumentista),
        circulante: asStr(personal?.circulante),
        ayudanteanesteciologia: asStr(personal?.ayudanteanesteciologia),
        otros: asStr(personal?.otros),
      },

      _e: {
        general: asBool(tipoAnestesia?.general),
        regional: asBool(tipoAnestesia?.regional),
        sedacion: asBool(tipoAnestesia?.sedacion),
        otros: asBool(tipoAnestesia?.otros),
      },

      _f: {
        fecha_operacion: asStr(detallesOperacion?.fecha_operacion),
        hora_inicio: asStr(detallesOperacion?.hora_inicio),
        hora_terminacion: asStr(detallesOperacion?.hora_terminacion),
        dieresis: asStr(detallesOperacion?.dieresis),
        exposicion: asStr(detallesOperacion?.exposicion),
        hallazgos: asStr(detallesOperacion?.hallazgos),
        procedimiento: asStr(detallesOperacion?.procedimiento),
      },

      _g: {
        observacion: asStr(complicaciones?.observacion),
        descripcion: asStr(complicaciones?.descripcion),
        perdida: asNum(complicaciones?.perdida),
        sangrado: asNum(complicaciones?.sangrado),
        uso: asSiNo(complicaciones?.uso),
      },

      _h: {
        transquirurgico: asStr(histopatologicos?.transquirurgico),
        biopsia: asSiNo(histopatologicos?.biopsia),
        resultado: asStr(histopatologicos?.resultado),
        histopatologico: asSiNo(histopatologicos?.histopatologico),
        muestra: asStr(histopatologicos?.muestra),
        medico_nombre:asStr(histopatologicos?.medico_nombre),
      },

      _i: {
        diagrama_protope: asStr(src?.diagrama_protope),
      },
    };
  }

  editarProtocolo(pk_protope: number) {
    this.opcion = 'U';
    this._postoperatorioService.getPosOperatorioId(pk_protope, 1).subscribe({
      next: (resp) => {
        /* console.log(JSON.stringify(resp.data)); */
        this.parametrizarPostOperatorio(resp.data);
        this.protocoloBody._a.casalud_id_fk = this.casaSaludBody.casalud_id_pk;
        this.protocoloBody._a.medico_usu_id_fk =
          this._loginService.getUserLocalStorage().pk_usuario;
      },
      error: (err) => {
        // manejo de error
        toastr.error(
          'Error',
          `${err} - Datos no cargados del protocolo postoperatorio ${pk_protope}`
        );
      },
    });
  }

  //Cambiar si encuentra en comillas simples a dobles
  sanitizePosOperatorioBodyStrings(obj: any): any {
    // Recorremos el objeto de forma recursiva
    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      if (typeof value === 'string' && value !== null) {
        // Reemplaza todas las comillas simples por dobles
        obj[key] = value.replace(/'/g, '"');
      } else if (typeof value === 'object' && value !== null) {
        // Si es un objeto, llamamos de nuevo la función
        this.sanitizePosOperatorioBodyStrings(value);
      }
      // Si es number, boolean o null no hacemos nada
    });

    return obj;
  }

  guardarPostOperatorio() {
    // Aseguramos casa de salud y médico antes de guardar
    this.protocoloBody._a.casalud_id_fk = this.casaSaludBody.casalud_id_pk;
    this.protocoloBody._a.medico_usu_id_fk =
      this._loginService.getUserLocalStorage().pk_usuario;

    // Sanitizar comillas simples en todo el objeto (mismo helper que en Epicrisis)
    this.protocoloBody = this.sanitizePosOperatorioBodyStrings(
      this.protocoloBody
    );

    Swal.fire({
      title: '¿Está seguro?',
      text: `Desea guardar la información del protocolo postoperatorio`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._postoperatorioService
          // ⬇️ Ajusta el nombre del método según tu service si es diferente
          .guardarPosOperatorio(this.protocoloBody, this.opcion)
          .subscribe({
            next: (resp) => {
              this.opcion = 'U';
              if (resp.status && resp.status === 'ok') {
                /* console.log(JSON.stringify(resp.data)); */

                // Navegar al formulario ya en modo edición
                this._routerService2.navigate([
                  '/form_protocolo', // ajusta la ruta si tu route es otro
                  resp.data._a.pk_protope,
                  false,
                ]);

                toastr.success('Éxito', `Protocolo postoperatorio guardado!`);
              } else {
                toastr.error(
                  'Error',
                  `Problema al registrar protocolo postoperatorio`
                );
              }
            },
            error: (err) => {
              toastr.error(
                'Error',
                `${err} - Problema al registrar protocolo postoperatorio 2`
              );
            },
          });
      }
    });
  }

  cerrarPostOperatorio() {
    this._routerService2.navigate(['/protocolo']);
  }

  validarGuardar(): boolean {
    if (
      !this.protocoloBody ||
      !this.protocoloBody._a.fk_hcu ||
      this.protocoloBody._a.fk_hcu === null ||
      this.protocoloBody._a.fk_hcu === undefined ||
      // Validar datos esenciales de la cirugía
      !this.protocoloBody._c.proyectado ||
      !this.protocoloBody._c.realizado ||
      this.protocoloBody._c.proyectado.trim() === '' ||
      this.protocoloBody._c.realizado.trim() === ''
      /* // Validar detalles de operación
      !this.protocoloBody._f.fecha_operacion ||
      !this.protocoloBody._f.hora_inicio ||
      !this.protocoloBody._f.hora_terminacion ||
      this.protocoloBody._f.fecha_operacion.trim() === '' ||
      this.protocoloBody._f.hora_inicio.trim() === '' ||
      this.protocoloBody._f.hora_terminacion.trim() === '' */
    ) {
      return false;
    }

    return true;
  }

  //@@@@@@@@@@  Diagnosticos  @@@@@@@@@@@@@@@
  getListaDiagnosticos() {
    this._postoperatorioService.getDiagnosticos(this.idNum).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listDiagnosticos = resp.rows;
        }
      },
      error: (err) => {
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Diagnósticos Protocolo - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  nuevoDiagnostico() {
    this.diagnosticoBody = {
      pk_protope_diag: 0,
      fk_protope: this.protocoloBody._a.pk_protope,
      fk_cie: 0,
      fecha_creacion_protope_diag: null,
      fecha_modificacion_protope_diag: null,
      tipo_protope_diag: '', // string obligatorio según interface
    };

    // Abre el modal con jQuery Bootstrap
    $('#diagnosticoModal').modal('show');
    this.listCie10 = [];
    this.idCie = null;
  }

  validarGuardarDiagnostico(): boolean {
    if (
      !this.diagnosticoBody ||
      !this.diagnosticoBody.fk_protope ||
      this.diagnosticoBody.fk_protope === null ||
      this.diagnosticoBody.fk_protope === undefined ||
      !this.diagnosticoBody.fk_cie ||
      this.diagnosticoBody.fk_cie === null ||
      this.diagnosticoBody.fk_cie === undefined ||
      !this.diagnosticoBody.tipo_protope_diag ||
      this.diagnosticoBody.tipo_protope_diag === null ||
      this.diagnosticoBody.tipo_protope_diag === undefined ||
      this.diagnosticoBody.tipo_protope_diag.trim() === ''
    ) {
      return false;
    }
    return true;
  }

  guardarDiagnostico() {
    if (!this.validarGuardarDiagnostico()) {
      toastr.warning(
        'Atención',
        'Debe completar tipo, diagnóstico CIE10 y estar asociado a un protocolo.'
      );
      return;
    }

    Swal.fire({
      title: '¿Está seguro?',
      text: `Desea guardar el diagnóstico seleccionado al protocolo quirúrgico`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._postoperatorioService
          .guardarDiagnostico(this.diagnosticoBody, 'I')
          .subscribe({
            next: (resp) => {
              if (resp.status && resp.status === 'ok') {
                // Recargar lista
                this.getListaDiagnosticos();
                // Cerrar modal
                $('#diagnosticoModal').modal('hide');
                toastr.success('Éxito', `Diagnóstico agregado al protocolo!`);
              } else {
                toastr.error(
                  'Error',
                  `Problema al crear diagnóstico - Posiblemente duplicado`
                );
              }
            },
            error: (err) => {
              toastr.error(
                'Error',
                `${err} - Problema al crear diagnóstico - Posiblemente duplicado 2`
              );
            },
          });
      }
    });
  }

  eliminarDiagnostico(diagnostico: any) {
    Swal.fire({
      title: '¿Está seguro?',
      text: `Desea eliminar el diagnóstico seleccionado del protocolo quirúrgico`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._postoperatorioService
          .guardarDiagnostico(diagnostico, 'D')
          .subscribe({
            next: (resp) => {
              if (resp.status && resp.status === 'ok') {
                this.getListaDiagnosticos();
                toastr.success('Éxito', `Diagnóstico eliminado!`);
              } else {
                toastr.error(
                  'Error',
                  `Problema al eliminar diagnóstico del protocolo`
                );
              }
            },
            error: (err) => {
              toastr.error(
                'Error',
                `${err} - Problema al eliminar diagnóstico 2`
              );
            },
          });
      }
    });
  }

  onSearchCie(term: any) {
    const bsq = term.term;

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

  //@@@@@@@@@   Fin Diagnosticos @@@@@@@@@@@@

  //@@@@@@@@@@  Medicos  @@@@@@@@@@@@@@@
  getListaMedicos() {
    this._postoperatorioService.getMedicos(this.idNum).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listMedicosProtocolo = resp.rows;
        }
      },
      error: (err) => {
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Médicos Protocolo - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  nuevoMedico() {
    this.medicosBody = {
      pk_protope_med: 0,
      fk_protope: this.protocoloBody._a.pk_protope,
      fecha_creacion_protope_med: {}, // si tu trigger lo llena, puede ser null también
      fecha_modificacion_protope_med: null,
      medico_usu_id_fk: 0,
    };

    // Abre el modal con jQuery Bootstrap
    $('#medicoModal').modal('show');
    this.listMedicos = [];
    this.idMedico = null;
  }

  validarGuardarMedico(): boolean {
    if (
      !this.medicosBody ||
      !this.medicosBody.fk_protope ||
      this.medicosBody.fk_protope === null ||
      this.medicosBody.fk_protope === undefined ||
      !this.medicosBody.medico_usu_id_fk ||
      this.medicosBody.medico_usu_id_fk === null ||
      this.medicosBody.medico_usu_id_fk === undefined
    ) {
      return false;
    }
    return true;
  }

  guardarMedico() {
    if (!this.validarGuardarMedico()) {
      toastr.warning(
        'Atención',
        'Debe seleccionar un médico y tener asociado el protocolo.'
      );
      return;
    }

    Swal.fire({
      title: '¿Está seguro?',
      text: `Desea agregar el médico al protocolo quirúrgico`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._postoperatorioService
          .guardarMedicos(this.medicosBody, 'I')
          .subscribe({
            next: (resp) => {
              if (resp.status && resp.status === 'ok') {
                // Recargar lista
                this.getListaMedicos();
                // Cerrar modal
                $('#medicoModal').modal('hide');
                toastr.success(
                  'Éxito',
                  `Médico agregado al protocolo quirúrgico!`
                );
              } else {
                toastr.error(
                  'Error',
                  `Problema al agregar médico - Posiblemente duplicado`
                );
              }
            },
            error: (err) => {
              toastr.error(
                'Error',
                `${err} - Problema al agregar médico - Posiblemente duplicado 2`
              );
            },
          });
      }
    });
  }

  eliminarMedico(medico: any) {
    Swal.fire({
      title: '¿Está seguro?',
      text: `Desea eliminar el médico seleccionado del protocolo quirúrgico`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._postoperatorioService.guardarMedicos(medico, 'D').subscribe({
          next: (resp) => {
            if (resp.status && resp.status === 'ok') {
              this.getListaMedicos();
              toastr.success('Éxito', `Médico eliminado del protocolo!`);
            } else {
              toastr.error(
                'Error',
                `Problema al eliminar médico del protocolo`
              );
            }
          },
          error: (err) => {
            toastr.error('Error', `${err} - Problema al eliminar médico 2`);
          },
        });
      }
    });
  }

  onSearchMedico(term: any) {
    const bsq = term.term;

    if (bsq.length >= 3) {
      this.isLoading = true;
      this._especialidadMedicoService.getBsqEspecialidadMedico(bsq).subscribe({
        next: (resp) => {
          this.isLoading = false;
          this.listMedicos = resp.rows;
          this.listMedicos =
            resp.status === 'ok' && resp.rows?.length > 0 ? resp.rows : [];
          console.log(this.listMedicos);
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
    // Ajusta el campo según venga de tu servicio:
    // this.medicosBody.medico_usu_id_fk = medico.medico_usu_id_fk;
    // o:
    this.medicosBody.medico_usu_id_fk = medico.pk_espemed;
  }

  //@@@@@@@@@   Fin Medicos @@@@@@@@@@@@

  //@@@@@@@@@ Seccion Imagen de Diagrama
  //Seccion de gestiones y carga de imagenes de firma y sello
  /*  cambiarImagenDiagrama(file?: File) {
    this.imgDiagrama = file ?? null;

    // Si no hay archivo, limpiar previsualización
    if (!file) {
      this.imgDiagramaTemp = null;
      return;
    }

    // ✅ Validar tipo MIME permitido
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        title: '¡Error!',
        text: 'Solo se permiten imágenes JPG, JPEG, PNG o WebP.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      this.imgDiagrama = null;
      this.imgDiagramaTemp = null;
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      this.imgDiagramaTemp = reader.result as string; // base64
    };
  } */

  /* subirImagenDiagrama() {
    if (!this.imgDiagrama) {
      Swal.fire({
        title: 'Sin archivo',
        text: 'Seleccione primero una imagen para subir.',
        icon: 'info',
      });
      return;
    }

    Swal.fire({
      title: 'Confirmación',
      text: `Desea subir la imagen asignada como Diagrama del Protocolo PostOperatorio ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._postoperatorioService
          .actualizarDiagrama(this.imgDiagrama, this.protocoloBody)
          .then((nuevoProtocolo) => {
            this.protocoloBody = nuevoProtocolo;
            

            this.imgDiagramaTemp = null; // ya usamos la del servidor
            this.imgDiagrama = null;
            this.opcion = 'U'; // Navegar al formulario ya en modo edición
            

            toastr.success('Éxito!', 'Diagrama actualizado correctamente');
          })
          .catch((err) => {
            console.error(err);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo subir el diagrama.',
              icon: 'error',
            });
          });
      }
    });
  } */

  /* verImagenDiagrama(): string {
    const noImage = './assets/images/no_image.jpg';

    const nombreArchivo = this.protocoloBody?._i?.diagrama_protope;

    // Si no hay nombre de archivo en el protocolo → imagen por defecto
    if (!nombreArchivo || nombreArchivo.trim() === '') {
      return noImage;
    }

    // Si hay nombre/ID de archivo → construye la URL al backend
    return this._postoperatorioService.verDiagrama(nombreArchivo);
  } */

  /* onChangeDiagrama(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? undefined;

    this.cambiarImagenDiagrama(file);

    // Limpio el input para que si el usuario selecciona el mismo archivo,
    // el evento (change) vuelva a dispararse.
    input.value = '';
  } */

  cambiarImagenDiagrama(file?: File) {
    this.imgDiagrama = file;
    //cambiar la imagen
    if (!file) {
      return (this.imgDiagramaTemp = null);
    }

    // ✅ Validar tipo MIME permitido
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        title: '¡Error!',
        text: 'Solo se permiten imágenes JPG, JPEG, PNG o WebP.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      this.imgDiagramaTemp = null;
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      this.imgDiagramaTemp = reader.result;
    };
  }

  subirImagenDiagrama() {
    Swal.fire({
      title: 'Confirmación',
      text: `Desea subir la imagen asignada como Diagrama del Protocolo PostOperatorio ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._postoperatorioService
          .actualizarDiagrama(this.imgDiagrama, this.protocoloBody)
          .then((img) => {
            console.log(JSON.stringify(img))
            //this.parametrizarPostOperatorio(img);
            //this.protocoloBody = img;
            this.opcion = 'U';
            toastr.success('Éxito!', 'Diagrama actualizado correctamente');
             this._routerService2.navigate([
                  '/form_protocolo', // ajusta la ruta si tu route es otro
                  img._a.pk_protope,
                  false,
                ]);

          });
      }
    });
  }

  verImagenDiagrama(): string {
    const noImage = './assets/images/no_image.jpg'; // 👈 pon aquí tu imagen por defecto
    
    if(!this.protocoloBody._i.diagrama_protope ||
      this.protocoloBody._i.diagrama_protope === null ||
      this.protocoloBody._i.diagrama_protope === undefined ||
      this.protocoloBody._i.diagrama_protope === '' 
    ){
      //alert('No IMagen')
      return noImage;
    }else{
      return this._postoperatorioService.verDiagrama(
          this.protocoloBody._i.diagrama_protope
        );
    }

  }
}
