import { Routes } from '@angular/router';
import { authGuard } from './compartido/guardias/auth.guard';
import { roleGuard } from './compartido/guardias/role.guard';
import { Cliente } from './cliente/cliente';
import { Inicio } from './cliente/inicio/inicio';
import { Productos as ClienteProductos } from './cliente/productos/productos';
import { ProductoDetalle } from './cliente/productos/producto-detalle/producto-detalle';
import { Checkout } from './cliente/checkout/checkout';
import { OrdenConfirmada } from './cliente/orden-confirmada/orden-confirmada';
import { Servicios } from './cliente/servicios/servicios';
import { Nosotros } from './cliente/nosotros/nosotros';
import { FAQ } from './cliente/faq/faq';
import { Contacto } from './cliente/contacto/contacto';
import { Perfil } from './cliente/perfil/perfil';
import { MisPedidos } from './cliente/mis-pedidos/mis-pedidos';
import { Carrito } from './cliente/carrito/carrito';
import { Wishlist } from './cliente/wishlist/wishlist';
import { Configuracion as ClienteConfiguracion } from './cliente/configuracion/configuracion';
import { Admin } from './admin/admin';
import { Empleado } from './empleado/empleado';
import { Dashboard } from './admin/dashboard/dashboard';
import { Usuarios } from './admin/usuarios/usuarios';
import { CatProd } from './admin/cat-prod/cat-prod';
import { Pedidos } from './admin/pedidos/pedidos';
import { Finanzas } from './admin/finanzas/finanzas';
import { Reportes as AdminReportes } from './admin/reportes/reportes';
import { Configuracion } from './admin/configuracion/configuracion';
import { GestionPedidos } from './empleado/gestion-pedidos/gestion-pedidos';
import { Completados } from './empleado/completados/completados';
import { Entregas } from './empleado/entregas/entregas';
import { Inventario } from './empleado/inventario/inventario';
import { Reportes as EmpleadoReportes } from './empleado/reportes/reportes';
import { Login } from './auth/login';
import { RecuperarContrasenaComponent } from './auth/recuperar-contrasena/recuperar-contrasena';
import { VerificarEmailComponent } from './auth/verificar-email/verificar-email';
import { FacturaComponent } from './cliente/factura/factura';
import { NoEncontradoComponent } from './compartido/componentes/no-encontrado/no-encontrado';

export const routes: Routes = [
	{ path: '', redirectTo: 'cliente/inicio', pathMatch: 'full' },
	{ path: 'auth/login', component: Login },
	{ path: 'auth/forgot-password', component: RecuperarContrasenaComponent },
	{ path: 'auth/verify-email', component: VerificarEmailComponent, canActivate: [authGuard] },
	{
			path: 'cliente',
		component: Cliente,
		children: [
			{ path: 'inicio', component: Inicio },
			{ path: 'productos', component: ClienteProductos },
			{ path: 'productos/:id', component: ProductoDetalle },
			{ path: 'servicios', component: Servicios },
			{ path: 'nosotros', component: Nosotros },
			{ path: 'faq', component: FAQ },
			{ path: 'contacto', component: Contacto },
			{ path: 'perfil', component: Perfil, canActivate: [authGuard] },
			{ path: 'mis-pedidos', component: MisPedidos, canActivate: [authGuard] },
			{ path: 'factura/:id', component: FacturaComponent, canActivate: [authGuard] },
			{ path: 'wishlist', component: Wishlist },
			{ path: 'carrito', component: Carrito },
			{ path: 'checkout', component: Checkout, canActivate: [authGuard] },
			{ path: 'orden-confirmada/:id', component: OrdenConfirmada, canActivate: [authGuard] },
			{ path: 'configuracion', component: ClienteConfiguracion, canActivate: [authGuard] },
			{ path: '', redirectTo: 'inicio', pathMatch: 'full' },
		],
	},
	{
		path: 'admin',
		component: Admin,
		canActivate: [authGuard, roleGuard],
		data: { role: 'admin' },
		children: [
			{ path: 'dashboard', component: Dashboard },
			{ path: 'usuarios', component: Usuarios },
			{ path: 'productos', component: CatProd },
			{ path: 'pedidos', component: Pedidos },
			{ path: 'finanzas', component: Finanzas },
			{ path: 'reportes', component: AdminReportes },
			{ path: 'configuracion', component: Configuracion },
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
		],
	},
	{
		path: 'empleado',
		component: Empleado,
		canActivate: [authGuard, roleGuard],
		data: { role: 'empleado' },
		children: [
			{ path: 'gestion-pedidos', component: GestionPedidos },
			{ path: 'completados', component: Completados },
			{ path: 'entregas', component: Entregas },
			{ path: 'inventario', component: Inventario },
			{ path: 'reportes', component: EmpleadoReportes },
			{ path: '', redirectTo: 'gestion-pedidos', pathMatch: 'full' },
		],
	},
	{ path: '**', component: NoEncontradoComponent },
];

