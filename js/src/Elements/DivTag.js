export default class DivTag {
  id = null;
  classNames = null;
  content = null;

  constructor(id = null, classNames = null, content = null) {
    this.id = id;
    this.classNames = classNames;
    this.content = content;
  }

  getOfTypeDefault() {
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
