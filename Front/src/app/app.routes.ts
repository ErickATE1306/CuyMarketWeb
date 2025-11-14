import { Routes } from '@angular/router';
import { Cliente } from './cliente/cliente';
import { Inicio } from './cliente/inicio/inicio';
import { Productos } from './cliente/productos/productos';
import { Servicios } from './cliente/servicios/servicios';
import { Nosotros } from './cliente/nosotros/nosotros';
import { FAQ } from './cliente/faq/faq';
import { Contacto } from './cliente/contacto/contacto';

export const routes: Routes = [
	{ path: '', redirectTo: 'cliente/inicio', pathMatch: 'full' },
	{
		path: 'cliente',
		component: Cliente,
		children: [
			{ path: 'inicio', component: Inicio },
			{ path: 'productos', component: Productos },
			{ path: 'servicios', component: Servicios },
			{ path: 'nosotros', component: Nosotros },
			{ path: 'faq', component: FAQ },
			{ path: 'contacto', component: Contacto },
			{ path: '', redirectTo: 'inicio', pathMatch: 'full' },
		],
	},
	{ path: '**', redirectTo: 'cliente/inicio' },
];
