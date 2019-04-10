const express = require('express');
const router = express.Router();
const queries = require('../db/queries');


// route append on api/pois

// get all pois
router.get('/', (req, res) => {
  queries.getAll()
    .then(pois => {
      res.json(pois.rows[0].row_to_json);
    })
    .catch(err => {
      console.error('Get all POI error', err);
    });
});

router.get('/type/:asset_type/bbox/:bbox', (req, res) => {
  bbox = req.params.bbox.split(',')
  //console.log(bbox);
  // split bbox by comma and set params for getBbox
  queries.getBbox(bbox[0],bbox[1],bbox[2],bbox[3], req.params.asset_type)
    .then(pois => {
      res.json(pois.rows[0].row_to_json);
    //res.send(req.params)
    })
    .catch(err => {
      console.error('Get POI in bbox error', err);
    });
});

router.get('/last', (req, res) => {
  queries.getLatestRaw()
    .then(poi => {
      res.json(poi.rows[0].row_to_json);
      console.log(poi);
    })
    .catch(err => {
      console.error('Get latest POI error', err);
    });
});

// post new tomming
router.post('/tomming', (req, res) => {
  queries.createTomming(req.body)
  .then(tomming => {
    res.json(tomming);
    console.log(tomming);
  })
  .catch(function (err) {
    console.error('get tomming error ' + err);
  });
});

router.get('/tomming/:id', (req, res) => {
  queries.getTomming(req.params.id)
  .then(tomming => {
    res.json(tomming);
  })
  .catch(function (err) {
    console.error('get comment error ' + err);
  });
});

router.post('/skade', (req, res) => 
{ 
  damages = req.body.skade_type;
  assets_id = req.body.assets_id;
  let data = [];
  
  damages.forEach(e => {
    let obj = {};
    obj.assets_id = assets_id;
    obj.skade_type = e;
    data.push(obj);
  });
  queries.createSkade(data)
    .then(skader => {
      res.json(skader);
    })
    .catch(function (err) {
      console.error('Error create skade ' + err);
    });
});

router.get('/skade/:id', (req, res) => {
  queries.getSkade(req.params.id)
  .then(skade => {
    res.json(skade);
  })
  .catch(function (err) {
    console.error('get comment error ' + err);
  });
});

router.get('/:id', (req, res) => {
  queries.getOne(req.params.id)
    .then(poi => {
      if (poi) {
        //console.log(poi);
        res.json(poi);
      } else {
        throw new Error('Did noy get any poi');
      }
    })
    .catch(err => {
      console.error('Get one id error', err);
    });
});

router.post('/', (req, res) => {
  console.log(req.body.asset_type);
  const data = {
    asset_type: req.body.asset_type,
    geom: 'POINT(' + req.body.xCoord + ' ' + req.body.yCoord + ')',
  };
  queries.create(data)
  .then(data => {
    console.log(data[0]);
    res.json(data[0]);
  })
   .catch(err => {
    console.error('New poi error', err);
  });
});

// update pois
router.put('/:id', (req, res) => {
  queries.update(req.params.id, req.body)
    .then(pois => {
      res.json(pois[0]);
    })
    .catch(err => {
      console.error('Update POI error', err);
    });
});

// update skader
router.put('/skade/:id/edit', (req, res) => {
  queries.updateSkade(req.params.id, req.body)
  .then(skade => {
    res.json(skade[0]);
  })
  .catch(err => {
    console.error('Update skader error', err);
  });
});

// delete poi
router.delete('/:id', isValidId, (req, res) => {
  queries.delete(req.params.id)
  .then(() => {
    res.json({
      deleted: true,
    });
  })
  .catch(err => {
    console.error('Delete poi error', err);
  });
});

router.get('/find/:id', (req, res) => {
  queries.findId(req.params.id)
    .then(poi => {
      res.json(poi.rows);
      console.log(poi)
    })
});

router.get('/tomming/:from/:to', (req, res) => {
  // get poi id
  queries.tommingBetween(req.params.from, req.params.to)
  .then(function(data) {
    if (!data.rows.length > 0) {
      //return console.log("No results found");
      res.json({message: "Ingen Tømming registrert mellom valgt tidsperiode"});
    } else {
      result = data.rows.map(function(id) {
        return id.assets_id
      })
      return queries.getManyAssets(result)
      .then(function(data){
          res.json(data.rows[0].row_to_json);
      })
      .catch(err => {
        console.error('Something went wrong in tommingBetween', err);
      });
    }
  })
  .catch(err => {
    console.error("get tommingBetwee "+err);
  });
});

// post new tomming
router.post('/kobling', (req, res) => {
  //console.log(req.body)
  queries.createAssociation(req.body)
  .then(kobling => {
    //console.log(kobling);
    res.json(kobling);
  })
  .catch(function (err) {
    console.error('get kobling error ' + err);
  });
});

router.get('/kobling/:id', (req, res) => {
  // uggly uggly code below!
  queries.getConnectionsById(req.params.id)  // return list of objects
  .then(data => {
    if (!data.length > 0) {
      res.json({message: "Ingen kobling ennå registrert til punktet"});
    } else {
      let listOfIds = []

      data.forEach(el =>{ // create list with objects of { uuid: 25, id: 451 }
        let uuidObj = {}
        uuidObj["uuid"] = el.id;
        uuidObj["id"] = el.til_assets_id;
        listOfIds.push(uuidObj);
      })
      result = data.map(function(id) { // return list of ids [ 451, 317, 504 ]
        return id.til_assets_id
      })
      console.log(listOfIds);
      return queries.getLatLngOfAsset(result)
      .then(data => {
        const newList = []
        data.rows.map(function(el){  // Create list that put the coords into a list coords: [ 63.4325301346224, 10.3742694854736 ]
          let newObj = {}
          coords = el.st_astext.substring(6, el.st_astext.length -1).split(' ');
          var coords = coords.map(function (x) { // parse string to float
            return parseFloat(x); 
          });
          newObj["id"] = el.id;
          newObj["coords"] = coords.reverse();
          newList.push(newObj)
          return
        })
        // https://stackoverflow.com/questions/19480008/javascript-merging-objects-by-id
        const mergeArray = (source, merge, by) => source.map(item => ({
          ...item,
          ...(merge.find(i => i[by] === item[by]) || {}),
        }));
        let combinedLists = (mergeArray(newList, listOfIds, 'id'));
        console.log(combinedLists);

        res.json(combinedLists)
        //console.log(data.rows)
      })
      .catch(err => {
        console.error('Something went wrong in getLatLngOfAsset', err);
      });
    }
  })
  .catch(function (err) {
    console.error('get kobling error ' + err);
  });
});

// Delete route
router.delete('/kobling/:id', (req, res) => {
  queries.kobling_punkt(req.params.id)
  .then(() => {
    res.json({
      deleted: true,
    });
  })
  .catch(err => {
    console.error('Delete poi error', err);
  });
});

// Middlewear check if id is valid
function isValidId(req, res, next) {
  if (!isNaN(req.params.id)) return next();
  next(new Error('Invalid ID'));
}

module.exports = router;
