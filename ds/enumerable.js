//#####################################################################//
// ENUMERABLE
//#####################################################################//

/**
 * An Enumerable object is an indexable iterable collection. It
 * always uses an array as a backing data store and exposes
 * that array to the user for read/write access.
 * @class
 * @extends Iterable
 * @param {array} data - (Optional) Backing data array
 */
var Enumerable = function(data) {
    this._data = data || [];
};

Enumerable.prototype = new Iterable();

/**
 * @override
 */
Enumerable.prototype.iterator = function() {
    var data = this.data();
    return {
        _data: data,
        _i: 0,
        _hasElements: data.length > 0,
        next: function() {
            var result = this._data[this._i++];
            if (this._i >= this._data.length) {
                this._hasElements = false;
            }
            return result;
        },
        hasElements: function() {
            return this._hasElements;
        }
    };
};

/**
 * Exposes the backing array so its default methods can be used
 * on this collection
 * @returns {array}
 */
Enumerable.prototype.data = function() {
    return this._data;
};

/**
 * Set the backing data array to the new given one
 * @param {array} newData - New backing array
 */
Enumerable.prototype.setData = function(newData) {
    this._data = newData;
};

/**
 * @override
 */
Enumerable.prototype.count = function() {
    return this.data().length;
};

/**
 * Returns the index of the first element of the iterable for which
 * the predicate returns true or -1 if no such element is found
 * @param {function} predicate - A function mapping an item to a boolean
 * @param {object} thisArg - Object to use as *this* when executing predicate
 * @returns {number}
 */
Enumerable.prototype.firstIndex = function(predicate, thisArg) {
    for (var i = 0; i < this.data().length; ++i) {
        if (predicate.call(thisArg, this.data()[i])) {
            return i;
        }
    }
    return -1;
};

/**
 * @override
 */
Enumerable.prototype.last = function(predicate, thisArg) {
    if (predicate === undefined) {
        return this.data()[this.data().length - 1];
    } else {
        for (var i = this.data().length - 1; i >= 0; --i) {
            if (predicate.call(thisArg, this.data()[i])) {
                return this.data()[i];
            }
        }
    }
    return undefined;
};

/**
 * Returns the index of the last element of the iterable for which
 * the predicate returns true or -1 if no such element is found
 * @param {function} predicate - A function mapping an item to a boolean
 * @param {object} thisArg - Object to use as *this* when executing predicate
 * @returns {number}
 */
Enumerable.prototype.lastIndex = function(predicate, thisArg) {
    for (var i = this.count() - 1; i >= 0; --i) {
        if (predicate.call(thisArg, this.data()[i])) {
            return i;
        }
    }
    return -1;
};

/**
 * Removes all items in the enumerable which are equal to the given
 * item according to the equalFunc supplied. If no equal function
 * is supplied strict equality is used instead.
 * @param {any} item - Item to be removed
 * @param {function} equalFunc - Function taking two arguments and
 * @param {object} thisArg - Object to use as *this* when executing equalFunc
 * returning true if they are equal
 */
Enumerable.prototype.remove = function(item, equalFunc, thisArg) {
    equalFunc = equalFunc || function(a, b) {
        return a === b;
    };
    var data = this.data();
    for (var i = 0; i < this.count(); ++i) {
        if (equalFunc.call(thisArg, data[i], item)) {
            data.splice(i, 1);
            i--;
        }
    }
    this.setData(data);
};

/**
 * @override
 */
Enumerable.prototype.toArray = function() {
    return this._data.slice();
};

/**
 * Returns an enumerable collection of numbers.
 * @param {number} start - Starting number (Optional, 0 default)
 * @param {number} step - Increase from one number to
 * the next (Optional, 1 default)
 * @param {number} stop - Last number (Required)
 * @returns {Enumerable}
 */
Enumerable.range = function(start, step, stop) {
    if (start === undefined) {
        return undefined;
    } else if (step === undefined) {
        stop = start;
        step = 1;
        start = 0;
    } else if (stop === undefined) {
        stop = step;
        step = 1;
    }
    var result = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
        result.push(i);
    }
    return new Enumerable(result);
};

