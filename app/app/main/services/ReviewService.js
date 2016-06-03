'use strict';
/*global Parse */
angular.module('main').factory('Review', function ($q) {

  var Review = Parse.Object.extend('Review', {
    // Instance methods
  }, {
    // Class methods

    all: function (placeId, page) {

      var defer = $q.defer();

      var Place = Parse.Object.extend('Place');
      var place = new Place();
      place.id = placeId;

      var query = new Parse.Query(this);
      query.include('userData');
      query.equalTo('place', place);
      query.equalTo('isInappropriate', false);
      query.descending('createdAt');

      var limit = 20;
      if (angular.isUndefined(page)) {
        limit = 5;
        page = 0;
      }
      query.skip(page * limit);
      query.limit(limit);

      query.find({
        success: function (reviews) {
          defer.resolve(reviews);
        },
        error: function (reviews, error) {
          defer.resolve(error);
        }
      })

      return defer.promise;
    },

    create: function (data) {

      var defer = $q.defer();

      var objReview = new Review();
      objReview.place = data.place;
      objReview.userData = data.userData;
      objReview.rating = data.rating;
      objReview.comment = data.comment;

      objReview.save(null, {
        success: function (success) {
          defer.resolve(success);
        }, error: function (obj, error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    },
  });

  Object.defineProperty(Review.prototype, 'rating', {
    get: function () {
      return this.get('rating');
    },
    set: function (value) {
      this.set('rating', value);
    }
  });

  Object.defineProperty(Review.prototype, 'comment', {
    get: function () {
      return this.get('comment');
    },
    set: function (value) {
      this.set('comment', value);
    }
  });

  Object.defineProperty(Review.prototype, 'userData', {
    get: function () {
      return this.get('userData');
    },
    set: function (value) {
      this.set('userData', value);
    }
  });

  Object.defineProperty(Review.prototype, 'place', {
    get: function () {
      return this.get('place');
    },
    set: function (value) {
      this.set('place', value);
    }
  });

  return Review;
});
