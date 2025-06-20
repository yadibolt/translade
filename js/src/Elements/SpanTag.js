export default class SpanTag {
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
    let spanTag = document.createElement("span");
    if (this.id) {
      spanTag.id = this.id;
    }
    if (this.classNames) {
      spanTag.classList.add(...this.classNames);
    }
    if (this.content) {
      spanTag.innerHTML = this.content;
    }

    return spanTag;
  }
}
