const moduleDefaults = {
  modulePrefix: "<Translade>:",
  sessionName: "translade-settings",
  assetsFolder: "/modules/translade",
  localesFolder: "/modules/translade/locales",
  selectedLangIdDefault: "default",
  maximumHistoryLength: 50,
  specialToken: "|TRSLD_SPT|",
  baseUrl: "/api/translade",
  translationEndpoint: "/translate",
  rephraseEndpoint: "/rephrase",
  checkGrammarEndpoint: "/check-grammar",
  summarizeEndpoint: "/summarize",
  expandContentEndpoint: "/expand-content",
  shortenContentEndpoint: "/shorten-content",
  changeToneProfessionalEndpoint: "/change-tone-professional",
  changeToneCasualEndpoint: "/change-tone-casual",
  simplifyContentEndpoint: "/simplify-content",
};

export default moduleDefaults;
