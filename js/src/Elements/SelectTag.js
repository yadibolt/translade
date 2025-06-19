import OptionTag from "./OptionTag";
import ExceptionManager from "../Manager/ExceptionManager";

export default class SelectTag {
  id = null;
  name = null;
  options = [];

  constructor(id, name, options = []) {
    this.id = id;
    this.name = name;
    this.options = options;
  }

  getOfTypeDefault() {
    const selectTag = document.createElement('select');
    selectTag.id = this.id;
    selectTag.name = this.name;

    this.options.forEach(optionTag => {
      if (!(optionTag instanceof OptionTag)) return new ExceptionManager().throwException("Invalid OptionTag element provided.", null, null);
      selectTag.appendChild(optionTag);
    });

    return selectTag;
  }
}
