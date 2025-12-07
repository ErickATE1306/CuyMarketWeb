import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

interface Agent {
  name: string;
  avatar: string;
  status: 'online' | 'offline';
}

@Component({
  selector: 'app-widget-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './widget-chat.html',
  styleUrl: './widget-chat.scss'
})
export class WidgetChatComponent implements OnInit, OnDestroy {
  isOpen: boolean = false;
  isMinimized: boolean = false;
  messages: Message[] = [];
  newMessage: string = '';
  isTyping: boolean = false;
  unreadCount: number = 0;

  agent: Agent = {
    name: 'María González',
    avatar: '👩‍💼',
    status: 'online'
  };

  // Respuestas automáticas
  autoResponses: { [key: string]: string } = {
    'hola': '¡Hola! Bienvenido a CuyMarket. ¿En qué puedo ayudarte?',
    'precio': 'Nuestros precios varían según el tipo de cuy. ¿Buscas cuyes para reproducción o para consumo?',
    'envío': 'Realizamos envíos a todo Lima. El costo varía según el distrito. ¿A qué zona necesitas el envío?',
    'horario': 'Nuestro horario de atención es de Lunes a Sábado de 8:00 AM a 6:00 PM.',
    'pago': 'Aceptamos pago en efectivo, transferencia bancaria y tarjetas de crédito/débito.',
    'garantía': 'Todos nuestros cuyes cuentan con garantía de salud. Si tienes algún problema, contáctanos dentro de las primeras 24 horas.',
    'gracias': '¡De nada! ¿Hay algo más en lo que pueda ayudarte?',
    'adiós': '¡Hasta pronto! Si necesitas algo más, no dudes en escribirnos.',
    'default': 'Gracias por tu mensaje. Un asesor te responderá pronto. ¿Puedo ayudarte con algo más?'
  };

  ngOnInit() {
    this.loadMessages();
    
    // Mensaje de bienvenida inicial
    if (this.messages.length === 0) {
      setTimeout(() => {
        this.addAgentMessage('¡Hola! Bienvenido a CuyMarket. ¿En qué puedo ayudarte hoy?');
      }, 1000);
    }
  }

  ngOnDestroy() {
    this.saveMessages();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.unreadCount = 0;
      this.isMinimized = false;
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  minimizeChat() {
    this.isMinimized = !this.isMinimized;
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: this.newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    this.newMessage = '';
    this.scrollToBottom();

    // Simular respuesta del agente
    this.isTyping = true;
    setTimeout(() => {
      const response = this.getAutoResponse(userMessage.text);
      this.addAgentMessage(response);
      this.isTyping = false;
    }, 1500);
  }

  getAutoResponse(text: string): string {
    const lowerText = text.toLowerCase();
    
    for (const key in this.autoResponses) {
      if (lowerText.includes(key)) {
        return this.autoResponses[key];
      }
    }
    
    return this.autoResponses['default'];
  }

  addAgentMessage(text: string) {
    const agentMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'agent',
      timestamp: new Date()
    };

    this.messages.push(agentMessage);
    
    if (!this.isOpen) {
      this.unreadCount++;
    }
    
    this.scrollToBottom();
    this.saveMessages();
  }

  scrollToBottom() {
    setTimeout(() => {
      const messagesContainer = document.querySelector('.chat-messages');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('es-PE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  saveMessages() {
    localStorage.setItem('chatMessages', JSON.stringify(this.messages));
  }

  loadMessages() {
    const saved = localStorage.getItem('chatMessages');
    if (saved) {
      this.messages = JSON.parse(saved).map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
    }
  }

  clearChat() {
    if (confirm('¿Deseas borrar el historial de chat?')) {
      this.messages = [];
      this.saveMessages();
      setTimeout(() => {
        this.addAgentMessage('¡Hola! ¿En qué puedo ayudarte?');
      }, 500);
    }
  }
}
