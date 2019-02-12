var map = L.map('map').setView([63.429200, 10.394146], 14);
var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 20,
  crossOrigin: true,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var Stamen_Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: 'abcd',
	minZoom: 1,
	maxZoom: 22,
  ext: 'png',
  crossOrigin: true,
});

// ADDING SCALE
L.control.scale({imperial:false}).addTo(map);

let assetLinkActive = false;
let linkAssetId

// Activate assetLink function and set AssetLink to true from modal
// if True save clicked asset in linkAssetId
// open modal again with the value filled
// on submit save the value to a new table 
// need edit route too
// need "show assetLinks" - will display all accosiated assets to a sandfang (only available for Sandfang)
// Button will show on top of the page ("Showing linked bisluk to Sandfang id xxx") - on click clear layer
// set current sandfang to another icon to make it clear

// ADDING LEGEND
var legend = L.control({position: 'bottomright'});

// make this dynamic from getColor
function getLegendColor(d) {
  return d ==  'Sandfang' ? '#ff0000' :
         d ==  'Bisluk' ? '#0000ff' :
         d ==  'Strindasluk' ? '#ffff00' :
                    '#FFEDA0';
}


legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
    grades = ['Sandfang', 'Bisluk', 'Strindasluk'],
    labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getLegendColor(grades[i]) + '"></i> ' +
            grades[i] + '<br>';
}

return div;
};

legend.addTo(map);


let basemaps = L.layerGroup()
.addLayer(OpenStreetMap_Mapnik) // default layer to show
.addTo(map);

$(".dropdown-item.bg").click(function(event) {
  event.preventDefault();
  let selectedLayer = ($(this).attr("value")); // return string

  layer = $(this).data('foo', {OpenStreetMap_Mapnik: 'bar'});
  obj = ($(this).data('foo'));
  console.log(typeof(obj['bar']));
  console.log($(this).data('foo'));
  console.log(typeof(Object.keys(obj)[0]));

  basemaps.clearLayers()
  basemaps.addLayer(selectedBaseLayer(selectedLayer));
});

function selectedBaseLayer(layer) {
  switch (layer) {
    case 'OpenStreetMap_Mapnik': return OpenStreetMap_Mapnik;
    case 'Stamen_Watercolor': return Stamen_Watercolor;
    default: return 'Ukjent';
  };
};

// Holder for temporary position for new poi shown as red pin
// before sending to database
let tempMarker;
// Id of latest clicked marker. Used when updating skade and tomming
// can probably be refactored better
let current_id;

// Click edit button to hide list and show form
$("#btnEditSandfangInfo").click(function (e) {
  $('#sandfangInfo').hide();
  $('#editSandfangInfo').show();
})

// If avbrut if clicked go back to info list
$('#hideEditSandfangInfoForm').click(function (e) {
  $('#editSandfangInfo').hide();
  $('#sandfangInfo').show();
})

// Click edit button to hide list and show form
$('#btnEditSandfangSkade').click(function (e) {
  $('#sandfangSkadeInfo').hide();
  $('#editSandfangSkade').show();
});

// SKADE - If avbrut if clicked go back to info list
$('#hideEditSandfangSkadeForm').click(function (e) {
  $('#sandfangSkadeInfo').show();
  $('#editSandfangSkade').hide();
});

// assign color to marker
function getColor(asset) {
  switch (asset) {
    case 'sandfang':
      return "#ff0000";
    case 'bisluk':
      return "#0000ff";
    case 'strindasluk':
      return "#ffff00"
  }
}

