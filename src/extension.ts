import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('indent-rainbow-blocks extension is now active!'); //Debug msg

  const colorMap: string[] = vscode.workspace.getConfiguration('indentRainbowBlocks').get('colors') as string[] || [
    'rgba(240, 240, 240, 0.1)',
    'rgba(255, 0, 0, 0.1)',
    'rgba(0, 255, 0, 0.1)',
    'rgba(0, 0, 255, 0.1)'
  ];
  const indentationDecorationTypes = colorMap.map(color => vscode.window.createTextEditorDecorationType({
    backgroundColor: color,
    // isWholeLine: true
  }));
  const textBackgroundDecorationTypes = colorMap.map(color => vscode.window.createTextEditorDecorationType({
    backgroundColor: color,
    // isWholeLine: true
  }));

  const coloringStyle: string = vscode.workspace.getConfiguration('indentRainbowBlocks').get('style') as string || 'line';

  // -- Store/update colors
  function updateDecorations() {
    let activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      return;
    }

    const text = activeEditor.document.getText();
    const regExIndentation = /^[ \t]+/gm;
    const regExNoIndentation = /^[^\s]/gm;
    const tabWidth = vscode.workspace.getConfiguration('editor').get('tabSize') as number || 4;

    const indentationDecorations: { range: vscode.Range }[][] = colorMap.map(() => []);
    const textBackgroundDecorations: { range: vscode.Range }[][] = colorMap.map(() => []);

    let match;
    if (coloringStyle === 'line') {
      while (match = regExNoIndentation.exec(text)) {
        const start = activeEditor.document.positionAt(match.index);
        const range = new vscode.Range(start.line, start.character, start.line, activeEditor.document.lineAt(start.line).range.end.character);
        textBackgroundDecorations[0].push({ range: range });
      }
    }
    while (match = regExIndentation.exec(text)) {
      const start = activeEditor.document.positionAt(match.index);
      const indentationLevel = Math.floor(match[0].replace(/\t/g, ' '.repeat(tabWidth)).length / tabWidth);
      let startIndex = start.character; // =0

      for (let i = 0; i <= indentationLevel; i++) {
        const colorIndex = i % colorMap.length;
        if (i < indentationLevel) {
          var range = new vscode.Range(start.line, startIndex, start.line, startIndex + tabWidth);
          indentationDecorations[colorIndex].push({ range: range });
        } else if (i == indentationLevel && coloringStyle === 'line') {
          var range = new vscode.Range(start.line, startIndex, start.line, activeEditor.document.lineAt(start.line).range.end.character);
          indentationDecorations[colorIndex].push({ range: range });
        }  
        startIndex += tabWidth;
      }  
    }  
    for (let i = 0; i < colorMap.length; i++) {
      activeEditor.setDecorations(indentationDecorationTypes[i], indentationDecorations[i]);
      activeEditor.setDecorations(textBackgroundDecorationTypes[i], textBackgroundDecorations[i]);
    }
  }

  if (vscode.window.activeTextEditor) {
    updateDecorations();
  }

  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor) {
      updateDecorations();
    }
  }, null, context.subscriptions);

  vscode.workspace.onDidChangeTextDocument(event => {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && event.document === activeEditor.document) {
      updateDecorations();
    }
  }, null, context.subscriptions);

  let disposable = vscode.commands.registerCommand('indent-rainbow-blocks.live', () => {
    vscode.window.showInformationMessage('indent-rainbow-blocks extension is running!');
  });
  context.subscriptions.push(disposable);
}

export function deactivate() { }
