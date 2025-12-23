import { CommonModule, Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';

import { MenuHospitalizacionComponent } from '../../../../componentes_reutilizables/menu_izq/menu.component';
import { SkeletonCrudComponent } from '../../../../componentes_reutilizables/skeleton/skeleton-crud.component';
import { AnamnesisService } from '../../../../services/hospitalizacion/anamnesis/anamnesis.service';
import { CasasSaludService } from '../../../../services/casas_salud/casas_salud.service';
import { LoginService } from '../../../../services/login.service';
import { CieService } from '../../../../services/cie/cie.service';
import { AnamnesisDiagnostico } from './anamnesis.interface';

declare var toastr: any;
declare var $: any;

// Tipo para el body estructurado
type AnamnesisBody = {
  _a: {
    pk_anam: number;
    casalud_id_fk: number;
    fk_hcu: number;
    fecha_inicio: string | null;
    hora_inicio: string | null;
    estado_anam: boolean;
  };
  _b: {
    observacion_b: string | null;
  };
  _c: {
    alergia_medicamentos: boolean;
    otras_alergias: boolean;
    vacunas: boolean;
    patologias_clinicas: boolean;
    medicacion_habitual: boolean;
    quirurgicos: boolean;
    habitos: boolean;
    condicion_socio_economica: boolean;
    discapacidad: boolean;
    religion: boolean;
    tipificacion_sanguinea: boolean;
    gineco_obstetricos: {
      edad_menarquia: number | null;
      edad_menopausia: number | null;
      ciclos: string | null;
      edad_inicio: number | null;
      numero_gestas: number | null;
      numero_partos: number | null;
      numero_abortos: number | null;
      numero_cesareas: number | null;
      numero_hijos_vivos: number | null;
      fecha_ultima_menstruacion: string | null;
      fecha_ultimo_parto: string | null;
      fecha_ultima_citologia_cervical: string | null;
      fecha_ultima_colposcopia: string | null;
      fecha_ultima_mamografia: string | null;
      metodo_planificacion_familiar: string | null;
      terapia_hormonal: string | null;
      fecha_ultimo_eco_prostatico: string | null;
      fecha_ultimo_antigeno_prostatico: string | null;
      gineco_observacion: string | null;
    };
  };
  _d: {
    cardiopatia: boolean;
    hipertension: boolean;
    enfermedadCerebrovascular: boolean;
    endocrinoMetabolico: boolean;
    cancer: boolean;
    tuberculosis: boolean;
    enfermedadMental: boolean;
    enfermedadInfecciosa: boolean;
    malformacion: boolean;
    otro: boolean;
    observacion_d: string | null;
  };
  _e: {
    observacion_e: string | null;
  };
  _f: {
    piel_anexos: boolean;
    organos_sentidos: boolean;
    respiratorio: boolean;
    cardio: boolean;
    digestivo: boolean;
    genito: boolean;
    musculo: boolean;
    endocrino: boolean;
    hemo: boolean;
    nervioso: boolean;
    observacion_f: string | null;
  };
  _g: {
    temperatura_c: number | null;
    presion_arterial_mmHg: string | null;
    pulso_por_minuto: number | null;
    frecuencia_respiratoria_por_minuto: number | null;
    peso_kg: number | null;
    talla_cm: number | null;
    imc_kg_m2: number | null;
    perimetro_cefalico_cm: number | null;
    pulsioximetria_porcentaje: number | null;
    score_mama: number | null;
    otros: string | null;
  };
  _h: {
    piel_faneras: boolean;
    cabeza: boolean;
    ojos: boolean;
    oidos: boolean;
    nariz: boolean;
    boca: boolean;
    orofaringe: boolean;
    cuello: boolean;
    axilas_mamas: boolean;
    torax: boolean;
    abdomen: boolean;
    columna_vertebral: boolean;
    ingle_perine: boolean;
    miembros_superiores: boolean;
    miembros_inferiores: boolean;
    organos_sentidos: boolean;
    respiratorio: boolean;
    cardio_vascular: boolean;
    digestivo: boolean;
    genital: boolean;
    urinario: boolean;
    musculo_esqueletico: boolean;
    endocrino: boolean;
    hemo_linfatico: boolean;
    neurologico: boolean;
    observacion_h: string | null;
  };
  _i: {
    observacion_i: string | null;
  };
  _k: {
    observacion_k: string | null;
  };
  _l: {
    medico_usu_id_fk: number | null;
    fecha_fin: string | null;
    hora_fin: string | null;
  };
  auditoria: {
    fecha_creacion_anam: any | null;
    fecha_modificacion_anam: any | null;
  };
  medico_usu_id_fk: number | null;
};

@Component({
  selector: 'app-form-anamnesis',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MenuHospitalizacionComponent,
    NgSelectModule,
    SkeletonCrudComponent,
  ],
  templateUrl: './form-anamnesis.component.html',
  styles: `
    .nav-tabs .nav-link.active {
      background-color: #007bff !important;
      color: #fff !important;
      border-color: #007bff !important;
    }
    .nav-tabs .nav-link:not(.active) {
      color: #000;
    }
    .dropdown-item.active {
      background-color: #007bff !important;
      color: #fff !important;
    }
  `,
})
export class FormAnamnesisComponent {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _anamnesisService = inject(AnamnesisService);
  private _casaSaludService = inject(CasasSaludService);
  private _loginService = inject(LoginService);
  private _cieService = inject(CieService);
  private location = inject(Location);

