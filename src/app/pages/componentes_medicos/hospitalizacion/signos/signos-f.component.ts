import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SignosVitalesF } from './signos.interface';
import { SignosService } from '../../../../services/hospitalizacion/signos/signos.service';
import { LoginService } from '../../../../services/login.service';
import { environment } from '../../../../../enviroments/enviroments';
import Swal from 'sweetalert2';
import { CasasSaludService } from '../../../../services/casas_salud/casas_salud.service';
import { SkeletonTableComponent } from '../../../../componentes_reutilizables/skeleton/skeleton-table.component';
import { SkeletonCrudComponent } from '../../../../componentes_reutilizables/skeleton/skeleton-crud.component';

declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-signos-f',
  imports: [
    CommonModule,
    FormsModule,
    SkeletonTableComponent,
    SkeletonCrudComponent
  ],
  templateUrl: './signos-f.component.html',
  styles: ``
})
export class SignosFComponent {
  private _signosService = inject(SignosService);
  private _loginService = inject(LoginService);
  private _casaSaludService = inject(CasasSaludService);

  listSignosF: any[] = [];
  signoBody: SignosVitalesF = this.inicializarSigno();
  auditoriaData: any = null;
  casaSaludBody: any = {};
  datos_hcu: any;
  
  // Variables de loading
  loading: boolean = true;
  loadingEdit: boolean = false;
  
  opcion: string = 'I'; // 'I' para Insert, 'U' para Update
  desde: number = 0;
  intervalo = environment.filas;
  numeracion: number = 1;
  ant: boolean = false;
  sig: boolean = false;
  
  fecha_desde: Date | null = null;
  fecha_hasta: Date | null = null;

