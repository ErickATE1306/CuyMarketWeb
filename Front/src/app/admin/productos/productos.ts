import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-productos',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './productos.html'
})
export class Productos {
    activeTab: 'productos' | 'categorias' = 'productos';

    selectTab(tab: 'productos' | 'categorias') {
        this.activeTab = tab;
    }
}
