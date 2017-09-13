export default {
  centerOnLocations: (locations = []) => {
    // locations:  array of objects.
    let minx = Infinity;
    let miny = Infinity;
    let maxx = -Infinity;
    let maxy = -Infinity;
    let midx = null;
    let midy = null;
    // 'xy' is an array of [longitude, latitude]
    if ( locations.length === 1 ) {
      midx = locations[0].xy[0];
      midy = locations[0].xy[1];
    }
    if ( locations.length > 1 ) {
      locations.forEach(loc => {
        if ( loc.xy[0] < minx ) minx = loc.xy[0];
        if ( loc.xy[1] < miny ) miny = loc.xy[1];
        if ( loc.xy[0] > maxx ) maxx = loc.xy[0];
        if ( loc.xy[1] > maxy ) maxy = loc.xy[1];
      });
      midx = (minx + maxx) / 2;
      midy = (miny + maxy) / 2;
    }
    if ( locations.length === 0 ) {
      return [-100, 40];
    }
    return [midx, midy];
  }
}