import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-incrementador',
  imports: [FormsModule,NgClass],
  templateUrl: './incrementador.component.html',
  styles: ``,
})
export class IncrementadorComponent  implements OnInit{
  
  @Input('valor') progreso: number = 50;
  @Input('claseBoton') btnClass:string='btn-primary';

  @Output() valorSalida: EventEmitter<number>= new EventEmitter();

  ngOnInit(): void {
    this.btnClass=`btn ${this.btnClass}`
  }

  cambiarValor(valor: number) {
    if (this.progreso >= 100 && valor > 0) {
      this.valorSalida.emit(100);
      return (this.progreso = 100);
    }

    if (this.progreso <= 0 && valor < 0) {
      this.valorSalida.emit(0);
      return (this.progreso = 0);
    }
    this.valorSalida.emit(this.progreso);
    return this.progreso = this.progreso + valor;
  }
}
