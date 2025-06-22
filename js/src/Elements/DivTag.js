export default class DivTag {
  id = null;
  classNames = null;
  dataset = {};
  content = null;

  constructor(...attr) {
    const {
      id = null,
      dataset = {},
      classNames = null,
      content = null,
    } = attr[0] || {};

    this.id = id;
    this.classNames = classNames;
    this.content = content;
    this.dataset = dataset;
  }

  getDefault() {
    let divTag = document.createElement("div");
    if (this.id) {
      divTag.id = this.id;
    }
    if (this.classNames) {
      divTag.classList.add(...this.classNames);
    }
    if (this.content) {
      divTag.innerHTML = this.content;
    }
    if (this.dataset) {
      for (const [key, value] of Object.entries(this.dataset)) {
        divTag.dataset[key] = value;
      }
    }

    return divTag;
  }
}
