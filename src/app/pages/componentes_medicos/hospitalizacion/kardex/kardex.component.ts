import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MenuHospitalizacionComponent } from '../../../../componentes_reutilizables/menu_izq/menu.component';
import { SkeletonTableComponent } from '../../../../componentes_reutilizables/skeleton/skeleton-table.component';
import { SkeletonCrudComponent } from '../../../../componentes_reutilizables/skeleton/skeleton-crud.component';
import { KardexService } from '../../../../services/hospitalizacion/kardex/kardex.service';
import { CasasSaludService } from '../../../../services/casas_salud/casas_salud.service';
import { LoginService } from '../../../../services/login.service';
import { KardexCab } from './kardex.interface';
import Swal from 'sweetalert2';
import { environment } from '../../../../../environments/environment';
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-kardex',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MenuHospitalizacionComponent,
    SkeletonTableComponent,
    SkeletonCrudComponent,
  ],
  templateUrl: './kardex.component.html',
  styles: ``,
})
export class KardexComponent {
  private _kardexService = inject(KardexService);
  private _casaSaludService = inject(CasasSaludService);
  private _loginService = inject(LoginService);
  private _routerService = inject(Router);

  kardexList: any[] = [];
  kardexBody: KardexCab | null = null;
  auditoriaData: any = null;
  casaSaludBody: any = {};
  hcu: any = {};
  desde: number = 0;
  intervalo = environment.filas;
  numeracion: number = 1;
  ant: boolean = false;
  sig: boolean = false;
  fecha_desde: Date | null = null;
  fecha_hasta: Date | null = null;
  loading: boolean = true;
  loadingEdit: boolean = false;
  opcion: string = 'I'; // 'I' para Insert, 'U' para Update
  accionVer: boolean = false; // Para controlar si solo se ve o se edita
  bsqKardex: string = '';
  
  /**
   * Determina si el campo de búsqueda debe estar habilitado
   * Solo está habilitado cuando ambas fechas están vacías/null
   */
  get bsqKardexHabilitado(): boolean {
    return !this.fecha_desde && !this.fecha_hasta;
  }

  constructor() {
    this.hcu = this._loginService.getHcuLocalStorage();
    this.getCasaSalud();
    this.getAllKardex();
  }

  /**
   * Inicializa un nuevo objeto KardexCab con valores por defecto
   */
  inicializarKardex(): KardexCab {
    const hcu = this._loginService.getHcuLocalStorage();
    return {
      pk_kardexcab: undefined,
      fecha_creacion_kardexcab: null,
      fecha_modificacion_kardexcab: null,
      casalud_id_fk: this.casaSaludBody?.casalud_id_pk || 0,
      fk_hcu: hcu?.fk_hcu || 0,
      medico_usu_id_fk: this._loginService.getUserLocalStorage()?.pk_usuario || 0,
      medicamento_kardexcab: '',
      dosis_kardexcab: '',
      via_kardexcab: '',
      frecuencia_kardexcab: '',
      fecha_kardexcab: '',
      estado_kardexcab: null,
    };
  }

  /**
   * Obtiene la casa de salud principal
   */
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

  /**
   * Obtiene todos los registros de Kardex
   */
  getAllKardex() {
    this.loading = true;
    if (!this.hcu || !this.hcu.fk_hcu) {
      toastr.error('Error', 'No se encontraron datos del paciente');
      this.loading = false;
      return;
    }

    this._kardexService.getAllKardex(this.desde, this.hcu.fk_hcu).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          if (resp.data && resp.data.length > 0) {
            this.kardexList = resp.data;
            this.numeracion = resp.paginacion?.pag || 1;
            this.ant = resp.paginacion?.ant || false;
            this.sig = resp.paginacion?.sig || false;
          } else {
            this.kardexList = [];
          }
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Kardex (getAllKardex) - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  /**
   * Realiza la búsqueda de Kardex
   * Mantiene el foco en el input después de la búsqueda
   */
  busquedaKardex() {
    // Si el campo está deshabilitado, no hacer nada
    if (!this.bsqKardexHabilitado) {
      return;
    }

    if (this.bsqKardex.length >= 4) {
      this.getBuscarKardex(this.bsqKardex);
    } else if (this.bsqKardex.length === 0) {
      this.desde = 0;
      this.numeracion = 1;
      this.getAllKardex();
    }
    
    // Mantener el foco en el input después de un breve delay
    setTimeout(() => {
      const inputElement = document.querySelector('input[placeholder="Búsqueda..."]') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
        // Colocar el cursor al final del texto
        const length = inputElement.value.length;
        inputElement.setSelectionRange(length, length);
      }
    }, 100);
  }

