import { BaseSignal, computed, type MaybeSignal } from "@tui/signals";

export function maybeComputed<V>(value: MaybeSignal<V>, callback: (value: V) => void) {
  if (value instanceof BaseSignal) {
    computed([value], callback);
  } else {
    callback(value);
  }
}
