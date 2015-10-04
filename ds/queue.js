//#####################################################################//
// QUEUE
//#####################################################################//

/**
 * A regular FIFO Queue object.
 * @class
 * @extends Enumerable
 */
var Queue = function() {
    this._data = [];
    this._first = 0;
    this._count = 0;
};

Queue.prototype = new Enumerable();

/**
 * @override
 */
Queue.prototype.iterator = function() {
    return {
        _data: this._data,
        _i: this._first,
        _hasElements: this._count > 0,
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
 * @override
 */
Queue.prototype.data = function() {
    if (this._first !== 0) {
        this._data = this._data.splice(this._first);
        this._first = 0;
    }
    return this._data;
};

/**
 * @override
 */
Queue.prototype.setData = function(newData) {
    this._data = newData;
    this._first = 0;
    this._count = newData.length;
};

/**
 * Adds item at the end of the queue
 * @param {any} item - Item to be added to the queue
 */
Queue.prototype.enqueue = function(item) {
    this._data.push(item);
    this._count += 1;
};

/**
 * Gets the item at the start of the queue and
 * removes it from the queue
 * @returns {any}
 */
Queue.prototype.dequeue = function() {
    var item = this._data[this._first];
    this._first += 1;
    if (this._first * 2 >= this._data.length) {
        this._data = this._data.splice(this._first);
        this._first = 0;
    }
    this._count -= 1;
    return item;
};

/**
 * Gets the item at the start of the queue without
 * removing it from the queue
 * @returns {any}
 */
Queue.prototype.peek = function() {
    return this._data[this._first];
};

/**
 * @override
 */
Queue.prototype.count = function() {
    return this._count;
};

