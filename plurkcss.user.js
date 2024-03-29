// ==UserScript==
// @name         Plurk CSS Monaco Editor
// @namespace    https://moka-rin.moe/misc/plurkcss/
// @version      0.6.1
// @description  Change the custom CSS box into Monaco Editor with LESS/SCSS support
// @author       JLChnToZ
// @downloadURL  https://moka-rin.moe/misc/plurkcss/plurkcss.user.js
// @match        https://www.plurk.com/*
// @grant        none
// ==/UserScript==
// jshint multistr: true

(function() {
  'use strict';
  
  function loadScript(src) {
    var script = document.createElement('script');
    script.src = src;
    document.head.appendChild(script);
    return script;
  }

  loadScript('https://moka-rin.moe/misc/plurkcss/main.f831b7a6479c0c1a0748.js');
})();
