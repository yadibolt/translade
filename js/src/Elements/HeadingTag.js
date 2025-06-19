export default class HeadingTag {
  id = null;
  classNames = null;
  level = null;
  content = null;

  constructor(id = null, classNames = null, level = 1, content = null) {
    this.id = id;
    this.classNames = classNames;
    this.level = level;
    this.content = content;
  }

  getOfTypeDefault() {
    let headingTag = document.createElement(`h${this.level}`);
    if (this.id) {
      headingTag.id = this.id;
    }
    if (this.classNames) {
      headingTag.classList.add(...this.classNames);
    }
    if (this.content) {
      headingTag.innerHTML = this.content;
    }

    return headingTag;
  }
}
