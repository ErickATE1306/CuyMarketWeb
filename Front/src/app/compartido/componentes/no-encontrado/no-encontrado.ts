import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrado',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './no-encontrado.html',
  styleUrl: './no-encontrado.scss'
})
export class NoEncontradoComponent {}
