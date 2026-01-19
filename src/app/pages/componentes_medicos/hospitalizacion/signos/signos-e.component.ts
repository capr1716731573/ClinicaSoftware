import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SignosVitalesE } from './signos.interface';
import { SignosService } from '../../../../services/hospitalizacion/signos/signos.service';
import { LoginService } from '../../../../services/login.service';
import Swal from 'sweetalert2';
import { CasasSaludService } from '../../../../services/casas_salud/casas_salud.service';
import { SkeletonTableComponent } from '../../../../componentes_reutilizables/skeleton/skeleton-table.component';
import { SkeletonCrudComponent } from '../../../../componentes_reutilizables/skeleton/skeleton-crud.component';
import { environment } from '../../../../../environments/environment';

declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-signos-e',
  imports: [
    CommonModule,
    FormsModule,
    SkeletonTableComponent,
    SkeletonCrudComponent
  ],
  templateUrl: './signos-e.component.html',
  styles: ``
})
export class SignosEComponent {
  private _signosService = inject(SignosService);
  private _loginService = inject(LoginService);
  private _casaSaludService = inject(CasasSaludService);

  listSignosE: any[] = [];
  signoBody: SignosVitalesE = this.inicializarSigno();
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
    this.getAllSignosE();
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
   * Inicializa un nuevo objeto SignosVitalesE con valores por defecto
   */
  inicializarSigno(): SignosVitalesE {
    return {
      pk_sigvita_e: 0,
      fecha_creacion_sigvita_e: null,
      fecha_modificacion_sigvita_e: null,
      fecha_sigvita_e: null,
      hora_sigvita_e: null,
      casalud_id_fk: this.datos_hcu?.casalud_id_fk || 0,
      fk_hcu: this.datos_hcu?.fk_hcu || 0,
      medico_usu_id_fk: this._loginService.getUserLocalStorage()?.pk_usuario || 0,
      aseo_sigvita_e: null,
      bano_sigvita_e: null,
      reposo_sigvita_e: null,
      posicion_sigvita_e: null,
      otros_sigvita_e: null
    };
  }

  /**
   * Obtiene todos los signos vitales E del paciente
   */
  getAllSignosE(): void {
    if (!this.datos_hcu || !this.datos_hcu.fk_hcu) {
      toastr.error('Error', 'No se encontraron datos del paciente');
      return;
    }

    this.loading = true;
    this._signosService.getAllSignos(this.desde, this.datos_hcu.fk_hcu, 'E').subscribe({
      next: (resp: any) => {
        if (resp.status === 'ok') {
          this.listSignosE = resp.data || [];
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
          text: `Signos Vitales E (getAllSignos) - ${err.message}`,
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
      this.getFechasSignosE();
      return;
    }

    if (!hasDesde && !hasHasta) {
      this.getAllSignosE();
      return;
    }
  }

  /**
   * Obtiene signos vitales filtrados por fechas
   */
  getFechasSignosE(): void {
    if (!this.datos_hcu || !this.datos_hcu.fk_hcu) {
      toastr.error('Error', 'No se encontraron datos del paciente');
      return;
    }

    const fecha1 = this.formatFecha(this.fecha_desde);
    const fecha2 = this.formatFecha(this.fecha_hasta);

    this.loading = true;
    this._signosService.getFechasSignos(this.datos_hcu.fk_hcu, fecha1, fecha2, 'E').subscribe({
      next: (resp: any) => {
        if (resp.status === 'ok') {
          this.listSignosE = resp.data || [];
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
          text: `Signos Vitales E (getFechasSignos) - ${err.message}`,
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
    this.getAllSignosE();
  }

  /**
   * Retrocede a la página anterior
   */
  retroceder(): void {
    this.desde -= this.intervalo;
    this.numeracion -= 1;
    this.getAllSignosE();
  }

  /**
   * Abre el modal para crear un nuevo signo vital
   */
  nuevoSigno(): void {
    this.opcion = 'I';
    this.signoBody = this.inicializarSigno();
    $('#signosEModal').modal('show');
  }

  /**
   * Abre el modal para editar un signo vital existente
   */
  editarSigno(id: number): void {
    this.opcion = 'U';
    this.loadingEdit = true;
    $('#signosEModal').modal('show');
    
    this._signosService.getSignosID(id, 1, 'e').subscribe({
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
      fecha_creacion_sigvita_e: item.fecha_creacion_sigvita_e || null,
      fecha_modificacion_sigvita_e: item.fecha_modificacion_sigvita_e || null
    };
    
    // Esperar un momento para que Angular actualice la vista
    setTimeout(() => {
      const modal = $('#auditoriaModalSignosE');
      if (modal && modal.length > 0) {
        modal.modal('show');
      } else {
        console.error('No se encontró el modal con ID: auditoriaModalSignosE');
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
   * Valida que los campos obligatorios estén completos
   */
  validarGuardar(): boolean {
    if (!this.signoBody) return false;

    // Campos obligatorios
    const camposObligatorios = [
      this.signoBody.fk_hcu,
      this.signoBody.medico_usu_id_fk,
      this.signoBody.aseo_sigvita_e
    ];

    // Verifica que ningún campo obligatorio sea null, undefined o vacío
    return camposObligatorios.every(campo => 
      campo !== null && campo !== undefined && campo !== '' && campo !== 0
    );
  }

  /**
   * Guarda o actualiza un signo vital
   */
  guardarSigno(): void {
    if (!this.validarGuardar()) {
      toastr.warning('Advertencia', 'Complete todos los campos obligatorios');
      return;
    }

    // Asegurar que todos los campos string estén en mayúsculas
    if (this.signoBody.aseo_sigvita_e) {
      this.signoBody.aseo_sigvita_e = this.signoBody.aseo_sigvita_e.toUpperCase();
    }
    if (this.signoBody.bano_sigvita_e) {
      this.signoBody.bano_sigvita_e = this.signoBody.bano_sigvita_e.toUpperCase();
    }
    // reposo_sigvita_e y posicion_sigvita_e son selects, no necesitan conversión
    if (this.signoBody.otros_sigvita_e) {
      this.signoBody.otros_sigvita_e = this.signoBody.otros_sigvita_e.toUpperCase();
    }

    // Mensaje de confirmación con SweetAlert2
    Swal.fire({
      title: '¿Está seguro?',
      text: this.opcion === 'I' 
        ? '¿Desea guardar este nuevo registro de Cuidados y Actividades?' 
        : '¿Desea actualizar este registro de Cuidados y Actividades?',
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

    this._signosService.guardarSignos(this.signoBody, this.opcion, 'E').subscribe({
      next: (resp: any) => {
        if (resp.status && resp.status === 'ok') {
          toastr.success('Éxito', 'Registro guardado correctamente');
          $('#signosEModal').modal('hide');
          
          // Recargar la lista
          if (this.fecha_desde && this.fecha_hasta) {
            this.getFechasSignosE();
          } else {
            this.getAllSignosE();
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
