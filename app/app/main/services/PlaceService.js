'use strict';
/*global Parse */
angular.module('main').factory('Place', function ($q, $localStorage) {

  var Place = Parse.Object.extend('Place', {

    // Instance methods

    getDistance: function (position) {

      var point = new Parse.GeoPoint({
        latitude: position.latitude,
        longitude: position.longitude
      });

      if ($localStorage.unit === 'km') {
        return this.get('location').kilometersTo(point).toFixed(2);
      } else {
        return this.get('location').milesTo(point).toFixed(2);
      }
    }
  }, {
    // Class methods

    all: function (params) {

      var defer = $q.defer();

      var query = new Parse.Query(this);
      var subQueryExpiresAt = new Parse.Query(this);
      var subQueryExpiresAtNotSet = new Parse.Query(this);

      subQueryExpiresAt.greaterThan('expiresAt', new Date());
      subQueryExpiresAtNotSet.doesNotExist('expiresAt');

      query = Parse.Query.or(subQueryExpiresAt, subQueryExpiresAtNotSet);

      if (params.search && params.search !== '') {
        query.contains('canonical', params.search);
      } else {

        var point = new Parse.GeoPoint({
          latitude: params.location.latitude,
          longitude: params.location.longitude
        });

        if ($localStorage.unit === 'km') {
          query.withinKilometers('location', point, params.distance);
        }
        else {
          query.withinMiles('location', point, params.distance);
        }
      }

      if (params.categoryId) {
        var Category = Parse.Object.extend('Category');
        var objCategory = new Category();
        objCategory.id = params.categoryId;
        query.equalTo('category', objCategory);
      }

      var limit = 20;
      if (!params.page) {
        limit = 100;
      }
      else {
        query.skip(params.page * limit);
      }

      query.limit(limit);
      query.equalTo('isApproved', true);

      query.find({
        success: function (places) {
          defer.resolve(places);
        },
        error: function (error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    },

    getFavorites: function (params) {

      var defer = $q.defer();
      var query = new Parse.Query(this);

      var limit = 20;
      query.skip(params.page * limit);
      query.limit(limit);
      query.equalTo('isApproved', true);
      query.equalTo('likes', Parse.User.current());

      query.find({
        success: function (places) {
          defer.resolve(places);
        },
        error: function (error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    },

    get: function (id) {

      var defer = $q.defer();

      var query = new Parse.Query(this);
      query.include('category');

      query.get(id, {
        success: function (place) {
          defer.resolve(place);
        },
        error: function (error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    },

    create: function (place) {
      var defer = $q.defer();

      var objPlace = new Place();
      place.user = Parse.User.current();
      place.location = new Parse.GeoPoint({
        latitude: place.location.lat,
        longitude: place.location.lng
      });

      objPlace.save(place, {
        success: function (success) {
          defer.resolve(success);
        }, error: function (obj, error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    },

    isLiked: function (id) {

      var defer = $q.defer();

      Parse.Cloud.run('isPlaceLiked', { placeId: id }, {
        success: function (response) {
          defer.resolve(response);
        },
        error: function (error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    },

    like: function (id) {

      var defer = $q.defer();

      Parse.Cloud.run('likePlace', { placeId: id }, {
        success: function (response) {
          defer.resolve(response);
        },
        error: function (error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    }

  });

  Object.defineProperty(Place.prototype, 'title', {
    get: function () {
      return this.get('title');
    },
    set: function (value) {
      this.set('title', value);
    }
  });

  Object.defineProperty(Place.prototype, 'description', {
    get: function () {
      return this.get('description');
    },
    set: function (value) {
      this.set('description', value);
    }
  });

  Object.defineProperty(Place.prototype, 'location', {
    get: function () {
      return this.get('location');
    },
    set: function (val) {
      this.set('location', new Parse.GeoPoint({
        latitude: val.lat,
        longitude: val.lng
      }));
    }
  });

  Object.defineProperty(Place.prototype, 'latitude', {
    get: function () {
      return this.get('location').latitude;
    }
  });

  Object.defineProperty(Place.prototype, 'longitude', {
    get: function () {
      return this.get('location').longitude;
    }
  });

  Object.defineProperty(Place.prototype, 'address', {
    get: function () {
      return this.get('address');
    },
    set: function (value) {
      this.set('address', value);
    }
  });

  Object.defineProperty(Place.prototype, 'website', {
    get: function () {
      return this.get('website');
    },
    set: function (value) {
      this.set('website', value);
    }
  });

  Object.defineProperty(Place.prototype, 'phone', {
    get: function () {
      return this.get('phone');
    },
    set: function (value) {
      this.set('phone', value);
    }
  });

  Object.defineProperty(Place.prototype, 'image', {
    get: function () {
      if (this.get('image')) {
        return this.get('image');
      } else {
        return null;
      }
    }
  });

  Object.defineProperty(Place.prototype, 'imageThumb', {
    get: function () {
      if (this.get('imageThumb')) {
        return this.get('imageThumb');
      } else {
        return null;
      }
    }
  });

  Object.defineProperty(Place.prototype, 'imageTwo', {
    get: function () {
      return this.get('imageTwo');
    },
    set: function (value) {
      this.set('imageTwo', value);
    }
  });

  Object.defineProperty(Place.prototype, 'imageThree', {
    get: function () {
      return this.get('imageThree');
    },
    set: function (value) {
      this.set('imageThree', value);
    }
  });

  Object.defineProperty(Place.prototype, 'imageFour', {
    get: function () {
      return this.get('imageFour');
    },
    set: function (value) {
      this.set('imageFour', value);
    }
  });

  Object.defineProperty(Place.prototype, 'category', {
    get: function () {
      return this.get('category');
    },
    set: function (value) {
      this.set('category', value);
    }
  });

  Object.defineProperty(Place.prototype, 'user', {
    get: function () {
      return this.get('user');
    },
    set: function (value) {
      this.set('user', value);
    }
  });

  Object.defineProperty(Place.prototype, 'ratingCount', {
    get: function () {
      return this.get('ratingCount');
    }
  });

  Object.defineProperty(Place.prototype, 'ratingTotal', {
    get: function () {
      return this.get('ratingTotal');
    }
  });

  Object.defineProperty(Place.prototype, 'rating', {
    get: function () {
      if (this.ratingCount && this.ratingTotal) {
        if (this.ratingCount > 0 && this.ratingTotal > 0) {
          return Math.round(this.ratingTotal / this.ratingCount);
        }
      }
      return null;
    }
  });

  return Place;
});