  getBuscarKardex(bsq: string) {
    this.loading = true;
    if (!this.hcu || !this.hcu.fk_hcu) {
      toastr.error('Error', 'No se encontraron datos del paciente');
      this.loading = false;
      return;
    }

    this._kardexService.getBsqKardex(this.hcu.fk_hcu, bsq).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          if (resp.data && resp.data.length > 0) {
            this.kardexList = resp.data;
            this.numeracion = resp.paginacion?.pag || 1;
            this.ant = false;
            this.sig = false;
          } else {
            this.kardexList = [];
          }
        }
        this.loading = false;
        
        // Mantener el foco en el input después de completar la búsqueda
        setTimeout(() => {
          const inputElement = document.querySelector('input[placeholder="Búsqueda..."]') as HTMLInputElement;
          if (inputElement && !inputElement.disabled) {
            inputElement.focus();
            const length = inputElement.value.length;
            inputElement.setSelectionRange(length, length);
          }
        }, 100);
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Kardex (getAllKardex) - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
        
        // Mantener el foco incluso si hay error
        setTimeout(() => {
          const inputElement = document.querySelector('input[placeholder="Búsqueda..."]') as HTMLInputElement;
          if (inputElement && !inputElement.disabled) {
            inputElement.focus();
            const length = inputElement.value.length;
            inputElement.setSelectionRange(length, length);
          }
        }, 100);
      },
    });
  }

  /**
   * Filtra Kardex por rango de fechas
   * Si alguna fecha tiene valor, limpia y deshabilita la búsqueda
   */
  filtroFechas(): void {
    const desdeVal = this.fecha_desde ? this.formatFecha(this.fecha_desde) : '';
    const hastaVal = this.fecha_hasta ? this.formatFecha(this.fecha_hasta) : '';

    const hasDesde = desdeVal !== '';
    const hasHasta = hastaVal !== '';

    // Si alguna fecha tiene valor, limpiar y deshabilitar la búsqueda
    if (hasDesde || hasHasta) {
      this.bsqKardex = '';
    }

    if (hasDesde && hasHasta) {
      if (new Date(desdeVal) > new Date(hastaVal)) {
        toastr.warning('Advertencia', 'Fecha "Desde" es mayor que "Hasta"');
        return;
      }
      this.getFechasKardex();
      return;
    }

    if (!hasDesde && !hasHasta) {
      this.desde = 0;
      this.numeracion = 1;
      this.getAllKardex();
      return;
    }
  }

  /**
   * Obtiene Kardex filtrados por fechas
   */
  getFechasKardex(): void {
    if (!this.hcu || !this.hcu.fk_hcu) {
      toastr.error('Error', 'No se encontraron datos del paciente');
      return;
    }

    const fecha1 = this.formatFecha(this.fecha_desde);
    const fecha2 = this.formatFecha(this.fecha_hasta);

    this.loading = true;
    this._kardexService.getFechasKardex(this.hcu.fk_hcu, fecha1, fecha2).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          if (resp.data && resp.data.length > 0) {
            this.kardexList = resp.data;
          } else {
            this.kardexList = [];
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
          text: `Kardex (getFechasKardex) - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  /**
   * Formatea una fecha a string YYYY-MM-DD
   */
  private formatFecha(fecha: Date | string | null): string {
    if (!fecha) return '';
    if (typeof fecha === 'string') return fecha;
    return fecha.toISOString().split('T')[0];
  }

  /**
   * Avanza a la siguiente página
   */
  avanzar() {
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getAllKardex();
  }

  /**
   * Retrocede a la página anterior
   */
  retroceder() {
    this.desde -= this.intervalo;
    this.numeracion -= 1;
    this.getAllKardex();
  }

  /**
   * Obtiene la fecha actual en formato YYYY-MM-DD
   */
  private obtenerFechaActual(): string {
    const ahora = new Date();
    return ahora.toISOString().split('T')[0];
  }

  /**
   * Abre el modal para crear un nuevo Kardex
   */
  nuevoKardex(): void {
    this.opcion = 'I';
    this.accionVer = false;
    this.kardexBody = this.inicializarKardex();
    
    // Establecer fecha y hora actual automáticamente
    this.kardexBody.fecha_kardexcab = this.obtenerFechaActual();
    
    $('#kardexModal').modal('show');
  }

  /**
   * Abre el modal para editar/ver un Kardex existente
   */
  editarKardex(item: any): void {
    this.opcion = 'U';
    this.accionVer = item.estado_kardexcab === true; // Si está aprobado, solo ver
    this.loadingEdit = true;
    $('#kardexModal').modal('show');

    this._kardexService.getKardexID(item.pk_kardexcab, 1).subscribe({
      next: (resp: any) => {
        if (resp.status === 'ok' && resp.data) {
          this.kardexBody = resp.data;
          this.loadingEdit = false;
        } else {
          this.loadingEdit = false;
          toastr.error('Error', 'No se pudieron cargar los datos del registro');
        }
      },
      error: (err) => {
        this.loadingEdit = false;
        toastr.error('Error', `${err} - No se pudieron cargar los datos del registro`);
      },
    });
  }

  /**
   * Valida que los campos obligatorios estén completos
   */
  validarGuardar(): boolean {
    if (!this.kardexBody) return false;

    // Campos obligatorios
    const camposObligatorios = [
      this.kardexBody.fk_hcu,
      this.kardexBody.casalud_id_fk,
      this.kardexBody.medico_usu_id_fk,
      this.kardexBody.medicamento_kardexcab,
      this.kardexBody.dosis_kardexcab,
      this.kardexBody.via_kardexcab,
      this.kardexBody.frecuencia_kardexcab,
      this.kardexBody.fecha_kardexcab,
    ];

    // Verifica que ningún campo obligatorio sea null, undefined, 0 o string vacío
    return camposObligatorios.every((campo) => {
      if (campo === null || campo === undefined || campo === 0) return false;
      if (typeof campo === 'string' && campo.trim() === '') return false;
      return true;
    });
  }

  /**
   * Guarda o actualiza un Kardex
   */
  guardarKardex(): void {
    if (!this.validarGuardar()) {
      toastr.warning('Advertencia', 'Complete todos los campos obligatorios');
      return;
    }

    // Mensaje de confirmación con SweetAlert2
    Swal.fire({
      title: '¿Está seguro?',
      text:
        this.opcion === 'I'
          ? '¿Desea guardar este nuevo registro de Kardex?'
          : '¿Desea actualizar este registro de Kardex?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#36c6d3',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.ejecutarGuardado();
      }
    });
  }

  /**
   * Ejecuta el guardado del Kardex
   */
  private ejecutarGuardado(): void {
    // Asegurar que los IDs estén actualizados
    this.kardexBody.casalud_id_fk = this.casaSaludBody?.casalud_id_pk ?? 0;
    this.kardexBody.fk_hcu = this.hcu?.fk_hcu || this.kardexBody.fk_hcu;
    this.kardexBody.medico_usu_id_fk =
      this._loginService.getUserLocalStorage()?.pk_usuario ||
      this.kardexBody.medico_usu_id_fk;

    this._kardexService.guardarKardex(this.kardexBody, this.opcion).subscribe({
      next: (resp: any) => {
        if (resp.status && resp.status === 'ok') {
          toastr.success('Éxito', 'Registro guardado correctamente');
          $('#kardexModal').modal('hide');
          this.kardexBody = this.inicializarKardex();

          // Recargar la lista
          if (this.fecha_desde && this.fecha_hasta) {
            this.getFechasKardex();
          } else {
            this.getAllKardex();
          }
        } else {
          toastr.error('Error', 'Problema al guardar el registro');
        }
      },
      error: (err) => {
        toastr.error('Error', `${err} - Problema al guardar el registro`);
      },
    });
  }

  /**
   * Abre el modal de auditoría con la información de creación y modificación
   */
  verAuditoria(item: any): void {
    this.auditoriaData = {
      fecha_creacion_kardexcab: item.fecha_creacion_kardexcab || null,
      fecha_modificacion_kardexcab: item.fecha_modificacion_kardexcab || null,
    };
    $('#auditoriaKardexCabModal').modal('show');
  }

  /**
   * Navega a la ruta de administración de medicamentos
   */
  administrarKardex(item: any): void {
    if (this._loginService.getSuperUsuario()) {
      this._routerService.navigate([
        '/kardex_detalle',
        item.pk_kardexcab,
        false,
      ]);
    } else {
      if (item.estado_kardexcab) {
        this._routerService.navigate([
          '/kardex_detalle',
          item.pk_kardexcab,
          true,
        ]);
      } else {
        this._routerService.navigate([
          '/kardex_detalle',
          item.pk_kardexcab,
          false,
        ]);
      }
    }
  }

  /**
   * Aprueba un registro de Kardex
   */
  aprobarKardex(kardex: any) {
    Swal.fire({
      html: `
        <p style="font-size:20px;font-weight:bold;">
          ¿Está seguro que desea aprobar este Kardex?
        </p>
        <p style="font-size:14px;">
          Esta acción implica que el Kardex no podrá ser modificado de nuevo.
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
        kardex.estado_kardexcab = true;
        kardex.medico_usu_id_fk = this._loginService.getUserLocalStorage().pk_usuario;
        this.guardarKardexEstado(kardex);
      }
    });
  }

  /**
   * Desaprueba un registro de Kardex (solo super usuario)
   */
  desaprobarKardex(kardex: any) {
    if (this._loginService.getSuperUsuario()) {
      Swal.fire({
        html: `
          <p style="font-size:20px;font-weight:bold;">
            ¿Está seguro que desea des-aprobar este Kardex?
          </p>
          <p style="font-size:14px;">
            Esta acción implica que el Kardex podrá ser modificado de nuevo.
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
          kardex.estado_kardexcab = false;
          kardex.medico_usu_id_fk = this._loginService.getUserLocalStorage().pk_usuario;
          this.guardarKardexEstado(kardex);
        }
      });
    } else {
      toastr.warning('Advertencia', 'Solo los super usuarios pueden desaprobar registros');
    }
  }

  /**
   * Guarda el estado del Kardex (aprobado/desaprobado)
   */
  private guardarKardexEstado(kardex: any) {
    // Asegurar que los IDs estén actualizados
    kardex.casalud_id_fk = this.casaSaludBody?.casalud_id_pk ?? 0;
    kardex.fk_hcu = this.hcu?.fk_hcu || kardex.fk_hcu;
    kardex.medico_usu_id_fk =
      this._loginService.getUserLocalStorage()?.pk_usuario ||
      kardex.medico_usu_id_fk;

    this._kardexService.guardarKardex(kardex, 'U').subscribe({
      next: (resp: any) => {
        if (resp.status && resp.status === 'ok') {
          toastr.success('Éxito', 'Estado del Kardex actualizado correctamente');
          
          // Recargar la lista
          if (this.fecha_desde && this.fecha_hasta) {
            this.getFechasKardex();
          } else {
            this.getAllKardex();
          }
        } else {
          toastr.error('Error', 'Problema al actualizar el estado del Kardex');
        }
      },
      error: (err) => {
        toastr.error('Error', `${err} - Problema al actualizar el estado del Kardex`);
      },
    });
  }

  /**
   * Función para imprimir Kardex
   * @param tipo - 'periodo' para imprimir por periodo, 'total' para imprimir todo
   */
  imprimirKardex(tipo: 'periodo' | 'total'): void {
    // Validar que existan los datos necesarios
    if (!this.hcu || !this.hcu.fk_hcu) {
      toastr.error('Sin datos', 'No se encontraron datos del paciente');
      return;
    }

    const fk_hcu = this.hcu.fk_hcu;
    const fecha_desde =
      tipo === 'periodo' ? this.hcu.fecha_ciclohosp : null;

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
    this._kardexService.impresionKardex(fk_hcu, fecha_desde,null).subscribe({
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
          a.download = `kardex_${fk_hcu}_${tipo}.pdf`;
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
}
