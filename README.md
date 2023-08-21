# <img src="https://raw.githubusercontent.com/GabrielGod1/indent-rainbow-blocks/main/img/logo.png" width="30" height="30"> indent-rainbow-blocks README

"indent-rainbow-blocks" is a Visual Studio Code extension that adds a colorful background to the indentation blocks in your code. This feature allows you to quickly visualize and navigate your code structure.

## Features

- Colorful Indentation Blocks: Adds a rainbow of colors to your code's indentation. The colors change with each level of indentation, making it easy to distinguish between different levels.

- Customization: Change the colors used for indentation blocks and the style according to your preferences.
  - Coloring example (default and custom):

  <img src="img/color_default.png" alt="Default color" style="margin-left: 40px; margin-top: 10px; margin-top: 10px; width:399; height:332">
  <img src="img/color_custom.png" alt="Custom color" style="margin-left: 40px; margin-top: 10px; width:399; height:332">
  
  - Style example (line and fall):

  <img src="img/style_line.png" alt="Line style" style="margin-left: 40px; margin-top: 10px; width:399; height:332">
  <img src="img/style_fall.png" alt="Fall style" style="margin-left: 40px; margin-top: 10px; width:399; height:332">
  
  <br>
  
        Note: The images above are just examples. Try the extension to see different colors in action!
- P/M Languages supported: As long as the typing involves indentation, the extension will be compatible. This includes html, css, javascript, python, json, among others.

## Requirements

- Visual Studio Code

## Extension Settings

This extension contributes the following settings:

* `indentRainbowBlocks.colors`: An array of RGBA color strings that define the colors used for indentation blocks.
```json
  "indentRainbowBlocks.colors": [
      "rgba(0, 0, 0, 0)",
      "rgba(255, 0, 0, 0.15)",
      "rgba(0, 255, 0, 0.15)",
      "rgba(0, 0, 255, 0.15)"
  ],
```
* `indentRainbowBlocks.style`: Determines the coloring style, either 'line' for full line background color or 'fall' for coloring only the indentation.
```json
  "indentRainbowBlocks.style": "line"
```


## Known Issues

None at the moment. Please report any issues you find on the GitHub repository.

## Release Notes

### 0.0.1

Initial release of "indent-rainbow-blocks". It includes color and style customizations.

---
