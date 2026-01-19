import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InterconsultaService {
  private readonly _http = inject(HttpClient);
  private _baseUrl = environment.apiUrl;

  constructor() {}

  /******** Solicitud ********************** */
  getAllInterconsultaSolicitud(desde: number, hcu: number) {
    let url = `${this._baseUrl}/interconsulta/intersol/all/${hcu}?desde=${desde}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service. - Listado Interconsulta Solicitud',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getInterconsultaSolicitudId(id: number, opcion: any) {
    const url = `${this._baseUrl}/interconsulta/intersol/id/${opcion}/${id}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(ID) -Interconsulta Solicitud',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getFechasInterconsultaSolicitud(hcu: number, fecha1: any, fecha2: any) {
    const url = `${this._baseUrl}/interconsulta/intersol/fechas/${hcu}/${fecha1}/${fecha2}`;
    console.log(url);

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(Bsq) - Interconsulta Solicitud Fechas',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  guardarInterconsultaSolicitud(interconsulta_solicitud: any, opcion: string) {
    const url = `${this._baseUrl}/interconsulta/intersol/${opcion}`;

    return this._http.post(url, interconsulta_solicitud).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo registrar Interconsulta Solicitud.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  impresionInterconsulta(id_sol: any, id_resp: any) {
    const url = `${this._baseUrl}/interconsulta/reporte_frame/${id_sol}/${id_resp}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta al generar impresión -Interconsulta',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  /****************************************** */

  /******** Respuesta *********************** */
  getAllInterconsultaRespuesta(desde: number, hcu: number) {
    let url = `${this._baseUrl}/interconsulta/interresp/all/${hcu}?desde=${desde}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service. - Listado Interconsulta Respuesta',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getInterconsultaRespuestaId(id: number, opcion: any) {
    const url = `${this._baseUrl}/interconsulta/interresp/id/${opcion}/${id}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(ID) -Interconsulta Respuesta',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  guardarInterconsultaRespuesta(interconsulta_respuesta: any, opcion: string) {
    const url = `${this._baseUrl}/interconsulta/interresp/${opcion}`;

    return this._http.post(url, interconsulta_respuesta).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo registrar Interconsulta Respuesta.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  /****************************************** */

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //@@@@@@@@@@@ Diagnosticos @@@@@@@@@@@@@@@@@@@@@@@@@
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  getDiagnosticos(id_interconsulta: number, tipo_interconsulta: string) {
    let url = `${this._baseUrl}/interconsulta/diag/${id_interconsulta}/${tipo_interconsulta}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service. - Listado Diagnosticos Interconsulta',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  guardarDiagnostico(diagnostico: any, opcion: string) {
    const url = `${this._baseUrl}/interconsulta/diag/${opcion}`;

    return this._http.post(url, diagnostico).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo crear Diagnostico de Interconsulta.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }
}
