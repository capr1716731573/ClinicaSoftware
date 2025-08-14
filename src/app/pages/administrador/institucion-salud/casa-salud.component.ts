import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { InstitucionService } from '../../../services/casas_salud/instituciones.service';
import { CasasSaludService } from '../../../services/casas_salud/casas_salud.service';
import { GeografiaService } from '../../../services/geografia/geografia.service';
import { environment } from '../../../../enviroments/enviroments';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';

declare var toastr: any;
declare var $: any;

// Fila tal como existe en la BD (incluye PK)
interface CasaSalud {
  casalud_id_pk: number; // serial4 NOT NULL (PK)
  ins_id_fk: number | null; // int8 NULL (FK -> institucion.ins_id_pk)
  fk_geo: number | null; // int8 NULL (FK -> geografia.pk_geo)
  casalud_codigo: string | null; // varchar(25) NULL
  casalud_descripcion: string | null; // varchar(200) NULL
  casalud_principal: boolean; // bool NOT NULL DEFAULT false
  casalud_direccion: string | null; // varchar(300) NULL
  casalud_telefonoconvencional: string | null; // varchar(40) NULL
  casalud_telefonocelular: string | null; // varchar(15) NULL
  casalud_visible: boolean; // bool NOT NULL DEFAULT true
}

@Component({
  standalone: true,
  selector: 'app-casa-salud',
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './casa-salud.component.html',
  styles: ``,
})
export class CasaSaludComponent {
  private _institucionService = inject(InstitucionService);
  private _casaSaludService = inject(CasasSaludService);
  private _geografiaService = inject(GeografiaService);
  listInstitucion: any[] = [];
  listCasasSalud: any[] = [];
  listGeografia: any[] = [];
  idInstitucion: number = null;
  idGeografia: number = null;
  bsqCasaSalud: string = '';
  casaSaludBody: CasaSalud = {
    casalud_id_pk: 0, // serial4 NOT NULL (PK)
    ins_id_fk: 0, // int8 NULL (FK -> institucion.ins_id_pk)
    fk_geo: 0, // int8 NULL (FK -> geografia.pk_geo)
    casalud_codigo: '', // varchar(25) NULL
    casalud_descripcion: '', // varchar(200) NULL
    casalud_principal: false, // bool NOT NULL DEFAULT false
    casalud_direccion: '', // varchar(300) NULL
    casalud_telefonoconvencional: '', // varchar(40) NULL
    casalud_telefonocelular: '', // varchar(15) NULL
    casalud_visible: true, // bool NOT NULL DEFAULT true
  };
  opcion: string = 'I';
  desde: number = 0;
  intervalo = environment.filas;
  numeracion: number = 1;

  constructor() {}

  inicializacion() {
    this.getCasasSalud();
    this.getInstituciones();
    this.getGeografiaTipo();
    this.idInstitucion = null;
    this.idGeografia = null;
    this.listCasasSalud = [];
  }

