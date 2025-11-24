import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../../../enviroments/enviroments';

@Injectable({
  providedIn: 'root',
})
export class PosOperatorioService {
  private readonly _http = inject(HttpClient);
  private _baseUrl = environment.apiUrl;

  constructor() {}

  getAllPosOperatorio(desde: number, hcu: number) {
    let url = `${this._baseUrl}/postoperatorio/ptope/all/${hcu}?desde=${desde}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service. - Listado Protocolo PosOperatorio',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getPosOperatorioId(id: number, opcion: any) {
    const url = `${this._baseUrl}/postoperatorio/ptope/id/${opcion}/${id}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(ID) -Protocolo PosOperatorio',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getFechasPosOperatorio(hcu: number, fecha1: any, fecha2: any) {
    const url = `${this._baseUrl}/postoperatorio/ptope/fechas/${hcu}/${fecha1}/${fecha2}`;
    console.log(url);

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(Bsq) - Protocolo PosOperatorio Fechas',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  guardarPosOperatorio(protocolo: any, opcion: string) {
    const url = `${this._baseUrl}/postoperatorio/ptope/${opcion}`;

    return this._http.post(url, protocolo).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo registrar Protocolo PosOperatorio.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  impresionPosOperatorioId(id: number) {
    const url = `${this._baseUrl}/postoperatorio/ptope/rep_frame/${id}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta al generar impresión -Protocolo PosOperatorio',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //@@@@@@@@@@@ Diagnosticos @@@@@@@@@@@@@@@@@@@@@@@@@
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  getDiagnosticos(id_protocolo: number) {
    let url = `${this._baseUrl}/postoperatorio/diag/${id_protocolo}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service. - Listado Diagnosticos Protocolo PosOperatorio',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  guardarDiagnostico(diagnostico: any, opcion: string) {
    const url = `${this._baseUrl}/postoperatorio/diag/${opcion}`;

    return this._http.post(url, diagnostico).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo crear Diagnostico de Protocolo PosOperatorio.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //@@@@@@@@@@@     Medicos      @@@@@@@@@@@@@@@@@@@@@
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  getMedicos(id_protocolo: number) {
    let url = `${this._baseUrl}/postoperatorio/med/${id_protocolo}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service. - Listado Médicos Protocolo PosOperatorio',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  guardarMedicos(medico: any, opcion: string) {
    const url = `${this._baseUrl}/postoperatorio/med/${opcion}`;

    return this._http.post(url, medico).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo registrar Médicos al Protocolo PosOperatorio.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //@@@@@@@@@@@     Imagenes     @@@@@@@@@@@@@@@@@@@@@
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  async actualizarDiagrama(
    archivo: File,
    data: any, // usuarioBody u objeto similar
    token?: string // opcional: JWT para Authorization
  ): Promise<any> {
    // Validaciones mínimas
    if (!archivo) throw new Error('No se proporcionó archivo');
   
    // Construcción de URL
    const url = `${this._baseUrl.replace(
      /\/$/,
      ''
    )}/postoperatorio/upload/ptope/U`;

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

      const data_resp = await resp.json();

      if (data_resp.status === 'ok') {
        return data_resp.data;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Actualizar Diagrama error:', error);
      throw error; // o `return false;` si prefieres silenciar
    }
  }

  verDiagrama(rutaImg: string) {
    //valida que la ruta venga activa
    if (!rutaImg || rutaImg === undefined || rutaImg === '') return '';

    //Preparo que ruta elijo si firma o sello

    // Construcción de URL
    let url = `${this._baseUrl}/postoperatorio/ver/protope`;    
    url = `${url}?pathprotope=${rutaImg}`;
    

    return url;
  }
}
