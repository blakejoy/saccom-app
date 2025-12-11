const sharp = require('sharp');
const png2icons = require('png2icons');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const inputSvg = path.join(__dirname, '../assets/icon.svg');
  const outputPng = path.join(__dirname, '../assets/icon.png');
  const outputIcns = path.join(__dirname, '../assets/icon.icns');
  const outputIco = path.join(__dirname, '../assets/icon.ico');

  console.log('📝 Converting SVG to PNG...');

  // Convert SVG to high-res PNG (1024x1024)
  await sharp(inputSvg)
    .resize(1024, 1024)
    .png()
    .toFile(outputPng);

  console.log('✅ PNG created successfully');

  // Read the PNG file
  const pngBuffer = fs.readFileSync(outputPng);

  console.log('🍎 Generating macOS icon (.icns)...');

  // Generate macOS icon
  try {
    const icnsBuffer = png2icons.createICNS(pngBuffer, png2icons.BILINEAR, 0);
    fs.writeFileSync(outputIcns, icnsBuffer);
    console.log('✅ macOS icon (.icns) created successfully');
  } catch (error) {
    console.error('❌ Error creating .icns:', error.message);
  }

  console.log('🪟 Generating Windows icon (.ico)...');

  // Generate Windows icon
  try {
    const icoBuffer = png2icons.createICO(pngBuffer, png2icons.BILINEAR, 0, false);
    fs.writeFileSync(outputIco, icoBuffer);
    console.log('✅ Windows icon (.ico) created successfully');
  } catch (error) {
    console.error('❌ Error creating .ico:', error.message);
  }

  console.log('\n🎉 All icons generated successfully!');
  console.log('📁 Icons saved in /assets directory:');
  console.log('   - icon.png (source)');
  console.log('   - icon.icns (macOS)');
  console.log('   - icon.ico (Windows)');
}

generateIcons().catch(console.error);
