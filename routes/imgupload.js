const express =   require('express');
queries       =   require('../db/queries');
multer        =   require('multer');
path          =   require('path');
router        =   express.Router();
sharp         =   require('sharp');
fs            =   require('fs');


// use same technique to update db record after post
// need to add poi id in the req body though, not only image. Mime type???
router.use(logger);



// Set Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){ //passing callback as argument
    console.log(file.originalname);
    cb(null, Date.now().toString()  + path.extname(file.originalname)); // executing the callback
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

router.post('/', function(req, res) {
  upload(req, res, function (err) {
    if (err){
      console.log("upload image error " + err)
    } 
    let width = 500;
 
    if (typeof(req.file) !== 'undefined') {
      sharp(req.file.path) //place where sharp find image
      .resize(width, null)
      .toFile('./public/uploads/thumb/thumb_'+req.file.filename, function(err){
        //console.log('sharp worked reduced file size!')
        if(!err){
          res.send({file: `uploads/thumb/thumb_${req.file.filename}`});
        }
      })
    } else {
      console.log("path not defined");
      res.send({"msg":"Inget bilde valgt"});
    }
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
  //console.log(files);
  deleteFiles(files, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log('all files removed'); // this run even if one file is locked for deletion, why??
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
    fs.unlink(filepath, function(err) {
      i--;
      if (err) {
        callback(err);
        return;
      } else if (i <= 0) {
        console.log(`Removing file ${filepath} `) // this only get called once
        callback(null);
      }
    });
  });
}

function logger(req,res,next) {
  console.log(new Date(), req.method, req.url);
  next();
};

module.exports = router;
