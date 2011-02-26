var map, po, currentData, geoJson;

$(function(){
  $("#filter_select_1").sSelect();
  $("#filter_select_2").sSelect();
  
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
  
  function showDataset(dataset) {
    var bbox = map.extent()[0].lon + "," + map.extent()[0].lat + "," + map.extent()[1].lon + "," + map.extent()[1].lat;
    currentDataset = dataset;
    fetchFeatures(bbox, dataset, function(data){
      map.add(geoJson.features(data.features));
    })
  }
  
  showDataset('bos_fire_hydrants');
});