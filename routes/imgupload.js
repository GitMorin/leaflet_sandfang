const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const queries = require('../db/queries');
const sharp = require('sharp');
const fs = require('fs');

// Set Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){ //passing callback as argument
    cb(null, Date.now() + path.extname(file.originalname)); // executing the callback
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb) // executing checkFileType, passing the cb to be executed
  }
}).single('myImage');

// check File Type
function checkFileType(file, cb){
  const filetypes = /jpeg|jpg|png|gif/; // Allowed extensions
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // check extension
  const mimetype = filetypes.test(file.mimetype); // check mime
  if(mimetype && extname){
    return cb(null, true); // Executing the cb To accept the file pass `true`, like so
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

//update file name in db
router.put('/:id', (req, res) => {
  queries.updateImgName(req.params.id, req.body)
    .then(pois => {
      res.json(pois[0]);
    })
    .catch(err => {
      console.error('Update image error', err);
    });
  });

// delete files on server and update database to "deleted"
router.put('/delete/:id', (req, res) => {
  files = req.body.deleteImg
  console.log(files);

  deleteFiles(files, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log('all files removed');
      queries.updateImgName(req.params.id, req.body) // update db to set img_name to "deleted"
      .then(pois => {
        res.json(pois[0]);
      })
      .catch(err => {
        console.error('Update image error', err);
      });
    }
  });
});

function deleteFiles(files, callback){
  var i = files.length;
  files.forEach(function(filepath){
    console.log(`removed ${filepath} `)
    fs.unlink(filepath, function(err) {
      i--;
      if (err) {
        callback(err);
        return;
      } else if (i <= 0) {
        callback(null);
      }
    });
  });
}



// update file name in db
// router.put('/delete/:id', (req, res) => {
//   //console.log(req.body);
//   console.log(req.body.deleteImg[1]);
//   fs.unlink(req.body.deleteImg, function (err) {
//     if (err) throw err;
//     console.log('File deleted!');
//     queries.updateImgName(req.params.id, req.body) // update db to set img_name to "deleted"
//       .then(pois => {
//         res.json(pois[0]);
//       })
//       .catch(err => {
//         console.error('Update image error', err);
//       });
//   });
// });

module.exports = router;
