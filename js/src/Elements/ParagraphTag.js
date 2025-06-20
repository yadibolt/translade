export default class ParagraphTag {
  id = null;
  classNames = null;
  content = null;

  constructor(...attr) {
    const { id = null, classNames = null, content = null } = attr[0] || {};

    this.id = id;
    this.classNames = classNames;
    this.content = content;
  }

  getDefault() {
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