// CREATE LAYERS TO BE POPULATED
var filterTomming = new L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, {
      radius: 12,
      fillOpacity: 0.5,
      color: '#24211f'
    });
  },
  onEachFeature: function (feature, layer) {
    //layer.addTo(filterTomming);
    layer.bindTooltip(feature.properties.id + '', {
      sticky: true,
      direction: 'top'
    });
  }
});
var sandfang = new L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, {
      radius: 10,
      fillOpacity: 0.5,
      color: getColor(feature.properties.asset_type)
    });
  },
  onEachFeature: function (feature, layer) {
    layer.addTo(clusters);
    //layer.bindPopup(feature.properties.place);
    layer.bindTooltip(feature.properties.id + '', {
      sticky: true,
      direction: 'top'
    });
    //layer.on('click', onClick);
  }
});
var bisluk = new L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, {
      radius: 10,
      fillOpacity: 0.5,
      color: getColor(feature.properties.asset_type)
    });
  },
  onEachFeature: function (feature, layer) {
    layer.addTo(clusters);
    //layer.bindPopup(feature.properties.place);
    layer.bindTooltip(feature.properties.id + '', {
      sticky: true,
      direction: 'top'
    });
  }
});
var strindasluk = new L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, {
      radius: 10,
      fillOpacity: 0.5,
      color: getColor(feature.properties.asset_type)
    });
  },
  onEachFeature: function (feature, layer) {
    layer.addTo(clusters);
    layer.bindTooltip(feature.properties.id + '', {
      sticky: true,
      direction: 'top'
    });
  }
});

sandfang.on('click', markerOnClick);
bisluk.on('click', markerOnClick);
strindasluk.on('click', markerOnClick);

// function markerOnClick(e) {
//   current_id = e.layer.feature.properties.id;
//   console.log('clicked feature')
//   //merkned = e.layer.feature.properties.merkned;
//   //kritisk_merkned = e.layer.feature.properties.kritisk_merkned;
//   //console.log(current_id,kritisk_merkned,merkned)
//   showInfo(current_id, e.layer.feature);
// };

var tempIcon = L.icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  //iconUrl: 'https://png.pngtree.com/element_pic/17/04/18/c631b7cf64373bdb37049a3bb250dd9a.jpg',
  //shadowUrl: 'leaf-shadow.png',
  iconSize: [400, 250],
  iconSize: [25, 41],
  //iconAnchor: [200, 125],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

