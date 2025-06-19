import ExceptionManager from "../Manager/ExceptionManager";

const getById = (id) => {
  const element = document.getElementById(id);
  return element ? element : new ExceptionManager().throwException(`Element with ID "${id}" not found.`, null, null);
}

const getAllByClass = (className) => {
  const elements = document.getElementsByClassName(className);
  if (!elements || elements.length === 0) {
    return new ExceptionManager().throwException(`No elements found with class "${className}".`, null, null);
  }
  return elements;
}

const getFirstByClass = (className) => {
  const element = document.getElementsByClassName(className)[0];
  return element ? element : new ExceptionManager().throwException(`First element with class "${className}" not found.`, null, null);
}

export {
  getById,
  getAllByClass,
  getFirstByClass,
}
