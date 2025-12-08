import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MenuHospitalizacionComponent } from '../../../../componentes_reutilizables/menu_izq/menu.component';
import { SkeletonCrudComponent } from '../../../../componentes_reutilizables/skeleton/skeleton-crud.component';
import { SkeletonTableComponent } from '../../../../componentes_reutilizables/skeleton/skeleton-table.component';
import { KardexService } from '../../../../services/hospitalizacion/kardex/kardex.service';
import { LoginService } from '../../../../services/login.service';
import { KardexCab, KardexDet } from './kardex.interface';
import Swal from 'sweetalert2';
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-kardex-det',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MenuHospitalizacionComponent,
    SkeletonCrudComponent,
    SkeletonTableComponent,
  ],
  templateUrl: './kardex-det.component.html',
  styles: ``,
})
export class KardexDetComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _kardexService = inject(KardexService);
  private _loginService = inject(LoginService);

  // Variables principales
  idNum = 0;
  accionVer = false;
  loading = false;
  loadingDetalle = false;

  // Datos de la cabecera
  kardexCab: KardexCab | null = null;
  medicamentoNombre: string = '';

  // Lista de detalles
  kardexDetList: any[] = [];

  // Formulario de detalle
  kardexDetBody: KardexDet | null = null;
  opcionDet: string = 'I'; // 'I' para Insert, 'U' para Update

  constructor() {
    // Inicialización básica
  }

  ngOnInit(): void {
    this._route.paramMap.subscribe((pm) => {
      this.idNum = Number(pm.get('id') ?? 0);
      const accionParam = (pm.get('accion') ?? '').toLowerCase();
      
      // Determinar si es solo lectura
      this.accionVer =
        accionParam === 'true' ||
        accionParam === '1' ||
        accionParam === 'ver' ||
        accionParam === 'v';

      if (this.idNum !== 0 && !isNaN(this.idNum)) {
        this.loading = true;
        this.cargarKardexCabecera(this.idNum);
      } else {
        toastr.error('Error', 'ID de Kardex no válido');
        this._router.navigate(['/kardex']);
      }
    });
  }

  /**
   * Inicializa un nuevo objeto KardexDet con valores por defecto
   */
  inicializarKardexDet(): KardexDet {
    return {
      pk_kardexdet: undefined,
      fecha_creacion_kardexdet: null,
      fecha_modificacion_kardexdet: null,
      fk_kardexcab: this.idNum || 0,
      medico_usu_id_fk: this._loginService.getUserLocalStorage()?.pk_usuario || 0,
      fecha_kardexdet: '',
      hora_kardexdet: '',
      administrado_kardexdet: false,
    };
  }

  /**
   * Carga la información de la cabecera del Kardex
   */
  cargarKardexCabecera(id: number): void {
    this._kardexService.getKardexID(id, 1).subscribe({
      next: (resp: any) => {
        if (resp.status === 'ok' && resp.data) {
          this.kardexCab = resp.data;
          this.medicamentoNombre = resp.data.medicamento_kardexcab || '';
          
          // Cargar los detalles desde la respuesta
          if (resp.data.kardex_det && Array.isArray(resp.data.kardex_det)) {
            this.kardexDetList = resp.data.kardex_det;
          } else {
            this.kardexDetList = [];
          }
          
          this.loading = false;
        } else {
          this.loading = false;
          toastr.error('Error', 'No se pudo cargar la información del Kardex');
          this._router.navigate(['/kardex']);
        }
      },
      error: (err) => {
        this.loading = false;
        toastr.error('Error', `${err} - No se pudo cargar la información del Kardex`);
        this._router.navigate(['/kardex']);
      },
    });
  }


  /**
   * Obtiene la fecha actual en formato YYYY-MM-DD
   */
  private obtenerFechaActual(): string {
    const ahora = new Date();
    return ahora.toISOString().split('T')[0];
  }

  /**
   * Obtiene la hora actual en formato HH:mm
   */
  private obtenerHoraActual(): string {
    const ahora = new Date();
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  }

  /**
   * Abre el modal para crear un nuevo detalle
   */
  nuevoDetalle(): void {
    if (this.accionVer) {
      toastr.warning('Advertencia', 'No tiene permisos para crear registros en modo solo lectura');
      return;
    }

    this.opcionDet = 'I';
    this.kardexDetBody = this.inicializarKardexDet();
    
    // Asegurar que los valores estén correctamente inicializados
    this.kardexDetBody.fk_kardexcab = this.idNum;
    this.kardexDetBody.medico_usu_id_fk = this._loginService.getUserLocalStorage()?.pk_usuario || 0;
    
    // Establecer fecha y hora actual automáticamente
    this.kardexDetBody.fecha_kardexdet = this.obtenerFechaActual();
    this.kardexDetBody.hora_kardexdet = this.obtenerHoraActual();
    
    this.kardexDetBody.administrado_kardexdet = false;
    
    $('#kardexDetModal').modal('show');
  }

  /**
   * Abre el modal para editar un detalle existente
   */
  editarDetalle(item: any): void {
    if (this.accionVer) {
      toastr.warning('Advertencia', 'No tiene permisos para editar registros en modo solo lectura');
      return;
    }

    this.opcionDet = 'U';
    this.loadingDetalle = false;
    
    // Cargar los datos directamente del item de la tabla
    this.kardexDetBody = {
      pk_kardexdet: item.pk_kardexdet,
      fecha_creacion_kardexdet: item.fecha_creacion_kardexdet || null,
      fecha_modificacion_kardexdet: item.fecha_modificacion_kardexdet || null,
      fk_kardexcab: item.fk_kardexcab || this.idNum,
      medico_usu_id_fk: item.medico_usu_id_fk || this._loginService.getUserLocalStorage()?.pk_usuario || 0,
      fecha_kardexdet: item.fecha_kardexdet || '',
      hora_kardexdet: item.hora_kardexdet || '',
      administrado_kardexdet: item.administrado_kardexdet !== undefined ? item.administrado_kardexdet : false,
    };
    
    $('#kardexDetModal').modal('show');
  }

  /**
   * Marca un detalle como administrado
   */
  marcarAdministrado(item: any): void {
    if (this.accionVer) {
      toastr.warning('Advertencia', 'No tiene permisos para modificar registros en modo solo lectura');
      return;
    }

    Swal.fire({
      html: `
        <p style="font-size:20px;font-weight:bold;">
          ¿Está seguro que desea marcar como administrado este medicamento?
        </p>
        <p style="font-size:14px;">
          Fecha: ${item.fecha_kardexdet} - Hora: ${item.hora_kardexdet}
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
        item.administrado_kardexdet = true;
        item.medico_usu_id_fk = this._loginService.getUserLocalStorage()?.pk_usuario;
        this.guardarEstadoAdministrado(item);
      }
    });
  }

  /**
   * Marca un detalle como no administrado
   */
  marcarNoAdministrado(item: any): void {
    if (this.accionVer) {
      toastr.warning('Advertencia', 'No tiene permisos para modificar registros en modo solo lectura');
      return;
    }

    Swal.fire({
      html: `
        <p style="font-size:20px;font-weight:bold;">
          ¿Está seguro que desea marcar como NO administrado este medicamento?
        </p>
        <p style="font-size:14px;">
          Fecha: ${item.fecha_kardexdet} - Hora: ${item.hora_kardexdet}
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
        item.administrado_kardexdet = false;
        item.medico_usu_id_fk = this._loginService.getUserLocalStorage()?.pk_usuario;
        this.guardarEstadoAdministrado(item);
      }
    });
  }

  /**
   * Guarda el estado de administrado del detalle
   */
  private guardarEstadoAdministrado(item: any): void {
    // Preparar el objeto para guardar
    const detalleBody: KardexDet = {
      pk_kardexdet: item.pk_kardexdet,
      fecha_creacion_kardexdet: item.fecha_creacion_kardexdet || null,
      fecha_modificacion_kardexdet: item.fecha_modificacion_kardexdet || null,
      fk_kardexcab: item.fk_kardexcab || this.idNum,
      medico_usu_id_fk: this._loginService.getUserLocalStorage()?.pk_usuario || item.medico_usu_id_fk,
      fecha_kardexdet: item.fecha_kardexdet,
      hora_kardexdet: item.hora_kardexdet,
      administrado_kardexdet: item.administrado_kardexdet,
    };

    this._kardexService.guardarKardexDetalle(detalleBody, 'U').subscribe({
      next: (resp: any) => {
        if (resp.status && resp.status === 'ok') {
          toastr.success('Éxito', 'Estado de administración actualizado correctamente');
          
          // Recargar la información
          this.cargarKardexCabecera(this.idNum);
        } else {
          toastr.error('Error', 'Problema al actualizar el estado de administración');
        }
      },
      error: (err) => {
        toastr.error('Error', `${err} - Problema al actualizar el estado de administración`);
      },
    });
  }

  /**
   * Valida que los campos obligatorios estén completos
   */
  validarGuardarDetalle(): boolean {
    if (!this.kardexDetBody) return false;

    // Validar que fecha y hora no estén vacíos (estos son los únicos campos que el usuario debe llenar)
    if (!this.kardexDetBody.fecha_kardexdet || this.kardexDetBody.fecha_kardexdet.trim() === '') return false;
    if (!this.kardexDetBody.hora_kardexdet || this.kardexDetBody.hora_kardexdet.trim() === '') return false;

    // Validar que idNum esté definido (debe estar porque ya cargamos la cabecera)
    if (!this.idNum || this.idNum === 0) return false;

    return true;
  }

  /**
   * Guarda o actualiza un detalle de Kardex
   */
  guardarDetalle(): void {
    if (!this.validarGuardarDetalle()) {
      toastr.warning('Advertencia', 'Complete todos los campos obligatorios');
      return;
    }

    Swal.fire({
      title: '¿Está seguro?',
      text:
        this.opcionDet === 'I'
          ? '¿Desea guardar este nuevo registro de administración?'
          : '¿Desea actualizar este registro de administración?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#36c6d3',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.ejecutarGuardadoDetalle();
      }
    });
  }

  /**
   * Ejecuta el guardado del detalle
   */
  private ejecutarGuardadoDetalle(): void {
    // Asegurar que los IDs estén actualizados
    this.kardexDetBody.fk_kardexcab = this.idNum;
    this.kardexDetBody.medico_usu_id_fk =
      this._loginService.getUserLocalStorage()?.pk_usuario ||
      this.kardexDetBody.medico_usu_id_fk;

    this._kardexService.guardarKardexDetalle(this.kardexDetBody, this.opcionDet).subscribe({
      next: (resp: any) => {
        if (resp.status && resp.status === 'ok') {
          toastr.success('Éxito', 'Registro guardado correctamente');
          $('#kardexDetModal').modal('hide');
          this.kardexDetBody = this.inicializarKardexDet();

          // Recargar la información
          this.cargarKardexCabecera(this.idNum);
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
   * Regresa a la lista de Kardex
   */
  volver(): void {
    this._router.navigate(['/kardex']);
  }
}
