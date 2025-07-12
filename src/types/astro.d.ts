import type { JwtPayload } from 'jsonwebtoken';

declare module 'astro' {
  interface Locals {
    user?: JwtPayload;
  }
}
