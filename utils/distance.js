/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Object} coord1 - First coordinate {lat, lng}
 * @param {Object} coord2 - Second coordinate {lat, lng}
 * @returns {Number} Distance in kilometers
 */
const calculateDistance = (coord1, coord2) => {
  if (!coord1 || !coord2 || !coord1.lat || !coord1.lng || !coord2.lat || !coord2.lng) {
    return null;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLng = toRadians(coord2.lng - coord1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Convert degrees to radians
 * @param {Number} degrees 
 * @returns {Number} Radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Find closest riders to a given location
 * @param {Array} riders - Array of rider objects with currentLocation
 * @param {Object} location - Target location {lat, lng}
 * @param {Number} limit - Maximum number of riders to return
 * @returns {Array} Array of riders sorted by distance
 */
const findClosestRiders = (riders, location, limit = 5) => {
  if (!location || !location.lat || !location.lng) {
    return riders;
  }

  // Calculate distance for each rider and add to object
  const ridersWithDistance = riders
    .map(rider => {
      const distance = rider.currentLocation 
        ? calculateDistance(location, rider.currentLocation)
        : null;
      
      return {
        ...rider.toObject ? rider.toObject() : rider,
        distanceToPickup: distance
      };
    })
    .filter(rider => rider.distanceToPickup !== null) // Only riders with known location
    .sort((a, b) => a.distanceToPickup - b.distanceToPickup) // Sort by distance
    .slice(0, limit); // Limit results

  return ridersWithDistance;
};

module.exports = {
  calculateDistance,
  findClosestRiders,
};
