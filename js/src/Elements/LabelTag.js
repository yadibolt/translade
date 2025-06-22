export default class LabelTag {
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
    let labelTag = document.createElement("label");
    if (this.id) {
      labelTag.id = this.id;
    }
    if (this.classNames) {
      labelTag.classList.add(...this.classNames);
    }
    if (this.content) {
      labelTag.innerHTML = this.content;
    }
    if (this.dataset) {
      for (const [key, value] of Object.entries(this.dataset)) {
        labelTag.dataset[key] = value;
      }
    }

    return labelTag;
  }
}