// get feature of layer to be used to fill modal!
// THIS WORKS but should probably be refactored...
function showInfo(current_id, layer) {
  console.log(layer)
  // Make ajax call to populate lists
  //current_id = e.layer.feature.properties.id;

  // get tomming
  let url = '/api/pois/tomming/' + current_id;
  $.get({
      url: url
    })
    .done(function (data) {
      // set last tomming in modal
      let lastTomming = new Date(Math.max.apply(null, data.map(function(e) {
        return new Date(e.regdato);
      })));
      if (isValidDate(lastTomming)) {
        let lastTommingFormatted = lastTomming.getDate() + '.' + (lastTomming.getMonth() + 1) + '.' + lastTomming.getFullYear();
      $('.last-tomming').text(lastTommingFormatted);
      } else {
        $('.last-tomming').text("Ukjent");
      }

      let i = 0;
      var dager = ["Søndag", "Mondag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
      data.forEach(function (tomming) {
        let regdato = new Date(tomming.regdato);
        let date = '<i class="far fa-calendar-alt"></i>' + ' ' + dager[regdato.getDay()] + ' ' + regdato.getDate() + '.' + (regdato.getMonth() + 1) + '.' + regdato.getFullYear() + ' <i class="far fa-clock"></i>' + ' ' + regdato.getHours() + '.' + (`0${regdato.getMinutes()}`).slice(-2);
        i += 1;
        $('#sandfangLogTable > tbody').append(
          `
        <tr>
          <th scope="row">${String(i)}</th>
          <td></i>${date}</td>
          <td>${renameFylling(tomming.fyllingsgrad)}</td>
        </tr>
        `
        );
      })
    })
    .fail(function (jqXHR, status, error) {
      console.log('Status: ' + status + '\n' + 'Error: ' + error);
    });

  let urlSkade = '/api/pois/skade/' + current_id;
  $.get({
      url: urlSkade
    })
    .done(function (data) {
      // add skade to list
      data.forEach(function (skade) {
        let skaderid = skade.skader_id;
        let rename = renameSkade(skade.skade_type);
        $('.list-group.skadeLog').append(
          `
          <li class="list-group-item list-group-item-action">
          <span>
            ${rename}
          </span> 
          <form action="api/pois/skade/${skade.skader_id}/edit" class="edit-skader-form">
              <input type="hidden" value="${skade.skade_type}" name="skade_type">
              <input type="hidden" value="${skade.skader_id}" name="skader_id">
              <input type="hidden" value="true" name="reparert">          
              <button type="submit" class="btn btn-danger btn-sm float-right">Fjern skade</button> 
          </form>   
          </li>
          `
        );
        // hide checkbox in form where if skade is already registered
        hideRegisteredSkade(skade.skade_type);
      });
    })
    .fail(function (jqXHR, status, error) {
      console.log('Status: ' + status + '\n' + 'Error: ' + error);
    });

  // populated infoForm

  let getOneUrl = '/api/pois/' + current_id;
  $.get({
    url: getOneUrl
  })
  .done(function(data){
    console.log(current_id);
    console.log('appending ' + data.merkned);
    $(".featureType").append(data.asset_type);
    $(".featureId").append(current_id);
    $(".object-info").text(data.asset_type);
    $('#infoMerknedTextArea').val(data.merkned);
    $("#editMerknedTextArea").val(data.merkned);
    if (!(data.img_name == null || data.img_name == 'deleted')) {
      $('#asset-image').attr("src", '../' + data.img_name); // set src to thumb pic
      $('#stort-bilde-lenke').attr("href", "map/"+current_id+"/stortbilde/"+data.img_name.substring(data.img_name.length - 17));
      //$('#asset-image').attr("src", '../' + data.img_name);
      $("#imageForm").hide();
      $("#slettBilde").css("display", "block");
      // add link to display large image
      // add small camera icon or something if image exist
    }
    if (data.kritisk_merkned == true) {
      $('span.text-right.kritiskBool').css('color','red');
      console.log('setting checkbox to cheked')
        $('#checkKritisk').prop('checked', 1);
        $('.kritiskBool').text('Ja');
    } else {
      $('.kritiskBool').text('Nei')
      $('span.text-right.kritiskBool').css('color','black');};
      $('#checkKritisk').prop('checked', 0);
  });

  let regdato = new Date(layer.properties.regdate);
  $(".featureRegdate").append(regdato.getDate() + '.' + (regdato.getMonth() + 1) + '.' + regdato.getFullYear());
  $("#infoModal").modal();
  let objectType = layer.properties.asset_type;
};

function renameSkade(skade) {
  switch (skade) {
    case 'feil_lokk': return 'Feil Lokk';
    case 'skadet_lokk': return 'Skadet Lokk';
    case 'manglendeDykkert': return 'Manglende dykkert';
    case 'tett_stikkledning': return 'Tett stikkledning';
    case 'tett_utlopp': return 'Tett utløp';
    case 'skadet_kumrug': return 'Skadet kumrug';
    default: return 'Ukjent';
  };
};

function renameFylling(fylling) {
  switch (fylling) {
    case '0': return 'Tom';
    case '1': return '1:3';
    case '2': return '2:3';
    case '3': return 'Full';
    default: return 'Noe gikk galt :(';
  };
};

// Remove selectable values from damages that has already been registered
function hideRegisteredSkade(val) {
  // return element that has value
  // need to be specific to which checkboxes
  $('input[type="checkbox"]').filter(function() {
      return this.value == val;
  }).next().hide();
  //console.log(val);
}

//attach submit listener to the edit-skader-form
// make user verify he/she want mark a damage as repaired
$('#registrert-skader-list').on('submit', '.edit-skader-form', function(e) {
  e.preventDefault();
  let confirmResponse = confirm('Er du sikker att du har repapert skaden?');
  if(confirmResponse) {
    let skade = $(this).serialize();
    let actionUrl = $(this).attr('action');
    $originalItem = $(this).parent('.list-group-item');
    console.log(skade);
    $.ajax({
      url: actionUrl,
      data: skade,
      type: 'PUT',
      originalItem: $originalItem,
      success: function(data) {
        console.log(data);
        $originalItem.remove();
      }
    })
  }
});

function getPoints(bbox, asset_type){
  //let asset_type = 'sandfang'
  $.get({ url: '/api/pois/type/' + asset_type + '/bbox/'+ bbox})
  .done(function (data) {
    console.log(data);
    getAssets(data);
  })
  .fail(function (jqXHR, status, error) {
    console.log('Status: ' + status + '\n' + 'Error: ' + error);
  });
}


// save new object based on object type
$('#newPoiForm').submit(function (e) { // handle the submit event
  e.preventDefault();
  let formData = $(this).serialize();
  // post new asset and add the latest point on the map

  $.post({type: 'POST', url: '/api/pois/', data: formData}).then(function(data){
    console.log('New asset submitted');
    return $.get({url: '/api/pois/last'});
  }).then(function(data, textStatus, xhr) {
    console.log(data);

    if (xhr.status === 200) {
      console.log(`Status code ${xhr.status}`);
      getAssets(data)
    } else {
      alert(`Noe gikk feil, status code: ${xhr.status}`);
    }
  })
})

// add markers to map filtered on asset type
function getAssets(data){
  $(data.features).each(function (key, data) {
    switch (data.properties.asset_type) {
      case 'bisluk': bisluk.addData(data); break; 
      case 'sandfang': sandfang.addData(data); break;
      case 'strindasluk': strindasluk.addData(data); break;
      default: console.log('wrong asset type ' + data.properties.asset_type);
    };
  })
}

// submitting new damage
$('#registrerSkadeForm').submit(function (e) {
  e.preventDefault();

 // let = selectedDamage $("input:checkbox[name=type]:checked").map(function(){return $(this).val()}).get()
  let = selectedDamage = $("input:checkbox[name=skade_type]:checked").map(function () {
    console.log('selected damage to post ' + $(this).val());
    return $(this).val();
  }).get();

  let object = {}
  object.poi_id = current_id;
  object.skade_type = selectedDamage;
  console.log(object);
  skaderJSON = JSON.stringify(object);
  postDamage(skaderJSON);
});


function postDamage(damage) {
  console.log(damage);
  $.ajax({
      type: "POST",
      url: '/api/pois/skade',
      data: damage,
      contentType: "application/json; charset=utf-8",
    }).done(function (skade) {
    console.log(skade);
    console.log('ajax is done getting back data aka, success');
    skade.forEach(function(e) {
      let items = [];
      console.log(e.skade_type);
      // add form to the new item, make sure the submit listener also work on these new elements!
      items.push(
        `
        <li class="list-group-item list-group-item-action">
          <span>
          ${renameSkade(e.skade_type)}
          </span>
          <form action="api/pois/skade/${e.skader_id}/edit" class="edit-skader-form">
              <input type="hidden" value="${e.skade_type}" name="skade_type">
              <input type="hidden" value="${e.skader_id}" name="skader_id">
              <input type="hidden" value="true" name="reparert">          
              <button type="submit" class="btn btn-danger btn-sm float-right">Fjern skade</button> 
          </form>   
        </li>
        `
        )
      hideRegisteredSkade(e.skade_type);
      $('.list-group.skadeLog').append(( items.join('') ));
    })
  }
);
  // clear skade form
  $('#registrerSkadeForm').trigger("reset");
  // hide reg skade form
  $('#editSandfangSkade').hide();
  $('#sandfangSkadeInfo').show();
 }

 // Update poi info
$('#infoForm').submit(function(e) {
  e.preventDefault();
  let formData = $(this).serializeArray();
  let url = '/api/pois/' + current_id;
  console.log(url);
  console.log(formData);
  if ( $('#checkKritisk').is(':checked') ) {
   // do nothing
  } else {
    formData.push({name: "kritisk_merkned", value: "false"})
    console.log('added false checked');
};

  $.ajax({
    type: 'PUT',
    url: url,
    data: formData
  }).done(function(data){
    console.log(data.merkned);
  //  $('#infoForm').trigger("reset");
    $("#infoMerknedTextArea").val(data.merkned);
    if (data.kritisk_merkned == true) {
      //set info Kritisk merked ja/nei
      console.log('setting checkbox to cheked')
        $('.kritiskBool').text('Ja').css('.text-danger');
        $('span.text-right.kritiskBool').css('color','red');
      }  else {
        $('.kritiskBool').text('Nei')
        $('span.text-right.kritiskBool').css('color','black')};
    
      // set edit form check kritisk merkned t/f
    if (data.kritisk_merkned == true) {
        $('#checkKritisk').prop('checked', 1);
      }  else $('#checkKritisk').prop('checked', 0);  

    $('#sandfangInfo').show();
    $('#editSandfangInfo').hide();
    // show regular pane with new info
    // clear form on close modal
    console.log('data sent to server ' + data)
  });
});

$('#registrerTommingForm').submit(function (e) {
  e.preventDefault();
  let formData = $(this).serializeArray();
  formData.push({
    name: 'poi_id',
    value: current_id
  });
  console.log(formData);
  let fyllingsgrad = formData[0].value;
  console.log(fyllingsgrad);

  $.post({
      type: 'POST',
      url: '/api/pois/tomming',
      data: formData
    })
    .done(function (data) {

      let lastTomming = new Date(Math.max.apply(null, data.map(function(e) {
        return new Date(e.regdato);
      })));
      if (isValidDate(lastTomming)) {
        let lastTommingFormatted = lastTomming.getDate() + '.' + (lastTomming.getMonth() + 1) + '.' + lastTomming.getFullYear();
      $('.last-tomming').text(lastTommingFormatted);
      } else {
        $('.last-tomming').text("Ukjent");
      }

      // reset formData
      $('#registrerTommingForm').trigger("reset");
      // add new tomming to list
      // find how many rows table has
      let rows = $('#sandfangLogTable tr').length;
      //$('#myTable tr').size()
      console.log(rows);
      // fill in regdato (this can be refactored)
      var dager = ["Søndag", "Mondag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
      let regdato = new Date();
      let date = '<i class="far fa-calendar-alt"></i>' + ' ' + dager[regdato.getDay()] + ' ' + regdato.getDate() + '.' + (regdato.getMonth() + 1) + '.' + regdato.getFullYear() + ' <i class="far fa-clock"></i>' + ' ' + regdato.getHours() + '.' + (`0${regdato.getMinutes()}`).slice(-2);

      // add latest tomming to table
      $('#sandfangLogTable > tbody').append(
        `
        <tr>
          <th scope="row">${String(rows)}</th>
          <td>${date}</td>
          <td>${renameFylling(fyllingsgrad)}</td>
        </tr>
        `
      );
    })
});

//post image
$('#imageForm').submit(function(e) {
  e.preventDefault();

  let form = $('#imageForm')[0];
  // test what happens if this is serialized as normal now when it works
  let formData = new FormData(form);

  //var formData = new FormData($("myImage")[0]);//data = $("myImage")
  //let formData = $(this).serialize();
  console.log(formData);
  //let formData = new FormData(this);
  $.post({
    type: 'POST',
    url: '/upload',
    data: formData,
    enctype: 'multipart/form-data',
    cache : false,
    contentType: false,
    processData: false,
  }).done(function(data){
    $('#slettBilde').show(); // show slett bilde button
    // changing objekt key name from file to img_name
    // not neccesary but increase readability
    // migt want to strip off the file path from the file name
    data.img_name = data.file
    delete data.file;
    console.log(JSON.stringify(data));
    $.ajax({
      url: '/upload/' + current_id,
      type: 'PUT',
      dataType: "json",
      data: data,
    }).done(function(data){
      $('#asset-image').attr("src", '../' + data.img_name)
      $(".custom-file-label").text('');
      $("#imageForm").hide();
      console.log(`Updated img_name for id ${current_id} with ${data.img_name}`);
      //console.log(JSON.stringify(data));
      // make function to clear form and image when modal close
    });
  });
});

$('#slettBilde').click(function(e) {
  e.preventDefault();
  // get image name from src tag
  // add it to the body element to pass it to server where the image is deleted.
  var filesToDelete = [] 
  let imageSource = $('#asset-image').prop('src')
  filesToDelete.push('public/uploads/' + imageSource.substring(imageSource.length - 17));
  filesToDelete.push('public/uploads/thumb/' + imageSource.substring(imageSource.length - 23)); // include thumb_)

  let data = { "img_name" : "deleted" }
  data.deleteImg = filesToDelete; // add image array to delete to data obj
  console.log(data);

  $.ajax({
    url: '/upload/delete/' + current_id,
    type: 'PUT',
    contentType: "application/json",
    data: JSON.stringify(data),
  }).done(function(data){
    console.log(data.img_name);
    $('#asset-image').attr("src", '')
    $("#slettBilde").css("display", "none");
    $("#imageForm").show();
  })
});

// when infoModal close do actions
$('#infoModal').on('hidden.bs.modal', function () {
  console.log('clicked outside modal');
  // Make first tab active in modal
  $('#sandfangLogTable > tbody > tr:nth-child(n+1)').remove(); // clear Tømming log table
  $('a.nav-item').removeClass('active');
  $('a.nav-item:first').addClass('active');
  $("#slettBilde").css("display", "none");


  // Clear Skade table
  $('.list-group.skadeLog > li:nth-child(n+2)').remove();

  // Make first tab pane active in Modal
  $('.tab-pane').removeClass('active');
  $('#sandfang.tab-pane').addClass('active');

  // reset to show all checkboxes when modal close
  $('#registrerSkadeForm label').show();

  $(".featureType").text('');
  $(".featureId").text('');
  $(".featureRegdate").text('');

  // Make sure skade info is shown after the modal is closed
  $('#sandfangInfo').show();
  $('#editSandfangInfo').hide();
  $('span.text-right.kritiskBool').css('color','black');
  // $('#exampleCheck1').prop('checked', 0);

  // Bilde tab
  // remove src attr
  $(".custom-file-label").text('Inget bilde valgt...'); // inget bilde valgt
  $('#asset-image').attr("src", '');
  $("#imageForm").show();
});

// click lagre object
$('#lagreObject').click(function () {
  $('#confirm-object').modal('hide');
  $('#newPoiForm').submit(); // trigger the submit event
})

// remove tempMarker when selectObject modal close
$('#confirm-object').on('hide.bs.modal', function (e) {
  if (tempMarker != undefined) {
    map.removeLayer(tempMarker);
  };
});

// Add Easy button to Canvas
let getCoortdinatesButton = L.easyButton('fa-crosshairs fa-lg', function (btn, map) {
  $("input#y-coord").val(map.getCenter().lat.toString());
  $("input#x-coord").val(map.getCenter().lng.toString());

  let lat = map.getCenter().lat;
  let long = map.getCenter().lng;

  tempMarker = L.marker([lat, long], {
    icon: tempIcon
  }).addTo(map);

  $("#confirm-object").modal();
  $(".objectToCreate").text('');
  selectedobject = $("input[name='asset_type']:checked").val();
  // append object name to create to modal
  $(".objectToCreate").append(selectedobject);
  getCoortdinatesButton.disable();
}).disable().addTo(map);

//
$('#formPinButton').click(function () {
  crosshair.addTo(map);
  getCoortdinatesButton.enable();
});

$('#confirm-object').on('hidden.bs.modal', function () {
  map.removeLayer(crosshair);
  // do something…
});

// Add in a crosshair for the map
let crosshairIcon = L.icon({
  iconUrl: '/images/crosshair.png',
  className: 'crosshairIcon',
  iconSize: [100, 100], // size of the icon
  iconAnchor: [50, 50], // point of the icon which will correspond to marker's location
});
crosshair = new L.marker(map.getCenter(), {
  icon: crosshairIcon,
  clickable: false
});

// Move the crosshair to the center of the map when the user pans
map.on('move', function (e) {
  crosshair.setLatLng(map.getCenter());
});

// what do you do?
function checkedFilter() {
  var filterItem = [];
  $('input[name=filterItem]:checked').map(function() {
    filterItem.push($(this).val());
  });
  console.log(filterItem)
}

$('#allatyper-checkbox').on('click', function() {
  if (this.checked == true)
      $('.asset-checkbox').find('input[name="filtercheckbox"]').prop( "checked", true );
      //$('input[name="filtercheckbox"]').prop( "checked", true );
  else
      $('.asset-checkbox').find('input[name="filtercheckbox"]').prop('checked', false);
      //$('input[name="filtercheckbox"]').prop( "checked", false );
});

$('#myDropdown').on('click', function(event) {
  event.stopPropagation();
});

$("input[type=file]").change(function () {
  var fieldVal = $(this).val();

  // Change the node's value by removing the fake path (Chrome)
  fieldVal = fieldVal.replace("C:\\fakepath\\", "");
  if (fieldVal != undefined || fieldVal != "") {
    $(this).next(".custom-file-label").attr('data-content', fieldVal);
    $(this).next(".custom-file-label").text(fieldVal);
  }  
});

function revertStyle(layer) {
  let setColor = getColor(layer.feature.properties.asset_type);
  setTimeout(function(){ 
    resetStyle(layer)
    layer.setStyle({
      weight: 3,
      radius: 10,
      fillOpacity: 0.5,
      fillColor: setColor,
      color: setColor
    }); 
  }, 5000);
}

$('#search-id').submit(function (e) { // handle the submit event
  e.preventDefault();
  var searchstring = $('#search-field');
  //add all pois
  $.get({ 
    url: '/api/pois/find/' + searchstring.val(),
    })
    .done(function (data) {
      if(data === undefined || data.length == 0){
        alert('record does not exist in db');
      } else {
        console.log(data[0].id);
        let myStyle = ({
          radius: 16,
          weight: 3,
          color: 'black',
          fillOpacity: 0.8,
          fillColor: 'green',
          opacity: 0.9,
        })

      var foundLayer = new L.geoJson(JSON.parse(data[0].st_asgeojson), {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, {
            radius: 20,
            "weight": 5,
            color: 'black'
          });
        },
      }).addTo(map);

      var group1 = L.featureGroup([
        foundLayer,
      ]).addTo(map);
        
      group1.bringToBack();
      setTimeout(function(){ map.removeLayer(foundLayer); }, 5000);
        return map.flyTo(foundLayer.getBounds().getCenter() ,17);
      }   
    });
});

