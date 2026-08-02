/**
 * Robust image download utility.
 * Ensures downloaded images can be viewed in all standard photo viewers
 * (Windows Photos, Apple Photos, Android Gallery, etc.) by matching file extensions
 * to the actual binary MIME type and converting SVG vector fallbacks to raster PNGs.
 */

export async function downloadImageDataUrl(
  dataUrl: string,
  filenamePrefix: string = 'profilepilot_ai_photo'
): Promise<boolean> {
  try {
    if (!dataUrl) return false;

    // Handle SVG Data URLs -> convert to 1200x1200 High-Res PNG Blob
    if (dataUrl.includes('image/svg+xml') || dataUrl.startsWith('<svg')) {
      return await downloadSvgAsPng(dataUrl, `${filenamePrefix}_${Date.now()}.png`);
    }

    // Handle standard Base64 Data URLs (image/jpeg, image/png, image/webp)
    if (dataUrl.startsWith('data:')) {
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      let extension = '.jpg';
      if (blob.type.includes('png')) extension = '.png';
      else if (blob.type.includes('webp')) extension = '.webp';
      else if (blob.type.includes('jpeg') || blob.type.includes('jpg')) extension = '.jpg';

      const finalFilename = `${filenamePrefix}_${Date.now()}${extension}`;

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
      return true;
    }

    // Direct HTTP/HTTPS URLs
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${filenamePrefix}_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error('Error downloading image:', err);
    // Fallback: open image in new tab if browser blocks programmatic download
    try {
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(`<img src="${dataUrl}" style="max-width:100%; height:auto;" />`);
      }
    } catch (e) {
      console.error('Fallback open failed:', e);
    }
    return false;
  }
}

/**
 * Renders an SVG Data URL onto an offscreen canvas at 1200x1200px resolution
 * and downloads a native PNG file that any image viewer can open.
 */
async function downloadSvgAsPng(svgDataUrl: string, filename: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 1200;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(false);
          return;
        }

        // Fill background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 1200, 1200);

        // Draw SVG image scaled to canvas
        ctx.drawImage(img, 0, 0, 1200, 1200);

        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(false);
            return;
          }
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
          resolve(true);
        }, 'image/png');
      } catch (e) {
        console.error('SVG to PNG conversion error:', e);
        resolve(false);
      }
    };

    img.onerror = (err) => {
      console.error('SVG image load error:', err);
      resolve(false);
    };

    img.src = svgDataUrl;
  });
}

/**
 * Draws an Icebreaker Card on canvas and triggers PNG download.
 */
export async function downloadCardCanvas(
  headline: string,
  subText: string,
  style: string,
  title: string
): Promise<boolean> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    // Background Gradient based on theme
    if (style === 'polaroid') {
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, 0, 1080, 1080);

      // Inner box
      ctx.fillStyle = '#1E293B';
      ctx.roundRect ? ctx.roundRect(80, 120, 920, 840, 32) : ctx.fillRect(80, 120, 920, 840);
      ctx.fill();

      // Headline
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 54px serif';
      ctx.textAlign = 'center';
      ctx.fillText(`"${headline}"`, 540, 480, 800);

      // Subtext
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '32px sans-serif';
      ctx.fillText(subText, 540, 580, 800);

    } else if (style === 'comic') {
      const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
      grad.addColorStop(0, '#FF0055');
      grad.addColorStop(1, '#FFCC00');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1080);

      // Comic Box
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 12;
      ctx.strokeRect(100, 180, 880, 720);
      ctx.fillRect(100, 180, 880, 720);

      ctx.fillStyle = '#000000';
      ctx.font = '900 52px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`"${headline}"`, 540, 480, 800);

      ctx.font = 'bold 32px sans-serif';
      ctx.fillText(subText, 540, 580, 800);

    } else {
      // Modern Cyber Dark
      const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
      grad.addColorStop(0, '#1E1B4B');
      grad.addColorStop(0.5, '#4C1D95');
      grad.addColorStop(1, '#831843');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1080);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 58px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`"${headline}"`, 540, 480, 850);

      ctx.fillStyle = '#F472B6';
      ctx.font = 'italic 34px sans-serif';
      ctx.fillText(subText, 540, 580, 850);
    }

    // Branding Footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`PROFILEPILOT AI • ${title.toUpperCase()}`, 100, 1020);
    ctx.textAlign = 'right';
    ctx.fillText('profilepilot.ai', 980, 1020);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `profilepilot_icebreaker_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
        resolve(true);
      }, 'image/png');
    });

  } catch (err) {
    console.error('Error generating card image:', err);
    return false;
  }
}
