export default class OptionTag {
  name = null;
  value = null;
  isSelected = false;

  constructor(...attr) {
    const { name = null, value = null, isSelected = false } = attr[0] || {};

    this.name = name;
    this.value = value;
    this.isSelected = isSelected;
  }

  getDefault() {
    const optionTag = document.createElement('option');
    if (this.value) {
      optionTag.setAttribute('value', this.value);
    }
    if (this.name) {
      optionTag.innerHTML = this.name;
    }
    if (this.isSelected) {
      optionTag.setAttribute('selected', 'selected');
    }

    return optionTag;
  }
}
