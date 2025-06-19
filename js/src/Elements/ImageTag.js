export default class ImageTag {
  id = null;
  classNames = null;
  src = null;
  alt = null;

  constructor(id = null, classNames = null, src = null, alt = null) {
    this.id = id;
    this.classNames = classNames;
    this.src = src;
    this.alt = alt;
  }

  getOfTypeDefault() {
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
