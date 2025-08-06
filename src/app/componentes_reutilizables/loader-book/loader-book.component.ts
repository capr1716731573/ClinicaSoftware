import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader-book',
  imports: [],
  templateUrl: './loader-book.component.html',
  styleUrl: './loader-book.component.css',
})
export class LoaderBookComponent {
  @Input() textoLoader: string = '';
}
