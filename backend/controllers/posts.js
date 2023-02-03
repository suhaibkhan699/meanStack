const Post = require('../models/post')

exports.createPost = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host')
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  })
  post.save().then((post) => {
    res.status(201).json({
      post,
      message: 'Post added successfully'
    })
  })
}

exports.updatePost = (req, res, next) => {
  let imagePath = req.body.imagePath
  if (req.file) {
    const url = req.protocol + '://' + req.get('host')
    imagePath = url + '/images/' + req.file.filename
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  })
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).
    then((result) => {
      if (result.matchedCount) {
        res.status(200).json({
          message: 'Post updated successfully!'
        })
      } else {
        res.status(401).json({
          message: 'Not authorized!!!'
        })
      }
    })
}

exports.getPosts = (req, res, next) => {
  Post.find().then((docs) => {
    res.status(200).json({
      message: 'posts fethced successfully',
      posts: docs
    })
  })
}

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id).
    then((post) => {
      if (post) {
        res.status(200).json({ post })
      }
      else {
        res.status(404).json({
          message: 'Post not found'
        })
      }
    })
}

exports.deletePost = (req, res, next) => {
  Post.deleteOne({
    _id: req.params.id,
    creator: req.userData.userId
  }).then((result) => {
    if (result.deletedCount) {
      res.status(200).json({
        message: 'Post deleted successfully!'
      })
    } else {
      res.status(401).json({
        message: 'Not authorized!!!'
      })
    }
  })
}

