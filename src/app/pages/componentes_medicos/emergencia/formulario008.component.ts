import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subject, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PersonaService } from '../../../services/persona/persona.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonaComponent } from '../../administrador/persona/persona.component';
import Swal from 'sweetalert2';
import { HistoriaClinicaService } from '../../../services/historia_clinica/historia_clinica.service';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { LoaderBookComponent } from '../../../componentes_reutilizables/loader-book/loader-book.component';
import { HistoriaClinica } from '../historia_clinica/historia_clinica.interface';
import {
  Emergencia,
  EmergenciaDiagnostico,
  EmergenciaPlanTratamiento,
} from './formulario008.interface';
import { EmergenciaService } from '../../../services/emergencia/emergencia.service';
import { LoginService } from '../../../services/login.service';
import { CasasSaludService } from '../../../services/casas_salud/casas_salud.service';
import { ScoreMamaService } from '../../../services/historia_clinica/score-mama.services';
import { CieService } from '../../../services/cie/cie.service';
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-formulario008',
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './formulario008.component.html',
  styles: ``,
})
export class Formulario008Component {
  private _routerService = inject(ActivatedRoute);
  public _routerService2 = inject(Router);
  private _historiaClinica = inject(HistoriaClinicaService);
  private _008Service = inject(EmergenciaService);
  private _loginService = inject(LoginService);
  private _casaSaludService = inject(CasasSaludService);
  private scoreMamaService = inject(ScoreMamaService);
  private _cieService = inject(CieService);

  //Variables ScoreMama
  sm_frecuencia_cardiaca: any = null;
  sm_sistolica: any = null;
  sm_diastolica: any = null;
  sm_frecuencia_respiratoria: any = null;
  sm_temperatura: any = null;
  sm_saturacion: any = null;
  sm_estado_conciencia: any = null;
  sm_proteinuria: any = null;
  leyenda_scoremama = '';

  opcion: string = 'I';
  hcu: any;
  casaSaludBody: any = {};
  emergenciaBody: Emergencia;
  identificacion: string;
  tabActivo: string = 'persona';
  idNum: number = 0;

  //variables del loading
  loading: boolean = true;
  isLoading = false;

  //Variables de Diagnosticos
  listDiagnosticos: any[];
  diagnosticoBody: EmergenciaDiagnostico = {
    pk_emerdiag: 0,
    fk_emerg: 0,
    fk_cie: 0,
    fecha_creacion_emerdiag: null,
    fecha_modificacion_emerdiag: null,
    tipo_emerdiag: null,
  };
  listCie10: any[];
  idCie: any;
  typeahead = new Subject<string>();

  //Variables de Plan de Tratamiento
  planTratamientoBody: EmergenciaPlanTratamiento = {
    pk_plantra: 0, // se inicializa en 0 porque es serial (lo genera la BD)
    fk_emerg: 0, // se deberá setear al crear
    fecha_creacion_plantra: null, // normalmente se llena desde backend
    fecha_modificacion_plantra: null,
    medicamiento_plantra: '', // vacío hasta que se ingrese medicamento
    via_plantra: '', // ejemplo: ORAL, IV, IM
    dosis_plantra: '', // ejemplo: "500 mg"
    posologia_plantra: '', // ejemplo: "Cada 8 horas"
    dias: 0, // cantidad de días de tratamiento
  };

  listPlanTratamiento: any[];

