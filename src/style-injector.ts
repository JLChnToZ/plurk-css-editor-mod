'use strict';
import { cssRaw } from 'typestyle';
cssRaw(`#custom_css {
  display: none;
}
#custom_css_editor {
  width: 100%;
  height: 100%; height: calc(100vh - 100px - 5em);
  position: relative;
  border: solid 1px #DDD;
}
#custom_css_mode, #custom_css_editor div {
  -webkit-user-select: none;
  -moz-user-select: none;
  -o-user-select: none;
  user-select: none;
}
#custom_css_mode {
  background-color: rgba(255, 255, 255, 0.5);
  padding: 0.1em;
}`);