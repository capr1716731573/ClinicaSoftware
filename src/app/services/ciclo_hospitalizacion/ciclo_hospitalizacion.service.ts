import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../enviroments/enviroments';
import { catchError, map } from 'rxjs';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class CicloHospitalizacionService {
  private readonly _http = inject(HttpClient);
  private _baseUrl = environment.apiUrl;

  constructor() {
    this._baseUrl = `${this._baseUrl}/censo`;
  }

  getIngresosXHcuVigente(hcu: number) {
    let url = `${this._baseUrl}/hcu/${hcu}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service. - Historico X Paciente',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getIngresosXAreaPiso(area: number) {
    let url = `${this._baseUrl}/area/${area}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service. - Censo por Área',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getIngresosXAreaTorrePisoSala(area: any, torre: any, piso: any, sala: any) {
    let url = `${this._baseUrl}/total/${area}/${torre}/${piso}/${sala}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service. - Censo por Área,Torre,Piso,Sala',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getPacienteHospitalizado(identificacion: string) {
    const url = `${this._baseUrl}/paciente_ingresado/${identificacion}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(ID) - getPacienteHospitalizado',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getCensoXId(id: number) {
    const url = `${this._baseUrl}/id/${id}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(ID) - Censo ID',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getIngresosXHcu(hcu: number) {
    let url = `${this._baseUrl}/ingresos/${hcu}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service. - Historico Ingresos X Paciente',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  crudCicloHospitalizacion(ciclo: any, opcion: string) {
    const url = `${this._baseUrl}/${opcion}`;

    return this._http.post(url, ciclo).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo crear Ciclo de Hospitalización.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  // Egresos
  getAllEgresos(desde: number) {
    let url;
    if (desde === null) {
      url = `${this._baseUrl}/egresos/all`;
    } else {
      url = `${this._baseUrl}/egresos/all?desde=${desde}`;
    }

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service. - Censo Egresos Hospitalarios',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getEgresosId(id: number) {
    const url = `${this._baseUrl}/egresos/id/${id}`;
    console.log(url);
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(ID) - Egresos Hospitalarios',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getBsqEgresos(bsq: string) {
    const url = `${this._baseUrl}/egresos/bsq/${bsq}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(Bsq) - Egresos Hospitalarios',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  //Reportes
  descargarReporteINEC(mes: number, anio: number) {
    const url = `${this._baseUrl}/reporte/inec/${mes}/${anio}`;

    return this._http
      .get(url, {
        responseType: 'blob',
        headers: new HttpHeaders({
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
      })
      .pipe(
        map((blob: Blob) => {
          // Crear el archivo y descargarlo
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Reporte_INEC_${mes}_${anio}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          Swal.fire({
            title: '¡Éxito!',
            text: 'Reporte INEC descargado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          });

          return blob;
        }),
        catchError((err) => {
          Swal.fire({
            title: '¡Error!',
            text: 'No se pudo descargar el Reporte INEC.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
          console.error('Error no controlado:', err);
          return of(err);
        })
      );
  }

  descargarCensoActual() {
    const url = `${this._baseUrl}/reporte/actual_censo`;

    return this._http
      .get(url, {
        responseType: 'blob',
        headers: new HttpHeaders({
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
      })
      .pipe(
        map((blob: Blob) => {
          // Crear el archivo y descargarlo
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const fecha = new Date();
          const fechaStr = `${fecha.getFullYear()}${String(
            fecha.getMonth() + 1
          ).padStart(2, '0')}${String(fecha.getDate()).padStart(2, '0')}`;
          link.download = `Censo_Actual_${fechaStr}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          Swal.fire({
            title: '¡Éxito!',
            text: 'Reporte de Censo Actual descargado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          });

          return blob;
        }),
        catchError((err) => {
          Swal.fire({
            title: '¡Error!',
            text: 'No se pudo descargar el Reporte de Censo Actual.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
          console.error('Error no controlado:', err);
          return of(err);
        })
      );
  }
}
