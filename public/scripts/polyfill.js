/* Rerun without minification for verbose metadata */

(function(undefined) {Element.prototype.closest=function(t){for(var e=this;e;){if(e.matches(t))return e;e=e.parentElement}return null};Object.assign=function(r,n){for(var t,e=1;e in arguments;++e){n=arguments[e];for(t in n)Object.prototype.hasOwnProperty.call(n,t)&&(r[t]=n[t])}return r};String.prototype.includes=function(t,e){if("object"==typeof t&&t instanceof RegExp)throw new TypeError("First argument to String.prototype.includes must not be a regular expression");return-1!==this.indexOf(t,e)};}).call('object' === typeof window && window || 'object' === typeof self && self || 'object' === typeof global && global || {});