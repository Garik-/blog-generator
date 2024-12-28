var express = require('express');
var router = express.Router();


const getData = require('../data');



/* GET home page. */
router.get('/', function(req, res, next) {
  const data = getData();
  console.log(data);

  const meta = Object.assign({}, data.siteMetadata, {
    title: data.siteMetadata.title,
    description: data.siteMetadata.description,
  });

  const items = Object.values(data.pages).map(page => {
    return {
      title: page.title,
      uri: page.uri,
      description: page.description,
      tags: page.tags,
    }
  });

  const tags = Object.keys(data.tags);

  res.render('index', { meta, items, tags });
});


router.get('/tag/:tag', function(req, res, next) {
  res.render('tag', {  });
});

module.exports = router;