  constructor() {
    this.inicializacion008();
    const id = this._routerService.snapshot.paramMap.get('id');
    this.idNum = Number(id);

    if (this.idNum != 0) {
      if (!isNaN(this.idNum)) {
        this.opcion = 'U';
        this.editar008(this.idNum);
      } else {
        console.error('ID no es un número válido');
      }
    } else {
      //inicializaciones
      this.inicializacion008();
    }
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

  inicializacion008() {
    this.getCasaSalud();
    this.emergenciaBody = {
      _a: {
        pk_emerg: 0,
        casalud_id_fk: 0,
        fk_hcu: 0,
        adminisionista_usu_id_fk: 0,
        estado_emerg: false,
      },
      _b: {
        forma_llegada: {
          ambulatorio: false,
          ambulancia: false,
          otro_trans: false,
        },
        fuente: null,
        institucion_entrega: null,
        telefono_inst: null,
      },
      _c: {
        fecha: null,
        hora: null,
        condicion_llegada: {
          estable: false,
          inestable: false,
          fallecido: false,
        },
        motivo_atencion: null,
      },
      _d: {
        fecha: null,
        hora: null,
        lugar: null,
        direccion: null,
        custodia_policial: 'NO',
        accidente_transito: false,
        caida: false,
        quemadura: false,
        mordedura: false,
        ahogamiento: false,
        asfixia: false,
        cuerpo_extrano: false,
        aplastamiento: false,
        otro_accidente: false,
        violencia_arma_fuego: false,
        violencia_arma_punzante: false,
        violencia_rina: false,
        violencia_familiar: false,
        violencia_fisica: false,
        violencia_psicologica: false,
        violencia_sexual: false,
        notificacion: 'NO',
        intox_alcoholica: false,
        intox_alimentaria: false,
        intox_drogas: false,
        intox_gases: false,
        intox_otra: false,
        picadura: false,
        envenenamiento: false,
        anafilaxia: false,
        aliento_alcohol: false,
        observacion_d: null,
      },
      _e: {
        no_aplica: false,
        alergicos: false,
        clinicos: false,
        traumatologicos: false,
        ginecologicos: false,
        pediatricos: false,
        quirurgicos: false,
        farmacologicos: false,
        habitos: false,
        familiares: false,
        otros: false,
        observacion_e: null,
      },
      _f: { observacion_f: null },
      _g: {
        sin_constantes_vitales: null,
        presion_arterial_mmhg: null,
        presion_arterial_sistolica: null,
        presion_arterial_diastolica: null,
        pulso_por_min: null,
        frecuencia_respiratoria_por_min: null,
        pulsioximetria_porcentaje: null,
        temperatura: null,
        estado_conciencia: null,
        proteinuria: null,
        score_mama: null,
        peso_kg: null,
        talla_cm: null,
        glicemia_capilar_mg_dl: null,
        glasgow: null,
        ocular: null,
        verbal: null,
        motora: null,
        perimetro_cefalico: null,
        eva: null,
        pupila_izq: null,
        pupila_der: null,
        llenado_capilar: null,
      },
      _h: {
        piel_faneras: false,
        cabeza: false,
        ojos: false,
        oidos: false,
        nariz: false,
        boca: false,
        oro_faringe: false,
        cuello: false,
        axilas_mamas: false,
        torax: false,
        abdomen: false,
        columna_vertebral: false,
        ingle_perine: false,
        miembros_superiores: false,
        miembros_inferiores: false,
        observacion_h: null,
      },
      _i: { observacion_i: null },
      _j: {
        no_aplica: false,
        numero_gestas: null,
        numero_partos: null,
        numero_abortos: null,
        numero_cesareas: null,
        fum: null,
        semanas_gestacion: null,
        movimiento_fetal: null,
        frecuencia_cardiaca_fetal: null,
        ruptura_de_membranas: null,
        tiempo: null,
        afu: null,
        presentacion: null,
        dilatacion: null,
        borramiento: null,
        plano: null,
        pelvis_viable: null,
        sangrado_vaginal: null,
        contracciones: null,
        score_mama: null,
        observacion_j: null,
      },
      _k: {
        no_aplica: false,
        biometria: false,
        uroanalisis: false,
        quimica_sanguinea: false,
        electrolitos: false,
        gasometria: false,
        electro_cardiograma: false,
        rx_torax: false,
        rx_osea: false,
        ecografia_pelvica: false,
        ecografia_abdomen: false,
        rx_abdomen: false,
        interconsulta: false,
        tomografia: false,
        resonancia: false,
        endoscopia: false,
        otros: false,
        observacion_k: null,
      },
      _n: { observacion_n: null },
      _o: {
        vivo: false,
        estable: false,
        inestable: false,
        fallecido: false,
        alta_definitiva: false,
        consulta_externa: false,
        observacion_de_emergencia: false,
        hospitalizacion: false,
        referencia: false,
        inversa: false,
        derivacion: false,
        establecimiento: null,
        dias_reposo: null,
        observacion_o: null,
      },
      _p: { medico_usu_id_fk: null },
      auditoria: { fecha_creacion: null, fecha_modificacion: null },
    };
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //@@@@@         Funciones Auxiliares    @@@@@
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  noAplicaE(valor: boolean) {
    if (valor) {
      // Desmarcar y deshabilitar el resto
      this.emergenciaBody._e = {
        ...this.emergenciaBody._e,
        alergicos: false,
        clinicos: false,
        traumatologicos: false,
        ginecologicos: false,
        pediatricos: false,
        quirurgicos: false,
        farmacologicos: false,
        habitos: false,
        familiares: false,
        otros: false,
        // observacion_e la dejamos tal cual (o limpia si prefieres)
        // observacion_e: null
      };
    }
  }

  //Cambiar si encuentra en comillas simples a dobles
  sanitizeEmergenciaBodyStrings(obj: any): any {
    // Recorremos el objeto de forma recursiva
    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      if (typeof value === 'string' && value !== null) {
        // Reemplaza todas las comillas simples por dobles
        obj[key] = value.replace(/'/g, '"');
      } else if (typeof value === 'object' && value !== null) {
        // Si es un objeto, llamamos de nuevo la función
        this.sanitizeEmergenciaBodyStrings(value);
      }
      // Si es number, boolean o null no hacemos nada
    });

    return obj;
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //@@@@@@@@@@@ Calculos ScoreMama @@@@@@@@@@@@@@@
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  limpiarSignosVitalesSegunGenero() {
    this.emergenciaBody._g.proteinuria = null;
    this.emergenciaBody._g.score_mama = null;
    this.emergenciaBody._j.score_mama = null;
    this.sm_proteinuria = null;
    this.leyenda_scoremama = '';
  }

  accionCalculoScoreMama() {
    if (
      this.emergenciaBody._g.pulso_por_min != null &&
      this.emergenciaBody._g.presion_arterial_sistolica != null &&
      this.emergenciaBody._g.presion_arterial_diastolica != null &&
      this.emergenciaBody._g.frecuencia_respiratoria_por_min != null &&
      this.emergenciaBody._g.temperatura != null &&
      this.emergenciaBody._g.pulsioximetria_porcentaje != null &&
      this.emergenciaBody._g.estado_conciencia != null &&
      this.emergenciaBody._g.proteinuria != null
    ) {
      this.loadCalculosSignosVitales();
    }
  }

  loadCalculosSignosVitales() {
    this.variablesScoreMama(1, this.emergenciaBody._g.pulso_por_min);
    this.variablesScoreMama(
      2,
      this.emergenciaBody._g.presion_arterial_sistolica
    );
    this.variablesScoreMama(
      3,
      this.emergenciaBody._g.presion_arterial_diastolica
    );
    this.variablesScoreMama(
      4,
      this.emergenciaBody._g.frecuencia_respiratoria_por_min
    );
    this.variablesScoreMama(5, this.emergenciaBody._g.temperatura);
    this.variablesScoreMama(
      6,
      this.emergenciaBody._g.pulsioximetria_porcentaje
    );
    this.variablesScoreMama(7, this.emergenciaBody._g.estado_conciencia);
    this.variablesScoreMama(8, this.emergenciaBody._g.proteinuria);
  }

  variablesScoreMama(opcion: number, valor_param: any) {
    let valor: number = 0;
    //1 Puntuacion: FC
    //2 Puntuacion: Sistolica
    //3 Puntuacion: Diastolica
    //4 Puntuacion: FR (Frecuencia Respiratoria)
    //5 Puntuacion: T (°C) (Temperatura Corporal)
    //6 Puntuacion: Sat (Saturación de Oxígeno)
    //7 Puntuacion: Estado de Conciencia
    //8 Puntuacion: Sat (Saturación de Oxígeno)

    /**
     *   sm_frecuencia_cardiaca:any=null;
  sm_sistolica:any=null;
  sm_diastolica:any=null;
  sm_frecuencia_respiratoria:any=null;
  sm_temperatura:any=null;
  sm_saturacion:any=null;
  sm_estado_conciencia:any=null;
  sm_proteinuria:any=null;
     * 
     */

    if (opcion === 1) {
      valor = parseFloat(valor_param);
      if (valor != null && typeof valor === 'number' && !isNaN(valor)) {
        this.sm_frecuencia_cardiaca =
          this.scoreMamaService.calc_frecuencia_cardiaca(valor);
        //console.error(`this.sm_frecuencia_cardiaca = ${this.sm_frecuencia_cardiaca}`)
      } else {
        this.sm_frecuencia_cardiaca = null;
        console.log('Frecuencia Cardiaca NULL');
      }
    } else if (opcion === 2) {
      valor = parseFloat(valor_param);
      console.error(`valor sm_sistolica = ${valor}`);
      if (valor != null && typeof valor === 'number' && !isNaN(valor)) {
        this.sm_sistolica = this.scoreMamaService.calc_sistolica(valor);
        //console.error(`this.sm_sistolica = ${this.sm_sistolica}`)
      } else {
        this.sm_sistolica = null;
      }
    } else if (opcion === 3) {
      valor = parseFloat(valor_param);
      //console.error(`valor sm_diastolica = ${valor}`)
      if (valor != null && typeof valor === 'number') {
        this.sm_diastolica = this.scoreMamaService.calc_diastolica(valor);
        //console.error(`this.sm_diastolica = ${this.sm_diastolica}`)
      } else {
        this.sm_diastolica = null;
      }
    } else if (opcion === 4) {
      valor = parseFloat(valor_param);
      if (valor != null && typeof valor === 'number') {
        this.sm_frecuencia_respiratoria =
          this.scoreMamaService.calc_frecuencia_respiratoria(valor);
      } else {
        this.sm_frecuencia_respiratoria = null;
      }
    } else if (opcion === 5) {
      valor = parseFloat(valor_param);
      if (valor != null && typeof valor === 'number') {
        this.sm_temperatura = this.scoreMamaService.calc_temperatura(valor);
      } else {
        this.sm_temperatura = null;
      }
    } else if (opcion === 6) {
      valor = parseFloat(valor_param);
      if (valor != null && typeof valor === 'number') {
        this.sm_saturacion = this.scoreMamaService.calc_saturacion(valor);
      } else {
        this.sm_saturacion = null;
      }
    } else if (opcion === 7) {
      let valorString: string = String(valor_param);
      if (valorString != null && typeof valorString === 'string') {
        this.sm_estado_conciencia =
          this.scoreMamaService.calc_estado_conciencia(valorString);
      } else {
        this.sm_estado_conciencia = null;
      }
    } else if (opcion === 8) {
      valor = parseFloat(valor_param);
      if (valor != null && typeof valor === 'number') {
        this.sm_proteinuria = this.scoreMamaService.calc_proteinuria(valor);
      } else {
        this.sm_proteinuria = null;
      }
    }

    //Calculo del ScoreMama
    this.calculoScoreMama();
  }

  calculoScoreMama() {
    if (
      this.sm_frecuencia_cardiaca != null &&
      this.sm_sistolica != null &&
      this.sm_diastolica != null &&
      this.sm_frecuencia_respiratoria != null &&
      this.sm_temperatura != null &&
      this.sm_saturacion != null &&
      this.sm_estado_conciencia != null &&
      this.sm_proteinuria != null
    ) {
      this.emergenciaBody._g.score_mama =
        this.sm_frecuencia_cardiaca +
        this.sm_sistolica +
        this.sm_diastolica +
        this.sm_frecuencia_respiratoria +
        this.sm_temperatura +
        this.sm_saturacion +
        this.sm_estado_conciencia +
        this.sm_proteinuria;
      this.colocarleyenda();
    } else {
      this.emergenciaBody._g.score_mama = null;
      this.leyenda_scoremama = '';
    }

    this.emergenciaBody._j.score_mama = this.emergenciaBody._g.score_mama;
  }

  colocarleyenda() {
    if (this.emergenciaBody._g.score_mama != null) {
      if (this.emergenciaBody._g.score_mama == 0) {
        this.leyenda_scoremama =
          'Evaluar y analizar factores de riesgo, bienestar maternofetal y signos de alarma!!';
      } else if (this.emergenciaBody._g.score_mama == 1) {
        this.leyenda_scoremama = 'Aplique Score MAMÁ c/4 horas y registre.';
      } else if (
        this.emergenciaBody._g.score_mama >= 2 &&
        this.emergenciaBody._g.score_mama <= 4
      ) {
        this.leyenda_scoremama = 'Aplique el Score MAMÁ c/ hora y registre';
      } else if (this.emergenciaBody._g.score_mama >= 5) {
        this.leyenda_scoremama = 'Aplique Score MAMÁ c/ 30 minutos y registre.';
      }
    }
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //@@@@@@@@@@@ Fin ScoreMama @@@@@@@@@@@@@@@
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // Devuelve el score mamá calculado (ajusta la lógica a tu regla real)

  // Si decides habilitar el botón de acciones, esto limpia los dos campos:
  limpiarProteinuriaYScore(): void {
    this.emergenciaBody._g.proteinuria = null;
    this.emergenciaBody._g.score_mama = null;
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  consultarHcu(identificacion: any) {
    this._historiaClinica.getAllHistoriaClinicaId(identificacion, 2).subscribe({
      next: (resp) => {
        if (!resp.data || Object.keys(resp.data).length === 0) {
          Swal.fire({
            title: 'No existe',
            text: `No se encontró una Historia Clínica con identificación ${identificacion}, por favor crearla para realizar seguir el proceso`,
            icon: 'warning',
            confirmButtonText: 'Aceptar',
          });
          this.hcu = null; // limpia por si acaso
          this.emergenciaBody._a.fk_hcu = null;
          return;
        }

        this.hcu = resp.data;
        //Lleno la seccion A
        this.emergenciaBody._a.pk_emerg = 0;
        this.emergenciaBody._a.fk_hcu = this.hcu.pk_hcu;
        this.emergenciaBody._a.adminisionista_usu_id_fk =
          this._loginService.getUserLocalStorage().pk_usuario;
        this.emergenciaBody._p.medico_usu_id_fk =
          this.emergenciaBody._a.adminisionista_usu_id_fk;
        this.emergenciaBody._a.casalud_id_fk = this.casaSaludBody.casalud_id_pk;
      },
      error: (err) => {
        toastr.error(
          'Error',
          `${err} - Datos no cargados del HCU  ${identificacion}`
        );
      },
    });
  }

  // Asume: this.emergenciaBody: Emergencia

  cargarFormato008(payload: any): void {
    const d = payload?.data ?? {};

    // Helpers de tipo
    const str = (v: any): string | null =>
      v === null || v === undefined ? null : String(v);

    const num = (v: any): number | null => {
      if (v === null || v === undefined || v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const bool = (v: any): boolean => !!v;

    // Aliases
    const b = d.registro_admision ?? {};
    const c = d.inicio_atencion ?? {};
    const d2 = d.accidente_violencia ?? {};
    const e = d.antecedentes ?? {};
    const g = d.constantes_vitales ?? {};
    const h = d.examen_fisico ?? {};
    const j = d.examen_parto ?? {};
    const k = d.examen_complementario ?? {};
    const o = d.condicion_egreso ?? {};

    // Derivados sección G
    const sis = num(g.presion_arterial_sistolica);
    const dia = num(g.presion_arterial_diastolica);
    const pa_mmhg: string | null =
      sis !== null && dia !== null
        ? `${sis}/${dia}`
        : str(g.presion_arterial_mmhg);

    const ocular = num(g.ocular);
    const verbal = num(g.verbal);
    const motora = num(g.motora);
    const glasgow: number | null =
      ocular !== null && verbal !== null && motora !== null
        ? ocular + verbal + motora
        : num(g.glasgow);

    // sin_constantes_vitales: string | null  (normalizo a 'SI'/'NO'/null)
    const sinCV: string | null =
      g.sin_constantes_vitales === true
        ? 'SI'
        : g.sin_constantes_vitales === false
        ? 'NO'
        : null;

    this.emergenciaBody = {
      _a: {
        pk_emerg: Number(d.pk_emerg ?? 0),
        casalud_id_fk: Number(d.casalud_id_fk ?? 0),
        fk_hcu: Number(d.fk_hcu ?? 0),
        adminisionista_usu_id_fk: Number(d.adminisionista_usu_id_fk ?? 0),
        estado_emerg: Boolean(d.estado_emerg ?? true),
      },

      _b: {
        forma_llegada: {
          ambulatorio: bool(b?.forma_llegada?.ambulatorio),
          ambulancia: bool(b?.forma_llegada?.ambulancia),
          otro_trans: bool(b?.forma_llegada?.otro_trans),
        },
        fuente: str(b.fuente),
        institucion_entrega: str(b.institucion_entrega),
        telefono_inst: str(b.telefono_inst),
      },

      _c: {
        fecha: str(c.fecha),
        hora: str(c.hora),
        condicion_llegada: {
          estable: bool(c?.condicion_llegada?.estable),
          inestable: bool(c?.condicion_llegada?.inestable),
          fallecido: bool(c?.condicion_llegada?.fallecido),
        },
        motivo_atencion: str(c.motivo_atencion),
      },

      _d: {
        fecha: str(d2.fecha),
        hora: str(d2.hora),
        lugar: str(d2.lugar),
        direccion: str(d2.direccion),
        custodia_policial: str(d2.custodia_policial),
        accidente_transito: bool(d2.accidente_transito),
        caida: bool(d2.caida),
        quemadura: bool(d2.quemadura),
        mordedura: bool(d2.mordedura),
        ahogamiento: bool(d2.ahogamiento),
        asfixia: bool(d2.asfixia),
        cuerpo_extrano: bool(d2.cuerpo_extrano),
        aplastamiento: bool(d2.aplastamiento),
        otro_accidente: bool(d2.otro_accidente),
        violencia_arma_fuego: bool(d2.violencia_arma_fuego),
        violencia_arma_punzante: bool(d2.violencia_arma_punzante),
        violencia_rina: bool(d2.violencia_rina),
        violencia_familiar: bool(d2.violencia_familiar),
        violencia_fisica: bool(d2.violencia_fisica),
        violencia_psicologica: bool(d2.violencia_psicologica),
        violencia_sexual: bool(d2.violencia_sexual),
        notificacion: str(d2.notificacion),
        intox_alcoholica: bool(d2.intox_alcoholica),
        intox_alimentaria: bool(d2.intox_alimentaria),
        intox_drogas: bool(d2.intox_drogas),
        intox_gases: bool(d2.intox_gases),
        intox_otra: bool(d2.intox_otra),
        picadura: bool(d2.picadura),
        envenenamiento: bool(d2.envenenamiento),
        anafilaxia: bool(d2.anafilaxia),
        aliento_alcohol: bool(d2.aliento_alcohol),
        observacion_d: str(d2.observacion_d),
      },

      _e: {
        no_aplica: bool(e.no_aplica),
        alergicos: bool(e.alergicos),
        clinicos: bool(e.clinicos),
        traumatologicos: bool(e.traumatologicos),
        ginecologicos: bool(e.ginecologicos),
        pediatricos: bool(e.pediatricos),
        quirurgicos: bool(e.quirurgicos),
        farmacologicos: bool(e.farmacologicos),
        habitos: bool(e.habitos),
        familiares: bool(e.familiares),
        otros: bool(e.otros),
        observacion_e: str(e.observacion_e),
      },

      _f: {
        observacion_f: str(d.enfermedad_problema),
      },

      _g: {
        sin_constantes_vitales: sinCV, // string | null
        presion_arterial_mmhg: pa_mmhg, // string | null
        presion_arterial_sistolica: str(sis), // string | null
        presion_arterial_diastolica: str(dia), // string | null
        pulso_por_min: str(g.pulso_por_min), // string | null
        frecuencia_respiratoria_por_min: str(g.frecuencia_respiratoria_por_min),
        pulsioximetria_porcentaje: str(g.pulsioximetria_porcentaje),
        temperatura: str(g.temperatura),
        estado_conciencia: str(g.estado_conciencia),
        proteinuria: str(g.proteinuria),
        score_mama: num(g.score_mama), // number | null
        peso_kg: str(g.peso_kg),
        talla_cm: str(g.talla_cm),
        glicemia_capilar_mg_dl: str(g.glicemia_capilar_mg_dl),
        glasgow: glasgow, // number | null
        ocular: ocular, // number | null
        verbal: verbal, // number | null
        motora: motora, // number | null
        perimetro_cefalico: str(g.perimetro_cefalico),
        eva: str(g.eva),
        pupila_izq: str(g.pupila_izq),
        pupila_der: str(g.pupila_der),
        llenado_capilar: str(g.llenado_capilar),
      },

      _h: {
        piel_faneras: bool(h.piel_faneras),
        cabeza: bool(h.cabeza),
        ojos: bool(h.ojos),
        oidos: bool(h.oidos),
        nariz: bool(h.nariz),
        boca: bool(h.boca),
        oro_faringe: bool(h.oro_faringe),
        cuello: bool(h.cuello),
        axilas_mamas: bool(h.axilas_mamas),
        torax: bool(h.torax),
        abdomen: bool(h.abdomen),
        columna_vertebral: bool(h.columna_vertebral),
        ingle_perine: bool(h.ingle_perine),
        miembros_superiores: bool(h.miembros_superiores),
        miembros_inferiores: bool(h.miembros_inferiores),
        observacion_h: str(h.observacion_h),
      },

      _i: {
        observacion_i: str(d.examen_trauma),
      },

      _j: {
        no_aplica: bool(j.no_aplica),
        numero_gestas: num(j.numero_gestas),
        numero_partos: num(j.numero_partos),
        numero_abortos: num(j.numero_abortos),
        numero_cesareas: num(j.numero_cesareas),
        fum: str(j.fum),
        semanas_gestacion: num(j.semanas_gestacion),
        movimiento_fetal: str(j.movimiento_fetal), // string | null (por tu interfaz)
        frecuencia_cardiaca_fetal: str(j.frecuencia_cardiaca_fetal), // string | null
        ruptura_de_membranas: str(j.ruptura_de_membranas),
        tiempo: str(j.tiempo),
        afu: str(j.afu),
        presentacion: str(j.presentacion),
        dilatacion: str(j.dilatacion),
        borramiento: str(j.borramiento),
        plano: str(j.plano),
        pelvis_viable: str(j.pelvis_viable),
        sangrado_vaginal: str(j.sangrado_vaginal),
        contracciones: str(j.contracciones),
        score_mama: num(j.score_mama),
        observacion_j: str(j.observacion_j),
      },

      _k: {
        no_aplica: bool(k.no_aplica),
        biometria: bool(k.biometria),
        uroanalisis: bool(k.uroanalisis),
        quimica_sanguinea: bool(k.quimica_sanguinea),
        electrolitos: bool(k.electrolitos),
        gasometria: bool(k.gasometria),
        electro_cardiograma: bool(k.electro_cardiograma),
        rx_torax: bool(k.rx_torax),
        rx_osea: bool(k.rx_osea),
        ecografia_pelvica: bool(k.ecografia_pelvica),
        ecografia_abdomen: bool(k.ecografia_abdomen),
        rx_abdomen: bool(k.rx_abdomen),
        interconsulta: bool(k.interconsulta),
        tomografia: bool(k.tomografia),
        resonancia: bool(k.resonancia),
        endoscopia: bool(k.endoscopia),
        otros: bool(k.otros),
        observacion_k: str(k.observacion_k),
      },

      _n: { observacion_n: null }, // no viene en payload

      _o: {
        vivo: bool(o.vivo),
        estable: bool(o.estable),
        inestable: bool(o.inestable),
        fallecido: bool(o.fallecido),
        alta_definitiva: bool(o.alta_definitiva),
        consulta_externa: bool(o.consulta_externa),
        observacion_de_emergencia: bool(o.observacion_de_emergencia),
        hospitalizacion: bool(o.hospitalizacion),
        referencia: bool(o.referencia),
        inversa: bool(o.inversa),
        derivacion: bool(o.derivacion),
        // En tu interfaz es boolean; si el backend trae texto, se considerará true si no es vacío.
        establecimiento: bool(o.establecimiento),
        // En tu interfaz es string | null; convierto a string
        dias_reposo: str(o.dias_reposo),
        observacion_o: str(o.observacion_o),
      },

      _p: { medico_usu_id_fk: num(d.medico_usu_id_fk) },

      auditoria: {
        fecha_creacion: d.fecha_creacion_008
          ? JSON.stringify(d.fecha_creacion_008)
          : null,
        fecha_modificacion: d.fecha_modificacion_008
          ? JSON.stringify(d.fecha_modificacion_008)
          : null,
      },
    };

    //Cargar Diagnosticos
    this.getListaDiagnosticos();

    //Cagar Plan de Tratamiento
  }

  editar008(id_008: number) {
    this.opcion = 'U';
    this._008Service.getEmergenciaId(id_008, 1).subscribe({
      next: (resp) => {
        this.hcu = resp.data;
        this.identificacion = this.hcu.numidentificacion_persona;
        this.cargarFormato008(resp);
        this.emergenciaBody._p.medico_usu_id_fk =
          this._loginService.getUserLocalStorage().pk_usuario;
      },
      error: (err) => {
        // manejo de error
        toastr.error(
          'Error',
          `${err} - Datos no cargados del formulario 008  ${id_008}`
        );
      },
    });
  }

  validarGuardar() {
    if (
      !this.emergenciaBody ||
      !this.emergenciaBody._a.fk_hcu ||
      this.emergenciaBody._a.fk_hcu === null ||
      this.emergenciaBody._a.fk_hcu === undefined ||
      !this.emergenciaBody._a.casalud_id_fk ||
      this.emergenciaBody._a.casalud_id_fk === null ||
      this.emergenciaBody._a.casalud_id_fk === undefined ||
      !this.emergenciaBody._a.adminisionista_usu_id_fk ||
      this.emergenciaBody._a.adminisionista_usu_id_fk === null ||
      this.emergenciaBody._a.adminisionista_usu_id_fk === undefined ||
      !this.emergenciaBody._p.medico_usu_id_fk ||
      this.emergenciaBody._p.medico_usu_id_fk === null ||
      this.emergenciaBody._p.medico_usu_id_fk === undefined
    ) {
      return false;
    }
    return true;
  }

  guardar008() {
    this.emergenciaBody = this.sanitizeEmergenciaBodyStrings(
      this.emergenciaBody
    );
    Swal.fire({
      title: '¿Está seguro?',
      text: `Desea guardar la información del formulario 008`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._008Service
          .guardarEmergencia(this.emergenciaBody, this.opcion)
          .subscribe({
            next: (resp) => {
              this.opcion = `U`;
              if (resp.status && resp.status === 'ok') {
                this.emergenciaBody = resp.data;
                this._routerService2.navigate([
                  '/emergencia',
                  this.emergenciaBody._a.pk_emerg,
                ]);

                toastr.success('Éxito', `Formulario 008 creada!`);
              } else {
                // manejo de error
                toastr.error('Error', `Problema al crear formulario 008`);
              }
            },
            error: (err) => {
              // manejo de error
              toastr.error(
                'Error',
                `${err} - Problema al crear formulario 008 2`
              );
            },
          });
      }
    });
  }

  cerrarFormulario008() {
    Swal.fire({
      title: '¿Está seguro?',
      text: `La siguiente acción cerrará el formulario 008 y ya no podra ser editado, verifique que tenga la información llena y correcta para realizar esta acción, caso contrario proceda a cerrar`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.emergenciaBody._a.estado_emerg = true;
        this._008Service
          .guardarEmergencia(this.emergenciaBody, this.opcion)
          .subscribe({
            next: (resp) => {
              if (resp.status && resp.status === 'ok') {
                this.emergenciaBody = resp.data;
                this._routerService2.navigate(['/emergencia']);

                toastr.success('Éxito', `Formulario 008 cerrado!`);
              } else {
                // manejo de error
                toastr.error('Error', `Problema al cerrar formulario 008`);
              }
            },
            error: (err) => {
              // manejo de error
              toastr.error(
                'Error',
                `${err} - Problema al cerrar formulario 008 2`
              );
            },
          });
      }
    });
  }

  imprimirForm008() {
    const id = this.emergenciaBody?._a?.pk_emerg;
    if (!id) {
      toastr.error('Sin ID', 'No hay pk_emerg para imprimir.');
      return;
    }

    // Mostrar Loading con SweetAlert
    Swal.fire({
      title: 'Generando reporte..',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this._008Service.impresionEmergenciaId(id).subscribe({
      next: (resp: any) => {
        const b64 = resp?.message;
        if (!b64 || typeof b64 !== 'string') {
          Swal.close();
          toastr.error('Respuesta inválida', 'No se recibió el PDF.');
          return;
        }

        // Convertir Base64 a Blob
        const byteChars = atob(b64);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        Swal.close(); // 🔹 Cerrar loading antes de abrir el PDF

        // Abrir en nueva pestaña
        const win = window.open(url, '_blank');
        if (!win) {
          // Si bloquea el popup -> descargar
          const a = document.createElement('a');
          a.href = url;
          a.download = `form008_${id}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }

        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: (err) => {
        Swal.close();
        toastr.error('Error', `${err} - No se pudo imprimir el Form. 008`);
      },
    });
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //@@@@@@@@ Diagnostico @@@@@@@@@@@@@
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  getListaDiagnosticos() {
    this._008Service
      .getDiagnosticos(this.emergenciaBody._a.pk_emerg)
      .subscribe({
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
      pk_emerdiag: 0,
      fk_emerg: this.emergenciaBody._a.pk_emerg,
      fk_cie: 0,
      fecha_creacion_emerdiag: null,
      fecha_modificacion_emerdiag: null,
      tipo_emerdiag: null,
    };
    // ✅ Abre el modal con jQuery Bootstrap
    $('#diagnosticoModal').modal('show');
    this.listCie10 = [];
    this.idCie = null;
  }

  validarGuardarDiagnostico() {
    if (
      !this.diagnosticoBody ||
      !this.diagnosticoBody.fk_emerg ||
      this.diagnosticoBody.fk_emerg === null ||
      this.diagnosticoBody.fk_emerg == undefined ||
      !this.diagnosticoBody.fk_cie ||
      this.diagnosticoBody.fk_cie === null ||
      this.diagnosticoBody.fk_cie == undefined ||
      !this.diagnosticoBody.tipo_emerdiag ||
      this.diagnosticoBody.tipo_emerdiag === null ||
      this.diagnosticoBody.tipo_emerdiag == undefined
    ) {
      return false;
    }
    return true;
  }

  guardarDiagnostico() {
    Swal.fire({
      title: '¿Está seguro?',
      text: `Desea guardar el diagnostico seleccionado al formulario 008`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._008Service
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
      text: `Desea eliminar el diagnostico seleccionado al formulario 008`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._008Service.guardarDiagnostico(diagnostico, 'D').subscribe({
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

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //@@@@@@@@ Plan de Tratamiento@@@@@@
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  getListaPlanTratamiento() {
    this._008Service
      .getPlanTratamiento(this.emergenciaBody._a.pk_emerg)
      .subscribe({
        next: (resp) => {
          if (resp.status === 'ok') {
            this.listPlanTratamiento = resp.rows;
          }
        },
        error: (err) => {
          // manejo de error
          Swal.fire({
            title: '¡Error!',
            icon: 'error',
            text: `Plan Tratamiento - ${err.message}`,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  nuevoPlanTratamiento() {
    this.planTratamientoBody = {
      pk_plantra: 0, // se inicializa en 0 porque es serial (lo genera la BD)
      fk_emerg: this.emergenciaBody._a.pk_emerg, // se deberá setear al crear
      fecha_creacion_plantra: null, // normalmente se llena desde backend
      fecha_modificacion_plantra: null,
      medicamiento_plantra: '', // vacío hasta que se ingrese medicamento
      via_plantra: '', // ejemplo: ORAL, IV, IM
      dosis_plantra: '', // ejemplo: "500 mg"
      posologia_plantra: '', // ejemplo: "Cada 8 horas"
      dias: 0, // cantidad de días de tratamiento
    };
    // ✅ Abre el modal con jQuery Bootstrap
    $('#planTratamientoModal').modal('show');
  }

  guardarPlanTratamiento() {
    Swal.fire({
      title: '¿Está seguro?',
      text: `Desea guardar el Plan de Tratamiento seleccionado al formulario 008`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._008Service
          .guardarPlanTratamiento(this.planTratamientoBody, 'I')
          .subscribe({
            next: (resp) => {
              if (resp.status && resp.status === 'ok') {
                //Cargar Diagnosticos
                this.getListaPlanTratamiento();
                //Cerra Modal
                // ✅ Abre el modal con jQuery Bootstrap
                $('#planTratamientoModal').modal('hide');
                toastr.success('Éxito', `Plan de Tratamiento creado!`);
              } else {
                // manejo de error
                toastr.error(
                  'Error',
                  `Problema al crear Plan de Tratamiento - Posiblemente Duplicado`
                );
              }
            },
            error: (err) => {
              // manejo de error
              toastr.error(
                'Error',
                `${err} - Problema al crear Plan de Tratamiento - Posiblemente Duplicado 2`
              );
            },
          });
      }
    });
  }

  eliminarPlanTratamiento(plan: any) {
    Swal.fire({
      title: '¿Está seguro?',
      text: `Desea eliminar el Plan de Tratamiento seleccionado al formulario 008`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._008Service.guardarPlanTratamiento(plan, 'D').subscribe({
          next: (resp) => {
            if (resp.status && resp.status === 'ok') {
              //Cargar Diagnosticos
              this.getListaPlanTratamiento();
              //Cerra Modal
              toastr.success('Éxito', `Plan Tratamiento eliminado!`);
            } else {
              // manejo de error
              toastr.error('Error', `Problema al eliminar Plan Tratamiento`);
            }
          },
          error: (err) => {
            // manejo de error
            toastr.error(
              'Error',
              `${err} - Problema al eliminar Plan Tratamiento 2`
            );
          },
        });
      }
    });
  }

  validarGuardarPlanTratamiento() {
    if (
      !this.planTratamientoBody ||
      !this.planTratamientoBody.fk_emerg ||
      this.planTratamientoBody.fk_emerg === null ||
      this.planTratamientoBody.fk_emerg == undefined ||
      !this.planTratamientoBody.medicamiento_plantra ||
      this.planTratamientoBody.medicamiento_plantra === null ||
      this.planTratamientoBody.medicamiento_plantra == undefined ||
      !this.planTratamientoBody.via_plantra ||
      this.planTratamientoBody.via_plantra === null ||
      this.planTratamientoBody.via_plantra == undefined ||
      !this.planTratamientoBody.dosis_plantra ||
      this.planTratamientoBody.dosis_plantra === null ||
      this.planTratamientoBody.dosis_plantra == undefined ||
      !this.planTratamientoBody.posologia_plantra ||
      this.planTratamientoBody.posologia_plantra === null ||
      this.planTratamientoBody.posologia_plantra == undefined ||
      !this.planTratamientoBody.dias ||
      this.planTratamientoBody.dias === null ||
      this.planTratamientoBody.dias == undefined
    ) {
      return false;
    }
    return true;
  }
}
