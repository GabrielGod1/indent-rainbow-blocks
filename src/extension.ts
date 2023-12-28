import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('indent-rainbow-blocks extension is now active!'); //Debug msg


  // STATUS BAR ITEM
  const colorSelectorStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
  colorSelectorStatusBarItem.text = "$(symbol-color)";
  colorSelectorStatusBarItem.tooltip = "Open color selector";
  colorSelectorStatusBarItem.command = 'indent-rainbow-blocks.openColorSelector';

  let currentPanel: vscode.WebviewPanel | undefined = undefined;

  context.subscriptions.push(vscode.commands.registerCommand('indent-rainbow-blocks.openColorSelector', () => {
    showColorSelector();
  }));

  function showColorSelector() {
    const columnToShowIn = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    if (currentPanel) {
      currentPanel.reveal(columnToShowIn);
    } else {
      currentPanel = vscode.window.createWebviewPanel(
        'colorSelector',
        'Color Selector',
        columnToShowIn || vscode.ViewColumn.One,
        {
          // restricted resources for the webview
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, 'webview'),
            vscode.Uri.joinPath(context.extensionUri, 'img')
          ],
          enableScripts: true,
          retainContextWhenHidden: true // Retain the webview content when hidden
        }
      );

      // html-svg: Replacing content method, css-js: Using Uri VS code reference method
      const htmlPath = vscode.Uri.joinPath(context.extensionUri, 'webview', 'colorSelector.html');
      const htmlSrc = vscode.workspace.fs.readFile(htmlPath).then(buffer => buffer.toString());

      const svgPath = vscode.Uri.joinPath(context.extensionUri, 'img', 'previewFinalVersion.svg');
      const svgSrc = vscode.workspace.fs.readFile(svgPath).then(buffer => buffer.toString());

      const logoPath = vscode.Uri.joinPath(context.extensionUri, 'img', 'logo.svg');
      currentPanel!.iconPath = logoPath;

      const cssPath = vscode.Uri.joinPath(context.extensionUri, 'webview', 'styles.css');
      const cssUri = currentPanel.webview.asWebviewUri(cssPath).toString();

      const jsPath = vscode.Uri.joinPath(context.extensionUri, 'webview', 'functions.js');
      const jsUri = currentPanel.webview.asWebviewUri(jsPath).toString();

      // Generalities about VS Code cspSource:
      // {webview.cspSource} will apply for external resources like src, href. This will have no application or use for elements contained explicitly in the html main file, even with nonces applied
      // The use of {webview.cspSource} may be omitted as long as a nonce it's applied (only apply for external resources)
      // Notes about the used approach:
      // Styles: webview.csp is restricted to external resources, so we can use 1. 'self' {webview.csp} 'unsafe-inline' to allow the svg inline styles not to break the csp, or 2. remove every inline class from the svg object and add them into the css file (more secure but requires manual work, it was applied into the extension for the simplicity of our svgs)
      // Scripts: webview.csp is restricted to external resources, so the event handlers like <buttons> properties onclick() are removed from the html main file, and handled directly in the external resources with js functionality
      const cspSource = currentPanel!.webview.cspSource;

      function generateNonce(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const nonceLength = 32;
        let result = '';
        for (let i = 0; i < nonceLength; i++) {
          result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
      }
      // const nonce1 = generateNonce();
      // const nonce2 = generateNonce();

      htmlSrc.then(htmlContent => {
        const htmlContentUpdatedUri = htmlContent.replace('${styles.css}', cssUri).replace('${functions.js}', jsUri).replace(/\${cspSource}/g, cspSource);
        // const htmlContentUpdatedNonce = htmlContentUpdatedUri.replace(/\${nonce1}/g, nonce1).replace(/\${nonce2}/g, nonce2);
        currentPanel!.webview.html = htmlContentUpdatedUri;
      });

      currentPanel!.webview.onDidReceiveMessage(
        message => {
          switch (message.command) {
            case 'contentLoaded?':
              // vscode.window.showInformationMessage('Content successfully loaded'); //DEBUG
              svgSrc.then(svgContent => {
                currentPanel!.webview.postMessage({ command: 'contentLoadedTrue', data: svgContent });
              });
              break;
            case 'currentSettingsRequest':
              // vscode.window.showInformationMessage('Current settings request received'); //DEBUG
              const currentSettings = vscode.workspace.getConfiguration('indentRainbowBlocks');
              const cuSeColors = currentSettings.get('colors', []);
              const cuSeStyle = currentSettings.get('style', '');
              const cuSe = { cuSeColors, cuSeStyle };
              const cuSeData = cuSe;

              currentPanel!.webview.postMessage({ command: 'currentSettingsResponse', data: cuSeData });
              break;
            case 'saveSettingsRequest':
              // vscode.window.showInformationMessage('Save settings request received'); //DEBUG
              const currentSettings_ = vscode.workspace.getConfiguration('indentRainbowBlocks');
              const newSettings_ = message.data;
              currentSettings_.update('colors', newSettings_.rgbaValues, vscode.ConfigurationTarget.Global);
              currentSettings_.update('style', newSettings_.colorStyle, vscode.ConfigurationTarget.Global);

              currentPanel!.webview.postMessage({ command: 'saveSettingsResponse', data: '' });
              break;
          }
        },
        undefined,
        context.subscriptions
      );

      // Reset when the current panel is closed
      currentPanel.onDidDispose(
        () => {
          currentPanel = undefined;
        },
        null,
        context.subscriptions
      );
    }
  }

  // Add the status bar item to the extension context subscriptions
  context.subscriptions.push(colorSelectorStatusBarItem);

  // Show the status bar item
  colorSelectorStatusBarItem.show();


  // START UP SETTINGS
  // console.log(' ----- StartUp settings:'); // DEBUGGING current settings

  let colorMap: string[] = vscode.workspace.getConfiguration('indentRainbowBlocks').get('colors') as string[];
  // console.log('Color Array:', colorMap);

  let coloringStyle: string = vscode.workspace.getConfiguration('indentRainbowBlocks').get('style') as string;
  // console.log('Color Style:', coloringStyle);

  let indentationDecorationTypes = colorMap.map(color => vscode.window.createTextEditorDecorationType({
    backgroundColor: color,
    // isWholeLine: true
  }));
  let textBackgroundDecorationTypes = colorMap.map(color => vscode.window.createTextEditorDecorationType({
    backgroundColor: color,
    // isWholeLine: true
  }));

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
    // console.log('updateDecorations() has detected the following color map:', colorMap); // DEBUGGING recognized color style for application
    // console.log('updateDecorations() has detected the following color style:', (coloringStyle !== 'fall') ? 'line (default)' : 'fall'); // DEBUGGING recognized color style for application

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
      // Apply 1st background color to the line range only if there's no indentation and the color style is line, default is transparent
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
        // INDENTATION
        if (i < indentationLevel) {
          var range = new vscode.Range(start.line, startIndex, start.line, startIndex + incrementValue);
          // if (indentationFormatter === 'Spaces') {
          //   console.log('      Backwards coloring characters:', range.start.character, '-', range.end.character);
          // } else if (indentationFormatter === 'Tabs') {
          //   console.log('      Backwards coloring characters:', range.start.character, '-', range.end.character*tabWidth);
          // }
          indentationDecorations[colorIndex].push({ range: range });

          // TEXT
        } else if (i === indentationLevel && coloringStyle !== 'fall') {
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

    // DEBUG BACKGROUND COLOR APPLICATION
    // console.log('Colored indents number (index) rows:', indentationDecorations);
    // console.log('Colored text number (index) rows:', textBackgroundDecorations);
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
  let changeTimeout: NodeJS.Timeout | null = null;
  vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('editor.tabSize')) {
      // console.log('Global tab width changed'); // Debug new tab size
      updateDecorations();
    }

    if (event.affectsConfiguration('indentRainbowBlocks.style')) {
      coloringStyle = vscode.workspace.getConfiguration('indentRainbowBlocks').get('style') as string;
      // console.log(`Color style changed to: ${coloringStyle}`); // Debug new color style
      updateDecorations();
    }

    // For the color case, there is a special refresh since when only updating the colors the new ones will apply above the old ones successively
    if (event.affectsConfiguration('indentRainbowBlocks.colors')) {
      colorMap = vscode.workspace.getConfiguration('indentRainbowBlocks').get('colors') as string[];

      // Clear existing decoration types
      indentationDecorationTypes.forEach(type => type.dispose());
      textBackgroundDecorationTypes.forEach(type => type.dispose());

      indentationDecorationTypes = colorMap.map(color => vscode.window.createTextEditorDecorationType({
        backgroundColor: color,
      }));
      textBackgroundDecorationTypes = colorMap.map(color => vscode.window.createTextEditorDecorationType({
        backgroundColor: color,
      }));
      // console.log(`Color map changed to: ${colorMap}`); // Debug new color map
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