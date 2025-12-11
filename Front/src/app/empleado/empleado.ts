import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../compartido/servicios/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empleado',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './empleado.html',
  styleUrl: './empleado.scss',
})
export class Empleado {
  private authService = inject(AuthService);
  sidebarOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  logout() {
    this.authService.logout();
  }
}

