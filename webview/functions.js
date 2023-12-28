const vscode = acquireVsCodeApi();
const svgColors = [
  'g6819',
  'g6784',
  'g6788',
  'g6803'
];
let lineStyle;
let fallStyle;

vscode.postMessage({
  command: 'contentLoaded?',
  data: ''
});

window.addEventListener('message', event => {
  switch (event.data.command) {
    case 'contentLoadedTrue':
      const svgElement = event.data.data;
      const svgContainer = document.getElementById('indentationExample');
      svgContainer.innerHTML = `<h2>Preview</h2>${svgElement}`;

      // -- Color picker
      svgColors.forEach((colorId, index) => {
        const rgbInput = document.querySelector(`#rgb${index + 1}`);
        const alphaInput = document.querySelector(`#alpha${index + 1}`);
        const alphaValue = document.querySelector(`#alphaValue${index + 1}`);
        const rgbaValue = document.querySelector(`#rgbaValue${index + 1}`);
        const svgPaths = document.querySelectorAll(`#${colorId} path`);

        const updateValues = () => {
          const rgbString = `rgba(${parseInt(rgbInput.value.slice(1, 3), 16)}, ${parseInt(rgbInput.value.slice(3, 5), 16)}, ${parseInt(rgbInput.value.slice(5, 7), 16)}, ${alphaInput.value})`;

          svgPaths.forEach(svgPath => {
            svgPath.style.fill = rgbInput.value;
            svgPath.style.fillOpacity = alphaInput.value;
          });

          rgbaValue.textContent = rgbString;
        };

        rgbInput.addEventListener('input', updateValues);
        alphaInput.addEventListener('input', () => {
          alphaValue.textContent = alphaInput.value;
          updateValues();
        });
      });

      // -- Color picker in set
      const generalRgbInput = document.querySelector('#rgb\\*');
      const generalAlphaInput = document.querySelector('#alpha\\*');
      const generalAlphaValue = document.querySelector('#alphaValue\\*');
      const generalRgbaValue = document.querySelector('#rgbaValue\\*');

      svgColors.forEach((colorId, index) => {
        const rgbInput = document.querySelector(`#rgb${index + 1}`);
        const alphaInput = document.querySelector(`#alpha${index + 1}`);
        const alphaValue = document.querySelector(`#alphaValue${index + 1}`);
        const rgbaValue = document.querySelector(`#rgbaValue${index + 1}`);
        const svgPaths = document.querySelectorAll(`#${colorId} path`);

        const updateValues = (type) => {
          const rgbStringRgb = `rgba(${parseInt(generalRgbInput.value.slice(1, 3), 16)}, ${parseInt(generalRgbInput.value.slice(3, 5), 16)}, ${parseInt(generalRgbInput.value.slice(5, 7), 16)}, ${alphaInput.value})`;
          const rgbStringA = `rgba(${parseInt(rgbInput.value.slice(1, 3), 16)}, ${parseInt(rgbInput.value.slice(3, 5), 16)}, ${parseInt(rgbInput.value.slice(5, 7), 16)}, ${generalAlphaInput.value})`;
          svgPaths.forEach(svgPath => {
            if (type === 'rgb') {
              svgPath.style.fill = generalRgbInput.value;
            } else if (type === 'a') {
              svgPath.style.fillOpacity = generalAlphaInput.value;
            }
          });

          // Set general values
          if (type === 'rgb') {
            rgbInput.value = generalRgbInput.value;
            rgbaValue.textContent = rgbStringRgb;
          } else if (type === 'a') {
            alphaInput.value = generalAlphaInput.value;
            alphaValue.textContent = generalAlphaInput.value;
            rgbaValue.textContent = rgbStringA;
          }
        };

        // Update SVG and display values (1 event listener based on each individual control, so 4 are attached to the picker in set)
        generalRgbInput.addEventListener('input', () => updateValues('rgb'));
        generalAlphaInput.addEventListener('input', () => updateValues('a'));
      });

      // Set visual values for the picker set
      generalRgbInput.addEventListener('input', () => {
        generalRgbaValue.textContent = `rgba(${parseInt(generalRgbInput.value.slice(1, 3), 16)}, ${parseInt(generalRgbInput.value.slice(3, 5), 16)}, ${parseInt(generalRgbInput.value.slice(5, 7), 16)}, ${generalAlphaInput.value})`;
      });
      generalAlphaInput.addEventListener('input', () => {
        generalAlphaValue.textContent = generalAlphaInput.value;
        generalRgbaValue.textContent = `rgba(${parseInt(generalRgbInput.value.slice(1, 3), 16)}, ${parseInt(generalRgbInput.value.slice(3, 5), 16)}, ${parseInt(generalRgbInput.value.slice(5, 7), 16)}, ${generalAlphaInput.value})`;
      });

      // -- Coloring style
      lineStyle = document.getElementById('lineStyle');
      fallStyle = document.getElementById('fallStyle');

      const gPath1L = document.querySelectorAll("#svg5 g")[4].querySelectorAll("path")[0];
      const gPath2L = document.querySelectorAll("#svg5 g")[3].querySelectorAll("path")[0];
      const gPath3L = document.querySelectorAll("#svg5 g")[2].querySelectorAll("path")[0];
      const gPath4L = document.querySelectorAll("#svg5 g")[1].querySelectorAll("path")[0];
      const gPath1F = document.querySelectorAll("#svg5 g")[4].querySelectorAll("path")[1];
      const gPath2F = document.querySelectorAll("#svg5 g")[3].querySelectorAll("path")[1];
      const gPath3F = document.querySelectorAll("#svg5 g")[2].querySelectorAll("path")[1];
      const gPath4F = document.querySelectorAll("#svg5 g")[1].querySelectorAll("path")[1];

      lineStyle.addEventListener('change', () => {
        gPath1L.style.display = 'block';
        gPath2L.style.display = 'block';
        gPath3L.style.display = 'block';
        gPath4L.style.display = 'block';
        gPath1F.style.display = 'none';
        gPath2F.style.display = 'none';
        gPath3F.style.display = 'none';
        gPath4F.style.display = 'none';
      });

      fallStyle.addEventListener('change', () => {
        gPath1L.style.display = 'none';
        gPath2L.style.display = 'none';
        gPath3L.style.display = 'none';
        gPath4L.style.display = 'none';
        gPath1F.style.display = 'block';
        gPath2F.style.display = 'block';
        gPath3F.style.display = 'block';
        gPath4F.style.display = 'block';
      });

      // onclick functionality is not assigned directly into html buttons since native VS code csp doesn't allow them, neither with nonce implementation
      document.querySelectorAll("button")[0].addEventListener('click', function() {
        this.textContent = '...';
        setTimeout(() => {
          this.textContent = 'Show Default Settings';
        }, 1000 * 0.6);
        defaultSettings();
      });
      document.querySelectorAll("button")[1].addEventListener('click', function() {
        this.textContent = '...';
        setTimeout(() => {
          this.textContent = 'Show Current Settings';
        }, 1000 * 0.6);
        currentSettings();
      });
      document.querySelectorAll("button")[2].addEventListener('click', function() {
        this.textContent = 'Saved';
        setTimeout(() => {
          this.textContent = 'Save New Settings';
        }, 1000 * 0.7);
        saveSettings();
      });
      break;
    case 'currentSettingsResponse':
      const currentValues = transformToObjectArray(event.data.data.cuSeColors);

      svgColors.forEach((colorId, index) => {
        const rgbInput = document.querySelector(`#rgb${index + 1}`);
        const alphaInput = document.querySelector(`#alpha${index + 1}`);
        const alphaValue = document.querySelector(`#alphaValue${index + 1}`);
        const rgbaValue = document.querySelector(`#rgbaValue${index + 1}`);
        const svgPaths = document.querySelectorAll(`#${colorId} path`);

        const updateValues = () => {
          const rgbString = `rgba(${currentValues[index].r}, ${currentValues[index].g}, ${currentValues[index].b}, ${currentValues[index].a})`;
          svgPaths.forEach(svgPath => {
            svgPath.style.fill = rgbInput.value;
            svgPath.style.fillOpacity = alphaInput.value;
          });
          rgbaValue.textContent = rgbString;
        };

        // Set default values
        rgbInput.value = `#${currentValues[index].r.toString(16).padStart(2, '0')}${currentValues[index].g.toString(16).padStart(2, '0')}${currentValues[index].b.toString(16).padStart(2, '0')}`;
        alphaInput.value = currentValues[index].a;
        alphaValue.textContent = currentValues[index].a;

        // Update SVG and display values
        updateValues();
      });

      lineStyle = document.getElementById('lineStyle');
      fallStyle = document.getElementById('fallStyle');
      const currentStyle = event.data.data.cuSeStyle;
      const clickEvent = new Event('change');
      if (currentStyle === 'fall') {
        fallStyle.checked = true;
        fallStyle.dispatchEvent(clickEvent);
      } else {
        lineStyle.checked = true;
        lineStyle.dispatchEvent(clickEvent);
      }
      break;
    case 'saveSettingsResponse':
      break;
  }
});

