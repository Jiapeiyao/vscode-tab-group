/**
 * When an change event is fired, prevent mutual event triggering (infinite loop)
 */
export class ExclusiveHandle {
  private running: Promise<void> | undefined;
  private pending:
    | {
        listener: () => PromiseLike<void> | void;
        waiters: Array<{ resolve: () => void; reject: (error: unknown) => void }>;
      }
    | undefined;

  run(listener: () => PromiseLike<void> | void): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.running) {
        const waiter = { resolve, reject };
        if (this.pending) {
          this.pending.listener = listener;
          this.pending.waiters.push(waiter);
        } else {
          this.pending = { listener, waiters: [waiter] };
        }
        return;
      }

      this.start(listener, [{ resolve, reject }]);
    });
  }

  private start(
    listener: () => PromiseLike<void> | void,
    waiters: Array<{ resolve: () => void; reject: (error: unknown) => void }>,
  ): void {
    const result = Promise.resolve().then(listener);
    this.running = result
      .then(
        () => waiters.forEach(waiter => waiter.resolve()),
        error => waiters.forEach(waiter => waiter.reject(error)),
      )
      .finally(() => {
        this.running = undefined;
        const pending = this.pending;
        this.pending = undefined;
        if (pending) {
          this.start(pending.listener, pending.waiters);
        }
      });
  }
}
