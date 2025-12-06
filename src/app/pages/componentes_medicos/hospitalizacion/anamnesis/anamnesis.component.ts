import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MenuHospitalizacionComponent } from '../../../../componentes_reutilizables/menu_izq/menu.component';
import { SkeletonTableComponent } from '../../../../componentes_reutilizables/skeleton/skeleton-table.component';
import { AnamnesisService } from '../../../../services/hospitalizacion/anamnesis/anamnesis.service';
import { CasasSaludService } from '../../../../services/casas_salud/casas_salud.service';
import { LoginService } from '../../../../services/login.service';
import { environment } from '../../../../../enviroments/enviroments';
import Swal from 'sweetalert2';
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-anamnesis',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MenuHospitalizacionComponent,
    SkeletonTableComponent,
  ],
  templateUrl: './anamnesis.component.html',
  styles: ``,
})
export class AnamnesisComponent {
  private _anamnesisService = inject(AnamnesisService);
  private _casaSaludService = inject(CasasSaludService);
  private _loginService = inject(LoginService);
  private _routerService = inject(Router);

  anamnesisList: any[] = [];
  casaSaludBody: any = {};
  hcu: any = {};
  desde: number = 0;
  intervalo = environment.filas;
  numeracion: number = 1;
  ant: boolean;
  sig: boolean;
  fecha_desde: Date = null;
  fecha_hasta: Date = null;
  loading: boolean = true;

  constructor() {
    this.getCasaSalud();
    this.hcu = this._loginService.getHcuLocalStorage();
    this.getAllAnamnesis();
  }

  parametrizarAnamnesis(data: any): any {
    // Extraer datos de antecedentes personales
    const antecPersonales = data?.antec_personales_anam ?? {};
    const ginecoObs = antecPersonales?.gineco_obstetricos ?? {};

    // Extraer datos de antecedentes familiares
    const antecFamiliares = data?.antec_familiares_anam ?? {};

    // Extraer datos de revisión de órganos y sistemas
    const revisionOrgSis = data?.revision_orgsis_anam ?? {};

    // Extraer datos de signos vitales
    const signosVitales = data?.signos_vitales_anam ?? {};

    // Extraer datos de examen físico
    const examenFisico = data?.examen_fisico_anam ?? {};

    return {
      _a: {
        pk_anam: data?.pk_anam ?? 0,
        casalud_id_fk: data?.casalud_id_fk ?? 0,
        fk_hcu: data?.fk_hcu ?? 0,
        fecha_inicio: data?.fecha_inicio ?? null,
        hora_inicio: data?.hora_inicio ?? null,
        estado_anam: data?.estado_anam ?? false,
      },
      _b: {
        observacion_b: data?.motivo_consulta_anam ?? null,
      },
      _c: {
        alergia_medicamentos: antecPersonales?.alergia_medicamentos ?? false,
        otras_alergias: antecPersonales?.otras_alergias ?? false,
        vacunas: antecPersonales?.vacunas ?? false,
        patologias_clinicas: antecPersonales?.patologias_clinicas ?? false,
        medicacion_habitual: antecPersonales?.medicacion_habitual ?? false,
        quirurgicos: antecPersonales?.quirurgicos ?? false,
        habitos: antecPersonales?.habitos ?? false,
        condicion_socio_economica: antecPersonales?.condicion_socio_economica ?? false,
        discapacidad: antecPersonales?.discapacidad ?? false,
        religion: antecPersonales?.religion ?? false,
        tipificacion_sanguinea: antecPersonales?.tipificacion_sanguinea ?? false,
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
          fecha_ultima_menstruacion: ginecoObs?.fecha_ultima_menstruacion ?? null,
          fecha_ultimo_parto: ginecoObs?.fecha_ultimo_parto ?? null,
          fecha_ultima_citologia_cervical: ginecoObs?.fecha_ultima_citologia_cervical ?? null,
          fecha_ultima_colposcopia: ginecoObs?.fecha_ultima_colposcopia ?? null,
          fecha_ultima_mamografia: ginecoObs?.fecha_ultima_mamografia ?? null,
          metodo_planificacion_familiar: ginecoObs?.metodo_planificacion_familiar ?? null,
          terapia_hormonal: ginecoObs?.terapia_hormonal ?? null,
          fecha_ultimo_eco_prostatico: ginecoObs?.fecha_ultimo_eco_prostatico ?? null,
          fecha_ultimo_antigeno_prostatico: ginecoObs?.fecha_ultimo_antigeno_prostatico ?? null,
        },
      },
      _d: {
        cardiopatia: antecFamiliares?.cardiopatia ?? false,
        hipertension: antecFamiliares?.hipertension ?? false,
        enfermedadCerebrovascular: antecFamiliares?.enfermedadCerebrovascular ?? false,
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
        observacion_e: data?.enfermedad_problema_anam ?? null,
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
        frecuencia_respiratoria_por_minuto: signosVitales?.frecuencia_respiratoria_por_minuto ?? null,
        peso_kg: signosVitales?.peso_kg ?? null,
        talla_cm: signosVitales?.talla_cm ?? null,
        imc_kg_m2: signosVitales?.imc_kg_m2 ?? null,
        perimetro_cefalico_cm: signosVitales?.perimetro_cefalico_cm ?? null,
        pulsioximetria_porcentaje: signosVitales?.pulsioximetria_porcentaje ?? null,
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
        observacion_i: data?.analisis_anam ?? null,
      },
      _k: {
        observacion_k: data?.plan_tratamiento_anam ?? null,
      },
      _l: {
        medico_usu_id_fk: data?.medico_usu_id_fk ?? null,
        fecha_fin: data?.fecha_fin ?? null,
        hora_fin: data?.hora_fin ?? null,
      },
      auditoria: {
        fecha_creacion_anam: data?.fecha_creacion_anam ?? null,
        fecha_modificacion_anam: data?.fecha_modificacion_anam ?? null,
      },
      medico_usu_id_fk: data?.medico_usu_id_fk ?? null,
    };
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

