var Image = require('../helpers/image');

function saveImage (base64) {
  var parseFile = new Parse.File('image.jpg', { base64: base64 });
  return parseFile.save();
}

Parse.Cloud.define('findUserByEmail', function(req, res) {

  var query = new Parse.Query(Parse.User);
  query.equalTo('email', req.params.email);
  query.first({ useMasterKey: true }).then(function (results) {
    res.success(results || {});
  }, function (error) {
    res.error(error.message);
  });
});

Parse.Cloud.define('isPlaceLiked', function (req, res) {

  var user = req.user;
  var placeId = req.params.placeId;

  if (!user) {
    return res.error('Not Authorized');
  }

  var query = new Parse.Query('Place');
  query.equalTo('likes', user);
  query.equalTo('objectId', placeId);

  query.first({ useMasterKey: true }).then(function (place) {
    var isLiked = place ? true : false;
    res.success(isLiked);
  }, function (error) {
    res.error(error);
  });
});

Parse.Cloud.define('likePlace', function (req, res) {

  var user = req.user;
  var placeId = req.params.placeId;

  if (!user) {
    return res.error('Not Authorized');
  }

  var query = new Parse.Query('Place');
  var objPlace;
  var response = { action: null };

  query.get(placeId).then(function (place) {
    objPlace = place;
    var queryPlace = new Parse.Query('Place');
    queryPlace.equalTo('likes', user);
    queryPlace.equalTo('objectId', placeId)
    return queryPlace.find();
  }).then(function (result) {

    var relation = objPlace.relation('likes');

    if (result.length > 0) {
      objPlace.increment('likeCount', -1);
      relation.remove(user);
      response.action = 'unlike';
    } else {
      objPlace.increment('likeCount');
      relation.add(user);
      response.action = 'like';
    }

    return objPlace.save(null, { useMasterKey: true });
  }).then(function () {
    res.success(response);
  }, function (error) {
    res.error(error.message);
  });

});

Parse.Cloud.define('getUsers', function (req, res) {

  var params = req.params;
  var user = req.user;

  var query = new Parse.Query(Parse.Role);
  query.equalTo('name', 'Admin');
  query.equalTo('users', user);
  query.first().then(function (adminRole) {

    if (!adminRole) {
      return res.error('Not Authorized');
    }

    var query = new Parse.Query(Parse.User);

    if (params.filter != '') {
      query.contains('email', params.filter);
    }

    query.descending('createdAt');
    query.limit(params.limit);
    query.skip((params.page * params.limit) - params.limit);

    var queryUsers = query.find({ useMasterKey: true });
    var queryCount = query.count({ useMasterKey: true });

    return Parse.Promise.when(queryUsers, queryCount);
  }).then(function (users, total) {
    res.success({ users: users, total: total });
  }, function (error) {
    res.error(error);
  });
});

Parse.Cloud.define('createUser', function (req, res) {

  var data = req.params;
  var user = req.user;

  var query = new Parse.Query(Parse.Role);
  query.equalTo('name', 'Admin');
  query.equalTo('users', user);
  query.first().then(function (adminRole) {

    if (!adminRole) {
      return res.error('Not Authorized');
    } else {

      var user = new Parse.User();
      user.set('name', data.name);
      user.set('username', data.email);
      user.set('email', data.email);
      user.set('password', data.password);
      user.set('photo', data.photo);
      user.set('roleName', data.roleName);

      user.signUp().then(function (objUser) {
        objUser.setACL(new Parse.ACL(objUser));
        objUser.save(null, { useMasterKey: true });
        res.success(objUser);
      }, function (error) {
        res.error(error);
      });
    }
  }, function (error) {
    res.error(error);
  });
});

Parse.Cloud.define('updateUser', function (req, res) {

  var data = req.params;
  var user = req.user;

  var query = new Parse.Query(Parse.Role);
  query.equalTo('name', 'Admin');
  query.equalTo('users', user);
  query.first().then(function (adminRole) {

    if (!adminRole) {
      return res.error('Not Authorized');
    }

    var query = new Parse.Query(Parse.User);
    query.equalTo('objectId', data.id);
    return query.first({ useMasterKey: true });
  }).then(function (objUser) {

    objUser.set('name', data.name);
    objUser.set('username', data.email);
    objUser.set('email', data.email);
    objUser.set('photo', data.photo);

    if (!data.password) {
      objUser.set('password', data.password);
    }

    return objUser.save(null, { useMasterKey: true });
  }).then(function (success) {
    res.success(success);
  }, function (error) {
    res.error(error);
  });
});

