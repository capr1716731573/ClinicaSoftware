import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../../services/usuario/usuario.service';
import { PersonaService } from '../../../services/persona/persona.service';
import { Usuario } from './usuario.interface';
import { CommonModule } from '@angular/common';
import { PersonaComponent } from '../persona/persona.component';
import { FormsModule } from '@angular/forms';
import { Persona } from '../persona/persona.interface';
import Swal from 'sweetalert2';
import { UsuarioPerfilComponent } from './usuario-perfil.component';
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-usuario',
  imports: [
    CommonModule,
    FormsModule,
    PersonaComponent,
    UsuarioPerfilComponent,
  ],
  templateUrl: './usuario.component.html',
  styles: ``,
})
export class UsuarioComponent implements OnInit, AfterViewInit {
  @ViewChild(PersonaComponent) personaComponent!: PersonaComponent;
  @ViewChild(UsuarioPerfilComponent)
  perfilUsuarioComponent!: UsuarioPerfilComponent;

  private _routerService = inject(ActivatedRoute);
  private _routerService2 = inject(Router);
  private _usuarioService = inject(UsuarioService);
  private _personaService = inject(PersonaService);
  private personaBody: Persona;
  opcion: string = 'I';
  usuarioBody: Usuario;
  tabActivo: string = 'persona';
  idNum: number = 0;

  //Imagenes a subir
  public imgFirma: File;
  public imgSello: File;
  public imgFirmaTemp: any = null;
  public imgSelloTemp: any = null;

  constructor() {}

  ngOnInit(): void {
    this.inicializacionUsuario();
    const id = this._routerService.snapshot.paramMap.get('id');
    this.idNum = Number(id);

    if (this.idNum != 0) {
      if (!isNaN(this.idNum)) {
        this.opcion = 'U';
        this.getUsuarioYPersona(this.idNum);
      } else {
        console.error('ID no es un número válido');
      }
    } else {
      //inicializaciones
      this.inicializacionUsuario();
      //this.personaComponent.inicializacionPersonaFunciones();
      //this.personaComponent.inicializacionPersonaBody();
    }
  }

  ngAfterViewInit(): void {
    this.personaComponent.setComponentePadre('usuario');
    this.personaComponent.setOpcionPersona(this.opcion);
    if (this.perfilUsuarioComponent) {
      this.perfilUsuarioComponent.inicializacionPerfilesUsuario(this.idNum);
    }
  }

  inicializacionUsuario() {
    this.usuarioBody = {
      pk_usuario: 0,
      fk_persona: 0,
      login_usuario: '',
      password_usuario: '',
      estado_usuario: true,
      super_usuario: false,
      doctor_usuario: false,
      registrodoctor_usuario: '',
      pathsello_usuario: '',
      pathfirma_usuario: '',
      senecyt_usuario:''
    };
  }

  getUsuarioYPersona(pk_usuario: number) {
    this._usuarioService
      .getAllUsuarioId(pk_usuario)
      .pipe(
        switchMap((respUsuario) => {
          this.usuarioBody = respUsuario.rows;

          const fk_persona = this.usuarioBody.fk_persona;

          // Llama al siguiente servicio usando el fk_persona del usuario
          return this._personaService.getAllPersonaId(1, fk_persona);
        })
      )
      .subscribe({
        next: (respPersona) => {
          this.personaComponent.setDataPersona(respPersona.data);
          this.personaComponent.inicializacionPersonaFunciones();
        },
        error: (err) => {
          toastr.error('Error', `${err} - No se pudieron cargar los datos`);
        },
      });
  }

  validarUsuario() {
    this.personaBody = this.personaComponent.getDataPersona();
    if (
      !this.personaComponent.validarGuardarPersona() ||
      !this.personaBody ||
      !this.usuarioBody ||
      !this.usuarioBody.login_usuario ||
      this.usuarioBody.login_usuario === '' ||
      this.usuarioBody.login_usuario === undefined
    )
      return false;
    return true;
  }

