//#####################################################################//
// ITERABLE
//#####################################################################//

/**
 * An iterable is a collection you can iterate through
 * regardless of the backing data. It exposes nice LINQ-esque
 * extension methods.
 * @param {function} iteratorFunc - Iterator function returning
 * new instances of the iterator object associated with this object
 * @class
 */
var Iterable = function(iteratorFunc) {
    this._it = iteratorFunc;
};

/**
 * Returns the iterator associated with the current iterable. An iterator
 * is used to step through collections.
 */
Iterable.prototype.iterator = function() {
    return this._it();
};

/**
 * Returns an iterable holding the first count elements
 * of the collection
 * @param {number} count - Number of elements to take
 * @returns {Iterable}
 */
Iterable.prototype.take = function(count) {
    var it = this.iterator();
    var hasElements = it.hasElements();
    if (hasElements) {
        if (count === 0) {
            hasElements = false;
        }
    }
    var iterFunc = function() {
        return {
            _it: it,
            _i: 0,
            _limit: count,
            _hasElements: hasElements,
            next: function() {
                if (this._it.hasElements() && this._i < this._limit) {
                    this._i++;
                    var result = this._it.next();
                    if (this._i >= this._limit || !this._it.hasElements()) {
                        this._hasElements = false;
                    }
                    return result;
                }
                this._hasElements = false;
                return undefined;
            },
            hasElements: function() {
                return this._hasElements;
            }
        };
    };
    return new Iterable(iterFunc);
};

/**
 * Takes elements from the collection as long as the
 * predicate returns true and returns them on the first false
 * @param {function} predicate - A function mapping an item to a boolean
 * @param {object} thisArg - Object to use as *this* when executing equalFunc
 * @returns {Iterable}
 */
Iterable.prototype.takeWhile = function(predicate, thisArg) {
    var it = this.iterator();
    var hasElements = it.hasElements();
    var next;
    if (hasElements) {
        next = it.next();
        if (!predicate.call(thisArg, next)) {
            hasElements = false;
            next = undefined;
        }
    }
    var iterFunc = function() {
        return {
            _it: it,
            _predicate: predicate,
            _this: thisArg,
            _hasElements: hasElements,
            _next: next,
            next: function() {
                var result = this._next;
                this._next = undefined;
                if (this._it.hasElements()) {
                    this._next = this._it.next();
                    if (!predicate.call(thisArg, this._next)) {
                        this._hasElements = false;
                        this._next = undefined;
                    }
                } else {
                    this._hasElements = false;
                }
                return result;
            },
            hasElements: function() {
                return this._hasElements;
            }
        };
    };
    return new Iterable(iterFunc);
};

/**
 * Skips through the first count elements and returns
 * an iterable holding the remaining ones
 * @param {number} count - Number of elements to skip
 * @returns {Iterable}
 */
Iterable.prototype.skip = function(count) {
    var it = this.iterator();
    var n = 0;
    while (it.hasElements()) {
        if (n < count) {
            it.next();
            ++n;
        } else {
            break;
        }
    }
    var iterFunc = function() {
        return {
            _it: it,
            _hasElements: it.hasElements(),
            next: function() {
                if (this._it.hasElements()) {
                    var result = this._it.next();
                    this._hasElements = this._it.hasElements();
                    return result;
                }
                this._hasElements = false;
                return undefined;
            },
            hasElements: function() {
                return this._hasElements;
            }
        };
    };
    return new Iterable(iterFunc);
};

/**
 * Returns an iterable holding the entire collection
 * except the last n elements
 * @param {number} n - Number of elements at the end of the collection
 * which should be ignored
 * @returns {Iterable}
 */
Iterable.prototype.skipLast = function(n) {
    return this.take(this.count() - n);
};

/**
 * Skips elements from the collection as long as the
 * predicate returns true and returns the remaining ones
 * @param {function} predicate - A function mapping an item to a boolean
 * @Param {object} thisArg - Object to use as *this* when executing predicate
 * @returns {Iterable}
 */
