# AI Coding Guidelines for Top Dog Arena

This document establishes coding standards and best practices for AI assistants working on the Top Dog Arena project. These guidelines emphasize defensive programming, code quality, and maintainability.

## Core Principles

### 1. Defensive Programming Standards

#### Input Validation
- **Always validate inputs** before processing
- Check for null, undefined, empty values
- Validate data types and ranges
- Sanitize user inputs to prevent injection attacks

```typescript
// ✅ Good - Defensive input validation
function processPlayerData(player: unknown): PlayerData | null {
  if (!player || typeof player !== 'object') {
    console.warn('Invalid player data provided');
    return null;
  }
  
  const playerObj = player as Record<string, unknown>;
  
  if (typeof playerObj.id !== 'string' || playerObj.id.trim() === '') {
    throw new Error('Player ID is required and must be a non-empty string');
  }
  
  // Continue validation...
}

// ❌ Bad - No validation
function processPlayerData(player: any) {
  return {
    id: player.id,
    name: player.name
  };
}
```

#### Error Handling
- **Never let errors fail silently**
- Use try-catch blocks for potentially failing operations
- Provide meaningful error messages
- Log errors with context for debugging

```typescript
// ✅ Good - Comprehensive error handling
async function loadRemoteModule(config: ModuleConfig): Promise<ComponentClass | null> {
  try {
    if (!config?.remoteEntry) {
      throw new Error('Remote entry URL is required');
    }
    
    const module = await loadRemoteModule(config);
    
    if (!module?.LandingPageComponent) {
      console.warn('Expected component not found in remote module');
      return null;
    }
    
    return module.LandingPageComponent;
  } catch (error) {
    console.error('Failed to load remote module:', {
      config,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}
```

#### Null Safety
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Check for existence before accessing properties
- Provide fallback values

```typescript
// ✅ Good - Null-safe operations
const playerName = player?.profile?.name ?? 'Unknown Player';
const stats = player?.statistics?.length > 0 ? player.statistics : [];

// ❌ Bad - Potential null reference errors
const playerName = player.profile.name;
const stats = player.statistics;
```

### 2. TypeScript Best Practices

#### Strict Typing
- **Always use explicit types** - avoid `any`
- Define interfaces for complex objects
- Use union types for known value sets
- Leverage TypeScript's strict mode

```typescript
// ✅ Good - Explicit typing
interface PlayerCard {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  stats: PlayerStats;
  metadata?: NFTMetadata;
}

function createCard(data: Partial<PlayerCard>): PlayerCard | null {
  // Implementation with type safety
}

// ❌ Bad - Using any
function createCard(data: any): any {
  // Implementation without type safety
}
```

#### Generic Types
- Use generics for reusable components
- Constrain generics with appropriate bounds

```typescript
// ✅ Good - Generic with constraints
interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

function handleApiResponse<T>(response: ApiResponse<T>): T | null {
  if (response.status === 'error') {
    console.error('API Error:', response.message);
    return null;
  }
  return response.data;
}
```

### 3. Angular Best Practices

#### Component Design
- Keep components focused and single-purpose
- Use OnPush change detection when possible
- Implement proper lifecycle hooks
- Handle subscriptions properly

```typescript
// ✅ Good - Defensive Angular component
@Component({
  selector: 'app-player-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerCardComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  
  @Input() player: PlayerData | null = null;
  @Output() cardClick = new EventEmitter<string>();
  
  ngOnInit(): void {
    // Defensive subscription handling
    this.someService.data$
      .pipe(
        takeUntil(this.destroy$),
        filter(data => data != null),
        catchError(error => {
          console.error('Error in player card subscription:', error);
          return EMPTY;
        })
      )
      .subscribe(data => {
        // Handle data safely
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  onCardClick(): void {
    if (this.player?.id) {
      this.cardClick.emit(this.player.id);
    }
  }
}
```

#### Service Design
- Use dependency injection properly
- Handle HTTP errors gracefully
- Provide fallback mechanisms

```typescript
// ✅ Good - Defensive service
@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);
  
  getPlayer(id: string): Observable<PlayerData | null> {
    if (!id?.trim()) {
      this.logger.warn('Invalid player ID provided');
      return of(null);
    }
    
    return this.http.get<PlayerData>(`/api/players/${id}`).pipe(
      catchError(error => {
        this.logger.error('Failed to fetch player:', { id, error });
        return of(null);
      }),
      timeout(10000), // 10 second timeout
      retry(2) // Retry failed requests twice
    );
  }
}
```

