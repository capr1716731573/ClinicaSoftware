export interface Usuario {
  pk_usuario?: number;               // Opcional porque es serial/autogenerado
  fk_persona: number;
  login_usuario: string;
  password_usuario: string;
  estado_usuario: boolean;          // NOT NULL con DEFAULT true
  super_usuario: boolean;           // NOT NULL con DEFAULT false
  doctor_usuario: boolean;
  registrodoctor_usuario: string;
  pathsello_usuario: string;
  pathfirma_usuario: string;
}