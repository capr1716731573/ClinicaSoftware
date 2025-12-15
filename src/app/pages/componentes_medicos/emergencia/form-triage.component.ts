import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';

import { CabeceraDetalleService } from '../../../services/cabecera_detalle/cabecera-detalle.service';
import { CasasSaludService } from '../../../services/casas_salud/casas_salud.service';
import { HistoriaClinicaService } from '../../../services/historia_clinica/historia_clinica.service';
import { LoginService } from '../../../services/login.service';
import { ScoreMamaService } from '../../../services/historia_clinica/score-mama.services';
import { TriageService } from '../../../services/emergencia/triage.service';
import { SkeletonCrudComponent } from '../../../componentes_reutilizables/skeleton/skeleton-crud.component';
import { EmergenciaTriage } from './formulario008.interface';

declare var toastr: any;

@Component({
  selector: 'app-form-triage',
  imports: [CommonModule, FormsModule, NgSelectModule, SkeletonCrudComponent],
  templateUrl: './form-triage.component.html',
  styles: `
    .manchester-sphere {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 10px;
      font-weight: 800;
      font-size: 14px;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      border: 2px solid rgba(255,255,255,0.35);
      user-select: none;
    }
    .manchester-sphere-lg {
      width: 74px;
      height: 74px;
      border-radius: 14px;
      font-size: 20px;
      letter-spacing: 1px;
      box-shadow: 0 10px 24px rgba(0,0,0,0.18);
    }
    .manchester-az { background: #1e88e5; color: #fff; }
    .manchester-ro { background: #e53935; color: #fff; }
    .manchester-am { background: #fdd835; color: #111; }
    .manchester-na { background: #fb8c00; color: #111; }
    .manchester-ve { background: #43a047; color: #fff; }
    .manchester-nd { background: #90a4ae; color: #111; }
  `
})
export class FormTriageComponent {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _triageService = inject(TriageService);
  private readonly _loginService = inject(LoginService);
  private readonly _historiaClinicaService = inject(HistoriaClinicaService);
  private readonly _casaSaludService = inject(CasasSaludService);
  private readonly _cabeceraDetalleService = inject(CabeceraDetalleService);
  private readonly _scoreMamaService = inject(ScoreMamaService);

  // UI
  loading = true;
  private loadingBase = true;
  private loadingRecord = false;
  private loadingPaciente = false;
  opcion: 'I' | 'U' = 'I';
  idNum = 0;

  identificacion = '';
  hcu: any = null; // usamos la respuesta de HCU para mostrar info del paciente
  pacienteInfo: any = null; // fallback cuando viene desde triage/id con campos paciente_...

  casaSaludBody: any = {};
  tipoSeguroList: any[] = [];

  // Variables ScoreMama (copiadas del 008)
  sm_frecuencia_cardiaca: any = null;
  sm_sistolica: any = null;
  sm_diastolica: any = null;
  sm_frecuencia_respiratoria: any = null;
  sm_temperatura: any = null;
  sm_saturacion: any = null;
  sm_estado_conciencia: any = null;
  sm_oxigeno: any = null;
  sm_gastoUrinario: any = null;
  sm_proteinuria: any = null;
  leyenda_scoremama = '';

  triageBody: EmergenciaTriage;

  readonly clasificaciones = [
    { code: 'AZ', label: 'Azul' },
    { code: 'VE', label: 'Verde' },
    { code: 'AM', label: 'Amarillo' },
    { code: 'NA', label: 'Naranja' },
    { code: 'RO', label: 'Rojo' },
  ];

  constructor() {
    const id = this._route.snapshot.paramMap.get('id');
    this.idNum = Number(id);

    this.inicializarTriage();
    this.loadCombosBase();

    if (this.idNum && !isNaN(this.idNum) && this.idNum !== 0) {
      this.opcion = 'U';
      this.loadingRecord = true;
      this.updateLoading();
      this.cargarTriage(this.idNum);
    } else {
      this.opcion = 'I';
      this.loadingRecord = false;
      this.updateLoading();
    }
  }

