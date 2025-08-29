import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PersonaService } from '../../../services/persona/persona.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonaComponent } from '../../administrador/persona/persona.component';
import Swal from 'sweetalert2';
import { HistoriaClinicaService } from '../../../services/historia_clinica/historia_clinica.service';
import { HistoriaClinica } from './historia_clinica.interface';
import { Persona } from '../../administrador/persona/persona.interface';
import { CabeceraDetalleService } from '../../../services/cabecera_detalle/cabecera-detalle.service';
import { GeografiaService } from '../../../services/geografia/geografia.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { LoaderBookComponent } from '../../../componentes_reutilizables/loader-book/loader-book.component';
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-historia-clinica',
  imports: [
    CommonModule,
    FormsModule,
    PersonaComponent,
    NgSelectComponent,
    LoaderBookComponent,
  ],
  templateUrl: './historia-clinica.component.html',
  styles: ``,
})
export class HistoriaClinicaComponent implements OnInit, AfterViewInit {
  //@ViewChild(PersonaComponent) personaComponent!: PersonaComponent;
  // Buffer mientras el hijo aún no está montado
  private pendingPersona: Persona | null = null;
  @ViewChild(PersonaComponent) personaComponent!: PersonaComponent;

  private _routerService = inject(ActivatedRoute);
  private _routerService2 = inject(Router);
  private _historiaClinica = inject(HistoriaClinicaService);
  private _personaService = inject(PersonaService);
  private _detalleService = inject(CabeceraDetalleService);
  private _geografiaService = inject(GeografiaService);

  nacionalidadList: any[] = []; // NAC
  grupoPrioritarioList: any[] = []; // GRU_PRI
  autenticacionEtnicaList: any[] = []; // AUT_ETN
  nacionalidadEtnicaList: any[] = []; // NAC_ETN
  tipoEmpresaList: any[] = []; // TIP_EMP
  tipoSeguroList: any[] = []; // TIP_SEG (sirve para principal y secundario)
  parentescoList: any[] = []; // PAREN
  tipoBonoList: any[] = []; // TIP_BON

  lugarNacimientoList: any[] = []; // Lugar de Nacimiento

  private personaBody: Persona;
  opcion: string = 'I';
  historiaClinicaBody: HistoriaClinica;
  tabActivo: string = 'persona';
  idNum: number = 0;

  //variables del loading
  loading: boolean = true;
  pendingRequests: number = 0;

  constructor() {}

  ngOnInit(): void {
    this.inicializacionHistoriaClinica();
    const id = this._routerService.snapshot.paramMap.get('id');
    this.idNum = Number(id);

    if (this.idNum != 0) {
      if (!isNaN(this.idNum)) {
        this.opcion = 'U';
        this.getHistoriaYPersona(this.idNum);
      } else {
        console.error('ID no es un número válido');
      }
    } else {
      //inicializaciones
      this.inicializacionHistoriaClinica();
      //this.personaComponent.inicializacionPersonaFunciones();
      //this.personaComponent.inicializacionPersonaBody();
    }
  }

  ngAfterViewInit(): void {
    this.personaComponent.setComponentePadre('historia');
    this.personaComponent.setOpcionPersona(this.opcion);
  }

  inicializacionHistoriaClinica() {
    this.historiaClinicaBody = {
      pk_hcu: 0, // PK inicializado en 0
      fk_persona: 0, // FK en null
      numarchivo_hcu: '',

      fk_lugarnacimiento: null, // FK en null
      fk_nacionalidad: null, // FK en null

      grupopri_hcu: false,
      fk_grupo_prioritario: null,
      fk_autent_etnica: null,
      fk_nacionalidad_etnica: null,
      pueblos_indigenas_hcu: '',

      fk_tipo_empresa: null,
      fk_tiposeg_principal: null,
      fk_tiposeg_secundario: null,

      calle_1_hcu: '',
      calle_2_hcu: '',
      referencia_hcu: '',

      nombre_parentesco_hcu: '',
      fk_parentesco: null,
      direccion_parentesco_hcu: '',
      telefono_parentesco_hcu: '',

      fk_tipobono: null,
    };

    //Inicializo los select de listas a llenarse
    const codigos = [
      'NAC',
      'GRU_PRI',
      'AUT_ETN',
      'NAC_ETN',
      'TIP_EMP',
      'TIP_SEG',
      'PAREN',
      'TIP_BON',
    ];

    this.pendingRequests = codigos.length;
    this.loading = true;

    codigos.forEach((c) => this.getDetalleHistoriaClinica(c));
    //Incializa los lugares de nacimiento
    this.getGeografia();
  }

