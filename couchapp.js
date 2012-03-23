var couchapp = require('couchapp')
var path = require('path')

ddoc = 
  { "_id":'_design/polymapper',
    "description": "Simple GeoJSON visualizer using Polymaps",
    "name": "Polymapper",
    "rewrites": [
      {
        "to": "index.html",
        "from": "/"
      },
      {
        "to": "/_spatiallist/geojson/full",
        "from": "/data"
      },
      {
        "to": "/../../",
        "from": "api"
      },
      {
        "to": "/../../*",
        "from": "api/*"
      },
      {
        "to": "/_spatiallist/geojson/full",
        "from": "/all",
        "query": {
          "bbox": "-180,-90,180,90"
        }
      },
      {"from":"/*", "to":'*'}
    ]
  };

ddoc.spatial = {
  /**
    * A simple spatial view that emits the GeoJSON plus the complete documents.
    */
  full: function(doc){
    if(doc.geometry){
      emit(doc.geometry, doc);
    }
  }
}

ddoc.lists = {
  /**
   * This function outputs a GeoJSON FeatureCollection (compatible with
   * OpenLayers). The geometry is stored in the geometry property, all other
   * properties in the properties property.
   * 
   * @author Volker Mische
   */
  geojson:  function(head, req) {
    var row, out, sep = '\n';

    // Send the same Content-Type as CouchDB would
    if (typeof(req.headers.Accept) != "undefined" && req.headers.Accept.indexOf('application/json')!=-1)
     start({"headers":{"Content-Type" : "application/json"}});
    else
     start({"headers":{"Content-Type" : "text/plain"}});

    if ('callback' in req.query) send(req.query['callback'] + "(");

    send('{"type": "FeatureCollection", "features":[');
    while (row = getRow()) {
      out = '{"type": "Feature", "id": ' + JSON.stringify(row.id);
      out += ', "geometry": ' + JSON.stringify(row.value.geometry);
      delete row.value.geometry;
      out += ', "properties": ' + JSON.stringify(row.value) + '}';
    
      send(sep + out);
      sep = ',\n';
    }
    send("]}");
    if ('callback' in req.query) send(")");

  }
}

couchapp.loadAttachments(ddoc, path.join(__dirname, 'attachments'));

module.exports = ddoc;