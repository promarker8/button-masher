import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})

export class GameComponent implements OnInit {
  isCollapsed = true;
  showToggleButton = true;

  constructor(private renderer: Renderer2, private router: Router) { }

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;

        if (url === '/game' || url === '/game/landing-page') {
          this.showToggleButton = false;
          this.triggerSidebarAnimation();
        } else {
          this.showToggleButton = true;
        }
      });

    // Also trigger on initial load
    if (this.router.url === '/game' || this.router.url === '/game/landing-page') {
      this.showToggleButton = false;
      this.triggerSidebarAnimation();
    }
  }

  getSidebarClasses() {
    const url = this.router.url;

    return {
      'collapsed': this.isCollapsed,
      'digipet': url.includes('/game/digipet'),
      'chaser': url.includes('/game/chaser'),
      'hilo': url.includes('/game/higher-lower'),
      'kitchennightmare': url.includes('/game/kitchen-nightmare'),
      'default': !(url.includes('/game/chaser') || url.includes('/game/higher-lower') || url.includes('/game/digipet'))
    };
  }

  isKitchenNightmare(): boolean {
    return this.router.url.includes('/game/kitchen-nightmare');
  }

  private triggerSidebarAnimation() {
    setTimeout(() => {
      const toggleButton = document.querySelector('.navBtnInBar') as HTMLElement;
      const sidebar = document.querySelector('.sidebar') as HTMLElement;
      if (!toggleButton) return;

      sidebar.classList.add('sidebar-slow-open');
      toggleButton.click();

      const sidebarTransitionTime = 900;
      setTimeout(() => {
        const navItems = Array.from(document.querySelectorAll('.nav-link')) as HTMLElement[];
        if (navItems.length === 0) return;

        let index = 1;
        const highlightDuration = 900;
        const highlightClass = 'nav-highlight';

        const highlightNext = () => {
          if (index > 1) {
            navItems[index - 1].classList.remove(highlightClass);
          }
          if (index < navItems.length) {
            navItems[index].classList.add(highlightClass);
            index++;
            setTimeout(highlightNext, highlightDuration);
          }
        };

        highlightNext();
        sidebar.classList.remove('sidebar-slow-open');
        this.showToggleButton = true;
      }, sidebarTransitionTime);
    }, 1000); // delay after landing animation
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  closeSidebar() {
    this.isCollapsed = true;
  }

  closeSidebarOnMobile() {
    if (window.innerWidth < 768) {
      this.isCollapsed = true;
    }
  }
}

