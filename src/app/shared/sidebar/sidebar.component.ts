import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styles: ``
})
export class SidebarComponent {
  public _sidebarService = inject(SidebarService);
  menuItems:any[];

  constructor(){
    this.menuItems=this._sidebarService.menu;
  }
}