Parse.Cloud.define('destroyUser', function (req, res) {

  var params = req.params;
  var user = req.user;

  var query = new Parse.Query(Parse.Role);
  query.equalTo('name', 'Admin');
  query.equalTo('users', user);
  query.first().then(function (adminRole) {

    if (!adminRole) {
      return res.error('Not Authorized');
    }

    var query = new Parse.Query(Parse.User);
    query.equalTo('objectId', params.id);
    return query.first({ useMasterKey: true });
  }).then(function (objUser) {

    if (!objUser) {
      return res.error('User not found');
    }

    return objUser.destroy({ useMasterKey: true });
  }).then(function (success) {
    res.success(success);
  }, function (error) {
    res.error(error);
  });
});

Parse.Cloud.define('saveFacebookPicture', function (req, res) {

   var user = req.user;

   if (!user) {
     return res.error('Not Authorized');
   }

   var authData = user.get('authData');
   if (!authData) {
     return res.success();
   }

   var profilePictureUrl = 'https://graph.facebook.com/' +
     authData.facebook.id + '/picture';

   return Parse.Cloud.httpRequest({
     url: profilePictureUrl,
     followRedirects: true,
     params: { type: 'large' }
   }).then(function (httpResponse) {
     var buffer = httpResponse.buffer;
     var base64 = buffer.toString('base64');
     var parseFile = new Parse.File('image.jpg', { base64: base64 });
     return parseFile.save();
   }).then(function (savedFile) {
     user.set({'photo': savedFile });
     return user.save(null, { sessionToken: user.getSessionToken() });
   }).then(function (success) {
     res.success(success);
   }, function (error) {
     res.error(error);
   });
});

Parse.Cloud.beforeSave('Category', function (req, res) {

  var category = req.object;
  var user = req.user;

  if (!user) {
    return res.error('Not Authorized');
  }

  if (!category.get('image')) {
   return res.error('The field Image is required.');
  }

  if (!category.existed()) {
    var acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setRoleWriteAccess('Admin', true);
    category.setACL(acl);
  }

  if (category.dirty('title') && category.get('title')) {
    category.set('canonical', category.get('title').toLowerCase());
  }

  if (!category.dirty('image')) {
    return res.success();
  }

  var imageUrl = category.get('image').url();

  Image.resize(imageUrl, 640, 640).then(function (base64) {
    return saveImage(base64);
  }).then(function (savedFile) {
    category.set('image', savedFile);
    return Image.resize(imageUrl, 160, 160);
  }).then(function (base64) {
    return saveImage(base64);
  }).then(function (savedFile) {
    category.set('imageThumb', savedFile);
    res.success();
  }, function (error) {
    res.error(error.message);
  });

});

Parse.Cloud.beforeSave('Place', function (req, res) {

  var place = req.object;
  var user = req.user;
  var isMasterKey = req.master;

  if (!place.existed()) {
    var acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setRoleWriteAccess('Admin', true);
    acl.setWriteAccess(user, true);
    place.setACL(acl);
  }

  if (isMasterKey) {
    return res.success();
  }

  if (!user) {
    return res.error('Not Authorized');
  }

  if (!place.get('image')) {
    return res.error('Upload the first image');
  }

  if (place.dirty('title') && place.get('title')) {
    place.set('canonical', place.get('title').toLowerCase());
  }

  if (!place.dirty('image') && !place.dirty('imageTwo') &&
   !place.dirty('imageThree') && !place.dirty('imageFour')) {
    return res.success();
  }

  var promises = [];

  if (place.dirty('image')) {
    var url = place.get('image').url();

    var promise = Image.resize(url, 640, 640).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      place.set('image', savedFile);
    });

    promises.push(promise);

    var promiseThumb = Image.resize(url, 160, 160).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      place.set('imageThumb', savedFile);
    });

    promises.push(promiseThumb);
  }

  if (place.get('imageTwo') && place.dirty('imageTwo')) {
    var url = place.get('imageTwo').url();

    var promise = Image.resize(url, 640, 640).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      place.set('imageTwo', savedFile);
    });
    promises.push(promise);
  }

  if (place.get('imageThree') && place.dirty('imageThree')) {
    var url = place.get('imageThree').url();

    var promise = Image.resize(url, 640, 640).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      place.set('imageThree', savedFile);
    });
    promises.push(promise);
  }

  if (place.get('imageFour') && place.dirty('imageFour')) {
    var url = place.get('imageFour').url();

    var promise = Image.resize(url, 640, 640).then(function (base64) {
      return saveImage(base64);
    }).then(function (savedFile) {
      place.set('imageFour', savedFile);
    });
    promises.push(promise);
  }

  Parse.Promise.when(promises).then(function (result) {
    res.success();
  }, function (error) {
    res.error(error);
  });
});

