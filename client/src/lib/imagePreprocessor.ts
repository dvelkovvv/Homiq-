import cv from '@techstark/opencv-js';

export class ImagePreprocessor {
  static async preprocessImage(imageData: ArrayBuffer): Promise<ArrayBuffer> {
    // Convert buffer to Mat
    const uint8Array = new Uint8Array(imageData);
    const img = cv.matFromImageData({
      data: uint8Array,
      width: 0,
      height: 0
    });

    // Convert to grayscale
    const gray = new cv.Mat();
    cv.cvtColor(img, gray, cv.COLOR_BGR2GRAY);

    // Apply adaptive threshold
    const binary = new cv.Mat();
    cv.adaptiveThreshold(gray, binary, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);

    // Denoise
    const denoised = new cv.Mat();
    cv.fastNlMeansDenoising(binary, denoised);

    // Deskew if needed
    const deskewed = this.deskewImage(denoised);

    // Convert back to buffer
    const processed = new cv.Mat();
    const vector = new cv.MatVector();
    vector.push_back(deskewed);

    // Encode as PNG
    const result = new cv.Mat();
    cv.imencode('.png', deskewed, result);

    // Cleanup
    img.delete();
    gray.delete();
    binary.delete();
    denoised.delete();
    deskewed.delete();
    vector.delete();
    processed.delete();

    return result.data.buffer;
  }

  private static deskewImage(img: cv.Mat): cv.Mat {
    // Find all points in the image
    const points = new cv.Mat();
    cv.findNonZero(img, points);

    // Calculate orientation
    const moments = cv.moments(points);
    const skew = moments.mu11 / moments.mu02;
    const angle = -Math.atan(skew) * (180 / Math.PI);

    // Rotate image to correct skew
    const center = new cv.Point(img.cols / 2, img.rows / 2);
    const rotMatrix = cv.getRotationMatrix2D(center, angle, 1.0);
    const deskewed = new cv.Mat();
    cv.warpAffine(img, deskewed, rotMatrix, new cv.Size(img.cols, img.rows));

    // Cleanup
    points.delete();
    rotMatrix.delete();

    return deskewed;
  }
}