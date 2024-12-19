function Pixel(parent, x, y, defaultColor = "#FFFFFF") {
    UIComponent.call(this, "div", "pixel");
    this.x = x;
    this.y = y;
    this.color = defaultColor;
    this.element.style.backgroundColor = this.color;
    this.element.dataset.position = `${x},${y}`;
    this.attachTo(parent);
}

Pixel.prototype = Object.create(UIComponent.prototype);
Pixel.prototype.constructor = Pixel;

Object.assign(Pixel.prototype, {
    setColor: function (color) {
        this.color = color;
        this.element.style.backgroundColor = color;
    },
});
