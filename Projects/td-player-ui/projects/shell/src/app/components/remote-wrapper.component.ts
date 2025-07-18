import {
  Component,
  OnInit,
  ViewContainerRef,
  ComponentRef,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { LocalLandingPageComponent } from './local-landing-page.component';

@Component({
  selector: 'app-remote-wrapper',
  standalone: true,
  imports: [CommonModule, LocalLandingPageComponent],
  templateUrl: './remote-wrapper.component.html',
})
export class RemoteWrapperComponent implements OnInit {
  isRemoteLoaded = false;
  private componentRef?: ComponentRef<any>;

  constructor(
    private viewContainer: ViewContainerRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const module = await loadRemoteModule({
          type: 'module',
          remoteEntry: 'http://localhost:4201/remoteEntry.js',
          exposedModule: './Component',
        });

        const componentClass = module.LandingPageComponent;
        if (componentClass) {
          this.viewContainer.clear();
          this.componentRef =
            this.viewContainer.createComponent(componentClass);
          this.isRemoteLoaded = true;
        }
      } catch (error) {
        console.warn(
          'Could not load remote module, using local fallback:',
          error,
        );
        // The local component will remain visible
      }
    }
  }
}
