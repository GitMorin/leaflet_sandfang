const express = require('express');
const router = express.Router();

router.get('/map', function (req, res) {
  res.render('../views/pages/map');
});

router.get('/map/:id/stortbilde/:img', function (req, res) {
  res.render('../views/pages/fullsize',{img_name:"/uploads/"+req.params.img, id:req.params.id});
  //res.render('../views/pages/fullsize',{img_name:"/uploads/1535612828163.jpg"});
  
});


/* Bile lenke is set up in this way
1. On getOneUrl the img_name is appended to the href link to show large image. But it is first stripped off its uploads/thumb/thumb_1535612893503.jpg that is stored in the db. (this need to be changed just to include the image name...)
the poi id is also set to the link url.
2. The route on this page is taking the params from the url to render the right image. Here modifying the path to the image again..
3. The image src is passed to the fullsize.ejs to finally display the image.
So much redundat stuff!!
*/ 


module.exports = router;