  getInstituciones() {
    this._institucionService.getAllInstitucion(null).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listInstitucion = resp.rows;
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

  getGeografiaTipo() {
    this._geografiaService.getGeografiaTipo('CIU').subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listGeografia = resp.rows;
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Geografía - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  getCasasSalud() {
    this._casaSaludService.getAllCasaSalud(this.desde).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          console.log(JSON.stringify(this.listCasasSalud));
          this.listCasasSalud = resp.rows;
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Casas Salud - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  getAllCasasSaludBusqueda(bsq: string) {
    this._casaSaludService.getBsqCasaSalud(bsq).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listCasasSalud = resp.rows;
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Casas Salud - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  buscarCasaSalud() {
    if (this.bsqCasaSalud.length >= 4) {
      this.getAllCasasSaludBusqueda(this.bsqCasaSalud);
      // tu lógica aquí
    } else if (this.bsqCasaSalud.length === 0) {
      this.desde = 0;
      this.numeracion = 1;
      this.getCasasSalud();
    }
  }

  nuevoCasasSalud() {
    this.opcion = 'I';
    this.casaSaludBody = {
      casalud_id_pk: 0, // serial4 NOT NULL (PK)
      ins_id_fk: 0, // int8 NULL (FK -> institucion.ins_id_pk)
      fk_geo: 0, // int8 NULL (FK -> geografia.pk_geo)
      casalud_codigo: '', // varchar(25) NULL
      casalud_descripcion: '', // varchar(200) NULL
      casalud_principal: false, // bool NOT NULL DEFAULT false
      casalud_direccion: '', // varchar(300) NULL
      casalud_telefonoconvencional: '', // varchar(40) NULL
      casalud_telefonocelular: '', // varchar(15) NULL
      casalud_visible: true, // bool NOT NULL DEFAULT true
    };
    this.idInstitucion=null;
    this.idGeografia=null;
    // ✅ Abre el modal con jQuery Bootstrap
    $('#casaSaludModal').modal('show');
  }

  avanzar() {
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getCasasSalud();
  }

  retoceder() {
    this.desde -= this.intervalo;
    this.numeracion -= 1;
    this.getCasasSalud();
  }

editarCasaSalud(id_casa: number) {
  this.opcion = 'U';

  this._casaSaludService.getAllCasaSaludId(id_casa).subscribe({
    next: (resp) => {
      const row = Array.isArray(resp.rows) ? resp.rows[0] : resp.rows;

      this.casaSaludBody = row;

      // 🔢 fuerza a number (o null)
      this.idInstitucion = row?.ins_id_fk != null ? Number(row.ins_id_fk) : null;
      this.idGeografia   = row?.fk_geo     != null ? Number(row.fk_geo)     : null;

      /* // 👇 si las listas YA están cargadas, con esto basta
      this.cdr.detectChanges();*/
      $('#casaSaludModal').modal('show'); 
    },
    error: (err) => {
      toastr.error('Error', `${err} - Datos no cargados del id ${id_casa}`);
    },
  });
}

  eliminarCasaSalud(casa: any) {
    Swal.fire({
      title: 'Esta seguro?',
      text: 'Esta acción elimina el registro de Casa de Salud',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._casaSaludService.guardarCasaSalud(casa, 'D').subscribe({
          next: (resp) => {
            if (resp.status && resp.status === 'ok') {
              Swal.fire({
                title: 'Eliminado!',
                text: 'Registro Eliminado.',
                icon: 'success',
              });
              if (this.bsqCasaSalud.length >= 4) {
                this.buscarCasaSalud();
              } else this.getCasasSalud();
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

  guardarCasaSalud() {
    this._casaSaludService
      .guardarCasaSalud(this.casaSaludBody, this.opcion)
      .subscribe({
        next: (resp) => {
          this.opcion = `U`;
          if (resp.status && resp.status === 'ok') {
            this.casaSaludBody = resp.data;
            toastr.success('Éxito', `Registro Guardado`);
            if (this.bsqCasaSalud.length >= 4) {
              this.buscarCasaSalud();
            } else this.getCasasSalud();
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

  validarGuardar() {
    //aqui cargo los id de ngselect
    this.casaSaludBody.fk_geo = this.idGeografia;
    this.casaSaludBody.ins_id_fk = this.idInstitucion;
    if (
      !this.casaSaludBody ||
      !this.casaSaludBody.casalud_codigo ||
      this.casaSaludBody.casalud_codigo === undefined ||
      this.casaSaludBody.casalud_codigo === '' ||
      !this.casaSaludBody.casalud_descripcion ||
      this.casaSaludBody.casalud_descripcion === '' ||
      this.casaSaludBody.casalud_descripcion === undefined ||
      !this.casaSaludBody.fk_geo ||
      this.casaSaludBody.fk_geo === 0 ||
      this.casaSaludBody.fk_geo === undefined ||
      !this.casaSaludBody.ins_id_fk ||
      this.casaSaludBody.ins_id_fk === 0 ||
      this.casaSaludBody.ins_id_fk === undefined ||
      this.casaSaludBody.casalud_visible === undefined ||
      this.casaSaludBody.casalud_principal === undefined
    )
      return false;
    return true;
  }
}
