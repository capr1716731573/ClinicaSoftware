import { Component, inject } from '@angular/core';
import { InterconsultaService } from '../../../../services/hospitalizacion/interconsulta/interconsulta.service';
import { CasasSaludService } from '../../../../services/casas_salud/casas_salud.service';
import { LoginService } from '../../../../services/login.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuHospitalizacionComponent } from '../../../../componentes_reutilizables/menu_izq/menu.component';
import Swal from 'sweetalert2';
import { SkeletonTableComponent } from '../../../../componentes_reutilizables/skeleton/skeleton-table.component';
import { environment } from '../../../../../environments/environment';
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-interconsultas',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MenuHospitalizacionComponent,
    SkeletonTableComponent
  ],
  templateUrl: './interconsultas.component.html',
  styles: ``,
})
export class InterconsultasComponent {
  private _interconsultaSolicitudService = inject(InterconsultaService);
  private _casaSaludService = inject(CasasSaludService);
  private _loginService = inject(LoginService);
  private _routerService = inject(Router);

  interconsultaList: any[] = [];
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
    this.getAllInterconsultaSolicitud();
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

  getAllInterconsultaSolicitud() {
    this.loading = true;
    this._interconsultaSolicitudService
      .getAllInterconsultaSolicitud(this.desde, this.hcu.fk_hcu)
      .subscribe({
        next: (resp) => {
          if (resp.status === 'ok') {
            //Validacion para numeracion y parametro desde
            //Si resp.rows sea mayor a 0 se actualiza sino no
            if (resp.data.length > 0) {
              this.interconsultaList = resp.data;
              /* console.log(JSON.stringify(this.interconsultaList)); */

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
            text: `Interconsulta (getAllInterconsultaSolicitud) - ${err.message}`,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  /*********** Manejo de fechas ******** */
  getFechasInterconsulta() {
    this.loading = true;
    this._interconsultaSolicitudService
      .getFechasInterconsultaSolicitud(
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
              this.interconsultaList = resp.data;
              /* console.log(resp); */
            } else {
              this.interconsultaList = [];
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
            text: `Interconsulta (getFechasInterconsulta) - ${err.message}`,
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
      this.getFechasInterconsulta();
      return;
    }

    // ✅ Ambas vacías → cargar todo
    if (!hasDesde && !hasHasta) {
      this.getAllInterconsultaSolicitud();
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
    this.getAllInterconsultaSolicitud();
  }

  retroceder() {
    this.desde -= this.intervalo;
    this.numeracion -= 1;
    this.getAllInterconsultaSolicitud();
  }

  nuevoInterconsultaSolicitud() {
    this._routerService.navigate(['/form_interconsulta_solicitud', 0, false,true]); //true es editar
  }

  editarInterconsultaSolicitud(interconsulta: any) {
    if (this._loginService.getSuperUsuario()) {
      this._routerService.navigate([
        '/form_interconsulta_solicitud',
        interconsulta.pk_intersol,
        false,true
      ]); //true es editar
    } else {
      if (interconsulta.contestada === 'SI') {
        this._routerService.navigate([
          '/form_interconsulta_solicitud',
          interconsulta.pk_intersol,
          true,true
        ]); //true es editar
      } else {
        this._routerService.navigate([
          '/form_interconsulta_solicitud',
          interconsulta.pk_intersol,
          false,true
        ]); //true es editar
      }
    }
  }

  nuevoInterconsultaInforme(pk_intersol: number) {
    this._routerService.navigate([
      '/form_interconsulta_informe',
      pk_intersol,
      0,
      false,true
    ]); //true es editar
  }

  editarInterconsultaInforme(interconsulta: any): void {
    const idSolicitud = interconsulta.pk_intersol;
    const idInforme = interconsulta.interconsulta_respuesta; // puede ser null

    // 1. Si es superusuario, puede entrar siempre en modo normal (accion = false)
    if (this._loginService.getSuperUsuario()) {
      this._routerService.navigate([
        '/form_interconsulta_informe',
        idSolicitud,
        idInforme,
        false,true // editable
      ]);
      return;
    }

    // 2. Construir Date de referencia (fecha/hora de la solicitud)
    // OJO: ajusta los nombres según tu listado: fechaInicio/horaInicio o fecha_inicio/hora_inicio
    const fechaBase = interconsulta.fechaInicio || interconsulta.fecha_inicio;
    let horaNormalizada = (
      interconsulta.horaInicio ||
      interconsulta.hora_inicio ||
      '00:00'
    )
      .toString()
      .trim();

    if (horaNormalizada.length === 5) {
      // 'HH:mm' → 'HH:mm:00'
      horaNormalizada = `${horaNormalizada}:00`;
    }

    const fechaHoraStr = `${fechaBase}T${horaNormalizada}`;
    const fechaHoraRef = new Date(fechaHoraStr);

    if (isNaN(fechaHoraRef.getTime())) {
      Swal.fire({
        title: 'Error en fecha/hora',
        text: 'No se pudo interpretar la fecha y hora de referencia de la interconsulta.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    // 3. Calcular diferencia con ahora en ms
    const ahora = new Date();
    const diffMs = ahora.getTime() - fechaHoraRef.getTime();

    // 120 horas en ms
    const maxMs = 120 * 60 * 60 * 1000; // 120h

    // 4. Validar límite de 120 horas
    if (diffMs > maxMs) {
      // 🕒 Ya se pasaron las 120 horas → Modo bloqueado (accion = true)
      Swal.fire({
        title: 'Tiempo excedido',
        text: 'Han transcurrido más de 120 horas desde el registro de la solicitud. Solo puede visualizar el informe de interconsulta.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
      }).then(() => {
        this._routerService.navigate([
          '/form_interconsulta_informe',
          idSolicitud,
          idInforme,
          true,true // bloqueado / solo lectura
        ]);
      });
    } else {
      // ✅ Dentro del tiempo permitido → Modo editable (accion = false)
      this._routerService.navigate([
        '/form_interconsulta_informe',
        idSolicitud,
        idInforme,
        false,true // editable
      ]);
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

    this._interconsultaSolicitudService.impresionInterconsulta(id_sol,id_resp).subscribe({
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
}
