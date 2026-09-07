import * as vscode from 'vscode';

export function setTabDecoration(treeItem: vscode.TreeItem, tab: vscode.Tab): void {
  if (!tab.isDirty && !tab.isPinned) {
    return;
  }

  if (treeItem.label) {
    const prefix = tab.isPinned ? (tab.isDirty ? '📌︎⏺' : '📌︎') : '⏺';
    treeItem.label = `${prefix} ${treeItem.label}`;
  }
}
