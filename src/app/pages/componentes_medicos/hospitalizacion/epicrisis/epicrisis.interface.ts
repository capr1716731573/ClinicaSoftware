export interface Epicrisis {
  _a: {
    pk_epi: number;
    casalud_id_fk: number;   // FK casas_salud
    fk_hcu: number;          // FK historia_clinica
    estado_epi: boolean;     // estado del episodio (cerrado/abierto)
  };

  _b: {
    resumen_cuadro_clinico: string | null; // corresponde a resumen_cuadro_clinico_epi
  };

  _c: {
    resumen_evolucion: string | null;      // corresponde a resumen_evolucion_complic_epi
  };

  _d: {
    hallazgos_relevantes: string | null;   // corresponde a hallazgos_relevantes_epi
  };

  _e: {
    resumen_tratamiento: string | null;    // corresponde a resumen_tratamiento_procedimiento_epi
  };

  _f: {
    indicaciones_alta: string | null;         // corresponde a indicaciones_alta_epi (JSON en DB)
    prox_control: string | null;           // campo extra (no existe en la tabla)
  };

  _h: {
    vivo: boolean;
    fallecido: boolean;
    alta_medica: boolean;
    alta_voluntaria: boolean;
    asintomatico: boolean;
    discapacidad: boolean;
    retiro_no_autorizado: boolean;
    def_menor_48: boolean;
    def_mayor_48: boolean;
    dias_estada: number | null;            // en tu ejemplo venía como boolean; aquí se define como número
    dias_reposo: number | null;            // idem
    observacion_h: string | null;          // mapea dentro de condiciones_alta (JSON)
  };

  _j: {
    medico_usu_id_fk: number | null;       // FK usuarios que cierra
    
  };
}

export interface EpicrisisDiagnostico {
  pk_epidiag: number;                     // serial4 (PK)
  fk_epi: number;                         // FK epicrisis
  fk_cie: number;                         // FK catálogo CIE10
  fecha_creacion_epidiag: any | null;     // json
  fecha_modificacion_epidiag: any | null; // json
  tipo_epidiag: 'DP' | 'DS' | 'CE';       // Diagnóstico Principal / Secundario / Causa Externa
}


export interface EpicrisisMedico {
  pk_epimed: number;                      // serial4 (PK)
  fk_epi: number | null;                  // FK epicrisis (puede ser NULL)
  fk_espemed: number;                     // FK especialidad médica
  fecha_creacion_epimed: any | null;      // json
  fecha_modificacion_epimed: any | null;  // json
  periodo_desde_epimed: string;           // date (YYYY-MM-DD)
  periodo_hasta_epimed: string;           // date (YYYY-MM-DD)
}