  // Variables principales
  tabActivo: 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' = 'B';
  opcion: 'I' | 'U' = 'I';
  accionVer = false;
  idNum = 0;
  casaSaludBody: any = {};
  loading = false;
  cabecera: any;
  anamnesisBody!: AnamnesisBody;

  // Variables de Diagnósticos
  listDiagnosticos: any[] = [];
  diagnosticoBody: AnamnesisDiagnostico = {
    pk_anamdiag: 0,
    fk_anam_hosp: 0,
    fk_anam_ce: null,
    fk_cie: 0,
    fecha_creacion_anamdiag: null,
    fecha_modificacion_anamdiag: null,
    tipo_anamdiag: '',
  };
  diagnosticoTipos = [
    { value: 'presuntivos', label: 'Presuntivo' },
    { value: 'definitivos', label: 'Definitivo' },
  ];
  listCie10: any[] = [];
  idCie: any;
  typeahead = new Subject<string>();
  isLoading = false;

  constructor() {
    this.getCasaSalud();
    this.inicializarAnamnesis();
  }

  ngOnInit(): void {
    this._route.paramMap.subscribe((pm) => {
      this.idNum = Number(pm.get('id') ?? 0);
      const accionParam = (pm.get('accion') ?? '').toLowerCase();
      this.accionVer =
        accionParam === 'true' || accionParam === '1' || accionParam === 'ver';
      const cabParam = (pm.get('cab') ?? '').toLowerCase();
      this.cabecera =
        cabParam === 'true' || cabParam === '1' || cabParam === 'ver';

      if (this.idNum !== 0 && !isNaN(this.idNum)) {
        this.opcion = 'U';
        this.loading = true;
        this.editarAnamnesis(this.idNum);
        this.getListaDiagnosticos();
      } else {
        this.opcion = 'I';
        this.loading = false;
        this.inicializarAnamnesis();
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

  inicializarAnamnesis(): void {
    this.anamnesisBody = {
      _a: {
        pk_anam: 0,
        casalud_id_fk: this.casaSaludBody?.casalud_id_pk ?? 0,
        fk_hcu: this._loginService.getHcuLocalStorage()?.fk_hcu ?? 0,
        fecha_inicio: null,
        hora_inicio: null,
        estado_anam: false,
      },
      _b: {
        observacion_b: null,
      },
      _c: {
        alergia_medicamentos: false,
        otras_alergias: false,
        vacunas: false,
        patologias_clinicas: false,
        medicacion_habitual: false,
        quirurgicos: false,
        habitos: false,
        condicion_socio_economica: false,
        discapacidad: false,
        religion: false,
        tipificacion_sanguinea: false,
        gineco_obstetricos: {
          edad_menarquia: null,
          edad_menopausia: null,
          ciclos: null,
          edad_inicio: null,
          numero_gestas: null,
          numero_partos: null,
          numero_abortos: null,
          numero_cesareas: null,
          numero_hijos_vivos: null,
          fecha_ultima_menstruacion: null,
          fecha_ultimo_parto: null,
          fecha_ultima_citologia_cervical: null,
          fecha_ultima_colposcopia: null,
          fecha_ultima_mamografia: null,
          metodo_planificacion_familiar: null,
          terapia_hormonal: null,
          fecha_ultimo_eco_prostatico: null,
          fecha_ultimo_antigeno_prostatico: null,
          gineco_observacion: null,
        },
      },
      _d: {
        cardiopatia: false,
        hipertension: false,
        enfermedadCerebrovascular: false,
        endocrinoMetabolico: false,
        cancer: false,
        tuberculosis: false,
        enfermedadMental: false,
        enfermedadInfecciosa: false,
        malformacion: false,
        otro: false,
        observacion_d: null,
      },
      _e: {
        observacion_e: null,
      },
      _f: {
        piel_anexos: false,
        organos_sentidos: false,
        respiratorio: false,
        cardio: false,
        digestivo: false,
        genito: false,
        musculo: false,
        endocrino: false,
        hemo: false,
        nervioso: false,
        observacion_f: null,
      },
      _g: {
        temperatura_c: null,
        presion_arterial_mmHg: null,
        pulso_por_minuto: null,
        frecuencia_respiratoria_por_minuto: null,
        peso_kg: null,
        talla_cm: null,
        imc_kg_m2: null,
        perimetro_cefalico_cm: null,
        pulsioximetria_porcentaje: null,
        score_mama: null,
        otros: null,
      },
      _h: {
        piel_faneras: false,
        cabeza: false,
        ojos: false,
        oidos: false,
        nariz: false,
        boca: false,
        orofaringe: false,
        cuello: false,
        axilas_mamas: false,
        torax: false,
        abdomen: false,
        columna_vertebral: false,
        ingle_perine: false,
        miembros_superiores: false,
        miembros_inferiores: false,
        organos_sentidos: false,
        respiratorio: false,
        cardio_vascular: false,
        digestivo: false,
        genital: false,
        urinario: false,
        musculo_esqueletico: false,
        endocrino: false,
        hemo_linfatico: false,
        neurologico: false,
        observacion_h: null,
      },
      _i: {
        observacion_i: null,
      },
      _k: {
        observacion_k: null,
      },
      _l: {
        medico_usu_id_fk:
          this._loginService.getUserLocalStorage()?.pk_usuario ?? null,
        fecha_fin: null,
        hora_fin: null,
      },
      auditoria: {
        fecha_creacion_anam: null,
        fecha_modificacion_anam: null,
      },
      medico_usu_id_fk:
        this._loginService.getUserLocalStorage()?.pk_usuario ?? null,
    };
  }

  editarAnamnesis(pk_anam: number): void {
    this._anamnesisService.getAnamnesisId(pk_anam, 1).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.parametrizarAnamnesis(resp.data);
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        toastr.error(
          'Error',
          `${err} - Datos no cargados de Anamnesis ${pk_anam}`
        );
      },
    });
  }

  parametrizarAnamnesis(src: any): void {
    const antecPersonales = src?.antec_personales_anam ?? {};
    const ginecoObs = antecPersonales?.gineco_obstetricos ?? {};
    const antecFamiliares = src?.antec_familiares_anam ?? {};
    const revisionOrgSis = src?.revision_orgsis_anam ?? {};
    const signosVitales = src?.signos_vitales_anam ?? {};
    const examenFisico = src?.examen_fisico_anam ?? {};

    this.anamnesisBody = {
      _a: {
        pk_anam: src?.pk_anam ?? 0,
        casalud_id_fk:
          src?.casalud_id_fk ?? this.casaSaludBody?.casalud_id_pk ?? 0,
        fk_hcu:
          src?.fk_hcu ?? this._loginService.getHcuLocalStorage()?.fk_hcu ?? 0,
        fecha_inicio: src?.fecha_inicio ?? null,
        hora_inicio: src?.hora_inicio ?? null,
        estado_anam: src?.estado_anam ?? false,
      },
      _b: {
        observacion_b: src?.motivo_consulta_anam ?? null,
      },
      _c: {
        alergia_medicamentos: antecPersonales?.alergia_medicamentos ?? false,
        otras_alergias: antecPersonales?.otras_alergias ?? false,
        vacunas: antecPersonales?.vacunas ?? false,
        patologias_clinicas: antecPersonales?.patologias_clinicas ?? false,
        medicacion_habitual: antecPersonales?.medicacion_habitual ?? false,
        quirurgicos: antecPersonales?.quirurgicos ?? false,
        habitos: antecPersonales?.habitos ?? false,
        condicion_socio_economica:
          antecPersonales?.condicion_socio_economica ?? false,
        discapacidad: antecPersonales?.discapacidad ?? false,
        religion: antecPersonales?.religion ?? false,
        tipificacion_sanguinea:
          antecPersonales?.tipificacion_sanguinea ?? false,
        gineco_obstetricos: {
          edad_menarquia: ginecoObs?.edad_menarquia ?? null,
          edad_menopausia: ginecoObs?.edad_menopausia ?? null,
          ciclos: ginecoObs?.ciclos ?? null,
          edad_inicio: ginecoObs?.edad_inicio ?? null,
          numero_gestas: ginecoObs?.numero_gestas ?? null,
          numero_partos: ginecoObs?.numero_partos ?? null,
          numero_abortos: ginecoObs?.numero_abortos ?? null,
          numero_cesareas: ginecoObs?.numero_cesareas ?? null,
          numero_hijos_vivos: ginecoObs?.numero_hijos_vivos ?? null,
          fecha_ultima_menstruacion:
            ginecoObs?.fecha_ultima_menstruacion ?? null,
          fecha_ultimo_parto: ginecoObs?.fecha_ultimo_parto ?? null,
          fecha_ultima_citologia_cervical:
            ginecoObs?.fecha_ultima_citologia_cervical ?? null,
          fecha_ultima_colposcopia: ginecoObs?.fecha_ultima_colposcopia ?? null,
          fecha_ultima_mamografia: ginecoObs?.fecha_ultima_mamografia ?? null,
          metodo_planificacion_familiar:
            ginecoObs?.metodo_planificacion_familiar ?? null,
          terapia_hormonal: ginecoObs?.terapia_hormonal ?? null,
          fecha_ultimo_eco_prostatico:
            ginecoObs?.fecha_ultimo_eco_prostatico ?? null,
          fecha_ultimo_antigeno_prostatico:
            ginecoObs?.fecha_ultimo_antigeno_prostatico ?? null,
          gineco_observacion: ginecoObs?.gineco_observacion ?? null,
        },
      },
      _d: {
        cardiopatia: antecFamiliares?.cardiopatia ?? false,
        hipertension: antecFamiliares?.hipertension ?? false,
        enfermedadCerebrovascular:
          antecFamiliares?.enfermedadCerebrovascular ?? false,
        endocrinoMetabolico: antecFamiliares?.endocrinoMetabolico ?? false,
        cancer: antecFamiliares?.cancer ?? false,
        tuberculosis: antecFamiliares?.tuberculosis ?? false,
        enfermedadMental: antecFamiliares?.enfermedadMental ?? false,
        enfermedadInfecciosa: antecFamiliares?.enfermedadInfecciosa ?? false,
        malformacion: antecFamiliares?.malformacion ?? false,
        otro: antecFamiliares?.otro ?? false,
        observacion_d: antecFamiliares?.observacion_d ?? null,
      },
      _e: {
        observacion_e: src?.enfermedad_problema_anam ?? null,
      },
      _f: {
        piel_anexos: revisionOrgSis?.piel_anexos ?? false,
        organos_sentidos: revisionOrgSis?.organos_sentidos ?? false,
        respiratorio: revisionOrgSis?.respiratorio ?? false,
        cardio: revisionOrgSis?.cardio ?? false,
        digestivo: revisionOrgSis?.digestivo ?? false,
        genito: revisionOrgSis?.genito ?? false,
        musculo: revisionOrgSis?.musculo ?? false,
        endocrino: revisionOrgSis?.endocrino ?? false,
        hemo: revisionOrgSis?.hemo ?? false,
        nervioso: revisionOrgSis?.nervioso ?? false,
        observacion_f: revisionOrgSis?.observacion_f ?? null,
      },
      _g: {
        temperatura_c: signosVitales?.temperatura_c ?? null,
        presion_arterial_mmHg: signosVitales?.presion_arterial_mmHg ?? null,
        pulso_por_minuto: signosVitales?.pulso_por_minuto ?? null,
        frecuencia_respiratoria_por_minuto:
          signosVitales?.frecuencia_respiratoria_por_minuto ?? null,
        peso_kg: signosVitales?.peso_kg ?? null,
        talla_cm: signosVitales?.talla_cm ?? null,
        imc_kg_m2: signosVitales?.imc_kg_m2 ?? null,
        perimetro_cefalico_cm: signosVitales?.perimetro_cefalico_cm ?? null,
        pulsioximetria_porcentaje:
          signosVitales?.pulsioximetria_porcentaje ?? null,
        score_mama: signosVitales?.score_mama ?? null,
        otros: signosVitales?.otros ?? null,
      },
      _h: {
        piel_faneras: examenFisico?.piel_faneras ?? false,
        cabeza: examenFisico?.cabeza ?? false,
        ojos: examenFisico?.ojos ?? false,
        oidos: examenFisico?.oidos ?? false,
        nariz: examenFisico?.nariz ?? false,
        boca: examenFisico?.boca ?? false,
        orofaringe: examenFisico?.orofaringe ?? false,
        cuello: examenFisico?.cuello ?? false,
        axilas_mamas: examenFisico?.axilas_mamas ?? false,
        torax: examenFisico?.torax ?? false,
        abdomen: examenFisico?.abdomen ?? false,
        columna_vertebral: examenFisico?.columna_vertebral ?? false,
        ingle_perine: examenFisico?.ingle_perine ?? false,
        miembros_superiores: examenFisico?.miembros_superiores ?? false,
        miembros_inferiores: examenFisico?.miembros_inferiores ?? false,
        organos_sentidos: examenFisico?.organos_sentidos ?? false,
        respiratorio: examenFisico?.respiratorio ?? false,
        cardio_vascular: examenFisico?.cardio_vascular ?? false,
        digestivo: examenFisico?.digestivo ?? false,
        genital: examenFisico?.genital ?? false,
        urinario: examenFisico?.urinario ?? false,
        musculo_esqueletico: examenFisico?.musculo_esqueletico ?? false,
        endocrino: examenFisico?.endocrino ?? false,
        hemo_linfatico: examenFisico?.hemo_linfatico ?? false,
        neurologico: examenFisico?.neurologico ?? false,
        observacion_h: examenFisico?.observacion_h ?? null,
      },
      _i: {
        observacion_i: src?.analisis_anam ?? null,
      },
      _k: {
        observacion_k: src?.plan_tratamiento_anam ?? null,
      },
      _l: {
        medico_usu_id_fk:
          src?.medico_usu_id_fk ??
          this._loginService.getUserLocalStorage()?.pk_usuario ??
          null,
        fecha_fin: src?.fecha_fin ?? null,
        hora_fin: src?.hora_fin ?? null,
      },
      auditoria: {
        fecha_creacion_anam: src?.fecha_creacion_anam ?? null,
        fecha_modificacion_anam: src?.fecha_modificacion_anam ?? null,
      },
      medico_usu_id_fk:
        src?.medico_usu_id_fk ??
        this._loginService.getUserLocalStorage()?.pk_usuario ??
        null,
    };
  }

  guardarAnamnesis(): void {
    // Asignar datos del usuario y casa de salud
    this.anamnesisBody._a.casalud_id_fk =
      this.casaSaludBody?.casalud_id_pk ?? 0;
    if (this.anamnesisBody._a.fk_hcu === 0) {
      this.anamnesisBody._a.fk_hcu =
        this._loginService.getHcuLocalStorage()?.fk_hcu ?? 0;
    }
    /* this.anamnesisBody._a.fk_hcu =
      this._loginService.getHcuLocalStorage()?.fk_hcu ?? 0; */
    this.anamnesisBody._l.medico_usu_id_fk =
      this._loginService.getUserLocalStorage()?.pk_usuario ?? null;
    this.anamnesisBody.medico_usu_id_fk =
      this._loginService.getUserLocalStorage()?.pk_usuario ?? null;

    const payload = this.sanitizeStrings(
      JSON.parse(JSON.stringify(this.anamnesisBody))
    );

    Swal.fire({
      title: '¿Está seguro?',
      text: `Desea guardar la información de la anamnesis`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._anamnesisService
          .guardarAnamnesis(payload, this.opcion)
          .subscribe({
            next: (resp) => {
              if (resp.status === 'ok') {
                this.opcion = 'U';
                const pkAnam =
                  resp.data?._a?.pk_anam ?? resp.data?.pk_anam ?? 0;
                this.anamnesisBody._a.pk_anam = pkAnam;
                this.idNum = pkAnam;
                toastr.success('Éxito', `Anamnesis guardada correctamente`);
                // Evita doble entrada en history al pasar de "crear" a "editar"
                // para que "Cerrar" vuelva al componente anterior en 1 click.
                this._router.navigate(
                  ['/form_anamnesis', pkAnam, false, this.cabecera],
                  { replaceUrl: true }
                );
                this.getListaDiagnosticos();
              } else {
                toastr.error('Error', `Problema al registrar la anamnesis`);
              }
            },
            error: (err) => {
              toastr.error(
                'Error',
                `${err} - Problema al registrar la anamnesis`
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
      this._router.navigate(['/anamnesis']);
    }
  }

  validarGuardar(): boolean {
    return true; // Validación mínima
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

  // Calcular IMC automáticamente
  calcularIMC(): void {
    const peso = this.anamnesisBody._g.peso_kg;
    const talla = this.anamnesisBody._g.talla_cm;
    if (peso && talla && talla > 0) {
      const tallaM = talla / 100;
      this.anamnesisBody._g.imc_kg_m2 =
        Math.round((peso / (tallaM * tallaM)) * 100) / 100;
    }
  }

  // ---------------- Diagnósticos -----------------
  getListaDiagnosticos(): void {
    if (!this.idNum) {
      this.listDiagnosticos = [];
      return;
    }
    this._anamnesisService.getDiagnosticos(this.idNum).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listDiagnosticos = resp.rows ?? [];
        }
      },
      error: (err) => {
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Diagnósticos Anamnesis - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  nuevoDiagnostico(): void {
    this.diagnosticoBody = {
      pk_anamdiag: 0,
      fk_anam_hosp: this.anamnesisBody._a.pk_anam,
      fk_anam_ce: null,
      fk_cie: 0,
      fecha_creacion_anamdiag: null,
      fecha_modificacion_anamdiag: null,
      tipo_anamdiag: '',
    };
    this.idCie = null;
    this.listCie10 = [];
    $('#diagnosticoAnamnesisModal').modal('show');
  }

  validarGuardarDiagnostico(): boolean {
    return (
      !!this.diagnosticoBody.fk_anam_hosp &&
      !!this.diagnosticoBody.fk_cie &&
      (this.diagnosticoBody.tipo_anamdiag ?? '').trim() !== ''
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
        this._anamnesisService
          .guardarDiagnostico(this.diagnosticoBody, 'I')
          .subscribe({
            next: (resp) => {
              if (resp.status === 'ok') {
                this.getListaDiagnosticos();
                $('#diagnosticoAnamnesisModal').modal('hide');
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
        this._anamnesisService.guardarDiagnostico(diagnostico, 'D').subscribe({
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
