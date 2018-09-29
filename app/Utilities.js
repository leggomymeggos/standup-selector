function mergeObjs() {
  var obj = arguments[0];
  for (i = 1; i < arguments.length; i++) {
    var src = arguments[i]; 
    for (var key in src) {
      if (src.hasOwnProperty(key)) obj[key] = src[key];
    }
  } 
  return obj;
};

function buildQueryParams(obj) {
  return '?'+Object.keys(obj).reduce(function(a,k){a.push(k+'='+encodeURIComponent(obj[k]));return a},[]).join('&')
};

function randomize() {
  return .5 - Math.random();
};

function getNextMonday() {
  var today = new Date();
  var nextMonday = new Date();
  nextMonday.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7);
  
  return nextMonday;
};

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {onlyUnique};
}

//if (!Array.prototype.includes) {
//  Object.defineProperty(Array.prototype, 'includes', {
//    value: function(searchElement, fromIndex) {
//      if (this == null) {
//        throw new TypeError( '"this" is null or not defined');
//      }
//      
//      var o = Object(this);
//      
//      var len = o.length >>> 0;
//      
//      if (len === 0) {
//        return false;
//      }
//      
//      
//    }
//  });
//}

// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(searchElement, fromIndex) {

      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      // 1. Let O be ? ToObject(this value).
      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If len is 0, return false.
      if (len === 0) {
        return false;
      }

      // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)
      var n = fromIndex | 0;

      // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }

      // 7. Repeat, while k < len
      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        if (sameValueZero(o[k], searchElement)) {
          return true;
        }
        // c. Increase k by 1. 
        k++;
      }

      // 8. Return false
      return false;
    }
  });
}