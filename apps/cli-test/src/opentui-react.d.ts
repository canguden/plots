/// <reference types="react" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      box: any;
      text: any;
      select: any;
      scrollbox: any;
      input: any;
      textarea: any;
      'tab-select': any;
      'ascii-font': any;
      'line-number': any;
      code: any;
      diff: any;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicAttributes {
      fg?: string;
    }
  }
  
  interface HTMLAttributes<T> {
    fg?: string;
  }
}

export {};
