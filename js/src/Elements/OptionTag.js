export default class OptionTag {
  name = null;
  value = null;
  isSelected = null;

  /**
   * @param name
   * @param value
   * @param isSelected
   */
  constructor(name, value, isSelected) {
    this.name = name;
    this.value = value;
    this.isSelected = isSelected;
  }

  getOfTypeDefault() {
    const optionTag = document.createElement('option');
    optionTag.value = this.value;
    optionTag.name = name;
    optionTag.selected = this.isSelected;

    return optionTag;
  }
}
