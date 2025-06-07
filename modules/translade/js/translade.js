(function ($, Drupal, once) {
  "use strict";

  Drupal.behaviors.translade = {
    attach: function (context, settings) {
      once("translade", "body", context).forEach(function (element) {
        const transladeFields =
          document.getElementsByClassName("translade-field");
        if (transladeFields !== null && transladeFields !== undefined) {
          console.log(transladeFields.length);
        }
      });
    },
  };
})(jQuery, Drupal, once);
