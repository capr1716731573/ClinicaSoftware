import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { MenuHospitalizacionComponent } from '../../../../componentes_reutilizables/menu_izq/menu.component';
import { SkeletonTableComponent } from '../../../../componentes_reutilizables/skeleton/skeleton-table.component';
import { AnexosService } from '../../../../services/hospitalizacion/anexos/anexos.services';
import { LoginService } from '../../../../services/login.service';
import { HistoriaClinicaService } from '../../../../services/historia_clinica/historia_clinica.service';
import { environment } from '../../../../../environments/environment';
declare const $: any;

interface AnexoRow {
  pk_anexos: number;
  fk_hcu: number;
  pk_usuario?: number;
  ruta_anexos: string;
  fecha_creacion_anexos: any;
  fecha_modificacion_anexos: any;
  tabla_anexos: string | null;
  id_tabla_anexos: number | null;
}

interface AnexoPayload {
  pk_anexos?: number;
  fk_hcu: number;
  pk_usuario?: number;
  ruta_anexos?: string;
  fecha_creacion_anexos?: any;
  fecha_modificacion_anexos?: any;
  tabla_anexos?: string | null;
  id_tabla_anexos?: number | null;
}

@Component({
  selector: 'app-anexos',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MenuHospitalizacionComponent,
    SkeletonTableComponent,
  ],
  templateUrl: './anexos.component.html',
  styles: ``,
})
export class AnexosComponent {
  private _route = inject(ActivatedRoute);
  private _anexosService = inject(AnexosService);
  private _loginService = inject(LoginService);
  private _historiaClinicaService = inject(HistoriaClinicaService);

  listAnexos: AnexoRow[] = [];
  loading = false;

  desde = 0;
  numeracion = 1;
  intervalo = environment.filas;
  count = 0;

  fkHcu = 0;
  hcuParam = 0;
  showMenu = false;
  pacienteInfo: any = null;
  headerLoading = true;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  nuevoAnexo: AnexoPayload = {
    fk_hcu: 0,
    tabla_anexos: null,
    id_tabla_anexos: null,
  };
  selectedFile: File | null = null;
  saving = false;

  auditoriaData: any = null;

  constructor() {
    this.validarHcuRuta();
  }

  private validarHcuRuta() {
    this._route.paramMap.subscribe((pm) => {
      this.hcuParam = Number(pm.get('hcu') ?? 0);
      const hcuLocal = this._loginService.getHcuLocalStorage();
      this.headerLoading = true;

      if (hcuLocal && Number(hcuLocal.fk_hcu) === this.hcuParam) {
        this.showMenu = true;
        this.pacienteInfo = hcuLocal;
        this.fkHcu = this.hcuParam;
        this.headerLoading = false;
        this.resetPaginacion();
        this.getAllAnexos();
        return;
      }

      // No coincide o no existe: buscar datos del paciente
      this.showMenu = false;
      this.pacienteInfo = null;
      this.fkHcu = this.hcuParam || 0;
      this.cargarPacienteDesdeService();
    });
  }

