const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

const targetURL = 'https://vlaicc.github.io/konobarica-qr/';

// Function to create QR code with icon overlay
async function generateQRWithIcon(filename, iconSVG) {
    // Create QR code as data URL
    const qrDataURL = await QRCode.toDataURL(targetURL, {
        errorCorrectionLevel: 'H',
        width: 600,
        margin: 0,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    });

    // Load QR code image
    const qrImage = await loadImage(qrDataURL);

    // Add white padding around QR code (~7mm = ~55px at print resolution)
    const padding = 55;
    const borderRadius = 90;

    // Create canvas with padding
    const canvas = createCanvas(qrImage.width + padding * 2, qrImage.height + padding * 2);
    const ctx = canvas.getContext('2d');

    // Draw off-white rounded rectangle background (2% gray)
    ctx.fillStyle = '#F9F9F9';
    ctx.beginPath();
    ctx.roundRect(0, 0, canvas.width, canvas.height, borderRadius);
    ctx.fill();

    // Draw cut guide lines (thin black border)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(0, 0, canvas.width, canvas.height, borderRadius);
    ctx.stroke();

    // Draw QR code centered with padding
    ctx.drawImage(qrImage, padding, padding);

    // Draw icon container (white square) in center
    const iconSize = 170;
    const iconX = canvas.width / 2 - iconSize / 2;
    const iconY = canvas.height / 2 - iconSize / 2;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(iconX, iconY, iconSize, iconSize);

    // Draw icon
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (iconSVG === 'wifi') {
        // WiFi icon
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 + 10;

        // Dot at bottom
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(centerX, centerY + 29, 9, 0, Math.PI * 2);
        ctx.fill();

        // First arc (smallest) - inner
        ctx.beginPath();
        ctx.arc(centerX, centerY + 29, 26, Math.PI * 1.25, Math.PI * 1.75, false);
        ctx.stroke();

        // Second arc (middle)
        ctx.beginPath();
        ctx.arc(centerX, centerY + 29, 46, Math.PI * 1.25, Math.PI * 1.75, false);
        ctx.stroke();

        // Third arc (largest) - outer
        ctx.beginPath();
        ctx.arc(centerX, centerY + 29, 66, Math.PI * 1.25, Math.PI * 1.75, false);
        ctx.stroke();
    } else if (iconSVG === 'menu') {
        // Menu icon (hamburger)
        const lineLength = 85;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const spacing = 26;

        // Top line
        ctx.beginPath();
        ctx.moveTo(centerX - lineLength / 2, centerY - spacing);
        ctx.lineTo(centerX + lineLength / 2, centerY - spacing);
        ctx.stroke();

        // Middle line
        ctx.beginPath();
        ctx.moveTo(centerX - lineLength / 2, centerY);
        ctx.lineTo(centerX + lineLength / 2, centerY);
        ctx.stroke();

        // Bottom line
        ctx.beginPath();
        ctx.moveTo(centerX - lineLength / 2, centerY + spacing);
        ctx.lineTo(centerX + lineLength / 2, centerY + spacing);
        ctx.stroke();
    }

    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filename, buffer);
    console.log(`✅ Generated: ${filename}`);
}

// Generate both QR codes
(async () => {
    await generateQRWithIcon('wifi-qr.png', 'wifi');
    await generateQRWithIcon('menu-qr.png', 'menu');
    console.log('🎉 All QR codes generated successfully!');
})();
