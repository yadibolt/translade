import {getById} from "../Util/HTMLUtil";
import moduleDefaults from "../Defaults/ModuleDefault";
import OptionTag from "../Elements/OptionTag";
import SessionManager from '../Manager/SessionManager';
import SelectTag from "../Elements/SelectTag";
import DivTag from "../Elements/DivTag";
import HeadingTag from "../Elements/HeadingTag";
import ParagraphTag from "../Elements/ParagraphTag";

export default class RendererController {
  constructor() {
  }

  renderTopBar(configuration) {
    const shadowRoot = getById('translade-mount-shadow-root');

    let languageOptions = [];
    configuration.languages.forEach((language, _) => {
      const values = language.split("|");
      const isSelected = values[0] === new SessionManager().getSession().selectedLangId;
      languageOptions.push(new OptionTag(values[1], values[0], isSelected).getOfTypeDefault());
    });

    const languageSelect = new SelectTag('translade-languageTo', 'translade-languageTo', languageOptions).getOfTypeDefault();
    const wrapper = new DivTag(null, ['translade-wrapper'], null).getOfTypeDefault();
    const title = new HeadingTag(null, null, 3, "Translade").getOfTypeDefault();
    const description = new ParagraphTag(null, null, "Select a language to translate to.").getOfTypeDefault();

    [title, languageSelect, description].forEach((children, _) => {
      wrapper.appendChild(children);
    });

    shadowRoot.appendChild(wrapper);
  }

  renderActionsForFields() {
    // TODO
  }
}
