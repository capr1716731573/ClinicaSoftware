import { AfterViewInit, Component, inject } from '@angular/core';
import { catchError, forkJoin, Observable, of, switchMap, tap } from 'rxjs';
import { CabeceraDetalleService } from '../../../services/cabecera_detalle/cabecera-detalle.service';
import { GeografiaService } from '../../../services/geografia/geografia.service';
import { Persona } from './persona.interface';
import { CommonModule } from '@angular/common';
import flatpickr from 'flatpickr';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { PersonaService } from '../../../services/persona/persona.service';
import { Router } from '@angular/router';
import { DatepickerComponent } from '../../../componentes_reutilizables/datepicker/datepicker.component';
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-persona',
  imports: [CommonModule, FormsModule, NgSelectComponent ],
  templateUrl: './persona.component.html',
  styles: ``,
})
export class PersonaComponent implements AfterViewInit {
  private _detalleService = inject(CabeceraDetalleService);
  private _geografiaService = inject(GeografiaService);
  private _personaService = inject(PersonaService);
  private _routerService = inject(Router);

  nuevaDiscapacidad = {
    discapacidad: '',
    porcentaje: null,
  };
  //listas y variables de las fk
  ocupacionList: any[] = [];
  id_ocupacion: number = null;
  tipoIdentificacionList: any[] = [];
  id_tipoidentificacion: number = null;
  sexoList: any[] = [];
  id_sexo: number = null;
  nivelacademicoList: any[] = [];
  id_nivelacademico: number = null;
  estadocivilList: any[] = [];
  id_estadocivil: number = null;
  tiposangreList: any[] = [];
  id_tiposangre: number = null;
  estadoeducacionList: any[] = [];
  id_estadoeducacion: number = null;

  //geografia
  paisList: any[] = [];
  id_pais: number = null;
  provinciaList: any[] = [];
  id_provincia: number = null;
  ciudadList: any[] = [];
  id_ciudad: number = null;
  parroquiaList: any[] = [];
  id_parroquia: number = null;

  personaBody: Persona;

  //Esta variable es para ver de donde llama si desde el padre usuario o algun otro
  //igual se inicializa la variable opcion
  componentePadre: string = null;
  opcionPersona: string = null;

  loading: boolean = false;

  constructor() {
    this.inicializacionPersonaBody();
    this.inicializacionPersonaFunciones();
  }
  ngAfterViewInit(): void {
    //Inicializo el formato para los campos fecha
    flatpickr('#fecnac_persona', {
      dateFormat: 'Y-m-d',
      allowInput: false,
      altInput:false
    });
  }

  /*  inicializacionPersonaFunciones(): void {
    this.loading = false;

    forkJoin([
      this.getDetalle$('OCU'),
      this.getDetalle$('TIP_IDE'),
      this.getDetalle$('GEN'),
      this.getDetalle$('NIV_ACA'),
      this.getDetalle$('EST_CIV'),
      this.getDetalle$('TIP_SAN'),
      this.getDetalle$('EST_NIV_EDU'),
      this.cargarGeografiaEncadenada$(),
    ]).subscribe({
      next: () => {
        this.loading = true;
        console.log('✅ Datos cargados completamente');
      },
      error: (err) => {
        this.loading = true; // o false, según lo que prefieras
        console.error('❌ Error al cargar datos:', err);
      },
    });
  }
 */
  //Aqui cargo los fk de persona
  inicializacionPersonaBody() {
    this.personaBody = {
      pk_persona: 0,
      apellidopat_persona: '',
      apellidomat_persona: '',
      nombre_primario_persona: '',
      nombre_secundario_persona: '',
      correo_persona: '',
      telefono_persona: '',
      celular_persona: '',
      fecnac_persona: '',
      fk_ocupacion: null,
      detalle_profesion_persona: '',
      fk_tipoidentificacion: null,
      numidentificacion_persona: '',
      fk_sexo: null,
      fk_nivelacademico: null,
      fk_estadocivil: null,
      fk_pais: null,
      fk_provincia: null,
      fk_canton: null,
      fk_parroquia: null,
      discapacidad_persona: false,
      lista_discapacidades: [],
      fk_tipo_sangre: null,
      fk_estado_educacion: null,
      barrio_persona: '',
    };
  }