// -- Buttons functions
function defaultSettings() {
  const defaultValues = [
    { r: 0, g: 0, b: 0, a: 0 },
    { r: 255, g: 0, b: 0, a: 0.15 },
    { r: 0, g: 255, b: 0, a: 0.15 },
    { r: 0, g: 0, b: 255, a: 0.15 },
  ];

  svgColors.forEach((colorId, index) => {
    const rgbInput = document.querySelector(`#rgb${index + 1}`);
    const alphaInput = document.querySelector(`#alpha${index + 1}`);
    const alphaValue = document.querySelector(`#alphaValue${index + 1}`);
    const rgbaValue = document.querySelector(`#rgbaValue${index + 1}`);
    const svgPaths = document.querySelectorAll(`#${colorId} path`);

    const updateValues = () => {
      const rgbString = `rgba(${parseInt(rgbInput.value.slice(1, 3), 16)}, ${parseInt(rgbInput.value.slice(3, 5), 16)}, ${parseInt(rgbInput.value.slice(5, 7), 16)}, ${alphaInput.value})`;
      svgPaths.forEach(svgPath => {
        svgPath.style.fill = rgbInput.value;
        svgPath.style.fillOpacity = alphaInput.value;
      });
      rgbaValue.textContent = rgbString;
    };

    // Set default values
    rgbInput.value = `#${defaultValues[index].r.toString(16).padStart(2, '0')}${defaultValues[index].g.toString(16).padStart(2, '0')}${defaultValues[index].b.toString(16).padStart(2, '0')}`;
    alphaInput.value = defaultValues[index].a;
    alphaValue.textContent = defaultValues[index].a;

    const clickEvent = new Event('change');
    lineStyle.checked = true;
    lineStyle.dispatchEvent(clickEvent);

    // Update SVG and display values
    updateValues();
  });
}

function currentSettings() { // Bidirectional
  vscode.postMessage({
    command: 'currentSettingsRequest',
    data: ''
  });
}

function saveSettings() { // Unidirectional
  const colorsArray = Array.from(document.querySelectorAll('.color-controls > span')).slice(0, -1);
  const rgbaValues = Array.from(colorsArray).map(span => span.textContent);
  // const rgbaValues = Array.from(colorsArray).map(span => span.textContent.toLowerCase()); // Apply this if you change visually 'rgba' to uppercase in the settings webview section
  const colorStyle = getSelectedStyle();

  vscode.postMessage({
    command: 'saveSettingsRequest',
    data: { rgbaValues, colorStyle }
  });
}

// -- -- Auxiliary functions
function transformToObjectArray(colors) {
  return colors.map(color => {
    const [r, g, b, a] = color.match(/(\d+(\.\d+)?)|(\.\d+)/g).map(Number);
    const parsedAlpha = parseFloat(a);
    return { r, g, b, a: parsedAlpha };
  });
}

function getSelectedStyle() {
  const radios = document.getElementsByName('coloringStyle');

  for (const radio of radios) {
    if (radio.checked) {
      return radio.value;
    }
  }

  // If none is checked, return null or handle accordingly
  return null;
}