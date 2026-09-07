import * as vscode from 'vscode';

export function setTabDecoration(
  treeItem: vscode.TreeItem,
  tab: vscode.Tab,
  iconType: string = 'file',
): void {
  if (!tab.isDirty) {
    return;
  }

  if (treeItem.label) {
    treeItem.label = `⦿ ${treeItem.label}`;
  }
  treeItem.tooltip = 'Unsaved';
  treeItem.iconPath = new vscode.ThemeIcon(iconType, new vscode.ThemeColor('charts.orange'));
}
