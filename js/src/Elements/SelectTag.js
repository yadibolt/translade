import OptionTag from "./OptionTag";
import ExceptionManager from "../Manager/ExceptionManager";
export default class SelectTag {
  id = null;
  name = null;
  options = [];
  constructor(...attr) {
    const { id = null, name = null, options = [] } = attr[0] || {};

    this.id = id;
    this.name = name;
    this.options = options;
  }

  getDefault() {
    const selectTag = document.createElement('select');
    if (this.id) {
      selectTag.id = this.id;
    }
    if (this.name) {
      selectTag.name = this.name;
    }
    if (this.options.length > 0) {
      this.options.forEach(optionTag => {
        if (!optionTag) return new ExceptionManager().throwException("Invalid OptionTag element provided.", null, null);
        selectTag.appendChild(optionTag);
      });
    }

    return selectTag;
  }
}
