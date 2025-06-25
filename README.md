# Translade

**Translade** is AI-based translation and content enhancement module for **Drupal 10/11**. It automatically translates text fields across content types using AI, while also offering flexible options to **summarize**, **condense**, or **modify** your content in other ways. **Translade** brings AI-driven translation and content enhancement to your Drupal workflows, making it easier than ever to maintain multilingual, polished content across your site.

## Features

- **AI-Powered Translations**
  Automatically translates all text-based fields using OpenAI, Google Gemini.

- **Content Transformation Options**
  Choose from improvements like summarization, condensation, and tone adjustment. (There are more options than that)

- **Broad Content Support**
  Supports nodes (including ecommerce nodes), taxonomy terms, and CKEditor content.

- **Configurable Settings**
  - Select AI model
  - Define target languages
  - Customize field translation behavior
  - ... or set a theme? hah

- **UI Translation via JSON**
  Add localized interface strings by dropping JSON files into the `/locales` folder.

- **Translation History**
  Each field has its own history which limit can be edited. Upon reloading the page the history is not retained!

## Installation

1. Install the module as you would any Drupal module, via drag&drop, no composer unfortunatelly.
2. Go to the Translade providers page.
3. Enter your API key and a provider you want to use.
4. Go to the Translade configuration page.
5. Specify the languages you want to use, select content types, taxonomy types you wish to integrate with.
6. Select AI actions that you will be using.
7. That's it! You are now able to swiftly translate and modify the text based content!
8. (Optional) Create `/locales/your-language-id.json` files for UI translation. (Supports only **valid Drupal Language ids**)

## Requirements

- Drupal 10 or 11
- PHP 8.1 or higher
- CKEditor 5 (optional)

## Module modification

This is definitely possible, and here is what you need to know

- The JavaScript part is bundled with **Webpack**
- **Webpack** configuration file `webpack.config.js` is included in the source
- It is as easy as editing the contents, running webpack, that's it!

## ❗ Warning

This project is most likely not going to be maintained in the future. It is a "one stop solution", but depending on its use cases it might see an update.

... and lastly, if you encounter any **bug** or you miss some **feature** let me know! 😊
