import { describe, expect, jest, test } from '@jest/globals';
import { ExclusiveHandle } from '../utils/event';

describe('ExclusiveHandle', () => {
  test('runs the latest action requested while another action is active', async () => {
    const handle = new ExclusiveHandle();
    const actions: string[] = [];
    let releaseFirstAction!: () => void;
    const firstActionReleased = new Promise<void>(resolve => {
      releaseFirstAction = resolve;
    });

    const first = handle.run(async () => {
      actions.push('first:start');
      await firstActionReleased;
      actions.push('first:end');
    });
    const skipped = jest.fn(async () => {
      actions.push('skipped');
    });
    const second = handle.run(skipped);
    const latest = handle.run(async () => {
      actions.push('latest');
    });

    await Promise.resolve();
    expect(actions).toEqual(['first:start']);
    releaseFirstAction();
    await Promise.all([first, second, latest]);

    expect(skipped).not.toHaveBeenCalled();
    expect(actions).toEqual(['first:start', 'first:end', 'latest']);
  });

  test('runs a pending action after the active action fails', async () => {
    const handle = new ExclusiveHandle();
    let releaseFirstAction!: () => void;
    const firstActionReleased = new Promise<void>(resolve => {
      releaseFirstAction = resolve;
    });
    const pending = jest.fn(async () => {});

    const first = handle.run(async () => {
      await firstActionReleased;
      throw new Error('activation failed');
    });
    const second = handle.run(pending);

    releaseFirstAction();
    await expect(first).rejects.toThrow('activation failed');
    await expect(second).resolves.toBeUndefined();
    expect(pending).toHaveBeenCalledTimes(1);
  });
});
