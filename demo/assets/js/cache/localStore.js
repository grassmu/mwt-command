define(function(require,exports,module) {
    function store(key) {
        this.key = key;
    }
    $.extend(store.prototype, {
        getStore:function() {
            return localStorage.getItem(this.key);
        },
        setStore:function(value, json) {
            localStorage.setItem(this.key, json ? JSON.stringify(value) : value);
        },
        delStore:function() {
            localStorage.removeItem(this.key);
        }
    });
    module.exports = store;
});