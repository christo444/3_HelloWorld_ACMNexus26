const sharp = require('sharp');

/**
 * Custom implementation of difference hash (dHash) algorithm
 * This doesn't require any external hashing libraries
 */

/**
 * Generate perceptual hash (dHash) from image buffer
 * @param {Buffer} imageBuffer - Image data as buffer
 * @returns {Promise<string>} - 64-bit perceptual hash as hex string
 */
async function generatePerceptualHash(imageBuffer) {
  try {
    // Resize to 9x8 (9 columns, 8 rows) for dHash
    // We need one more column than rows to calculate horizontal gradients
    const { data } = await sharp(imageBuffer)
      .resize(9, 8, { fit: 'fill' })
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Calculate dHash: compare each pixel to the one on its right
    let hash = '';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const leftPixel = data[row * 9 + col];
        const rightPixel = data[row * 9 + col + 1];
        // If left pixel is brighter than right, set bit to 1
        hash += leftPixel > rightPixel ? '1' : '0';
      }
    }

    // Convert binary string to hexadecimal (64 bits = 16 hex chars)
    let hexHash = '';
    for (let i = 0; i < hash.length; i += 4) {
      const nibble = hash.substr(i, 4);
      hexHash += parseInt(nibble, 2).toString(16);
    }

    return hexHash;
  } catch (error) {
    console.error('Error generating perceptual hash:', error);
    throw error;
  }
}

/**
 * Calculate Hamming distance between two hash strings
 * @param {string} hash1 - First hash
 * @param {string} hash2 - Second hash
 * @returns {number} - Hamming distance (0-64 for 64-bit hashes)
 */
function calculateHammingDistance(hash1, hash2) {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) {
    return -1;
  }

  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) {
      distance++;
    }
  }
  return distance;
}

/**
 * Find similar frames in database based on hamming distance
 * @param {string} hash - Hash to compare
 * @param {Array} allHashes - Array of {id, hash} objects from database
 * @param {number} threshold - Maximum hamming distance for match (default: 10)
 * @returns {Array} - Array of matches with {id, distance}
 */
function findSimilarHashes(hash, allHashes, threshold = 10) {
  const matches = [];
  
  for (const item of allHashes) {
    const distance = calculateHammingDistance(hash, item.perceptual_hash);
    if (distance >= 0 && distance <= threshold) {
      matches.push({
        frameId: item.id,
        distance: distance,
        videoUrl: item.video_url,
        videoTitle: item.video_title,
        timestamp: item.timestamp
      });
    }
  }

  // Sort by distance (closest matches first)
  return matches.sort((a, b) => a.distance - b.distance);
}

module.exports = {
  generatePerceptualHash,
  calculateHammingDistance,
  findSimilarHashes
};
