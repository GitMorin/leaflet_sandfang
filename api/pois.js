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
  console.log('im in route now');
  damages = req.body.skade_type;
  poi_id = req.body.poi_id;
  let data = [];
  
  damages.forEach(e => {
    let obj = {};
    obj.poi_id = poi_id;
    obj.skade_type = e;
    data.push(obj);
  });
  console.log(data)
  queries.createSkade(data)
    .then(skader => {
      res.json(skader);
    })
    .catch(function (err) {
      console.error('get comment error ' + err);
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
  const poi = {
    asset_type: req.body.asset_type,
    geom: 'POINT(' + req.body.xCoord + ' ' + req.body.yCoord + ')',
  };
  queries.create(poi)
  .then(poi => {
    console.log(poi[0]);
    res.json(poi[0]);
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
    console.error('Update POI error', err);
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


// Middlewear check if id is valid
function isValidId(req, res, next) {
  if (!isNaN(req.params.id)) return next();
  next(new Error('Invalid ID'));
}

module.exports = router;