Parse.Cloud.beforeSave('Review', function (req, res) {

  var review = req.object;
  var user = req.user;
  var userData = review.get('userData');
  var place = review.get('place');

  if (!user) {
    return res.error('Not Authorized');
  }

  if (!review.existed()) {
    var acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setRoleWriteAccess('Admin', true);
    acl.setWriteAccess(user, true);
    review.setACL(acl);
    review.set('isInappropriate', false);
  }

  if (review.existed() && review.dirty('isInappropriate')) {
    return res.success();
  }

  var query = new Parse.Query('Review');
  query.equalTo('userData', userData);
  query.equalTo('place', place);

  query.find({
    success: function (res1) {
      if (res1.length > 0) {
        res.error('You already write a review for this place');
      } else {

        if (review.get('rating') < 1) {
          res.error('You cannot give less than one star');
        } else if (review.get('rating') > 5) {
          res.error('You cannot give more than five stars');
        } else {
          res.success();
        }
      }
    },
    error: function (obj, error) {
      res.error(error);
    }
  });
});

Parse.Cloud.afterSave('Review', function (req) {

  var review = req.object;
  var rating = review.get('rating');
  var placeId = review.get('place').id;

  var query = new Parse.Query('Place');

  query.get(placeId).then(function (place) {

    var currentTotalRating = place.get('ratingTotal') || 0;

    place.increment('ratingCount');
    place.set('ratingTotal', currentTotalRating + rating);
    place.save(null, { useMasterKey: true });

  }, function (error) {
    console.log('Got an error ' + error.code + ' : ' + error.message);
  });
});

Parse.Cloud.beforeSave(Parse.User, function (req, res) {

  var user = req.object;

  if (user.existed() && user.dirty('roleName')) {
    return res.error('Role cannot be changed');
  }

  if (!user.get('photo') || !user.dirty('photo')) {
    return res.success();
  }

  var imageUrl = user.get('photo').url();

  Image.resize(imageUrl, 160, 160).then(function (base64) {
    return saveImage(base64);
  }).then(function (savedFile) {
    user.set('photo', savedFile);
    res.success();
  }, function (error) {
    res.error(error);
  });
});

Parse.Cloud.afterSave(Parse.User, function (req) {

  var user = req.object;
  var userRequesting = req.user;

  var queryUserData = new Parse.Query('UserData');
  queryUserData.equalTo('user', user);
  queryUserData.first().then(function (userData) {

    if (userData) {
      userData.set('name', user.get('name'));
      userData.set('photo', user.get('photo'));
    } else {

      var aclUserData = new Parse.ACL();
      aclUserData.setPublicReadAccess(true);
      aclUserData.setWriteAccess(user, true);

      var userData = new Parse.Object('UserData', {
        user: user,
        ACL: aclUserData,
        name: user.get('name'),
        photo: user.get('photo'),
      });
    }
    userData.save(null, { useMasterKey: true });
  });

  if (!user.existed()) {

    var query = new Parse.Query(Parse.Role);
    query.equalTo('name', 'Admin');
    query.equalTo('users', userRequesting);
    query.first().then(function (isAdmin) {

      if (!isAdmin && user.get('roleName') === 'Admin') {
        return Parse.Promise.error({
          code: 1,
          message: 'Not Authorized'
        });
      }

      var roleName = user.get('roleName') || 'User';

      var innerQuery = new Parse.Query(Parse.Role);
      innerQuery.equalTo('name', roleName);
      return innerQuery.first();
    }).then(function (role) {

      if (!role) {
        return Parse.Promise.error('Role not found');
      }

      role.getUsers().add(user);
      return role.save();
    }).then(function () {
      console.log(success);
    }, function (error) {
      console.error('Got an error ' + error.code + ' : ' + error.message);
    })
  }
});
