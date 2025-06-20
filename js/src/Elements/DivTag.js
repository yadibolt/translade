export default class DivTag {
  id = null;
  classNames = null;
  content = null;

  constructor(...attr) {
    const {id = null, classNames = null, content = null} = attr[0] || {};

    this.id = id;
    this.classNames = classNames;
    this.content = content;
  }

  getDefault() {
    let divTag = document.createElement("div");
    if (this.id) {
      divTag.id = this.id;
    }
    if (this.classNames) {
      divTag.classList.add(...this.classNames)
    }
    if (this.content) {
      divTag.innerHTML = this.content;
    }

    return divTag;
  }
}
