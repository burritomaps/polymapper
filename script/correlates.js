var map, po, currentData, geoJson;

$(function(){  
  po = org.polymaps;
  geoJson = po.geoJson();
  
  var featuresCache = {};

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
    var sick_neon_colors = ["#CB3301", "#FF0066", "#FF6666", "#FEFF99", "#FFFF67", "#CCFF66", "#99FE00", "#EC8EED", "#FF99CB", "#FE349A", "#CC99FE", "#6599FF", "#03CDFF"];
    return sick_neon_colors[Math.floor(Math.random()*sick_neon_colors.length)];
  };
  
  function load(e){
    var cssObj = randColor = randomColor();
    
    for (var i = 0; i < e.features.length; i++) {
      
      var feature = e.features[i];
      
      //console.log(feature.data.geometry.type == 'LineString' ? 'none' : randColor)
      
      if( feature.data.geometry.type == 'LineString' || feature.data.geometry.type == 'MultiLineString' ) {
        cssObj = {
          fill: 'none',
          stroke: randColor,
          strokeWidth:2,
          opacity: .9 
        }
      } else {
        cssObj = {
          fill: randColor,
          opacity: .9 
        }
      }

      $( feature.element )
        .css( cssObj )
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

  var showDataset = function( dataset ) {
    var bbox = getBB();

    fetchFeatures( bbox, dataset, function( data ){

      var feature = po.geoJson()
            .features( data.features )
            .on( "show", load );

      featuresCache[dataset] = feature;
          
      map.add( feature );

    })
  }

  var removeDataset = function( dataset ) {
    map.remove( featuresCache[dataset] );
  }

  var getBB = function(){
    return map.extent()[0].lon + "," + map.extent()[0].lat + "," + map.extent()[1].lon + "," + map.extent()[1].lat;
  }

  //Interaction
  $.ajax({ 
    url: "http://civicapi.com/datasets?",
    dataType: 'jsonp', 
    success: function(data){ 
      $.each(data.datasets, function( i, item ){
        $('<li>', {
          class: item.name,
          html: '<input type="checkbox"/>' + item.name.replace('_', ' ')
        })
        .appendTo('.sidebar')
      })
    } 
  }); 
  
  $('[type=checkbox]').live('click', function(){
    var input = $(this)
        dataSet = 'bos_' + input.parent().attr('class');
    
    if( $(this).attr('checked') ) {
      showDataset( dataSet );
    } else {
      removeDataset( dataSet );
    }
  });

});