function Button(label, action) {
  UIComponent.call(this, "button");
  this.setText(label);
  this.addEventListener("click", action);
}

Button.prototype = Object.create(UIComponent.prototype);
Button.prototype.constructor = Button;

Object.assign(Button.prototype, {
  setText: function (text) {
    this.element.innerText = text;
  },
});