  //Cargar Datos de Foreign Key de Historia Clinica - Catalogo Detalle
  getDetalleHistoriaClinica(codigo: string) {
    this._detalleService.getAllCabecerasDetalle2(codigo, true).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          switch (codigo) {
            case 'NAC':
              this.nacionalidadList = resp.rows;
              break;
            case 'GRU_PRI':
              this.grupoPrioritarioList = resp.rows;
              break;
            case 'AUT_ETN':
              this.autenticacionEtnicaList = resp.rows;
              break;
            case 'NAC_ETN':
              this.nacionalidadEtnicaList = resp.rows;
              break;
            case 'TIP_EMP':
              this.tipoEmpresaList = resp.rows;
              break;
            case 'TIP_SEG':
              this.tipoSeguroList = resp.rows;
              break;
            case 'PAREN':
              this.parentescoList = resp.rows;
              break;
            case 'TIP_BON':
              this.tipoBonoList = resp.rows;
              break;
          }
        }
      },
      error: (err) => {
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Lista - ${codigo} - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
      complete: () => {
        // 🔽 Restamos al contador de pendientes
        this.pendingRequests--;
        if (this.pendingRequests === 0) {
          setTimeout(() => {
            this.loading = false; // ✅ todas terminaron y pasó el tiempo de espera
            //this.personaComponent.setComponentePadre('historia');
            //this.personaComponent.setOpcionPersona(this.opcion);
          }, 2000); // 5000 ms = 5 segundos
        }
      },
    });
  }

  validarHistoriaClinica() {
    // Primero obtener datos de persona
    this.personaBody = this.personaComponent.getDataPersona();

    if (
      !this.personaComponent.validarGuardarPersona() || // valida persona
      !this.personaBody ||
      !this.historiaClinicaBody ||
      this.historiaClinicaBody.fk_persona === null ||
      this.historiaClinicaBody.fk_persona === undefined ||
      this.historiaClinicaBody.fk_lugarnacimiento === null ||
      this.historiaClinicaBody.fk_lugarnacimiento === undefined ||
      this.historiaClinicaBody.fk_nacionalidad === null ||
      this.historiaClinicaBody.fk_nacionalidad === undefined ||
      this.historiaClinicaBody.grupopri_hcu === undefined ||
      this.historiaClinicaBody.fk_tiposeg_principal === null ||
      this.historiaClinicaBody.fk_tiposeg_principal === undefined
    ) {
      return false;
    }
    return true;
  }

  getHistoriaYPersona(pk_historia: number) {
    this._historiaClinica
      .getAllHistoriaClinicaId(pk_historia, 1)
      .pipe(
        switchMap((respHistoria) => {
          this.historiaClinicaBody = respHistoria.data; // ajusta si tu API usa .rows
          const fk_persona = this.historiaClinicaBody.fk_persona;
          return this._personaService.getAllPersonaId(1, fk_persona);
        })
      )
      .subscribe({
        next: (respPersona) => {
          this.personaComponent.setDataPersona(respPersona.data);
          this.personaComponent.inicializacionPersonaFunciones();
        },
        error: (err) => {
          toastr.error(
            'Errorrrrrr',
            `${err} - No se pudieron cargar los datos`
          );
        },
      });
  }

  guardarHistoriaPersona() {
    // Validación previa
    if (!this.validarHistoriaClinica()) {
      Swal.fire({
        title: 'Campos obligatorios',
        icon: 'warning',
        text: 'Debe llenar los campos obligatorios (*) antes de guardar.',
        confirmButtonText: 'Aceptar',
      });
      return; // Detiene la ejecución si la validación falla
    }

    Swal.fire({
      title: '¿Está seguro?',
      text: `Desea guardar la información de la Historia Clínica `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Guardar persona
        this._personaService
          .guardarPersona(
            this.personaBody,
            this.personaComponent.getOpcionPersona()
          )
          .subscribe({
            next: (respPersona) => {
              if (respPersona.status === 'ok') {
                this.personaBody = respPersona.data;
                this.personaComponent.setDataPersona(this.personaBody);

                // Asignar fk_persona al usuario
                this.historiaClinicaBody.fk_persona =
                  this.personaBody.pk_persona;

                // Guardar usuario
                this._historiaClinica
                  .guardarHistoriaClinica(this.historiaClinicaBody, this.opcion)
                  .subscribe({
                    next: (respUsuario) => {
                      if (respUsuario.status === 'ok') {
                        this.historiaClinicaBody = respUsuario.data;

                        this.opcion = 'U';
                        toastr.success(
                          'Éxito',
                          'Persona e Historia Clínica guardados correctamente'
                        );

                        //Aqui redireccionar a la pagina cargando el usuario
                        //Aqui redireccionar a la pagina cargando el usuario
                        this._routerService2
                          .navigateByUrl('/', { skipLocationChange: true })
                          .then(() => {
                            this._routerService2.navigate([
                              '/hcu',
                              this.historiaClinicaBody.pk_hcu,
                            ]);
                          });
                      } else {
                        toastr.error(
                          'Error',
                          'Persona guardada, pero ocurrió un error al guardar la Historia Clínica'
                        );
                      }
                    },
                    error: (err) => {
                      toastr.error(
                        'Error',
                        `${err.message} - Error al guardar Historia Clínica`
                      );
                    },
                  });
              } else {
                toastr.error('Error', 'Problema al crear registro de Persona');
              }
            },
            error: (err) => {
              toastr.error(
                'Error',
                `${err.message} - Problema al crear registro de Persona`
              );
            },
          });
      }
    });
  }

  cerrarHistoriaClinica() {
    Swal.fire({
      title: '¿Está seguro?',
      text: `Se direccionara a la lista de Historias Clínicas `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._routerService2.navigate(['/hcu']);
      }
    });
  }

  getGeografia() {
    this._geografiaService.getGeografiaTipo('CIU').subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.lugarNacimientoList = resp.rows;
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Lugar Nacimiento - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }
}
