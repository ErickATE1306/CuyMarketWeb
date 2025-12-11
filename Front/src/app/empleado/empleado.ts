import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../compartido/servicios/auth.service';

@Component({
  selector: 'app-empleado',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './empleado.html',
  styleUrl: './empleado.scss',
})
export class Empleado {
  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}

