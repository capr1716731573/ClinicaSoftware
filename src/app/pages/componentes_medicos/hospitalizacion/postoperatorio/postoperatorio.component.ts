import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MenuHospitalizacionComponent } from '../../../../componentes_reutilizables/menu_izq/menu.component';
import { SkeletonTableComponent } from '../../../../componentes_reutilizables/skeleton/skeleton-table.component';
import { ProtocoloOperatorio } from './postoperatorio.interface';
import { PosOperatorioService } from '../../../../services/hospitalizacion/posoperatorio/posoperatorio.service';
import { CasasSaludService } from '../../../../services/casas_salud/casas_salud.service';
import { LoginService } from '../../../../services/login.service';
import { environment } from '../../../../../enviroments/enviroments';
import Swal from 'sweetalert2';
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-postoperatorio',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MenuHospitalizacionComponent,
    SkeletonTableComponent,
  ],
  templateUrl: './postoperatorio.component.html',
  styles: ``,
})
export class PostoperatorioComponent {
  private _postoperatorioService = inject(PosOperatorioService);
  private _casaSaludService = inject(CasasSaludService);
  private _loginService = inject(LoginService);
  private _routerService = inject(Router);

  postoperatorioList: any[] = [];
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
    this.getAllPostOperatorio();
  }

  parametrizarProtocoloOperatorio(data: any): ProtocoloOperatorio {
    // Bloques del JSON de origen
    const proc = data?.procedimiento_protope ?? {};
    const integ = data?.integrantes_protope ?? {};
    const tipoA = data?.tipoanestesia_protope ?? {};
    const tiempos = data?.tiemposquirurgicos_protope ?? {};
    const comp = data?.complicaciones_protope ?? {};
    const histo = data?.histopatologicos_protope ?? {};

    return {
      /* === A === */
      _a: {
        pk_protope: data?.pk_protope ?? 0,
        casalud_id_fk: data?.casalud_id_fk ?? 0,
        fk_hcu: data?.fk_hcu ?? 0,
        estado_protope: data?.estado_protope ?? false,
        medico_usu_id_fk: data?.medico_usu_id_fk ?? 0,
      },

      /* === C: procedimiento_protope === */
      _c: {
        electiva: proc?.electiva ?? false,
        emergencia: proc?.emergencia ?? false,
        urgencia: proc?.urgencia ?? false,
        proyectado: proc?.proyectado ?? null,
        realizado: proc?.realizado ?? null,
      },

      /* === D: integrantes_protope === */
      _d: {
        cirujano_1: integ?.cirujano_1 ?? null,
        cirujano_2: integ?.cirujano_2 ?? null,
        primer_ayudante: integ?.primer_ayudante ?? null,
        segundo_ayudante: integ?.segundo_ayudante ?? null,
        tercer_ayudante: integ?.tercer_ayudante ?? null,
        anestesiologo: integ?.anestesiologo ?? null,
        instrumentista: integ?.instrumentista ?? null,
        circulante: integ?.circulante ?? null,
        ayudanteanesteciologia: integ?.ayudanteanesteciologia ?? null,
        otros: integ?.otros ?? null,
      },

      /* === E: tipoanestesia_protope === */
      _e: {
        general: tipoA?.general ?? false,
        regional: tipoA?.regional ?? false,
        sedacion: tipoA?.sedacion ?? false,
        otros: tipoA?.otros ?? false,
      },

      /* === F: tiemposquirurgicos_protope === */
      _f: {
        fecha_operacion: tiempos?.fecha_operacion ?? null,
        hora_inicio: tiempos?.hora_inicio ?? null,
        hora_terminacion: tiempos?.hora_terminacion ?? null,
        dieresis: tiempos?.dieresis ?? null,
        exposicion: tiempos?.exposicion ?? null,
        hallazgos: tiempos?.hallazgos ?? null,
        procedimiento: tiempos?.procedimiento ?? null,
      },

      /* === G: complicaciones_protope === */
      _g: {
        observacion: comp?.observacion ?? null,
        descripcion: comp?.descripcion ?? null,
        perdida: comp?.perdida ?? 0,
        sangrado: comp?.sangrado ?? 0,
        uso: comp?.uso ?? 'NO',
      },

      /* === H: histopatologicos_protope === */
      _h: {
        transquirurgico: histo?.transquirurgico ?? null,
        biopsia: histo?.biopsia ?? 'NO',
        resultado: histo?.resultado ?? null,
        histopatologico: histo?.histopatologico ?? 'NO',
        muestra: histo?.muestra ?? null,
        medico_nombre: histo?.medico_nombre ?? null,
      },

      /* === I: diagrama_protope (string plano en raíz) === */
      _i: {
        diagrama_protope: data?.diagrama_protope ?? null,
      },
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

  getAllPostOperatorio() {
    this.loading = true;
    this._postoperatorioService
      .getAllPosOperatorio(this.desde, this.hcu.fk_hcu)
      .subscribe({
        next: (resp) => {
          if (resp.status === 'ok') {
            //Validacion para numeracion y parametro desde
            //Si resp.rows sea mayor a 0 se actualiza sino no
            if (resp.data.length > 0) {
              this.postoperatorioList = resp.data;

              this.numeracion = resp.paginacion.pag;
              this.ant = resp.paginacion.ant;
              this.sig = resp.paginacion.sig;
              /* console.log(resp); */
            }
          }
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          // manejo de error
          Swal.fire({
            title: '¡Error!',
            icon: 'error',
            text: `Epicrisis (getAllPostOperatorio) - ${err.message}`,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  /*********** Manejo de fechas ******** */
  getFechasPostOperatorio() {
    this.loading = true;
    this._postoperatorioService
      .getFechasPosOperatorio(
        this.hcu.fk_hcu,
        this.fecha_desde,
        this.fecha_hasta
      )
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

            this.desde = 0;
            this.intervalo = environment.filas;
            this.numeracion = 1;
          }
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
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

  filtroFechas(): void {
    const desdeVal = this.fecha_desde ? this.formatFecha(this.fecha_desde) : '';
    const hastaVal = this.fecha_hasta ? this.formatFecha(this.fecha_hasta) : '';

    const hasDesde = desdeVal !== '';
    const hasHasta = hastaVal !== '';

    // ✅ Ambas fechas llenas → filtrar
    if (hasDesde && hasHasta) {
      if (new Date(desdeVal) > new Date(hastaVal)) {
        console.warn('⚠️ Fecha "Desde" es mayor que "Hasta"');
        return;
      }
      this.getFechasPostOperatorio();
      return;
    }

    // ✅ Ambas vacías → cargar todo
    if (!hasDesde && !hasHasta) {
      this.getAllPostOperatorio();
      return;
    }

    // Opcional: una sola fecha
    console.log('Esperando que el usuario complete ambas fechas');
  }

  private formatFecha(fecha: Date | string): string {
    if (!fecha) return '';
    if (typeof fecha === 'string') return fecha;
    // Asegura formato ISO (sin zona horaria)
    return fecha.toISOString().split('T')[0];
  }

  /*********** Fin Manejo de fechas ******** */

  avanzar() {
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getAllPostOperatorio();
  }

  retroceder() {
    this.desde -= this.intervalo;
    this.numeracion -= 1;
    this.getAllPostOperatorio();
  }

  aprobarPostOperatorio(protocolo: any) {
    Swal.fire({
      html: `
            <p style="font-size:20px;font-weight:bold;">
              ¿Está seguro que desea aprobar esta Protocolo PostOperatorio?
            </p>
            <p style="font-size:14px;">
              Esta acción implica que la Protocolo PostOperatorio no podrá ser modificada de nuevo.
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
        protocolo.estado_protope = true;
        protocolo.medico_usu_id_fk =
          this._loginService.getUserLocalStorage().pk_usuario;
        console.log(JSON.stringify(protocolo));

        let protocoloFinal = this.parametrizarProtocoloOperatorio(protocolo);
        /* alert(JSON.stringify(protocoloFinal)); */

        protocoloFinal._a.estado_protope = true;
        this.guardarProtocoloPostOperatorio(protocoloFinal);
      } else if (
        result.isDismissed &&
        result.dismiss === Swal.DismissReason.cancel
      ) {
      }
    });
  }

  desaprobarPostOperatorio(protocolo: any) {
    if (this._loginService.getSuperUsuario()) {
      Swal.fire({
        html: `
            <p style="font-size:20px;font-weight:bold;">
              ¿Está seguro que desea des-aprobar el Protocolo PostOperatorio?
            </p>
            <p style="font-size:14px;">
              Esta acción implica que el Protocolo PostOperatorio podrá ser modificada de nuevo.
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
          protocolo.estado_protope = false;
          protocolo.medico_usu_id_fk =
            this._loginService.getUserLocalStorage().pk_usuario;
          let protocoloFinal = this.parametrizarProtocoloOperatorio(protocolo);

          this.guardarProtocoloPostOperatorio(protocoloFinal);
        } else if (
          result.isDismissed &&
          result.dismiss === Swal.DismissReason.cancel
        ) {
        }
      });
    }
  }

  guardarProtocoloPostOperatorio(protocolo: ProtocoloOperatorio) {
    //Asingo el pk usuario para auditoria
    protocolo._a.medico_usu_id_fk =
      this._loginService.getUserLocalStorage().pk_usuario;
    /* console.log(JSON.stringify(protocolo)) */
    this._postoperatorioService.guardarPosOperatorio(protocolo, 'U').subscribe({
      next: (resp) => {
        if (resp.status && resp.status === 'ok') {
          //this.evolucionBody = resp.data;
          toastr.success(
            `Protocolo PostOperatorio Guardada/ Actualizada`,
            'Éxito'
          );
          this.getAllPostOperatorio();
        } else {
          // manejo de error
          toastr.error(
            'Error',
            `Problema al actualizar Protocolo PostOperatorio`
          );
        }
      },
      error: (err) => {
        // manejo de error
        toastr.error(
          'Error',
          `${err} - Problema al actualizar Protocolo PostOperatorio`
        );
      },
    });
  }

  editarProtocoloPostOperatorio(protocolo: any) {
    if (this._loginService.getSuperUsuario()) {
      this._routerService.navigate([
        '/form_protocolo',
        protocolo.pk_protope,
        false,
        true
      ]); //true es editar
    } else {
      if (protocolo.estado_protope) {
        this._routerService.navigate([
          '/form_protocolo',
          protocolo.pk_protope,
          true,
          true
        ]); //true es editar
      } else {
        this._routerService.navigate([
          '/form_protocolo',
          protocolo.pk_protope,
          false,
          true
        ]); //true es editar
      }
    }
  }

  nuevoProtocoloPostOperatorio() {
    this._routerService.navigate(['/form_protocolo', 0, false, true]); //true es editar
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
}
