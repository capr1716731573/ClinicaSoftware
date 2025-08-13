import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InstitucionService } from '../../../services/casas_salud/instituciones.service';
import { environment } from '../../../../enviroments/enviroments';
import Swal from 'sweetalert2';

declare var toastr: any;
declare var $: any;

export interface InstitucionBody {
  ins_id_pk: number;
  ins_codigo: string;
  ins_descripcion: string;
  ins_visible: boolean;
  ins_abreviacion: string;
}

@Component({
  selector: 'app-institucion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './institucion.component.html',
  styles: ``,
})
export class InstitucionComponent {
  private _institucionService = inject(InstitucionService);
  listInstituciones: any[] = [];
  institucionBody: InstitucionBody = {
    ins_id_pk: 0,
    ins_codigo: '',
    ins_descripcion: '',
    ins_visible: true,
    ins_abreviacion: '',
  };
  bsqInstitucion: string = '';
  opcion: string = 'I';
  desde: number = 0;
  intervalo = environment.filas;
  numeracion: number = 1;

  constructor(){
    this.getInstitucion();
  }

  getInstitucion() {
    this._institucionService.getAllInstitucion(this.desde).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listInstituciones = resp.rows;
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Instituciones - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  getAllInstitucionessBusqueda(bsq: string) {
    this._institucionService.getBsqInstitucion(bsq).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          //Validacion para numeracion y parametro desde
          //Si resp.rows sea mayor a 0 se actualiza sino no
          if (resp.rows.length > 0) {
            this.listInstituciones = resp.rows;
          }else{
            this.listInstituciones=[];
          }
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Instituciones - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  buscarInstitucion() {
    if (this.bsqInstitucion.length >= 4) {
      this.getAllInstitucionessBusqueda(this.bsqInstitucion);
      // tu lógica aquí
    } else if (this.bsqInstitucion.length === 0) {
      this.desde = 0;
      this.numeracion = 1;
      this.getInstitucion();
    }
  }

  avanzar() {
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getInstitucion();
  }

  retoceder() {
    this.desde -= this.intervalo;
    this.numeracion -= 1;
    this.getInstitucion();
  }

  nuevoInstitucion() {
    this.opcion = 'I';
    this.institucionBody = {
      ins_id_pk: 0,
      ins_codigo: '',
      ins_descripcion: '',
      ins_visible: true,
      ins_abreviacion: '',
    };
    // ✅ Abre el modal con jQuery Bootstrap
    $('#institucionModal').modal('show');
  }

  editarInstitucion(id_institucion: number) {
    this.opcion = 'U';
    this._institucionService.getAllInstitucionId(id_institucion).subscribe({
      next: (resp) => {
        this.institucionBody = resp.rows;
      },
      error: (err) => {
        // manejo de error
        toastr.error('Error', `${err} - Datos no cargados del id ${id_institucion}`);
      },
    });
  }

  eliminarInstitucion(institucion: any) {
    Swal.fire({
      title: 'Esta seguro?',
      text: 'Esta acción elimina el registro del Institución',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._institucionService
          .guardarInstitucion(institucion, 'D')
          .subscribe({
            next: (resp) => {
              if (resp.status && resp.status === 'ok') {
                Swal.fire({
                  title: 'Eliminado!',
                  text: 'Registro Eliminado.',
                  icon: 'success',
                });
                if (this.bsqInstitucion.length >= 4) {
                  this.buscarInstitucion();
                } else this.getInstitucion();
              } else {
                // manejo de error
                toastr.error('Error', `Problema al eliminar registro`);
              }
            },
            error: (err) => {
              // manejo de error
              toastr.error('Error', `${err} - Problema al eliminar registro 2`);
            },
          });
      }
    });
  }

  validarGuardar() {
     if (
      !this.institucionBody ||
      !this.institucionBody.ins_codigo ||
      this.institucionBody.ins_codigo === undefined ||
      this.institucionBody.ins_codigo === '' ||
      !this.institucionBody.ins_descripcion ||
      this.institucionBody.ins_descripcion === '' ||
      this.institucionBody.ins_descripcion === undefined ||
      this.institucionBody.ins_visible === undefined 
    )
      return false;
    return true;
  }

  guardarInstitucion() {
    this._institucionService
      .guardarInstitucion(this.institucionBody, this.opcion)
      .subscribe({
        next: (resp) => {
          this.opcion = `U`;
          if (resp.status && resp.status === 'ok') {
            this.institucionBody = resp.data;
            toastr.success('Éxito', `Registro Guardado`);
            if (this.bsqInstitucion.length >= 4) {
              this.buscarInstitucion();
            } else this.getInstitucion();
          } else {
            // manejo de error
            toastr.error('Error', `Problema al crear registro`);
          }
        },
        error: (err) => {
          // manejo de error
          toastr.error('Error', `${err} - Problema al crear registro 2`);
        },
      });
  }
}
