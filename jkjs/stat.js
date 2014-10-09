/**
 * This package provides statistic functions and metrics.
 * The methods work on all numeric arrays that provide a length and [] access.
 *
 * @author Joschi <josua.krause@gmail.com>
 */

jkjs = window.jkjs || {}; // init namespace

jkjs.stat = function() {
  var that = this;

  function aggregate(arr, init, aggr) {
    var res = init;
    for(var i = 0;i < arr.length;i += 1) {
      if(!isNaN(arr[i])) {
        res = aggr(arr[i], res);
      }
    }
    return res;
  }

  this.max = function(arr) {
    return aggregate(arr, Number.NEGATIVE_INFINITY, function(cur, agg) {
      return Math.max(cur, agg);
    });
  };

  this.min = function(arr) {
    return aggregate(arr, Number.POSITIVE_INFINITY, function(cur, agg) {
      return Math.min(cur, agg);
    });
  };

  this.mean = function(arr) {
    return aggregate(arr, 0, function(cur, agg) {
      return agg + cur;
    }) / arr.length;
  };

  this.stddev = function(arr, mean) {
    if(arguments.length < 2) {
      mean = that.mean(arr);
    }
    return Math.sqrt(aggregate(arr, 0, function(cur, agg) {
      return agg + (cur - mean) * (cur - mean);
    }) / arr.length);
  };

  function computeDistance(arrA, arrB, dist) {
    if(arrA.length !== arrB.length) {
      console.warn("arrays must have same length", arrA, arrB);
      return Number.NaN;
    }
    var res = 0;
    for(var i = 0;i < arrA.length;i += 1) {
      if(isNaN(arrA[i])) {
        console.warn("no NaN values allowed", arrA, i);
        return Number.NaN;
      }
      if(isNaN(arrB[i])) {
        console.warn("no NaN values allowed", arrB, i);
        return Number.NaN;
      }
      res += dist(arrA[i], arrB[i]);
    }
    return res;
  }

  this.pearson = function(arrA, arrB) {
    var meanA = that.mean(arrA);
    var meanB = that.mean(arrB);
    var stdA = that.stddev(arrA, meanA);
    var stdB = that.stddev(arrB, meanB);
    if(stdA === 0.0 || stdB === 0.0) {
      console.warn("standard deviation is zero", stdA, stdB);
      return stdA === stdB ? 0 : 1;
    }
    var sum = computeDistance(arrA, arrB, function(a, b) {
      return (a - meanA) * (b - meanB);
    });
    return sum / stdA / stdB / arrA.length;
  };

  this.metric = {
    euclid: function(arrA, arrB) {
      return Math.sqrt(computeDistance(arrA, arrB, function(a, b) {
        return (a - b) * (a - b);
      }));
    },
    scaled: function(arrA, arrB) {
      var maxA = that.max(arrA);
      var minA = that.min(arrA);
      var maxB = that.max(arrB);
      var minB = that.min(arrB);
      if(minA >= maxA) {
        console.warn("invalid extent", minA, maxA, arrA);
        return Number.POSITIVE_INFINITY;
      }
      if(minB >= maxB) {
        console.warn("invalid extent", minB, maxB, arrB);
        return Number.POSITIVE_INFINITY;
      }
      return Math.sqrt(computeDistance(arrA, arrB, function(a, b) {
        var sa = (a - minA) / (maxA - minA);
        var sb = (b - minB) / (maxB - minB);
        return (sa - sb) * (sa - sb);
      }));
    },
    pearson: function(arrA, arrB) {
      return 1 - Math.abs(that.pearson(arrA, arrB));
    }
  };
}; // jkjs.stat

jkjs.stat = new jkjs.stat(); // create instance
