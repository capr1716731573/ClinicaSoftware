import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  distinctUntilChanged,
  finalize,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CicloHospitalizacionService } from '../../../services/ciclo_hospitalizacion/ciclo_hospitalizacion.service';
import Swal from 'sweetalert2';
import { EvolucionService } from '../../../services/hospitalizacion/evolucion/evolucion.service';
import { SignosService } from '../../../services/hospitalizacion/signos/signos.service';
import { KardexService } from '../../../services/hospitalizacion/kardex/kardex.service';
import { EpicrisisService } from '../../../services/hospitalizacion/epicrisis/epicrisis.service';
import { LoginService } from '../../../services/login.service';
import { PosOperatorioService } from '../../../services/hospitalizacion/posoperatorio/posoperatorio.service';
import { InterconsultaService } from '../../../services/hospitalizacion/interconsulta/interconsulta.service';
import { AnamnesisService } from '../../../services/hospitalizacion/anamnesis/anamnesis.service';
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-historial-formularios',
  imports: [CommonModule],
  templateUrl: './historial-formularios.component.html',
  styles: ``,
})
export class HistorialFormulariosComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private _loginService = inject(LoginService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _cicloHospService = inject(CicloHospitalizacionService);
  private _evolucionService = inject(EvolucionService);
  private _signosService = inject(SignosService);
  private _kardexService = inject(KardexService);
  private _epicrisisService = inject(EpicrisisService);
  private _postoperatorioService = inject(PosOperatorioService);
  private _interconsultaService = inject(InterconsultaService);
  private _anamesisService = inject(AnamnesisService);

  loadingHeader = true;
  pkCicloHosp = 0;

  ciclo: any = null; // data del ciclo (ingreso) + posible egreso

  //Variables
  epicrisisList: any[] = [];
  loadingEpicrisis = false;

  postoperatorioList: any[] = [];
  loadingProtocolo = false;

  interconsultaList: any[] = [];
  loadingInterconsulta = false;

  anamnesisList: any[] = [];
  loadingAnamnesis = false;

  ngOnInit(): void {
    this._route.paramMap
      .pipe(
        map((pm) => Number(pm.get('id') ?? 0)),
        distinctUntilChanged(),
        switchMap((id) => {
          this.pkCicloHosp = id;
          this.loadingHeader = true;
          this.ciclo = null;
          if (!id) {
            return of(null).pipe(
              finalize(() => {
                this.loadingHeader = false;
              })
            );
          }
          return this._cicloHospService.getCensoXId(id).pipe(
            tap((resp: any) => {
              this.ciclo = this.parseCicloResponse(resp);
            }),
            catchError((_err) => {
              // el service ya muestra Swal, aquí solo evitamos romper el stream
              this.ciclo = null;
              return of(null);
            }),
            finalize(() => {
              this.loadingHeader = false;
            })
          );
        }),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe();
  }

  private parseCicloResponse(resp: any): any {
    if (!resp) return null;

    // Casos típicos:
    // 1) { status:'ok', rows:[{...}] }
    if (Array.isArray(resp?.rows) && resp.rows.length > 0) return resp.rows[0];

    // 2) { status:'ok', data:{...} }
    if (resp?.data) return resp.data;

    // 3) { rows:{...} } (por si el backend devuelve un objeto)
    if (resp?.rows && typeof resp.rows === 'object') return resp.rows;

    // 4) Objeto directo
    if (typeof resp === 'object') return resp;

    return null;
  }

  volverAIngresos(): void {
    const fkHcu = Number(this.ciclo?.fk_hcu ?? 0);
    if (!fkHcu) return;
    this._router.navigate(['/ingresos', fkHcu]);
  }

  get nombreCompleto(): string {
    const c = this.ciclo ?? {};
    const nombres =
      (c.nombres_persona ?? '').trim() ||
      `${c.nombre_primario_persona ?? ''} ${
        c.nombre_secundario_persona ?? ''
      }`.trim();
    const apellidos = `${c.apellidopat_persona ?? ''} ${
      c.apellidomat_persona ?? ''
    }`.trim();
    return `${apellidos} ${nombres}`.trim();
  }

  get fechaInicio(): string {
    return this.ciclo?.fecha_ciclohosp ?? '-';
  }

  get fechaFin(): string {
    if (!this.ciclo) return '-';
    if (this.ciclo?.activo_ciclohosp) return 'Actualmente Hospitalizado';
    return this.ciclo?.egreso?.fecha_ciclohosp ?? '-';
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //@@@@@@@@@@@@@@ FUNCIONES QUE CARGAN INFORMACION    @@@@@@@@@@@@@@@@
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  //Evoluciones
  imprimirEvolucion() {
    const id = this.ciclo?.fk_hcu;
    if (!id) {
      toastr.error('Sin ID', 'No hay pk_emerg para imprimir.');
      return;
    }

    const fechaInicio = this.ciclo?.fecha_ciclohosp;
    const fechaFin = this.ciclo?.egreso?.fecha_ciclohosp;

    if (!fechaInicio) {
      toastr.error('Sin Fecha', 'No existe fecha de inicio del ciclo.');
      return;
    }

    // Si no hay egreso (paciente hospitalizado), usamos la fecha actual para el período
    let fechaFinFinal = fechaFin;
    if (!fechaFinFinal) {
      const hoy = new Date();
      fechaFinFinal = hoy.toISOString().slice(0, 10);
      if (typeof toastr?.info === 'function') {
        toastr.info(
          'Paciente sin egreso',
          'Se usará la fecha actual como fin del periodo.'
        );
      }
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

    this._evolucionService
      .impresionEvolucionId(id, fechaInicio, fechaFinFinal)
      .subscribe({
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
            a.download = `evolucion_${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }

          setTimeout(() => URL.revokeObjectURL(url), 60_000);
        },
        error: (err) => {
          Swal.close();
          toastr.error(
            'Error',
            `${err} - No se pudo imprimir el Form. Evolución`
          );
        },
      });
  }

  //Signos Vitales
  imprimirSignos(): void {
    // Validar que existan los datos necesarios
    if (!this.ciclo || !this.ciclo.fk_hcu) {
      toastr.error('Sin datos', 'No se encontraron datos del paciente');
      return;
    }

    const fk_hcu = this.ciclo.fk_hcu;
    const fechaInicio = this.ciclo?.fecha_ciclohosp;
    const fechaFin = this.ciclo?.egreso?.fecha_ciclohosp;

    if (!fechaInicio) {
      toastr.error('Sin Fecha', 'No existe fecha de inicio del ciclo.');
      return;
    }

    // Si no hay egreso (paciente hospitalizado), usamos la fecha actual para el período
    let fechaFinFinal = fechaFin;
    if (!fechaFinFinal) {
      const hoy = new Date();
      fechaFinFinal = hoy.toISOString().slice(0, 10);
      if (typeof toastr?.info === 'function') {
        toastr.info(
          'Paciente sin egreso',
          'Se usará la fecha actual como fin del periodo.'
        );
      }
    }

    // Mostrar loading
    Swal.fire({
      title: 'Generando reporte..',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Llamar al servicio de impresión
    this._signosService
      .impresionSignos(fk_hcu, fechaInicio, fechaFinFinal)
      .subscribe({
        next: (resp: any) => {
          const b64 = resp?.message;
          if (!b64 || typeof b64 !== 'string') {
            Swal.close();
            toastr.error('Respuesta inválida', 'No se recibió el PDF.');
            return;
          }

          // Convertir base64 a Blob
          const byteChars = atob(b64);
          const byteNumbers = new Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) {
            byteNumbers[i] = byteChars.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);

          Swal.close();

          // Intentar abrir en nueva ventana
          const win = window.open(url, '_blank');
          if (!win) {
            // Si no se puede abrir, descargar el archivo
            const a = document.createElement('a');
            a.href = url;
            a.download = `signos_vitales_${fk_hcu}_${fechaInicio}_${fechaFin}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }

          // Liberar memoria después de 60 segundos
          setTimeout(() => URL.revokeObjectURL(url), 60_000);
        },
        error: (err) => {
          Swal.close();
          toastr.error('Error', `${err} - No se pudo imprimir Signos Vitales`);
        },
      });
  }

  //Kardex
  imprimirKardex(): void {
    // Validar que existan los datos necesarios
    if (!this.ciclo || !this.ciclo.fk_hcu) {
      toastr.error('Sin datos', 'No se encontraron datos del paciente');
      return;
    }

    const fk_hcu = this.ciclo.fk_hcu;
    const fechaInicio = this.ciclo?.fecha_ciclohosp;
    const fechaFin = this.ciclo?.egreso?.fecha_ciclohosp;

    if (!fechaInicio) {
      toastr.error('Sin Fecha', 'No existe fecha de inicio del ciclo.');
      return;
    }

    // Si no hay egreso (paciente hospitalizado), usamos la fecha actual para el período
    let fechaFinFinal = fechaFin;
    if (!fechaFinFinal) {
      const hoy = new Date();
      fechaFinFinal = hoy.toISOString().slice(0, 10);
      if (typeof toastr?.info === 'function') {
        toastr.info(
          'Paciente sin egreso',
          'Se usará la fecha actual como fin del periodo.'
        );
      }
    }

    // Mostrar loading
    Swal.fire({
      title: 'Generando reporte..',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Llamar al servicio de impresión
    this._kardexService
      .impresionKardex(fk_hcu, fechaInicio, fechaFinFinal)
      .subscribe({
        next: (resp: any) => {
          const b64 = resp?.message;
          if (!b64 || typeof b64 !== 'string') {
            Swal.close();
            toastr.error('Respuesta inválida', 'No se recibió el PDF.');
            return;
          }

          // Convertir base64 a Blob
          const byteChars = atob(b64);
          const byteNumbers = new Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) {
            byteNumbers[i] = byteChars.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);

          Swal.close();

          // Intentar abrir en nueva ventana
          const win = window.open(url, '_blank');
          if (!win) {
            // Si no se puede abrir, descargar el archivo
            const a = document.createElement('a');
            a.href = url;
            a.download = `kardex_${fk_hcu}_${fechaInicio}_${fechaFin}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }

          // Liberar memoria después de 60 segundos
          setTimeout(() => URL.revokeObjectURL(url), 60_000);
        },
        error: (err) => {
          Swal.close();
          toastr.error('Error', `${err} - No se pudo imprimir Kardex`);
        },
      });
  }

  //Epicrisis
  getFechasEpicrisis() {
    this.loadingEpicrisis = true;
    this.epicrisisList = [];
    // Validar que existan los datos necesarios
    if (!this.ciclo || !this.ciclo.fk_hcu) {
      toastr.error('Sin datos', 'No se encontraron datos del paciente');
      this.loadingEpicrisis = false;
      return;
    }

    const fk_hcu = this.ciclo.fk_hcu;
    const fechaInicio = this.ciclo?.fecha_ciclohosp;
    const fechaFin = this.ciclo?.egreso?.fecha_ciclohosp;

    if (!fechaInicio) {
      toastr.error('Sin Fecha', 'No existe fecha de inicio del ciclo.');
      this.loadingEpicrisis = false;
      return;
    }

    // Si no hay egreso (paciente hospitalizado), usamos la fecha actual para el período
    let fechaFinFinal = fechaFin;
    if (!fechaFinFinal) {
      const hoy = new Date();
      fechaFinFinal = hoy.toISOString().slice(0, 10);
      if (typeof toastr?.info === 'function') {
        toastr.info(
          'Paciente sin egreso',
          'Se usará la fecha actual como fin del periodo.'
        );
      }
    }
    this._epicrisisService
      .getFechasEpicrisis(fk_hcu, fechaInicio, fechaFinFinal)
      .subscribe({
        next: (resp) => {
          if (resp.status === 'ok') {
            //Validacion para numeracion y parametro desde
            //Si resp.rows sea mayor a 0 se actualiza sino no
            if (resp.data.length > 0) {
              this.epicrisisList = resp.data;
              console.log(resp);
            } else {
              this.epicrisisList = [];
            }
          }
          this.loadingEpicrisis = false;
        },
        error: (err) => {
          this.loadingEpicrisis = false;
          // manejo de error
          Swal.fire({
            title: '¡Error!',
            icon: 'error',
            text: `Epicrisis (getFechasEpicrisis) - ${err.message}`,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  imprimirEpicrisis(epicrisis: any) {
    const id = epicrisis;
    if (!id) {
      toastr.error('Sin ID', 'No hay pk_epi para imprimir.');
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

    this._epicrisisService.impresionEpicrisisId(id).subscribe({
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
          a.download = `epicrisis_${id}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }

        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: (err) => {
        Swal.close();
        toastr.error(
          'Error',
          `${err} - No se pudo imprimir el Form. Evolución`
        );
      },
    });
  }

  editarEpicrisis(epicrisis: any) {
    if (this._loginService.getSuperUsuario()) {
      this._router.navigate([
        '/form_epicrisis',
        epicrisis.pk_epi,
        false,
        false,
      ]); //true es editar
    } else {
      if (epicrisis.estado_epi) {
        this._router.navigate([
          '/form_epicrisis',
          epicrisis.pk_epi,
          true,
          false,
        ]); //true es editar
      } else {
        this._router.navigate([
          '/form_epicrisis',
          epicrisis.pk_epi,
          true,
          false,
        ]); //true es editar
      }
    }
  }

  //Protocolo Quirurgico
  getFechasPostOperatorio() {
    this.loadingProtocolo = true;
    this.postoperatorioList = [];
    // Validar que existan los datos necesarios
    if (!this.ciclo || !this.ciclo.fk_hcu) {
      toastr.error('Sin datos', 'No se encontraron datos del paciente');
      this.loadingProtocolo = false;
      return;
    }

    const fk_hcu = this.ciclo.fk_hcu;
    const fechaInicio = this.ciclo?.fecha_ciclohosp;
    const fechaFin = this.ciclo?.egreso?.fecha_ciclohosp;

    if (!fechaInicio) {
      toastr.error('Sin Fecha', 'No existe fecha de inicio del ciclo.');
      this.loadingProtocolo = false;
      return;
    }

    // Si no hay egreso (paciente hospitalizado), usamos la fecha actual para el período
    let fechaFinFinal = fechaFin;
    if (!fechaFinFinal) {
      const hoy = new Date();
      fechaFinFinal = hoy.toISOString().slice(0, 10);
      if (typeof toastr?.info === 'function') {
        toastr.info(
          'Paciente sin egreso',
          'Se usará la fecha actual como fin del periodo.'
        );
      }
    }
    this._postoperatorioService
      .getFechasPosOperatorio(fk_hcu, fechaInicio, fechaFinFinal)
      .subscribe({
        next: (resp) => {
          if (resp.status === 'ok') {
            //Validacion para numeracion y parametro desde
            //Si resp.rows sea mayor a 0 se actualiza sino no
            if (resp.data.length > 0) {
              this.postoperatorioList = resp.data;
              /* console.log(resp); */
            } else {
              this.postoperatorioList = [];
            }
          }
          this.loadingProtocolo = false;
        },
        error: (err) => {
          this.loadingProtocolo = false;
          // manejo de error
          Swal.fire({
            title: '¡Error!',
            icon: 'error',
            text: `Protocolo (getFechasPostOperatorio) - ${err.message}`,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  editarProtocoloPostOperatorio(protocolo: any) {
    if (this._loginService.getSuperUsuario()) {
      this._router.navigate([
        '/form_protocolo',
        protocolo.pk_protope,
        false,
        false,
      ]); //true es editar
    } else {
      if (protocolo.estado_protope) {
        this._router.navigate([
          '/form_protocolo',
          protocolo.pk_protope,
          true,
          false,
        ]); //true es editar
      } else {
        this._router.navigate([
          '/form_protocolo',
          protocolo.pk_protope,
          true,
          false,
        ]); //true es editar
      }
    }
  }

  imprimirProtocoloPostOperatorio(protocolo: any) {
    const id = protocolo;
    if (!id) {
      toastr.error('Sin ID', 'No hay pk_epi para imprimir.');
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

    this._postoperatorioService.impresionPosOperatorioId(id).subscribe({
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
          a.download = `postoperatorio_${id}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }

        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: (err) => {
        Swal.close();
        toastr.error(
          'Error',
          `${err} - No se pudo imprimir el Form. Evolución`
        );
      },
    });
  }

  //Interconsultas
  getFechasInterconsulta() {
    this.loadingInterconsulta = true;
    this.interconsultaList = [];
    // Validar que existan los datos necesarios
    if (!this.ciclo || !this.ciclo.fk_hcu) {
      toastr.error('Sin datos', 'No se encontraron datos del paciente');
      this.loadingProtocolo = false;
      return;
    }

    const fk_hcu = this.ciclo.fk_hcu;
    const fechaInicio = this.ciclo?.fecha_ciclohosp;
    const fechaFin = this.ciclo?.egreso?.fecha_ciclohosp;

    if (!fechaInicio) {
      toastr.error('Sin Fecha', 'No existe fecha de inicio del ciclo.');
      this.loadingProtocolo = false;
      return;
    }

    // Si no hay egreso (paciente hospitalizado), usamos la fecha actual para el período
    let fechaFinFinal = fechaFin;
    if (!fechaFinFinal) {
      const hoy = new Date();
      fechaFinFinal = hoy.toISOString().slice(0, 10);
      if (typeof toastr?.info === 'function') {
        toastr.info(
          'Paciente sin egreso',
          'Se usará la fecha actual como fin del periodo.'
        );
      }
    }
    this._interconsultaService
      .getFechasInterconsultaSolicitud(fk_hcu, fechaInicio, fechaFinFinal)
      .subscribe({
        next: (resp) => {
          if (resp.status === 'ok') {
            //Validacion para numeracion y parametro desde
            //Si resp.rows sea mayor a 0 se actualiza sino no
            if (resp.data.length > 0) {
              this.interconsultaList = resp.data;
              /* console.log(resp); */
            } else {
              this.interconsultaList = [];
            }
          }
          this.loadingInterconsulta = false;
        },
        error: (err) => {
          this.loadingInterconsulta = false;
          // manejo de error
          Swal.fire({
            title: '¡Error!',
            icon: 'error',
            text: `Interconsulta (getFechasInterconsulta) - ${err.message}`,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  editarInterconsultaSolicitud(interconsulta: any) {
    if (this._loginService.getSuperUsuario()) {
      this._router.navigate([
        '/form_interconsulta_solicitud',
        interconsulta.pk_intersol,
        false,
        false,
      ]); //true es editar
    }
  }

  editarInterconsultaInforme(interconsulta: any): void {
    const idSolicitud = interconsulta.pk_intersol;
    const idInforme = interconsulta.interconsulta_respuesta; // puede ser null

    if (this._loginService.getSuperUsuario()) {
      this._router.navigate([
        '/form_interconsulta_informe',
        idSolicitud,
        idInforme,
        false,
        false,
      ]); //true es editar
    }
  }

  imprimirInterconsulta(interconsulta: any) {
    const id_sol = interconsulta.pk_intersol;
    const id_resp = interconsulta.interconsulta_respuesta;
    if (!id_sol) {
      toastr.error('Sin ID', 'No hay interconsulta para imprimir.');
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

    this._interconsultaService
      .impresionInterconsulta(id_sol, id_resp)
      .subscribe({
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
            a.download = `interconsulta_${id_sol}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }

          setTimeout(() => URL.revokeObjectURL(url), 60_000);
        },
        error: (err) => {
          Swal.close();
          toastr.error(
            'Error',
            `${err} - No se pudo imprimir el Form. Interconsulta`
          );
        },
      });
  }

  //Anamesis
  getFechasAnamnesis() {
    this.loadingAnamnesis = true;
    this.epicrisisList = [];
    // Validar que existan los datos necesarios
    if (!this.ciclo || !this.ciclo.fk_hcu) {
      toastr.error('Sin datos', 'No se encontraron datos del paciente');
      this.loadingEpicrisis = false;
      return;
    }

    const fk_hcu = this.ciclo.fk_hcu;
    const fechaInicio = this.ciclo?.fecha_ciclohosp;
    const fechaFin = this.ciclo?.egreso?.fecha_ciclohosp;

    if (!fechaInicio) {
      toastr.error('Sin Fecha', 'No existe fecha de inicio del ciclo.');
      this.loadingEpicrisis = false;
      return;
    }

    // Si no hay egreso (paciente hospitalizado), usamos la fecha actual para el período
    let fechaFinFinal = fechaFin;
    if (!fechaFinFinal) {
      const hoy = new Date();
      fechaFinFinal = hoy.toISOString().slice(0, 10);
      if (typeof toastr?.info === 'function') {
        toastr.info(
          'Paciente sin egreso',
          'Se usará la fecha actual como fin del periodo.'
        );
      }
    }

    this._anamesisService
      .getFechasAnamnesis(fk_hcu, fechaInicio, fechaFinFinal)
      .subscribe({
        next: (resp) => {
          if (resp.status === 'ok') {
            if (resp.data.length > 0) {
              this.anamnesisList = resp.data;
            } else {
              this.anamnesisList = [];
            }
          }
          this.loadingAnamnesis = false;
        },
        error: (err) => {
          this.loadingAnamnesis = false;
          Swal.fire({
            title: '¡Error!',
            icon: 'error',
            text: `Anamnesis (getFechasAnamnesis) - ${err.message}`,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  editarAnamnesis(anamnesis: any) {
    if (this._loginService.getSuperUsuario()) {
      this._router.navigate([
        '/form_anamnesis',
        anamnesis.pk_anam,
        false,
        false,
      ]);
    } else {
      if (anamnesis.estado_anam) {
        this._router.navigate([
          '/form_anamnesis',
          anamnesis.pk_anam,
          true,
          false,
        ]);
      } else {
        this._router.navigate([
          '/form_anamnesis',
          anamnesis.pk_anam,
          true,
          false,
        ]);
      }
    }
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

    this._anamesisService.impresionAnamnesisId(id).subscribe({
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
        toastr.error(
          'Error',
          `${err} - No se pudo imprimir el Form. Anamnesis`
        );
      },
    });
  }
}