  private cargarPacienteDesdeService() {
    if (!this.hcuParam) {
      this.headerLoading = false;
      this.listAnexos = [];
      this.count = 0;
      return;
    }

    this._historiaClinicaService
      .getAllHistoriaClinicaId(this.hcuParam, 1)
      .subscribe({
        next: (resp: any) => {
          this.headerLoading = false;
          if (resp?.data) {
            this.pacienteInfo = resp.data;
            this.fkHcu = resp.data.pk_hcu || this.hcuParam;
            this.resetPaginacion();
            this.getAllAnexos();
          } else {
            this.pacienteInfo = null;
            this.listAnexos = [];
            this.count = 0;
            Swal.fire({
              title: 'No encontrado',
              text: 'No se encontró información de la Historia Clínica.',
              icon: 'warning',
              confirmButtonText: 'Aceptar',
            });
          }
        },
        error: (err) => {
          this.headerLoading = false;
          Swal.fire({
            title: 'Error',
            text: err?.message || 'No se pudo obtener la Historia Clínica.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  getAllAnexos() {
    if (!this.fkHcu) {
      this.listAnexos = [];
      this.count = 0;
      return;
    }

    this.loading = true;
    this._anexosService.getAllAnexos(this.desde, this.fkHcu).subscribe({
      next: (resp: any) => {
        if (resp?.status === 'ok') {
          this.listAnexos = resp.rows || [];
          this.count = resp.count || this.listAnexos.length;
        } else {
          this.listAnexos = [];
          this.count = 0;
        }
        this.loading = false;
      },
      error: (err) => {
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Anexos - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
        this.loading = false;
      },
    });
  }

  avanzar() {
    if (this.listAnexos.length < this.intervalo) {
      return;
    }
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getAllAnexos();
  }

  puedeAvanzar(): boolean {
    return this.listAnexos.length >= this.intervalo;
  }

  retroceder() {
    if (this.desde > 0) {
      this.desde -= this.intervalo;
      this.numeracion -= 1;
      this.getAllAnexos();
    }
  }

  abrirModalNuevo() {
    this.nuevoAnexo = {
      fk_hcu: this.fkHcu,
      tabla_anexos: null,
      id_tabla_anexos: null,
    };
    this.selectedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    $('#modalNuevoAnexo').modal('show');
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] || null;
    this.selectedFile = file;
  }

  async guardarNuevoAnexo() {
    if (!this.selectedFile) {
      Swal.fire({
        title: 'Archivo requerido',
        text: 'Seleccione un archivo para continuar.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    if (!this.fkHcu) {
      Swal.fire({
        title: 'HCU requerido',
        text: 'No se encontró un HCU válido para registrar el anexo.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    this.saving = true;
    const payload: AnexoPayload = {
      ...this.nuevoAnexo,
      fk_hcu: this.fkHcu,
      tabla_anexos: null,
      id_tabla_anexos: null,
      pk_usuario: this._loginService.getUserLocalStorage()?.pk_usuario ?? undefined,
    };

    try {
      const resp = await this._anexosService.subirAnexo(
        this.selectedFile,
        payload
      );

      if (resp) {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Anexo registrado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });
        $('#modalNuevoAnexo').modal('hide');
        this.resetPaginacion();
        this.getAllAnexos();
      } else {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo registrar el anexo.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      }
    } catch (error: any) {
      Swal.fire({
        title: 'Error',
        text: error?.message || 'No se pudo registrar el anexo.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
    } finally {
      this.saving = false;
    }
  }

  verArchivo(item: AnexoRow) {
    const url = this._anexosService.verAnexo(item.ruta_anexos);
    if (!url) {
      Swal.fire({
        title: 'Ruta inválida',
        text: 'No se encontró la ruta del archivo.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
      });
      return;
    }
    window.open(url, '_blank');
  }

  eliminarAnexo(item: AnexoRow) {
    Swal.fire({
      title: '¿Eliminar anexo?',
      text: `Se eliminará el anexo ${this.getNombreArchivo(item.ruta_anexos)}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._anexosService
          .crudAnexos(item, 'D')
          .subscribe({
            next: (resp: any) => {
              if (resp?.status === 'ok') {
                Swal.fire({
                  title: 'Eliminado',
                  text: 'Anexo eliminado correctamente.',
                  icon: 'success',
                  confirmButtonText: 'Aceptar',
                });
                this.resetPaginacion();
                this.getAllAnexos();
              } else {
                Swal.fire({
                  title: 'Error',
                  text: resp?.message || 'No se pudo eliminar el anexo.',
                  icon: 'error',
                  confirmButtonText: 'Aceptar',
                });
              }
            },
            error: (err) => {
              Swal.fire({
                title: 'Error',
                text: err?.message || 'No se pudo eliminar el anexo.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
              });
            },
          });
      }
    });
  }

  verAuditoria(item: AnexoRow) {
    this.auditoriaData = item?.fecha_creacion_anexos || null;
    $('#auditoriaAnexoModal').modal('show');
  }

  getNombreArchivo(ruta: string): string {
    if (!ruta) return '';
    const partes = ruta.split('/');
    return partes[partes.length - 1] || ruta;
  }

  private resetPaginacion() {
    this.desde = 0;
    this.numeracion = 1;
  }
}
