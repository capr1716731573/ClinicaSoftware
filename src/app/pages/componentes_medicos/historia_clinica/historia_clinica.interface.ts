export interface HistoriaClinica {
  pk_hcu: number;                      // serial4 (PK)
  fk_persona: number;                  // UNIQUE, FK -> persona.pk_persona
  numarchivo_hcu: string | null;       // text NULL

  fk_lugarnacimiento: number;          // int4 NOT NULL (DEFAULT 71)  FK -> geografia.pk_geo
  fk_nacionalidad: number;             // int4 NOT NULL (DEFAULT 118) FK -> catalogo_detalle.pk_catdetalle

  grupopri_hcu: boolean;               // bool NOT NULL
  fk_grupo_prioritario: number | null; // int4 NULL (DEFAULT 20)      FK -> catalogo_detalle
  fk_autent_etnica: number | null;     // int4 NULL (DEFAULT 345)     FK -> catalogo_detalle
  fk_nacionalidad_etnica: number | null; // int4 NULL (DEFAULT 302)   FK -> catalogo_detalle
  pueblos_indigenas_hcu: string | null;  // text NULL

  fk_tipo_empresa: number | null;      // int4 NULL (DEFAULT 335)     FK -> catalogo_detalle
  fk_tiposeg_principal: number;        // int4 NOT NULL (DEFAULT 328) FK -> catalogo_detalle
  fk_tiposeg_secundario: number;       // int4 NOT NULL (DEFAULT 328) FK -> catalogo_detalle

  calle_1_hcu: string | null;          // text NULL
  calle_2_hcu: string | null;          // text NULL
  referencia_hcu: string | null;       // text NULL

  nombre_parentesco_hcu: string | null;    // text NULL
  fk_parentesco: number | null;            // int4 NULL (DEFAULT 349)  FK -> catalogo_detalle
  direccion_parentesco_hcu: string | null; // text NULL
  telefono_parentesco_hcu: string | null;  // text NULL

  fk_tipobono: number | null;          // int4 NULL (DEFAULT 535)     FK -> catalogo_detalle
}