let clusters = L.markerClusterGroup();
map.addLayer(clusters);

getPoints(map.getBounds().toBBoxString(), 'sandfang');

// on chechbox change clear and add new assets
map.on('moveend', function() {
  if (sandfang || bisluk || strindasluk) {
    clusters.clearLayers();
  };
  // need a promise function here to do .bringToBack(); once the 
  // Hack
  getCheckedAssetBoxes();
  setTimeout(function(){ 
    if (filterTomming) {
      filterTomming.bringToFront();
    }; 
  }, 50);
});

// Controling action on filtered items
function getCheckedAssetBoxes(){
  var els = document.querySelectorAll('.asset-checkbox:checked');
  clusters.clearLayers();
  for(var i = 0; i< els.length; i++){
    getPoints(map.getBounds().toBBoxString(), els[i].value);
  }
}

$('.asset-checkbox').change(function() {
  getCheckedAssetBoxes();
});

L.control.locate({icon: 'fas fa-map-marker-alt', enableHighAccuracy: true}).addTo(map);

// getBounds and add X buffer
// if getBOunds is inside do nothing else request new data

function logout() {
  $.get({ url: '/auth/logut'})
  .done(function (data) {
    window.location = '/auth/login';
  })
}

// AUTH
$('#log-ut').click(function () {
  logout();
})


