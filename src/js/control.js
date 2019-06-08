function ControlManager(total, index) {
    this.index = index;
    this.total = total;
}

ControlManager.prototype = {
    prev: function () {
        return this.getIndex(-1)
    },
    next: function () {
        return this.getIndex(1)
    },
    getIndex: function (val) {
        let index = this.index;
        let total = this.total;
        let curIndex = (index + total + val) % total;
        this.index = curIndex;
        return curIndex
    }
};

export default {
    ControlManager: function (total, index) {
        this.index = index;
        this.total = total;
        this.prev = function () {
            return this.getIndex(-1)
        };
        this.next = function () {
            return this.getIndex(1)
        };
        this.getIndex = function (val) {
            let index = this.index;
            let total = this.total;
            let curIndex = (index + total + val) % total;
            this.index = curIndex;
            return curIndex
        }
    }
}