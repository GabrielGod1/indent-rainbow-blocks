# indent-rainbow-blocks README

"indent-rainbow-blocks" is a Visual Studio Code extension that adds a colorful background to the indentation blocks in your code. This feature allows you to quickly visualize and navigate your code structure.

## Features

• Colorful Indentation Blocks: Adds a rainbow of colors to your code's indentation blocks. The colors change with each level of indentation, making it easy to distinguish between different levels.

• Customizable Colors: Customize the colors used for indentation blocks and full line backgrounds according to your preferences.

- Indentation coloring example

- Full line background color example

Note: The images above are just examples. Try the extension yourself to see the colors in action!

\!\[feature X\]\(images/feature-x.png\)

## Requirements

• Visual Studio Code

## Extension Settings

This extension contributes the following settings:

* `indentRainbowBlocks.colors`: An array of RGBA color strings that define the colors used for indentation blocks.
* `indentRainbowBlocks.style`: Determines the coloring style, either 'line' for full line background color or any other value for indentation blocks.

For example:
  "indentRainbowBlocks.colors": [
      "rgba(0, 0, 0, 0)",
      "rgba(255, 0, 0, 0.15)",
      "rgba(0, 255, 0, 0.15)",
      "rgba(0, 0, 255, 0.15)"
  ],
  "indentRainbowBlocks.style": "line"


## Known Issues

None at the moment. Please report any issues you find on the GitHub repository.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of "indent-rainbow-blocks".
Added colorful indentation blocks.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
