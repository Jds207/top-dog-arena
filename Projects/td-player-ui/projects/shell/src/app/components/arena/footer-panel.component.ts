import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FooterStats {
  nftsMinted: number;
  totalNFTs: number;
  monthlyLimit: number;
}

@Component({
  selector: 'footer-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer-panel bg-slate-900 border-t border-slate-700 mt-12 py-8">
      <div class="max-w-6xl mx-auto px-4">
        <!-- Main Footer Content -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          <!-- NFT Mint Tracker -->
          <div class="mint-tracker text-center md:text-left">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center justify-center md:justify-start">
              <span class="mr-2">💎</span>
              NFT Mint Tracker
            </h3>
            <div class="mint-progress mb-4">
              <div class="flex justify-between text-sm text-slate-300 mb-2">
                <span>{{ stats.nftsMinted }} minted</span>
                <span>{{ stats.totalNFTs }} total</span>
              </div>
              <div class="progress-bar bg-slate-700 rounded-full h-3 overflow-hidden">
                <div class="progress-fill bg-gradient-to-r from-orange-500 to-yellow-500 h-full transition-all duration-700"
                     [style.width.%]="mintProgress"></div>
              </div>
              <div class="text-xs text-slate-400 mt-2 text-center md:text-left">
                {{ remainingNFTs }} NFTs remaining this month
              </div>
            </div>
          </div>
          
          <!-- Social Links -->
          <div class="social-links text-center">
            <h3 class="text-lg font-bold text-white mb-4">
              🌐 Connect With Us
            </h3>
            <div class="flex justify-center space-x-6">
              <a href="https://twitter.com/topdogarena" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 class="social-link text-slate-400 hover:text-orange-500 transition-colors duration-300">
                <div class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-all duration-300">
                  <span class="text-xl">𝕏</span>
                </div>
              </a>
              
              <a href="https://discord.gg/topdogarena" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 class="social-link text-slate-400 hover:text-orange-500 transition-colors duration-300">
                <div class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-all duration-300">
                  <span class="text-xl">💬</span>
                </div>
              </a>
              
              <a href="https://instagram.com/topdogarena" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 class="social-link text-slate-400 hover:text-orange-500 transition-colors duration-300">
                <div class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-all duration-300">
                  <span class="text-xl">📷</span>
                </div>
              </a>
              
              <a href="https://youtube.com/@topdogarena" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 class="social-link text-slate-400 hover:text-orange-500 transition-colors duration-300">
                <div class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-all duration-300">
                  <span class="text-xl">📺</span>
                </div>
              </a>
            </div>
          </div>
          
          <!-- Legal Links -->
          <div class="legal-links text-center md:text-right">
            <h3 class="text-lg font-bold text-white mb-4">
              📋 Legal & Support
            </h3>
            <div class="space-y-2">
              <div>
                <a href="/disclaimers" 
                   class="text-slate-400 hover:text-orange-500 transition-colors duration-300 text-sm">
                  Legal Disclaimers
                </a>
              </div>
              <div>
                <a href="/terms" 
                   class="text-slate-400 hover:text-orange-500 transition-colors duration-300 text-sm">
                   Terms of Service
                </a>
              </div>
              <div>
                <a href="/privacy" 
                   class="text-slate-400 hover:text-orange-500 transition-colors duration-300 text-sm">
                  Privacy Policy
                </a>
              </div>
              <div>
                <a href="/support" 
                   class="text-slate-400 hover:text-orange-500 transition-colors duration-300 text-sm">
                  Support Center
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Bottom Bar -->
        <div class="border-t border-slate-700 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div class="text-slate-400 text-sm mb-4 md:mb-0">
            © 2025 Top Dog Arena. All rights reserved. 
            <span class="text-orange-500">Built for champions.</span>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="text-slate-400 text-xs">
              Powered by XRP Ledger & Flare Network
            </div>
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="System Online"></div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-panel {
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
      backdrop-filter: blur(10px);
    }
    
    .social-link {
      transition: all 0.3s ease;
    }
    
    .social-link:hover {
      transform: translateY(-2px);
    }
    
    .progress-fill {
      transition: width 0.7s ease-out;
      box-shadow: 0 0 20px rgba(249, 115, 22, 0.5);
    }
    
    .mint-tracker {
      position: relative;
    }
    
    .mint-tracker::before {
      content: '';
      position: absolute;
      top: -10px;
      left: -10px;
      right: -10px;
      bottom: -10px;
      background: linear-gradient(45deg, transparent, rgba(249, 115, 22, 0.1), transparent);
      border-radius: 12px;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: -1;
    }
    
    .mint-tracker:hover::before {
      opacity: 1;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
    
    .animate-pulse {
      animation: pulse 2s infinite;
    }
  `]
})
export class FooterPanelComponent {
  @Input() stats: FooterStats = {
    nftsMinted: 328,
    totalNFTs: 500,
    monthlyLimit: 500
  };
  
  get mintProgress(): number {
    return (this.stats.nftsMinted / this.stats.totalNFTs) * 100;
  }
  
  get remainingNFTs(): number {
    return this.stats.totalNFTs - this.stats.nftsMinted;
  }
}
