function UIComponent(tagName, className) {
    this.element = document.createElement(tagName);
    if (className) {
        this.element.className = className;
    }
}

Object.assign(UIComponent.prototype, {
    attachTo: function (parent) {
        parent.appendChild(this.element);
    },

    setClass: function (className) {
        this.element.className = className;
    },

    setDisabled: function (state) {
        this.element.disabled = state;
    },

    addEventListener: function (event, callback) {
        this.element.addEventListener(event, callback);
    },
});
