// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type * as React from 'react';

/**
 * This code extends the CSSProperties interface in React to allow for custom CSS properties (CSS variables).
 */
declare module 'react' {
  interface CSSProperties {
    [index: `--${ string }`]: string;

    // Common CSS properties
    "--bg"?: string, // Bg value provider. Can be consumed using `-bg` token like `bg-bg` or `fg-bg` or `border-bg`
    "--p"?: string,
  }
}