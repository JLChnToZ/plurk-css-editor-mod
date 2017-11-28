// ==UserScript==
// @name         Plurk CSS ACE Editor
// @namespace    https://moka-rin.moe/plurkcss
// @version      0.4.1
// @description  Change the custom CSS/LESS box into ACE editor
// @author       JLChnToZ
// @match        http://www.plurk.com/Settings/show?page=theme
// @match        https://www.plurk.com/Settings/show?page=theme
// @grant        none
// ==/UserScript==
// jshint multistr: true

(function() {
  'use strict';
  var head = document.getElementsByTagName('head')[0];
  var originalEditor = document.getElementById('custom_css');
  var parent = originalEditor.parentNode;
  var searchBoxFixed;

  function createElement(tag, attr) {
    var element = document.createElement(tag);
    if(typeof attr === 'object')
      for(var key in attr)
        if(key in element)
          element[key] = attr[key];
        else
          element.setAttribute(key, attr[key]);
    return element;
  }

  var xhrRequest = (function() {
    var xhrfactories = [
      function() { return new XMLHttpRequest(); },
      function() { return new ActiveXObject('Msxml2.XMLHTTP'); },
      function() { return new ActiveXObject('Msxml3.XMLHTTP'); },
      function() { return new ActiveXObject('Microsoft.XMLHTTP'); }
    ];
    function createxhr() {
      for(var i = 0; i < xhrfactories.length; i++)
        try { return xhrfactories[i](); } catch(e) {}
      return false;
    }

    return function xhrRequest(url, callback, postData) {
      var req = createxhr();
      if(!req) return;
      var method = postData ? 'POST' : 'GET';
      req.open(method, url, true);
      if(postData)
        req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      req.onreadystatechange = function() {
        if(req.readyState === 4 && (req.status === 200 || req.status === 304))
          callback(req);
      };
      if(req.readyState === 4) return;
      req.send(postData);
    };
  })();

  function loadScript(src, onload) {
    var script = createElement('script', { src: src, onload: onload });
    head.appendChild(script);
    return script;
  }
  
  function loadCdnScript(checkLib, lib, callback) {
    if(checkLib) return callback();
    xhrRequest('https://api.cdnjs.com/libraries/' + lib + '?fields=name,version,filename', function(e) {
      var d = JSON.parse(e.responseText);
      loadScript(['https://cdnjs.cloudflare.com/ajax/libs', d.name, d.version, d.filename].join('/'), callback);
    });
  }

  function raiseCSSPriority(className) {
    var cssNode = document.getElementById(className);
    if(!cssNode) return false;
    cssNode.textContent = cssNode.textContent.replace(/:\s*(url\(data:\w+\/\w+;base64,[^;{]*|[^;{]+)(?!!important)\s*(;|;\s*}|})/g, ': $1 !important$2');
    return true;
  }

  function loaded() {
    head.appendChild(createElement('style', { textContent: `
    .ace_editor button, .ace_editor button:hover, .ace_editor button:focus, 
    .ace_editor input, .ace_editor input:hover, .ace_editor input:focus {
      color: initial;
      border-radius: initial;
      padding: initial;
      -moz-box-sizing: initial;
      box-sizing: initial;
      font-size: initial;
      display: initial;
      width: initial;
      box-shadow: initial;
      vertical-align: initial;
    }
    #custom_css {
      display: none;
    }
    #custom_css_ace {
      width: 100%;
      height: 100%; height: calc(100vh - 100px - 5em);
      position: relative;
    }
    #custom_css_ace .ace_editor {
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: block;
      position: absolute;
      border: solid 1px #DDD;
      border-radius: 5px;
    }`}));

    var aceContainer = createElement('div', { id: 'custom_css_ace' });
    parent.insertBefore(aceContainer, originalEditor);

    var aceEdit = createElement('div');
    aceContainer.appendChild(aceEdit);

    var editor = window.ace.edit(aceEdit);

    raiseCSSPriority('ace_editor\\.css');
    raiseCSSPriority('ace-tm');
    editor.renderer.addEventListener('themeLoaded', function(e) {
      raiseCSSPriority(e.theme.cssClass);
    });
    editor.on('blur', function() {
      if(!searchBoxFixed && raiseCSSPriority('ace_searchbox'))
        searchBoxFixed = true;
    });

    editor.setTheme('ace/theme/tomorrow');
    editor.setFontSize(14);
    editor.setAnimatedScroll(true);
    editor.setShowPrintMargin(false);
    var srcValue = originalEditor.value;
    var wwHandler, compiling;
    var lessMatch = /\/\*less\.source::([A-Za-z0-9+\/]+={0,2})\*\/\s*$/.exec(srcValue);
    if(lessMatch) {
      editor.setValue(decodeURIComponent(escape(atob(lessMatch[1]))));
      wwHandler = setTimeout(delayCompile, 100);
    } else
      editor.setValue(srcValue);
    editor.clearSelection();

    var session = editor.getSession();
    session.setMode('ace/mode/less');
    session.setUseSoftTabs(true);
    session.setUseWrapMode(true);
    session.setTabSize(2);

    session.on('change', function() {
      if(compiling) return;
      if(wwHandler) clearTimeout(wwHandler);
      wwHandler = setTimeout(delayCompile, 100);
    });

    function delayCompile() {
      compiling = true;
      wwHandler = null;
      var value = editor.getValue();
      if(!value.replace(/^\s+|\s+$/g, '').length) return originalEditor.value = '';
      var footer = '\n\n/*less.source::' + btoa(unescape(encodeURIComponent(value))) + '*/';
      originalEditor.value = value + footer;
      less.render(value)
      .then(function(output) {
        originalEditor.value = output.css + footer;
        compiling = false;
      }, function(e) {
        compiling = false;
      });
    }

    if(ThemeSelectas && ThemeSelectas.clearCustom) {
      var clearCustom = ThemeSelectas.clearCustom;
      ThemeSelectas.clearCustom = function() {
        var result = clearCustom.call(ThemeSelectas, arguments);
        editor.setValue(originalEditor.value);
        return result;
      };
    }
  }

  var loadQueue = [
    [window.atob, 'Base64'],
    [window.Promise, 'es6-promise'],
    [window.less, 'less.js'],
    [window.ace, 'ace'],
  ];
  function loadNext() {
    if(!loadQueue.length) return loaded();
    var lib = loadQueue.shift();
    return loadCdnScript(lib[0], lib[1], loadNext);
  }
  loadNext();
})();