  inicializacionPersonaFunciones() {
    //Cargos las listas
    this.getDetalle('OCU');
    this.getDetalle('TIP_IDE');
    this.getDetalle('GEN');
    this.getDetalle('NIV_ACA');
    this.getDetalle('EST_CIV');
    this.getDetalle('TIP_SAN');
    this.getDetalle('EST_NIV_EDU');
    //Cargar Geografias
    this.cargarGeografiaEncadenada();
  }

  //Set y get de variables para interactuar desde los padres

  getPersonaId(id_persona: number) {
    this._personaService.getAllPersonaId(1, id_persona).subscribe({
      next: (resp) => {
        if (resp.status === 'ok' && resp.data) {
          this.setDataPersona(resp.data); // Asigna los datos a personaBody o lo que corresponda
          this.setOpcionPersona('U');
          this.inicializacionPersonaFunciones();
        } else {
          Swal.fire({
            title: 'Advertencia',
            text: 'No se encontró información de la persona.',
            icon: 'warning',
            confirmButtonText: 'Aceptar',
          });
        }
      },
      error: (err) => {
        // Este bloque normalmente no se ejecuta porque el catchError del servicio ya captura el error.
        console.error('Error al obtener persona:', err);
      },
    });
  }

  setDataPersona(persona: any) {
    this.personaBody = persona;
  }

  getDataPersona() {
    this.idSelectAPersonaBody();
    return this.personaBody;
  }

  setComponentePadre(padre: string) {
    this.componentePadre = padre;
  }

  getComponentePadre() {
    return this.componentePadre;
  }

  setOpcionPersona(opcion: string) {
    this.opcionPersona = opcion;
  }

  getOpcionPersona() {
    return this.opcionPersona;
  }

  /* getDetalle$(codigo: string): Observable<any> {
    return this._detalleService.getAllCabecerasDetalle2(codigo, true).pipe(
      tap((resp) => {
        if (resp.status === 'ok') {
          switch (codigo) {
            case 'OCU':
              this.ocupacionList = resp.rows;
              this.id_ocupacion = this.personaBody.fk_ocupacion ?? null;
              break;
            case 'TIP_IDE':
              this.tipoIdentificacionList = resp.rows;
              this.id_tipoidentificacion =
                this.personaBody.fk_tipoidentificacion ?? null;
              break;
            case 'GEN':
              this.sexoList = resp.rows;
              this.id_sexo = this.personaBody.fk_sexo ?? null;
              break;
            case 'NIV_ACA':
              this.nivelacademicoList = resp.rows;
              this.id_nivelacademico = this.personaBody.fk_nivelacademico ?? null;
              break;
            case 'EST_CIV':
              this.estadocivilList = resp.rows;
              this.id_estadocivil = this.personaBody.fk_estadocivil ?? null;
              break;
            case 'TIP_SAN':
              this.tiposangreList = resp.rows;
              this.id_tiposangre = this.personaBody.fk_tipo_sangre ?? null;
              break;
            case 'EST_NIV_EDU':
              this.estadoeducacionList = resp.rows;
              this.id_estadoeducacion =
                this.personaBody.fk_estado_educacion ?? null;
              break;
          }
        }
      }),
      catchError((err) => {
        Swal.fire('¡Error!', `Lista - ${codigo} - ${err.message}`, 'error');
        return of(null);
      })
    );
  } */

