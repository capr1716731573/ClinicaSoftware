import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styles: ``,
})
export class HeaderComponent {
  @Output() toggleSidebarEvent = new EventEmitter<void>();


  private router = inject(Router);
  private _loginService = inject(LoginService);

  public usuario:any;


  constructor() {
    this.usuario= this._loginService.getUserLocalStorage();
  }

  logoutComponent() {
    this._loginService.logout();
    this.router.navigateByUrl('/login');
  }
   toggleSidebar() {
    this.toggleSidebarEvent.emit();
  }
}
