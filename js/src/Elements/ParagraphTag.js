export default class ParagraphTag {
  id = null;
  classNames = null;
  content = null;

  constructor(id = null, classNames = null, content = null) {
    this.id = id;
    this.classNames = classNames;
    this.content = content;
  }

  getOfTypeDefault() {
    let paragraphTag = document.createElement("p");
    if (this.id) {
      paragraphTag.id = this.id;
    }
    if (this.classNames) {
      paragraphTag.classList.add(...this.classNames);
    }
    if (this.content) {
      paragraphTag.innerHTML = this.content;
    }

    return paragraphTag;
  }
}
