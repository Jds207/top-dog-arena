# Angular Architecture Guidelines - Business Logic Placement

## 🏗️ **Where to Handle Business Logic That Doesn't Affect the DOM**

### **Answer: Dedicated Business Services**

In Angular applications following best practices, business logic that doesn't directly affect the DOM should be handled in **dedicated business services**, not in components.

## 🎯 **Architecture Principles**

### **1. Component Responsibilities (DOM-Only Logic)**
Components should **ONLY** handle:
- ✅ UI state management (`isLoading`, `showModal`, etc.)
- ✅ User interaction handlers (`onClick`, `onSubmit`)
- ✅ Template data binding and display logic
- ✅ Navigation and routing
- ✅ Form validation display (showing errors)
- ✅ DOM manipulation and lifecycle hooks

```typescript
// ✅ GOOD: Component handles only DOM-affecting logic
export class WalletComponent {
  isLoading = false;           // UI state
  showError = false;           // UI state
  errorMessage = '';           // UI display

  onCreateWallet(): void {
    this.isLoading = true;     // DOM state change
    
    // Delegate business logic to service
    this.walletBusiness.createWallet()
      .subscribe({
        next: (wallet) => {
          this.isLoading = false;  // DOM state change
          this.router.navigate(['/dashboard']); // Navigation
        },
        error: (error) => {
          this.isLoading = false;  // DOM state change
          this.showError = true;   // DOM state change
          this.errorMessage = 'Wallet creation failed'; // Display logic
        }
      });
  }
}
```

### **2. API Service Responsibilities (HTTP-Only Logic)**
API services should **ONLY** handle:
- ✅ HTTP endpoint calls
- ✅ Request/response transformation
- ✅ HTTP error handling
- ✅ Authentication headers
- ✅ Request formatting

```typescript
// ✅ GOOD: API Service handles only HTTP logic
@Injectable()
export class ApiService {
  createWallet(request: CreateWalletRequest): Observable<CreateWalletResponse> {
    return this.http.post<CreateWalletResponse>('/api/wallet/create', request)
      .pipe(
        catchError(this.handleHttpError)
      );
  }
}
```

### **3. Business Service Responsibilities (Business Logic)**
Business services should handle:
- ✅ Data validation and business rules
- ✅ Data transformation and formatting
- ✅ Complex calculations
- ✅ State management (caching, etc.)
- ✅ Cross-service coordination
- ✅ Business workflow orchestration

```typescript
// ✅ GOOD: Business Service handles business logic
@Injectable()
export class WalletBusinessService {
  
  validateWalletAddress(address: string): boolean {
    // Business rule: XRPL address validation
    return /^r[a-zA-Z0-9]{24,34}$/.test(address);
  }

  calculateDisplayBalance(balance: string): string {
    // Business rule: Convert drops to XRP if needed
    const numBalance = parseFloat(balance);
    if (numBalance > 1000) {
      return \`\${(numBalance / 1000000).toFixed(6)} XRP\`;
    }
    return \`\${numBalance} XRP\`;
  }

  createWalletWithValidation(network: XRPLNetwork): Observable<WalletInfo> {
    // Business workflow: validate -> create -> transform
    return this.apiService.createWallet({ network }).pipe(
      map(response => this.transformToWalletInfo(response)),
      catchError(error => this.handleBusinessError(error))
    );
  }
}
```

## 📁 **Recommended File Structure**

```
src/app/
├── components/
│   ├── wallet/
│   │   ├── wallet.component.ts      # DOM logic only
│   │   ├── wallet.component.html    # Template (separate file)
│   │   ├── wallet.component.scss    # Styles (separate file)
│   │   └── wallet.component.spec.ts # Tests
│   └── nft/
│       ├── nft.component.ts
│       ├── nft.component.html
│       ├── nft.component.scss
│       └── nft.component.spec.ts
├── services/
│   ├── api/
│   │   ├── api.service.ts           # HTTP endpoints only
│   │   └── endpoints/
│   │       ├── wallet-api.service.ts
│   │       └── nft-api.service.ts
│   ├── business/
│   │   ├── wallet-business.service.ts  # Business logic
│   │   ├── nft-business.service.ts     # Business logic
│   │   └── validation.service.ts       # Validation rules
│   └── core/
│       ├── error-handling.service.ts
│       └── logging.service.ts
└── models/
    ├── api/                         # API contracts
    │   ├── wallet.models.ts
    │   └── nft.models.ts
    ├── ui/                          # UI-specific models
    │   ├── form.models.ts
    │   └── state.models.ts
    └── base-types.ts                # Common types
```

## 🔄 **Data Flow Architecture**

```
User Interaction
       ↓
   Component (DOM Logic)
       ↓
Business Service (Business Logic)
       ↓
   API Service (HTTP Logic)
       ↓
    Backend API
       ↓
Business Service (Transform Data)
       ↓
   Component (Update UI)
```

## 🚫 **Anti-Patterns to Avoid**

### **❌ DON'T: Put business logic in components**
```typescript
// ❌ BAD: Business logic in component
export class WalletComponent {
  createWallet(): void {
    // ❌ Business validation in component
    if (!this.address || !/^r[a-zA-Z0-9]{24,34}$/.test(this.address)) {
      this.showError = true;
      return;
    }

    // ❌ Business calculation in component  
    const balanceInXRP = this.balance > 1000 
      ? this.balance / 1000000 
      : this.balance;

    // ❌ Direct API call from component
    this.http.post('/api/wallet', { address: this.address })
      .subscribe(response => {
        // ❌ Data transformation in component
        this.wallet = {
          ...response,
          displayBalance: \`\${balanceInXRP} XRP\`
        };
      });
  }
}
```

### **❌ DON'T: Put HTTP logic in business services**
```typescript
// ❌ BAD: HTTP logic mixed with business logic
@Injectable()
export class WalletBusinessService {
  createWallet(address: string): Observable<Wallet> {
    // ❌ HTTP logic in business service
    return this.http.post('/api/wallet', { address }).pipe(
      map(response => response.data) // ❌ HTTP response handling
    );
  }
}
```

## ✅ **Best Practices Summary**

1. **Components**: Handle only DOM-affecting logic, user interactions, and UI state
2. **Business Services**: Handle validation, calculations, transformations, and business rules
3. **API Services**: Handle only HTTP requests and response formatting
4. **Models**: Provide strong TypeScript typing to eliminate `any` types
5. **Separate Files**: Use `.component.html` and `.component.scss` for better maintainability
6. **Dependency Injection**: Use Angular's DI to inject business services into components
7. **Error Handling**: Handle errors at the appropriate layer (HTTP errors in API service, business errors in business service, UI errors in component)

## 🎯 **Migration Strategy**

1. **Create business services** for each domain (wallet, NFT, etc.)
2. **Move business logic** from components to business services
3. **Extract templates and styles** to separate files
4. **Create proper TypeScript models** to replace `any` types
5. **Update components** to use business services instead of direct API calls
6. **Add comprehensive error handling** at each layer

This architecture ensures:
- **Single Responsibility**: Each service has one clear purpose
- **Testability**: Business logic can be tested independently
- **Maintainability**: Changes to business rules don't affect UI code
- **Reusability**: Business services can be used across multiple components
- **Type Safety**: Strong typing eliminates runtime errors
