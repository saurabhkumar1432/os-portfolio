import { useClipboardStore } from '../store/clipboardStore';

/**
 * Clipboard monitoring service
 * Monitors system clipboard and adds items to history
 */
class ClipboardService {
  private isMonitoring = false;
  private lastContent = '';
  private checkInterval: number | null = null;

  /**
   * Start monitoring clipboard changes
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Check clipboard every 2 seconds
    this.checkInterval = window.setInterval(async () => {
      await this.checkClipboard();
    }, 2000);
  }

  /**
   * Stop monitoring clipboard
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check clipboard for new content
   */
  private async checkClipboard() {
    try {
      if (!navigator.clipboard) return;
      
      const text = await navigator.clipboard.readText();
      
      // Only add if content changed
      if (text && text !== this.lastContent && text.length > 0) {
        this.lastContent = text;
        useClipboardStore.getState().addItem(text);
      }
    } catch (error) {
      // Clipboard access denied or not available
      // This is expected when app doesn't have focus
      console.debug('Clipboard access:', error);
    }
  }

  /**
   * Manually add content to clipboard history
   */
  addToHistory(content: string) {
    if (content && content.length > 0) {
      useClipboardStore.getState().addItem(content);
      this.lastContent = content;
    }
  }

  /**
   * Copy content to system clipboard
   */
  async copyToClipboard(content: string): Promise<boolean> {
    try {
      if (!navigator.clipboard) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
      }
      
      await navigator.clipboard.writeText(content);
      this.lastContent = content;
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Get current clipboard content
   */
  async getCurrentClipboard(): Promise<string | null> {
    try {
      if (!navigator.clipboard) return null;
      return await navigator.clipboard.readText();
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if clipboard API is available
   */
  isAvailable(): boolean {
    return 'clipboard' in navigator;
  }
}

export const clipboardService = new ClipboardService();
