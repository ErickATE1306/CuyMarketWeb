import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-botones-compartir',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './botones-compartir.html',
  styleUrl: './botones-compartir.scss'
})
export class BotonesCompartirComponent {
  @Input() url: string = '';
  @Input() title: string = '';
  @Input() description: string = '';
  
  showModal: boolean = false;
  copySuccess: boolean = false;

  ngOnInit() {
    if (!this.url) {
      this.url = window.location.href;
    }
  }

  async share() {
    // Intentar usar Web Share API (móviles)
    if (navigator.share) {
      try {
        await navigator.share({
          title: this.title,
          text: this.description,
          url: this.url
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: mostrar modal con opciones
      this.showModal = true;
    }
  }

  shareOnWhatsApp() {
    const text = encodeURIComponent(`${this.title}\n\n${this.description}\n\n${this.url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  shareOnFacebook() {
    const shareUrl = encodeURIComponent(this.url);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank', 'width=600,height=400');
  }

  shareOnTwitter() {
    const text = encodeURIComponent(this.title);
    const url = encodeURIComponent(this.url);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
  }

  shareOnLinkedIn() {
    const url = encodeURIComponent(this.url);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=400');
  }

  shareViaEmail() {
    const subject = encodeURIComponent(this.title);
    const body = encodeURIComponent(`${this.description}\n\n${this.url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  async copyLink() {
    try {
      await navigator.clipboard.writeText(this.url);
      this.copySuccess = true;
      setTimeout(() => {
        this.copySuccess = false;
      }, 2000);
    } catch (error) {
      // Fallback para navegadores antiguos
      const textArea = document.createElement('textarea');
      textArea.value = this.url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        this.copySuccess = true;
        setTimeout(() => {
          this.copySuccess = false;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy');
      }
      
      document.body.removeChild(textArea);
    }
  }

  closeModal() {
    this.showModal = false;
  }
}