  // -----------------------------
  // Inicialización
  // -----------------------------
  private inicializarTriage(): void {
    const now = new Date();
    const fecha = this.formatDateYYYYMMDD(now);
    const hora = this.formatTimeHHmm(now);

    this.triageBody = {
      pk_triage: 0,
      fk_persona: 0,
      casalud_id_fk: 0,
      tip_seg_fk: 0,
      fecha_triage: fecha,
      hora_triage: hora,
      fk_usuario: this._loginService.getUserLocalStorage()?.pk_usuario ?? 0,
      signos_vitales_triage: {
        sin_constantes_vitales: false,
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
        oxigeno_terapia: null,
        gasto_urinario: null,
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
      atencion_triage: {
        area: '',
        referencia_inversa: '',
        establecimiento: '',
      },
      clasificacion_triage: '',
      observacion_triage: null,
      datos_auxiliares_triage: {},
      estado_triage: false,
      fecha_creacion: null,
      fecha_modificacion: null,
    };
  }

  private loadCombosBase(): void {
    this.loadingBase = true;
    this.updateLoading();
    let pending = 2;

    this.getCasaSalud(() => {
      pending--;
      if (pending === 0) {
        this.loadingBase = false;
        this.updateLoading();
      }
    });

    this.getTipoSeguro(() => {
      pending--;
      if (pending === 0) {
        this.loadingBase = false;
        this.updateLoading();
      }
    });
  }

  private getCasaSalud(done?: () => void): void {
    this._casaSaludService.getCasaSaludPrincipal().subscribe({
      next: (resp: any) => {
        if (resp?.status === 'ok') {
          this.casaSaludBody = resp.rows;
          if (this.triageBody && !this.triageBody.casalud_id_fk) {
            this.triageBody.casalud_id_fk = this.casaSaludBody?.casalud_id_pk ?? 0;
          }
        }
      },
      error: (err) => {
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Casas de Salud - ${err?.message ?? err}`,
          confirmButtonText: 'Aceptar',
        });
      },
      complete: () => done?.(),
    });
  }

  private getTipoSeguro(done?: () => void): void {
    this._cabeceraDetalleService.getAllCabecerasDetalle2('TIP_SEG', true).subscribe({
      next: (resp: any) => {
        if (resp?.status === 'ok') {
          this.tipoSeguroList = resp.rows ?? [];
        } else {
          this.tipoSeguroList = [];
        }
      },
      error: (err) => {
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Lista Tipo Seguro - ${err?.message ?? err}`,
          confirmButtonText: 'Aceptar',
        });
      },
      complete: () => done?.(),
    });
  }

  // -----------------------------
  // Paciente (búsqueda por identificación vía HCU)
  // -----------------------------
  consultarPaciente(identificacion: any): void {
    const id = (identificacion ?? '').toString().trim();
    if (!id) return;

    this.cargarHistoriaClinicaPorIdentificacion(id, {
      actualizarFkPersona: true,
      limpiarSiNoExiste: true,
    });
  }

  private cargarHistoriaClinicaPorIdentificacion(
    identificacion: string,
    opts?: { actualizarFkPersona?: boolean; limpiarSiNoExiste?: boolean }
  ): void {
    const id = (identificacion ?? '').toString().trim();
    if (!id) return;

    const actualizarFkPersona = opts?.actualizarFkPersona ?? false;
    const limpiarSiNoExiste = opts?.limpiarSiNoExiste ?? false;

    this.loadingPaciente = true;
    this.updateLoading();
    this._historiaClinicaService.getAllHistoriaClinicaId(id as any, 2).subscribe({
      next: (resp: any) => {
        this.loadingPaciente = false;
        this.updateLoading();

        if (!resp?.data || Object.keys(resp.data).length === 0) {
          if (limpiarSiNoExiste) {
            Swal.fire({
              title: 'No existe',
              text: `No se encontró una Historia Clínica con identificación ${id}. Por favor crearla para continuar.`,
              icon: 'warning',
              confirmButtonText: 'Aceptar',
            });
            this.hcu = null;
            this.triageBody.fk_persona = 0;
          }
          return;
        }

        this.hcu = resp.data;
        this.pacienteInfo = null;

        // fk_persona del triage corresponde a persona.pk_persona (en HCU viene como fk_persona)
        if (actualizarFkPersona) {
          this.triageBody.fk_persona = Number(this.hcu?.pk_hcu ?? 0);
        }
        this.triageBody.fk_usuario =
          this._loginService.getUserLocalStorage()?.pk_usuario ?? this.triageBody.fk_usuario;

        // Asegurar casa de salud principal si ya se cargó
        if (this.casaSaludBody?.casalud_id_pk) {
          this.triageBody.casalud_id_fk = this.casaSaludBody.casalud_id_pk;
        }
      },
      error: (err) => {
        this.loadingPaciente = false;
        this.updateLoading();
        toastr?.error?.('Error', `${err} - Datos no cargados del HCU ${id}`);
      },
    });
  }

  // -----------------------------
  // Cargar/editar
  // -----------------------------
  private cargarTriage(id_triage: number): void {
    this.loadingRecord = true;
    this.updateLoading();

    this._triageService.getTriageId(id_triage, 1).subscribe({
      next: (resp: any) => {
        const data = resp?.data ?? resp ?? {};
        this.triageBody = this.mapApiToEmergenciaTriage(data);

        // Normalizar hora a HH:mm para input type="time"
        this.triageBody.hora_triage = this.normalizeTimeToHHmm(this.triageBody.hora_triage);

        // Mantener auditoría recibida (si viene)
        this.triageBody.fk_usuario =
          this._loginService.getUserLocalStorage()?.pk_usuario ?? this.triageBody.fk_usuario;

        // Fallback de pacienteInfo desde payload/joins
        this.pacienteInfo = this.extractPacienteInfo(data, this.triageBody);
        this.identificacion =
          this.pacienteInfo?.numidentificacion_persona ??
          this.triageBody?.fecha_creacion?.numidentificacion_persona ??
          '';

        // Cargar Score Mama si hay datos
        this.loadCalculosSignosVitales();

        // En edición: cargar automáticamente Historia Clínica para mostrar info completa del paciente
        // sin borrar el registro si no se encuentra.
        if (this.identificacion) {
          this.cargarHistoriaClinicaPorIdentificacion(this.identificacion, {
            actualizarFkPersona: false, // ya viene del registro de triage
            limpiarSiNoExiste: false,
          });
        }

        this.loadingRecord = false;
        this.updateLoading();
      },
      error: (err) => {
        this.loadingRecord = false;
        this.updateLoading();
        toastr?.error?.('Error', `${err} - Datos no cargados del Triage ${id_triage}`);
      },
    });
  }

  private updateLoading(): void {
    this.loading = this.loadingBase || this.loadingRecord || this.loadingPaciente;
  }

  private parseJsonMaybe(v: any): any {
    if (v === null || v === undefined) return v;
    if (typeof v === 'object') return v;
    if (typeof v !== 'string') return v;
    const s = v.trim();
    if (!s) return v;
    if (!(s.startsWith('{') || s.startsWith('['))) return v;
    try {
      return JSON.parse(s);
    } catch {
      return v;
    }
  }

  private mapApiToEmergenciaTriage(item: any): EmergenciaTriage {
    const signos = this.parseJsonMaybe(
      item?.signos_vitales_triage ?? item?.triage_signos_vitales_triage ?? null
    );
    const atencion = this.parseJsonMaybe(
      item?.atencion_triage ?? item?.triage_atencion_triage ?? null
    );
    const aux = this.parseJsonMaybe(
      item?.datos_auxiliares_triage ?? item?.triage_datos_auxiliares_triage ?? null
    );

    // Normalizar/asegurar estructura de signos vitales (para que el cálculo Score Mamá funcione)
    const baseSignos = this.triageBody?.signos_vitales_triage ?? {
      sin_constantes_vitales: false,
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
      oxigeno_terapia: null,
      gasto_urinario: null,
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
    } as any;

    const mergedSignos: any = { ...baseSignos, ...(signos ?? {}) };
    // sin_constantes_vitales puede venir como boolean o como 'SI'/'NO'
    if (mergedSignos.sin_constantes_vitales === 'SI') mergedSignos.sin_constantes_vitales = true;
    else if (mergedSignos.sin_constantes_vitales === 'NO')
      mergedSignos.sin_constantes_vitales = false;
    else mergedSignos.sin_constantes_vitales = !!mergedSignos.sin_constantes_vitales;

    // Asegurar llaves nuevas
    if (mergedSignos.oxigeno_terapia === undefined) mergedSignos.oxigeno_terapia = null;
    if (mergedSignos.gasto_urinario === undefined) mergedSignos.gasto_urinario = null;

    return {
      pk_triage: item?.pk_triage ?? item?.triage_pk_triage ?? 0,
      fk_persona: item?.fk_persona ?? item?.triage_fk_persona ?? 0,
      casalud_id_fk: item?.casalud_id_fk ?? item?.triage_casalud_id_fk ?? 0,
      tip_seg_fk: item?.tip_seg_fk ?? item?.triage_tip_seg_fk ?? 0,
      fecha_triage: item?.fecha_triage ?? item?.triage_fecha_triage ?? '',
      hora_triage: item?.hora_triage ?? item?.triage_hora_triage ?? '',
      fk_usuario: item?.fk_usuario ?? item?.triage_fk_usuario ?? 0,
      signos_vitales_triage: mergedSignos,
      atencion_triage: atencion ?? this.triageBody?.atencion_triage ?? {},
      clasificacion_triage:
        (item?.clasificacion_triage ?? item?.triage_clasificacion_triage ?? '').toString(),
      observacion_triage:
        item?.observacion_triage ?? item?.triage_observacion_triage ?? null,
      datos_auxiliares_triage: aux ?? {},
      estado_triage: item?.estado_triage ?? item?.triage_estado_triage ?? false,
      fecha_creacion: item?.fecha_creacion ?? item?.triage_fecha_creacion ?? null,
      fecha_modificacion:
        item?.fecha_modificacion ?? item?.triage_fecha_modificacion ?? null,
    };
  }

  private extractPacienteInfo(item: any, triage: EmergenciaTriage): any {
    // 1) Si viene en fecha_creacion (como en ejemplo del usuario), ya tiene apellidos/nombres
    const fc = triage?.fecha_creacion;
    if (fc && typeof fc === 'object' && (fc?.numidentificacion_persona || fc?.apellidopat_persona)) {
      return fc;
    }

    // 2) Si viene con campos paciente_... (joins de lista)
    const hasPacienteJoin =
      item?.paciente_numidentificacion ||
      item?.paciente_nombre_primario ||
      item?.paciente_apellido1;

    if (hasPacienteJoin) {
      return {
        numidentificacion_persona: item?.paciente_numidentificacion ?? null,
        apellidopat_persona: item?.paciente_apellido1 ?? null,
        apellidomat_persona: item?.paciente_apellido2 ?? null,
        nombre_primario_persona: item?.paciente_nombre_primario ?? null,
        nombre_secundario_persona: item?.paciente_nombre_secundario ?? item?.pacienteo_nombre_secundario ?? null,
        sexo: item?.paciente_sexo ?? item?.sexo ?? null,
        edad: item?.paciente_edad ?? item?.edad ?? null,
      };
    }

    return null;
  }

  // -----------------------------
  // Validación / Guardado
  // -----------------------------
  validarGuardar(): boolean {
    if (!this.triageBody) return false;

    const okPersona = !!this.triageBody.fk_persona;
    const okCasa = !!this.triageBody.casalud_id_fk;
    const okSeguro = !!this.triageBody.tip_seg_fk;
    const okClasif = (this.triageBody.clasificacion_triage ?? '').toString().trim().length > 0;

    return okPersona && okCasa && okSeguro && okClasif;
  }

  private sanitizeStrings(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    Object.keys(obj).forEach((k) => {
      const v = obj[k];
      if (typeof v === 'string') obj[k] = v.replace(/'/g, '"');
      else if (v && typeof v === 'object') this.sanitizeStrings(v);
    });
    return obj;
  }

  guardarTriage(): void {
    if (!this.validarGuardar()) return;

    // Normalizaciones mínimas antes de guardar
    this.triageBody.fk_usuario =
      this._loginService.getUserLocalStorage()?.pk_usuario ?? this.triageBody.fk_usuario;
    this.triageBody.fecha_triage =
      this.triageBody.fecha_triage || this.formatDateYYYYMMDD(new Date());
    this.triageBody.hora_triage = this.normalizeTimeToSeconds(this.triageBody.hora_triage);

    // Uppercase clasificacion
    this.triageBody.clasificacion_triage = (this.triageBody.clasificacion_triage ?? '')
      .toString()
      .toUpperCase()
      .trim();

    // Sanitizar strings (evita comillas simples)
    this.triageBody = this.sanitizeStrings(this.triageBody);

    Swal.fire({
      title: '¿Está seguro?',
      text: `Desea guardar la información del Triage`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this._triageService.guardarTriage(this.triageBody, this.opcion).subscribe({
        next: (resp: any) => {
          if (resp?.status === 'ok') {
            this.opcion = 'U';
            this.triageBody = this.mapApiToEmergenciaTriage(resp?.data ?? resp);
            this._router.navigate(['/triage', this.triageBody.pk_triage]);
            toastr?.success?.('Éxito', `Triage guardado correctamente!`);
          } else {
            toastr?.error?.('Error', `Problema al guardar Triage`);
          }
        },
        error: (err) => {
          toastr?.error?.('Error', `${err} - Problema al guardar Triage`);
        },
      });
    });
  }

  cancelar(): void {
    this._router.navigate(['/triage']);
  }

  // -----------------------------
  // Score MAMÁ (adaptado a triageBody.signos_vitales_triage)
  // -----------------------------
  setSinConstantesVitales(checked: boolean): void {
    const g = this.triageBody?.signos_vitales_triage;
    if (!g) return;

    g.sin_constantes_vitales = checked;

    if (!checked) return;

    g.presion_arterial_mmhg = null;
    g.presion_arterial_sistolica = null;
    g.presion_arterial_diastolica = null;
    g.pulso_por_min = null;
    g.frecuencia_respiratoria_por_min = null;
    g.pulsioximetria_porcentaje = null;
    g.temperatura = null;
    g.estado_conciencia = null;
    g.proteinuria = null; // legacy/back
    g.oxigeno_terapia = null;
    g.gasto_urinario = null;
    g.score_mama = null;

    g.peso_kg = null;
    g.talla_cm = null;
    g.glicemia_capilar_mg_dl = null;
    g.glasgow = null;
    g.ocular = null;
    g.verbal = null;
    g.motora = null;
    g.perimetro_cefalico = null;
    g.eva = null;
    g.pupila_izq = null;
    g.pupila_der = null;
    g.llenado_capilar = null;

    this.sm_frecuencia_cardiaca = null;
    this.sm_sistolica = null;
    this.sm_diastolica = null;
    this.sm_frecuencia_respiratoria = null;
    this.sm_temperatura = null;
    this.sm_saturacion = null;
    this.sm_estado_conciencia = null;
    this.sm_oxigeno = null;
    this.sm_gastoUrinario = null;
    this.sm_proteinuria = null;
    this.leyenda_scoremama = '';
  }

  limpiarSignosVitalesSegunGenero(): void {
    const g = this.triageBody?.signos_vitales_triage;
    if (!g) return;

    g.proteinuria = null; // legacy/back
    g.oxigeno_terapia = null;
    g.gasto_urinario = null;
    g.score_mama = null;

    this.sm_frecuencia_cardiaca = null;
    this.sm_sistolica = null;
    this.sm_diastolica = null;
    this.sm_frecuencia_respiratoria = null;
    this.sm_temperatura = null;
    this.sm_saturacion = null;
    this.sm_estado_conciencia = null;
    this.sm_oxigeno = null;
    this.sm_gastoUrinario = null;
    this.sm_proteinuria = null;
    this.leyenda_scoremama = '';
  }

  accionCalculoScoreMama(): void {
    const g = this.triageBody?.signos_vitales_triage ?? {};
    if (
      g.pulso_por_min != null &&
      g.presion_arterial_sistolica != null &&
      g.presion_arterial_diastolica != null &&
      g.frecuencia_respiratoria_por_min != null &&
      g.temperatura != null &&
      g.pulsioximetria_porcentaje != null &&
      g.estado_conciencia != null &&
      g.oxigeno_terapia != null &&
      g.gasto_urinario != null
      
    ) {
      this.loadCalculosSignosVitales();
    }
  }

  loadCalculosSignosVitales(): void {
    const g = this.triageBody?.signos_vitales_triage ?? {};
    this.variablesScoreMama(1, g.pulso_por_min);
    this.variablesScoreMama(2, g.presion_arterial_sistolica);
    this.variablesScoreMama(3, g.presion_arterial_diastolica);
    this.variablesScoreMama(4, g.frecuencia_respiratoria_por_min);
    this.variablesScoreMama(5, g.temperatura);
    this.variablesScoreMama(6, g.pulsioximetria_porcentaje);
    this.variablesScoreMama(7, g.estado_conciencia);
    this.variablesScoreMama(8, g.oxigeno_terapia);
    this.variablesScoreMama(9, g.gasto_urinario);
  }

  variablesScoreMama(opcion: number, valor_param: any): void {
    let valor: number = 0;

    if (opcion === 1) {
      valor = parseFloat(valor_param);
      this.sm_frecuencia_cardiaca =
        valor != null && Number.isFinite(valor)
          ? this._scoreMamaService.calc_frecuencia_cardiaca(valor)
          : null;
    } else if (opcion === 2) {
      valor = parseFloat(valor_param);
      this.sm_sistolica =
        valor != null && Number.isFinite(valor)
          ? this._scoreMamaService.calc_sistolica(valor)
          : null;
    } else if (opcion === 3) {
      valor = parseFloat(valor_param);
      this.sm_diastolica =
        valor != null && Number.isFinite(valor)
          ? this._scoreMamaService.calc_diastolica(valor)
          : null;
    } else if (opcion === 4) {
      valor = parseFloat(valor_param);
      this.sm_frecuencia_respiratoria =
        valor != null && Number.isFinite(valor)
          ? this._scoreMamaService.calc_frecuencia_respiratoria(valor)
          : null;
    } else if (opcion === 5) {
      valor = parseFloat(valor_param);
      this.sm_temperatura =
        valor != null && Number.isFinite(valor)
          ? this._scoreMamaService.calc_temperatura(valor)
          : null;
    } else if (opcion === 6) {
      valor = parseFloat(valor_param);
      this.sm_saturacion =
        valor != null && Number.isFinite(valor)
          ? this._scoreMamaService.calc_saturacion(valor)
          : null;
    } else if (opcion === 7) {
      const valorString: string = String(valor_param ?? '');
      this.sm_estado_conciencia =
        valorString ? this._scoreMamaService.calc_estado_conciencia(valorString) : null;
    } else if (opcion === 8) {
      const valorString: string = String(valor_param ?? '');
      this.sm_oxigeno =
        valorString ? this._scoreMamaService.calc_oxigeno_terapia(valorString) : null;
    }else if (opcion === 9) {
      const valorString: string = String(valor_param ?? '');
      this.sm_gastoUrinario =
        valorString ? this._scoreMamaService.calc_gastoUrinario(valorString) : null;
    }

    this.calculoScoreMama();
  }

  private calculoScoreMama(): void {
    // Recalcula SIEMPRE desde los valores actuales del formulario
    const g = this.triageBody?.signos_vitales_triage;
    if (!g) return;

    const num = (v: any): number | null => {
      if (v === null || v === undefined || v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    const str = (v: any): string | null =>
      v === null || v === undefined || v === '' ? null : String(v);

    const fc = num(g.pulso_por_min);
    const sis = num(g.presion_arterial_sistolica);
    const dia = num(g.presion_arterial_diastolica);
    const fr = num(g.frecuencia_respiratoria_por_min);
    const temp = num(g.temperatura);
    const sat = num(g.pulsioximetria_porcentaje);
    const conc = str(g.estado_conciencia);
    const ox = str(g.oxigeno_terapia);
    const gu = str(g.gasto_urinario);

    this.sm_frecuencia_cardiaca =
      fc === null ? null : this._scoreMamaService.calc_frecuencia_cardiaca(fc);
    this.sm_sistolica = sis === null ? null : this._scoreMamaService.calc_sistolica(sis);
    this.sm_diastolica = dia === null ? null : this._scoreMamaService.calc_diastolica(dia);
    this.sm_frecuencia_respiratoria =
      fr === null ? null : this._scoreMamaService.calc_frecuencia_respiratoria(fr);
    this.sm_temperatura = temp === null ? null : this._scoreMamaService.calc_temperatura(temp);
    this.sm_saturacion = sat === null ? null : this._scoreMamaService.calc_saturacion(sat);
    this.sm_estado_conciencia =
      conc === null ? null : this._scoreMamaService.calc_estado_conciencia(conc);
    this.sm_oxigeno = ox === null ? null : this._scoreMamaService.calc_oxigeno_terapia(ox);
    this.sm_gastoUrinario = gu === null ? null : this._scoreMamaService.calc_gastoUrinario(gu);

    if (
      this.sm_frecuencia_cardiaca != null &&
      this.sm_sistolica != null &&
      this.sm_diastolica != null &&
      this.sm_frecuencia_respiratoria != null &&
      this.sm_temperatura != null &&
      this.sm_saturacion != null &&
      this.sm_estado_conciencia != null &&
      this.sm_oxigeno != null &&
      this.sm_gastoUrinario != null
    ) {
      g.score_mama =
        this.sm_frecuencia_cardiaca +
        this.sm_sistolica +
        this.sm_diastolica +
        this.sm_frecuencia_respiratoria +
        this.sm_temperatura +
        this.sm_saturacion +
        this.sm_estado_conciencia +
        this.sm_oxigeno +
        this.sm_gastoUrinario;
      this.colocarLeyenda(g.score_mama);
    } else {
      g.score_mama = null;
      this.leyenda_scoremama = '';
    }
  }

  private colocarLeyenda(score: number | null): void {
    if (score == null) {
      this.leyenda_scoremama = '';
      return;
    }
    if (score === 0) {
      this.leyenda_scoremama =
        'Evaluar y analizar factores de riesgo, bienestar maternofetal y signos de alarma!!';
    } else if (score === 1) {
      this.leyenda_scoremama = 'Aplique Score MAMÁ c/4 horas y registre.';
    } else if (score >= 2 && score <= 4) {
      this.leyenda_scoremama = 'Aplique el Score MAMÁ c/ hora y registre';
    } else if (score >= 5) {
      this.leyenda_scoremama = 'Aplique Score MAMÁ c/ 30 minutos y registre.';
    }
  }

  // -----------------------------
  // Helpers UI
  // -----------------------------
  getManchesterLabel(code: any): string {
    const c = (code ?? '').toString().trim().toUpperCase();
    switch (c) {
      case 'AZ':
        return 'AZ';
      case 'RO':
        return 'RO';
      case 'AM':
        return 'AM';
      case 'NA':
        return 'NA';
      case 'VE':
        return 'VE';
      default:
        return '---';
    }
  }

  getManchesterClass(code: any): string {
    const c = (code ?? '').toString().trim().toUpperCase();
    switch (c) {
      case 'AZ':
        return 'manchester-az';
      case 'RO':
        return 'manchester-ro';
      case 'AM':
        return 'manchester-am';
      case 'NA':
        return 'manchester-na';
      case 'VE':
        return 'manchester-ve';
      default:
        return 'manchester-nd';
    }
  }

  private formatDateYYYYMMDD(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private formatTimeHHmmss(d: Date): string {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  private formatTimeHHmm(d: Date): string {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  private normalizeTimeToSeconds(time: string): string {
    const t = (time ?? '').toString().trim();
    if (!t) return this.formatTimeHHmmss(new Date());
    if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t;
    if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`;
    return t;
  }

  private normalizeTimeToHHmm(time: string): string {
    const t = (time ?? '').toString().trim();
    if (!t) return this.formatTimeHHmm(new Date());
    if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t.slice(0, 5);
    if (/^\d{2}:\d{2}$/.test(t)) return t;
    return t;
  }
}
