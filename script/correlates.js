var map, po, currentData, geoJson;

$(function(){  
  po = org.polymaps;
  geoJson = po.geoJson();

  map = po.map()
      .container($('.map')[0].appendChild(po.svg("svg")))
      .center({lat: 42.3584308, lon: -71.0597732})
      .zoom(17)
      .add(po.interact())
      .add(po.hash());

  map.add(po.image()
      .url(po.url("http://{S}tile.cloudmade.com"
      + "/d3394c6c242a4f26bb7dd4f7e132e5ff" // http://cloudmade.com/register
      + "/998/256/{Z}/{X}/{Y}.png")
      .repeat(false)
      .hosts(["a.", "b.", "c.", ""])));

  map.add(po.compass()
      .pan("none"));
      
  
  function randomColor(colors) {
    var sick_neon_colors = ["#CB3301", "#FF0066", "#FF6666", "#FEFF99", "#FFFF67", "#CCFF66", "#99FE00", "#EC8EED", "#FF99CB", "#FE349A", "#CC99FE", "#6599FF", "#03CDFF", "#FFFFFF"];
    return sick_neon_colors[Math.floor(Math.random()*sick_neon_colors.length)];
  };
  
  function load(e){
    var randColor = randomColor();
    for (var i = 0; i < e.features.length; i++) {
      var feature = e.features[i];
      console.log(e)
      $(feature.element).css({fill: randColor,opacity: .7})
      
    }    
  }

  function fetchFeatures(bbox, dataset, callback) {
	  $.ajax({
      url: "http://civicapi.com/" + dataset,
      dataType: 'jsonp',
      data: {
        "bbox": bbox
      },
      success: callback
    });
  }
  
  var showDataset = window.showDataset = function( dataset ) {
    var bbox = getBB();
    fetchFeatures(bbox, dataset, function(data){
      map.add(
        geoJson
          .features(data.features)
          .on("load", load) 
      );
    })
  }
  
  var getBB = function(){
    return map.extent()[0].lon + "," + map.extent()[0].lat + "," + map.extent()[1].lon + "," + map.extent()[1].lat;
  }
  
});