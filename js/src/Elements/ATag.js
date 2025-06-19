export default class ATag {
  id = null;
  classNames = null;
  href = null;
  title = null;
  dataset = null;
  content = null;

  constructor(id = null, classNames = null, href = null, title = null, dataset = null, content = null) {
    this.id = id;
    this.classNames = classNames;
    this.href = href;
    this.title = title;
    this.dataset = dataset;
    this.content = content;
  }

  getOfTypeDefault() {
    let aTag = document.createElement("a");
    if (this.id) {
      aTag.id = this.id;
    }
    if (this.classNames) {
      aTag.classList.add(...this.classNames);
    }
    if (this.href) {
      aTag.href = this.href;
    }
    if (this.title) {
      aTag.title = this.title;
    }
    if (this.dataset) {
      for (const [key, value] of Object.entries(this.dataset)) {
        aTag.dataset[key] = value;
      }
    }
    if (this.content) {
      aTag.innerHTML = this.content;
    }

    return aTag;
  }
}