// Date picker function
$(function () {
  $('input[name="daterange"]').daterangepicker({
    opens: 'down',
    drops: 'down',
    endDate: moment().startOf('day'),
    startDate: moment().startOf('hour').subtract(5, 'day'),
    locale: {
      format: 'YYYY/MM/DD'
    }
  }, function (start, end, label) {
    console.log("A new date selection was made: " + start.format('YYYY-MM-DD HH:mm') + ' to ' + end.format('YYYY-MM-DD HH:mm'));
    let from = start.format('YYYY-MM-DD');
    let to = end.format('YYYY-MM-DD HH:mm');
    $("#tommingFilter-checkbox").prop( "checked", true );
    return getTommingBetween(from, to);
  });
});

function getTommingBetween(from, to) {
  filterTomming.clearLayers();
  $.get({
    url: '/api/pois/tomming/' + from + '/' + to
  })
  .done(function (data) {
    if (data.message) {
      alert(data.message);
    }
    $(data.features).each(function (key, data) {
      filterTomming.addData(data);
      filterTomming.addTo(map);
    });
  })
  // .catch(function (error) {
  //   alert(error);
  // });
}

$('#tommingFilter-checkbox').change(function() {
  if (this.checked) {
    filterTomming.addTo(map);
  } else {
    map.removeLayer(filterTomming);
  }
});