Iterable.prototype.skipWhile = function(predicate, thisArg) {
    var it = this.iterator();
    var next;
    while (it.hasElements()) {
        next = it.next();
        if (predicate.call(thisArg, next)) {
            next = undefined;
            continue;
        } else {
            break;
        }
    }
    var iterFunc = function() {
        return {
            _it: it,
            _hasElements: it.hasElements(),
            _next: next,
            next: function() {
                var result = this._next;
                this._next = undefined;
                if (this._it.hasElements()) {
                    this._next = this._it.next();
                } else {
                    this._hasElements = false;
                }
                return result;
            },
            hasElements: function() {
                return this._hasElements;
            }
        };
    };
    return new Iterable(iterFunc);
};

/**
 * Returns the number of elements in the iterable collection.
 * @returns {number}
 */
Iterable.prototype.count = function() {
    if (this._count) {
        return this._count;
    } else {
        var it = this.iterator();
        var count = 0;
        while (it.hasElements()) {
            var next = it.next();
            count += 1;
        }
        return count;
    }
};

/**
 * Returns true if the collection is empty
 * @returns {boolean}
 */
Iterable.prototype.empty = function() {
    return !this.iterator().hasElements();
};

/**
 * Returns true if the given item is found in the iterable
 * collection.
 * @param {any} item - The item to look for
 * @param {function} equalFunc - A function taking two parameters
 * and returning true if they are equal. If no such function is
 * provided strict equality is used instead
 * @param {object} thisArg - Object to use as *this* when executing equalFunc
 * @returns {boolean}
 */
Iterable.prototype.contains = function(item, equalFunc, thisArg) {
    equalFunc = equalFunc || function(a, b) {
        return a === b;
    };
    var it = this.iterator();
    while (it.hasElements()) {
        var next = it.next();
        if (equalFunc.call(thisArg, item, next)) {
            return true;
        }
    }
    return false;
};

/**
 * Returns the first element of the iterable for which the predicate
 * returns true. If no predicate is given the first element of the
 * collection is returned.
 * @param {function} predicate - A function mapping an item to a boolean
 * @param {object} thisArg - Object to use as *this* when executing predicate
 * @returns {any}
 */
Iterable.prototype.first = function(predicate, thisArg) {
    var it = this.iterator();
    while (it.hasElements()) {
        var next = it.next();
        if (predicate === undefined) {
            return next;
        }
        if (predicate.call(thisArg, next)) {
            return next;
        }
    }
    return undefined;
};

/**
 * Returns the last element of the iterable for which the predicate
 * returns true. If no predicate is given the last element of the
 * collection is returned.
 * @param {function} predicate - A function mapping an item to a boolean
 * @param {object} thisArg - Object to use as *this* when executing predicate
 * @returns {any}
 */
Iterable.prototype.last = function(predicate, thisArg) {
    var it = this.iterator();
    var next, last;
    while (it.hasElements()) {
        next = it.next();
        if (predicate !== undefined) {
            if (predicate.call(thisArg, next)) {
                last = next;
            }
        } else {
            last = next;
        }

    }
    return last;
};

/**
 * Returns an iterable holding only those elements of the collection
 * for which the predicate returns true
 * @param {function} predicate - A function mapping an item to a boolean
 * @param {object} thisArg - Object to use as *this* when executing predicate
 * @returns {Iterable}
 */
Iterable.prototype.where = function(predicate, thisArg) {
    var it = this.iterator();
    var next;
    while (it.hasElements()) {
        next = it.next();
        if (!predicate.call(thisArg, next)) {
            next = undefined;
            continue;
        } else {
            break;
        }
    }
    var hasElements = next !== undefined ? true : false;
    var iterFunc = function() {
        return {
            _it: it,
            _hasElements: hasElements,
            _next: next,
            next: function() {
                var result = this._next;
                this._next = undefined;
                while (this._it.hasElements()) {
                    this._next = this._it.next();
                    if (!predicate.call(thisArg, this._next)) {
                        this._next = undefined;
                        continue;
                    } else {
                        break;
                    }
                }
                if (this._next === undefined) {
                    this._hasElements = false;
                }
                return result;
            },
            hasElements: function() {
                return this._hasElements;
            }
        };
    };
    return new Iterable(iterFunc);
};

