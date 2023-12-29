// Shared helper types

export type TypeAorB<A, B> =
  | ({ [keyA in keyof A]: A[keyA] } & { [keyB in Exclude<keyof B, keyof A>]?: never })
  | ({ [keyB in keyof B]: B[keyB] } & { [keyA in Exclude<keyof A, keyof B>]?: never });

export interface Style {
  (char: string): string;
}

export type ConsoleDimensions = ReturnType<typeof Deno.consoleSize>;
