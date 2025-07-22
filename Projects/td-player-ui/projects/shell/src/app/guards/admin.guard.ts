import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.apiService.isAuthenticated()) {
      return true;
    }

    // Redirect to login or show authentication modal
    // For now, we'll allow access and handle auth in the components
    return true;
  }
}
