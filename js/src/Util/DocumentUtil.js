import ExceptionManager from "../Manager/ExceptionManager";

const silenceExceptions = true;

const getById = (id) => {
  const element = document.getElementById(id);
  return element
    ? element
    : new ExceptionManager().throwException(
        `Element with ID "${id}" not found.`,
        null,
        null,
        silenceExceptions
      );
};

const getAllByClass = (className, root = null) => {
  if (root !== null) {
    const elements = root.getElementsByClassName(className);
    if (!elements || elements.length === 0) {
      return new ExceptionManager().throwException(
        `No elements found with class "${className}".`,
        null,
        null,
        silenceExceptions
      );
    }
    return elements;
  } else {
    const elements = document.getElementsByClassName(className);
    if (!elements || elements.length === 0) {
      return new ExceptionManager().throwException(
        `No elements found with class "${className}".`,
        null,
        null,
        silenceExceptions
      );
    }
    return elements;
  }
};

const getFirstByClass = (className) => {
  const element = document.getElementsByClassName(className)[0];
  return element
    ? element
    : new ExceptionManager().throwException(
        `First element with class "${className}" not found.`,
        null,
        null,
      silenceExceptions
      );
};

const getFirstBySelector = (selector, root = null) => {
  if (root !== null) {
    const element = root.querySelectorAll(selector)[0];
    return element
      ? element
      : new ExceptionManager().throwException(
          `Element with selector "${selector}" not found in the provided root.`,
          null,
          null,
          silenceExceptions
        );
  } else {
    const element = document.querySelectorAll(selector)[0];
    return element
      ? element
      : new ExceptionManager().throwException(
          `Element with selector "${selector}" not found.`,
          null,
          null,
          silenceExceptions
        );
  }
};

const getAllBySelector = (selector, root = null) => {
  if (root !== null) {
    const elements = root.querySelectorAll(selector);
    return elements
      ? elements
      : new ExceptionManager().throwException(
          `Element with selector "${selector}" not found in the provided root.`,
          null,
          null,
          silenceExceptions
        );
  } else {
    const elements = document.querySelectorAll(selector);
    return elements
      ? elements
      : new ExceptionManager().throwException(
          `Element with selector "${selector}" not found.`,
          null,
          null,
          silenceExceptions
        );
  }
};

const swapActiveClassName = (disableFor = [], enableFor = [], className) => {
  disableFor.forEach((HTMLElem, _) => {
    if (HTMLElem.classList) {
      HTMLElem.classList.contains(className)
        ? HTMLElem.classList.remove(className)
        : null;
    }
  });

  enableFor.forEach((HTMLElem, _) => {
    if (HTMLElem.classList) {
      !HTMLElem.classList.contains(className)
        ? HTMLElem.classList.add(className)
        : null;
    }
  });
};

export {
  getById,
  getAllByClass,
  getFirstByClass,
  getFirstBySelector,
  getAllBySelector,
  swapActiveClassName,
};
