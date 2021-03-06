"use strict"

var db = require('../db'),
    formidable = require('formidable'),
    marked = require('marked');

class Blog {

  prismcss(req, res) {
    res.render('blog/prism.css', {user: req.user});
  }

  prismjs(req, res) {
    res.render('blog/prism.js', {user: req.user});
  }

  index(req, res) {
    var blog = db.all('SELECT * FROM Post', function(err, blog){
      if(err) {
        console.error(err);
        return res.sendStatus(500);
      }
      res.render('blog/index', {blog: blog, user: req.user});
    });
  }

  check(req,res){
    var blog = db.all('SELECT * FROM users', function(err, item){
      if(err) {
        console.error(err);
        return res.sendStatus(400);
      }
      res.render('blog/check', {blog: item, user: req.user});
    });
  }

  users(req, res) {
    var blog = db.all('SELECT * FROM users', function(err, item){
      if(err) {
        console.error(err);
        return res.sendStatus(400);
      }
      res.render('blog/users', {blog: item, user: req.user});
    });
  }

  edit(req, res) {
    var blog = db.get('SELECT * FROM Post WHERE PostId=?', req.params.id, function(err, item){
      if(err) {
        console.error(err);
        return res.sendStatus(400);
      }
      res.render('blog/edit', {blog: item, user: req.user});
    });
  }

  show(req, res) {
    var blog = db.get('SELECT * FROM Post WHERE PostId=?', req.params.id, function(err, item){
      if(err) {
        console.error(err);
        return res.sendStatus(400);
      }
      res.render('blog/show', {blog: item, user: req.user});
    });

  }
  create(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      db.run('INSERT INTO Post (title, body) values (?,?)',
        fields.title,
        fields.body
      );

      res.redirect('/blog');
    });
  }

  change(req, res) {
    var temp = req.url.split('/')[2]; console.log(temp);
    var form = new formidable.IncomingForm();

    console.log("I am in edit going to post");

    form.parse(req, function(err, fields, files) {
      console.log("FIELDS", fields);
    db.run('UPDATE Post SET title = ?, body = ? WHERE postId = ?', fields.title, fields.body, temp);
    console.log("Changing TITLE: ",fields.title);
    res.redirect('/blog');
    console.log("Blog edited");
    });
  }

  add(req, res) {
     var form = new formidable.IncomingForm();
     var temp = req.url.split('/')[2]
     form.parse(req, function(err, fields, files) {
     db.run('INSERT INTO Comment(postid, body) values (?,?)', temp, fields.comment);
     console.log("Comment added", temp);
     res.redirect('/blog/'+temp+'/preview');
   });
 }

 preview(req, res) {
  console.log("ParamId in preview method: ", req.params.id);
  var temp = req.url.split('/')[2];
  var blog = db.all('SELECT * from Comment where postid=?', req.params.id, function(err, item){
    if(err) {
      console.error(err);
      return res.sendStatus(400);
    }
    console.log("Read me, I am blog", blog.value);
    res.render('blog/preview', {blog: item, postid: req.params.id,  user: req.user});
  });
}

  new(req, res) {
    res.render('blog/new', {user: req.user});

  }

  destroy(req, res) {
    db.run('DELETE FROM Post WHERE postId=?', req.params.id);
    db.run('DELETE FROM Comment WHERE postid=?', req.params.id);
    res.redirect('/blog');
  }

  del(req, res) {
    var temp = req.url.split('/')[2];
    //console.log("I am del temp", req.params.postid);
    db.run('DELETE FROM Comment WHERE comntId=?', req.params.id);
    res.redirect('/blog');
  }

  redirect(req, res) {
    res.writeHead(301, {"Content-Type":"text/html", "Location":"/blog"});
    res.end("This page has moved to <a href='/equipment'>Blog</a>");
  }

  autocomplete(req, res) {
    db.all('SELECT DISTINCT title FROM Post WHERE title LIKE ?', req.params.token + '%', function(err, data){
      if(err) {
        console.error(err);
        res.writeHead(400, {"Content-Type":"text/json"});
        res.end("[]");
        return;
      }
      res.writeHead(200, {"Content-Type":"text/json"});
      res.end(JSON.stringify( data.map( function(pair) {return pair.name}) ));
    });
  }
}

module.exports = exports = new Blog();