  guardarUsuarioPersona() {
    // Validación previa
    if (!this.validarUsuario()) {
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
      text: `Desea guardar la información del usuario `,
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
                this.usuarioBody.fk_persona = this.personaBody.pk_persona;

                // Guardar usuario
                this._usuarioService
                  .guardarUsuario(this.usuarioBody, this.opcion)
                  .subscribe({
                    next: (respUsuario) => {
                      if (respUsuario.status === 'ok') {
                        this.usuarioBody = respUsuario.data;

                        this.opcion = 'U';
                        toastr.success(
                          'Éxito',
                          'Persona y Usuario guardados correctamente'
                        );

                        //Aqui redireccionar a la pagina cargando el usuario
                        //Aqui redireccionar a la pagina cargando el usuario
                        this._routerService2
                          .navigateByUrl('/', { skipLocationChange: true })
                          .then(() => {
                            this._routerService2.navigate([
                              '/usuario',
                              this.usuarioBody.pk_usuario,
                            ]);
                          });
                      } else {
                        toastr.error(
                          'Error',
                          'Persona guardada, pero ocurrió un error al guardar el usuario'
                        );
                      }
                    },
                    error: (err) => {
                      toastr.error(
                        'Error',
                        `${err.message} - Error al guardar usuario`
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

  cerrarUsuario() {
    Swal.fire({
      title: '¿Está seguro?',
      text: `Se direccionara a la lista de usuarios `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._routerService2.navigate(['/usuarios']);
      }
    });
  }

  //Seccion de gestiones y carga de imagenes de firma y sello
  cambiarImagenFirma(file?: File) {
    this.imgFirma = file;
    //cambiar la imagen
    if (!file) {
      return (this.imgFirmaTemp = null);
    }

    // ✅ Validar tipo MIME permitido
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        title: '¡Error!',
        text: 'Solo se permiten imágenes JPG, JPEG, PNG o WebP.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      this.imgFirmaTemp = null;
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      this.imgFirmaTemp = reader.result;
    };
  }

  subirImagenFirma() {
    Swal.fire({
      title: 'Confirmación',
      text: `Desea subir la imagen asiganada como firma del usuario ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._usuarioService
          .actualizarFirmaSello(this.imgFirma, 'f', this.usuarioBody)
          .then((img) => {
            this.usuarioBody = img;
            this.opcion = 'U';
            toastr.success(
              'Éxito!',
              'Firma actualizada correctamente'
            );
          });
      }
    });
  }

  cambiarImagenSello(file?: File) {
    this.imgSello = file;
    //cambiar la imagen
    if (!file) {
      return (this.imgSelloTemp = null);
    }

    // ✅ Validar tipo MIME permitido
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        title: '¡Error!',
        text: 'Solo se permiten imágenes JPG, JPEG, PNG o WebP.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      this.imgSelloTemp = null;
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      this.imgSelloTemp = reader.result;
    };
  }

  subirImagenSello() {
    Swal.fire({
      title: 'Confirmación',
      text: `Desea subir la imagen asignada como sello del usuario ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._usuarioService
          .actualizarFirmaSello(this.imgSello, 's', this.usuarioBody)
          .then((img) => {
            this.usuarioBody = img;
            this.opcion = 'U';
            toastr.success(
              'Éxito!',
              'Sello actualizada correctamente'
            );
          });
      }
    });
  }

  verImagenFirmaSello(tipo: string): string {
    const noImage = './assets/images/no_image.jpg'; // 👈 pon aquí tu imagen por defecto

    if (tipo === 'f') {
      if (
        !this.usuarioBody.pathfirma_usuario ||
        this.usuarioBody.pathfirma_usuario === null ||
        this.usuarioBody.pathfirma_usuario === undefined ||
        this.usuarioBody.pathfirma_usuario === ''
      ) {
        return noImage;
      } else {
        return this._usuarioService.verFirmaSello(
          'f',
          this.usuarioBody.pathfirma_usuario
        );
      }
    } else if (tipo === 's') {
      if (
        !this.usuarioBody.pathsello_usuario ||
        this.usuarioBody.pathsello_usuario === null ||
        this.usuarioBody.pathsello_usuario === undefined ||
        this.usuarioBody.pathsello_usuario === ''
      ) {
        return noImage;
      } else {
        return this._usuarioService.verFirmaSello(
          's',
          this.usuarioBody.pathsello_usuario
        );
      }
    } else {
      return noImage;
    }
  }
}
