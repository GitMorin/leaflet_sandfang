const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const queries = require('../db/queries');
const sharp = require('sharp');

// Set Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb)
  }
}).single('myImage');

// check File Type
function checkFileType(file, cb){
  const filetypes = /jpeg|jpg|png|gif/; // Allowed ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // check extension
  const mimetype = filetypes.test(file.mimetype); // check mime
  if(mimetype && extname){
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  };
};

// get filename from function
// midlewear?

router.post('/', function(req, res) {
  upload(req, res, function (err) {
    console.log(req);
    // sharp config
    let width = 500;
    //let height = null;
    sharp(req.file.path) //place where sharp find image
    .resize(width, null)
    .toFile('./public/uploads/thumb/thumb_'+req.file.filename, function(err){
      console.log('sharp worked!')
      if(!err){
        //res.send({file: `uploads/${req.file.filename}`});
        res.send({file: `uploads/thumb/thumb_${req.file.filename}`});
      }
    });
  }); 
});

// update file name in db
router.put('/:id', (req, res) => {
  queries.updateImgName(req.params.id, req.body)
    .then(pois => {
      res.json(pois[0]);
    })
    .catch(err => {
      console.error('Update image error', err);
    });
});

module.exports = router;