### 4. Security Considerations

#### Input Sanitization
- Sanitize all user inputs
- Use parameterized queries
- Validate data on both client and server

#### XSS Prevention
- Use Angular's built-in sanitization
- Avoid innerHTML when possible
- Validate and sanitize dynamic content

```typescript
// ✅ Good - Safe dynamic content
@Component({
  template: `
    <div [textContent]="userContent"></div>
    <div [innerHTML]="sanitizedContent"></div>
  `
})
export class SafeContentComponent {
  constructor(private sanitizer: DomSanitizer) {}
  
  get sanitizedContent(): SafeHtml {
    return this.sanitizer.sanitize(SecurityContext.HTML, this.rawContent) || '';
  }
}
```

### 5. Performance Guidelines

#### Lazy Loading
- Implement lazy loading for routes and modules
- Use OnPush change detection
- Minimize bundle sizes

#### Memory Management
- Unsubscribe from observables
- Remove event listeners
- Clear timers and intervals

```typescript
// ✅ Good - Proper cleanup
export class ComponentWithTimer implements OnDestroy {
  private timer?: number;
  
  startTimer(): void {
    this.clearTimer(); // Clear existing timer first
    this.timer = window.setTimeout(() => {
      // Timer logic
    }, 1000);
  }
  
  ngOnDestroy(): void {
    this.clearTimer();
  }
  
  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }
}
```

### 6. Testing Requirements

#### Unit Tests
- Write tests for all business logic
- Test error conditions and edge cases
- Mock external dependencies

```typescript
// ✅ Good - Comprehensive test
describe('PlayerService', () => {
  let service: PlayerService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PlayerService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  it('should handle invalid player ID gracefully', () => {
    service.getPlayer('').subscribe(result => {
      expect(result).toBeNull();
    });
    
    httpMock.expectNone('/api/players/');
  });
  
  it('should handle HTTP errors gracefully', () => {
    service.getPlayer('123').subscribe(result => {
      expect(result).toBeNull();
    });
    
    const req = httpMock.expectOne('/api/players/123');
    req.error(new ErrorEvent('Network error'));
  });
});
```

## Code Review Checklist

When writing or reviewing code, ensure:

- [ ] **Input validation** is implemented
- [ ] **Error handling** covers all failure scenarios
- [ ] **Null safety** is enforced
- [ ] **TypeScript types** are explicit and correct
- [ ] **Performance** considerations are addressed
- [ ] **Security** vulnerabilities are prevented
- [ ] **Memory leaks** are avoided
- [ ] **Tests** cover happy path and error cases
- [ ] **Logging** provides useful debugging information
- [ ] **Documentation** explains complex logic

## Naming Conventions

### Files and Directories
- Use kebab-case for file names: `player-card.component.ts`
- Use camelCase for variables and functions: `playerData`, `getUserStats()`
- Use PascalCase for classes and interfaces: `PlayerCard`, `UserService`

### Constants and Enums
- Use SCREAMING_SNAKE_CASE for constants: `MAX_RETRY_ATTEMPTS`
- Use PascalCase for enums: `CardRarity`, `PlayerStatus`

## Documentation Standards

### Code Comments
- Comment complex business logic
- Explain "why" not "what"
- Keep comments up-to-date with code changes

```typescript
// ✅ Good - Explains why
/**
 * Retries the operation up to 3 times because the blockchain
 * network can be temporarily unavailable during high traffic
 */
const maxRetries = 3;

// ❌ Bad - Explains what (obvious)
// Increment counter by 1
counter++;
```

### JSDoc Documentation
- Document all public methods and interfaces
- Include parameter and return type descriptions
- Provide usage examples for complex APIs

```typescript
/**
 * Loads a remote micro-frontend component with fallback handling
 * 
 * @param config - Configuration for the remote module
 * @param config.remoteEntry - URL to the remote entry point
 * @param config.exposedModule - Name of the exposed module
 * @returns Promise that resolves to the component class or null if loading fails
 * 
 * @example
 * ```typescript
 * const component = await loadRemoteComponent({
 *   remoteEntry: 'http://localhost:4201/remoteEntry.js',
 *   exposedModule: './PlayerCard'
 * });
 * ```
 */
async function loadRemoteComponent(config: RemoteModuleConfig): Promise<ComponentClass | null> {
  // Implementation
}
```

---

*These guidelines should be followed by all AI assistants working on the Top Dog Arena project to ensure consistent, maintainable, and secure code.*

*Last updated: July 18, 2025*
