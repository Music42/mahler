//#####################################################################//
// SET
//#####################################################################//

/**
 * A set data structure.
 * @class
 * @extends Iterable
 * @param {function} hashFunction - function should take an item and
 * return its hash code.
 */
var HashSet = function(hashFunction) {
    this._keyVal = {};
    this._hash = hashFunction || JSON.stringify;
    this._count = 0;
};

HashSet.prototype = new Iterable();

/**
 * @override
 */
HashSet.prototype.iterator = function() {
    var data = Object.keys(this._keyVal);
    var hasElements = data.length > 0;
    return {
        _data: data,
        _i: 0,
        _hasElements: hasElements,
        _keyVal: this._keyVal,
        next: function() {
            var key = this._data[this._i++];
            var next = this._keyVal[key];
            if (this._i >= this._data.length) {
                this._hasElements = false;
            }
            return next;
        },
        hasElements: function() {
            return this._hasElements;
        }
    };
};

/**
 * Adds an item to the set
 * @param {any} item - Item to be added to the set
 */
HashSet.prototype.add = function(item) {
    var hash = this._hash(item);
    if (this._keyVal[hash] === undefined) {
        this._keyVal[hash] = item;
        this._count += 1;
    }
};

/**
 * Adds a collection of items to the set
 * @param {array|Iterable} items - Colelction of items to be added to the set
 */
HashSet.prototype.addRange = function(items) {
    items.forEach(function(elm) {
        this.add(elm);
    }, this);
};

/**
 * Removes the given item from the set
 * @param {any} item - Item to be removed to the set
 */
HashSet.prototype.remove = function(item) {
    delete this._keyVal[this._hash(item)];
    this._count -= 1;
};

/**
 * Returns true if the set contains the given item
 * @param {any} item - Item to search for
 */
HashSet.prototype.contains = function(item) {
    return this._keyVal[this._hash(item)] !== undefined;
};

/**
 * Returns a new set holding the intersection of
 * the current set with the given set
 * @param {HashSet} otherSet - Set to intersect with
 */
HashSet.prototype.intersect = function(otherSet) {
    var result = new HashSet(this._hash);
    for (var key in this._keyVal) {
        var item = this._keyVal[key];
        if (otherSet.contains(item)) {
            result.add(item);
        }
    }
    return result;
};

/**
 * Returns a new set holding the union of
 * the current set and the given set
 * @param {HashSet} otherSet - Set to unite with
 */
HashSet.prototype.union = function(otherSet) {
    var key;
    var result = new HashSet(this._hash);
    for (key in this._keyVal) {
        result.add(this._keyVal[key]);
    }
    for (key in otherSet._keyVal) {
        result.add(otherSet._keyVal[key]);
    }
    return result;
};

/**
 * @override
 */
HashSet.prototype.toArray = function() {
    var arr = [];
    for (var key in this._keyVal) {
        arr.push(this._keyVal[key]);
    }
    return arr;
};