// Associate points
let idOfAssociatePoint;
let bindPoint = false;

$("#bind-point").click(function(e){
$("#bind-point").toggleClass("active");
if ($("#bind-point").hasClass("active")) {
  $("#bind-point span").text(" On");
} else {
  $("#bind-point span").text(" Off");
}
});  

// function markerOnClick(e) {
//   if (!$("#bind-point").hasClass("active")){
//     current_id = e.layer.feature.properties.id;
//     showInfo(current_id, e.layer.feature);
  
//   } else {
//     //idOfAssociatePoint = null;
//     idOfAssociatePoint = e.layer.feature.properties.id;
//     console.log(`Associate point ${idOfAssociatePoint} with ${current_id} In the database`);
//   }
//   };
let clickedPoint = null;
if (clickedPoint){
  clickedPoint.addTo(map);
}

console.log(clickedPoint)

function markerOnClick(e) {
  console.log(e);
  clickedPoint = e.layer.setStyle({fillColor: '#0fbff2'}).addTo(map);
  // add to new layer to persist?
  // get xy of current layer
  // draw line between current and clicked
  console.log(clickedPoint);
  if (bindPoint === false) {
    current_id = e.layer.feature.properties.id;
    showInfo(current_id, e.layer.feature);

  } else {
    //idOfAssociatePoint = null;
    idOfAssociatePoint = e.layer.feature.properties.id;
    console.log(`Associate point ${idOfAssociatePoint} with ${current_id} In the database`);
    $('#bind-point-id-val').val(idOfAssociatePoint);
  }
};

$("#bind-point-edit").click(function(e){
  // set 
  console.log("Close modal");
  $("#bind-point-panel").show();
  $('#infoModal').modal('hide')
  bindPoint = true;
  // reopen modal on save?
  // press tick mark and it will save it to the database.
  // only if value is set!
  // when hover over highlight it on the map
  // If delete display message
});

$("#button-save-accociate").click(function(e){
  if(!$('#bind-point-id-val').val()){
    // Do Nothing.. alert("Inget verdi!");
  } else {
    if (confirm(`vil du koble ${idOfAssociatePoint} med ${current_id}?`)) {
      console.log("Lagre");
      bindPoint = false;
      $("#bind-point-panel").hide();
      // remove infopanel
      $('#bind-point-id-val').val("");
    } else {
      console.log("Cancel");
      bindPoint = false;
      $("#bind-point-panel").hide();
      // remove infopanel
      $('#bind-point-id-val').val("");
    }
  }
});

$("#bind-point-btn-avbryt").click(function(e){
  $("#bind-point-panel").hide();
  bindPoint = false;
  $('#bind-point-id-val').val("");
});
