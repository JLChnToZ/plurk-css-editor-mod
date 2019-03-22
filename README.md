# Plurk CSS Editor Mod (噗浪自訂 CSS 編輯器外掛)

This is the mod that replaces [Plurk](https://www.plurk.com) custom CSS text field to a full featured, rich coding [Less](http://lesscss.org/)/[SCSS](http://sass-lang.com/) editor with functionality that auto compiles the code to CSS on-the-fly in the [theme settings page](https://www.plurk.com/Settings/show?page=theme). This is also an experiment on bundles [Monaco Editor](https://microsoft.github.io/monaco-editor/) (The code editor came with Visual Studio Code), [Less.js](http://lesscss.org/), [SASS.js](https://github.com/medialize/sass.js/) with [Webpack](https://webpack.js.org/) and [React](https://reactjs.org) and make them works together in browsers.

這是一個把噗浪設定頁面自訂佈景風格一欄變成一個功能強大的 LESS 、 SCSS 編輯器兼自帶自動編譯功能的外掛。同時這也是一個實驗性質的專案，嘗試把 Monaco Editor (來自 VSCode 的代碼編輯器)、 LESS.js 、 SASS.js 用 Webpack 和 React 包在一起，使其能夠在瀏覽器一起運作。

## Building and Usage

```sh
$ yarn && yarn build
```
Then it will generate bundle.js inside dist folder. Just make this file injected into theme settings page and you will see the result.

This repository just contains the content inside the mod main bundle. To make this run, you will have to inject the bundled script into the settings page. There are many ways to do this, but I think the easiest way is create a UserScript loaded with GreaseMonkey or TamperMonkey. You may use [plurkcss.user.js](plurkcss.user.js) directly.

Once you have finished and reloaded the settings page, you should see the fresh code editor sitting in there.

This mod is tailor-made to working on Plurk. It might works somewhere else, but I bet that you may have to make some modifications on the code, especially on parts integrates with the text field and the form in that page.

## License

[MIT](LICENSE)