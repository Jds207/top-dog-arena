import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

/**
 * Fallback component displayed when remote module federation loading fails.
 * Provides user-friendly error messaging and navigation options.
 */
@Component({
  selector: 'app-fallback',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './fallback.component.html',
  styleUrls: ['./fallback.component.scss'],
})
export class FallbackComponent implements OnInit {
  private readonly router = inject(Router);

  /**
   * Error details that can be passed to the component for better debugging
   */
  errorDetails?: string;

  /**
   * Flag to track if navigation is in progress
   */
  isNavigating = false;

  ngOnInit(): void {
    // Log fallback component activation for debugging
    console.warn('Fallback component activated - Remote module loading failed');
  }

  /**
   * Navigates back to home with error handling
   * Provides defensive navigation with fallback options
   */
  navigateToHome(): void {
    if (this.isNavigating) {
      return; // Prevent double navigation
    }

    this.isNavigating = true;

    try {
      this.router.navigate(['/']).then(
        (success: boolean) => {
          if (!success) {
            console.error('Navigation to home failed');
            // Fallback: use browser navigation
            window.location.href = '/';
          }
        }
      ).catch((error: unknown) => {
        console.error('Navigation error:', error);
        // Fallback: use browser navigation
        window.location.href = '/';
      }).finally(() => {
        this.isNavigating = false;
      });
    } catch (error) {
      console.error('Unexpected navigation error:', error);
      this.isNavigating = false;
      // Ultimate fallback: use browser navigation
      window.location.href = '/';
    }
  }

  /**
   * Attempts to reload the page to retry module loading
   */
  retryLoading(): void {
    try {
      window.location.reload();
    } catch (error) {
      console.error('Failed to reload page:', error);
      // Fallback: navigate to current route
      this.router.navigateByUrl(this.router.url);
    }
  }

  /**
   * Sets error details for debugging purposes
   * @param details - Error details string
   */
  setErrorDetails(details: string | unknown): void {
    if (typeof details === 'string') {
      this.errorDetails = details;
    } else if (details instanceof Error) {
      this.errorDetails = details.message;
    } else {
      this.errorDetails = 'Unknown error occurred';
    }
  }
}
