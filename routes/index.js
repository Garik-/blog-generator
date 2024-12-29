var express = require('express');
var router = express.Router();

const { format, differenceInDays, formatDistanceToNow } = require('date-fns');

function formatDate(dateMs) {
  const now = new Date();
  const date = new Date(dateMs);

  const daysDifference = differenceInDays(now, date);
  if (daysDifference < 7) {
    return formatDistanceToNow(date, { addSuffix: true });
  }

  return format(date, date.getFullYear() === new Date().getFullYear() ? 'MMM d' : 'MMM d, yyyy');
}


const getData = require('../data');



/* GET home page. */
router.get('/', function (req, res, next) {
  const data = getData();
  console.log(data);

  const meta = Object.assign({}, data.siteMetadata, {
    title: data.siteMetadata.title,
    description: data.siteMetadata.description,
  });

  // Сортировка страниц по mtimeMs в порядке убывания
  const sortedPages = Object.values(data.pages).sort((a, b) => b.mtimeMs - a.mtimeMs);


  const items = sortedPages.map(page => {
    return {
      title: page.title,
      uri: page.uri,
      description: page.description,
      tags: page.tags,
      date: formatDate(page.birthtimeMs),
      image: page.image,
    }
  });

  const tags = Object.keys(data.tags);

  res.render('index', { meta, items, tags });
});

router.get('/:article', function (req, res, next) {
  res.send('test')
});


router.get('/tag/:tag', function (req, res, next) {
  res.render('tag', {});
});

module.exports = router;
