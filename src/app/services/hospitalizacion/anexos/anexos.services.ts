import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../../../enviroments/enviroments';

@Injectable({
  providedIn: 'root',
})
export class AnexosService {
  private readonly _http = inject(HttpClient);
  private _baseUrl = environment.apiUrl;

  constructor() {}

  async actualizarAnexo(
    archivo: File,
    tipo: 'f' | 's', // 'f' = firma, 's' = sello
    data: any, // usuarioBody u objeto similar
    token?: string // opcional: JWT para Authorization
  ): Promise<any> {
    // Validaciones mínimas
    if (!archivo) throw new Error('No se proporcionó archivo');
    let tipoimg;
    if (tipo === 'f') tipoimg = 'firma';
    else if (tipo === 's') tipoimg = 'sello';
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

      const data_resp = await resp.json();

      if (data_resp.status === 'ok') {
        return data_resp.data;
      } else {
        return false;
      }
    } catch (error) {
      console.error('actualizarFirmaSello error:', error);
      throw error; // o `return false;` si prefieres silenciar
    }
  }

  verFirmaSello(tipo: 'f' | 's', rutaImg: string) {
    //valida que la ruta venga activa
    if (!rutaImg || rutaImg === undefined || rutaImg === '') return '';

    //Preparo que ruta elijo si firma o sello

    // Construcción de URL
    let url = `${this._baseUrl}/usuario/ver`;
    if (tipo === 'f') {
      url = `${url}/firma?pathfirma=${rutaImg}`;
    } else if (tipo === 's') {
      url = `${url}/sello?pathsello=${rutaImg}`;
    }

    return url;
  }
}