/**
 * Project the current iterable into a new iterable holding the
 * results of applying the mapping function to every element
 * @param {function} mapFunc - A function mapping an item of
 * the iterable to another object
 * @param {object} thisArg - Object to use as *this* when executing mapFunc
 * @returns {Iterable}
 */
Iterable.prototype.select = function(mapFunc, thisArg) {
    var it = this.iterator();
    var iterFunc = function() {
        return {
            _it: it,
            _hasElements: it.hasElements(),
            next: function() {
                var result = mapFunc.call(thisArg, this._it.next());
                this._hasElements = this._it.hasElements();
                return result;
            },
            hasElements: function() {
                return this._hasElements;
            }
        };
    };
    return new Iterable(iterFunc);
};

/**
 * Calls the given function for every element in the collection
 * @param {function} func - Function taking one argument to be called
 * on every element
 * @param {object} thisArg - Object to use as *this* when executing func
 */
Iterable.prototype.forEach = function(func, thisArg) {
    var it = this.iterator();
    while (it.hasElements()) {
        next = it.next();
        func.call(thisArg, next);
    }
};

/**
 * Calls the given function for every element in the collection and
 * returns true only if every function call returns true
 * @param {function} func - Function taking one argument to be called
 * on every element
 * @param {object} thisArg - Object to use as *this* when executing func
 * @returns {boolean}
 */
Iterable.prototype.all = function(func, thisArg) {
    var it = this.iterator();
    var result = it.hasElements();
    while (it.hasElements()) {
        next = it.next();
        if (!func.call(thisArg, next)) {
            return false;
        }
    }
    return result;
};

/**
 * Calls the given function on elements in the collection and
 * returns true if one of the function calls returns true
 * @param {function} func - Function taking one argument
 * @param {object} thisArg - Object to use as *this* when executing func
 * @returns {boolean}
 */
Iterable.prototype.any = function(func, thisArg) {
    var it = this.iterator();
    while (it.hasElements()) {
        next = it.next();
        if (func.call(thisArg, next)) {
            return true;
        }
    }
    return false;
};

/**
 * Groups the elements of the iterable according to the specified
 * key selector function.
 * @param {function} func - Function taking one argument and returning
 * a string key identifying the group the argument belongs to
 * @param {object} thisArg - Object to use as *this* when executing func
 * @returns {object}
 */
Iterable.prototype.groupBy = function(func, thisArg) {
    var it = this.iterator();
    var group = {};
    while (it.hasElements()) {
        var next = it.next();
        var key = func.call(thisArg, next);
        if (group[key] === undefined) {
            group[key] = [next];
        } else {
            group[key].push(next);
        }
    }
    return group;
};

/**
 * Reduce the iterable collection to a single object
 * @param {any} result - Accumulating object
 * @param {function} accumulator - Accumulator function of two arguments,
 * the current accumulated result and the current item
 * @param {object} thisArg - Object to use as *this* when executing accumulator
 * @example
 * collection = new List([1, 2, 3]);
 * // sums the items of the collection, returns 6
 * collection.aggregate(0, function(sum, element){return sum + element;});
 * @returns {any}
 */
Iterable.prototype.aggregate = function(result, accumulator, thisArg) {
    var it = this.iterator();
    while (it.hasElements()) {
        var next = it.next();
        result = accumulator.call(thisArg, result, next);
    }
    return result;
};

/**
 * Iterates through the collection and returns the maximum
 * @param {function} comparer - Function taking two items and returning
 * the higher of the two. If no comparer is supplied Math.max is used
 * @param {object} thisArg - Object to use as *this* when executing comparer
 * @returns {any}
 */
