import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-info-paciente',
  imports: [CommonModule],
  templateUrl: './info-paciente.component.html',
  styles: ``
})
export class InfoPacienteComponent{
  private _loginService = inject(LoginService);

  /**
   * Si se envía desde el componente padre, se usa esta data.
   * Caso contrario se toma desde localStorage (_hcu) para mantener compatibilidad.
   */
  @Input() hcuInput: any = null;

  // flags para mostrar/ocultar tarjetas (por defecto mantiene el layout actual)
  @Input() showArea = true;
  @Input() showCama = true;
  @Input() showIdentificacion = true;
  @Input() showNombreCompleto = true;
  @Input() showSexo = true;
  @Input() showEdad = true;

  // layout/estilo
  @Input() compact = false; // reduce margen superior
  @Input() colClass = 'col-md-4 col-lg-2 col-xlg-2'; // ancho por tarjeta
  @Input() bigText = false; // agranda el texto principal

  hcu: any = null;

  constructor(){}

  ngOnInit(): void {
    this.syncHcu();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.syncHcu();
  }

  private syncHcu(): void {
    this.hcu = this.hcuInput ?? this._loginService.getHcuLocalStorage();
  }

  get nombreCompleto(): string {
    const h = this.hcu ?? {};
    const nombres =
      (h.nombres_persona ?? '').trim() ||
      `${h.nombre_primario_persona ?? ''} ${h.nombre_secundario_persona ?? ''}`.trim();
    const apellidos = `${h.apellidopat_persona ?? ''} ${h.apellidomat_persona ?? ''}`.trim();
    return `${apellidos} ${nombres}`.trim();
  }

}