  constructor() {
    this.datos_hcu = this._loginService.getHcuLocalStorage();
    this.getAllSignosF();
    this.getCasaSalud();
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

  /**
   * Inicializa un nuevo objeto SignosVitalesF con valores por defecto
   */
  inicializarSigno(): SignosVitalesF {
    return {
      pk_sigvita_f: 0,
      fecha_creacion_sigvita_f: null,
      fecha_modificacion_sigvita_f: null,
      fecha_sigvita_f: null,
      hora_sigvita_f: null,
      casalud_id_fk: this.datos_hcu?.casalud_id_fk || 0,
      fk_hcu: this.datos_hcu?.fk_hcu || 0,
      medico_usu_id_fk: this._loginService.getUserLocalStorage()?.pk_usuario || 0,
      viacentral_sigvita_f: null,
      viaperiferica_sigvita_f: null,
      sondanaso_sigvita_f: null,
      sondavesi_sigvita_f: null,
      otros_sigvita_f: null
    };
  }

  /**
   * Obtiene todos los signos vitales F del paciente
   */
  getAllSignosF(): void {
    if (!this.datos_hcu || !this.datos_hcu.fk_hcu) {
      toastr.error('Error', 'No se encontraron datos del paciente');
      return;
    }

    this.loading = true;
    this._signosService.getAllSignos(this.desde, this.datos_hcu.fk_hcu, 'F').subscribe({
      next: (resp: any) => {
        if (resp.status === 'ok') {
          this.listSignosF = resp.data || [];
          this.numeracion = resp.paginacion?.pag || 1;
          this.ant = resp.paginacion?.ant || false;
          this.sig = resp.paginacion?.sig || false;
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Signos Vitales F (getAllSignos) - ${err.message}`,
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  /**
   * Filtra signos vitales por rango de fechas
   */
  filtroFechas(): void {
    const desdeVal = this.fecha_desde ? this.formatFecha(this.fecha_desde) : '';
    const hastaVal = this.fecha_hasta ? this.formatFecha(this.fecha_hasta) : '';

    const hasDesde = desdeVal !== '';
    const hasHasta = hastaVal !== '';

    if (hasDesde && hasHasta) {
      if (new Date(desdeVal) > new Date(hastaVal)) {
        toastr.warning('Advertencia', 'Fecha "Desde" es mayor que "Hasta"');
        return;
      }
      this.getFechasSignosF();
      return;
    }

    if (!hasDesde && !hasHasta) {
      this.getAllSignosF();
      return;
    }
  }

  /**
   * Obtiene signos vitales filtrados por fechas
   */
  getFechasSignosF(): void {
    if (!this.datos_hcu || !this.datos_hcu.fk_hcu) {
      toastr.error('Error', 'No se encontraron datos del paciente');
      return;
    }

    const fecha1 = this.formatFecha(this.fecha_desde);
    const fecha2 = this.formatFecha(this.fecha_hasta);

    this.loading = true;
    this._signosService.getFechasSignos(this.datos_hcu.fk_hcu, fecha1, fecha2, 'F').subscribe({
      next: (resp: any) => {
        if (resp.status === 'ok') {
          this.listSignosF = resp.data || [];
          this.desde = 0;
          this.numeracion = 1;
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Signos Vitales F (getFechasSignos) - ${err.message}`,
          confirmButtonText: 'Aceptar'
        });
      }
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
  avanzar(): void {
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getAllSignosF();
  }

  /**
   * Retrocede a la página anterior
   */
  retroceder(): void {
    this.desde -= this.intervalo;
    this.numeracion -= 1;
    this.getAllSignosF();
  }

  /**
   * Abre el modal para crear un nuevo signo vital
   */
  nuevoSigno(): void {
    this.opcion = 'I';
    this.signoBody = this.inicializarSigno();
    $('#signosFModal').modal('show');
  }

  /**
   * Abre el modal para editar un signo vital existente
   */
  editarSigno(id: number): void {
    this.opcion = 'U';
    this.loadingEdit = true;
    $('#signosFModal').modal('show');
    
    this._signosService.getSignosID(id, 1, 'f').subscribe({
      next: (resp: any) => {
        if (resp.status === 'ok' && resp.data) {
          this.signoBody = resp.data;
          this.loadingEdit = false;
        }
      },
      error: (err) => {
        this.loadingEdit = false;
        toastr.error('Error', `${err} - No se pudieron cargar los datos del registro ${id}`);
      }
    });
  }

  /**
   * Abre el modal de auditoría con la información de creación y modificación
   */
  verAuditoria(item: any): void {
    this.auditoriaData = {
      fecha_creacion_sigvita_f: item.fecha_creacion_sigvita_f || null,
      fecha_modificacion_sigvita_f: item.fecha_modificacion_sigvita_f || null
    };
    
    // Esperar un momento para que Angular actualice la vista
    setTimeout(() => {
      const modal = $('#auditoriaModalSignosF');
      if (modal && modal.length > 0) {
        modal.modal('show');
      } else {
        console.error('No se encontró el modal con ID: auditoriaModalSignosF');
      }
    }, 0);
  }

  /**
   * Convierte el texto a mayúsculas (para campos string)
   */
  convertirAMayusculas(campo: string, event: any): void {
    if (event && event.target && event.target.value) {
      const valorMayusculas = event.target.value.toUpperCase();
      event.target.value = valorMayusculas;
      (this.signoBody as any)[campo] = valorMayusculas;
    }
  }

  /**
   * Valida que los campos básicos estén completos (ningún campo es obligatorio según requerimientos)
   */
  validarGuardar(): boolean {
    if (!this.signoBody) return false;

    // Solo validar que existan los IDs básicos
    return this.signoBody.fk_hcu !== null && 
           this.signoBody.fk_hcu !== undefined && 
           this.signoBody.fk_hcu !== 0 &&
           this.signoBody.medico_usu_id_fk !== null && 
           this.signoBody.medico_usu_id_fk !== undefined && 
           this.signoBody.medico_usu_id_fk !== 0;
  }

  /**
   * Guarda o actualiza un signo vital
   */
  guardarSigno(): void {
    if (!this.validarGuardar()) {
      toastr.warning('Advertencia', 'Complete los campos básicos');
      return;
    }

    // Asegurar que todos los campos string estén en mayúsculas
    if (this.signoBody.otros_sigvita_f) {
      this.signoBody.otros_sigvita_f = this.signoBody.otros_sigvita_f.toUpperCase();
    }

    // Mensaje de confirmación con SweetAlert2
    Swal.fire({
      title: '¿Está seguro?',
      text: this.opcion === 'I' 
        ? '¿Desea guardar este nuevo registro de Dispositivos y Procedimientos?' 
        : '¿Desea actualizar este registro de Dispositivos y Procedimientos?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#36c6d3',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.ejecutarGuardado();
      }
    });
  }

  /**
   * Ejecuta el guardado del signo vital
   */
  private ejecutarGuardado(): void {
    // Asegurar que los IDs estén actualizados
    this.signoBody.casalud_id_fk = this.casaSaludBody?.casalud_id_pk ?? 0
    this.signoBody.fk_hcu = this.datos_hcu?.fk_hcu || this.signoBody.fk_hcu;
    this.signoBody.medico_usu_id_fk = this._loginService.getUserLocalStorage()?.pk_usuario || this.signoBody.medico_usu_id_fk;

    this._signosService.guardarSignos(this.signoBody, this.opcion, 'F').subscribe({
      next: (resp: any) => {
        if (resp.status && resp.status === 'ok') {
          toastr.success('Éxito', 'Registro guardado correctamente');
          $('#signosFModal').modal('hide');
          
          // Recargar la lista
          if (this.fecha_desde && this.fecha_hasta) {
            this.getFechasSignosF();
          } else {
            this.getAllSignosF();
          }
        } else {
          toastr.error('Error', 'Problema al guardar el registro');
        }
      },
      error: (err) => {
        toastr.error('Error', `${err} - Problema al guardar el registro`);
      }
    });
  }
}
