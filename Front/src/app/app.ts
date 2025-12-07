import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrindisComponent } from './compartido/componentes/brindis/brindis';
import { BotonWhatsappComponent } from './compartido/componentes/boton-whatsapp/boton-whatsapp';
import { WidgetChatComponent } from './compartido/componentes/widget-chat/widget-chat';
import { SessionService } from './compartido/servicios/session.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BrindisComponent, BotonWhatsappComponent, WidgetChatComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  protected title = 'Front';

  constructor(private sessionService: SessionService) {}

  ngOnInit() {
    this.sessionService.startSessionMonitoring();
  }

  ngOnDestroy() {
    this.sessionService.stopSessionMonitoring();
  }
}
