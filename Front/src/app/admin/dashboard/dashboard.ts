import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardResumen } from '../../compartido/servicios/dashboard.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
    metrics: DashboardResumen | null = null;
    loading = true;
    maxVenta = 0;

    constructor(private dashboardService: DashboardService) { }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.loading = true;
        this.dashboardService.getResumen().subscribe({
            next: (data) => {
                this.metrics = data;
                if (data.productosTop.length > 0) {
                    this.maxVenta = Math.max(...data.productosTop.map(p => p.cantidadVendida));
                }
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading dashboard stats', err);
                this.loading = false;
            }
        });
    }

    getBarWidth(value: number): string {
        if (this.maxVenta === 0) return '0%';
        return Math.round((value / this.maxVenta) * 100) + '%';
    }
}
