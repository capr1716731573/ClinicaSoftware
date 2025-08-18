import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../enviroments/enviroments';
import { catchError, map } from 'rxjs';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly _http = inject(HttpClient);
  private _baseUrl = environment.apiUrl;

  constructor() {}

  getAllUsuario(desde: number) {
    const url = `${this._baseUrl}/usuario/?desde=${desde}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service. - Usuario',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getAllUsuarioId(id: number) {
    const url = `${this._baseUrl}/usuario/id/${id}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(ID) - getAllUsuarioId',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getBsqUsuario(bsq: string) {
    const url = `${this._baseUrl}/usuario/bsq/${bsq}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(Bsq) - getBsqUsuario',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getPerfilesUsuario(id_usuario: number) {
    const url = `${this._baseUrl}/usuario/usu_per2/${id_usuario}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service. - Perfiles de Usuario',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  guardarUsuario(usuario: any, opcion: string) {
    const url = `${this._baseUrl}/usuario/crud/${opcion}`;

    return this._http.post(url, usuario).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo crear la Usuario.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  guardarUsuarioPassword(usuario: any, opcion: string) {
    const url = `${this._baseUrl}/usuario/usu_password/${opcion}`;

    return this._http.post(url, usuario).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo actualizar la contraseña del Usuario.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  guardarPerfilUsuario(usuario: any, opcion: string) {
    const url = `${this._baseUrl}/usuario/usu_per/${opcion}`;

    return this._http.post(url, usuario).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo asignar el perfíl al usuario, verifique que no este duplicado.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  async actualizarFirmaSello(
    archivo: File,
    tipo: 'f' | 's', // 'f' = firma, 's' = sello
    data: any, // usuarioBody u objeto similar
    token?: string // opcional: JWT para Authorization
  ): Promise<any> {
    // Validaciones mínimas
    if (!archivo) throw new Error('No se proporcionó archivo');
    let tipoimg;
    if(tipo === 'f') tipoimg='firma';
    else if(tipo === 's') tipoimg='sello';
    if (!tipoimg) throw new Error(`Tipo inválido: ${tipo}`);

    // Construcción de URL
    const url = `${this._baseUrl.replace(
      /\/$/,
      ''
    )}/usuario/upload/${tipoimg}/U`;

    // FormData exactamente como lo espera el backend
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('data', JSON.stringify(data)); // <<-- IMPORTANTE: backend hace JSON.parse(req.body.data)
    try {
      const resp = await fetch(url, {
        method: 'POST',
        // NO seteamos 'Content-Type': FormData lo hace solo
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
        // credentials: 'include', // <- si necesitas cookies/sesión
      });
      
      const data_resp= await resp.json();

      if(data_resp.status ==="ok"){
        return data_resp.data;
      }else{
        return false;
      }
     
    } catch (error) {
      console.error('actualizarFirmaSello error:', error);
      throw error; // o `return false;` si prefieres silenciar
    }
  }

  verFirmaSello(tipo: 'f' | 's', rutaImg:string){
    //valida que la ruta venga activa 
    if(!rutaImg || rutaImg === undefined || rutaImg ==='') return '';

    //Preparo que ruta elijo si firma o sello 
    
    // Construcción de URL
    let url = `${this._baseUrl}/usuario/ver`;
    if(tipo === 'f'){
      url=`${url}/firma?pathfirma=${rutaImg}`
    }else if(tipo === 's'){
      url=`${url}/sello?pathsello=${rutaImg}`
    }

    return url;

  }
}
