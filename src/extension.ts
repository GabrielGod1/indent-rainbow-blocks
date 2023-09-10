import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('indent-rainbow-blocks extension is now active!'); //Debug msg

  const colorMap: string[] = vscode.workspace.getConfiguration('indentRainbowBlocks').get('colors') as string[] || [
    'rgba(0, 0, 0, 0)',
    'rgba(255, 0, 0, 0.15)',
    'rgba(0, 255, 0, 0.15)',
    'rgba(0, 0, 255, 0.15)'
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
    const indentationFormatter = (activeEditor.options.insertSpaces === false || activeEditor.options.insertSpaces === 'false') ? 'Tabs' : 'Spaces';
    const currentTabSize = activeEditor.options.tabSize as number || 4;
    const tabWidth = currentTabSize;
    // console.log('\n\nEDITOR INFO:')
    // console.log(`- Indentation formatter: ${indentationFormatter}`);
    // console.log(`- Current tab width (settings/editor): ${currentTabSize}`);
    // console.log(`- Fetched tab width (extension read value): ${tabWidth}`);
    // console.log('\nINDENTATION AND COLORING INFO:');

    const text = activeEditor.document.getText();
    const regExNoIndentation = /^[^\s]/gm;
    let regExIndentation = /^[ \t]+/gm;
    if (indentationFormatter === 'Tabs') {
      regExIndentation = /^[\t]+/gm;
    }
    const indentationDecorations: { range: vscode.Range }[][] = colorMap.map(() => []);
    const textBackgroundDecorations: { range: vscode.Range }[][] = colorMap.map(() => []);

    // DETECT NO INDENTATION
    let match;
    if (coloringStyle === 'line') {
      while (match = regExNoIndentation.exec(text)) {
        const start = activeEditor.document.positionAt(match.index);
        const range = new vscode.Range(start.line, 0, start.line, activeEditor.document.lineAt(start.line).range.end.character);
        textBackgroundDecorations[0].push({ range: range });
        // console.log('X No Indentation', `Row: ${start.line + 1}`);
      }
    }

    // DETECT INDENTATION
    while (match = regExIndentation.exec(text)) {
      const start = activeEditor.document.positionAt(match.index);
      let startIndex = 0;
      let indentationLevel = Math.floor(match[0].replace(/\t/g, ' '.repeat(tabWidth)).length / tabWidth);
      let incrementValue = tabWidth;
      if (indentationFormatter === 'Tabs') {
        indentationLevel = (match[0].match(/\t/g) || []).length;
        incrementValue = 1;
      }
      // console.log('√ Indentation', `Row: ${start.line + 1}`, `Indentation #: ${indentationLevel}`);

      // LOCATE COLOR
      for (let i = 0; i <= indentationLevel; i++) {
        const colorIndex = i % colorMap.length;
        // INDENTATION and TEXT
        if (i < indentationLevel) {
          var range = new vscode.Range(start.line, startIndex, start.line, startIndex + incrementValue);
          // if (indentationFormatter === 'Spaces') {
          //   console.log('      Backwards coloring characters:', range.start.character, '-', range.end.character);
          // } else if (indentationFormatter === 'Tabs') {
          //   console.log('      Backwards coloring characters:', range.start.character, '-', range.end.character*tabWidth);
          // }
          indentationDecorations[colorIndex].push({ range: range });

        } else if (i == indentationLevel && coloringStyle === 'line') {
          var range = new vscode.Range(start.line, startIndex, start.line, activeEditor.document.lineAt(start.line).range.end.character);
          textBackgroundDecorations[colorIndex].push({ range: range });
          // if (indentationFormatter === 'Spaces') {
          //   console.log('      Forwards coloring characters:', range.start.character, '-', range.end.character);
          // } else if (indentationFormatter === 'Tabs') {
          //   console.log('      Forwards coloring characters:', range.start.character*tabWidth, '-', range.end.character);
          // }
        }
        // startIndex += tabWidth;
        startIndex += incrementValue;
      }
    }

    // APPLY COLOR
    for (let i = 0; i < colorMap.length; i++) {
      // console.log(`-------------------------------------------------\nIndentation row ${i}:`)
      // console.log('          Color:', indentationDecorationTypes[i]);
      // console.log('          Section:', indentationDecorations[i]);
      // console.log(`Text indentation row ${i}:`);
      // console.log('          Color:', textBackgroundDecorationTypes[i]);
      // console.log('          Section:', textBackgroundDecorations[i]);
      activeEditor.setDecorations(indentationDecorationTypes[i], indentationDecorations[i]);
      activeEditor.setDecorations(textBackgroundDecorationTypes[i], textBackgroundDecorations[i]);
    }
  }

  // THERE IS AN ACTIVE VALID FILE
  if (vscode.window.activeTextEditor) {
    updateDecorations();
  }

  // THERE IS A CHANGE WITHIN THE FILE
  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor) {
      updateDecorations();
    }
  }, null, context.subscriptions);

  // THERE IS A FOCUS TO ANOTHER FILE
  vscode.workspace.onDidChangeTextDocument(event => {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && event.document === activeEditor.document) {
      updateDecorations();
    }
  }, null, context.subscriptions);

  // DYNAMIC UPDATE OF INDENTATION FORMATTER (SPACES OR TABS) - CONFIGURATION LEVEL
  vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('editor.tabSize')) {
      // console.log('Global tab width changed');
      updateDecorations();
    }
  }, null, context.subscriptions);

  // DYNAMIC UPDATE OF INDENTATION FORMATTER (SPACES OR TABS) - CURRENT EDITOR LEVEL
  vscode.window.onDidChangeTextEditorOptions(event => {
    if (event.options.tabSize) {
      // console.log('Local tab width changed');
      updateDecorations();
    }
  }, null, context.subscriptions);

  // DEV DEBUG TO CHECK IF EXTENSION IS RUNNING
  let disposable = vscode.commands.registerCommand('indent-rainbow-blocks.live', () => {
    vscode.window.showInformationMessage('indent-rainbow-blocks extension is running!');
  });
  context.subscriptions.push(disposable);
}

export function deactivate() { }

// NOTES:
// console.log(...) statements are used for debugging purposes