export default class ImageTag {
  id = null;
  classNames = null;
  src = null;
  alt = null;

  constructor(...attr) {
    const {
      id = null,
      classNames = null,
      src = null,
      alt = null,
    } = attr[0] || {};

    this.id = id;
    this.classNames = classNames;
    this.src = src;
    this.alt = alt;
  }

  getDefault() {
    let imageTag = document.createElement("img");
    if (this.id) {
      imageTag.id = this.id;
    }
    if (this.classNames) {
      imageTag.classList.add(...this.classNames);
    }
    if (this.src) {
      imageTag.src = this.src;
    }
    if (this.alt) {
      imageTag.alt = this.alt;
    }

    return imageTag;
  }
}