  getAllAnamnesis() {
    this.loading = true;
    this._anamnesisService
      .getAllAnamnesis(this.desde, this.hcu.fk_hcu)
      .subscribe({
        next: (resp) => {
          if (resp.status === 'ok') {
            if (resp.data.length > 0) {
              this.anamnesisList = resp.data;
              this.numeracion = resp.paginacion.pag;
              this.ant = resp.paginacion.ant;
              this.sig = resp.paginacion.sig;
            }
          }
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          Swal.fire({
            title: '¡Error!',
            icon: 'error',
            text: `Anamnesis (getAllAnamnesis) - ${err.message}`,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  /*********** Manejo de fechas ******** */
  getFechasAnamnesis() {
    this.loading = true;
    this._anamnesisService
      .getFechasAnamnesis(this.hcu.fk_hcu, this.fecha_desde, this.fecha_hasta)
      .subscribe({
        next: (resp) => {
          if (resp.status === 'ok') {
            if (resp.data.length > 0) {
              this.anamnesisList = resp.data;
            } else {
              this.anamnesisList = [];
            }
            this.desde = 0;
            this.intervalo = environment.filas;
            this.numeracion = 1;
          }
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          Swal.fire({
            title: '¡Error!',
            icon: 'error',
            text: `Anamnesis (getFechasAnamnesis) - ${err.message}`,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  filtroFechas(): void {
    const desdeVal = this.fecha_desde ? this.formatFecha(this.fecha_desde) : '';
    const hastaVal = this.fecha_hasta ? this.formatFecha(this.fecha_hasta) : '';

    const hasDesde = desdeVal !== '';
    const hasHasta = hastaVal !== '';

    if (hasDesde && hasHasta) {
      if (new Date(desdeVal) > new Date(hastaVal)) {
        console.warn('⚠️ Fecha "Desde" es mayor que "Hasta"');
        return;
      }
      this.getFechasAnamnesis();
      return;
    }

    if (!hasDesde && !hasHasta) {
      this.getAllAnamnesis();
      return;
    }

    console.log('Esperando que el usuario complete ambas fechas');
  }

  private formatFecha(fecha: Date | string): string {
    if (!fecha) return '';
    if (typeof fecha === 'string') return fecha;
    return fecha.toISOString().split('T')[0];
  }

  /*********** Fin Manejo de fechas ******** */

  avanzar() {
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getAllAnamnesis();
  }

  retroceder() {
    this.desde -= this.intervalo;
    this.numeracion -= 1;
    this.getAllAnamnesis();
  }

  aprobarAnamnesis(anamnesis: any) {
    Swal.fire({
      html: `
        <p style="font-size:20px;font-weight:bold;">
          ¿Está seguro que desea aprobar esta Anamnesis?
        </p>
        <p style="font-size:14px;">
          Esta acción implica que la Anamnesis no podrá ser modificada de nuevo.
        </p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#36c6d3',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        anamnesis.estado_anam = true;
        anamnesis.medico_usu_id_fk =
          this._loginService.getUserLocalStorage().pk_usuario;
        let anamnesisFinal = this.parametrizarAnamnesis(anamnesis);
        this.guardarAnamnesis(anamnesisFinal);
      }
    });
  }

  desaprobarAnamnesis(anamnesis: any) {
    if (this._loginService.getSuperUsuario()) {
      Swal.fire({
        html: `
          <p style="font-size:20px;font-weight:bold;">
            ¿Está seguro que desea des-aprobar esta Anamnesis?
          </p>
          <p style="font-size:14px;">
            Esta acción implica que la Anamnesis podrá ser modificada de nuevo.
          </p>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#36c6d3',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          anamnesis.estado_anam = false;
          anamnesis.medico_usu_id_fk =
            this._loginService.getUserLocalStorage().pk_usuario;
          let anamnesisFinal = this.parametrizarAnamnesis(anamnesis);
          this.guardarAnamnesis(anamnesisFinal);
        }
      });
    }
  }

  guardarAnamnesis(anamnesis: any) {
    const pkUsuario = this._loginService.getUserLocalStorage().pk_usuario;
    anamnesis.medico_usu_id_fk = pkUsuario;
    anamnesis._l.medico_usu_id_fk = pkUsuario;
    
    this._anamnesisService.guardarAnamnesis(anamnesis, 'U').subscribe({
      next: (resp) => {
        if (resp.status && resp.status === 'ok') {
          toastr.success(`Anamnesis Guardada/ Actualizada`, 'Éxito');
          this.getAllAnamnesis();
        } else {
          toastr.error('Error', `Problema al actualizar Anamnesis`);
        }
      },
      error: (err) => {
        toastr.error('Error', `${err} - Problema al actualizar Anamnesis`);
      },
    });
  }

  editarAnamnesis(anamnesis: any) {
    if (this._loginService.getSuperUsuario()) {
      this._routerService.navigate([
        '/form_anamnesis',
        anamnesis.pk_anam,
        false,
      ]);
    } else {
      if (anamnesis.estado_anam) {
        this._routerService.navigate([
          '/form_anamnesis',
          anamnesis.pk_anam,
          true,
        ]);
      } else {
        this._routerService.navigate([
          '/form_anamnesis',
          anamnesis.pk_anam,
          false,
        ]);
      }
    }
  }

  nuevoAnamnesis() {
    this._routerService.navigate(['/form_anamnesis', 0, false]);
  }

  imprimirAnamnesis(anamnesis: any) {
    const id = anamnesis;
    if (!id) {
      toastr.error('Sin ID', 'No hay pk_anam para imprimir.');
      return;
    }

    Swal.fire({
      title: 'Generando reporte..',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this._anamnesisService.impresionAnamnesisId(id).subscribe({
      next: (resp: any) => {
        const b64 = resp?.message;
        if (!b64 || typeof b64 !== 'string') {
          Swal.close();
          toastr.error('Respuesta inválida', 'No se recibió el PDF.');
          return;
        }

        const byteChars = atob(b64);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        Swal.close();

        const win = window.open(url, '_blank');
        if (!win) {
          const a = document.createElement('a');
          a.href = url;
          a.download = `anamnesis_${id}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }

        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: (err) => {
        Swal.close();
        toastr.error('Error', `${err} - No se pudo imprimir el Form. Anamnesis`);
      },
    });
  }
}