  cargarGeografiaEncadenada$(): Observable<any> {
    return this._geografiaService.getAllGeografia(null, 'P', 0).pipe(
      switchMap((respPaises: any) => {
        if (respPaises.status === 'ok') {
          this.paisList = respPaises.rows;
          if (this.personaBody.fk_pais) {
            this.id_pais = this.personaBody.fk_pais;
            return this._geografiaService.getAllGeografia(
              null,
              'PR',
              this.id_pais
            );
          }
        }
        return of(null);
      }),
      switchMap((respProvincias: any) => {
        if (respProvincias?.status === 'ok') {
          this.provinciaList = respProvincias.rows;
          if (this.personaBody.fk_provincia) {
            this.id_provincia = this.personaBody.fk_provincia;
            return this._geografiaService.getAllGeografia(
              null,
              'CIU',
              this.id_provincia
            );
          }
        }
        return of(null);
      }),
      switchMap((respCiudades: any) => {
        if (respCiudades?.status === 'ok') {
          this.ciudadList = respCiudades.rows;
          if (this.personaBody.fk_canton) {
            this.id_ciudad = this.personaBody.fk_canton;
            return this._geografiaService.getAllGeografia(
              null,
              'PARR',
              this.id_ciudad
            );
          }
        }
        return of(null);
      }),
      tap((respParroquias: any) => {
        if (respParroquias?.status === 'ok') {
          this.parroquiaList = respParroquias.rows;
          if (this.personaBody.fk_parroquia) {
            this.id_parroquia = this.personaBody.fk_parroquia;
          }
        }
      }),
      catchError((err) => {
        Swal.fire(
          '¡Error!',
          `Error al cargar jerarquía geográfica: ${err.message}`,
          'error'
        );
        return of(null);
      })
    );
  }

  clearNgSelect(codigo: string) {
    if (codigo === 'OCU') {
        this.personaBody.fk_ocupacion=null;
        this.id_ocupacion = this.personaBody.fk_ocupacion;
    } else if (codigo === 'TIP_IDE') {
        this.personaBody.fk_tipoidentificacion=null;
        this.id_tipoidentificacion = this.personaBody.fk_tipoidentificacion;
    } else if (codigo === 'GEN') {
        this.personaBody.fk_sexo=null;
        this.id_sexo = this.personaBody.fk_sexo;
    } else if (codigo === 'NIV_ACA') {
        this.personaBody.fk_nivelacademico=null;
        this.id_nivelacademico = this.personaBody.fk_nivelacademico;
    } else if (codigo === 'EST_CIV') {
        this.personaBody.fk_estadocivil=null;
        this.id_estadocivil = this.personaBody.fk_estadocivil;
    } else if (codigo === 'TIP_SAN') {
        this.personaBody.fk_tipo_sangre=null;
        this.id_tiposangre = this.personaBody.fk_tipo_sangre;
    } else if (codigo === 'EST_NIV_EDU') {
        this.personaBody.fk_estado_educacion=null;
        this.id_estadoeducacion = this.personaBody.fk_estado_educacion;
    }
  }