Iterable.prototype.max = function(comparer, thisArg) {
    comparer = comparer || Math.max;
    var it = this.iterator();
    var next = it.next();
    var max = next;
    while (it.hasElements()) {
        next = it.next();
        max = comparer.call(thisArg, max, next);
    }
    return max;
};

/**
 * Iterates through the collection and returns the minimum
 * @param {function} comparer - Function taking two items and returning
 * the lower of the two. If no comparer is supplied Math.min is used
 * @param {object} thisArg - Object to use as *this* when executing comparer
 * @returns {any}
 */
Iterable.prototype.min = function(comparer, thisArg) {
    comparer = comparer || Math.min;
    var it = this.iterator();
    var next = it.next();
    var min = next;
    while (it.hasElements()) {
        next = it.next();
        min = comparer.call(thisArg, min, next);
    }
    return min;
};

/**
 * Maps the items of the iterable to numbers and sums them up
 * @param {function} mapFunc - Function taking one item as an argument
 * and returning a number. If no mapping function is supplied Number()
 * is used instead
 * @param {object} thisArg - Object to use as *this* when executing mapFunc
 * @returns {number}
 */
Iterable.prototype.sum = function(mapFunc, thisArg) {
    mapFunc = mapFunc || Number;
    var it = this.iterator();
    var sum = 0;
    while (it.hasElements()) {
        var next = it.next();
        sum += mapFunc.call(thisArg, next);
    }
    return sum;
};

/**
 * Collects the items of the iterable into an array and returns it
 * @returns {array}
 */
Iterable.prototype.toArray = function() {
    var it = this.iterator();
    var arr = [];
    while (it.hasElements()) {
        arr.push(it.next());
    }
    return arr;
};

/**
 * Collects the items of the iterable into a HashSet and returns it
 * @returns {array}
 */
Iterable.prototype.toHashSet = function(hashFunction) {
    var it = this.iterator();
    var HashSet = require('./hashset.js').HashSet;
    var set = new HashSet(hashFunction);
    while (it.hasElements()) {
        set.add(it.next());
    }
    return set;
};

/**
 * Returns an iterable, possibly infinte, collection of numbers.
 * @param {number} start - Starting number (Optional, 0 default)
 * @param {number} step - Increase from one number to
 * the next (Optional, 1 default)
 * @param {number} stop - Last number (Optional, infinite default)
 * @returns {Iterable}
 */
Iterable.range = function(start, step, stop) {
    if (start === undefined) {
        start = 0;
        step = 1;
    } else if (step === undefined) {
        stop = start;
        step = 1;
        start = 0;
    } else if (stop === undefined) {
        stop = step;
        step = 1;
    }
    var hasElements = true;
    if (stop !== undefined) {
        if (step > 0 && start >= stop) {
            hasElements = false;
        }
        if (step < 0 && start <= stop) {
            hasElements = false;
        }
    }
    var iterFunc = function() {
        return {
            _i: start,
            _limit: stop,
            _step: step,
            _hasElements: hasElements,
            next: function() {
                var result = this._i;
                this._i += this._step;
                if (this._limit === undefined) {
                    return result;
                } else {
                    if (step > 0 && this._i >= this._limit ||
                        step < 0 && this._i <= this._limit) {
                        this._hasElements = false;
                    }
                }
                if (step > 0 && result >= this._limit ||
                    step < 0 && result <= this._limit) {
                    return undefined;
                } else {
                    return result;
                }
            },
            hasElements: function() {
                return this._hasElements;
            }
        };
    };
    return new Iterable(iterFunc);
};

/**
 * Returns an iterable, possibly infinte, collection of
 * a repeating value.
 * @param {number} value - Value to repeat (Optional, 0 default)
 * @returns {Iterable}
 */
Iterable.repeat = function(value) {
    value = value === undefined ? 0 : value;
    var iterFunc = function() {
        return {
            hasElements: function() {
                return true;
            },
            next: function() {
                return value;
            }
        };
    };
    return new Iterable(iterFunc);
};
