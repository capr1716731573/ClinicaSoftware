export interface KardexCab {
  pk_kardexcab?: number;                         // serial4 (PK) - opcional al crear
  fecha_creacion_kardexcab: any;                // json NOT NULL
  fecha_modificacion_kardexcab: any | null;     // json NULL

  casalud_id_fk: number;                        // int8 NOT NULL
  fk_hcu: number;                               // int8 NOT NULL
  medico_usu_id_fk: number;                     // int8 NOT NULL

  medicamento_kardexcab: string;                // text NOT NULL
  dosis_kardexcab: string;                      // text NOT NULL
  via_kardexcab: string;                        // text NOT NULL
  frecuencia_kardexcab: string;                 // text NOT NULL
  fecha_kardexcab: string;                      // date NOT NULL (YYYY-MM-DD)
  estado_kardexcab: boolean | null;             // bool NULL
}

export interface KardexDet {
  pk_kardexdet?: number;                        // serial4 (PK) - opcional al crear
  fecha_creacion_kardexdet: any;                // json NOT NULL
  fecha_modificacion_kardexdet: any | null;     // json NULL

  fk_kardexcab: number;                         // int8 NOT NULL (FK a kardex_cab)
  medico_usu_id_fk: number;                     // int8 NOT NULL

  fecha_kardexdet: string;                      // date NOT NULL (YYYY-MM-DD)
  hora_kardexdet: string;                       // time NOT NULL (HH:mm:ss o HH:mm)
  administrado_kardexdet: boolean;              // bool NOT NULL
}