  getDetalle(codigo: string) {
    this._detalleService.getAllCabecerasDetalle2(codigo, true).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          if (codigo === 'OCU') {
            this.ocupacionList = resp.rows;
            if (this.personaBody.fk_ocupacion)
              this.id_ocupacion = this.personaBody.fk_ocupacion;
          } else if (codigo === 'TIP_IDE') {
            this.tipoIdentificacionList = resp.rows;
            if (this.personaBody.fk_tipoidentificacion)
              this.id_tipoidentificacion =
                this.personaBody.fk_tipoidentificacion;
          } else if (codigo === 'GEN') {
            this.sexoList = resp.rows;
            if (this.personaBody.fk_sexo)
              this.id_sexo = this.personaBody.fk_sexo;
          } else if (codigo === 'NIV_ACA') {
            this.nivelacademicoList = resp.rows;
            if (this.personaBody.fk_nivelacademico)
              this.id_nivelacademico = this.personaBody.fk_nivelacademico;
          } else if (codigo === 'EST_CIV') {
            this.estadocivilList = resp.rows;
            if (this.personaBody.fk_estadocivil)
              this.id_estadocivil = this.personaBody.fk_estadocivil;
          } else if (codigo === 'TIP_SAN') {
            this.tiposangreList = resp.rows;
            if (this.personaBody.fk_tipo_sangre)
              this.id_tiposangre = this.personaBody.fk_tipo_sangre;
          } else if (codigo === 'EST_NIV_EDU') {
            this.estadoeducacionList = resp.rows;
            if (this.personaBody.fk_estado_educacion)
              this.id_estadoeducacion = this.personaBody.fk_estado_educacion;
          }
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Lista - ${codigo} - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  //Seccion Geografia
  cargarGeografiaEncadenada() {
    this._geografiaService
      .getAllGeografia(null, 'P', 0)
      .pipe(
        switchMap((respPaises: any) => {
          if (respPaises.status === 'ok') {
            this.paisList = respPaises.rows;
            if (this.personaBody.fk_pais) {
              this.id_pais = this.personaBody.fk_pais;
              return this._geografiaService.getAllGeografia(
                null,
                'PR',
                this.id_pais
              );
            }
          }
          return of(null); // Detiene la cadena si no hay id_pais
        }),
        switchMap((respProvincias: any) => {
          if (respProvincias?.status === 'ok') {
            this.provinciaList = respProvincias.rows;
            if (this.personaBody.fk_provincia) {
              this.id_provincia = this.personaBody.fk_provincia;
              return this._geografiaService.getAllGeografia(
                null,
                'CIU',
                this.id_provincia
              );
            }
          }
          return of(null); // Detiene si no hay id_provincia
        }),
        switchMap((respCiudades: any) => {
          if (respCiudades?.status === 'ok') {
            this.ciudadList = respCiudades.rows;
            if (this.personaBody.fk_canton) {
              this.id_ciudad = this.personaBody.fk_canton;
              return this._geografiaService.getAllGeografia(
                null,
                'PARR',
                this.id_ciudad
              );
            }
          }
          return of(null); // Detiene si no hay id_ciudad
        })
      )
      .subscribe({
        next: (respParroquias: any) => {
          if (respParroquias?.status === 'ok') {
            this.parroquiaList = respParroquias.rows;
            if (this.personaBody.fk_parroquia) {
              this.id_parroquia = this.personaBody.fk_parroquia;
            }
          }
        },
        error: (err) => {
          Swal.fire({
            title: '¡Error!',
            icon: 'error',
            text: `Error al cargar jerarquía geográfica: ${err.message}`,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  getGeografiaPaises() {
    this._geografiaService.getAllGeografia(null, 'P', 0).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.paisList = resp.rows;
          if (this.personaBody.fk_pais != null && this.personaBody.fk_pais)
            this.id_pais = this.personaBody.fk_pais;
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Paises - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  getGeografiaProvincias() {
    this.provinciaList = [];
    this.id_provincia = null;
    this.personaBody.fk_provincia = null;
    this.ciudadList = [];
    this.id_ciudad = null;
    this.personaBody.fk_canton = null;
    this.parroquiaList = [];
    this.id_parroquia = null;
    this.personaBody.fk_parroquia = null;

    if (this.id_pais != null && this.id_pais) {
      this._geografiaService
        .getAllGeografia(null, 'PR', this.id_pais)
        .subscribe({
          next: (resp) => {
            if (resp.status === 'ok') {
              this.provinciaList = resp.rows;
              if (
                this.personaBody.fk_provincia != null &&
                this.personaBody.fk_provincia
              )
                this.id_provincia = this.personaBody.fk_provincia;
            }
          },
          error: (err) => {
            // manejo de error
            Swal.fire({
              title: '¡Error!',
              icon: 'error',
              text: `Provincias - ${err.message}`,
              confirmButtonText: 'Aceptar',
            });
          },
        });
    } else {
      this.provinciaList = [];
      this.id_provincia = null;
      this.personaBody.fk_provincia = null;
      this.ciudadList = [];
      this.id_ciudad = null;
      this.personaBody.fk_canton = null;
      this.parroquiaList = [];
      this.id_parroquia = null;
      this.personaBody.fk_parroquia = null;
    }
  }

  getGeografiaCiudades() {
    this.ciudadList = [];
    this.id_ciudad = null;
    this.personaBody.fk_canton = null;
    this.parroquiaList = [];
    this.id_parroquia = null;
    this.personaBody.fk_parroquia = null;
    if (this.id_provincia != null && this.id_provincia) {
      this._geografiaService
        .getAllGeografia(null, 'CIU', this.id_provincia)
        .subscribe({
          next: (resp) => {
            if (resp.status === 'ok') {
              this.ciudadList = resp.rows;
              if (
                this.personaBody.fk_canton != null &&
                this.personaBody.fk_canton
              )
                this.id_ciudad = this.personaBody.fk_canton;
            }
          },
          error: (err) => {
            // manejo de error
            Swal.fire({
              title: '¡Error!',
              icon: 'error',
              text: `Ciudades - ${err.message}`,
              confirmButtonText: 'Aceptar',
            });
          },
        });
    }
  }

  getGeografiaParroquias() {
    this.parroquiaList = [];
    this.id_parroquia = null;
    this.personaBody.fk_parroquia = null;
    if (this.id_ciudad != null && this.id_ciudad) {
      this._geografiaService
        .getAllGeografia(null, 'PARR', this.id_ciudad)
        .subscribe({
          next: (resp) => {
            if (resp.status === 'ok') {
              this.parroquiaList = resp.rows;
              if (
                this.personaBody.fk_parroquia != null &&
                this.personaBody.fk_parroquia
              )
                this.id_parroquia = this.personaBody.fk_parroquia;
            }
          },
          error: (err) => {
            // manejo de error
            Swal.fire({
              title: '¡Error!',
              icon: 'error',
              text: `Parroquias - ${err.message}`,
              confirmButtonText: 'Aceptar',
            });
          },
        });
    }
  }

  //Seccion Discapacidad
  cambioDiscapacidad() {
    // Si el usuario acaba de desmarcar el checkbox (cambiar a false)
    if (!this.personaBody.discapacidad_persona) {
      Swal.fire({
        title: '¿Desea eliminar la información de discapacidad?',
        text: 'Esta acción limpiará la lista de discapacidades.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'No, cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          // El usuario aceptó limpiar la información
          this.personaBody.lista_discapacidades = [];
          this.personaBody.discapacidad_persona = false;
        } else {
          // El usuario canceló, revertimos el cambio
          this.personaBody.discapacidad_persona = true;
        }
      });
    }
  }

  prepararNuevaDiscapacidad() {
    this.nuevaDiscapacidad = {
      discapacidad: '',
      porcentaje: null,
    };
  }

  guardarDiscapacidad() {
    // Inicializa el arreglo si es null
    if (!this.personaBody.lista_discapacidades) {
      this.personaBody.lista_discapacidades = [];
    }
    // Solo guarda si pasa la validación
    if (this.validarGuardarDiscapacidad()) {
      this.personaBody.lista_discapacidades.push({
        discapacidad: this.nuevaDiscapacidad.discapacidad,
        porcentaje: this.nuevaDiscapacidad.porcentaje,
      });

      // Limpia el objeto temporal y cierra el modal
      this.nuevaDiscapacidad = {
        discapacidad: '',
        porcentaje: null,
      };

      // Opcional: cerrar modal con jQuery o similar
      $('#discapacidadesModal').modal('hide');
    }
  }

  validarGuardarDiscapacidad(): boolean {
    return (
      this.nuevaDiscapacidad.discapacidad.trim().length > 0 &&
      this.nuevaDiscapacidad.porcentaje !== null &&
      this.nuevaDiscapacidad.porcentaje >= 0 &&
      this.nuevaDiscapacidad.porcentaje <= 100
    );
  }

  eliminarDiscapacidad(item: any) {
    Swal.fire({
      title: '¿Está seguro?',
      text: `Se eliminará la discapacidad: ${item.discapacidad}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.personaBody.lista_discapacidades =
          this.personaBody.lista_discapacidades.filter((d: any) => d !== item);
        Swal.fire('Eliminado', 'La discapacidad ha sido eliminada.', 'success');
      }
    });
  }

  //Paso las listas del ng-select al Personal Body
  idSelectAPersonaBody() {
    this.personaBody.fk_ocupacion = this.id_ocupacion;
    this.personaBody.fk_tipoidentificacion = this.id_tipoidentificacion;
    this.personaBody.fk_sexo = this.id_sexo;
    this.personaBody.fk_nivelacademico = this.id_nivelacademico;
    this.personaBody.fk_estadocivil = this.id_estadocivil;
    this.personaBody.fk_tipo_sangre = this.id_tiposangre;
    this.personaBody.fk_estado_educacion = this.id_estadoeducacion;
    this.personaBody.fk_pais = this.id_pais;
    this.personaBody.fk_provincia = this.id_provincia;
    this.personaBody.fk_canton = this.id_ciudad;
    this.personaBody.fk_parroquia = this.id_parroquia;
  }

  validarGuardarPersona() {
    this.idSelectAPersonaBody();
    let resp = false;
    if (
      !this.personaBody ||
      !this.personaBody.apellidopat_persona ||
      this.personaBody.apellidopat_persona === '' ||
      this.personaBody.apellidopat_persona === undefined ||
      !this.personaBody.nombre_primario_persona ||
      this.personaBody.nombre_primario_persona === '' ||
      this.personaBody.nombre_primario_persona === undefined ||
      !this.personaBody.numidentificacion_persona ||
      this.personaBody.numidentificacion_persona === '' ||
      this.personaBody.numidentificacion_persona === undefined ||
      !this.personaBody.fk_tipoidentificacion ||
      this.personaBody.fk_tipoidentificacion === undefined ||
      !this.personaBody.fk_sexo ||
      this.personaBody.fk_sexo === undefined ||
      !this.personaBody.fk_pais ||
      this.personaBody.fk_pais === undefined ||
      !this.personaBody.fecnac_persona ||
      this.personaBody.fecnac_persona === '' ||
      this.personaBody.fecnac_persona === undefined
    ) {
      resp = false;
    } else {
      resp = true;
    }
    return resp;
  }

  verificarCedula() {
    const cedula = this.personaBody.numidentificacion_persona;
    //verifico que el tipo de identificacion sea cedula donde el id en la base es 1
    if (cedula == '' || cedula == null || cedula == undefined) return;
    if (
      !this._personaService.validarCedulaEcuador(cedula) &&
      this.id_tipoidentificacion === 1
    ) {
      Swal.fire({
        title: 'Cédula inválida',
        text: 'El número ingresado no es una cédula válida en Ecuador.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
      });

      this.personaBody.numidentificacion_persona = '';
    } else {
      //Verifico de que padre esta viniendo
      if (this.getComponentePadre() === 'usuario') {
        this._personaService.getVerificarUsuarioPersona(cedula).subscribe({
          next: (resp) => {
            if (resp.status === 'ok') {
              if (resp.rows.pk_usuario != 0) {
                //Aqui redireccionar a la pagina cargando el usuario
                this._routerService
                  .navigateByUrl('/', { skipLocationChange: true })
                  .then(() => {
                    this.setOpcionPersona('U');
                    this._routerService.navigate([
                      '/usuario',
                      resp.rows.pk_usuario,
                    ]);
                  });

                return; //Paro la ejecucion del resto del codigo
              }

              //Procedo a cargar persona en caso de existir
              if (resp.rows.pk_persona != 0) {
                this.getPersonaId(resp.rows.pk_persona);
              }
            }
          },
          error: (err) => {
            // manejo de error
            Swal.fire({
              title: '¡Error!',
              icon: 'error',
              text: `Persona33 - ${err.message}`,
              confirmButtonText: 'Aceptar',
            });
          },
        });
      }else if (this.getComponentePadre() === 'historia'){
        this._personaService.getVerificarHistoriaClinica_Persona(cedula).subscribe({
          next: (resp) => {
            if (resp.status === 'ok') {
              if (resp.rows.pk_hcu != 0) {
                //Aqui redireccionar a la pagina cargando el usuario
                this._routerService
                  .navigateByUrl('/', { skipLocationChange: true })
                  .then(() => {
                    this.setOpcionPersona('U');
                    this._routerService.navigate([
                      '/hcu',
                      resp.rows.pk_hcu,
                    ]);
                  });

                return; //Paro la ejecucion del resto del codigo
              }

              //Procedo a cargar persona en caso de existir
              if (resp.rows.pk_persona != 0) {
                this.getPersonaId(resp.rows.pk_persona);
              }
            }
          },
          error: (err) => {
            // manejo de error
            Swal.fire({
              title: '¡Error!',
              icon: 'error',
              text: `Persona Historia - ${err.message}`,
              confirmButtonText: 'Aceptar',
            });
          },
        });
      }
    }
  }
}
