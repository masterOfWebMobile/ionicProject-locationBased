'use strict';
/*global Parse */
angular.module('main').factory('Category', function ($q) {

  var Category = Parse.Object.extend('Category', {
    // Instance methods
  }, {
    // Class methods
    all: function () {

      var defer = $q.defer();

      var query = new Parse.Query(this);
      query.ascending('order');

      query.find({
        success: function (categories) {
          defer.resolve(categories);
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

      query.get(id, {
        success: function (category) {
          defer.resolve(category);
        },
        error: function (error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    }
  });

  Object.defineProperty(Category.prototype, 'title', {
    get: function () {
      return this.get('title');
    }
  });

  Object.defineProperty(Category.prototype, 'description', {
    get: function () {
      return this.get('description');
    }
  });

  Object.defineProperty(Category.prototype, 'icon', {
    get: function () {
      return this.get('icon');
    }
  });

  Object.defineProperty(Category.prototype, 'image_url', {
    get: function () {
      return this.get('image').url();
    }
  });

  return Category;
});
