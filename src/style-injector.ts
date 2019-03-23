import { cssRaw } from 'typestyle';

cssRaw(`#custom-css {
  display: none;
}
#custom-css-editor {
  width: 100%;
  height: 100%; height: calc(100vh - 100px - 5em);
  position: relative;
  border: solid 1px #DDD;
}
#custom-css_mode, #custom-css-editor div {
  -webkit-user-select: none;
  -moz-user-select: none;
  -o-user-select: none;
  user-select: none;
}
#custom-css-mode {
  background-color: rgba(255, 255, 255, 0.5);
  padding: 0.1em;
}`);