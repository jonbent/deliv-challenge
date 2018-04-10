/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/master/actionview/app/assets/javascripts
Released under the MIT license
 */


(function() {
  var context = this;

  (function() {
    (function() {
      this.Rails = {
        linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',
        buttonClickSelector: {
          selector: 'button[data-remote]:not([form]), button[data-confirm]:not([form])',
          exclude: 'form button'
        },
        inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',
        formSubmitSelector: 'form',
        formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',
        formDisableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',
        formEnableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',
        fileInputSelector: 'input[name][type=file]:not([disabled])',
        linkDisableSelector: 'a[data-disable-with], a[data-disable]',
        buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]'
      };

    }).call(this);
  }).call(context);

  var Rails = context.Rails;

  (function() {
    (function() {
      var expando, m;

      m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;

      Rails.matches = function(element, selector) {
        if (selector.exclude != null) {
          return m.call(element, selector.selector) && !m.call(element, selector.exclude);
        } else {
          return m.call(element, selector);
        }
      };

      expando = '_ujsData';

      Rails.getData = function(element, key) {
        var ref;
        return (ref = element[expando]) != null ? ref[key] : void 0;
      };

      Rails.setData = function(element, key, value) {
        if (element[expando] == null) {
          element[expando] = {};
        }
        return element[expando][key] = value;
      };

      Rails.$ = function(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
      };

    }).call(this);
    (function() {
      var $, csrfParam, csrfToken;

      $ = Rails.$;

      csrfToken = Rails.csrfToken = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-token]');
        return meta && meta.content;
      };

      csrfParam = Rails.csrfParam = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-param]');
        return meta && meta.content;
      };

      Rails.CSRFProtection = function(xhr) {
        var token;
        token = csrfToken();
        if (token != null) {
          return xhr.setRequestHeader('X-CSRF-Token', token);
        }
      };

      Rails.refreshCSRFTokens = function() {
        var param, token;
        token = csrfToken();
        param = csrfParam();
        if ((token != null) && (param != null)) {
          return $('form input[name="' + param + '"]').forEach(function(input) {
            return input.value = token;
          });
        }
      };

    }).call(this);
    (function() {
      var CustomEvent, fire, matches;

      matches = Rails.matches;

      CustomEvent = window.CustomEvent;

      if (typeof CustomEvent !== 'function') {
        CustomEvent = function(event, params) {
          var evt;
          evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
      }

      fire = Rails.fire = function(obj, name, data) {
        var event;
        event = new CustomEvent(name, {
          bubbles: true,
          cancelable: true,
          detail: data
        });
        obj.dispatchEvent(event);
        return !event.defaultPrevented;
      };

      Rails.stopEverything = function(e) {
        fire(e.target, 'ujs:everythingStopped');
        e.preventDefault();
        e.stopPropagation();
        return e.stopImmediatePropagation();
      };

      Rails.delegate = function(element, selector, eventType, handler) {
        return element.addEventListener(eventType, function(e) {
          var target;
          target = e.target;
          while (!(!(target instanceof Element) || matches(target, selector))) {
            target = target.parentNode;
          }
          if (target instanceof Element && handler.call(target, e) === false) {
            e.preventDefault();
            return e.stopPropagation();
          }
        });
      };

    }).call(this);
    (function() {
      var AcceptHeaders, CSRFProtection, createXHR, fire, prepareOptions, processResponse;

      CSRFProtection = Rails.CSRFProtection, fire = Rails.fire;

      AcceptHeaders = {
        '*': '*/*',
        text: 'text/plain',
        html: 'text/html',
        xml: 'application/xml, text/xml',
        json: 'application/json, text/javascript',
        script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
      };

      Rails.ajax = function(options) {
        var xhr;
        options = prepareOptions(options);
        xhr = createXHR(options, function() {
          var response;
          response = processResponse(xhr.response, xhr.getResponseHeader('Content-Type'));
          if (Math.floor(xhr.status / 100) === 2) {
            if (typeof options.success === "function") {
              options.success(response, xhr.statusText, xhr);
            }
          } else {
            if (typeof options.error === "function") {
              options.error(response, xhr.statusText, xhr);
            }
          }
          return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
        });
        if (!(typeof options.beforeSend === "function" ? options.beforeSend(xhr, options) : void 0)) {
          return false;
        }
        if (xhr.readyState === XMLHttpRequest.OPENED) {
          return xhr.send(options.data);
        }
      };

      prepareOptions = function(options) {
        options.url = options.url || location.href;
        options.type = options.type.toUpperCase();
        if (options.type === 'GET' && options.data) {
          if (options.url.indexOf('?') < 0) {
            options.url += '?' + options.data;
          } else {
            options.url += '&' + options.data;
          }
        }
        if (AcceptHeaders[options.dataType] == null) {
          options.dataType = '*';
        }
        options.accept = AcceptHeaders[options.dataType];
        if (options.dataType !== '*') {
          options.accept += ', */*; q=0.01';
        }
        return options;
      };

      createXHR = function(options, done) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('Accept', options.accept);
        if (typeof options.data === 'string') {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
        if (!options.crossDomain) {
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
        CSRFProtection(xhr);
        xhr.withCredentials = !!options.withCredentials;
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            return done(xhr);
          }
        };
        return xhr;
      };

      processResponse = function(response, type) {
        var parser, script;
        if (typeof response === 'string' && typeof type === 'string') {
          if (type.match(/\bjson\b/)) {
            try {
              response = JSON.parse(response);
            } catch (error) {}
          } else if (type.match(/\b(?:java|ecma)script\b/)) {
            script = document.createElement('script');
            script.text = response;
            document.head.appendChild(script).parentNode.removeChild(script);
          } else if (type.match(/\b(xml|html|svg)\b/)) {
            parser = new DOMParser();
            type = type.replace(/;.+/, '');
            try {
              response = parser.parseFromString(response, type);
            } catch (error) {}
          }
        }
        return response;
      };

      Rails.href = function(element) {
        return element.href;
      };

      Rails.isCrossDomain = function(url) {
        var e, originAnchor, urlAnchor;
        originAnchor = document.createElement('a');
        originAnchor.href = location.href;
        urlAnchor = document.createElement('a');
        try {
          urlAnchor.href = url;
          return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) || (originAnchor.protocol + '//' + originAnchor.host === urlAnchor.protocol + '//' + urlAnchor.host));
        } catch (error) {
          e = error;
          return true;
        }
      };

    }).call(this);
    (function() {
      var matches, toArray;

      matches = Rails.matches;

      toArray = function(e) {
        return Array.prototype.slice.call(e);
      };

      Rails.serializeElement = function(element, additionalParam) {
        var inputs, params;
        inputs = [element];
        if (matches(element, 'form')) {
          inputs = toArray(element.elements);
        }
        params = [];
        inputs.forEach(function(input) {
          if (!input.name || input.disabled) {
            return;
          }
          if (matches(input, 'select')) {
            return toArray(input.options).forEach(function(option) {
              if (option.selected) {
                return params.push({
                  name: input.name,
                  value: option.value
                });
              }
            });
          } else if (input.checked || ['radio', 'checkbox', 'submit'].indexOf(input.type) === -1) {
            return params.push({
              name: input.name,
              value: input.value
            });
          }
        });
        if (additionalParam) {
          params.push(additionalParam);
        }
        return params.map(function(param) {
          if (param.name != null) {
            return (encodeURIComponent(param.name)) + "=" + (encodeURIComponent(param.value));
          } else {
            return param;
          }
        }).join('&');
      };

      Rails.formElements = function(form, selector) {
        if (matches(form, 'form')) {
          return toArray(form.elements).filter(function(el) {
            return matches(el, selector);
          });
        } else {
          return toArray(form.querySelectorAll(selector));
        }
      };

    }).call(this);
    (function() {
      var allowAction, fire, stopEverything;

      fire = Rails.fire, stopEverything = Rails.stopEverything;

      Rails.handleConfirm = function(e) {
        if (!allowAction(this)) {
          return stopEverything(e);
        }
      };

      allowAction = function(element) {
        var answer, callback, message;
        message = element.getAttribute('data-confirm');
        if (!message) {
          return true;
        }
        answer = false;
        if (fire(element, 'confirm')) {
          try {
            answer = confirm(message);
          } catch (error) {}
          callback = fire(element, 'confirm:complete', [answer]);
        }
        return answer && callback;
      };

    }).call(this);
    (function() {
      var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, matches, setData, stopEverything;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, stopEverything = Rails.stopEverything, formElements = Rails.formElements;

      Rails.handleDisabledElement = function(e) {
        var element;
        element = this;
        if (element.disabled) {
          return stopEverything(e);
        }
      };

      Rails.enableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return enableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formEnableSelector)) {
          return enableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return enableFormElements(element);
        }
      };

      Rails.disableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return disableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formDisableSelector)) {
          return disableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return disableFormElements(element);
        }
      };

      disableLinkElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          setData(element, 'ujs:enable-with', element.innerHTML);
          element.innerHTML = replacement;
        }
        element.addEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', true);
      };

      enableLinkElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          element.innerHTML = originalText;
          setData(element, 'ujs:enable-with', null);
        }
        element.removeEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', null);
      };

      disableFormElements = function(form) {
        return formElements(form, Rails.formDisableSelector).forEach(disableFormElement);
      };

      disableFormElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          if (matches(element, 'button')) {
            setData(element, 'ujs:enable-with', element.innerHTML);
            element.innerHTML = replacement;
          } else {
            setData(element, 'ujs:enable-with', element.value);
            element.value = replacement;
          }
        }
        element.disabled = true;
        return setData(element, 'ujs:disabled', true);
      };

      enableFormElements = function(form) {
        return formElements(form, Rails.formEnableSelector).forEach(enableFormElement);
      };

      enableFormElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          if (matches(element, 'button')) {
            element.innerHTML = originalText;
          } else {
            element.value = originalText;
          }
          setData(element, 'ujs:enable-with', null);
        }
        element.disabled = false;
        return setData(element, 'ujs:disabled', null);
      };

    }).call(this);
    (function() {
      var stopEverything;

      stopEverything = Rails.stopEverything;

      Rails.handleMethod = function(e) {
        var csrfParam, csrfToken, form, formContent, href, link, method;
        link = this;
        method = link.getAttribute('data-method');
        if (!method) {
          return;
        }
        href = Rails.href(link);
        csrfToken = Rails.csrfToken();
        csrfParam = Rails.csrfParam();
        form = document.createElement('form');
        formContent = "<input name='_method' value='" + method + "' type='hidden' />";
        if ((csrfParam != null) && (csrfToken != null) && !Rails.isCrossDomain(href)) {
          formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
        }
        formContent += '<input type="submit" />';
        form.method = 'post';
        form.action = href;
        form.target = link.target;
        form.innerHTML = formContent;
        form.style.display = 'none';
        document.body.appendChild(form);
        form.querySelector('[type="submit"]').click();
        return stopEverything(e);
      };

    }).call(this);
    (function() {
      var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything,
        slice = [].slice;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, fire = Rails.fire, stopEverything = Rails.stopEverything, ajax = Rails.ajax, isCrossDomain = Rails.isCrossDomain, serializeElement = Rails.serializeElement;

      isRemote = function(element) {
        var value;
        value = element.getAttribute('data-remote');
        return (value != null) && value !== 'false';
      };

      Rails.handleRemote = function(e) {
        var button, data, dataType, element, method, url, withCredentials;
        element = this;
        if (!isRemote(element)) {
          return true;
        }
        if (!fire(element, 'ajax:before')) {
          fire(element, 'ajax:stopped');
          return false;
        }
        withCredentials = element.getAttribute('data-with-credentials');
        dataType = element.getAttribute('data-type') || 'script';
        if (matches(element, Rails.formSubmitSelector)) {
          button = getData(element, 'ujs:submit-button');
          method = getData(element, 'ujs:submit-button-formmethod') || element.method;
          url = getData(element, 'ujs:submit-button-formaction') || element.getAttribute('action') || location.href;
          if (method.toUpperCase() === 'GET') {
            url = url.replace(/\?.*$/, '');
          }
          if (element.enctype === 'multipart/form-data') {
            data = new FormData(element);
            if (button != null) {
              data.append(button.name, button.value);
            }
          } else {
            data = serializeElement(element, button);
          }
          setData(element, 'ujs:submit-button', null);
          setData(element, 'ujs:submit-button-formmethod', null);
          setData(element, 'ujs:submit-button-formaction', null);
        } else if (matches(element, Rails.buttonClickSelector) || matches(element, Rails.inputChangeSelector)) {
          method = element.getAttribute('data-method');
          url = element.getAttribute('data-url');
          data = serializeElement(element, element.getAttribute('data-params'));
        } else {
          method = element.getAttribute('data-method');
          url = Rails.href(element);
          data = element.getAttribute('data-params');
        }
        ajax({
          type: method || 'GET',
          url: url,
          data: data,
          dataType: dataType,
          beforeSend: function(xhr, options) {
            if (fire(element, 'ajax:beforeSend', [xhr, options])) {
              return fire(element, 'ajax:send', [xhr]);
            } else {
              fire(element, 'ajax:stopped');
              return false;
            }
          },
          success: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:success', args);
          },
          error: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:error', args);
          },
          complete: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:complete', args);
          },
          crossDomain: isCrossDomain(url),
          withCredentials: (withCredentials != null) && withCredentials !== 'false'
        });
        return stopEverything(e);
      };

      Rails.formSubmitButtonClick = function(e) {
        var button, form;
        button = this;
        form = button.form;
        if (!form) {
          return;
        }
        if (button.name) {
          setData(form, 'ujs:submit-button', {
            name: button.name,
            value: button.value
          });
        }
        setData(form, 'ujs:formnovalidate-button', button.formNoValidate);
        setData(form, 'ujs:submit-button-formaction', button.getAttribute('formaction'));
        return setData(form, 'ujs:submit-button-formmethod', button.getAttribute('formmethod'));
      };

      Rails.handleMetaClick = function(e) {
        var data, link, metaClick, method;
        link = this;
        method = (link.getAttribute('data-method') || 'GET').toUpperCase();
        data = link.getAttribute('data-params');
        metaClick = e.metaKey || e.ctrlKey;
        if (metaClick && method === 'GET' && !data) {
          return e.stopImmediatePropagation();
        }
      };

    }).call(this);
    (function() {
      var $, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMetaClick, handleMethod, handleRemote, refreshCSRFTokens;

      fire = Rails.fire, delegate = Rails.delegate, getData = Rails.getData, $ = Rails.$, refreshCSRFTokens = Rails.refreshCSRFTokens, CSRFProtection = Rails.CSRFProtection, enableElement = Rails.enableElement, disableElement = Rails.disableElement, handleDisabledElement = Rails.handleDisabledElement, handleConfirm = Rails.handleConfirm, handleRemote = Rails.handleRemote, formSubmitButtonClick = Rails.formSubmitButtonClick, handleMetaClick = Rails.handleMetaClick, handleMethod = Rails.handleMethod;

      if ((typeof jQuery !== "undefined" && jQuery !== null) && (jQuery.ajax != null) && !jQuery.rails) {
        jQuery.rails = Rails;
        jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
          if (!options.crossDomain) {
            return CSRFProtection(xhr);
          }
        });
      }

      Rails.start = function() {
        if (window._rails_loaded) {
          throw new Error('rails-ujs has already been loaded!');
        }
        window.addEventListener('pageshow', function() {
          $(Rails.formEnableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
          return $(Rails.linkDisableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
        });
        delegate(document, Rails.linkDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.linkDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.linkClickSelector, 'click', handleConfirm);
        delegate(document, Rails.linkClickSelector, 'click', handleMetaClick);
        delegate(document, Rails.linkClickSelector, 'click', disableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleRemote);
        delegate(document, Rails.linkClickSelector, 'click', handleMethod);
        delegate(document, Rails.buttonClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleConfirm);
        delegate(document, Rails.buttonClickSelector, 'click', disableElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleRemote);
        delegate(document, Rails.inputChangeSelector, 'change', handleDisabledElement);
        delegate(document, Rails.inputChangeSelector, 'change', handleConfirm);
        delegate(document, Rails.inputChangeSelector, 'change', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', handleDisabledElement);
        delegate(document, Rails.formSubmitSelector, 'submit', handleConfirm);
        delegate(document, Rails.formSubmitSelector, 'submit', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', function(e) {
          return setTimeout((function() {
            return disableElement(e);
          }), 13);
        });
        delegate(document, Rails.formSubmitSelector, 'ajax:send', disableElement);
        delegate(document, Rails.formSubmitSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleConfirm);
        delegate(document, Rails.formInputClickSelector, 'click', formSubmitButtonClick);
        document.addEventListener('DOMContentLoaded', refreshCSRFTokens);
        return window._rails_loaded = true;
      };

      if (window.Rails === Rails && fire(document, 'rails:attachBindings')) {
        Rails.start();
      }

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = Rails;
  } else if (typeof define === "function" && define.amd) {
    define(Rails);
  }
}).call(this);
/*
Turbolinks 5.1.0
Copyright © 2018 Basecamp, LLC
 */

(function(){this.Turbolinks={supported:function(){return null!=window.history.pushState&&null!=window.requestAnimationFrame&&null!=window.addEventListener}(),visit:function(t,e){return Turbolinks.controller.visit(t,e)},clearCache:function(){return Turbolinks.controller.clearCache()},setProgressBarDelay:function(t){return Turbolinks.controller.setProgressBarDelay(t)}}}).call(this),function(){var t,e,r,n=[].slice;Turbolinks.copyObject=function(t){var e,r,n;r={};for(e in t)n=t[e],r[e]=n;return r},Turbolinks.closest=function(e,r){return t.call(e,r)},t=function(){var t,r;return t=document.documentElement,null!=(r=t.closest)?r:function(t){var r;for(r=this;r;){if(r.nodeType===Node.ELEMENT_NODE&&e.call(r,t))return r;r=r.parentNode}}}(),Turbolinks.defer=function(t){return setTimeout(t,1)},Turbolinks.throttle=function(t){var e;return e=null,function(){var r;return r=1<=arguments.length?n.call(arguments,0):[],null!=e?e:e=requestAnimationFrame(function(n){return function(){return e=null,t.apply(n,r)}}(this))}},Turbolinks.dispatch=function(t,e){var n,o,i,s,a,u;return a=null!=e?e:{},u=a.target,n=a.cancelable,o=a.data,i=document.createEvent("Events"),i.initEvent(t,!0,n===!0),i.data=null!=o?o:{},i.cancelable&&!r&&(s=i.preventDefault,i.preventDefault=function(){return this.defaultPrevented||Object.defineProperty(this,"defaultPrevented",{get:function(){return!0}}),s.call(this)}),(null!=u?u:document).dispatchEvent(i),i},r=function(){var t;return t=document.createEvent("Events"),t.initEvent("test",!0,!0),t.preventDefault(),t.defaultPrevented}(),Turbolinks.match=function(t,r){return e.call(t,r)},e=function(){var t,e,r,n;return t=document.documentElement,null!=(e=null!=(r=null!=(n=t.matchesSelector)?n:t.webkitMatchesSelector)?r:t.msMatchesSelector)?e:t.mozMatchesSelector}(),Turbolinks.uuid=function(){var t,e,r;for(r="",t=e=1;36>=e;t=++e)r+=9===t||14===t||19===t||24===t?"-":15===t?"4":20===t?(Math.floor(4*Math.random())+8).toString(16):Math.floor(15*Math.random()).toString(16);return r}}.call(this),function(){Turbolinks.Location=function(){function t(t){var e,r;null==t&&(t=""),r=document.createElement("a"),r.href=t.toString(),this.absoluteURL=r.href,e=r.hash.length,2>e?this.requestURL=this.absoluteURL:(this.requestURL=this.absoluteURL.slice(0,-e),this.anchor=r.hash.slice(1))}var e,r,n,o;return t.wrap=function(t){return t instanceof this?t:new this(t)},t.prototype.getOrigin=function(){return this.absoluteURL.split("/",3).join("/")},t.prototype.getPath=function(){var t,e;return null!=(t=null!=(e=this.requestURL.match(/\/\/[^\/]*(\/[^?;]*)/))?e[1]:void 0)?t:"/"},t.prototype.getPathComponents=function(){return this.getPath().split("/").slice(1)},t.prototype.getLastPathComponent=function(){return this.getPathComponents().slice(-1)[0]},t.prototype.getExtension=function(){var t,e;return null!=(t=null!=(e=this.getLastPathComponent().match(/\.[^.]*$/))?e[0]:void 0)?t:""},t.prototype.isHTML=function(){return this.getExtension().match(/^(?:|\.(?:htm|html|xhtml))$/)},t.prototype.isPrefixedBy=function(t){var e;return e=r(t),this.isEqualTo(t)||o(this.absoluteURL,e)},t.prototype.isEqualTo=function(t){return this.absoluteURL===(null!=t?t.absoluteURL:void 0)},t.prototype.toCacheKey=function(){return this.requestURL},t.prototype.toJSON=function(){return this.absoluteURL},t.prototype.toString=function(){return this.absoluteURL},t.prototype.valueOf=function(){return this.absoluteURL},r=function(t){return e(t.getOrigin()+t.getPath())},e=function(t){return n(t,"/")?t:t+"/"},o=function(t,e){return t.slice(0,e.length)===e},n=function(t,e){return t.slice(-e.length)===e},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.HttpRequest=function(){function e(e,r,n){this.delegate=e,this.requestCanceled=t(this.requestCanceled,this),this.requestTimedOut=t(this.requestTimedOut,this),this.requestFailed=t(this.requestFailed,this),this.requestLoaded=t(this.requestLoaded,this),this.requestProgressed=t(this.requestProgressed,this),this.url=Turbolinks.Location.wrap(r).requestURL,this.referrer=Turbolinks.Location.wrap(n).absoluteURL,this.createXHR()}return e.NETWORK_FAILURE=0,e.TIMEOUT_FAILURE=-1,e.timeout=60,e.prototype.send=function(){var t;return this.xhr&&!this.sent?(this.notifyApplicationBeforeRequestStart(),this.setProgress(0),this.xhr.send(),this.sent=!0,"function"==typeof(t=this.delegate).requestStarted?t.requestStarted():void 0):void 0},e.prototype.cancel=function(){return this.xhr&&this.sent?this.xhr.abort():void 0},e.prototype.requestProgressed=function(t){return t.lengthComputable?this.setProgress(t.loaded/t.total):void 0},e.prototype.requestLoaded=function(){return this.endRequest(function(t){return function(){var e;return 200<=(e=t.xhr.status)&&300>e?t.delegate.requestCompletedWithResponse(t.xhr.responseText,t.xhr.getResponseHeader("Turbolinks-Location")):(t.failed=!0,t.delegate.requestFailedWithStatusCode(t.xhr.status,t.xhr.responseText))}}(this))},e.prototype.requestFailed=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.NETWORK_FAILURE)}}(this))},e.prototype.requestTimedOut=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.TIMEOUT_FAILURE)}}(this))},e.prototype.requestCanceled=function(){return this.endRequest()},e.prototype.notifyApplicationBeforeRequestStart=function(){return Turbolinks.dispatch("turbolinks:request-start",{data:{url:this.url,xhr:this.xhr}})},e.prototype.notifyApplicationAfterRequestEnd=function(){return Turbolinks.dispatch("turbolinks:request-end",{data:{url:this.url,xhr:this.xhr}})},e.prototype.createXHR=function(){return this.xhr=new XMLHttpRequest,this.xhr.open("GET",this.url,!0),this.xhr.timeout=1e3*this.constructor.timeout,this.xhr.setRequestHeader("Accept","text/html, application/xhtml+xml"),this.xhr.setRequestHeader("Turbolinks-Referrer",this.referrer),this.xhr.onprogress=this.requestProgressed,this.xhr.onload=this.requestLoaded,this.xhr.onerror=this.requestFailed,this.xhr.ontimeout=this.requestTimedOut,this.xhr.onabort=this.requestCanceled},e.prototype.endRequest=function(t){return this.xhr?(this.notifyApplicationAfterRequestEnd(),null!=t&&t.call(this),this.destroy()):void 0},e.prototype.setProgress=function(t){var e;return this.progress=t,"function"==typeof(e=this.delegate).requestProgressed?e.requestProgressed(this.progress):void 0},e.prototype.destroy=function(){var t;return this.setProgress(1),"function"==typeof(t=this.delegate).requestFinished&&t.requestFinished(),this.delegate=null,this.xhr=null},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.ProgressBar=function(){function e(){this.trickle=t(this.trickle,this),this.stylesheetElement=this.createStylesheetElement(),this.progressElement=this.createProgressElement()}var r;return r=300,e.defaultCSS=".turbolinks-progress-bar {\n  position: fixed;\n  display: block;\n  top: 0;\n  left: 0;\n  height: 3px;\n  background: #0076ff;\n  z-index: 9999;\n  transition: width "+r+"ms ease-out, opacity "+r/2+"ms "+r/2+"ms ease-in;\n  transform: translate3d(0, 0, 0);\n}",e.prototype.show=function(){return this.visible?void 0:(this.visible=!0,this.installStylesheetElement(),this.installProgressElement(),this.startTrickling())},e.prototype.hide=function(){return this.visible&&!this.hiding?(this.hiding=!0,this.fadeProgressElement(function(t){return function(){return t.uninstallProgressElement(),t.stopTrickling(),t.visible=!1,t.hiding=!1}}(this))):void 0},e.prototype.setValue=function(t){return this.value=t,this.refresh()},e.prototype.installStylesheetElement=function(){return document.head.insertBefore(this.stylesheetElement,document.head.firstChild)},e.prototype.installProgressElement=function(){return this.progressElement.style.width=0,this.progressElement.style.opacity=1,document.documentElement.insertBefore(this.progressElement,document.body),this.refresh()},e.prototype.fadeProgressElement=function(t){return this.progressElement.style.opacity=0,setTimeout(t,1.5*r)},e.prototype.uninstallProgressElement=function(){return this.progressElement.parentNode?document.documentElement.removeChild(this.progressElement):void 0},e.prototype.startTrickling=function(){return null!=this.trickleInterval?this.trickleInterval:this.trickleInterval=setInterval(this.trickle,r)},e.prototype.stopTrickling=function(){return clearInterval(this.trickleInterval),this.trickleInterval=null},e.prototype.trickle=function(){return this.setValue(this.value+Math.random()/100)},e.prototype.refresh=function(){return requestAnimationFrame(function(t){return function(){return t.progressElement.style.width=10+90*t.value+"%"}}(this))},e.prototype.createStylesheetElement=function(){var t;return t=document.createElement("style"),t.type="text/css",t.textContent=this.constructor.defaultCSS,t},e.prototype.createProgressElement=function(){var t;return t=document.createElement("div"),t.className="turbolinks-progress-bar",t},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.BrowserAdapter=function(){function e(e){this.controller=e,this.showProgressBar=t(this.showProgressBar,this),this.progressBar=new Turbolinks.ProgressBar}var r,n,o;return o=Turbolinks.HttpRequest,r=o.NETWORK_FAILURE,n=o.TIMEOUT_FAILURE,e.prototype.visitProposedToLocationWithAction=function(t,e){return this.controller.startVisitToLocationWithAction(t,e)},e.prototype.visitStarted=function(t){return t.issueRequest(),t.changeHistory(),t.loadCachedSnapshot()},e.prototype.visitRequestStarted=function(t){return this.progressBar.setValue(0),t.hasCachedSnapshot()||"restore"!==t.action?this.showProgressBarAfterDelay():this.showProgressBar()},e.prototype.visitRequestProgressed=function(t){return this.progressBar.setValue(t.progress)},e.prototype.visitRequestCompleted=function(t){return t.loadResponse()},e.prototype.visitRequestFailedWithStatusCode=function(t,e){switch(e){case r:case n:return this.reload();default:return t.loadResponse()}},e.prototype.visitRequestFinished=function(t){return this.hideProgressBar()},e.prototype.visitCompleted=function(t){return t.followRedirect()},e.prototype.pageInvalidated=function(){return this.reload()},e.prototype.showProgressBarAfterDelay=function(){return this.progressBarTimeout=setTimeout(this.showProgressBar,this.controller.progressBarDelay)},e.prototype.showProgressBar=function(){return this.progressBar.show()},e.prototype.hideProgressBar=function(){return this.progressBar.hide(),clearTimeout(this.progressBarTimeout)},e.prototype.reload=function(){return window.location.reload()},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.History=function(){function e(e){this.delegate=e,this.onPageLoad=t(this.onPageLoad,this),this.onPopState=t(this.onPopState,this)}return e.prototype.start=function(){return this.started?void 0:(addEventListener("popstate",this.onPopState,!1),addEventListener("load",this.onPageLoad,!1),this.started=!0)},e.prototype.stop=function(){return this.started?(removeEventListener("popstate",this.onPopState,!1),removeEventListener("load",this.onPageLoad,!1),this.started=!1):void 0},e.prototype.push=function(t,e){return t=Turbolinks.Location.wrap(t),this.update("push",t,e)},e.prototype.replace=function(t,e){return t=Turbolinks.Location.wrap(t),this.update("replace",t,e)},e.prototype.onPopState=function(t){var e,r,n,o;return this.shouldHandlePopState()&&(o=null!=(r=t.state)?r.turbolinks:void 0)?(e=Turbolinks.Location.wrap(window.location),n=o.restorationIdentifier,this.delegate.historyPoppedToLocationWithRestorationIdentifier(e,n)):void 0},e.prototype.onPageLoad=function(t){return Turbolinks.defer(function(t){return function(){return t.pageLoaded=!0}}(this))},e.prototype.shouldHandlePopState=function(){return this.pageIsLoaded()},e.prototype.pageIsLoaded=function(){return this.pageLoaded||"complete"===document.readyState},e.prototype.update=function(t,e,r){var n;return n={turbolinks:{restorationIdentifier:r}},history[t+"State"](n,null,e)},e}()}.call(this),function(){Turbolinks.Snapshot=function(){function t(t){var e,r;r=t.head,e=t.body,this.head=null!=r?r:document.createElement("head"),this.body=null!=e?e:document.createElement("body")}return t.wrap=function(t){return t instanceof this?t:this.fromHTML(t)},t.fromHTML=function(t){var e;return e=document.createElement("html"),e.innerHTML=t,this.fromElement(e)},t.fromElement=function(t){return new this({head:t.querySelector("head"),body:t.querySelector("body")})},t.prototype.clone=function(){return new t({head:this.head.cloneNode(!0),body:this.body.cloneNode(!0)})},t.prototype.getRootLocation=function(){var t,e;return e=null!=(t=this.getSetting("root"))?t:"/",new Turbolinks.Location(e)},t.prototype.getCacheControlValue=function(){return this.getSetting("cache-control")},t.prototype.getElementForAnchor=function(t){try{return this.body.querySelector("[id='"+t+"'], a[name='"+t+"']")}catch(e){}},t.prototype.hasAnchor=function(t){return null!=this.getElementForAnchor(t)},t.prototype.isPreviewable=function(){return"no-preview"!==this.getCacheControlValue()},t.prototype.isCacheable=function(){return"no-cache"!==this.getCacheControlValue()},t.prototype.isVisitable=function(){return"reload"!==this.getSetting("visit-control")},t.prototype.getSetting=function(t){var e,r;return r=this.head.querySelectorAll("meta[name='turbolinks-"+t+"']"),e=r[r.length-1],null!=e?e.getAttribute("content"):void 0},t}()}.call(this),function(){var t=[].slice;Turbolinks.Renderer=function(){function e(){}var r;return e.render=function(){var e,r,n,o;return n=arguments[0],r=arguments[1],e=3<=arguments.length?t.call(arguments,2):[],o=function(t,e,r){r.prototype=t.prototype;var n=new r,o=t.apply(n,e);return Object(o)===o?o:n}(this,e,function(){}),o.delegate=n,o.render(r),o},e.prototype.renderView=function(t){return this.delegate.viewWillRender(this.newBody),t(),this.delegate.viewRendered(this.newBody)},e.prototype.invalidateView=function(){return this.delegate.viewInvalidated()},e.prototype.createScriptElement=function(t){var e;return"false"===t.getAttribute("data-turbolinks-eval")?t:(e=document.createElement("script"),e.textContent=t.textContent,e.async=!1,r(e,t),e)},r=function(t,e){var r,n,o,i,s,a,u;for(i=e.attributes,a=[],r=0,n=i.length;n>r;r++)s=i[r],o=s.name,u=s.value,a.push(t.setAttribute(o,u));return a},e}()}.call(this),function(){Turbolinks.HeadDetails=function(){function t(t){var e,r,i,s,a,u,l;for(this.element=t,this.elements={},l=this.element.childNodes,s=0,u=l.length;u>s;s++)i=l[s],i.nodeType===Node.ELEMENT_NODE&&(a=i.outerHTML,r=null!=(e=this.elements)[a]?e[a]:e[a]={type:o(i),tracked:n(i),elements:[]},r.elements.push(i))}var e,r,n,o;return t.prototype.hasElementWithKey=function(t){return t in this.elements},t.prototype.getTrackedElementSignature=function(){var t,e;return function(){var r,n;r=this.elements,n=[];for(t in r)e=r[t].tracked,e&&n.push(t);return n}.call(this).join("")},t.prototype.getScriptElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("script",t)},t.prototype.getStylesheetElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("stylesheet",t)},t.prototype.getElementsMatchingTypeNotInDetails=function(t,e){var r,n,o,i,s,a;o=this.elements,s=[];for(n in o)i=o[n],a=i.type,r=i.elements,a!==t||e.hasElementWithKey(n)||s.push(r[0]);return s},t.prototype.getProvisionalElements=function(){var t,e,r,n,o,i,s;r=[],n=this.elements;for(e in n)o=n[e],s=o.type,i=o.tracked,t=o.elements,null!=s||i?t.length>1&&r.push.apply(r,t.slice(1)):r.push.apply(r,t);return r},o=function(t){return e(t)?"script":r(t)?"stylesheet":void 0},n=function(t){return"reload"===t.getAttribute("data-turbolinks-track")},e=function(t){var e;return e=t.tagName.toLowerCase(),"script"===e},r=function(t){var e;return e=t.tagName.toLowerCase(),"style"===e||"link"===e&&"stylesheet"===t.getAttribute("rel")},t}()}.call(this),function(){var t=function(t,r){function n(){this.constructor=t}for(var o in r)e.call(r,o)&&(t[o]=r[o]);return n.prototype=r.prototype,t.prototype=new n,t.__super__=r.prototype,t},e={}.hasOwnProperty;Turbolinks.SnapshotRenderer=function(e){function r(t,e,r){this.currentSnapshot=t,this.newSnapshot=e,this.isPreview=r,this.currentHeadDetails=new Turbolinks.HeadDetails(this.currentSnapshot.head),this.newHeadDetails=new Turbolinks.HeadDetails(this.newSnapshot.head),this.newBody=this.newSnapshot.body}return t(r,e),r.prototype.render=function(t){return this.shouldRender()?(this.mergeHead(),this.renderView(function(e){return function(){return e.replaceBody(),e.isPreview||e.focusFirstAutofocusableElement(),t()}}(this))):this.invalidateView()},r.prototype.mergeHead=function(){return this.copyNewHeadStylesheetElements(),this.copyNewHeadScriptElements(),this.removeCurrentHeadProvisionalElements(),this.copyNewHeadProvisionalElements()},r.prototype.replaceBody=function(){return this.activateBodyScriptElements(),this.importBodyPermanentElements(),this.assignNewBody()},r.prototype.shouldRender=function(){return this.newSnapshot.isVisitable()&&this.trackedElementsAreIdentical()},r.prototype.trackedElementsAreIdentical=function(){return this.currentHeadDetails.getTrackedElementSignature()===this.newHeadDetails.getTrackedElementSignature()},r.prototype.copyNewHeadStylesheetElements=function(){var t,e,r,n,o;for(n=this.getNewHeadStylesheetElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},r.prototype.copyNewHeadScriptElements=function(){var t,e,r,n,o;for(n=this.getNewHeadScriptElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(this.createScriptElement(t)));return o},r.prototype.removeCurrentHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getCurrentHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.removeChild(t));return o},r.prototype.copyNewHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getNewHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},r.prototype.importBodyPermanentElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyPermanentElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],(t=this.findCurrentBodyPermanentElement(o))?i.push(o.parentNode.replaceChild(t,o)):i.push(void 0);return i},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.assignNewBody=function(){return document.body=this.newBody},r.prototype.focusFirstAutofocusableElement=function(){var t;return null!=(t=this.findFirstAutofocusableElement())?t.focus():void 0},r.prototype.getNewHeadStylesheetElements=function(){return this.newHeadDetails.getStylesheetElementsNotInDetails(this.currentHeadDetails)},r.prototype.getNewHeadScriptElements=function(){return this.newHeadDetails.getScriptElementsNotInDetails(this.currentHeadDetails)},r.prototype.getCurrentHeadProvisionalElements=function(){return this.currentHeadDetails.getProvisionalElements()},r.prototype.getNewHeadProvisionalElements=function(){return this.newHeadDetails.getProvisionalElements()},r.prototype.getNewBodyPermanentElements=function(){return this.newBody.querySelectorAll("[id][data-turbolinks-permanent]")},r.prototype.findCurrentBodyPermanentElement=function(t){return document.body.querySelector("#"+t.id+"[data-turbolinks-permanent]")},r.prototype.getNewBodyScriptElements=function(){return this.newBody.querySelectorAll("script")},r.prototype.findFirstAutofocusableElement=function(){return document.body.querySelector("[autofocus]")},r}(Turbolinks.Renderer)}.call(this),function(){var t=function(t,r){function n(){this.constructor=t}for(var o in r)e.call(r,o)&&(t[o]=r[o]);return n.prototype=r.prototype,t.prototype=new n,t.__super__=r.prototype,t},e={}.hasOwnProperty;Turbolinks.ErrorRenderer=function(e){function r(t){this.html=t}return t(r,e),r.prototype.render=function(t){return this.renderView(function(e){return function(){return e.replaceDocumentHTML(),e.activateBodyScriptElements(),t()}}(this))},r.prototype.replaceDocumentHTML=function(){return document.documentElement.innerHTML=this.html},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.getScriptElements=function(){return document.documentElement.querySelectorAll("script")},r}(Turbolinks.Renderer)}.call(this),function(){Turbolinks.View=function(){function t(t){this.delegate=t,this.element=document.documentElement}return t.prototype.getRootLocation=function(){return this.getSnapshot().getRootLocation()},t.prototype.getElementForAnchor=function(t){return this.getSnapshot().getElementForAnchor(t)},t.prototype.getSnapshot=function(){return Turbolinks.Snapshot.fromElement(this.element)},t.prototype.render=function(t,e){var r,n,o;return o=t.snapshot,r=t.error,n=t.isPreview,this.markAsPreview(n),null!=o?this.renderSnapshot(o,n,e):this.renderError(r,e)},t.prototype.markAsPreview=function(t){return t?this.element.setAttribute("data-turbolinks-preview",""):this.element.removeAttribute("data-turbolinks-preview")},t.prototype.renderSnapshot=function(t,e,r){return Turbolinks.SnapshotRenderer.render(this.delegate,r,this.getSnapshot(),Turbolinks.Snapshot.wrap(t),e)},t.prototype.renderError=function(t,e){return Turbolinks.ErrorRenderer.render(this.delegate,e,t)},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.ScrollManager=function(){function e(e){this.delegate=e,this.onScroll=t(this.onScroll,this),this.onScroll=Turbolinks.throttle(this.onScroll)}return e.prototype.start=function(){return this.started?void 0:(addEventListener("scroll",this.onScroll,!1),this.onScroll(),this.started=!0)},e.prototype.stop=function(){return this.started?(removeEventListener("scroll",this.onScroll,!1),this.started=!1):void 0},e.prototype.scrollToElement=function(t){return t.scrollIntoView()},e.prototype.scrollToPosition=function(t){var e,r;return e=t.x,r=t.y,window.scrollTo(e,r)},e.prototype.onScroll=function(t){return this.updatePosition({x:window.pageXOffset,y:window.pageYOffset})},e.prototype.updatePosition=function(t){var e;return this.position=t,null!=(e=this.delegate)?e.scrollPositionChanged(this.position):void 0},e}()}.call(this),function(){Turbolinks.SnapshotCache=function(){function t(t){this.size=t,this.keys=[],this.snapshots={}}var e;return t.prototype.has=function(t){var r;return r=e(t),r in this.snapshots},t.prototype.get=function(t){var e;if(this.has(t))return e=this.read(t),this.touch(t),e},t.prototype.put=function(t,e){return this.write(t,e),this.touch(t),e},t.prototype.read=function(t){var r;return r=e(t),this.snapshots[r]},t.prototype.write=function(t,r){var n;return n=e(t),this.snapshots[n]=r},t.prototype.touch=function(t){var r,n;return n=e(t),r=this.keys.indexOf(n),r>-1&&this.keys.splice(r,1),this.keys.unshift(n),this.trim()},t.prototype.trim=function(){var t,e,r,n,o;for(n=this.keys.splice(this.size),o=[],t=0,r=n.length;r>t;t++)e=n[t],o.push(delete this.snapshots[e]);return o},e=function(t){return Turbolinks.Location.wrap(t).toCacheKey()},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.Visit=function(){function e(e,r,n){this.controller=e,this.action=n,this.performScroll=t(this.performScroll,this),this.identifier=Turbolinks.uuid(),this.location=Turbolinks.Location.wrap(r),this.adapter=this.controller.adapter,this.state="initialized",this.timingMetrics={}}var r;return e.prototype.start=function(){return"initialized"===this.state?(this.recordTimingMetric("visitStart"),this.state="started",this.adapter.visitStarted(this)):void 0},e.prototype.cancel=function(){var t;return"started"===this.state?(null!=(t=this.request)&&t.cancel(),this.cancelRender(),this.state="canceled"):void 0},e.prototype.complete=function(){var t;return"started"===this.state?(this.recordTimingMetric("visitEnd"),this.state="completed","function"==typeof(t=this.adapter).visitCompleted&&t.visitCompleted(this),this.controller.visitCompleted(this)):void 0},e.prototype.fail=function(){var t;return"started"===this.state?(this.state="failed","function"==typeof(t=this.adapter).visitFailed?t.visitFailed(this):void 0):void 0},e.prototype.changeHistory=function(){var t,e;return this.historyChanged?void 0:(t=this.location.isEqualTo(this.referrer)?"replace":this.action,e=r(t),this.controller[e](this.location,this.restorationIdentifier),this.historyChanged=!0)},e.prototype.issueRequest=function(){return this.shouldIssueRequest()&&null==this.request?(this.progress=0,this.request=new Turbolinks.HttpRequest(this,this.location,this.referrer),this.request.send()):void 0},e.prototype.getCachedSnapshot=function(){var t;return!(t=this.controller.getCachedSnapshotForLocation(this.location))||null!=this.location.anchor&&!t.hasAnchor(this.location.anchor)||"restore"!==this.action&&!t.isPreviewable()?void 0:t},e.prototype.hasCachedSnapshot=function(){return null!=this.getCachedSnapshot()},e.prototype.loadCachedSnapshot=function(){var t,e;return(e=this.getCachedSnapshot())?(t=this.shouldIssueRequest(),this.render(function(){var r;return this.cacheSnapshot(),this.controller.render({snapshot:e,isPreview:t},this.performScroll),"function"==typeof(r=this.adapter).visitRendered&&r.visitRendered(this),t?void 0:this.complete()})):void 0},e.prototype.loadResponse=function(){return null!=this.response?this.render(function(){var t,e;return this.cacheSnapshot(),this.request.failed?(this.controller.render({error:this.response},this.performScroll),"function"==typeof(t=this.adapter).visitRendered&&t.visitRendered(this),this.fail()):(this.controller.render({snapshot:this.response},this.performScroll),"function"==typeof(e=this.adapter).visitRendered&&e.visitRendered(this),this.complete())}):void 0},e.prototype.followRedirect=function(){return this.redirectedToLocation&&!this.followedRedirect?(this.location=this.redirectedToLocation,this.controller.replaceHistoryWithLocationAndRestorationIdentifier(this.redirectedToLocation,this.restorationIdentifier),this.followedRedirect=!0):void 0},e.prototype.requestStarted=function(){var t;return this.recordTimingMetric("requestStart"),"function"==typeof(t=this.adapter).visitRequestStarted?t.visitRequestStarted(this):void 0},e.prototype.requestProgressed=function(t){var e;return this.progress=t,"function"==typeof(e=this.adapter).visitRequestProgressed?e.visitRequestProgressed(this):void 0},e.prototype.requestCompletedWithResponse=function(t,e){return this.response=t,null!=e&&(this.redirectedToLocation=Turbolinks.Location.wrap(e)),this.adapter.visitRequestCompleted(this)},e.prototype.requestFailedWithStatusCode=function(t,e){return this.response=e,this.adapter.visitRequestFailedWithStatusCode(this,t)},e.prototype.requestFinished=function(){var t;return this.recordTimingMetric("requestEnd"),"function"==typeof(t=this.adapter).visitRequestFinished?t.visitRequestFinished(this):void 0},e.prototype.performScroll=function(){return this.scrolled?void 0:("restore"===this.action?this.scrollToRestoredPosition()||this.scrollToTop():this.scrollToAnchor()||this.scrollToTop(),this.scrolled=!0)},e.prototype.scrollToRestoredPosition=function(){var t,e;return t=null!=(e=this.restorationData)?e.scrollPosition:void 0,null!=t?(this.controller.scrollToPosition(t),!0):void 0},e.prototype.scrollToAnchor=function(){return null!=this.location.anchor?(this.controller.scrollToAnchor(this.location.anchor),!0):void 0},e.prototype.scrollToTop=function(){return this.controller.scrollToPosition({x:0,y:0})},e.prototype.recordTimingMetric=function(t){var e;return null!=(e=this.timingMetrics)[t]?e[t]:e[t]=(new Date).getTime()},e.prototype.getTimingMetrics=function(){return Turbolinks.copyObject(this.timingMetrics)},r=function(t){switch(t){case"replace":return"replaceHistoryWithLocationAndRestorationIdentifier";case"advance":case"restore":return"pushHistoryWithLocationAndRestorationIdentifier"}},e.prototype.shouldIssueRequest=function(){return"restore"===this.action?!this.hasCachedSnapshot():!0},e.prototype.cacheSnapshot=function(){return this.snapshotCached?void 0:(this.controller.cacheSnapshot(),this.snapshotCached=!0)},e.prototype.render=function(t){return this.cancelRender(),this.frame=requestAnimationFrame(function(e){return function(){return e.frame=null,t.call(e)}}(this))},e.prototype.cancelRender=function(){return this.frame?cancelAnimationFrame(this.frame):void 0},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.Controller=function(){function e(){this.clickBubbled=t(this.clickBubbled,this),this.clickCaptured=t(this.clickCaptured,this),this.pageLoaded=t(this.pageLoaded,this),this.history=new Turbolinks.History(this),this.view=new Turbolinks.View(this),this.scrollManager=new Turbolinks.ScrollManager(this),this.restorationData={},this.clearCache(),this.setProgressBarDelay(500)}return e.prototype.start=function(){return Turbolinks.supported&&!this.started?(addEventListener("click",this.clickCaptured,!0),addEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.start(),this.startHistory(),this.started=!0,this.enabled=!0):void 0},e.prototype.disable=function(){return this.enabled=!1},e.prototype.stop=function(){return this.started?(removeEventListener("click",this.clickCaptured,!0),removeEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.stop(),this.stopHistory(),this.started=!1):void 0},e.prototype.clearCache=function(){return this.cache=new Turbolinks.SnapshotCache(10)},e.prototype.visit=function(t,e){var r,n;return null==e&&(e={}),t=Turbolinks.Location.wrap(t),this.applicationAllowsVisitingLocation(t)?this.locationIsVisitable(t)?(r=null!=(n=e.action)?n:"advance",this.adapter.visitProposedToLocationWithAction(t,r)):window.location=t:void 0},e.prototype.startVisitToLocationWithAction=function(t,e,r){var n;return Turbolinks.supported?(n=this.getRestorationDataForIdentifier(r),this.startVisit(t,e,{restorationData:n})):window.location=t},e.prototype.setProgressBarDelay=function(t){return this.progressBarDelay=t},e.prototype.startHistory=function(){return this.location=Turbolinks.Location.wrap(window.location),this.restorationIdentifier=Turbolinks.uuid(),this.history.start(),this.history.replace(this.location,this.restorationIdentifier)},e.prototype.stopHistory=function(){return this.history.stop()},e.prototype.pushHistoryWithLocationAndRestorationIdentifier=function(t,e){return this.restorationIdentifier=e,this.location=Turbolinks.Location.wrap(t),this.history.push(this.location,this.restorationIdentifier)},e.prototype.replaceHistoryWithLocationAndRestorationIdentifier=function(t,e){return this.restorationIdentifier=e,this.location=Turbolinks.Location.wrap(t),this.history.replace(this.location,this.restorationIdentifier)},e.prototype.historyPoppedToLocationWithRestorationIdentifier=function(t,e){var r;return this.restorationIdentifier=e,this.enabled?(r=this.getRestorationDataForIdentifier(this.restorationIdentifier),this.startVisit(t,"restore",{restorationIdentifier:this.restorationIdentifier,restorationData:r,historyChanged:!0}),this.location=Turbolinks.Location.wrap(t)):this.adapter.pageInvalidated()},e.prototype.getCachedSnapshotForLocation=function(t){var e;return e=this.cache.get(t),e?e.clone():void 0},e.prototype.shouldCacheSnapshot=function(){return this.view.getSnapshot().isCacheable()},e.prototype.cacheSnapshot=function(){var t;return this.shouldCacheSnapshot()?(this.notifyApplicationBeforeCachingSnapshot(),t=this.view.getSnapshot(),this.cache.put(this.lastRenderedLocation,t.clone())):void 0},e.prototype.scrollToAnchor=function(t){var e;return(e=this.view.getElementForAnchor(t))?this.scrollToElement(e):this.scrollToPosition({x:0,y:0})},e.prototype.scrollToElement=function(t){return this.scrollManager.scrollToElement(t)},e.prototype.scrollToPosition=function(t){return this.scrollManager.scrollToPosition(t)},e.prototype.scrollPositionChanged=function(t){var e;return e=this.getCurrentRestorationData(),e.scrollPosition=t},e.prototype.render=function(t,e){return this.view.render(t,e)},e.prototype.viewInvalidated=function(){return this.adapter.pageInvalidated()},e.prototype.viewWillRender=function(t){return this.notifyApplicationBeforeRender(t)},e.prototype.viewRendered=function(){return this.lastRenderedLocation=this.currentVisit.location,this.notifyApplicationAfterRender()},e.prototype.pageLoaded=function(){
return this.lastRenderedLocation=this.location,this.notifyApplicationAfterPageLoad()},e.prototype.clickCaptured=function(){return removeEventListener("click",this.clickBubbled,!1),addEventListener("click",this.clickBubbled,!1)},e.prototype.clickBubbled=function(t){var e,r,n;return this.enabled&&this.clickEventIsSignificant(t)&&(r=this.getVisitableLinkForNode(t.target))&&(n=this.getVisitableLocationForLink(r))&&this.applicationAllowsFollowingLinkToLocation(r,n)?(t.preventDefault(),e=this.getActionForLink(r),this.visit(n,{action:e})):void 0},e.prototype.applicationAllowsFollowingLinkToLocation=function(t,e){var r;return r=this.notifyApplicationAfterClickingLinkToLocation(t,e),!r.defaultPrevented},e.prototype.applicationAllowsVisitingLocation=function(t){var e;return e=this.notifyApplicationBeforeVisitingLocation(t),!e.defaultPrevented},e.prototype.notifyApplicationAfterClickingLinkToLocation=function(t,e){return Turbolinks.dispatch("turbolinks:click",{target:t,data:{url:e.absoluteURL},cancelable:!0})},e.prototype.notifyApplicationBeforeVisitingLocation=function(t){return Turbolinks.dispatch("turbolinks:before-visit",{data:{url:t.absoluteURL},cancelable:!0})},e.prototype.notifyApplicationAfterVisitingLocation=function(t){return Turbolinks.dispatch("turbolinks:visit",{data:{url:t.absoluteURL}})},e.prototype.notifyApplicationBeforeCachingSnapshot=function(){return Turbolinks.dispatch("turbolinks:before-cache")},e.prototype.notifyApplicationBeforeRender=function(t){return Turbolinks.dispatch("turbolinks:before-render",{data:{newBody:t}})},e.prototype.notifyApplicationAfterRender=function(){return Turbolinks.dispatch("turbolinks:render")},e.prototype.notifyApplicationAfterPageLoad=function(t){return null==t&&(t={}),Turbolinks.dispatch("turbolinks:load",{data:{url:this.location.absoluteURL,timing:t}})},e.prototype.startVisit=function(t,e,r){var n;return null!=(n=this.currentVisit)&&n.cancel(),this.currentVisit=this.createVisit(t,e,r),this.currentVisit.start(),this.notifyApplicationAfterVisitingLocation(t)},e.prototype.createVisit=function(t,e,r){var n,o,i,s,a;return o=null!=r?r:{},s=o.restorationIdentifier,i=o.restorationData,n=o.historyChanged,a=new Turbolinks.Visit(this,t,e),a.restorationIdentifier=null!=s?s:Turbolinks.uuid(),a.restorationData=Turbolinks.copyObject(i),a.historyChanged=n,a.referrer=this.location,a},e.prototype.visitCompleted=function(t){return this.notifyApplicationAfterPageLoad(t.getTimingMetrics())},e.prototype.clickEventIsSignificant=function(t){return!(t.defaultPrevented||t.target.isContentEditable||t.which>1||t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)},e.prototype.getVisitableLinkForNode=function(t){return this.nodeIsVisitable(t)?Turbolinks.closest(t,"a[href]:not([target]):not([download])"):void 0},e.prototype.getVisitableLocationForLink=function(t){var e;return e=new Turbolinks.Location(t.getAttribute("href")),this.locationIsVisitable(e)?e:void 0},e.prototype.getActionForLink=function(t){var e;return null!=(e=t.getAttribute("data-turbolinks-action"))?e:"advance"},e.prototype.nodeIsVisitable=function(t){var e;return(e=Turbolinks.closest(t,"[data-turbolinks]"))?"false"!==e.getAttribute("data-turbolinks"):!0},e.prototype.locationIsVisitable=function(t){return t.isPrefixedBy(this.view.getRootLocation())&&t.isHTML()},e.prototype.getCurrentRestorationData=function(){return this.getRestorationDataForIdentifier(this.restorationIdentifier)},e.prototype.getRestorationDataForIdentifier=function(t){var e;return null!=(e=this.restorationData)[t]?e[t]:e[t]={}},e}()}.call(this),function(){!function(){var t,e;if((t=e=document.currentScript)&&!e.hasAttribute("data-turbolinks-suppress-warning"))for(;t=t.parentNode;)if(t===document.body)return console.warn("You are loading Turbolinks from a <script> element inside the <body> element. This is probably not what you meant to do!\n\nLoad your application\u2019s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.\n\nFor more information, see: https://github.com/turbolinks/turbolinks#working-with-script-elements\n\n\u2014\u2014\nSuppress this warning by adding a `data-turbolinks-suppress-warning` attribute to: %s",e.outerHTML)}()}.call(this),function(){var t,e,r;Turbolinks.start=function(){return e()?(null==Turbolinks.controller&&(Turbolinks.controller=t()),Turbolinks.controller.start()):void 0},e=function(){return null==window.Turbolinks&&(window.Turbolinks=Turbolinks),r()},t=function(){var t;return t=new Turbolinks.Controller,t.adapter=new Turbolinks.BrowserAdapter(t),t},r=function(){return window.Turbolinks===Turbolinks},r()&&Turbolinks.start()}.call(this);
(function() {
  var context = this;

  (function() {
    (function() {
      var slice = [].slice;

      this.ActionCable = {
        INTERNAL: {
          "message_types": {
            "welcome": "welcome",
            "ping": "ping",
            "confirmation": "confirm_subscription",
            "rejection": "reject_subscription"
          },
          "default_mount_path": "/cable",
          "protocols": ["actioncable-v1-json", "actioncable-unsupported"]
        },
        WebSocket: window.WebSocket,
        logger: window.console,
        createConsumer: function(url) {
          var ref;
          if (url == null) {
            url = (ref = this.getConfig("url")) != null ? ref : this.INTERNAL.default_mount_path;
          }
          return new ActionCable.Consumer(this.createWebSocketURL(url));
        },
        getConfig: function(name) {
          var element;
          element = document.head.querySelector("meta[name='action-cable-" + name + "']");
          return element != null ? element.getAttribute("content") : void 0;
        },
        createWebSocketURL: function(url) {
          var a;
          if (url && !/^wss?:/i.test(url)) {
            a = document.createElement("a");
            a.href = url;
            a.href = a.href;
            a.protocol = a.protocol.replace("http", "ws");
            return a.href;
          } else {
            return url;
          }
        },
        startDebugging: function() {
          return this.debugging = true;
        },
        stopDebugging: function() {
          return this.debugging = null;
        },
        log: function() {
          var messages, ref;
          messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          if (this.debugging) {
            messages.push(Date.now());
            return (ref = this.logger).log.apply(ref, ["[ActionCable]"].concat(slice.call(messages)));
          }
        }
      };

    }).call(this);
  }).call(context);

  var ActionCable = context.ActionCable;

  (function() {
    (function() {
      var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

      ActionCable.ConnectionMonitor = (function() {
        var clamp, now, secondsSince;

        ConnectionMonitor.pollInterval = {
          min: 3,
          max: 30
        };

        ConnectionMonitor.staleThreshold = 6;

        function ConnectionMonitor(connection) {
          this.connection = connection;
          this.visibilityDidChange = bind(this.visibilityDidChange, this);
          this.reconnectAttempts = 0;
        }

        ConnectionMonitor.prototype.start = function() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            document.addEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor started. pollInterval = " + (this.getPollInterval()) + " ms");
          }
        };

        ConnectionMonitor.prototype.stop = function() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            document.removeEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor stopped");
          }
        };

        ConnectionMonitor.prototype.isRunning = function() {
          return (this.startedAt != null) && (this.stoppedAt == null);
        };

        ConnectionMonitor.prototype.recordPing = function() {
          return this.pingedAt = now();
        };

        ConnectionMonitor.prototype.recordConnect = function() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          return ActionCable.log("ConnectionMonitor recorded connect");
        };

        ConnectionMonitor.prototype.recordDisconnect = function() {
          this.disconnectedAt = now();
          return ActionCable.log("ConnectionMonitor recorded disconnect");
        };

        ConnectionMonitor.prototype.startPolling = function() {
          this.stopPolling();
          return this.poll();
        };

        ConnectionMonitor.prototype.stopPolling = function() {
          return clearTimeout(this.pollTimeout);
        };

        ConnectionMonitor.prototype.poll = function() {
          return this.pollTimeout = setTimeout((function(_this) {
            return function() {
              _this.reconnectIfStale();
              return _this.poll();
            };
          })(this), this.getPollInterval());
        };

        ConnectionMonitor.prototype.getPollInterval = function() {
          var interval, max, min, ref;
          ref = this.constructor.pollInterval, min = ref.min, max = ref.max;
          interval = 5 * Math.log(this.reconnectAttempts + 1);
          return Math.round(clamp(interval, min, max) * 1000);
        };

        ConnectionMonitor.prototype.reconnectIfStale = function() {
          if (this.connectionIsStale()) {
            ActionCable.log("ConnectionMonitor detected stale connection. reconnectAttempts = " + this.reconnectAttempts + ", pollInterval = " + (this.getPollInterval()) + " ms, time disconnected = " + (secondsSince(this.disconnectedAt)) + " s, stale threshold = " + this.constructor.staleThreshold + " s");
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              return ActionCable.log("ConnectionMonitor skipping reopening recent disconnect");
            } else {
              ActionCable.log("ConnectionMonitor reopening");
              return this.connection.reopen();
            }
          }
        };

        ConnectionMonitor.prototype.connectionIsStale = function() {
          var ref;
          return secondsSince((ref = this.pingedAt) != null ? ref : this.startedAt) > this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.disconnectedRecently = function() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.visibilityDidChange = function() {
          if (document.visibilityState === "visible") {
            return setTimeout((function(_this) {
              return function() {
                if (_this.connectionIsStale() || !_this.connection.isOpen()) {
                  ActionCable.log("ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = " + document.visibilityState);
                  return _this.connection.reopen();
                }
              };
            })(this), 200);
          }
        };

        now = function() {
          return new Date().getTime();
        };

        secondsSince = function(time) {
          return (now() - time) / 1000;
        };

        clamp = function(number, min, max) {
          return Math.max(min, Math.min(max, number));
        };

        return ConnectionMonitor;

      })();

    }).call(this);
    (function() {
      var i, message_types, protocols, ref, supportedProtocols, unsupportedProtocol,
        slice = [].slice,
        bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
        indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

      ref = ActionCable.INTERNAL, message_types = ref.message_types, protocols = ref.protocols;

      supportedProtocols = 2 <= protocols.length ? slice.call(protocols, 0, i = protocols.length - 1) : (i = 0, []), unsupportedProtocol = protocols[i++];

      ActionCable.Connection = (function() {
        Connection.reopenDelay = 500;

        function Connection(consumer) {
          this.consumer = consumer;
          this.open = bind(this.open, this);
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new ActionCable.ConnectionMonitor(this);
          this.disconnected = true;
        }

        Connection.prototype.send = function(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        };

        Connection.prototype.open = function() {
          if (this.isActive()) {
            ActionCable.log("Attempted to open WebSocket, but existing socket is " + (this.getState()));
            return false;
          } else {
            ActionCable.log("Opening WebSocket, current state is " + (this.getState()) + ", subprotocols: " + protocols);
            if (this.webSocket != null) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new ActionCable.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        };

        Connection.prototype.close = function(arg) {
          var allowReconnect, ref1;
          allowReconnect = (arg != null ? arg : {
            allowReconnect: true
          }).allowReconnect;
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isActive()) {
            return (ref1 = this.webSocket) != null ? ref1.close() : void 0;
          }
        };

        Connection.prototype.reopen = function() {
          var error;
          ActionCable.log("Reopening WebSocket, current state is " + (this.getState()));
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error1) {
              error = error1;
              return ActionCable.log("Failed to reopen WebSocket", error);
            } finally {
              ActionCable.log("Reopening WebSocket in " + this.constructor.reopenDelay + "ms");
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        };

        Connection.prototype.getProtocol = function() {
          var ref1;
          return (ref1 = this.webSocket) != null ? ref1.protocol : void 0;
        };

        Connection.prototype.isOpen = function() {
          return this.isState("open");
        };

        Connection.prototype.isActive = function() {
          return this.isState("open", "connecting");
        };

        Connection.prototype.isProtocolSupported = function() {
          var ref1;
          return ref1 = this.getProtocol(), indexOf.call(supportedProtocols, ref1) >= 0;
        };

        Connection.prototype.isState = function() {
          var ref1, states;
          states = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return ref1 = this.getState(), indexOf.call(states, ref1) >= 0;
        };

        Connection.prototype.getState = function() {
          var ref1, state, value;
          for (state in WebSocket) {
            value = WebSocket[state];
            if (value === ((ref1 = this.webSocket) != null ? ref1.readyState : void 0)) {
              return state.toLowerCase();
            }
          }
          return null;
        };

        Connection.prototype.installEventHandlers = function() {
          var eventName, handler;
          for (eventName in this.events) {
            handler = this.events[eventName].bind(this);
            this.webSocket["on" + eventName] = handler;
          }
        };

        Connection.prototype.uninstallEventHandlers = function() {
          var eventName;
          for (eventName in this.events) {
            this.webSocket["on" + eventName] = function() {};
          }
        };

        Connection.prototype.events = {
          message: function(event) {
            var identifier, message, ref1, type;
            if (!this.isProtocolSupported()) {
              return;
            }
            ref1 = JSON.parse(event.data), identifier = ref1.identifier, message = ref1.message, type = ref1.type;
            switch (type) {
              case message_types.welcome:
                this.monitor.recordConnect();
                return this.subscriptions.reload();
              case message_types.ping:
                return this.monitor.recordPing();
              case message_types.confirmation:
                return this.subscriptions.notify(identifier, "connected");
              case message_types.rejection:
                return this.subscriptions.reject(identifier);
              default:
                return this.subscriptions.notify(identifier, "received", message);
            }
          },
          open: function() {
            ActionCable.log("WebSocket onopen event, using '" + (this.getProtocol()) + "' subprotocol");
            this.disconnected = false;
            if (!this.isProtocolSupported()) {
              ActionCable.log("Protocol is unsupported. Stopping monitor and disconnecting.");
              return this.close({
                allowReconnect: false
              });
            }
          },
          close: function(event) {
            ActionCable.log("WebSocket onclose event");
            if (this.disconnected) {
              return;
            }
            this.disconnected = true;
            this.monitor.recordDisconnect();
            return this.subscriptions.notifyAll("disconnected", {
              willAttemptReconnect: this.monitor.isRunning()
            });
          },
          error: function() {
            return ActionCable.log("WebSocket onerror event");
          }
        };

        return Connection;

      })();

    }).call(this);
    (function() {
      var slice = [].slice;

      ActionCable.Subscriptions = (function() {
        function Subscriptions(consumer) {
          this.consumer = consumer;
          this.subscriptions = [];
        }

        Subscriptions.prototype.create = function(channelName, mixin) {
          var channel, params, subscription;
          channel = channelName;
          params = typeof channel === "object" ? channel : {
            channel: channel
          };
          subscription = new ActionCable.Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        };

        Subscriptions.prototype.add = function(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.sendCommand(subscription, "subscribe");
          return subscription;
        };

        Subscriptions.prototype.remove = function(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        };

        Subscriptions.prototype.reject = function(identifier) {
          var i, len, ref, results, subscription;
          ref = this.findAll(identifier);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            this.forget(subscription);
            this.notify(subscription, "rejected");
            results.push(subscription);
          }
          return results;
        };

        Subscriptions.prototype.forget = function(subscription) {
          var s;
          this.subscriptions = (function() {
            var i, len, ref, results;
            ref = this.subscriptions;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              s = ref[i];
              if (s !== subscription) {
                results.push(s);
              }
            }
            return results;
          }).call(this);
          return subscription;
        };

        Subscriptions.prototype.findAll = function(identifier) {
          var i, len, ref, results, s;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            s = ref[i];
            if (s.identifier === identifier) {
              results.push(s);
            }
          }
          return results;
        };

        Subscriptions.prototype.reload = function() {
          var i, len, ref, results, subscription;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.sendCommand(subscription, "subscribe"));
          }
          return results;
        };

        Subscriptions.prototype.notifyAll = function() {
          var args, callbackName, i, len, ref, results, subscription;
          callbackName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.notify.apply(this, [subscription, callbackName].concat(slice.call(args))));
          }
          return results;
        };

        Subscriptions.prototype.notify = function() {
          var args, callbackName, i, len, results, subscription, subscriptions;
          subscription = arguments[0], callbackName = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          results = [];
          for (i = 0, len = subscriptions.length; i < len; i++) {
            subscription = subscriptions[i];
            results.push(typeof subscription[callbackName] === "function" ? subscription[callbackName].apply(subscription, args) : void 0);
          }
          return results;
        };

        Subscriptions.prototype.sendCommand = function(subscription, command) {
          var identifier;
          identifier = subscription.identifier;
          return this.consumer.send({
            command: command,
            identifier: identifier
          });
        };

        return Subscriptions;

      })();

    }).call(this);
    (function() {
      ActionCable.Subscription = (function() {
        var extend;

        function Subscription(consumer, params, mixin) {
          this.consumer = consumer;
          if (params == null) {
            params = {};
          }
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }

        Subscription.prototype.perform = function(action, data) {
          if (data == null) {
            data = {};
          }
          data.action = action;
          return this.send(data);
        };

        Subscription.prototype.send = function(data) {
          return this.consumer.send({
            command: "message",
            identifier: this.identifier,
            data: JSON.stringify(data)
          });
        };

        Subscription.prototype.unsubscribe = function() {
          return this.consumer.subscriptions.remove(this);
        };

        extend = function(object, properties) {
          var key, value;
          if (properties != null) {
            for (key in properties) {
              value = properties[key];
              object[key] = value;
            }
          }
          return object;
        };

        return Subscription;

      })();

    }).call(this);
    (function() {
      ActionCable.Consumer = (function() {
        function Consumer(url) {
          this.url = url;
          this.subscriptions = new ActionCable.Subscriptions(this);
          this.connection = new ActionCable.Connection(this);
        }

        Consumer.prototype.send = function(data) {
          return this.connection.send(data);
        };

        Consumer.prototype.connect = function() {
          return this.connection.open();
        };

        Consumer.prototype.disconnect = function() {
          return this.connection.close({
            allowReconnect: false
          });
        };

        Consumer.prototype.ensureActiveConnection = function() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        };

        return Consumer;

      })();

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = ActionCable;
  } else if (typeof define === "function" && define.amd) {
    define(ActionCable);
  }
}).call(this);
// Action Cable provides the framework to deal with WebSockets in Rails.
// You can generate new channels where WebSocket features live using the `rails generate channel` command.
//




(function() {
  this.App || (this.App = {});

  App.cable = ActionCable.createConsumer();

}).call(this);
/*
 v2.2.0
 2017 Julian Garnier
 Released under the MIT license
*/

var $jscomp={scope:{}};$jscomp.defineProperty="function"==typeof Object.defineProperties?Object.defineProperty:function(e,r,p){if(p.get||p.set)throw new TypeError("ES3 does not support getters and setters.");e!=Array.prototype&&e!=Object.prototype&&(e[r]=p.value)};$jscomp.getGlobal=function(e){return"undefined"!=typeof window&&window===e?e:"undefined"!=typeof global&&null!=global?global:e};$jscomp.global=$jscomp.getGlobal(this);$jscomp.SYMBOL_PREFIX="jscomp_symbol_";
$jscomp.initSymbol=function(){$jscomp.initSymbol=function(){};$jscomp.global.Symbol||($jscomp.global.Symbol=$jscomp.Symbol)};$jscomp.symbolCounter_=0;$jscomp.Symbol=function(e){return $jscomp.SYMBOL_PREFIX+(e||"")+$jscomp.symbolCounter_++};
$jscomp.initSymbolIterator=function(){$jscomp.initSymbol();var e=$jscomp.global.Symbol.iterator;e||(e=$jscomp.global.Symbol.iterator=$jscomp.global.Symbol("iterator"));"function"!=typeof Array.prototype[e]&&$jscomp.defineProperty(Array.prototype,e,{configurable:!0,writable:!0,value:function(){return $jscomp.arrayIterator(this)}});$jscomp.initSymbolIterator=function(){}};$jscomp.arrayIterator=function(e){var r=0;return $jscomp.iteratorPrototype(function(){return r<e.length?{done:!1,value:e[r++]}:{done:!0}})};
$jscomp.iteratorPrototype=function(e){$jscomp.initSymbolIterator();e={next:e};e[$jscomp.global.Symbol.iterator]=function(){return this};return e};$jscomp.array=$jscomp.array||{};$jscomp.iteratorFromArray=function(e,r){$jscomp.initSymbolIterator();e instanceof String&&(e+="");var p=0,m={next:function(){if(p<e.length){var u=p++;return{value:r(u,e[u]),done:!1}}m.next=function(){return{done:!0,value:void 0}};return m.next()}};m[Symbol.iterator]=function(){return m};return m};
$jscomp.polyfill=function(e,r,p,m){if(r){p=$jscomp.global;e=e.split(".");for(m=0;m<e.length-1;m++){var u=e[m];u in p||(p[u]={});p=p[u]}e=e[e.length-1];m=p[e];r=r(m);r!=m&&null!=r&&$jscomp.defineProperty(p,e,{configurable:!0,writable:!0,value:r})}};$jscomp.polyfill("Array.prototype.keys",function(e){return e?e:function(){return $jscomp.iteratorFromArray(this,function(e){return e})}},"es6-impl","es3");var $jscomp$this=this;
(function(r){M.anime=r()})(function(){function e(a){if(!h.col(a))try{return document.querySelectorAll(a)}catch(c){}}function r(a,c){for(var d=a.length,b=2<=arguments.length?arguments[1]:void 0,f=[],n=0;n<d;n++)if(n in a){var k=a[n];c.call(b,k,n,a)&&f.push(k)}return f}function p(a){return a.reduce(function(a,d){return a.concat(h.arr(d)?p(d):d)},[])}function m(a){if(h.arr(a))return a;
h.str(a)&&(a=e(a)||a);return a instanceof NodeList||a instanceof HTMLCollection?[].slice.call(a):[a]}function u(a,c){return a.some(function(a){return a===c})}function C(a){var c={},d;for(d in a)c[d]=a[d];return c}function D(a,c){var d=C(a),b;for(b in a)d[b]=c.hasOwnProperty(b)?c[b]:a[b];return d}function z(a,c){var d=C(a),b;for(b in c)d[b]=h.und(a[b])?c[b]:a[b];return d}function T(a){a=a.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,function(a,c,d,k){return c+c+d+d+k+k});var c=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a);
a=parseInt(c[1],16);var d=parseInt(c[2],16),c=parseInt(c[3],16);return"rgba("+a+","+d+","+c+",1)"}function U(a){function c(a,c,b){0>b&&(b+=1);1<b&&--b;return b<1/6?a+6*(c-a)*b:.5>b?c:b<2/3?a+(c-a)*(2/3-b)*6:a}var d=/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(a)||/hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(a);a=parseInt(d[1])/360;var b=parseInt(d[2])/100,f=parseInt(d[3])/100,d=d[4]||1;if(0==b)f=b=a=f;else{var n=.5>f?f*(1+b):f+b-f*b,k=2*f-n,f=c(k,n,a+1/3),b=c(k,n,a);a=c(k,n,a-1/3)}return"rgba("+
255*f+","+255*b+","+255*a+","+d+")"}function y(a){if(a=/([\+\-]?[0-9#\.]+)(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(a))return a[2]}function V(a){if(-1<a.indexOf("translate")||"perspective"===a)return"px";if(-1<a.indexOf("rotate")||-1<a.indexOf("skew"))return"deg"}function I(a,c){return h.fnc(a)?a(c.target,c.id,c.total):a}function E(a,c){if(c in a.style)return getComputedStyle(a).getPropertyValue(c.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase())||"0"}function J(a,c){if(h.dom(a)&&
u(W,c))return"transform";if(h.dom(a)&&(a.getAttribute(c)||h.svg(a)&&a[c]))return"attribute";if(h.dom(a)&&"transform"!==c&&E(a,c))return"css";if(null!=a[c])return"object"}function X(a,c){var d=V(c),d=-1<c.indexOf("scale")?1:0+d;a=a.style.transform;if(!a)return d;for(var b=[],f=[],n=[],k=/(\w+)\((.+?)\)/g;b=k.exec(a);)f.push(b[1]),n.push(b[2]);a=r(n,function(a,b){return f[b]===c});return a.length?a[0]:d}function K(a,c){switch(J(a,c)){case "transform":return X(a,c);case "css":return E(a,c);case "attribute":return a.getAttribute(c)}return a[c]||
0}function L(a,c){var d=/^(\*=|\+=|-=)/.exec(a);if(!d)return a;var b=y(a)||0;c=parseFloat(c);a=parseFloat(a.replace(d[0],""));switch(d[0][0]){case "+":return c+a+b;case "-":return c-a+b;case "*":return c*a+b}}function F(a,c){return Math.sqrt(Math.pow(c.x-a.x,2)+Math.pow(c.y-a.y,2))}function M(a){a=a.points;for(var c=0,d,b=0;b<a.numberOfItems;b++){var f=a.getItem(b);0<b&&(c+=F(d,f));d=f}return c}function N(a){if(a.getTotalLength)return a.getTotalLength();switch(a.tagName.toLowerCase()){case "circle":return 2*
Math.PI*a.getAttribute("r");case "rect":return 2*a.getAttribute("width")+2*a.getAttribute("height");case "line":return F({x:a.getAttribute("x1"),y:a.getAttribute("y1")},{x:a.getAttribute("x2"),y:a.getAttribute("y2")});case "polyline":return M(a);case "polygon":var c=a.points;return M(a)+F(c.getItem(c.numberOfItems-1),c.getItem(0))}}function Y(a,c){function d(b){b=void 0===b?0:b;return a.el.getPointAtLength(1<=c+b?c+b:0)}var b=d(),f=d(-1),n=d(1);switch(a.property){case "x":return b.x;case "y":return b.y;
case "angle":return 180*Math.atan2(n.y-f.y,n.x-f.x)/Math.PI}}function O(a,c){var d=/-?\d*\.?\d+/g,b;b=h.pth(a)?a.totalLength:a;if(h.col(b))if(h.rgb(b)){var f=/rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(b);b=f?"rgba("+f[1]+",1)":b}else b=h.hex(b)?T(b):h.hsl(b)?U(b):void 0;else f=(f=y(b))?b.substr(0,b.length-f.length):b,b=c&&!/\s/g.test(b)?f+c:f;b+="";return{original:b,numbers:b.match(d)?b.match(d).map(Number):[0],strings:h.str(a)||c?b.split(d):[]}}function P(a){a=a?p(h.arr(a)?a.map(m):m(a)):[];return r(a,
function(a,d,b){return b.indexOf(a)===d})}function Z(a){var c=P(a);return c.map(function(a,b){return{target:a,id:b,total:c.length}})}function aa(a,c){var d=C(c);if(h.arr(a)){var b=a.length;2!==b||h.obj(a[0])?h.fnc(c.duration)||(d.duration=c.duration/b):a={value:a}}return m(a).map(function(a,b){b=b?0:c.delay;a=h.obj(a)&&!h.pth(a)?a:{value:a};h.und(a.delay)&&(a.delay=b);return a}).map(function(a){return z(a,d)})}function ba(a,c){var d={},b;for(b in a){var f=I(a[b],c);h.arr(f)&&(f=f.map(function(a){return I(a,
c)}),1===f.length&&(f=f[0]));d[b]=f}d.duration=parseFloat(d.duration);d.delay=parseFloat(d.delay);return d}function ca(a){return h.arr(a)?A.apply(this,a):Q[a]}function da(a,c){var d;return a.tweens.map(function(b){b=ba(b,c);var f=b.value,e=K(c.target,a.name),k=d?d.to.original:e,k=h.arr(f)?f[0]:k,w=L(h.arr(f)?f[1]:f,k),e=y(w)||y(k)||y(e);b.from=O(k,e);b.to=O(w,e);b.start=d?d.end:a.offset;b.end=b.start+b.delay+b.duration;b.easing=ca(b.easing);b.elasticity=(1E3-Math.min(Math.max(b.elasticity,1),999))/
1E3;b.isPath=h.pth(f);b.isColor=h.col(b.from.original);b.isColor&&(b.round=1);return d=b})}function ea(a,c){return r(p(a.map(function(a){return c.map(function(b){var c=J(a.target,b.name);if(c){var d=da(b,a);b={type:c,property:b.name,animatable:a,tweens:d,duration:d[d.length-1].end,delay:d[0].delay}}else b=void 0;return b})})),function(a){return!h.und(a)})}function R(a,c,d,b){var f="delay"===a;return c.length?(f?Math.min:Math.max).apply(Math,c.map(function(b){return b[a]})):f?b.delay:d.offset+b.delay+
b.duration}function fa(a){var c=D(ga,a),d=D(S,a),b=Z(a.targets),f=[],e=z(c,d),k;for(k in a)e.hasOwnProperty(k)||"targets"===k||f.push({name:k,offset:e.offset,tweens:aa(a[k],d)});a=ea(b,f);return z(c,{children:[],animatables:b,animations:a,duration:R("duration",a,c,d),delay:R("delay",a,c,d)})}function q(a){function c(){return window.Promise&&new Promise(function(a){return p=a})}function d(a){return g.reversed?g.duration-a:a}function b(a){for(var b=0,c={},d=g.animations,f=d.length;b<f;){var e=d[b],
k=e.animatable,h=e.tweens,n=h.length-1,l=h[n];n&&(l=r(h,function(b){return a<b.end})[0]||l);for(var h=Math.min(Math.max(a-l.start-l.delay,0),l.duration)/l.duration,w=isNaN(h)?1:l.easing(h,l.elasticity),h=l.to.strings,p=l.round,n=[],m=void 0,m=l.to.numbers.length,t=0;t<m;t++){var x=void 0,x=l.to.numbers[t],q=l.from.numbers[t],x=l.isPath?Y(l.value,w*x):q+w*(x-q);p&&(l.isColor&&2<t||(x=Math.round(x*p)/p));n.push(x)}if(l=h.length)for(m=h[0],w=0;w<l;w++)p=h[w+1],t=n[w],isNaN(t)||(m=p?m+(t+p):m+(t+" "));
else m=n[0];ha[e.type](k.target,e.property,m,c,k.id);e.currentValue=m;b++}if(b=Object.keys(c).length)for(d=0;d<b;d++)H||(H=E(document.body,"transform")?"transform":"-webkit-transform"),g.animatables[d].target.style[H]=c[d].join(" ");g.currentTime=a;g.progress=a/g.duration*100}function f(a){if(g[a])g[a](g)}function e(){g.remaining&&!0!==g.remaining&&g.remaining--}function k(a){var k=g.duration,n=g.offset,w=n+g.delay,r=g.currentTime,x=g.reversed,q=d(a);if(g.children.length){var u=g.children,v=u.length;
if(q>=g.currentTime)for(var G=0;G<v;G++)u[G].seek(q);else for(;v--;)u[v].seek(q)}if(q>=w||!k)g.began||(g.began=!0,f("begin")),f("run");if(q>n&&q<k)b(q);else if(q<=n&&0!==r&&(b(0),x&&e()),q>=k&&r!==k||!k)b(k),x||e();f("update");a>=k&&(g.remaining?(t=h,"alternate"===g.direction&&(g.reversed=!g.reversed)):(g.pause(),g.completed||(g.completed=!0,f("complete"),"Promise"in window&&(p(),m=c()))),l=0)}a=void 0===a?{}:a;var h,t,l=0,p=null,m=c(),g=fa(a);g.reset=function(){var a=g.direction,c=g.loop;g.currentTime=
0;g.progress=0;g.paused=!0;g.began=!1;g.completed=!1;g.reversed="reverse"===a;g.remaining="alternate"===a&&1===c?2:c;b(0);for(a=g.children.length;a--;)g.children[a].reset()};g.tick=function(a){h=a;t||(t=h);k((l+h-t)*q.speed)};g.seek=function(a){k(d(a))};g.pause=function(){var a=v.indexOf(g);-1<a&&v.splice(a,1);g.paused=!0};g.play=function(){g.paused&&(g.paused=!1,t=0,l=d(g.currentTime),v.push(g),B||ia())};g.reverse=function(){g.reversed=!g.reversed;t=0;l=d(g.currentTime)};g.restart=function(){g.pause();
g.reset();g.play()};g.finished=m;g.reset();g.autoplay&&g.play();return g}var ga={update:void 0,begin:void 0,run:void 0,complete:void 0,loop:1,direction:"normal",autoplay:!0,offset:0},S={duration:1E3,delay:0,easing:"easeOutElastic",elasticity:500,round:0},W="translateX translateY translateZ rotate rotateX rotateY rotateZ scale scaleX scaleY scaleZ skewX skewY perspective".split(" "),H,h={arr:function(a){return Array.isArray(a)},obj:function(a){return-1<Object.prototype.toString.call(a).indexOf("Object")},
pth:function(a){return h.obj(a)&&a.hasOwnProperty("totalLength")},svg:function(a){return a instanceof SVGElement},dom:function(a){return a.nodeType||h.svg(a)},str:function(a){return"string"===typeof a},fnc:function(a){return"function"===typeof a},und:function(a){return"undefined"===typeof a},hex:function(a){return/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a)},rgb:function(a){return/^rgb/.test(a)},hsl:function(a){return/^hsl/.test(a)},col:function(a){return h.hex(a)||h.rgb(a)||h.hsl(a)}},A=function(){function a(a,
d,b){return(((1-3*b+3*d)*a+(3*b-6*d))*a+3*d)*a}return function(c,d,b,f){if(0<=c&&1>=c&&0<=b&&1>=b){var e=new Float32Array(11);if(c!==d||b!==f)for(var k=0;11>k;++k)e[k]=a(.1*k,c,b);return function(k){if(c===d&&b===f)return k;if(0===k)return 0;if(1===k)return 1;for(var h=0,l=1;10!==l&&e[l]<=k;++l)h+=.1;--l;var l=h+(k-e[l])/(e[l+1]-e[l])*.1,n=3*(1-3*b+3*c)*l*l+2*(3*b-6*c)*l+3*c;if(.001<=n){for(h=0;4>h;++h){n=3*(1-3*b+3*c)*l*l+2*(3*b-6*c)*l+3*c;if(0===n)break;var m=a(l,c,b)-k,l=l-m/n}k=l}else if(0===
n)k=l;else{var l=h,h=h+.1,g=0;do m=l+(h-l)/2,n=a(m,c,b)-k,0<n?h=m:l=m;while(1e-7<Math.abs(n)&&10>++g);k=m}return a(k,d,f)}}}}(),Q=function(){function a(a,b){return 0===a||1===a?a:-Math.pow(2,10*(a-1))*Math.sin(2*(a-1-b/(2*Math.PI)*Math.asin(1))*Math.PI/b)}var c="Quad Cubic Quart Quint Sine Expo Circ Back Elastic".split(" "),d={In:[[.55,.085,.68,.53],[.55,.055,.675,.19],[.895,.03,.685,.22],[.755,.05,.855,.06],[.47,0,.745,.715],[.95,.05,.795,.035],[.6,.04,.98,.335],[.6,-.28,.735,.045],a],Out:[[.25,
.46,.45,.94],[.215,.61,.355,1],[.165,.84,.44,1],[.23,1,.32,1],[.39,.575,.565,1],[.19,1,.22,1],[.075,.82,.165,1],[.175,.885,.32,1.275],function(b,c){return 1-a(1-b,c)}],InOut:[[.455,.03,.515,.955],[.645,.045,.355,1],[.77,0,.175,1],[.86,0,.07,1],[.445,.05,.55,.95],[1,0,0,1],[.785,.135,.15,.86],[.68,-.55,.265,1.55],function(b,c){return.5>b?a(2*b,c)/2:1-a(-2*b+2,c)/2}]},b={linear:A(.25,.25,.75,.75)},f={},e;for(e in d)f.type=e,d[f.type].forEach(function(a){return function(d,f){b["ease"+a.type+c[f]]=h.fnc(d)?
d:A.apply($jscomp$this,d)}}(f)),f={type:f.type};return b}(),ha={css:function(a,c,d){return a.style[c]=d},attribute:function(a,c,d){return a.setAttribute(c,d)},object:function(a,c,d){return a[c]=d},transform:function(a,c,d,b,f){b[f]||(b[f]=[]);b[f].push(c+"("+d+")")}},v=[],B=0,ia=function(){function a(){B=requestAnimationFrame(c)}function c(c){var b=v.length;if(b){for(var d=0;d<b;)v[d]&&v[d].tick(c),d++;a()}else cancelAnimationFrame(B),B=0}return a}();q.version="2.2.0";q.speed=1;q.running=v;q.remove=
function(a){a=P(a);for(var c=v.length;c--;)for(var d=v[c],b=d.animations,f=b.length;f--;)u(a,b[f].animatable.target)&&(b.splice(f,1),b.length||d.pause())};q.getValue=K;q.path=function(a,c){var d=h.str(a)?e(a)[0]:a,b=c||100;return function(a){return{el:d,property:a,totalLength:N(d)*(b/100)}}};q.setDashoffset=function(a){var c=N(a);a.setAttribute("stroke-dasharray",c);return c};q.bezier=A;q.easings=Q;q.timeline=function(a){var c=q(a);c.pause();c.duration=0;c.add=function(d){c.children.forEach(function(a){a.began=
!0;a.completed=!0});m(d).forEach(function(b){var d=z(b,D(S,a||{}));d.targets=d.targets||a.targets;b=c.duration;var e=d.offset;d.autoplay=!1;d.direction=c.direction;d.offset=h.und(e)?b:L(e,b);c.began=!0;c.completed=!0;c.seek(d.offset);d=q(d);d.began=!0;d.completed=!0;d.duration>b&&(c.duration=d.duration);c.children.push(d)});c.seek(0);c.reset();c.autoplay&&c.restart();return c};return c};q.random=function(a,c){return Math.floor(Math.random()*(c-a+1))+a};return q});
(function ($) {
  'use strict';

  let _defaults = {
    data: {}, // Autocomplete data set
    limit: Infinity, // Limit of results the autocomplete shows
    onAutocomplete: null, // Callback for when autocompleted
    minLength: 1, // Min characters before autocomplete starts
    sortFunction: function (a, b, inputString) { // Sort function for sorting autocomplete results
      return a.indexOf(inputString) - b.indexOf(inputString);
    }
  };


  /**
   * @class
   *
   */
  class Autocomplete extends Component {
    /**
     * Construct Autocomplete instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Autocomplete, el, options);

      this.el.M_Autocomplete = this;

      /**
       * Options for the autocomplete
       * @member Autocomplete#options
       * @prop {Number} duration
       * @prop {Number} dist
       * @prop {number} shift
       * @prop {number} padding
       * @prop {Boolean} fullWidth
       * @prop {Boolean} indicators
       * @prop {Boolean} noWrap
       * @prop {Function} onCycleTo
       */
      this.options = $.extend({}, Autocomplete.defaults, options);

      // Setup
      this.isOpen = false;
      this.count = 0;
      this.activeIndex = -1;
      this.oldVal;
      this.$inputField = this.$el.closest('.input-field');
      this.$active = $();
      this._setupDropdown();

      this._setupEventHandlers();
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Autocomplete;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this._removeDropdown();
      this.el.M_Autocomplete = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleInputBlurBound = this._handleInputBlur.bind(this);
      this._handleInputKeyupAndFocusBound = this._handleInputKeyupAndFocus.bind(this);
      this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
      this._handleContainerMousedownAndTouchstartBound = this._handleContainerMousedownAndTouchstart.bind(this);

      this.el.addEventListener('blur', this._handleInputBlurBound);
      this.el.addEventListener('keyup', this._handleInputKeyupAndFocusBound);
      this.el.addEventListener('focus', this._handleInputKeyupAndFocusBound);
      this.el.addEventListener('keydown', this._handleInputKeydownBound);
      this.container.addEventListener('mousedown', this._handleContainerMousedownAndTouchstartBound);

      if (typeof window.ontouchstart !== 'undefined') {
        this.container.addEventListener('touchstart', this._handleContainerMousedownAndTouchstartBound);
      }
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      this.el.removeEventListener('blur', this._handleInputBlurBound);
      this.el.removeEventListener('keyup', this._handleInputKeyupAndFocusBound);
      this.el.removeEventListener('focus', this._handleInputKeyupAndFocusBound);
      this.el.removeEventListener('keydown', this._handleInputKeydownBound);
      this.container.removeEventListener('mousedown', this._handleContainerMousedownAndTouchstartBound);

      if (typeof window.ontouchstart !== 'undefined') {
        this.container.removeEventListener('touchstart', this._handleContainerMousedownAndTouchstartBound);
      }
    }

    /**
     * Setup dropdown
     */
    _setupDropdown() {
      this.container = document.createElement('ul');
      this.container.id = `autocomplete-options-${M.guid()}`;
      $(this.container).addClass('autocomplete-content dropdown-content');
      this.$inputField.append(this.container);
      this.el.setAttribute('data-target', this.container.id);

      this.dropdown = M.Dropdown.init(this.el, {
        autoFocus: false,
        closeOnClick: false,
        coverTrigger: false,
      });

      // Sketchy removal of dropdown click handler
      this.el.removeEventListener('click', this.dropdown._handleClickBound);
    }

    /**
     * Remove dropdown
     */
    _removeDropdown() {
      this.container.parentNode.removeChild(this.container);
    }

    /**
     * Handle Input Blur
     */
    _handleInputBlur() {
      this.dropdown.close();
      this._resetAutocomplete();
    }

    /**
     * Handle Input Keyup and Focus
     * @param {Event} e
     */
    _handleInputKeyupAndFocus(e) {
      if (e.type === 'keyup') {
        Autocomplete._keydown = false;
      }

      this.count = 0;
      let val = this.el.value.toLowerCase();

      // Don't capture enter or arrow key usage.
      if (e.keyCode === 13 ||
        e.keyCode === 38 ||
        e.keyCode === 40) {
        return;
      }

      // Check if the input isn't empty
      if (this.oldVal !== val) {
        this._resetAutocomplete();

        if (val.length >= this.options.minLength) {
          this.isOpen = true;
          this._renderDropdown(this.options.data, val);
        }

        // Open dropdown
        if (!this.dropdown.isOpen) {
          // Timeout to prevent dropdown temp doc click handler from firing
          setTimeout(() => {
            this.dropdown.open();
          }, 100);

        // Recalculate dropdown when its already open
        } else {
          this.dropdown.recalculateDimensions();
        }
      }

      // Update oldVal
      this.oldVal = val;
    }

    /**
     * Handle Input Keydown
     * @param {Event} e
     */
    _handleInputKeydown(e) {
      Autocomplete._keydown = true;

      // Arrow keys and enter key usage
      let keyCode = e.keyCode,
        liElement,
        numItems = $(this.container).children('li').length;

      // select element on Enter
      if (keyCode === 13 && this.activeIndex >= 0) {
        liElement = $(this.container).children('li').eq(this.activeIndex);
        if (liElement.length) {
          this.selectOption(liElement);
          e.preventDefault();
        }
        return;
      }

      // Capture up and down key
      if (keyCode === 38 || keyCode === 40) {
        e.preventDefault();

        if (keyCode === 38 &&
          this.activeIndex > 0) {
          this.activeIndex--;
        }

        if (keyCode === 40 &&
          this.activeIndex < (numItems - 1)) {
          this.activeIndex++;
        }

        this.$active.removeClass('active');
        if (this.activeIndex >= 0) {
          this.$active = $(this.container).children('li').eq(this.activeIndex);
          this.$active.addClass('active');
        }
      }
    }

    /**
     * Handle Container Mousedown and Touchstart
     * @param {Event} e
     */
    _handleContainerMousedownAndTouchstart(e) {
      let $autocompleteOption = $(e.target).closest('li');
      this.selectOption($autocompleteOption);
    }

    /**
     * Highlight partial match
     */
    _highlight(string, $el) {
      let img = $el.find('img');
      let matchStart = $el.text().toLowerCase().indexOf("" + string.toLowerCase() + ""),
        matchEnd = matchStart + string.length - 1,
        beforeMatch = $el.text().slice(0, matchStart),
        matchText = $el.text().slice(matchStart, matchEnd + 1),
        afterMatch = $el.text().slice(matchEnd + 1);
      $el.html("<span>" + beforeMatch + "<span class='highlight'>" + matchText + "</span>" + afterMatch + "</span>");
      if (img.length) {
        $el.prepend(img);
      }
    }

    /**
     * Reset current element position
     */
    _resetCurrentElement() {
      this.activeIndex = -1;
      this.$active.removeClass('active');
    }

    /**
     * Reset autocomplete elements
     */
    _resetAutocomplete() {
      $(this.container).empty();
      this._resetCurrentElement();
      this.oldVal = null;
      this.isOpen = false;
    }

    /**
     * Select autocomplete option
     * @param {Element} el  Autocomplete option list item element
     */
    selectOption(el) {
      let text = el.text().trim();
      this.el.value = text;
      this.$el.trigger('change');
      this._resetAutocomplete();
      this.dropdown.close();

      // Handle onAutocomplete callback.
      if (typeof (this.options.onAutocomplete) === 'function') {
        this.options.onAutocomplete.call(this, text);
      }
    }

    /**
     * Render dropdown content
     * @param {Object} data  data set
     * @param {String} val  current input value
     */
    _renderDropdown(data, val) {
      this._resetAutocomplete();

      let matchingData = [];

      // Gather all matching data
      for (let key in data) {
        if (data.hasOwnProperty(key) &&
          key.toLowerCase().indexOf(val) !== -1) {
          // Break if past limit
          if (this.count >= this.options.limit) {
            break;
          }

          let entry = {
            data: data[key],
            key: key
          };
          matchingData.push(entry);

          this.count++;
        }
      }

      // Sort
      let sortFunctionBound = (a, b) => {
        return this.options.sortFunction(a.key.toLowerCase(), b.key.toLowerCase(), val.toLowerCase());
      };
      matchingData.sort(sortFunctionBound);

      // Render
      for (let i = 0; i < matchingData.length; i++) {
        let entry = matchingData[i];
        let $autocompleteOption = $('<li></li>');
        if (!!entry.data) {
          $autocompleteOption.append('<img src="' + entry.data + '" class="right circle"><span>' + entry.key + '</span>');
        } else {
          $autocompleteOption.append('<span>' + entry.key + '</span>');
        }

        $(this.container).append($autocompleteOption);
        this._highlight(val, $autocompleteOption);
      }

    }

    /**
     * Update Data
     * @param {Object} data
     */
    updateData(data) {
      let val = this.el.value.toLowerCase();
      this.options.data = data;

      if (this.isOpen) {
        this._renderDropdown(data, val);
      }
    }
  }

  /**
   * @static
   * @memberof Autocomplete
   */
  Autocomplete._keydown = false;

  M.Autocomplete = Autocomplete;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Autocomplete, 'autocomplete', 'M_Autocomplete');
  }

}(cash));
/*!
 * Materialize v1.0.0-beta (http://materializecss.com)
 * Copyright 2014-2017 Materialize
 * MIT License (https://raw.githubusercontent.com/Dogfalo/materialize/master/LICENSE)
 */

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*! cash-dom 1.3.5, https://github.com/kenwheeler/cash @license MIT */
(function (factory) {
  window.cash = factory();
})(function () {
  var doc = document,
      win = window,
      ArrayProto = Array.prototype,
      slice = ArrayProto.slice,
      filter = ArrayProto.filter,
      push = ArrayProto.push;

  var noop = function () {},
      isFunction = function (item) {
    // @see https://crbug.com/568448
    return typeof item === typeof noop && item.call;
  },
      isString = function (item) {
    return typeof item === typeof "";
  };

  var idMatch = /^#[\w-]*$/,
      classMatch = /^\.[\w-]*$/,
      htmlMatch = /<.+>/,
      singlet = /^\w+$/;

  function find(selector, context) {
    context = context || doc;
    var elems = classMatch.test(selector) ? context.getElementsByClassName(selector.slice(1)) : singlet.test(selector) ? context.getElementsByTagName(selector) : context.querySelectorAll(selector);
    return elems;
  }

  var frag;
  function parseHTML(str) {
    if (!frag) {
      frag = doc.implementation.createHTMLDocument(null);
      var base = frag.createElement("base");
      base.href = doc.location.href;
      frag.head.appendChild(base);
    }

    frag.body.innerHTML = str;

    return frag.body.childNodes;
  }

  function onReady(fn) {
    if (doc.readyState !== "loading") {
      fn();
    } else {
      doc.addEventListener("DOMContentLoaded", fn);
    }
  }

  function Init(selector, context) {
    if (!selector) {
      return this;
    }

    // If already a cash collection, don't do any further processing
    if (selector.cash && selector !== win) {
      return selector;
    }

    var elems = selector,
        i = 0,
        length;

    if (isString(selector)) {
      elems = idMatch.test(selector) ?
      // If an ID use the faster getElementById check
      doc.getElementById(selector.slice(1)) : htmlMatch.test(selector) ?
      // If HTML, parse it into real elements
      parseHTML(selector) :
      // else use `find`
      find(selector, context);

      // If function, use as shortcut for DOM ready
    } else if (isFunction(selector)) {
      onReady(selector);return this;
    }

    if (!elems) {
      return this;
    }

    // If a single DOM element is passed in or received via ID, return the single element
    if (elems.nodeType || elems === win) {
      this[0] = elems;
      this.length = 1;
    } else {
      // Treat like an array and loop through each item.
      length = this.length = elems.length;
      for (; i < length; i++) {
        this[i] = elems[i];
      }
    }

    return this;
  }

  function cash(selector, context) {
    return new Init(selector, context);
  }

  var fn = cash.fn = cash.prototype = Init.prototype = { // jshint ignore:line
    cash: true,
    length: 0,
    push: push,
    splice: ArrayProto.splice,
    map: ArrayProto.map,
    init: Init
  };

  Object.defineProperty(fn, "constructor", { value: cash });

  cash.parseHTML = parseHTML;
  cash.noop = noop;
  cash.isFunction = isFunction;
  cash.isString = isString;

  cash.extend = fn.extend = function (target) {
    target = target || {};

    var args = slice.call(arguments),
        length = args.length,
        i = 1;

    if (args.length === 1) {
      target = this;
      i = 0;
    }

    for (; i < length; i++) {
      if (!args[i]) {
        continue;
      }
      for (var key in args[i]) {
        if (args[i].hasOwnProperty(key)) {
          target[key] = args[i][key];
        }
      }
    }

    return target;
  };

  function each(collection, callback) {
    var l = collection.length,
        i = 0;

    for (; i < l; i++) {
      if (callback.call(collection[i], collection[i], i, collection) === false) {
        break;
      }
    }
  }

  function matches(el, selector) {
    var m = el && (el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector || el.oMatchesSelector);
    return !!m && m.call(el, selector);
  }

  function getCompareFunction(selector) {
    return (
      /* Use browser's `matches` function if string */
      isString(selector) ? matches :
      /* Match a cash element */
      selector.cash ? function (el) {
        return selector.is(el);
      } :
      /* Direct comparison */
      function (el, selector) {
        return el === selector;
      }
    );
  }

  function unique(collection) {
    return cash(slice.call(collection).filter(function (item, index, self) {
      return self.indexOf(item) === index;
    }));
  }

  cash.extend({
    merge: function (first, second) {
      var len = +second.length,
          i = first.length,
          j = 0;

      for (; j < len; i++, j++) {
        first[i] = second[j];
      }

      first.length = i;
      return first;
    },

    each: each,
    matches: matches,
    unique: unique,
    isArray: Array.isArray,
    isNumeric: function (n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

  });

  var uid = cash.uid = "_cash" + Date.now();

  function getDataCache(node) {
    return node[uid] = node[uid] || {};
  }

  function setData(node, key, value) {
    return getDataCache(node)[key] = value;
  }

  function getData(node, key) {
    var c = getDataCache(node);
    if (c[key] === undefined) {
      c[key] = node.dataset ? node.dataset[key] : cash(node).attr("data-" + key);
    }
    return c[key];
  }

  function removeData(node, key) {
    var c = getDataCache(node);
    if (c) {
      delete c[key];
    } else if (node.dataset) {
      delete node.dataset[key];
    } else {
      cash(node).removeAttr("data-" + name);
    }
  }

  fn.extend({
    data: function (name, value) {
      if (isString(name)) {
        return value === undefined ? getData(this[0], name) : this.each(function (v) {
          return setData(v, name, value);
        });
      }

      for (var key in name) {
        this.data(key, name[key]);
      }

      return this;
    },

    removeData: function (key) {
      return this.each(function (v) {
        return removeData(v, key);
      });
    }

  });

  var notWhiteMatch = /\S+/g;

  function getClasses(c) {
    return isString(c) && c.match(notWhiteMatch);
  }

  function hasClass(v, c) {
    return v.classList ? v.classList.contains(c) : new RegExp("(^| )" + c + "( |$)", "gi").test(v.className);
  }

  function addClass(v, c, spacedName) {
    if (v.classList) {
      v.classList.add(c);
    } else if (spacedName.indexOf(" " + c + " ")) {
      v.className += " " + c;
    }
  }

  function removeClass(v, c) {
    if (v.classList) {
      v.classList.remove(c);
    } else {
      v.className = v.className.replace(c, "");
    }
  }

  fn.extend({
    addClass: function (c) {
      var classes = getClasses(c);

      return classes ? this.each(function (v) {
        var spacedName = " " + v.className + " ";
        each(classes, function (c) {
          addClass(v, c, spacedName);
        });
      }) : this;
    },

    attr: function (name, value) {
      if (!name) {
        return undefined;
      }

      if (isString(name)) {
        if (value === undefined) {
          return this[0] ? this[0].getAttribute ? this[0].getAttribute(name) : this[0][name] : undefined;
        }

        return this.each(function (v) {
          if (v.setAttribute) {
            v.setAttribute(name, value);
          } else {
            v[name] = value;
          }
        });
      }

      for (var key in name) {
        this.attr(key, name[key]);
      }

      return this;
    },

    hasClass: function (c) {
      var check = false,
          classes = getClasses(c);
      if (classes && classes.length) {
        this.each(function (v) {
          check = hasClass(v, classes[0]);
          return !check;
        });
      }
      return check;
    },

    prop: function (name, value) {
      if (isString(name)) {
        return value === undefined ? this[0][name] : this.each(function (v) {
          v[name] = value;
        });
      }

      for (var key in name) {
        this.prop(key, name[key]);
      }

      return this;
    },

    removeAttr: function (name) {
      return this.each(function (v) {
        if (v.removeAttribute) {
          v.removeAttribute(name);
        } else {
          delete v[name];
        }
      });
    },

    removeClass: function (c) {
      if (!arguments.length) {
        return this.attr("class", "");
      }
      var classes = getClasses(c);
      return classes ? this.each(function (v) {
        each(classes, function (c) {
          removeClass(v, c);
        });
      }) : this;
    },

    removeProp: function (name) {
      return this.each(function (v) {
        delete v[name];
      });
    },

    toggleClass: function (c, state) {
      if (state !== undefined) {
        return this[state ? "addClass" : "removeClass"](c);
      }
      var classes = getClasses(c);
      return classes ? this.each(function (v) {
        var spacedName = " " + v.className + " ";
        each(classes, function (c) {
          if (hasClass(v, c)) {
            removeClass(v, c);
          } else {
            addClass(v, c, spacedName);
          }
        });
      }) : this;
    } });

  fn.extend({
    add: function (selector, context) {
      return unique(cash.merge(this, cash(selector, context)));
    },

    each: function (callback) {
      each(this, callback);
      return this;
    },

    eq: function (index) {
      return cash(this.get(index));
    },

    filter: function (selector) {
      if (!selector) {
        return this;
      }

      var comparator = isFunction(selector) ? selector : getCompareFunction(selector);

      return cash(filter.call(this, function (e) {
        return comparator(e, selector);
      }));
    },

    first: function () {
      return this.eq(0);
    },

    get: function (index) {
      if (index === undefined) {
        return slice.call(this);
      }
      return index < 0 ? this[index + this.length] : this[index];
    },

    index: function (elem) {
      var child = elem ? cash(elem)[0] : this[0],
          collection = elem ? this : cash(child).parent().children();
      return slice.call(collection).indexOf(child);
    },

    last: function () {
      return this.eq(-1);
    }

  });

  var camelCase = function () {
    var camelRegex = /(?:^\w|[A-Z]|\b\w)/g,
        whiteSpace = /[\s-_]+/g;
    return function (str) {
      return str.replace(camelRegex, function (letter, index) {
        return letter[index === 0 ? "toLowerCase" : "toUpperCase"]();
      }).replace(whiteSpace, "");
    };
  }();

  var getPrefixedProp = function () {
    var cache = {},
        doc = document,
        div = doc.createElement("div"),
        style = div.style;

    return function (prop) {
      prop = camelCase(prop);
      if (cache[prop]) {
        return cache[prop];
      }

      var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1),
          prefixes = ["webkit", "moz", "ms", "o"],
          props = (prop + " " + prefixes.join(ucProp + " ") + ucProp).split(" ");

      each(props, function (p) {
        if (p in style) {
          cache[p] = prop = cache[prop] = p;
          return false;
        }
      });

      return cache[prop];
    };
  }();

  cash.prefixedProp = getPrefixedProp;
  cash.camelCase = camelCase;

  fn.extend({
    css: function (prop, value) {
      if (isString(prop)) {
        prop = getPrefixedProp(prop);
        return arguments.length > 1 ? this.each(function (v) {
          return v.style[prop] = value;
        }) : win.getComputedStyle(this[0])[prop];
      }

      for (var key in prop) {
        this.css(key, prop[key]);
      }

      return this;
    }

  });

  function compute(el, prop) {
    return parseInt(win.getComputedStyle(el[0], null)[prop], 10) || 0;
  }

  each(["Width", "Height"], function (v) {
    var lower = v.toLowerCase();

    fn[lower] = function () {
      return this[0].getBoundingClientRect()[lower];
    };

    fn["inner" + v] = function () {
      return this[0]["client" + v];
    };

    fn["outer" + v] = function (margins) {
      return this[0]["offset" + v] + (margins ? compute(this, "margin" + (v === "Width" ? "Left" : "Top")) + compute(this, "margin" + (v === "Width" ? "Right" : "Bottom")) : 0);
    };
  });

  function registerEvent(node, eventName, callback) {
    var eventCache = getData(node, "_cashEvents") || setData(node, "_cashEvents", {});
    eventCache[eventName] = eventCache[eventName] || [];
    eventCache[eventName].push(callback);
    node.addEventListener(eventName, callback);
  }

  function removeEvent(node, eventName, callback) {
    var events = getData(node, "_cashEvents"),
        eventCache = events && events[eventName],
        index;

    if (!eventCache) {
      return;
    }

    if (callback) {
      node.removeEventListener(eventName, callback);
      index = eventCache.indexOf(callback);
      if (index >= 0) {
        eventCache.splice(index, 1);
      }
    } else {
      each(eventCache, function (event) {
        node.removeEventListener(eventName, event);
      });
      eventCache = [];
    }
  }

  fn.extend({
    off: function (eventName, callback) {
      return this.each(function (v) {
        return removeEvent(v, eventName, callback);
      });
    },

    on: function (eventName, delegate, callback, runOnce) {
      // jshint ignore:line
      var originalCallback;
      if (!isString(eventName)) {
        for (var key in eventName) {
          this.on(key, delegate, eventName[key]);
        }
        return this;
      }

      if (isFunction(delegate)) {
        callback = delegate;
        delegate = null;
      }

      if (eventName === "ready") {
        onReady(callback);
        return this;
      }

      if (delegate) {
        originalCallback = callback;
        callback = function (e) {
          var t = e.target;
          while (!matches(t, delegate)) {
            if (t === this || t === null) {
              return t = false;
            }

            t = t.parentNode;
          }

          if (t) {
            originalCallback.call(t, e);
          }
        };
      }

      return this.each(function (v) {
        var finalCallback = callback;
        if (runOnce) {
          finalCallback = function () {
            callback.apply(this, arguments);
            removeEvent(v, eventName, finalCallback);
          };
        }
        registerEvent(v, eventName, finalCallback);
      });
    },

    one: function (eventName, delegate, callback) {
      return this.on(eventName, delegate, callback, true);
    },

    ready: onReady,

    /**
     * Modified
     * Triggers browser event
     * @param String eventName
     * @param Object data - Add properties to event object
     */
    trigger: function (eventName, data) {
      if (document.createEvent) {
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent(eventName, true, false);
        evt = this.extend(evt, data);
        return this.each(function (v) {
          return v.dispatchEvent(evt);
        });
      }
    }

  });

  function encode(name, value) {
    return "&" + encodeURIComponent(name) + "=" + encodeURIComponent(value).replace(/%20/g, "+");
  }

  function getSelectMultiple_(el) {
    var values = [];
    each(el.options, function (o) {
      if (o.selected) {
        values.push(o.value);
      }
    });
    return values.length ? values : null;
  }

  function getSelectSingle_(el) {
    var selectedIndex = el.selectedIndex;
    return selectedIndex >= 0 ? el.options[selectedIndex].value : null;
  }

  function getValue(el) {
    var type = el.type;
    if (!type) {
      return null;
    }
    switch (type.toLowerCase()) {
      case "select-one":
        return getSelectSingle_(el);
      case "select-multiple":
        return getSelectMultiple_(el);
      case "radio":
        return el.checked ? el.value : null;
      case "checkbox":
        return el.checked ? el.value : null;
      default:
        return el.value ? el.value : null;
    }
  }

  fn.extend({
    serialize: function () {
      var query = "";

      each(this[0].elements || this, function (el) {
        if (el.disabled || el.tagName === "FIELDSET") {
          return;
        }
        var name = el.name;
        switch (el.type.toLowerCase()) {
          case "file":
          case "reset":
          case "submit":
          case "button":
            break;
          case "select-multiple":
            var values = getValue(el);
            if (values !== null) {
              each(values, function (value) {
                query += encode(name, value);
              });
            }
            break;
          default:
            var value = getValue(el);
            if (value !== null) {
              query += encode(name, value);
            }
        }
      });

      return query.substr(1);
    },

    val: function (value) {
      if (value === undefined) {
        return getValue(this[0]);
      }

      return this.each(function (v) {
        return v.value = value;
      });
    }

  });

  function insertElement(el, child, prepend) {
    if (prepend) {
      var first = el.childNodes[0];
      el.insertBefore(child, first);
    } else {
      el.appendChild(child);
    }
  }

  function insertContent(parent, child, prepend) {
    var str = isString(child);

    if (!str && child.length) {
      each(child, function (v) {
        return insertContent(parent, v, prepend);
      });
      return;
    }

    each(parent, str ? function (v) {
      return v.insertAdjacentHTML(prepend ? "afterbegin" : "beforeend", child);
    } : function (v, i) {
      return insertElement(v, i === 0 ? child : child.cloneNode(true), prepend);
    });
  }

  fn.extend({
    after: function (selector) {
      cash(selector).insertAfter(this);
      return this;
    },

    append: function (content) {
      insertContent(this, content);
      return this;
    },

    appendTo: function (parent) {
      insertContent(cash(parent), this);
      return this;
    },

    before: function (selector) {
      cash(selector).insertBefore(this);
      return this;
    },

    clone: function () {
      return cash(this.map(function (v) {
        return v.cloneNode(true);
      }));
    },

    empty: function () {
      this.html("");
      return this;
    },

    html: function (content) {
      if (content === undefined) {
        return this[0].innerHTML;
      }
      var source = content.nodeType ? content[0].outerHTML : content;
      return this.each(function (v) {
        return v.innerHTML = source;
      });
    },

    insertAfter: function (selector) {
      var _this = this;

      cash(selector).each(function (el, i) {
        var parent = el.parentNode,
            sibling = el.nextSibling;
        _this.each(function (v) {
          parent.insertBefore(i === 0 ? v : v.cloneNode(true), sibling);
        });
      });

      return this;
    },

    insertBefore: function (selector) {
      var _this2 = this;
      cash(selector).each(function (el, i) {
        var parent = el.parentNode;
        _this2.each(function (v) {
          parent.insertBefore(i === 0 ? v : v.cloneNode(true), el);
        });
      });
      return this;
    },

    prepend: function (content) {
      insertContent(this, content, true);
      return this;
    },

    prependTo: function (parent) {
      insertContent(cash(parent), this, true);
      return this;
    },

    remove: function () {
      return this.each(function (v) {
        if (!!v.parentNode) {
          return v.parentNode.removeChild(v);
        }
      });
    },

    text: function (content) {
      if (content === undefined) {
        return this[0].textContent;
      }
      return this.each(function (v) {
        return v.textContent = content;
      });
    }

  });

  var docEl = doc.documentElement;

  fn.extend({
    position: function () {
      var el = this[0];
      return {
        left: el.offsetLeft,
        top: el.offsetTop
      };
    },

    offset: function () {
      var rect = this[0].getBoundingClientRect();
      return {
        top: rect.top + win.pageYOffset - docEl.clientTop,
        left: rect.left + win.pageXOffset - docEl.clientLeft
      };
    },

    offsetParent: function () {
      return cash(this[0].offsetParent);
    }

  });

  fn.extend({
    children: function (selector) {
      var elems = [];
      this.each(function (el) {
        push.apply(elems, el.children);
      });
      elems = unique(elems);

      return !selector ? elems : elems.filter(function (v) {
        return matches(v, selector);
      });
    },

    closest: function (selector) {
      if (!selector || this.length < 1) {
        return cash();
      }
      if (this.is(selector)) {
        return this.filter(selector);
      }
      return this.parent().closest(selector);
    },

    is: function (selector) {
      if (!selector) {
        return false;
      }

      var match = false,
          comparator = getCompareFunction(selector);

      this.each(function (el) {
        match = comparator(el, selector);
        return !match;
      });

      return match;
    },

    find: function (selector) {
      if (!selector || selector.nodeType) {
        return cash(selector && this.has(selector).length ? selector : null);
      }

      var elems = [];
      this.each(function (el) {
        push.apply(elems, find(selector, el));
      });

      return unique(elems);
    },

    has: function (selector) {
      var comparator = isString(selector) ? function (el) {
        return find(selector, el).length !== 0;
      } : function (el) {
        return el.contains(selector);
      };

      return this.filter(comparator);
    },

    next: function () {
      return cash(this[0].nextElementSibling);
    },

    not: function (selector) {
      if (!selector) {
        return this;
      }

      var comparator = getCompareFunction(selector);

      return this.filter(function (el) {
        return !comparator(el, selector);
      });
    },

    parent: function () {
      var result = [];

      this.each(function (item) {
        if (item && item.parentNode) {
          result.push(item.parentNode);
        }
      });

      return unique(result);
    },

    parents: function (selector) {
      var last,
          result = [];

      this.each(function (item) {
        last = item;

        while (last && last.parentNode && last !== doc.body.parentNode) {
          last = last.parentNode;

          if (!selector || selector && matches(last, selector)) {
            result.push(last);
          }
        }
      });

      return unique(result);
    },

    prev: function () {
      return cash(this[0].previousElementSibling);
    },

    siblings: function (selector) {
      var collection = this.parent().children(selector),
          el = this[0];

      return collection.filter(function (i) {
        return i !== el;
      });
    }

  });

  return cash;
});
;
var Component = function () {
  /**
   * Generic constructor for all components
   * @constructor
   * @param {Element} el
   * @param {Object} options
   */
  function Component(classDef, el, options) {
    _classCallCheck(this, Component);

    // Display error if el is valid HTML Element
    if (!(el instanceof Element)) {
      console.error(Error(el + ' is not an HTML Element'));
    }

    // If exists, destroy and reinitialize in child
    var ins = classDef.getInstance(el);
    if (!!ins) {
      ins.destroy();
    }

    this.el = el;
    this.$el = cash(el);
  }

  /**
   * Initializes components
   * @param {class} classDef
   * @param {Element | NodeList | jQuery} els
   * @param {Object} options
   */


  _createClass(Component, null, [{
    key: "init",
    value: function init(classDef, els, options) {
      var instances = null;
      if (els instanceof Element) {
        instances = new classDef(els, options);
      } else if (!!els && (els.jquery || els.cash || els instanceof NodeList)) {
        var instancesArr = [];
        for (var i = 0; i < els.length; i++) {
          instancesArr.push(new classDef(els[i], options));
        }
        instances = instancesArr;
      }

      return instances;
    }
  }]);

  return Component;
}();

; // Required for Meteor package, the use of window prevents export by Meteor
(function (window) {
  if (window.Package) {
    M = {};
  } else {
    window.M = {};
  }

  // Check for jQuery
  M.jQueryLoaded = !!window.jQuery;
})(window);

// AMD
if (typeof define === "function" && define.amd) {
  define("M", [], function () {
    return M;
  });

  // Common JS
} else if (typeof exports !== 'undefined' && !exports.nodeType) {
  if (typeof module !== 'undefined' && !module.nodeType && module.exports) {
    exports = module.exports = M;
  }
  exports.default = M;
}

M.keys = {
  TAB: 9,
  ENTER: 13,
  ESC: 27,
  ARROW_UP: 38,
  ARROW_DOWN: 40
};

/**
 * TabPress Keydown handler
 */
M.tabPressed = false;
var docHandleKeydown = function (e) {
  if (e.which === M.keys.TAB) {
    M.tabPressed = true;
  }
};
var docHandleKeyup = function (e) {
  if (e.which === M.keys.TAB) {
    M.tabPressed = false;
  }
};
document.addEventListener('keydown', docHandleKeydown);
document.addEventListener('keyup', docHandleKeyup);

/**
 * Initialize jQuery wrapper for plugin
 * @param {Class} plugin  javascript class
 * @param {string} pluginName  jQuery plugin name
 * @param {string} classRef  Class reference name
 */
M.initializeJqueryWrapper = function (plugin, pluginName, classRef) {
  jQuery.fn[pluginName] = function (methodOrOptions) {
    // Call plugin method if valid method name is passed in
    if (plugin.prototype[methodOrOptions]) {
      var params = Array.prototype.slice.call(arguments, 1);

      // Getter methods
      if (methodOrOptions.slice(0, 3) === 'get') {
        var instance = this.first()[0][classRef];
        return instance[methodOrOptions].apply(instance, params);
      }

      // Void methods
      return this.each(function () {
        var instance = this[classRef];
        instance[methodOrOptions].apply(instance, params);
      });

      // Initialize plugin if options or no argument is passed in
    } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
      plugin.init(this, arguments[0]);
      return this;
    }

    // Return error if an unrecognized  method name is passed in
    jQuery.error("Method " + methodOrOptions + " does not exist on jQuery." + pluginName);
  };
};

/**
 * Automatically initialize components
 * @param {Element} context  DOM Element to search within for components
 */
M.AutoInit = function (context) {
  // Use document.body if no context is given
  var root = !!context ? context : document.body;

  var registry = {
    Autocomplete: root.querySelectorAll('.autocomplete:not(.no-autoinit)'),
    Carousel: root.querySelectorAll('.carousel:not(.no-autoinit)'),
    Chips: root.querySelectorAll('.chips:not(.no-autoinit)'),
    Collapsible: root.querySelectorAll('.collapsible:not(.no-autoinit)'),
    Datepicker: root.querySelectorAll('.datepicker:not(.no-autoinit)'),
    Dropdown: root.querySelectorAll('.dropdown-trigger:not(.no-autoinit)'),
    Materialbox: root.querySelectorAll('.materialboxed:not(.no-autoinit)'),
    Modal: root.querySelectorAll('.modal:not(.no-autoinit)'),
    Parallax: root.querySelectorAll('.parallax:not(.no-autoinit)'),
    Pushpin: root.querySelectorAll('.pushpin:not(.no-autoinit)'),
    ScrollSpy: root.querySelectorAll('.scrollspy:not(.no-autoinit)'),
    FormSelect: root.querySelectorAll('select:not(.no-autoinit)'),
    Sidenav: root.querySelectorAll('.sidenav:not(.no-autoinit)'),
    Tabs: root.querySelectorAll('.tabs:not(.no-autoinit)'),
    TapTarget: root.querySelectorAll('.tap-target:not(.no-autoinit)'),
    Timepicker: root.querySelectorAll('.timepicker:not(.no-autoinit)'),
    Tooltip: root.querySelectorAll('.tooltipped:not(.no-autoinit)'),
    FloatingActionButton: root.querySelectorAll('.fixed-action-btn:not(.no-autoinit)')
  };

  for (var pluginName in registry) {
    var plugin = M[pluginName];
    plugin.init(registry[pluginName]);
  }
};

/**
 * Generate approximated selector string for a jQuery object
 * @param {jQuery} obj  jQuery object to be parsed
 * @returns {string}
 */
M.objectSelectorString = function (obj) {
  var tagStr = obj.prop('tagName') || '';
  var idStr = obj.attr('id') || '';
  var classStr = obj.attr('class') || '';
  return (tagStr + idStr + classStr).replace(/\s/g, '');
};

// Unique Random ID
M.guid = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return function () {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  };
}();

/**
 * Escapes hash from special characters
 * @param {string} hash  String returned from this.hash
 * @returns {string}
 */
M.escapeHash = function (hash) {
  return hash.replace(/(:|\.|\[|\]|,|=|\/)/g, "\\$1");
};

M.elementOrParentIsFixed = function (element) {
  var $element = $(element);
  var $checkElements = $element.add($element.parents());
  var isFixed = false;
  $checkElements.each(function () {
    if ($(this).css("position") === "fixed") {
      isFixed = true;
      return false;
    }
  });
  return isFixed;
};

/**
 * @typedef {Object} Edges
 * @property {Boolean} top  If the top edge was exceeded
 * @property {Boolean} right  If the right edge was exceeded
 * @property {Boolean} bottom  If the bottom edge was exceeded
 * @property {Boolean} left  If the left edge was exceeded
 */

/**
 * @typedef {Object} Bounding
 * @property {Number} left  left offset coordinate
 * @property {Number} top  top offset coordinate
 * @property {Number} width
 * @property {Number} height
 */

/**
 * Escapes hash from special characters
 * @param {Element} container  Container element that acts as the boundary
 * @param {Bounding} bounding  element bounding that is being checked
 * @param {Number} offset  offset from edge that counts as exceeding
 * @returns {Edges}
 */
M.checkWithinContainer = function (container, bounding, offset) {
  var edges = {
    top: false,
    right: false,
    bottom: false,
    left: false
  };

  var containerRect = container.getBoundingClientRect();

  var scrollLeft = container.scrollLeft;
  var scrollTop = container.scrollTop;

  var scrolledX = bounding.left - scrollLeft;
  var scrolledY = bounding.top - scrollTop;

  // Check for container and viewport for each edge
  if (scrolledX < containerRect.left + offset || scrolledX < offset) {
    edges.left = true;
  }

  if (scrolledX + bounding.width > containerRect.right - offset || scrolledX + bounding.width > window.innerWidth - offset) {
    edges.right = true;
  }

  if (scrolledY < containerRect.top + offset || scrolledY < offset) {
    edges.top = true;
  }

  if (scrolledY + bounding.height > containerRect.bottom - offset || scrolledY + bounding.height > window.innerHeight - offset) {
    edges.bottom = true;
  }

  return edges;
};

M.checkPossibleAlignments = function (el, container, bounding, offset) {
  var canAlign = {
    top: true,
    right: true,
    bottom: true,
    left: true,
    spaceOnTop: null,
    spaceOnRight: null,
    spaceOnBottom: null,
    spaceOnLeft: null
  };

  var containerAllowsOverflow = getComputedStyle(container).overflow === 'visible';
  var containerRect = container.getBoundingClientRect();
  var containerHeight = Math.min(containerRect.height, window.innerHeight);
  var containerWidth = Math.min(containerRect.width, window.innerWidth);
  var elOffsetRect = el.getBoundingClientRect();

  var scrollLeft = container.scrollLeft;
  var scrollTop = container.scrollTop;

  var scrolledX = bounding.left - scrollLeft;
  var scrolledYTopEdge = bounding.top - scrollTop;
  var scrolledYBottomEdge = bounding.top + elOffsetRect.height - scrollTop;

  // Check for container and viewport for left
  canAlign.spaceOnRight = !containerAllowsOverflow ? containerWidth - (scrolledX + bounding.width) : window.innerWidth - (elOffsetRect.left + bounding.width);
  if (canAlign.spaceOnRight < 0) {
    canAlign.left = false;
  }

  // Check for container and viewport for Right
  canAlign.spaceOnLeft = !containerAllowsOverflow ? scrolledX - bounding.width + elOffsetRect.width : elOffsetRect.right - bounding.width;
  if (canAlign.spaceOnLeft < 0) {
    canAlign.right = false;
  }

  // Check for container and viewport for Top
  canAlign.spaceOnBottom = !containerAllowsOverflow ? containerHeight - (scrolledYTopEdge + bounding.height + offset) : window.innerHeight - (elOffsetRect.top + bounding.height + offset);
  if (canAlign.spaceOnBottom < 0) {
    canAlign.top = false;
  }

  // Check for container and viewport for Bottom
  canAlign.spaceOnTop = !containerAllowsOverflow ? scrolledYBottomEdge - (bounding.height - offset) : elOffsetRect.bottom - (bounding.height + offset);
  if (canAlign.spaceOnTop < 0) {
    canAlign.bottom = false;
  }

  return canAlign;
};

M.getOverflowParent = function (element) {
  if (element == null) {
    return null;
  }

  if (element === document.body || getComputedStyle(element).overflow !== 'visible') {
    return element;
  }

  return M.getOverflowParent(element.parentElement);
};

/**
 * Gets id of component from a trigger
 * @param {Element} trigger  trigger
 * @returns {string}
 */
M.getIdFromTrigger = function (trigger) {
  var id = trigger.getAttribute('data-target');
  if (!id) {
    id = trigger.getAttribute('href');
    if (id) {
      id = id.slice(1);
    } else {
      id = "";
    }
  }
  return id;
};

/**
 * Multi browser support for document scroll top
 * @returns {Number}
 */
M.getDocumentScrollTop = function () {
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
};

/**
 * Multi browser support for document scroll left
 * @returns {Number}
 */
M.getDocumentScrollLeft = function () {
  return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
};

/**
 * @typedef {Object} Edges
 * @property {Boolean} top  If the top edge was exceeded
 * @property {Boolean} right  If the right edge was exceeded
 * @property {Boolean} bottom  If the bottom edge was exceeded
 * @property {Boolean} left  If the left edge was exceeded
 */

/**
 * @typedef {Object} Bounding
 * @property {Number} left  left offset coordinate
 * @property {Number} top  top offset coordinate
 * @property {Number} width
 * @property {Number} height
 */

/**
 * Get time in ms
 * @license https://raw.github.com/jashkenas/underscore/master/LICENSE
 * @type {function}
 * @return {number}
 */
var getTime = Date.now || function () {
  return new Date().getTime();
};

/**
 * Returns a function, that, when invoked, will only be triggered at most once
 * during a given window of time. Normally, the throttled function will run
 * as much as it can, without ever going more than once per `wait` duration;
 * but if you'd like to disable the execution on the leading edge, pass
 * `{leading: false}`. To disable execution on the trailing edge, ditto.
 * @license https://raw.github.com/jashkenas/underscore/master/LICENSE
 * @param {function} func
 * @param {number} wait
 * @param {Object=} options
 * @returns {Function}
 */
M.throttle = function (func, wait, options) {
  var context = void 0,
      args = void 0,
      result = void 0;
  var timeout = null;
  var previous = 0;
  options || (options = {});
  var later = function () {
    previous = options.leading === false ? 0 : getTime();
    timeout = null;
    result = func.apply(context, args);
    context = args = null;
  };
  return function () {
    var now = getTime();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0) {
      clearTimeout(timeout);
      timeout = null;
      previous = now;
      result = func.apply(context, args);
      context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};
; /*
  v2.2.0
  2017 Julian Garnier
  Released under the MIT license
  */
var $jscomp = { scope: {} };$jscomp.defineProperty = "function" == typeof Object.defineProperties ? Object.defineProperty : function (e, r, p) {
  if (p.get || p.set) throw new TypeError("ES3 does not support getters and setters.");e != Array.prototype && e != Object.prototype && (e[r] = p.value);
};$jscomp.getGlobal = function (e) {
  return "undefined" != typeof window && window === e ? e : "undefined" != typeof global && null != global ? global : e;
};$jscomp.global = $jscomp.getGlobal(this);$jscomp.SYMBOL_PREFIX = "jscomp_symbol_";
$jscomp.initSymbol = function () {
  $jscomp.initSymbol = function () {};$jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol);
};$jscomp.symbolCounter_ = 0;$jscomp.Symbol = function (e) {
  return $jscomp.SYMBOL_PREFIX + (e || "") + $jscomp.symbolCounter_++;
};
$jscomp.initSymbolIterator = function () {
  $jscomp.initSymbol();var e = $jscomp.global.Symbol.iterator;e || (e = $jscomp.global.Symbol.iterator = $jscomp.global.Symbol("iterator"));"function" != typeof Array.prototype[e] && $jscomp.defineProperty(Array.prototype, e, { configurable: !0, writable: !0, value: function () {
      return $jscomp.arrayIterator(this);
    } });$jscomp.initSymbolIterator = function () {};
};$jscomp.arrayIterator = function (e) {
  var r = 0;return $jscomp.iteratorPrototype(function () {
    return r < e.length ? { done: !1, value: e[r++] } : { done: !0 };
  });
};
$jscomp.iteratorPrototype = function (e) {
  $jscomp.initSymbolIterator();e = { next: e };e[$jscomp.global.Symbol.iterator] = function () {
    return this;
  };return e;
};$jscomp.array = $jscomp.array || {};$jscomp.iteratorFromArray = function (e, r) {
  $jscomp.initSymbolIterator();e instanceof String && (e += "");var p = 0,
      m = { next: function () {
      if (p < e.length) {
        var u = p++;return { value: r(u, e[u]), done: !1 };
      }m.next = function () {
        return { done: !0, value: void 0 };
      };return m.next();
    } };m[Symbol.iterator] = function () {
    return m;
  };return m;
};
$jscomp.polyfill = function (e, r, p, m) {
  if (r) {
    p = $jscomp.global;e = e.split(".");for (m = 0; m < e.length - 1; m++) {
      var u = e[m];u in p || (p[u] = {});p = p[u];
    }e = e[e.length - 1];m = p[e];r = r(m);r != m && null != r && $jscomp.defineProperty(p, e, { configurable: !0, writable: !0, value: r });
  }
};$jscomp.polyfill("Array.prototype.keys", function (e) {
  return e ? e : function () {
    return $jscomp.iteratorFromArray(this, function (e) {
      return e;
    });
  };
}, "es6-impl", "es3");var $jscomp$this = this;
(function (r) {
  M.anime = r();
})(function () {
  function e(a) {
    if (!h.col(a)) try {
      return document.querySelectorAll(a);
    } catch (c) {}
  }function r(a, c) {
    for (var d = a.length, b = 2 <= arguments.length ? arguments[1] : void 0, f = [], n = 0; n < d; n++) {
      if (n in a) {
        var k = a[n];c.call(b, k, n, a) && f.push(k);
      }
    }return f;
  }function p(a) {
    return a.reduce(function (a, d) {
      return a.concat(h.arr(d) ? p(d) : d);
    }, []);
  }function m(a) {
    if (h.arr(a)) return a;
    h.str(a) && (a = e(a) || a);return a instanceof NodeList || a instanceof HTMLCollection ? [].slice.call(a) : [a];
  }function u(a, c) {
    return a.some(function (a) {
      return a === c;
    });
  }function C(a) {
    var c = {},
        d;for (d in a) {
      c[d] = a[d];
    }return c;
  }function D(a, c) {
    var d = C(a),
        b;for (b in a) {
      d[b] = c.hasOwnProperty(b) ? c[b] : a[b];
    }return d;
  }function z(a, c) {
    var d = C(a),
        b;for (b in c) {
      d[b] = h.und(a[b]) ? c[b] : a[b];
    }return d;
  }function T(a) {
    a = a.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function (a, c, d, k) {
      return c + c + d + d + k + k;
    });var c = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a);
    a = parseInt(c[1], 16);var d = parseInt(c[2], 16),
        c = parseInt(c[3], 16);return "rgba(" + a + "," + d + "," + c + ",1)";
  }function U(a) {
    function c(a, c, b) {
      0 > b && (b += 1);1 < b && --b;return b < 1 / 6 ? a + 6 * (c - a) * b : .5 > b ? c : b < 2 / 3 ? a + (c - a) * (2 / 3 - b) * 6 : a;
    }var d = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(a) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(a);a = parseInt(d[1]) / 360;var b = parseInt(d[2]) / 100,
        f = parseInt(d[3]) / 100,
        d = d[4] || 1;if (0 == b) f = b = a = f;else {
      var n = .5 > f ? f * (1 + b) : f + b - f * b,
          k = 2 * f - n,
          f = c(k, n, a + 1 / 3),
          b = c(k, n, a);a = c(k, n, a - 1 / 3);
    }return "rgba(" + 255 * f + "," + 255 * b + "," + 255 * a + "," + d + ")";
  }function y(a) {
    if (a = /([\+\-]?[0-9#\.]+)(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(a)) return a[2];
  }function V(a) {
    if (-1 < a.indexOf("translate") || "perspective" === a) return "px";if (-1 < a.indexOf("rotate") || -1 < a.indexOf("skew")) return "deg";
  }function I(a, c) {
    return h.fnc(a) ? a(c.target, c.id, c.total) : a;
  }function E(a, c) {
    if (c in a.style) return getComputedStyle(a).getPropertyValue(c.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()) || "0";
  }function J(a, c) {
    if (h.dom(a) && u(W, c)) return "transform";if (h.dom(a) && (a.getAttribute(c) || h.svg(a) && a[c])) return "attribute";if (h.dom(a) && "transform" !== c && E(a, c)) return "css";if (null != a[c]) return "object";
  }function X(a, c) {
    var d = V(c),
        d = -1 < c.indexOf("scale") ? 1 : 0 + d;a = a.style.transform;if (!a) return d;for (var b = [], f = [], n = [], k = /(\w+)\((.+?)\)/g; b = k.exec(a);) {
      f.push(b[1]), n.push(b[2]);
    }a = r(n, function (a, b) {
      return f[b] === c;
    });return a.length ? a[0] : d;
  }function K(a, c) {
    switch (J(a, c)) {case "transform":
        return X(a, c);case "css":
        return E(a, c);case "attribute":
        return a.getAttribute(c);}return a[c] || 0;
  }function L(a, c) {
    var d = /^(\*=|\+=|-=)/.exec(a);if (!d) return a;var b = y(a) || 0;c = parseFloat(c);a = parseFloat(a.replace(d[0], ""));switch (d[0][0]) {case "+":
        return c + a + b;case "-":
        return c - a + b;case "*":
        return c * a + b;}
  }function F(a, c) {
    return Math.sqrt(Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2));
  }function M(a) {
    a = a.points;for (var c = 0, d, b = 0; b < a.numberOfItems; b++) {
      var f = a.getItem(b);0 < b && (c += F(d, f));d = f;
    }return c;
  }function N(a) {
    if (a.getTotalLength) return a.getTotalLength();switch (a.tagName.toLowerCase()) {case "circle":
        return 2 * Math.PI * a.getAttribute("r");case "rect":
        return 2 * a.getAttribute("width") + 2 * a.getAttribute("height");case "line":
        return F({ x: a.getAttribute("x1"), y: a.getAttribute("y1") }, { x: a.getAttribute("x2"), y: a.getAttribute("y2") });case "polyline":
        return M(a);case "polygon":
        var c = a.points;return M(a) + F(c.getItem(c.numberOfItems - 1), c.getItem(0));}
  }function Y(a, c) {
    function d(b) {
      b = void 0 === b ? 0 : b;return a.el.getPointAtLength(1 <= c + b ? c + b : 0);
    }var b = d(),
        f = d(-1),
        n = d(1);switch (a.property) {case "x":
        return b.x;case "y":
        return b.y;
      case "angle":
        return 180 * Math.atan2(n.y - f.y, n.x - f.x) / Math.PI;}
  }function O(a, c) {
    var d = /-?\d*\.?\d+/g,
        b;b = h.pth(a) ? a.totalLength : a;if (h.col(b)) {
      if (h.rgb(b)) {
        var f = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(b);b = f ? "rgba(" + f[1] + ",1)" : b;
      } else b = h.hex(b) ? T(b) : h.hsl(b) ? U(b) : void 0;
    } else f = (f = y(b)) ? b.substr(0, b.length - f.length) : b, b = c && !/\s/g.test(b) ? f + c : f;b += "";return { original: b, numbers: b.match(d) ? b.match(d).map(Number) : [0], strings: h.str(a) || c ? b.split(d) : [] };
  }function P(a) {
    a = a ? p(h.arr(a) ? a.map(m) : m(a)) : [];return r(a, function (a, d, b) {
      return b.indexOf(a) === d;
    });
  }function Z(a) {
    var c = P(a);return c.map(function (a, b) {
      return { target: a, id: b, total: c.length };
    });
  }function aa(a, c) {
    var d = C(c);if (h.arr(a)) {
      var b = a.length;2 !== b || h.obj(a[0]) ? h.fnc(c.duration) || (d.duration = c.duration / b) : a = { value: a };
    }return m(a).map(function (a, b) {
      b = b ? 0 : c.delay;a = h.obj(a) && !h.pth(a) ? a : { value: a };h.und(a.delay) && (a.delay = b);return a;
    }).map(function (a) {
      return z(a, d);
    });
  }function ba(a, c) {
    var d = {},
        b;for (b in a) {
      var f = I(a[b], c);h.arr(f) && (f = f.map(function (a) {
        return I(a, c);
      }), 1 === f.length && (f = f[0]));d[b] = f;
    }d.duration = parseFloat(d.duration);d.delay = parseFloat(d.delay);return d;
  }function ca(a) {
    return h.arr(a) ? A.apply(this, a) : Q[a];
  }function da(a, c) {
    var d;return a.tweens.map(function (b) {
      b = ba(b, c);var f = b.value,
          e = K(c.target, a.name),
          k = d ? d.to.original : e,
          k = h.arr(f) ? f[0] : k,
          w = L(h.arr(f) ? f[1] : f, k),
          e = y(w) || y(k) || y(e);b.from = O(k, e);b.to = O(w, e);b.start = d ? d.end : a.offset;b.end = b.start + b.delay + b.duration;b.easing = ca(b.easing);b.elasticity = (1E3 - Math.min(Math.max(b.elasticity, 1), 999)) / 1E3;b.isPath = h.pth(f);b.isColor = h.col(b.from.original);b.isColor && (b.round = 1);return d = b;
    });
  }function ea(a, c) {
    return r(p(a.map(function (a) {
      return c.map(function (b) {
        var c = J(a.target, b.name);if (c) {
          var d = da(b, a);b = { type: c, property: b.name, animatable: a, tweens: d, duration: d[d.length - 1].end, delay: d[0].delay };
        } else b = void 0;return b;
      });
    })), function (a) {
      return !h.und(a);
    });
  }function R(a, c, d, b) {
    var f = "delay" === a;return c.length ? (f ? Math.min : Math.max).apply(Math, c.map(function (b) {
      return b[a];
    })) : f ? b.delay : d.offset + b.delay + b.duration;
  }function fa(a) {
    var c = D(ga, a),
        d = D(S, a),
        b = Z(a.targets),
        f = [],
        e = z(c, d),
        k;for (k in a) {
      e.hasOwnProperty(k) || "targets" === k || f.push({ name: k, offset: e.offset, tweens: aa(a[k], d) });
    }a = ea(b, f);return z(c, { children: [], animatables: b, animations: a, duration: R("duration", a, c, d), delay: R("delay", a, c, d) });
  }function q(a) {
    function c() {
      return window.Promise && new Promise(function (a) {
        return p = a;
      });
    }function d(a) {
      return g.reversed ? g.duration - a : a;
    }function b(a) {
      for (var b = 0, c = {}, d = g.animations, f = d.length; b < f;) {
        var e = d[b],
            k = e.animatable,
            h = e.tweens,
            n = h.length - 1,
            l = h[n];n && (l = r(h, function (b) {
          return a < b.end;
        })[0] || l);for (var h = Math.min(Math.max(a - l.start - l.delay, 0), l.duration) / l.duration, w = isNaN(h) ? 1 : l.easing(h, l.elasticity), h = l.to.strings, p = l.round, n = [], m = void 0, m = l.to.numbers.length, t = 0; t < m; t++) {
          var x = void 0,
              x = l.to.numbers[t],
              q = l.from.numbers[t],
              x = l.isPath ? Y(l.value, w * x) : q + w * (x - q);p && (l.isColor && 2 < t || (x = Math.round(x * p) / p));n.push(x);
        }if (l = h.length) for (m = h[0], w = 0; w < l; w++) {
          p = h[w + 1], t = n[w], isNaN(t) || (m = p ? m + (t + p) : m + (t + " "));
        } else m = n[0];ha[e.type](k.target, e.property, m, c, k.id);e.currentValue = m;b++;
      }if (b = Object.keys(c).length) for (d = 0; d < b; d++) {
        H || (H = E(document.body, "transform") ? "transform" : "-webkit-transform"), g.animatables[d].target.style[H] = c[d].join(" ");
      }g.currentTime = a;g.progress = a / g.duration * 100;
    }function f(a) {
      if (g[a]) g[a](g);
    }function e() {
      g.remaining && !0 !== g.remaining && g.remaining--;
    }function k(a) {
      var k = g.duration,
          n = g.offset,
          w = n + g.delay,
          r = g.currentTime,
          x = g.reversed,
          q = d(a);if (g.children.length) {
        var u = g.children,
            v = u.length;
        if (q >= g.currentTime) for (var G = 0; G < v; G++) {
          u[G].seek(q);
        } else for (; v--;) {
          u[v].seek(q);
        }
      }if (q >= w || !k) g.began || (g.began = !0, f("begin")), f("run");if (q > n && q < k) b(q);else if (q <= n && 0 !== r && (b(0), x && e()), q >= k && r !== k || !k) b(k), x || e();f("update");a >= k && (g.remaining ? (t = h, "alternate" === g.direction && (g.reversed = !g.reversed)) : (g.pause(), g.completed || (g.completed = !0, f("complete"), "Promise" in window && (p(), m = c()))), l = 0);
    }a = void 0 === a ? {} : a;var h,
        t,
        l = 0,
        p = null,
        m = c(),
        g = fa(a);g.reset = function () {
      var a = g.direction,
          c = g.loop;g.currentTime = 0;g.progress = 0;g.paused = !0;g.began = !1;g.completed = !1;g.reversed = "reverse" === a;g.remaining = "alternate" === a && 1 === c ? 2 : c;b(0);for (a = g.children.length; a--;) {
        g.children[a].reset();
      }
    };g.tick = function (a) {
      h = a;t || (t = h);k((l + h - t) * q.speed);
    };g.seek = function (a) {
      k(d(a));
    };g.pause = function () {
      var a = v.indexOf(g);-1 < a && v.splice(a, 1);g.paused = !0;
    };g.play = function () {
      g.paused && (g.paused = !1, t = 0, l = d(g.currentTime), v.push(g), B || ia());
    };g.reverse = function () {
      g.reversed = !g.reversed;t = 0;l = d(g.currentTime);
    };g.restart = function () {
      g.pause();
      g.reset();g.play();
    };g.finished = m;g.reset();g.autoplay && g.play();return g;
  }var ga = { update: void 0, begin: void 0, run: void 0, complete: void 0, loop: 1, direction: "normal", autoplay: !0, offset: 0 },
      S = { duration: 1E3, delay: 0, easing: "easeOutElastic", elasticity: 500, round: 0 },
      W = "translateX translateY translateZ rotate rotateX rotateY rotateZ scale scaleX scaleY scaleZ skewX skewY perspective".split(" "),
      H,
      h = { arr: function (a) {
      return Array.isArray(a);
    }, obj: function (a) {
      return -1 < Object.prototype.toString.call(a).indexOf("Object");
    },
    pth: function (a) {
      return h.obj(a) && a.hasOwnProperty("totalLength");
    }, svg: function (a) {
      return a instanceof SVGElement;
    }, dom: function (a) {
      return a.nodeType || h.svg(a);
    }, str: function (a) {
      return "string" === typeof a;
    }, fnc: function (a) {
      return "function" === typeof a;
    }, und: function (a) {
      return "undefined" === typeof a;
    }, hex: function (a) {
      return (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a)
      );
    }, rgb: function (a) {
      return (/^rgb/.test(a)
      );
    }, hsl: function (a) {
      return (/^hsl/.test(a)
      );
    }, col: function (a) {
      return h.hex(a) || h.rgb(a) || h.hsl(a);
    } },
      A = function () {
    function a(a, d, b) {
      return (((1 - 3 * b + 3 * d) * a + (3 * b - 6 * d)) * a + 3 * d) * a;
    }return function (c, d, b, f) {
      if (0 <= c && 1 >= c && 0 <= b && 1 >= b) {
        var e = new Float32Array(11);if (c !== d || b !== f) for (var k = 0; 11 > k; ++k) {
          e[k] = a(.1 * k, c, b);
        }return function (k) {
          if (c === d && b === f) return k;if (0 === k) return 0;if (1 === k) return 1;for (var h = 0, l = 1; 10 !== l && e[l] <= k; ++l) {
            h += .1;
          }--l;var l = h + (k - e[l]) / (e[l + 1] - e[l]) * .1,
              n = 3 * (1 - 3 * b + 3 * c) * l * l + 2 * (3 * b - 6 * c) * l + 3 * c;if (.001 <= n) {
            for (h = 0; 4 > h; ++h) {
              n = 3 * (1 - 3 * b + 3 * c) * l * l + 2 * (3 * b - 6 * c) * l + 3 * c;if (0 === n) break;var m = a(l, c, b) - k,
                  l = l - m / n;
            }k = l;
          } else if (0 === n) k = l;else {
            var l = h,
                h = h + .1,
                g = 0;do {
              m = l + (h - l) / 2, n = a(m, c, b) - k, 0 < n ? h = m : l = m;
            } while (1e-7 < Math.abs(n) && 10 > ++g);k = m;
          }return a(k, d, f);
        };
      }
    };
  }(),
      Q = function () {
    function a(a, b) {
      return 0 === a || 1 === a ? a : -Math.pow(2, 10 * (a - 1)) * Math.sin(2 * (a - 1 - b / (2 * Math.PI) * Math.asin(1)) * Math.PI / b);
    }var c = "Quad Cubic Quart Quint Sine Expo Circ Back Elastic".split(" "),
        d = { In: [[.55, .085, .68, .53], [.55, .055, .675, .19], [.895, .03, .685, .22], [.755, .05, .855, .06], [.47, 0, .745, .715], [.95, .05, .795, .035], [.6, .04, .98, .335], [.6, -.28, .735, .045], a], Out: [[.25, .46, .45, .94], [.215, .61, .355, 1], [.165, .84, .44, 1], [.23, 1, .32, 1], [.39, .575, .565, 1], [.19, 1, .22, 1], [.075, .82, .165, 1], [.175, .885, .32, 1.275], function (b, c) {
        return 1 - a(1 - b, c);
      }], InOut: [[.455, .03, .515, .955], [.645, .045, .355, 1], [.77, 0, .175, 1], [.86, 0, .07, 1], [.445, .05, .55, .95], [1, 0, 0, 1], [.785, .135, .15, .86], [.68, -.55, .265, 1.55], function (b, c) {
        return .5 > b ? a(2 * b, c) / 2 : 1 - a(-2 * b + 2, c) / 2;
      }] },
        b = { linear: A(.25, .25, .75, .75) },
        f = {},
        e;for (e in d) {
      f.type = e, d[f.type].forEach(function (a) {
        return function (d, f) {
          b["ease" + a.type + c[f]] = h.fnc(d) ? d : A.apply($jscomp$this, d);
        };
      }(f)), f = { type: f.type };
    }return b;
  }(),
      ha = { css: function (a, c, d) {
      return a.style[c] = d;
    }, attribute: function (a, c, d) {
      return a.setAttribute(c, d);
    }, object: function (a, c, d) {
      return a[c] = d;
    }, transform: function (a, c, d, b, f) {
      b[f] || (b[f] = []);b[f].push(c + "(" + d + ")");
    } },
      v = [],
      B = 0,
      ia = function () {
    function a() {
      B = requestAnimationFrame(c);
    }function c(c) {
      var b = v.length;if (b) {
        for (var d = 0; d < b;) {
          v[d] && v[d].tick(c), d++;
        }a();
      } else cancelAnimationFrame(B), B = 0;
    }return a;
  }();q.version = "2.2.0";q.speed = 1;q.running = v;q.remove = function (a) {
    a = P(a);for (var c = v.length; c--;) {
      for (var d = v[c], b = d.animations, f = b.length; f--;) {
        u(a, b[f].animatable.target) && (b.splice(f, 1), b.length || d.pause());
      }
    }
  };q.getValue = K;q.path = function (a, c) {
    var d = h.str(a) ? e(a)[0] : a,
        b = c || 100;return function (a) {
      return { el: d, property: a, totalLength: N(d) * (b / 100) };
    };
  };q.setDashoffset = function (a) {
    var c = N(a);a.setAttribute("stroke-dasharray", c);return c;
  };q.bezier = A;q.easings = Q;q.timeline = function (a) {
    var c = q(a);c.pause();c.duration = 0;c.add = function (d) {
      c.children.forEach(function (a) {
        a.began = !0;a.completed = !0;
      });m(d).forEach(function (b) {
        var d = z(b, D(S, a || {}));d.targets = d.targets || a.targets;b = c.duration;var e = d.offset;d.autoplay = !1;d.direction = c.direction;d.offset = h.und(e) ? b : L(e, b);c.began = !0;c.completed = !0;c.seek(d.offset);d = q(d);d.began = !0;d.completed = !0;d.duration > b && (c.duration = d.duration);c.children.push(d);
      });c.seek(0);c.reset();c.autoplay && c.restart();return c;
    };return c;
  };q.random = function (a, c) {
    return Math.floor(Math.random() * (c - a + 1)) + a;
  };return q;
});
;(function ($, anim) {
  'use strict';

  var _defaults = {
    accordion: true,
    onOpenStart: undefined,
    onOpenEnd: undefined,
    onCloseStart: undefined,
    onCloseEnd: undefined,
    inDuration: 300,
    outDuration: 300
  };

  /**
   * @class
   *
   */

  var Collapsible = function (_Component) {
    _inherits(Collapsible, _Component);

    /**
     * Construct Collapsible instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Collapsible(el, options) {
      _classCallCheck(this, Collapsible);

      var _this3 = _possibleConstructorReturn(this, (Collapsible.__proto__ || Object.getPrototypeOf(Collapsible)).call(this, Collapsible, el, options));

      _this3.el.M_Collapsible = _this3;

      /**
       * Options for the collapsible
       * @member Collapsible#options
       * @prop {Boolean} [accordion=false] - Type of the collapsible
       * @prop {Function} onOpenStart - Callback function called before collapsible is opened
       * @prop {Function} onOpenEnd - Callback function called after collapsible is opened
       * @prop {Function} onCloseStart - Callback function called before collapsible is closed
       * @prop {Function} onCloseEnd - Callback function called after collapsible is closed
       * @prop {Number} inDuration - Transition in duration in milliseconds.
       * @prop {Number} outDuration - Transition duration in milliseconds.
       */
      _this3.options = $.extend({}, Collapsible.defaults, options);

      // Setup tab indices
      _this3.$headers = _this3.$el.children('li').children('.collapsible-header');
      _this3.$headers.attr('tabindex', 0);

      _this3._setupEventHandlers();

      // Open first active
      var $activeBodies = _this3.$el.children('li.active').children('.collapsible-body');
      if (_this3.options.accordion) {
        // Handle Accordion
        $activeBodies.first().css('display', 'block');
      } else {
        // Handle Expandables
        $activeBodies.css('display', 'block');
      }
      return _this3;
    }

    _createClass(Collapsible, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.M_Collapsible = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        var _this4 = this;

        this._handleCollapsibleClickBound = this._handleCollapsibleClick.bind(this);
        this._handleCollapsibleKeydownBound = this._handleCollapsibleKeydown.bind(this);
        this.el.addEventListener('click', this._handleCollapsibleClickBound);
        this.$headers.each(function (header) {
          header.addEventListener('keydown', _this4._handleCollapsibleKeydownBound);
        });
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('click', this._handleCollapsibleClickBound);
      }

      /**
       * Handle Collapsible Click
       * @param {Event} e
       */

    }, {
      key: "_handleCollapsibleClick",
      value: function _handleCollapsibleClick(e) {
        var $header = $(e.target).closest('.collapsible-header');
        if (e.target && $header.length) {
          var $collapsible = $header.closest('.collapsible');
          if ($collapsible[0] === this.el) {
            var $collapsibleLi = $header.closest('li');
            var $collapsibleLis = $collapsible.children('li');
            var isActive = $collapsibleLi[0].classList.contains('active');
            var index = $collapsibleLis.index($collapsibleLi);

            if (isActive) {
              this.close(index);
            } else {
              this.open(index);
            }
          }
        }
      }

      /**
       * Handle Collapsible Keydown
       * @param {Event} e
       */

    }, {
      key: "_handleCollapsibleKeydown",
      value: function _handleCollapsibleKeydown(e) {
        if (e.keyCode === 13) {
          this._handleCollapsibleClickBound(e);
        }
      }

      /**
       * Animate in collapsible slide
       * @param {Number} index - 0th index of slide
       */

    }, {
      key: "_animateIn",
      value: function _animateIn(index) {
        var _this5 = this;

        var $collapsibleLi = this.$el.children('li').eq(index);
        if ($collapsibleLi.length) {
          var $body = $collapsibleLi.children('.collapsible-body');

          anim.remove($body[0]);
          $body.css({
            display: 'block',
            overflow: 'hidden',
            height: 0,
            paddingTop: '',
            paddingBottom: ''
          });

          var pTop = $body.css('padding-top');
          var pBottom = $body.css('padding-bottom');
          var finalHeight = $body[0].scrollHeight;
          $body.css({
            paddingTop: 0,
            paddingBottom: 0
          });

          anim({
            targets: $body[0],
            height: finalHeight,
            paddingTop: pTop,
            paddingBottom: pBottom,
            duration: this.options.inDuration,
            easing: 'easeInOutCubic',
            complete: function (anim) {
              $body.css({
                overflow: '',
                paddingTop: '',
                paddingBottom: '',
                height: ''
              });

              // onOpenEnd callback
              if (typeof _this5.options.onOpenEnd === 'function') {
                _this5.options.onOpenEnd.call(_this5, $collapsibleLi[0]);
              }
            }
          });
        }
      }

      /**
       * Animate out collapsible slide
       * @param {Number} index - 0th index of slide to open
       */

    }, {
      key: "_animateOut",
      value: function _animateOut(index) {
        var _this6 = this;

        var $collapsibleLi = this.$el.children('li').eq(index);
        if ($collapsibleLi.length) {
          var $body = $collapsibleLi.children('.collapsible-body');
          anim.remove($body[0]);
          $body.css('overflow', 'hidden');
          anim({
            targets: $body[0],
            height: 0,
            paddingTop: 0,
            paddingBottom: 0,
            duration: this.options.outDuration,
            easing: 'easeInOutCubic',
            complete: function () {
              $body.css({
                height: '',
                overflow: '',
                padding: '',
                display: ''
              });

              // onCloseEnd callback
              if (typeof _this6.options.onCloseEnd === 'function') {
                _this6.options.onCloseEnd.call(_this6, $collapsibleLi[0]);
              }
            }
          });
        }
      }

      /**
       * Open Collapsible
       * @param {Number} index - 0th index of slide
       */

    }, {
      key: "open",
      value: function open(index) {
        var _this7 = this;

        var $collapsibleLi = this.$el.children('li').eq(index);
        if ($collapsibleLi.length && !$collapsibleLi[0].classList.contains('active')) {

          // onOpenStart callback
          if (typeof this.options.onOpenStart === 'function') {
            this.options.onOpenStart.call(this, $collapsibleLi[0]);
          }

          // Handle accordion behavior
          if (this.options.accordion) {
            var $collapsibleLis = this.$el.children('li');
            var $activeLis = this.$el.children('li.active');
            $activeLis.each(function (el) {
              var index = $collapsibleLis.index($(el));
              _this7.close(index);
            });
          }

          // Animate in
          $collapsibleLi[0].classList.add('active');
          this._animateIn(index);
        }
      }

      /**
       * Close Collapsible
       * @param {Number} index - 0th index of slide
       */

    }, {
      key: "close",
      value: function close(index) {
        var $collapsibleLi = this.$el.children('li').eq(index);
        if ($collapsibleLi.length && $collapsibleLi[0].classList.contains('active')) {

          // onCloseStart callback
          if (typeof this.options.onCloseStart === 'function') {
            this.options.onCloseStart.call(this, $collapsibleLi[0]);
          }

          // Animate out
          $collapsibleLi[0].classList.remove('active');
          this._animateOut(index);
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Collapsible.__proto__ || Object.getPrototypeOf(Collapsible), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Collapsible;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Collapsible;
  }(Component);

  M.Collapsible = Collapsible;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Collapsible, 'collapsible', 'M_Collapsible');
  }
})(cash, M.anime);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    alignment: 'left',
    autoFocus: true,
    constrainWidth: true,
    container: null,
    coverTrigger: true,
    closeOnClick: true,
    hover: false,
    inDuration: 150,
    outDuration: 250,
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null
  };

  /**
   * @class
   */

  var Dropdown = function (_Component2) {
    _inherits(Dropdown, _Component2);

    function Dropdown(el, options) {
      _classCallCheck(this, Dropdown);

      var _this8 = _possibleConstructorReturn(this, (Dropdown.__proto__ || Object.getPrototypeOf(Dropdown)).call(this, Dropdown, el, options));

      _this8.el.M_Dropdown = _this8;
      Dropdown._dropdowns.push(_this8);

      _this8.id = M.getIdFromTrigger(el);
      _this8.dropdownEl = document.getElementById(_this8.id);
      _this8.$dropdownEl = $(_this8.dropdownEl);

      /**
       * Options for the dropdown
       * @member Dropdown#options
       * @prop {String} [alignment='left'] - Edge which the dropdown is aligned to
       * @prop {Boolean} [autoFocus=true] - Automatically focus dropdown el for keyboard
       * @prop {Boolean} [constrainWidth=true] - Constrain width to width of the button
       * @prop {Element} container - Container element to attach dropdown to (optional)
       * @prop {Boolean} [coverTrigger=true] - Place dropdown over trigger
       * @prop {Boolean} [closeOnClick=true] - Close on click of dropdown item
       * @prop {Boolean} [hover=false] - Open dropdown on hover
       * @prop {Number} [inDuration=150] - Duration of open animation in ms
       * @prop {Number} [outDuration=250] - Duration of close animation in ms
       * @prop {Function} onOpenStart - Function called when dropdown starts opening
       * @prop {Function} onOpenEnd - Function called when dropdown finishes opening
       * @prop {Function} onCloseStart - Function called when dropdown starts closing
       * @prop {Function} onCloseEnd - Function called when dropdown finishes closing
       */
      _this8.options = $.extend({}, Dropdown.defaults, options);

      /**
       * Describes open/close state of dropdown
       * @type {Boolean}
       */
      _this8.isOpen = false;

      /**
       * Describes if dropdown content is scrollable
       * @type {Boolean}
       */
      _this8.isScrollable = false;

      /**
       * Describes if touch moving on dropdown content
       * @type {Boolean}
       */
      _this8.isTouchMoving = false;

      _this8.focusedIndex = -1;
      _this8.filterQuery = [];

      // Move dropdown-content after dropdown-trigger
      if (!!_this8.options.container) {
        $(_this8.options.container).append(_this8.dropdownEl);
      } else {
        _this8.$el.after(_this8.dropdownEl);
      }

      _this8._makeDropdownFocusable();
      _this8._resetFilterQueryBound = _this8._resetFilterQuery.bind(_this8);
      _this8._handleDocumentClickBound = _this8._handleDocumentClick.bind(_this8);
      _this8._handleDocumentTouchmoveBound = _this8._handleDocumentTouchmove.bind(_this8);
      _this8._handleDropdownKeydownBound = _this8._handleDropdownKeydown.bind(_this8);
      _this8._handleTriggerKeydownBound = _this8._handleTriggerKeydown.bind(_this8);
      _this8._setupEventHandlers();
      return _this8;
    }

    _createClass(Dropdown, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._resetDropdownStyles();
        this._removeEventHandlers();
        Dropdown._dropdowns.splice(Dropdown._dropdowns.indexOf(this), 1);
        this.el.M_Dropdown = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        // Trigger keydown handler
        this.el.addEventListener('keydown', this._handleTriggerKeydownBound);

        // Hover event handlers
        if (this.options.hover) {
          this._handleMouseEnterBound = this._handleMouseEnter.bind(this);
          this.el.addEventListener('mouseenter', this._handleMouseEnterBound);
          this._handleMouseLeaveBound = this._handleMouseLeave.bind(this);
          this.el.addEventListener('mouseleave', this._handleMouseLeaveBound);
          this.dropdownEl.addEventListener('mouseleave', this._handleMouseLeaveBound);

          // Click event handlers
        } else {
          this._handleClickBound = this._handleClick.bind(this);
          this.el.addEventListener('click', this._handleClickBound);
        }
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        // Trigger keydown handler
        this.el.removeEventListener('keydown', this._handleTriggerKeydownBound);

        if (this.options.hover) {
          this.el.removeEventHandlers('mouseenter', this._handleMouseEnterBound);
          this.el.removeEventHandlers('mouseleave', this._handleMouseLeaveBound);
          this.dropdownEl.removeEventHandlers('mouseleave', this._handleMouseLeaveBound);
        } else {
          this.el.removeEventListener('click', this._handleClickBound);
        }
      }
    }, {
      key: "_setupTemporaryEventHandlers",
      value: function _setupTemporaryEventHandlers() {
        // Use capture phase event handler to prevent click
        document.body.addEventListener('click', this._handleDocumentClickBound, true);
        document.body.addEventListener('touchend', this._handleDocumentClickBound);
        document.body.addEventListener('touchmove', this._handleDocumentTouchmoveBound);
        this.dropdownEl.addEventListener('keydown', this._handleDropdownKeydownBound);
      }
    }, {
      key: "_removeTemporaryEventHandlers",
      value: function _removeTemporaryEventHandlers() {
        // Use capture phase event handler to prevent click
        document.body.removeEventListener('click', this._handleDocumentClickBound, true);
        document.body.removeEventListener('touchend', this._handleDocumentClickBound);
        document.body.removeEventListener('touchmove', this._handleDocumentTouchmoveBound);
        this.dropdownEl.removeEventListener('keydown', this._handleDropdownKeydownBound);
      }
    }, {
      key: "_handleClick",
      value: function _handleClick(e) {
        e.preventDefault();
        this.open();
      }
    }, {
      key: "_handleMouseEnter",
      value: function _handleMouseEnter() {
        this.open();
      }
    }, {
      key: "_handleMouseLeave",
      value: function _handleMouseLeave(e) {
        var toEl = e.toElement || e.relatedTarget;
        var leaveToDropdownContent = !!$(toEl).closest('.dropdown-content').length;
        var leaveToActiveDropdownTrigger = false;

        var $closestTrigger = $(toEl).closest('.dropdown-trigger');
        if ($closestTrigger.length && !!$closestTrigger[0].M_Dropdown && $closestTrigger[0].M_Dropdown.isOpen) {
          leaveToActiveDropdownTrigger = true;
        }

        // Close hover dropdown if mouse did not leave to either active dropdown-trigger or dropdown-content
        if (!leaveToActiveDropdownTrigger && !leaveToDropdownContent) {
          this.close();
        }
      }
    }, {
      key: "_handleDocumentClick",
      value: function _handleDocumentClick(e) {
        var _this9 = this;

        var $target = $(e.target);
        if (this.options.closeOnClick && $target.closest('.dropdown-content').length && !this.isTouchMoving) {
          // isTouchMoving to check if scrolling on mobile.
          setTimeout(function () {
            _this9.close();
          }, 0);
        } else if ($target.closest('.dropdown-trigger').length || !$target.closest('.dropdown-content').length) {
          setTimeout(function () {
            _this9.close();
          }, 0);
        }
        this.isTouchMoving = false;
      }
    }, {
      key: "_handleTriggerKeydown",
      value: function _handleTriggerKeydown(e) {
        // ARROW DOWN OR ENTER WHEN SELECT IS CLOSED - open Dropdown
        if ((e.which === M.keys.ARROW_DOWN || e.which === M.keys.ENTER) && !this.isOpen) {
          e.preventDefault();
          this.open();
        }
      }

      /**
       * Handle Document Touchmove
       * @param {Event} e
       */

    }, {
      key: "_handleDocumentTouchmove",
      value: function _handleDocumentTouchmove(e) {
        var $target = $(e.target);
        if ($target.closest('.dropdown-content').length) {
          this.isTouchMoving = true;
        }
      }

      /**
       * Handle Dropdown Keydown
       * @param {Event} e
       */

    }, {
      key: "_handleDropdownKeydown",
      value: function _handleDropdownKeydown(e) {
        if (e.which === M.keys.TAB) {
          e.preventDefault();
          this.close();

          // Navigate down dropdown list
        } else if ((e.which === M.keys.ARROW_DOWN || e.which === M.keys.ARROW_UP) && this.isOpen) {
          e.preventDefault();
          var direction = e.which === M.keys.ARROW_DOWN ? 1 : -1;
          var newFocusedIndex = this.focusedIndex;
          var foundNewIndex = false;
          do {
            newFocusedIndex = newFocusedIndex + direction;

            if (!!this.dropdownEl.children[newFocusedIndex] && this.dropdownEl.children[newFocusedIndex].tabIndex !== -1) {
              foundNewIndex = true;
              break;
            }
          } while (newFocusedIndex < this.dropdownEl.children.length && newFocusedIndex >= 0);

          if (foundNewIndex) {
            this.focusedIndex = newFocusedIndex;
            this._focusFocusedItem();
          }

          // ENTER selects choice on focused item
        } else if (e.which === M.keys.ENTER && this.isOpen) {
          // Search for <a> and <button>
          var focusedElement = this.dropdownEl.children[this.focusedIndex];
          var $activatableElement = $(focusedElement).find('a, button').first();

          // Click a or button tag if exists, otherwise click li tag
          !!$activatableElement.length ? $activatableElement[0].click() : focusedElement.click();

          // Close dropdown on ESC
        } else if (e.which === M.keys.ESC && this.isOpen) {
          e.preventDefault();
          this.close();
        }

        // CASE WHEN USER TYPE LETTERS
        var letter = String.fromCharCode(e.which).toLowerCase(),
            nonLetters = [9, 13, 27, 38, 40];
        if (letter && nonLetters.indexOf(e.which) === -1) {
          this.filterQuery.push(letter);

          var string = this.filterQuery.join(''),
              newOptionEl = $(this.dropdownEl).find('li').filter(function (el) {
            return $(el).text().toLowerCase().indexOf(string) === 0;
          })[0];

          if (newOptionEl) {
            this.focusedIndex = $(newOptionEl).index();
            this._focusFocusedItem();
          }
        }

        this.filterTimeout = setTimeout(this._resetFilterQueryBound, 1000);
      }

      /**
       * Setup dropdown
       */

    }, {
      key: "_resetFilterQuery",
      value: function _resetFilterQuery() {
        this.filterQuery = [];
      }
    }, {
      key: "_resetDropdownStyles",
      value: function _resetDropdownStyles() {
        this.$dropdownEl.css({
          display: '',
          width: '',
          height: '',
          left: '',
          top: '',
          'transform-origin': '',
          transform: '',
          opacity: ''
        });
      }
    }, {
      key: "_makeDropdownFocusable",
      value: function _makeDropdownFocusable() {
        // Needed for arrow key navigation
        this.dropdownEl.tabIndex = 0;

        // Only set tabindex if it hasn't been set by user
        $(this.dropdownEl).children().each(function (el) {
          if (!el.getAttribute('tabindex')) {
            el.setAttribute('tabindex', 0);
          }
        });
      }
    }, {
      key: "_focusFocusedItem",
      value: function _focusFocusedItem() {
        if (this.focusedIndex >= 0 && this.focusedIndex < this.dropdownEl.children.length && this.options.autoFocus) {
          this.dropdownEl.children[this.focusedIndex].focus();
        }
      }
    }, {
      key: "_getDropdownPosition",
      value: function _getDropdownPosition() {
        var offsetParentBRect = this.el.offsetParent.getBoundingClientRect();
        var triggerBRect = this.el.getBoundingClientRect();
        var dropdownBRect = this.dropdownEl.getBoundingClientRect();

        var idealHeight = dropdownBRect.height;
        var idealWidth = dropdownBRect.width;
        var idealXPos = triggerBRect.left - dropdownBRect.left;
        var idealYPos = triggerBRect.top - dropdownBRect.top;

        var dropdownBounds = {
          left: idealXPos,
          top: idealYPos,
          height: idealHeight,
          width: idealWidth
        };

        // Countainer here will be closest ancestor with overflow: hidden
        var closestOverflowParent = this.dropdownEl.offsetParent;
        var alignments = M.checkPossibleAlignments(this.el, closestOverflowParent, dropdownBounds, this.options.coverTrigger ? 0 : triggerBRect.height);

        var verticalAlignment = 'top';
        var horizontalAlignment = this.options.alignment;
        idealYPos += this.options.coverTrigger ? 0 : triggerBRect.height;

        // Reset isScrollable
        this.isScrollable = false;

        if (!alignments.top) {
          if (alignments.bottom) {
            verticalAlignment = 'bottom';
          } else {
            this.isScrollable = true;

            // Determine which side has most space and cutoff at correct height
            if (alignments.spaceOnTop > alignments.spaceOnBottom) {
              verticalAlignment = 'bottom';
              idealHeight += alignments.spaceOnTop;
              idealYPos -= alignments.spaceOnTop;
            } else {
              idealHeight += alignments.spaceOnBottom;
            }
          }
        }

        // If preferred horizontal alignment is possible
        if (!alignments[horizontalAlignment]) {
          var oppositeAlignment = horizontalAlignment === 'left' ? 'right' : 'left';
          if (alignments[oppositeAlignment]) {
            horizontalAlignment = oppositeAlignment;
          } else {
            // Determine which side has most space and cutoff at correct height
            if (alignments.spaceOnLeft > alignments.spaceOnRight) {
              horizontalAlignment = 'right';
              idealWidth += alignments.spaceOnLeft;
              idealXPos -= alignments.spaceOnLeft;
            } else {
              horizontalAlignment = 'left';
              idealWidth += alignments.spaceOnRight;
            }
          }
        }

        if (verticalAlignment === 'bottom') {
          idealYPos = idealYPos - dropdownBRect.height + (this.options.coverTrigger ? triggerBRect.height : 0);
        }
        if (horizontalAlignment === 'right') {
          idealXPos = idealXPos - dropdownBRect.width + triggerBRect.width;
        }
        return {
          x: idealXPos,
          y: idealYPos,
          verticalAlignment: verticalAlignment,
          horizontalAlignment: horizontalAlignment,
          height: idealHeight,
          width: idealWidth
        };
      }

      /**
       * Animate in dropdown
       */

    }, {
      key: "_animateIn",
      value: function _animateIn() {
        var _this10 = this;

        anim.remove(this.dropdownEl);
        anim({
          targets: this.dropdownEl,
          opacity: {
            value: [0, 1],
            easing: 'easeOutQuad'
          },
          scaleX: [.3, 1],
          scaleY: [.3, 1],
          duration: this.options.inDuration,
          easing: 'easeOutQuint',
          complete: function (anim) {
            if (_this10.options.autoFocus) {
              _this10.dropdownEl.focus();
            }

            // onOpenEnd callback
            if (typeof _this10.options.onOpenEnd === 'function') {
              var elem = anim.animatables[0].target;
              _this10.options.onOpenEnd.call(elem, _this10.el);
            }
          }
        });
      }

      /**
       * Animate out dropdown
       */

    }, {
      key: "_animateOut",
      value: function _animateOut() {
        var _this11 = this;

        anim.remove(this.dropdownEl);
        anim({
          targets: this.dropdownEl,
          opacity: {
            value: 0,
            easing: 'easeOutQuint'
          },
          scaleX: .3,
          scaleY: .3,
          duration: this.options.outDuration,
          easing: 'easeOutQuint',
          complete: function (anim) {
            _this11._resetDropdownStyles();

            // onCloseEnd callback
            if (typeof _this11.options.onCloseEnd === 'function') {
              var elem = anim.animatables[0].target;
              _this11.options.onCloseEnd.call(_this11, _this11.el);
            }
          }
        });
      }

      /**
       * Place dropdown
       */

    }, {
      key: "_placeDropdown",
      value: function _placeDropdown() {
        // Set width before calculating positionInfo
        var idealWidth = this.options.constrainWidth ? this.el.getBoundingClientRect().width : this.dropdownEl.getBoundingClientRect().width;
        this.dropdownEl.style.width = idealWidth + 'px';

        var positionInfo = this._getDropdownPosition();
        this.dropdownEl.style.left = positionInfo.x + 'px';
        this.dropdownEl.style.top = positionInfo.y + 'px';
        this.dropdownEl.style.height = positionInfo.height + 'px';
        this.dropdownEl.style.width = positionInfo.width + 'px';
        this.dropdownEl.style.transformOrigin = (positionInfo.horizontalAlignment === 'left' ? '0' : '100%') + " " + (positionInfo.verticalAlignment === 'top' ? '0' : '100%');
      }

      /**
       * Open Dropdown
       */

    }, {
      key: "open",
      value: function open() {
        if (this.isOpen) {
          return;
        }
        this.isOpen = true;

        // onOpenStart callback
        if (typeof this.options.onOpenStart === 'function') {
          this.options.onOpenStart.call(this, this.el);
        }

        // Reset styles
        this._resetDropdownStyles();
        this.dropdownEl.style.display = 'block';

        this._placeDropdown();
        this._animateIn();
        this._setupTemporaryEventHandlers();
      }

      /**
       * Close Dropdown
       */

    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }
        this.isOpen = false;
        this.focusedIndex = -1;

        // onCloseStart callback
        if (typeof this.options.onCloseStart === 'function') {
          this.options.onCloseStart.call(this, this.el);
        }

        this._animateOut();
        this._removeTemporaryEventHandlers();

        if (this.options.autoFocus) {
          this.el.focus();
        }
      }

      /**
       * Recalculate dimensions
       */

    }, {
      key: "recalculateDimensions",
      value: function recalculateDimensions() {
        if (this.isOpen) {
          this.$dropdownEl.css({
            width: '',
            height: '',
            left: '',
            top: '',
            'transform-origin': ''
          });
          this._placeDropdown();
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Dropdown.__proto__ || Object.getPrototypeOf(Dropdown), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Dropdown;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Dropdown;
  }(Component);

  /**
   * @static
   * @memberof Dropdown
   */


  Dropdown._dropdowns = [];

  window.M.Dropdown = Dropdown;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Dropdown, 'dropdown', 'M_Dropdown');
  }
})(cash, M.anime);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    opacity: 0.5,
    inDuration: 250,
    outDuration: 250,
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null,
    preventScrolling: true,
    dismissible: true,
    startingTop: '4%',
    endingTop: '10%'
  };

  /**
   * @class
   *
   */

  var Modal = function (_Component3) {
    _inherits(Modal, _Component3);

    /**
     * Construct Modal instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Modal(el, options) {
      _classCallCheck(this, Modal);

      var _this12 = _possibleConstructorReturn(this, (Modal.__proto__ || Object.getPrototypeOf(Modal)).call(this, Modal, el, options));

      _this12.el.M_Modal = _this12;

      /**
       * Options for the modal
       * @member Modal#options
       * @prop {Number} [opacity=0.5] - Opacity of the modal overlay
       * @prop {Number} [inDuration=250] - Length in ms of enter transition
       * @prop {Number} [outDuration=250] - Length in ms of exit transition
       * @prop {Function} onOpenStart - Callback function called before modal is opened
       * @prop {Function} onOpenEnd - Callback function called after modal is opened
       * @prop {Function} onCloseStart - Callback function called before modal is closed
       * @prop {Function} onCloseEnd - Callback function called after modal is closed
       * @prop {Boolean} [dismissible=true] - Allow modal to be dismissed by keyboard or overlay click
       * @prop {String} [startingTop='4%'] - startingTop
       * @prop {String} [endingTop='10%'] - endingTop
       */
      _this12.options = $.extend({}, Modal.defaults, options);

      /**
       * Describes open/close state of modal
       * @type {Boolean}
       */
      _this12.isOpen = false;

      _this12.id = _this12.$el.attr('id');
      _this12._openingTrigger = undefined;
      _this12.$overlay = $('<div class="modal-overlay"></div>');
      _this12.el.tabIndex = 0;

      Modal._count++;
      _this12._setupEventHandlers();
      return _this12;
    }

    _createClass(Modal, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        Modal._count--;
        this._removeEventHandlers();
        this.el.removeAttribute('style');
        this.$overlay.remove();
        this.el.M_Modal = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleOverlayClickBound = this._handleOverlayClick.bind(this);
        this._handleModalCloseClickBound = this._handleModalCloseClick.bind(this);

        if (Modal._count === 1) {
          document.body.addEventListener('click', this._handleTriggerClick);
        }
        this.$overlay[0].addEventListener('click', this._handleOverlayClickBound);
        this.el.addEventListener('click', this._handleModalCloseClickBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        if (Modal._count === 0) {
          document.body.removeEventListener('click', this._handleTriggerClick);
        }
        this.$overlay[0].removeEventListener('click', this._handleOverlayClickBound);
        this.el.removeEventListener('click', this._handleModalCloseClickBound);
      }

      /**
       * Handle Trigger Click
       * @param {Event} e
       */

    }, {
      key: "_handleTriggerClick",
      value: function _handleTriggerClick(e) {
        var $trigger = $(e.target).closest('.modal-trigger');
        if ($trigger.length) {
          var modalId = M.getIdFromTrigger($trigger[0]);
          var modalInstance = document.getElementById(modalId).M_Modal;
          if (modalInstance) {
            modalInstance.open($trigger);
          }
          e.preventDefault();
        }
      }

      /**
       * Handle Overlay Click
       */

    }, {
      key: "_handleOverlayClick",
      value: function _handleOverlayClick() {
        if (this.options.dismissible) {
          this.close();
        }
      }

      /**
       * Handle Modal Close Click
       * @param {Event} e
       */

    }, {
      key: "_handleModalCloseClick",
      value: function _handleModalCloseClick(e) {
        var $closeTrigger = $(e.target).closest('.modal-close');
        if ($closeTrigger.length) {
          this.close();
        }
      }

      /**
       * Handle Keydown
       * @param {Event} e
       */

    }, {
      key: "_handleKeydown",
      value: function _handleKeydown(e) {
        // ESC key
        if (e.keyCode === 27 && this.options.dismissible) {
          this.close();
        }
      }

      /**
       * Handle Focus
       * @param {Event} e
       */

    }, {
      key: "_handleFocus",
      value: function _handleFocus(e) {
        if (!this.el.contains(e.target)) {
          this.el.focus();
        }
      }

      /**
       * Animate in modal
       */

    }, {
      key: "_animateIn",
      value: function _animateIn() {
        var _this13 = this;

        // Set initial styles
        $.extend(this.el.style, {
          display: 'block',
          opacity: 0
        });
        $.extend(this.$overlay[0].style, {
          display: 'block',
          opacity: 0
        });

        // Animate overlay
        anim({
          targets: this.$overlay[0],
          opacity: this.options.opacity,
          duration: this.options.inDuration,
          easing: 'easeOutQuad'
        });

        // Define modal animation options
        var enterAnimOptions = {
          targets: this.el,
          duration: this.options.inDuration,
          easing: 'easeOutCubic',
          // Handle modal onOpenEnd callback
          complete: function () {
            if (typeof _this13.options.onOpenEnd === 'function') {
              _this13.options.onOpenEnd.call(_this13, _this13.el, _this13._openingTrigger);
            }
          }
        };

        // Bottom sheet animation
        if (this.el.classList.contains('bottom-sheet')) {
          $.extend(enterAnimOptions, {
            bottom: 0,
            opacity: 1
          });
          anim(enterAnimOptions);

          // Normal modal animation
        } else {
          $.extend(enterAnimOptions, {
            top: [this.options.startingTop, this.options.endingTop],
            opacity: 1,
            scaleX: [.8, 1],
            scaleY: [.8, 1]
          });
          anim(enterAnimOptions);
        }
      }

      /**
       * Animate out modal
       */

    }, {
      key: "_animateOut",
      value: function _animateOut() {
        var _this14 = this;

        // Animate overlay
        anim({
          targets: this.$overlay[0],
          opacity: 0,
          duration: this.options.outDuration,
          easing: 'easeOutQuart'
        });

        // Define modal animation options
        var exitAnimOptions = {
          targets: this.el,
          duration: this.options.outDuration,
          easing: 'easeOutCubic',
          // Handle modal ready callback
          complete: function () {
            _this14.el.style.display = 'none';
            _this14.$overlay.remove();

            // Call onCloseEnd callback
            if (typeof _this14.options.onCloseEnd === 'function') {
              _this14.options.onCloseEnd.call(_this14, _this14.el);
            }
          }
        };

        // Bottom sheet animation
        if (this.el.classList.contains('bottom-sheet')) {
          $.extend(exitAnimOptions, {
            bottom: '-100%',
            opacity: 0
          });
          anim(exitAnimOptions);

          // Normal modal animation
        } else {
          $.extend(exitAnimOptions, {
            top: [this.options.endingTop, this.options.startingTop],
            opacity: 0,
            scaleX: 0.8,
            scaleY: 0.8
          });
          anim(exitAnimOptions);
        }
      }

      /**
       * Open Modal
       * @param {cash} [$trigger]
       */

    }, {
      key: "open",
      value: function open($trigger) {
        if (this.isOpen) {
          return;
        }

        this.isOpen = true;
        Modal._modalsOpen++;

        // Set Z-Index based on number of currently open modals
        this.$overlay[0].style.zIndex = 1000 + Modal._modalsOpen * 2;
        this.el.style.zIndex = 1000 + Modal._modalsOpen * 2 + 1;

        // Set opening trigger, undefined indicates modal was opened by javascript
        this._openingTrigger = !!$trigger ? $trigger[0] : undefined;

        // onOpenStart callback
        if (typeof this.options.onOpenStart === 'function') {
          this.options.onOpenStart.call(this, this.el, this._openingTrigger);
        }

        if (this.options.preventScrolling) {
          document.body.style.overflow = 'hidden';
        }

        this.el.classList.add('open');
        this.el.insertAdjacentElement('afterend', this.$overlay[0]);

        if (this.options.dismissible) {
          this._handleKeydownBound = this._handleKeydown.bind(this);
          this._handleFocusBound = this._handleFocus.bind(this);
          document.addEventListener('keydown', this._handleKeydownBound);
          document.addEventListener('focus', this._handleFocusBound, true);
        }

        anim.remove(this.el);
        anim.remove(this.$overlay[0]);
        this._animateIn();

        // Focus modal
        this.el.focus();

        return this;
      }

      /**
       * Close Modal
       */

    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        this.isOpen = false;
        Modal._modalsOpen--;

        // Call onCloseStart callback
        if (typeof this.options.onCloseStart === 'function') {
          this.options.onCloseStart.call(this, this.el);
        }

        this.el.classList.remove('open');

        // Enable body scrolling only if there are no more modals open.
        if (Modal._modalsOpen === 0) {
          document.body.style.overflow = '';
        }

        if (this.options.dismissible) {
          document.removeEventListener('keydown', this._handleKeydownBound);
          document.removeEventListener('focus', this._handleFocusBound);
        }

        anim.remove(this.el);
        anim.remove(this.$overlay[0]);
        this._animateOut();
        return this;
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Modal.__proto__ || Object.getPrototypeOf(Modal), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Modal;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Modal;
  }(Component);

  /**
   * @static
   * @memberof Modal
   */


  Modal._modalsOpen = 0;

  /**
   * @static
   * @memberof Modal
   */
  Modal._count = 0;

  M.Modal = Modal;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Modal, 'modal', 'M_Modal');
  }
})(cash, M.anime);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    inDuration: 275,
    outDuration: 200,
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null
  };

  /**
   * @class
   *
   */

  var Materialbox = function (_Component4) {
    _inherits(Materialbox, _Component4);

    /**
     * Construct Materialbox instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Materialbox(el, options) {
      _classCallCheck(this, Materialbox);

      var _this15 = _possibleConstructorReturn(this, (Materialbox.__proto__ || Object.getPrototypeOf(Materialbox)).call(this, Materialbox, el, options));

      _this15.el.M_Materialbox = _this15;

      /**
       * Options for the modal
       * @member Materialbox#options
       * @prop {Number} [inDuration=275] - Length in ms of enter transition
       * @prop {Number} [outDuration=200] - Length in ms of exit transition
       * @prop {Function} onOpenStart - Callback function called before materialbox is opened
       * @prop {Function} onOpenEnd - Callback function called after materialbox is opened
       * @prop {Function} onCloseStart - Callback function called before materialbox is closed
       * @prop {Function} onCloseEnd - Callback function called after materialbox is closed
       */
      _this15.options = $.extend({}, Materialbox.defaults, options);

      _this15.overlayActive = false;
      _this15.doneAnimating = true;
      _this15.placeholder = $('<div></div>').addClass('material-placeholder');
      _this15.originalWidth = 0;
      _this15.originalHeight = 0;
      _this15.originInlineStyles = _this15.$el.attr('style');
      _this15.caption = _this15.el.getAttribute('data-caption') || "";

      // Wrap
      _this15.$el.before(_this15.placeholder);
      _this15.placeholder.append(_this15.$el);

      _this15._setupEventHandlers();
      return _this15;
    }

    _createClass(Materialbox, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.M_Materialbox = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleMaterialboxClickBound = this._handleMaterialboxClick.bind(this);
        this.el.addEventListener('click', this._handleMaterialboxClickBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('click', this._handleMaterialboxClickBound);
      }

      /**
       * Handle Materialbox Click
       * @param {Event} e
       */

    }, {
      key: "_handleMaterialboxClick",
      value: function _handleMaterialboxClick(e) {
        // If already modal, return to original
        if (this.doneAnimating === false || this.overlayActive && this.doneAnimating) {
          this.close();
        } else {
          this.open();
        }
      }

      /**
       * Handle Window Scroll
       */

    }, {
      key: "_handleWindowScroll",
      value: function _handleWindowScroll() {
        if (this.overlayActive) {
          this.close();
        }
      }

      /**
       * Handle Window Resize
       */

    }, {
      key: "_handleWindowResize",
      value: function _handleWindowResize() {
        if (this.overlayActive) {
          this.close();
        }
      }

      /**
       * Handle Window Resize
       * @param {Event} e
       */

    }, {
      key: "_handleWindowEscape",
      value: function _handleWindowEscape(e) {
        // ESC key
        if (e.keyCode === 27 && this.doneAnimating && this.overlayActive) {
          this.close();
        }
      }

      /**
       * Find ancestors with overflow: hidden; and make visible
       */

    }, {
      key: "_makeAncestorsOverflowVisible",
      value: function _makeAncestorsOverflowVisible() {
        this.ancestorsChanged = $();
        var ancestor = this.placeholder[0].parentNode;
        while (ancestor !== null && !$(ancestor).is(document)) {
          var curr = $(ancestor);
          if (curr.css('overflow') !== 'visible') {
            curr.css('overflow', 'visible');
            if (this.ancestorsChanged === undefined) {
              this.ancestorsChanged = curr;
            } else {
              this.ancestorsChanged = this.ancestorsChanged.add(curr);
            }
          }
          ancestor = ancestor.parentNode;
        }
      }

      /**
       * Animate image in
       */

    }, {
      key: "_animateImageIn",
      value: function _animateImageIn() {
        var _this16 = this;

        var animOptions = {
          targets: this.el,
          height: [this.originalHeight, this.newHeight],
          width: [this.originalWidth, this.newWidth],
          left: M.getDocumentScrollLeft() + this.windowWidth / 2 - this.placeholder.offset().left - this.newWidth / 2,
          top: M.getDocumentScrollTop() + this.windowHeight / 2 - this.placeholder.offset().top - this.newHeight / 2,
          duration: this.options.inDuration,
          easing: 'easeOutQuad',
          complete: function () {
            _this16.doneAnimating = true;

            // onOpenEnd callback
            if (typeof _this16.options.onOpenEnd === 'function') {
              _this16.options.onOpenEnd.call(_this16, _this16.el);
            }
          }
        };

        // Override max-width or max-height if needed
        this.maxWidth = this.$el.css('max-width');
        this.maxHeight = this.$el.css('max-height');
        if (this.maxWidth !== 'none') {
          animOptions.maxWidth = this.newWidth;
        }
        if (this.maxHeight !== 'none') {
          animOptions.maxHeight = this.newHeight;
        }

        anim(animOptions);
      }

      /**
       * Animate image out
       */

    }, {
      key: "_animateImageOut",
      value: function _animateImageOut() {
        var _this17 = this;

        var animOptions = {
          targets: this.el,
          width: this.originalWidth,
          height: this.originalHeight,
          left: 0,
          top: 0,
          duration: this.options.outDuration,
          easing: 'easeOutQuad',
          complete: function () {
            _this17.placeholder.css({
              height: '',
              width: '',
              position: '',
              top: '',
              left: ''
            });

            // Revert to width or height attribute
            if (_this17.attrWidth) {
              _this17.$el.attr('width', _this17.attrWidth);
            }
            if (_this17.attrHeight) {
              _this17.$el.attr('height', _this17.attrHeight);
            }

            _this17.$el.removeAttr('style');
            _this17.$el.attr('style', _this17.originInlineStyles);

            // Remove class
            _this17.$el.removeClass('active');
            _this17.doneAnimating = true;

            // Remove overflow overrides on ancestors
            if (_this17.ancestorsChanged.length) {
              _this17.ancestorsChanged.css('overflow', '');
            }

            // onCloseEnd callback
            if (typeof _this17.options.onCloseEnd === 'function') {
              _this17.options.onCloseEnd.call(_this17, _this17.el);
            }
          }
        };

        anim(animOptions);
      }

      /**
       * Update open and close vars
       */

    }, {
      key: "_updateVars",
      value: function _updateVars() {
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        this.caption = this.el.getAttribute('data-caption') || "";
      }

      /**
       * Open Materialbox
       */

    }, {
      key: "open",
      value: function open() {
        var _this18 = this;

        this._updateVars();
        this.originalWidth = this.el.getBoundingClientRect().width;
        this.originalHeight = this.el.getBoundingClientRect().height;

        // Set states
        this.doneAnimating = false;
        this.$el.addClass('active');
        this.overlayActive = true;

        // onOpenStart callback
        if (typeof this.options.onOpenStart === 'function') {
          this.options.onOpenStart.call(this, this.el);
        }

        // Set positioning for placeholder
        this.placeholder.css({
          width: this.placeholder[0].getBoundingClientRect().width + 'px',
          height: this.placeholder[0].getBoundingClientRect().height + 'px',
          position: 'relative',
          top: 0,
          left: 0
        });

        this._makeAncestorsOverflowVisible();

        // Set css on origin
        this.$el.css({
          position: 'absolute',
          'z-index': 1000,
          'will-change': 'left, top, width, height'
        });

        // Change from width or height attribute to css
        this.attrWidth = this.$el.attr('width');
        this.attrHeight = this.$el.attr('height');
        if (this.attrWidth) {
          this.$el.css('width', this.attrWidth + 'px');
          this.$el.removeAttr('width');
        }
        if (this.attrHeight) {
          this.$el.css('width', this.attrHeight + 'px');
          this.$el.removeAttr('height');
        }

        // Add overlay
        this.$overlay = $('<div id="materialbox-overlay"></div>').css({
          opacity: 0
        }).one('click', function () {
          if (_this18.doneAnimating) {
            _this18.close();
          }
        });

        // Put before in origin image to preserve z-index layering.
        this.$el.before(this.$overlay);

        // Set dimensions if needed
        var overlayOffset = this.$overlay[0].getBoundingClientRect();
        this.$overlay.css({
          width: this.windowWidth + 'px',
          height: this.windowHeight + 'px',
          left: -1 * overlayOffset.left + 'px',
          top: -1 * overlayOffset.top + 'px'
        });

        anim.remove(this.el);
        anim.remove(this.$overlay[0]);

        // Animate Overlay
        anim({
          targets: this.$overlay[0],
          opacity: 1,
          duration: this.options.inDuration,
          easing: 'easeOutQuad'
        });

        // Add and animate caption if it exists
        if (this.caption !== "") {
          if (this.$photocaption) {
            anim.remove(this.$photoCaption[0]);
          }
          this.$photoCaption = $('<div class="materialbox-caption"></div>');
          this.$photoCaption.text(this.caption);
          $('body').append(this.$photoCaption);
          this.$photoCaption.css({ "display": "inline" });

          anim({
            targets: this.$photoCaption[0],
            opacity: 1,
            duration: this.options.inDuration,
            easing: 'easeOutQuad'
          });
        }

        // Resize Image
        var ratio = 0;
        var widthPercent = this.originalWidth / this.windowWidth;
        var heightPercent = this.originalHeight / this.windowHeight;
        this.newWidth = 0;
        this.newHeight = 0;

        if (widthPercent > heightPercent) {
          ratio = this.originalHeight / this.originalWidth;
          this.newWidth = this.windowWidth * 0.9;
          this.newHeight = this.windowWidth * 0.9 * ratio;
        } else {
          ratio = this.originalWidth / this.originalHeight;
          this.newWidth = this.windowHeight * 0.9 * ratio;
          this.newHeight = this.windowHeight * 0.9;
        }

        this._animateImageIn();

        // Handle Exit triggers
        this._handleWindowScrollBound = this._handleWindowScroll.bind(this);
        this._handleWindowResizeBound = this._handleWindowResize.bind(this);
        this._handleWindowEscapeBound = this._handleWindowEscape.bind(this);

        window.addEventListener('scroll', this._handleWindowScrollBound);
        window.addEventListener('resize', this._handleWindowResizeBound);
        window.addEventListener('keyup', this._handleWindowEscapeBound);
      }

      /**
       * Close Materialbox
       */

    }, {
      key: "close",
      value: function close() {
        var _this19 = this;

        this._updateVars();
        this.doneAnimating = false;

        // onCloseStart callback
        if (typeof this.options.onCloseStart === 'function') {
          this.options.onCloseStart.call(this, this.el);
        }

        anim.remove(this.el);
        anim.remove(this.$overlay[0]);

        if (this.caption !== "") {
          anim.remove(this.$photoCaption[0]);
        }

        // disable exit handlers
        window.removeEventListener('scroll', this._handleWindowScrollBound);
        window.removeEventListener('resize', this._handleWindowResizeBound);
        window.removeEventListener('keyup', this._handleWindowEscapeBound);

        anim({
          targets: this.$overlay[0],
          opacity: 0,
          duration: this.options.outDuration,
          easing: 'easeOutQuad',
          complete: function () {
            _this19.overlayActive = false;
            _this19.$overlay.remove();
          }
        });

        this._animateImageOut();

        // Remove Caption + reset css settings on image
        if (this.caption !== "") {
          anim({
            targets: this.$photoCaption[0],
            opacity: 0,
            duration: this.options.outDuration,
            easing: 'easeOutQuad',
            complete: function () {
              _this19.$photoCaption.remove();
            }
          });
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Materialbox.__proto__ || Object.getPrototypeOf(Materialbox), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Materialbox;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Materialbox;
  }(Component);

  M.Materialbox = Materialbox;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Materialbox, 'materialbox', 'M_Materialbox');
  }
})(cash, M.anime);
;(function ($) {
  'use strict';

  var _defaults = {
    responsiveThreshold: 0 // breakpoint for swipeable
  };

  var Parallax = function (_Component5) {
    _inherits(Parallax, _Component5);

    function Parallax(el, options) {
      _classCallCheck(this, Parallax);

      var _this20 = _possibleConstructorReturn(this, (Parallax.__proto__ || Object.getPrototypeOf(Parallax)).call(this, Parallax, el, options));

      _this20.el.M_Parallax = _this20;

      /**
       * Options for the Parallax
       * @member Parallax#options
       * @prop {Number} responsiveThreshold
       */
      _this20.options = $.extend({}, Parallax.defaults, options);
      _this20._enabled = window.innerWidth > _this20.options.responsiveThreshold;

      _this20.$img = _this20.$el.find('img').first();
      _this20.$img.each(function () {
        var el = this;
        if (el.complete) $(el).trigger("load");
      });

      _this20._updateParallax();
      _this20._setupEventHandlers();
      _this20._setupStyles();

      Parallax._parallaxes.push(_this20);
      return _this20;
    }

    _createClass(Parallax, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        Parallax._parallaxes.splice(Parallax._parallaxes.indexOf(this), 1);
        this.$img[0].style.transform = '';
        this._removeEventHandlers();

        this.$el[0].M_Parallax = undefined;
      }
    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleImageLoadBound = this._handleImageLoad.bind(this);
        this.$img[0].addEventListener('load', this._handleImageLoadBound);

        if (Parallax._parallaxes.length === 0) {
          Parallax._handleScrollThrottled = M.throttle(Parallax._handleScroll, 5);
          window.addEventListener('scroll', Parallax._handleScrollThrottled);

          Parallax._handleWindowResizeThrottled = M.throttle(Parallax._handleWindowResize, 5);
          window.addEventListener('resize', Parallax._handleWindowResizeThrottled);
        }
      }
    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.$img[0].removeEventListener('load', this._handleImageLoadBound);

        if (Parallax._parallaxes.length === 0) {
          window.removeEventListener('scroll', Parallax._handleScrollThrottled);
          window.removeEventListener('resize', Parallax._handleWindowResizeThrottled);
        }
      }
    }, {
      key: "_setupStyles",
      value: function _setupStyles() {
        this.$img[0].style.opacity = 1;
      }
    }, {
      key: "_handleImageLoad",
      value: function _handleImageLoad() {
        this._updateParallax();
      }
    }, {
      key: "_updateParallax",
      value: function _updateParallax() {
        var containerHeight = this.$el.height() > 0 ? this.el.parentNode.offsetHeight : 500;
        var imgHeight = this.$img[0].offsetHeight;
        var parallaxDist = imgHeight - containerHeight;
        var bottom = this.$el.offset().top + containerHeight;
        var top = this.$el.offset().top;
        var scrollTop = M.getDocumentScrollTop();
        var windowHeight = window.innerHeight;
        var windowBottom = scrollTop + windowHeight;
        var percentScrolled = (windowBottom - top) / (containerHeight + windowHeight);
        var parallax = parallaxDist * percentScrolled;

        if (!this._enabled) {
          this.$img[0].style.transform = '';
        } else if (bottom > scrollTop && top < scrollTop + windowHeight) {
          this.$img[0].style.transform = "translate3D(-50%, " + parallax + "px, 0)";
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Parallax.__proto__ || Object.getPrototypeOf(Parallax), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Parallax;
      }
    }, {
      key: "_handleScroll",
      value: function _handleScroll() {
        for (var i = 0; i < Parallax._parallaxes.length; i++) {
          var parallaxInstance = Parallax._parallaxes[i];
          parallaxInstance._updateParallax.call(parallaxInstance);
        }
      }
    }, {
      key: "_handleWindowResize",
      value: function _handleWindowResize() {
        for (var i = 0; i < Parallax._parallaxes.length; i++) {
          var parallaxInstance = Parallax._parallaxes[i];
          parallaxInstance._enabled = window.innerWidth > parallaxInstance.options.responsiveThreshold;
        }
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Parallax;
  }(Component);

  /**
   * @static
   * @memberof Parallax
   */


  Parallax._parallaxes = [];

  M.Parallax = Parallax;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Parallax, 'parallax', 'M_Parallax');
  }
})(cash);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    duration: 300,
    onShow: null,
    swipeable: false,
    responsiveThreshold: Infinity // breakpoint for swipeable
  };

  /**
   * @class
   *
   */

  var Tabs = function (_Component6) {
    _inherits(Tabs, _Component6);

    /**
     * Construct Tabs instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Tabs(el, options) {
      _classCallCheck(this, Tabs);

      var _this21 = _possibleConstructorReturn(this, (Tabs.__proto__ || Object.getPrototypeOf(Tabs)).call(this, Tabs, el, options));

      _this21.el.M_Tabs = _this21;

      /**
       * Options for the Tabs
       * @member Tabs#options
       * @prop {Number} duration
       * @prop {Function} onShow
       * @prop {Boolean} swipeable
       * @prop {Number} responsiveThreshold
       */
      _this21.options = $.extend({}, Tabs.defaults, options);

      // Setup
      _this21.$tabLinks = _this21.$el.children('li.tab').children('a');
      _this21.index = 0;
      _this21._setTabsAndTabWidth();
      _this21._setupActiveTabLink();
      _this21._createIndicator();

      if (_this21.options.swipeable) {
        _this21._setupSwipeableTabs();
      } else {
        _this21._setupNormalTabs();
      }

      _this21._setupEventHandlers();
      return _this21;
    }

    _createClass(Tabs, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this._indicator.parentNode.removeChild(this._indicator);

        if (this.options.swipeable) {
          this._teardownSwipeableTabs();
        } else {
          this._teardownNormalTabs();
        }

        this.$el[0].M_Tabs = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleWindowResizeBound = this._handleWindowResize.bind(this);
        window.addEventListener('resize', this._handleWindowResizeBound);

        this._handleTabClickBound = this._handleTabClick.bind(this);
        this.el.addEventListener('click', this._handleTabClickBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        window.removeEventListener('resize', this._handleWindowResizeBound);
        this.el.removeEventListener('click', this._handleTabClickBound);
      }

      /**
       * Handle window Resize
       */

    }, {
      key: "_handleWindowResize",
      value: function _handleWindowResize() {
        this._setTabsAndTabWidth();

        if (this.tabWidth !== 0 && this.tabsWidth !== 0) {
          this._indicator.style.left = this._calcLeftPos(this.$activeTabLink) + 'px';
          this._indicator.style.right = this._calcRightPos(this.$activeTabLink) + 'px';
        }
      }

      /**
       * Handle tab click
       * @param {Event} e
       */

    }, {
      key: "_handleTabClick",
      value: function _handleTabClick(e) {
        var _this22 = this;

        var tab = $(e.target).closest('li.tab');
        var tabLink = $(e.target).closest('a');

        // Handle click on tab link only
        if (!tabLink.length || !tabLink.parent().hasClass('tab')) {
          return;
        }

        if (tab.hasClass('disabled')) {
          e.preventDefault();
          return;
        }

        // Act as regular link if target attribute is specified.
        if (!!tabLink.attr("target")) {
          return;
        }

        this._setTabsAndTabWidth();

        // Make the old tab inactive.
        this.$activeTabLink.removeClass('active');
        var $oldContent = this.$content;

        // Update the variables with the new link and content
        this.$activeTabLink = tabLink;
        this.$content = $(M.escapeHash(tabLink[0].hash));
        this.$tabLinks = this.$el.children('li.tab').children('a');

        // Make the tab active.
        this.$activeTabLink.addClass('active');
        var prevIndex = this.index;
        this.index = Math.max(this.$tabLinks.index(tabLink), 0);

        // Swap content
        if (this.options.swipeable) {
          if (this._tabsCarousel) {
            this._tabsCarousel.set(this.index, function () {
              if (typeof _this22.options.onShow === "function") {
                _this22.options.onShow.call(_this22, _this22.$content[0]);
              }
            });
          }
        } else {
          if (this.$content.length) {
            this.$content[0].style.display = 'block';
            this.$content.addClass('active');
            if (typeof this.options.onShow === 'function') {
              this.options.onShow.call(this, this.$content[0]);
            }

            if ($oldContent.length && !$oldContent.is(this.$content)) {
              $oldContent[0].style.display = 'none';
              $oldContent.removeClass('active');
            }
          }
        }

        // Update indicator
        this._animateIndicator(prevIndex);

        // Prevent the anchor's default click action
        e.preventDefault();
      }

      /**
       * Generate elements for tab indicator.
       */

    }, {
      key: "_createIndicator",
      value: function _createIndicator() {
        var _this23 = this;

        var indicator = document.createElement('li');
        indicator.classList.add('indicator');

        this.el.appendChild(indicator);
        this._indicator = indicator;

        setTimeout(function () {
          _this23._indicator.style.left = _this23._calcLeftPos(_this23.$activeTabLink) + 'px';
          _this23._indicator.style.right = _this23._calcRightPos(_this23.$activeTabLink) + 'px';
        }, 0);
      }

      /**
       * Setup first active tab link.
       */

    }, {
      key: "_setupActiveTabLink",
      value: function _setupActiveTabLink() {
        // If the location.hash matches one of the links, use that as the active tab.
        this.$activeTabLink = $(this.$tabLinks.filter('[href="' + location.hash + '"]'));

        // If no match is found, use the first link or any with class 'active' as the initial active tab.
        if (this.$activeTabLink.length === 0) {
          this.$activeTabLink = this.$el.children('li.tab').children('a.active').first();
        }
        if (this.$activeTabLink.length === 0) {
          this.$activeTabLink = this.$el.children('li.tab').children('a').first();
        }

        this.$tabLinks.removeClass('active');
        this.$activeTabLink[0].classList.add('active');

        this.index = Math.max(this.$tabLinks.index(this.$activeTabLink), 0);

        if (this.$activeTabLink.length) {
          this.$content = $(M.escapeHash(this.$activeTabLink[0].hash));
          this.$content.addClass('active');
        }
      }

      /**
       * Setup swipeable tabs
       */

    }, {
      key: "_setupSwipeableTabs",
      value: function _setupSwipeableTabs() {
        var _this24 = this;

        // Change swipeable according to responsive threshold
        if (window.innerWidth > this.options.responsiveThreshold) {
          this.options.swipeable = false;
        }

        var $tabsContent = $();
        this.$tabLinks.each(function (link) {
          var $currContent = $(M.escapeHash(link.hash));
          $currContent.addClass('carousel-item');
          $tabsContent = $tabsContent.add($currContent);
        });

        var $tabsWrapper = $('<div class="tabs-content carousel carousel-slider"></div>');
        $tabsContent.first().before($tabsWrapper);
        $tabsWrapper.append($tabsContent);
        $tabsContent[0].style.display = '';

        // Keep active tab index to set initial carousel slide
        var activeTabIndex = this.$activeTabLink.closest('.tab').index();

        this._tabsCarousel = M.Carousel.init($tabsWrapper[0], {
          fullWidth: true,
          noWrap: true,
          onCycleTo: function (item) {
            var prevIndex = _this24.index;
            _this24.index = $(item).index();
            _this24.$activeTabLink.removeClass('active');
            _this24.$activeTabLink = _this24.$tabLinks.eq(_this24.index);
            _this24.$activeTabLink.addClass('active');
            _this24._animateIndicator(prevIndex);
            if (typeof _this24.options.onShow === "function") {
              _this24.options.onShow.call(_this24, _this24.$content[0]);
            }
          }
        });

        // Set initial carousel slide to active tab
        this._tabsCarousel.set(activeTabIndex);
      }

      /**
       * Teardown normal tabs.
       */

    }, {
      key: "_teardownSwipeableTabs",
      value: function _teardownSwipeableTabs() {
        var $tabsWrapper = this._tabsCarousel.$el;
        this._tabsCarousel.destroy();

        // Unwrap
        $tabsWrapper.after($tabsWrapper.children());
        $tabsWrapper.remove();
      }

      /**
       * Setup normal tabs.
       */

    }, {
      key: "_setupNormalTabs",
      value: function _setupNormalTabs() {
        // Hide Tabs Content
        this.$tabLinks.not(this.$activeTabLink).each(function (link) {
          if (!!link.hash) {
            var $currContent = $(M.escapeHash(link.hash));
            if ($currContent.length) {
              $currContent[0].style.display = 'none';
            }
          }
        });
      }

      /**
       * Teardown normal tabs.
       */

    }, {
      key: "_teardownNormalTabs",
      value: function _teardownNormalTabs() {
        // show Tabs Content
        this.$tabLinks.each(function (link) {
          if (!!link.hash) {
            var $currContent = $(M.escapeHash(link.hash));
            if ($currContent.length) {
              $currContent[0].style.display = '';
            }
          }
        });
      }

      /**
       * set tabs and tab width
       */

    }, {
      key: "_setTabsAndTabWidth",
      value: function _setTabsAndTabWidth() {
        this.tabsWidth = this.$el.width();
        this.tabWidth = Math.max(this.tabsWidth, this.el.scrollWidth) / this.$tabLinks.length;
      }

      /**
       * Finds right attribute for indicator based on active tab.
       * @param {cash} el
       */

    }, {
      key: "_calcRightPos",
      value: function _calcRightPos(el) {
        return Math.ceil(this.tabsWidth - el.position().left - el[0].getBoundingClientRect().width);
      }

      /**
       * Finds left attribute for indicator based on active tab.
       * @param {cash} el
       */

    }, {
      key: "_calcLeftPos",
      value: function _calcLeftPos(el) {
        return Math.floor(el.position().left);
      }
    }, {
      key: "updateTabIndicator",
      value: function updateTabIndicator() {
        this._animateIndicator(this.index);
      }

      /**
       * Animates Indicator to active tab.
       * @param {Number} prevIndex
       */

    }, {
      key: "_animateIndicator",
      value: function _animateIndicator(prevIndex) {
        var leftDelay = 0,
            rightDelay = 0;

        if (this.index - prevIndex >= 0) {
          leftDelay = 90;
        } else {
          rightDelay = 90;
        }

        // Animate
        var animOptions = {
          targets: this._indicator,
          left: {
            value: this._calcLeftPos(this.$activeTabLink),
            delay: leftDelay
          },
          right: {
            value: this._calcRightPos(this.$activeTabLink),
            delay: rightDelay
          },
          duration: this.options.duration,
          easing: 'easeOutQuad'
        };
        anim.remove(this._indicator);
        anim(animOptions);
      }

      /**
       * Select tab.
       * @param {String} tabId
       */

    }, {
      key: "select",
      value: function select(tabId) {
        var tab = this.$tabLinks.filter('[href="#' + tabId + '"]');
        if (tab.length) {
          tab.trigger('click');
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Tabs.__proto__ || Object.getPrototypeOf(Tabs), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Tabs;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Tabs;
  }(Component);

  window.M.Tabs = Tabs;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Tabs, 'tabs', 'M_Tabs');
  }
})(cash, M.anime);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    exitDelay: 200,
    enterDelay: 0,
    html: null,
    margin: 5,
    inDuration: 250,
    outDuration: 200,
    position: 'bottom',
    transitionMovement: 10
  };

  /**
   * @class
   *
   */

  var Tooltip = function (_Component7) {
    _inherits(Tooltip, _Component7);

    /**
     * Construct Tooltip instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Tooltip(el, options) {
      _classCallCheck(this, Tooltip);

      var _this25 = _possibleConstructorReturn(this, (Tooltip.__proto__ || Object.getPrototypeOf(Tooltip)).call(this, Tooltip, el, options));

      _this25.el.M_Tooltip = _this25;
      _this25.options = $.extend({}, Tooltip.defaults, options);

      _this25.isOpen = false;
      _this25.isHovered = false;
      _this25.isFocused = false;
      _this25._appendTooltipEl();
      _this25._setupEventHandlers();
      return _this25;
    }

    _createClass(Tooltip, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        $(this.tooltipEl).remove();
        this._removeEventHandlers();
        this.el.M_Tooltip = undefined;
      }
    }, {
      key: "_appendTooltipEl",
      value: function _appendTooltipEl() {
        var tooltipEl = document.createElement('div');
        tooltipEl.classList.add('material-tooltip');
        this.tooltipEl = tooltipEl;

        var tooltipContentEl = document.createElement('div');
        tooltipContentEl.classList.add('tooltip-content');
        tooltipContentEl.innerHTML = this.options.html;
        tooltipEl.appendChild(tooltipContentEl);
        document.body.appendChild(tooltipEl);
      }
    }, {
      key: "_updateTooltipContent",
      value: function _updateTooltipContent() {
        this.tooltipEl.querySelector('.tooltip-content').innerHTML = this.options.html;
      }
    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleMouseEnterBound = this._handleMouseEnter.bind(this);
        this._handleMouseLeaveBound = this._handleMouseLeave.bind(this);
        this._handleFocusBound = this._handleFocus.bind(this);
        this._handleBlurBound = this._handleBlur.bind(this);
        this.el.addEventListener('mouseenter', this._handleMouseEnterBound);
        this.el.addEventListener('mouseleave', this._handleMouseLeaveBound);
        this.el.addEventListener('focus', this._handleFocusBound, true);
        this.el.addEventListener('blur', this._handleBlurBound, true);
      }
    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('mouseenter', this._handleMouseEnterBound);
        this.el.removeEventListener('mouseleave', this._handleMouseLeaveBound);
        this.el.removeEventListener('focus', this._handleFocusBound, true);
        this.el.removeEventListener('blur', this._handleBlurBound, true);
      }
    }, {
      key: "open",
      value: function open() {
        if (this.isOpen) {
          return;
        }

        this.isOpen = true;
        // Update tooltip content with HTML attribute options
        this.options = $.extend({}, this.options, this._getAttributeOptions());
        this._updateTooltipContent();
        this._setEnterDelayTimeout();
      }
    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        this.isOpen = false;
        this._setExitDelayTimeout();
      }

      /**
       * Create timeout which delays when the tooltip closes
       */

    }, {
      key: "_setExitDelayTimeout",
      value: function _setExitDelayTimeout() {
        var _this26 = this;

        clearTimeout(this._exitDelayTimeout);

        this._exitDelayTimeout = setTimeout(function () {
          if (_this26.isHovered || _this26.isFocused) {
            return;
          }

          _this26._animateOut();
        }, this.options.exitDelay);
      }

      /**
       * Create timeout which delays when the toast closes
       */

    }, {
      key: "_setEnterDelayTimeout",
      value: function _setEnterDelayTimeout() {
        var _this27 = this;

        clearTimeout(this._enterDelayTimeout);

        this._enterDelayTimeout = setTimeout(function () {
          if (!_this27.isHovered && !_this27.isFocused) {
            return;
          }

          _this27._animateIn();
        }, this.options.enterDelay);
      }
    }, {
      key: "_positionTooltip",
      value: function _positionTooltip() {
        var origin = this.el,
            tooltip = this.tooltipEl,
            originHeight = origin.offsetHeight,
            originWidth = origin.offsetWidth,
            tooltipHeight = tooltip.offsetHeight,
            tooltipWidth = tooltip.offsetWidth,
            newCoordinates = void 0,
            margin = this.options.margin,
            targetTop = void 0,
            targetLeft = void 0;

        this.xMovement = 0, this.yMovement = 0;

        targetTop = origin.getBoundingClientRect().top + M.getDocumentScrollTop();
        targetLeft = origin.getBoundingClientRect().left + M.getDocumentScrollLeft();

        if (this.options.position === 'top') {
          targetTop += -tooltipHeight - margin;
          targetLeft += originWidth / 2 - tooltipWidth / 2;
          this.yMovement = -this.options.transitionMovement;
        } else if (this.options.position === 'right') {
          targetTop += originHeight / 2 - tooltipHeight / 2;
          targetLeft += originWidth + margin;
          this.xMovement = this.options.transitionMovement;
        } else if (this.options.position === 'left') {
          targetTop += originHeight / 2 - tooltipHeight / 2;
          targetLeft += -tooltipWidth - margin;
          this.xMovement = -this.options.transitionMovement;
        } else {
          targetTop += originHeight + margin;
          targetLeft += originWidth / 2 - tooltipWidth / 2;
          this.yMovement = this.options.transitionMovement;
        }

        newCoordinates = this._repositionWithinScreen(targetLeft, targetTop, tooltipWidth, tooltipHeight);
        $(tooltip).css({
          top: newCoordinates.y + 'px',
          left: newCoordinates.x + 'px'
        });
      }
    }, {
      key: "_repositionWithinScreen",
      value: function _repositionWithinScreen(x, y, width, height) {
        var scrollLeft = M.getDocumentScrollLeft();
        var scrollTop = M.getDocumentScrollTop();
        var newX = x - scrollLeft;
        var newY = y - scrollTop;

        var bounding = {
          left: newX,
          top: newY,
          width: width,
          height: height
        };

        var offset = this.options.margin + this.options.transitionMovement;
        var edges = M.checkWithinContainer(document.body, bounding, offset);

        if (edges.left) {
          newX = offset;
        } else if (edges.right) {
          newX -= newX + width - window.innerWidth;
        }

        if (edges.top) {
          newY = offset;
        } else if (edges.bottom) {
          newY -= newY + height - window.innerHeight;
        }

        return {
          x: newX + scrollLeft,
          y: newY + scrollTop
        };
      }
    }, {
      key: "_animateIn",
      value: function _animateIn() {
        this._positionTooltip();
        this.tooltipEl.style.visibility = 'visible';
        anim.remove(this.tooltipEl);
        anim({
          targets: this.tooltipEl,
          opacity: 1,
          translateX: this.xMovement,
          translateY: this.yMovement,
          duration: this.options.inDuration,
          easing: 'easeOutCubic'
        });
      }
    }, {
      key: "_animateOut",
      value: function _animateOut() {
        anim.remove(this.tooltipEl);
        anim({
          targets: this.tooltipEl,
          opacity: 0,
          translateX: 0,
          translateY: 0,
          duration: this.options.outDuration,
          easing: 'easeOutCubic'
        });
      }
    }, {
      key: "_handleMouseEnter",
      value: function _handleMouseEnter() {
        this.isHovered = true;
        this.open();
      }
    }, {
      key: "_handleMouseLeave",
      value: function _handleMouseLeave() {
        this.isHovered = false;
        this.close();
      }
    }, {
      key: "_handleFocus",
      value: function _handleFocus() {
        this.isFocused = true;
        this.open();
      }
    }, {
      key: "_handleBlur",
      value: function _handleBlur() {
        this.isFocused = false;
        this.close();
      }
    }, {
      key: "_getAttributeOptions",
      value: function _getAttributeOptions() {
        var attributeOptions = {};
        var tooltipTextOption = this.el.getAttribute('data-tooltip');
        var positionOption = this.el.getAttribute('data-position');

        if (tooltipTextOption) {
          attributeOptions.html = tooltipTextOption;
        }

        if (positionOption) {
          attributeOptions.position = positionOption;
        }
        return attributeOptions;
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Tooltip.__proto__ || Object.getPrototypeOf(Tooltip), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Tooltip;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Tooltip;
  }(Component);

  M.Tooltip = Tooltip;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Tooltip, 'tooltip', 'M_Tooltip');
  }
})(cash, M.anime);
; /*!
  * Waves v0.6.4
  * http://fian.my.id/Waves
  *
  * Copyright 2014 Alfiana E. Sibuea and other contributors
  * Released under the MIT license
  * https://github.com/fians/Waves/blob/master/LICENSE
  */

;(function (window) {
  'use strict';

  var Waves = Waves || {};
  var $$ = document.querySelectorAll.bind(document);

  // Find exact position of element
  function isWindow(obj) {
    return obj !== null && obj === obj.window;
  }

  function getWindow(elem) {
    return isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
  }

  function offset(elem) {
    var docElem,
        win,
        box = { top: 0, left: 0 },
        doc = elem && elem.ownerDocument;

    docElem = doc.documentElement;

    if (typeof elem.getBoundingClientRect !== typeof undefined) {
      box = elem.getBoundingClientRect();
    }
    win = getWindow(doc);
    return {
      top: box.top + win.pageYOffset - docElem.clientTop,
      left: box.left + win.pageXOffset - docElem.clientLeft
    };
  }

  function convertStyle(obj) {
    var style = '';

    for (var a in obj) {
      if (obj.hasOwnProperty(a)) {
        style += a + ':' + obj[a] + ';';
      }
    }

    return style;
  }

  var Effect = {

    // Effect delay
    duration: 750,

    show: function (e, element) {

      // Disable right click
      if (e.button === 2) {
        return false;
      }

      var el = element || this;

      // Create ripple
      var ripple = document.createElement('div');
      ripple.className = 'waves-ripple';
      el.appendChild(ripple);

      // Get click coordinate and element witdh
      var pos = offset(el);
      var relativeY = e.pageY - pos.top;
      var relativeX = e.pageX - pos.left;
      var scale = 'scale(' + el.clientWidth / 100 * 10 + ')';

      // Support for touch devices
      if ('touches' in e) {
        relativeY = e.touches[0].pageY - pos.top;
        relativeX = e.touches[0].pageX - pos.left;
      }

      // Attach data to element
      ripple.setAttribute('data-hold', Date.now());
      ripple.setAttribute('data-scale', scale);
      ripple.setAttribute('data-x', relativeX);
      ripple.setAttribute('data-y', relativeY);

      // Set ripple position
      var rippleStyle = {
        'top': relativeY + 'px',
        'left': relativeX + 'px'
      };

      ripple.className = ripple.className + ' waves-notransition';
      ripple.setAttribute('style', convertStyle(rippleStyle));
      ripple.className = ripple.className.replace('waves-notransition', '');

      // Scale the ripple
      rippleStyle['-webkit-transform'] = scale;
      rippleStyle['-moz-transform'] = scale;
      rippleStyle['-ms-transform'] = scale;
      rippleStyle['-o-transform'] = scale;
      rippleStyle.transform = scale;
      rippleStyle.opacity = '1';

      rippleStyle['-webkit-transition-duration'] = Effect.duration + 'ms';
      rippleStyle['-moz-transition-duration'] = Effect.duration + 'ms';
      rippleStyle['-o-transition-duration'] = Effect.duration + 'ms';
      rippleStyle['transition-duration'] = Effect.duration + 'ms';

      rippleStyle['-webkit-transition-timing-function'] = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
      rippleStyle['-moz-transition-timing-function'] = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
      rippleStyle['-o-transition-timing-function'] = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
      rippleStyle['transition-timing-function'] = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';

      ripple.setAttribute('style', convertStyle(rippleStyle));
    },

    hide: function (e) {
      TouchHandler.touchup(e);

      var el = this;
      var width = el.clientWidth * 1.4;

      // Get first ripple
      var ripple = null;
      var ripples = el.getElementsByClassName('waves-ripple');
      if (ripples.length > 0) {
        ripple = ripples[ripples.length - 1];
      } else {
        return false;
      }

      var relativeX = ripple.getAttribute('data-x');
      var relativeY = ripple.getAttribute('data-y');
      var scale = ripple.getAttribute('data-scale');

      // Get delay beetween mousedown and mouse leave
      var diff = Date.now() - Number(ripple.getAttribute('data-hold'));
      var delay = 350 - diff;

      if (delay < 0) {
        delay = 0;
      }

      // Fade out ripple after delay
      setTimeout(function () {
        var style = {
          'top': relativeY + 'px',
          'left': relativeX + 'px',
          'opacity': '0',

          // Duration
          '-webkit-transition-duration': Effect.duration + 'ms',
          '-moz-transition-duration': Effect.duration + 'ms',
          '-o-transition-duration': Effect.duration + 'ms',
          'transition-duration': Effect.duration + 'ms',
          '-webkit-transform': scale,
          '-moz-transform': scale,
          '-ms-transform': scale,
          '-o-transform': scale,
          'transform': scale
        };

        ripple.setAttribute('style', convertStyle(style));

        setTimeout(function () {
          try {
            el.removeChild(ripple);
          } catch (e) {
            return false;
          }
        }, Effect.duration);
      }, delay);
    },

    // Little hack to make <input> can perform waves effect
    wrapInput: function (elements) {
      for (var a = 0; a < elements.length; a++) {
        var el = elements[a];

        if (el.tagName.toLowerCase() === 'input') {
          var parent = el.parentNode;

          // If input already have parent just pass through
          if (parent.tagName.toLowerCase() === 'i' && parent.className.indexOf('waves-effect') !== -1) {
            continue;
          }

          // Put element class and style to the specified parent
          var wrapper = document.createElement('i');
          wrapper.className = el.className + ' waves-input-wrapper';

          var elementStyle = el.getAttribute('style');

          if (!elementStyle) {
            elementStyle = '';
          }

          wrapper.setAttribute('style', elementStyle);

          el.className = 'waves-button-input';
          el.removeAttribute('style');

          // Put element as child
          parent.replaceChild(wrapper, el);
          wrapper.appendChild(el);
        }
      }
    }
  };

  /**
   * Disable mousedown event for 500ms during and after touch
   */
  var TouchHandler = {
    /* uses an integer rather than bool so there's no issues with
     * needing to clear timeouts if another touch event occurred
     * within the 500ms. Cannot mouseup between touchstart and
     * touchend, nor in the 500ms after touchend. */
    touches: 0,
    allowEvent: function (e) {
      var allow = true;

      if (e.type === 'touchstart') {
        TouchHandler.touches += 1; //push
      } else if (e.type === 'touchend' || e.type === 'touchcancel') {
        setTimeout(function () {
          if (TouchHandler.touches > 0) {
            TouchHandler.touches -= 1; //pop after 500ms
          }
        }, 500);
      } else if (e.type === 'mousedown' && TouchHandler.touches > 0) {
        allow = false;
      }

      return allow;
    },
    touchup: function (e) {
      TouchHandler.allowEvent(e);
    }
  };

  /**
   * Delegated click handler for .waves-effect element.
   * returns null when .waves-effect element not in "click tree"
   */
  function getWavesEffectElement(e) {
    if (TouchHandler.allowEvent(e) === false) {
      return null;
    }

    var element = null;
    var target = e.target || e.srcElement;

    while (target.parentNode !== null) {
      if (!(target instanceof SVGElement) && target.className.indexOf('waves-effect') !== -1) {
        element = target;
        break;
      }
      target = target.parentNode;
    }
    return element;
  }

  /**
   * Bubble the click and show effect if .waves-effect elem was found
   */
  function showEffect(e) {
    var element = getWavesEffectElement(e);

    if (element !== null) {
      Effect.show(e, element);

      if ('ontouchstart' in window) {
        element.addEventListener('touchend', Effect.hide, false);
        element.addEventListener('touchcancel', Effect.hide, false);
      }

      element.addEventListener('mouseup', Effect.hide, false);
      element.addEventListener('mouseleave', Effect.hide, false);
      element.addEventListener('dragend', Effect.hide, false);
    }
  }

  Waves.displayEffect = function (options) {
    options = options || {};

    if ('duration' in options) {
      Effect.duration = options.duration;
    }

    //Wrap input inside <i> tag
    Effect.wrapInput($$('.waves-effect'));

    if ('ontouchstart' in window) {
      document.body.addEventListener('touchstart', showEffect, false);
    }

    document.body.addEventListener('mousedown', showEffect, false);
  };

  /**
   * Attach Waves to an input element (or any element which doesn't
   * bubble mouseup/mousedown events).
   *   Intended to be used with dynamically loaded forms/inputs, or
   * where the user doesn't want a delegated click handler.
   */
  Waves.attach = function (element) {
    //FUTURE: automatically add waves classes and allow users
    // to specify them with an options param? Eg. light/classic/button
    if (element.tagName.toLowerCase() === 'input') {
      Effect.wrapInput([element]);
      element = element.parentNode;
    }

    if ('ontouchstart' in window) {
      element.addEventListener('touchstart', showEffect, false);
    }

    element.addEventListener('mousedown', showEffect, false);
  };

  window.Waves = Waves;

  document.addEventListener('DOMContentLoaded', function () {
    Waves.displayEffect();
  }, false);
})(window);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    html: '',
    displayLength: 4000,
    inDuration: 300,
    outDuration: 375,
    classes: '',
    completeCallback: null,
    activationPercent: 0.8
  };

  var Toast = function () {
    function Toast(options) {
      _classCallCheck(this, Toast);

      /**
       * Options for the toast
       * @member Toast#options
       */
      this.options = $.extend({}, Toast.defaults, options);
      this.message = this.options.html;

      /**
       * Describes current pan state toast
       * @type {Boolean}
       */
      this.panning = false;

      /**
       * Time remaining until toast is removed
       */
      this.timeRemaining = this.options.displayLength;

      if (Toast._toasts.length === 0) {
        Toast._createContainer();
      }

      // Create new toast
      Toast._toasts.push(this);
      var toastElement = this._createToast();
      toastElement.M_Toast = this;
      this.el = toastElement;
      this._animateIn();
      this._setTimer();
    }

    _createClass(Toast, [{
      key: "_createToast",


      /**
       * Create toast and append it to toast container
       */
      value: function _createToast() {
        var toast = document.createElement('div');
        toast.classList.add('toast');

        // Add custom classes onto toast
        if (!!this.options.classes.length) {
          $(toast).addClass(this.options.classes);
        }

        // Set content
        if (typeof HTMLElement === 'object' ? this.message instanceof HTMLElement : this.message && typeof this.message === 'object' && this.message !== null && this.message.nodeType === 1 && typeof this.message.nodeName === 'string') {
          toast.appendChild(this.message);

          // Check if it is jQuery object
        } else if (!!this.message.jquery) {
          $(toast).append(this.message[0]);

          // Insert as html;
        } else {
          toast.innerHTML = this.message;
        }

        // Append toasft
        Toast._container.appendChild(toast);
        return toast;
      }

      /**
       * Animate in toast
       */

    }, {
      key: "_animateIn",
      value: function _animateIn() {
        // Animate toast in
        anim({
          targets: this.el,
          top: 0,
          opacity: 1,
          duration: 300,
          easing: 'easeOutCubic'
        });
      }

      /**
       * Create setInterval which automatically removes toast when timeRemaining >= 0
       * has been reached
       */

    }, {
      key: "_setTimer",
      value: function _setTimer() {
        var _this28 = this;

        if (this.timeRemaining !== Infinity) {
          this.counterInterval = setInterval(function () {
            // If toast is not being dragged, decrease its time remaining
            if (!_this28.panning) {
              _this28.timeRemaining -= 20;
            }

            // Animate toast out
            if (_this28.timeRemaining <= 0) {
              _this28.dismiss();
            }
          }, 20);
        }
      }

      /**
       * Dismiss toast with animation
       */

    }, {
      key: "dismiss",
      value: function dismiss() {
        var _this29 = this;

        window.clearInterval(this.counterInterval);
        var activationDistance = this.el.offsetWidth * this.options.activationPercent;

        if (this.wasSwiped) {
          this.el.style.transition = 'transform .05s, opacity .05s';
          this.el.style.transform = "translateX(" + activationDistance + "px)";
          this.el.style.opacity = 0;
        }

        anim({
          targets: this.el,
          opacity: 0,
          marginTop: -40,
          duration: this.options.outDuration,
          easing: 'easeOutExpo',
          complete: function () {
            // Call the optional callback
            if (typeof _this29.options.completeCallback === 'function') {
              _this29.options.completeCallback();
            }
            // Remove toast from DOM
            _this29.el.parentNode.removeChild(_this29.el);
            Toast._toasts.splice(Toast._toasts.indexOf(_this29), 1);
            if (Toast._toasts.length === 0) {
              Toast._removeContainer();
            }
          }
        });
      }
    }], [{
      key: "getInstance",


      /**
       * Get Instance
       */
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Toast;
      }

      /**
       * Append toast container and add event handlers
       */

    }, {
      key: "_createContainer",
      value: function _createContainer() {
        var container = document.createElement('div');
        container.setAttribute('id', 'toast-container');

        // Add event handler
        container.addEventListener('touchstart', Toast._onDragStart);
        container.addEventListener('touchmove', Toast._onDragMove);
        container.addEventListener('touchend', Toast._onDragEnd);

        container.addEventListener('mousedown', Toast._onDragStart);
        document.addEventListener('mousemove', Toast._onDragMove);
        document.addEventListener('mouseup', Toast._onDragEnd);

        document.body.appendChild(container);
        Toast._container = container;
      }

      /**
       * Remove toast container and event handlers
       */

    }, {
      key: "_removeContainer",
      value: function _removeContainer() {
        // Add event handler
        document.removeEventListener('mousemove', Toast._onDragMove);
        document.removeEventListener('mouseup', Toast._onDragEnd);

        Toast._container.parentNode.removeChild(Toast._container);
        Toast._container = null;
      }

      /**
       * Begin drag handler
       * @param {Event} e
       */

    }, {
      key: "_onDragStart",
      value: function _onDragStart(e) {
        if (e.target && $(e.target).closest('.toast').length) {
          var $toast = $(e.target).closest('.toast');
          var toast = $toast[0].M_Toast;
          toast.panning = true;
          Toast._draggedToast = toast;
          toast.el.classList.add('panning');
          toast.el.style.transition = '';
          toast.startingXPos = Toast._xPos(e);
          toast.time = Date.now();
          toast.xPos = Toast._xPos(e);
        }
      }

      /**
       * Drag move handler
       * @param {Event} e
       */

    }, {
      key: "_onDragMove",
      value: function _onDragMove(e) {
        if (!!Toast._draggedToast) {
          e.preventDefault();
          var toast = Toast._draggedToast;
          toast.deltaX = Math.abs(toast.xPos - Toast._xPos(e));
          toast.xPos = Toast._xPos(e);
          toast.velocityX = toast.deltaX / (Date.now() - toast.time);
          toast.time = Date.now();

          var totalDeltaX = toast.xPos - toast.startingXPos;
          var activationDistance = toast.el.offsetWidth * toast.options.activationPercent;
          toast.el.style.transform = "translateX(" + totalDeltaX + "px)";
          toast.el.style.opacity = 1 - Math.abs(totalDeltaX / activationDistance);
        }
      }

      /**
       * End drag handler
       */

    }, {
      key: "_onDragEnd",
      value: function _onDragEnd() {
        if (!!Toast._draggedToast) {
          var toast = Toast._draggedToast;
          toast.panning = false;
          toast.el.classList.remove('panning');

          var totalDeltaX = toast.xPos - toast.startingXPos;
          var activationDistance = toast.el.offsetWidth * toast.options.activationPercent;
          var shouldBeDismissed = Math.abs(totalDeltaX) > activationDistance || toast.velocityX > 1;

          // Remove toast
          if (shouldBeDismissed) {
            toast.wasSwiped = true;
            toast.dismiss();

            // Animate toast back to original position
          } else {
            toast.el.style.transition = 'transform .2s, opacity .2s';
            toast.el.style.transform = '';
            toast.el.style.opacity = '';
          }
          Toast._draggedToast = null;
        }
      }

      /**
       * Get x position of mouse or touch event
       * @param {Event} e
       */

    }, {
      key: "_xPos",
      value: function _xPos(e) {
        if (e.targetTouches && e.targetTouches.length >= 1) {
          return e.targetTouches[0].clientX;
        }
        // mouse event
        return e.clientX;
      }

      /**
       * Remove all toasts
       */

    }, {
      key: "dismissAll",
      value: function dismissAll() {
        for (var toastIndex in Toast._toasts) {
          Toast._toasts[toastIndex].dismiss();
        }
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Toast;
  }();

  /**
   * @static
   * @memberof Toast
   * @type {Array.<Toast>}
   */


  Toast._toasts = [];

  /**
   * @static
   * @memberof Toast
   */
  Toast._container = null;

  /**
   * @static
   * @memberof Toast
   * @type {Toast}
   */
  Toast._draggedToast = null;

  M.Toast = Toast;
  M.toast = function (options) {
    return new Toast(options);
  };
})(cash, M.anime);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    edge: 'left',
    draggable: true,
    inDuration: 250,
    outDuration: 200,
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null,
    preventScrolling: true
  };

  /**
   * @class
   */

  var Sidenav = function (_Component8) {
    _inherits(Sidenav, _Component8);

    /**
     * Construct Sidenav instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Sidenav(el, options) {
      _classCallCheck(this, Sidenav);

      var _this30 = _possibleConstructorReturn(this, (Sidenav.__proto__ || Object.getPrototypeOf(Sidenav)).call(this, Sidenav, el, options));

      _this30.el.M_Sidenav = _this30;
      _this30.id = _this30.$el.attr('id');

      /**
       * Options for the Sidenav
       * @member Sidenav#options
       * @prop {String} [edge='left'] - Side of screen on which Sidenav appears
       * @prop {Boolean} [draggable=true] - Allow swipe gestures to open/close Sidenav
       * @prop {Number} [inDuration=250] - Length in ms of enter transition
       * @prop {Number} [outDuration=200] - Length in ms of exit transition
       * @prop {Function} onOpenStart - Function called when sidenav starts entering
       * @prop {Function} onOpenEnd - Function called when sidenav finishes entering
       * @prop {Function} onCloseStart - Function called when sidenav starts exiting
       * @prop {Function} onCloseEnd - Function called when sidenav finishes exiting
       */
      _this30.options = $.extend({}, Sidenav.defaults, options);

      /**
       * Describes open/close state of Sidenav
       * @type {Boolean}
       */
      _this30.isOpen = false;

      /**
       * Describes if Sidenav is fixed
       * @type {Boolean}
       */
      _this30.isFixed = _this30.el.classList.contains('sidenav-fixed');

      /**
       * Describes if Sidenav is being draggeed
       * @type {Boolean}
       */
      _this30.isDragged = false;

      // Window size variables for window resize checks
      _this30.lastWindowWidth = window.innerWidth;
      _this30.lastWindowHeight = window.innerHeight;

      _this30._createOverlay();
      _this30._createDragTarget();
      _this30._setupEventHandlers();
      _this30._setupClasses();
      _this30._setupFixed();

      Sidenav._sidenavs.push(_this30);
      return _this30;
    }

    _createClass(Sidenav, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this._overlay.parentNode.removeChild(this._overlay);
        this.dragTarget.parentNode.removeChild(this.dragTarget);
        this.el.M_Sidenav = undefined;

        var index = Sidenav._sidenavs.indexOf(this);
        if (index >= 0) {
          Sidenav._sidenavs.splice(index, 1);
        }
      }
    }, {
      key: "_createOverlay",
      value: function _createOverlay() {
        var overlay = document.createElement('div');
        this._closeBound = this.close.bind(this);
        overlay.classList.add('sidenav-overlay');

        overlay.addEventListener('click', this._closeBound);

        document.body.appendChild(overlay);
        this._overlay = overlay;
      }
    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        if (Sidenav._sidenavs.length === 0) {
          document.body.addEventListener('click', this._handleTriggerClick);
        }

        this._handleDragTargetDragBound = this._handleDragTargetDrag.bind(this);
        this._handleDragTargetReleaseBound = this._handleDragTargetRelease.bind(this);
        this._handleCloseDragBound = this._handleCloseDrag.bind(this);
        this._handleCloseReleaseBound = this._handleCloseRelease.bind(this);
        this._handleCloseTriggerClickBound = this._handleCloseTriggerClick.bind(this);

        this.dragTarget.addEventListener('touchmove', this._handleDragTargetDragBound);
        this.dragTarget.addEventListener('touchend', this._handleDragTargetReleaseBound);
        this._overlay.addEventListener('touchmove', this._handleCloseDragBound);
        this._overlay.addEventListener('touchend', this._handleCloseReleaseBound);
        this.el.addEventListener('touchmove', this._handleCloseDragBound);
        this.el.addEventListener('touchend', this._handleCloseReleaseBound);
        this.el.addEventListener('click', this._handleCloseTriggerClickBound);

        // Add resize for side nav fixed
        if (this.isFixed) {
          this._handleWindowResizeBound = this._handleWindowResize.bind(this);
          window.addEventListener('resize', this._handleWindowResizeBound);
        }
      }
    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        if (Sidenav._sidenavs.length === 1) {
          document.body.removeEventListener('click', this._handleTriggerClick);
        }

        this.dragTarget.removeEventListener('touchmove', this._handleDragTargetDragBound);
        this.dragTarget.removeEventListener('touchend', this._handleDragTargetReleaseBound);
        this._overlay.removeEventListener('touchmove', this._handleCloseDragBound);
        this._overlay.removeEventListener('touchend', this._handleCloseReleaseBound);
        this.el.removeEventListener('touchmove', this._handleCloseDragBound);
        this.el.removeEventListener('touchend', this._handleCloseReleaseBound);
        this.el.removeEventListener('click', this._handleCloseTriggerClickBound);

        // Remove resize for side nav fixed
        if (this.isFixed) {
          window.removeEventListener('resize', this._handleWindowResizeBound);
        }
      }

      /**
       * Handle Trigger Click
       * @param {Event} e
       */

    }, {
      key: "_handleTriggerClick",
      value: function _handleTriggerClick(e) {
        var $trigger = $(e.target).closest('.sidenav-trigger');
        if (e.target && $trigger.length) {
          var sidenavId = M.getIdFromTrigger($trigger[0]);

          var sidenavInstance = document.getElementById(sidenavId).M_Sidenav;
          if (sidenavInstance) {
            sidenavInstance.open($trigger);
          }
          e.preventDefault();
        }
      }

      /**
       * Set variables needed at the beggining of drag
       * and stop any current transition.
       * @param {Event} e
       */

    }, {
      key: "_startDrag",
      value: function _startDrag(e) {
        var clientX = e.targetTouches[0].clientX;
        this.isDragged = true;
        this._startingXpos = clientX;
        this._xPos = this._startingXpos;
        this._time = Date.now();
        this._width = this.el.getBoundingClientRect().width;
        this._overlay.style.display = 'block';
        this._initialScrollTop = this.isOpen ? this.el.scrollTop : M.getDocumentScrollTop();
        this._verticallyScrolling = false;
        anim.remove(this.el);
        anim.remove(this._overlay);
      }

      /**
       * Set variables needed at each drag move update tick
       * @param {Event} e
       */

    }, {
      key: "_dragMoveUpdate",
      value: function _dragMoveUpdate(e) {
        var clientX = e.targetTouches[0].clientX;
        var currentScrollTop = this.isOpen ? this.el.scrollTop : M.getDocumentScrollTop();
        this.deltaX = Math.abs(this._xPos - clientX);
        this._xPos = clientX;
        this.velocityX = this.deltaX / (Date.now() - this._time);
        this._time = Date.now();
        if (this._initialScrollTop !== currentScrollTop) {
          this._verticallyScrolling = true;
        }
      }

      /**
       * Handles Dragging of Sidenav
       * @param {Event} e
       */

    }, {
      key: "_handleDragTargetDrag",
      value: function _handleDragTargetDrag(e) {
        // Check if draggable
        if (!this.options.draggable || this._isCurrentlyFixed() || this._verticallyScrolling) {
          return;
        }

        // If not being dragged, set initial drag start variables
        if (!this.isDragged) {
          this._startDrag(e);
        }

        // Run touchmove updates
        this._dragMoveUpdate(e);

        // Calculate raw deltaX
        var totalDeltaX = this._xPos - this._startingXpos;

        // dragDirection is the attempted user drag direction
        var dragDirection = totalDeltaX > 0 ? 'right' : 'left';

        // Don't allow totalDeltaX to exceed Sidenav width or be dragged in the opposite direction
        totalDeltaX = Math.min(this._width, Math.abs(totalDeltaX));
        if (this.options.edge === dragDirection) {
          totalDeltaX = 0;
        }

        /**
         * transformX is the drag displacement
         * transformPrefix is the initial transform placement
         * Invert values if Sidenav is right edge
         */
        var transformX = totalDeltaX;
        var transformPrefix = 'translateX(-100%)';
        if (this.options.edge === 'right') {
          transformPrefix = 'translateX(100%)';
          transformX = -transformX;
        }

        // Calculate open/close percentage of sidenav, with open = 1 and close = 0
        this.percentOpen = Math.min(1, totalDeltaX / this._width);

        // Set transform and opacity styles
        this.el.style.transform = transformPrefix + " translateX(" + transformX + "px)";
        this._overlay.style.opacity = this.percentOpen;
      }

      /**
       * Handle Drag Target Release
       */

    }, {
      key: "_handleDragTargetRelease",
      value: function _handleDragTargetRelease() {
        if (this.isDragged) {
          if (this.percentOpen > .5) {
            this.open();
          } else {
            this._animateOut();
          }

          this.isDragged = false;
          this._verticallyScrolling = false;
        }
      }

      /**
       * Handle Close Drag
       * @param {Event} e
       */

    }, {
      key: "_handleCloseDrag",
      value: function _handleCloseDrag(e) {
        if (this.isOpen) {
          // Check if draggable
          if (!this.options.draggable || this._isCurrentlyFixed() || this._verticallyScrolling) {
            return;
          }

          // If not being dragged, set initial drag start variables
          if (!this.isDragged) {
            this._startDrag(e);
          }

          // Run touchmove updates
          this._dragMoveUpdate(e);

          // Calculate raw deltaX
          var totalDeltaX = this._xPos - this._startingXpos;

          // dragDirection is the attempted user drag direction
          var dragDirection = totalDeltaX > 0 ? 'right' : 'left';

          // Don't allow totalDeltaX to exceed Sidenav width or be dragged in the opposite direction
          totalDeltaX = Math.min(this._width, Math.abs(totalDeltaX));
          if (this.options.edge !== dragDirection) {
            totalDeltaX = 0;
          }

          var transformX = -totalDeltaX;
          if (this.options.edge === 'right') {
            transformX = -transformX;
          }

          // Calculate open/close percentage of sidenav, with open = 1 and close = 0
          this.percentOpen = Math.min(1, 1 - totalDeltaX / this._width);

          // Set transform and opacity styles
          this.el.style.transform = "translateX(" + transformX + "px)";
          this._overlay.style.opacity = this.percentOpen;
        }
      }

      /**
       * Handle Close Release
       */

    }, {
      key: "_handleCloseRelease",
      value: function _handleCloseRelease() {
        if (this.isOpen && this.isDragged) {
          if (this.percentOpen > .5) {
            this._animateIn();
          } else {
            this.close();
          }

          this.isDragged = false;
          this._verticallyScrolling = false;
        }
      }

      /**
       * Handles closing of Sidenav when element with class .sidenav-close
       */

    }, {
      key: "_handleCloseTriggerClick",
      value: function _handleCloseTriggerClick(e) {
        var $closeTrigger = $(e.target).closest('.sidenav-close');
        if ($closeTrigger.length && !this._isCurrentlyFixed()) {
          this.close();
        }
      }

      /**
       * Handle Window Resize
       */

    }, {
      key: "_handleWindowResize",
      value: function _handleWindowResize() {
        // Only handle horizontal resizes
        if (this.lastWindowWidth !== window.innerWidth) {
          if (window.innerWidth > 992) {
            this.open();
          } else {
            this.close();
          }
        }

        this.lastWindowWidth = window.innerWidth;
        this.lastWindowHeight = window.innerHeight;
      }
    }, {
      key: "_setupClasses",
      value: function _setupClasses() {
        if (this.options.edge === 'right') {
          this.el.classList.add('right-aligned');
          this.dragTarget.classList.add('right-aligned');
        }
      }
    }, {
      key: "_removeClasses",
      value: function _removeClasses() {
        this.el.classList.remove('right-aligned');
        this.dragTarget.classList.remove('right-aligned');
      }
    }, {
      key: "_setupFixed",
      value: function _setupFixed() {
        if (this._isCurrentlyFixed()) {
          this.open();
        }
      }
    }, {
      key: "_isCurrentlyFixed",
      value: function _isCurrentlyFixed() {
        return this.isFixed && window.innerWidth > 992;
      }
    }, {
      key: "_createDragTarget",
      value: function _createDragTarget() {
        var dragTarget = document.createElement('div');
        dragTarget.classList.add('drag-target');
        document.body.appendChild(dragTarget);
        this.dragTarget = dragTarget;
      }
    }, {
      key: "_preventBodyScrolling",
      value: function _preventBodyScrolling() {
        var body = document.body;
        body.style.overflow = 'hidden';
      }
    }, {
      key: "_enableBodyScrolling",
      value: function _enableBodyScrolling() {
        var body = document.body;
        body.style.overflow = '';
      }
    }, {
      key: "open",
      value: function open() {
        if (this.isOpen === true) {
          return;
        }

        this.isOpen = true;

        // Run onOpenStart callback
        if (typeof this.options.onOpenStart === 'function') {
          this.options.onOpenStart.call(this, this.el);
        }

        // Handle fixed Sidenav
        if (this._isCurrentlyFixed()) {
          anim.remove(this.el);
          anim({
            targets: this.el,
            translateX: 0,
            duration: 0,
            easing: 'easeOutQuad'
          });
          this._enableBodyScrolling();
          this._overlay.style.display = 'none';

          // Handle non-fixed Sidenav
        } else {
          if (this.options.preventScrolling) {
            this._preventBodyScrolling();
          }

          if (!this.isDragged || this.percentOpen != 1) {
            this._animateIn();
          }
        }
      }
    }, {
      key: "close",
      value: function close() {
        if (this.isOpen === false) {
          return;
        }

        this.isOpen = false;

        // Run onCloseStart callback
        if (typeof this.options.onCloseStart === 'function') {
          this.options.onCloseStart.call(this, this.el);
        }

        // Handle fixed Sidenav
        if (this._isCurrentlyFixed()) {
          var transformX = this.options.edge === 'left' ? '-105%' : '105%';
          this.el.style.transform = "translateX(" + transformX + ")";

          // Handle non-fixed Sidenav
        } else {
          this._enableBodyScrolling();

          if (!this.isDragged || this.percentOpen != 0) {
            this._animateOut();
          } else {
            this._overlay.style.display = 'none';
          }
        }
      }
    }, {
      key: "_animateIn",
      value: function _animateIn() {
        this._animateSidenavIn();
        this._animateOverlayIn();
      }
    }, {
      key: "_animateSidenavIn",
      value: function _animateSidenavIn() {
        var _this31 = this;

        var slideOutPercent = this.options.edge === 'left' ? -1 : 1;
        if (this.isDragged) {
          slideOutPercent = this.options.edge === 'left' ? slideOutPercent + this.percentOpen : slideOutPercent - this.percentOpen;
        }

        anim.remove(this.el);
        anim({
          targets: this.el,
          translateX: [slideOutPercent * 100 + "%", 0],
          duration: this.options.inDuration,
          easing: 'easeOutQuad',
          complete: function () {
            // Run onOpenEnd callback
            if (typeof _this31.options.onOpenEnd === 'function') {
              _this31.options.onOpenEnd.call(_this31, _this31.el);
            }
          }
        });
      }
    }, {
      key: "_animateOverlayIn",
      value: function _animateOverlayIn() {
        var start = 0;
        if (this.isDragged) {
          start = this.percentOpen;
        } else {
          $(this._overlay).css({
            display: 'block'
          });
        }

        anim.remove(this._overlay);
        anim({
          targets: this._overlay,
          opacity: [start, 1],
          duration: this.options.inDuration,
          easing: 'easeOutQuad'
        });
      }
    }, {
      key: "_animateOut",
      value: function _animateOut() {
        this._animateSidenavOut();
        this._animateOverlayOut();
      }
    }, {
      key: "_animateSidenavOut",
      value: function _animateSidenavOut() {
        var _this32 = this;

        var endPercent = this.options.edge === 'left' ? -1 : 1;
        var slideOutPercent = 0;
        if (this.isDragged) {
          slideOutPercent = this.options.edge === 'left' ? endPercent + this.percentOpen : endPercent - this.percentOpen;
        }

        anim.remove(this.el);
        anim({
          targets: this.el,
          translateX: [slideOutPercent * 100 + "%", endPercent * 105 + "%"],
          duration: this.options.outDuration,
          easing: 'easeOutQuad',
          complete: function () {
            // Run onOpenEnd callback
            if (typeof _this32.options.onCloseEnd === 'function') {
              _this32.options.onCloseEnd.call(_this32, _this32.el);
            }
          }
        });
      }
    }, {
      key: "_animateOverlayOut",
      value: function _animateOverlayOut() {
        var _this33 = this;

        anim.remove(this._overlay);
        anim({
          targets: this._overlay,
          opacity: 0,
          duration: this.options.outDuration,
          easing: 'easeOutQuad',
          complete: function () {
            $(_this33._overlay).css('display', 'none');
          }
        });
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Sidenav.__proto__ || Object.getPrototypeOf(Sidenav), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Sidenav;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Sidenav;
  }(Component);

  /**
   * @static
   * @memberof Sidenav
   * @type {Array.<Sidenav>}
   */


  Sidenav._sidenavs = [];

  window.M.Sidenav = Sidenav;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Sidenav, 'sidenav', 'M_Sidenav');
  }
})(cash, M.anime);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    throttle: 100,
    scrollOffset: 200, // offset - 200 allows elements near bottom of page to scroll
    activeClass: 'active',
    getActiveElement: function (id) {
      return 'a[href="#' + id + '"]';
    }
  };

  /**
   * @class
   *
   */

  var ScrollSpy = function (_Component9) {
    _inherits(ScrollSpy, _Component9);

    /**
     * Construct ScrollSpy instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function ScrollSpy(el, options) {
      _classCallCheck(this, ScrollSpy);

      var _this34 = _possibleConstructorReturn(this, (ScrollSpy.__proto__ || Object.getPrototypeOf(ScrollSpy)).call(this, ScrollSpy, el, options));

      _this34.el.M_ScrollSpy = _this34;

      /**
       * Options for the modal
       * @member Modal#options
       * @prop {Number} [throttle=100] - Throttle of scroll handler
       * @prop {Number} [scrollOffset=200] - Offset for centering element when scrolled to
       * @prop {String} [activeClass='active'] - Class applied to active elements
       * @prop {Function} [getActiveElement] - Used to find active element
       */
      _this34.options = $.extend({}, ScrollSpy.defaults, options);

      // setup
      ScrollSpy._elements.push(_this34);
      ScrollSpy._count++;
      ScrollSpy._increment++;
      _this34.tickId = -1;
      _this34.id = ScrollSpy._increment;
      _this34._setupEventHandlers();
      _this34._handleWindowScroll();
      return _this34;
    }

    _createClass(ScrollSpy, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        ScrollSpy._elements.splice(ScrollSpy._elements.indexOf(this), 1);
        ScrollSpy._elementsInView.splice(ScrollSpy._elementsInView.indexOf(this), 1);
        ScrollSpy._visibleElements.splice(ScrollSpy._visibleElements.indexOf(this.$el), 1);
        ScrollSpy._count--;
        this._removeEventHandlers();
        $(this.options.getActiveElement(this.$el.attr('id'))).removeClass(this.options.activeClass);
        this.el.M_ScrollSpy = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        var throttledResize = M.throttle(this._handleWindowScroll, 200);
        this._handleThrottledResizeBound = throttledResize.bind(this);
        this._handleWindowScrollBound = this._handleWindowScroll.bind(this);
        if (ScrollSpy._count === 1) {
          window.addEventListener('scroll', this._handleWindowScrollBound);
          window.addEventListener('resize', this._handleThrottledResizeBound);
          document.body.addEventListener('click', this._handleTriggerClick);
        }
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        if (ScrollSpy._count === 0) {
          window.removeEventListener('scroll', this._handleWindowScrollBound);
          window.removeEventListener('resize', this._handleThrottledResizeBound);
          document.body.removeEventListener('click', this._handleTriggerClick);
        }
      }

      /**
       * Handle Trigger Click
       * @param {Event} e
       */

    }, {
      key: "_handleTriggerClick",
      value: function _handleTriggerClick(e) {
        var $trigger = $(e.target);
        for (var i = ScrollSpy._elements.length - 1; i >= 0; i--) {
          var scrollspy = ScrollSpy._elements[i];
          if ($trigger.is('a[href="#' + scrollspy.$el.attr('id') + '"]')) {
            e.preventDefault();
            var offset = scrollspy.$el.offset().top + 1;

            anim({
              targets: [document.documentElement, document.body],
              scrollTop: offset - scrollspy.options.scrollOffset,
              duration: 400,
              easing: 'easeOutCubic'
            });
            break;
          }
        }
      }

      /**
       * Handle Window Scroll
       */

    }, {
      key: "_handleWindowScroll",
      value: function _handleWindowScroll() {
        // unique tick id
        ScrollSpy._ticks++;

        // viewport rectangle
        var top = M.getDocumentScrollTop(),
            left = M.getDocumentScrollLeft(),
            right = left + window.innerWidth,
            bottom = top + window.innerHeight;

        // determine which elements are in view
        var intersections = ScrollSpy._findElements(top, right, bottom, left);
        for (var i = 0; i < intersections.length; i++) {
          var scrollspy = intersections[i];
          var lastTick = scrollspy.tickId;
          if (lastTick < 0) {
            // entered into view
            scrollspy._enter();
          }

          // update tick id
          scrollspy.tickId = ScrollSpy._ticks;
        }

        for (var _i = 0; _i < ScrollSpy._elementsInView.length; _i++) {
          var _scrollspy = ScrollSpy._elementsInView[_i];
          var _lastTick = _scrollspy.tickId;
          if (_lastTick >= 0 && _lastTick !== ScrollSpy._ticks) {
            // exited from view
            _scrollspy._exit();
            _scrollspy.tickId = -1;
          }
        }

        // remember elements in view for next tick
        ScrollSpy._elementsInView = intersections;
      }

      /**
       * Find elements that are within the boundary
       * @param {number} top
       * @param {number} right
       * @param {number} bottom
       * @param {number} left
       * @return {Array.<ScrollSpy>}   A collection of elements
       */

    }, {
      key: "_enter",
      value: function _enter() {
        ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter(function (value) {
          return value.height() != 0;
        });

        if (ScrollSpy._visibleElements[0]) {
          $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).removeClass(this.options.activeClass);
          if (ScrollSpy._visibleElements[0][0].M_ScrollSpy && this.id < ScrollSpy._visibleElements[0][0].M_ScrollSpy.id) {
            ScrollSpy._visibleElements.unshift(this.$el);
          } else {
            ScrollSpy._visibleElements.push(this.$el);
          }
        } else {
          ScrollSpy._visibleElements.push(this.$el);
        }

        $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).addClass(this.options.activeClass);
      }
    }, {
      key: "_exit",
      value: function _exit() {
        var _this35 = this;

        ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter(function (value) {
          return value.height() != 0;
        });

        if (ScrollSpy._visibleElements[0]) {
          $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).removeClass(this.options.activeClass);

          ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter(function (el) {
            return el.attr('id') != _this35.$el.attr('id');
          });
          if (ScrollSpy._visibleElements[0]) {
            // Check if empty
            $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).addClass(this.options.activeClass);
          }
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(ScrollSpy.__proto__ || Object.getPrototypeOf(ScrollSpy), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_ScrollSpy;
      }
    }, {
      key: "_findElements",
      value: function _findElements(top, right, bottom, left) {
        var hits = [];
        for (var i = 0; i < ScrollSpy._elements.length; i++) {
          var scrollspy = ScrollSpy._elements[i];
          var currTop = top + scrollspy.options.scrollOffset || 200;

          if (scrollspy.$el.height() > 0) {
            var elTop = scrollspy.$el.offset().top,
                elLeft = scrollspy.$el.offset().left,
                elRight = elLeft + scrollspy.$el.width(),
                elBottom = elTop + scrollspy.$el.height();

            var isIntersect = !(elLeft > right || elRight < left || elTop > bottom || elBottom < currTop);

            if (isIntersect) {
              hits.push(scrollspy);
            }
          }
        }
        return hits;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return ScrollSpy;
  }(Component);

  /**
   * @static
   * @memberof ScrollSpy
   * @type {Array.<ScrollSpy>}
   */


  ScrollSpy._elements = [];

  /**
   * @static
   * @memberof ScrollSpy
   * @type {Array.<ScrollSpy>}
   */
  ScrollSpy._elementsInView = [];

  /**
   * @static
   * @memberof ScrollSpy
   * @type {Array.<cash>}
   */
  ScrollSpy._visibleElements = [];

  /**
   * @static
   * @memberof ScrollSpy
   */
  ScrollSpy._count = 0;

  /**
   * @static
   * @memberof ScrollSpy
   */
  ScrollSpy._increment = 0;

  /**
   * @static
   * @memberof ScrollSpy
   */
  ScrollSpy._ticks = 0;

  M.ScrollSpy = ScrollSpy;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(ScrollSpy, 'scrollSpy', 'M_ScrollSpy');
  }
})(cash, M.anime);
;(function ($) {
  'use strict';

  var _defaults = {
    data: {}, // Autocomplete data set
    limit: Infinity, // Limit of results the autocomplete shows
    onAutocomplete: null, // Callback for when autocompleted
    minLength: 1, // Min characters before autocomplete starts
    sortFunction: function (a, b, inputString) {
      // Sort function for sorting autocomplete results
      return a.indexOf(inputString) - b.indexOf(inputString);
    }
  };

  /**
   * @class
   *
   */

  var Autocomplete = function (_Component10) {
    _inherits(Autocomplete, _Component10);

    /**
     * Construct Autocomplete instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Autocomplete(el, options) {
      _classCallCheck(this, Autocomplete);

      var _this36 = _possibleConstructorReturn(this, (Autocomplete.__proto__ || Object.getPrototypeOf(Autocomplete)).call(this, Autocomplete, el, options));

      _this36.el.M_Autocomplete = _this36;

      /**
       * Options for the autocomplete
       * @member Autocomplete#options
       * @prop {Number} duration
       * @prop {Number} dist
       * @prop {number} shift
       * @prop {number} padding
       * @prop {Boolean} fullWidth
       * @prop {Boolean} indicators
       * @prop {Boolean} noWrap
       * @prop {Function} onCycleTo
       */
      _this36.options = $.extend({}, Autocomplete.defaults, options);

      // Setup
      _this36.isOpen = false;
      _this36.count = 0;
      _this36.activeIndex = -1;
      _this36.oldVal;
      _this36.$inputField = _this36.$el.closest('.input-field');
      _this36.$active = $();
      _this36._setupDropdown();

      _this36._setupEventHandlers();
      return _this36;
    }

    _createClass(Autocomplete, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this._removeDropdown();
        this.el.M_Autocomplete = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleInputBlurBound = this._handleInputBlur.bind(this);
        this._handleInputKeyupAndFocusBound = this._handleInputKeyupAndFocus.bind(this);
        this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
        this._handleContainerMousedownAndTouchstartBound = this._handleContainerMousedownAndTouchstart.bind(this);

        this.el.addEventListener('blur', this._handleInputBlurBound);
        this.el.addEventListener('keyup', this._handleInputKeyupAndFocusBound);
        this.el.addEventListener('focus', this._handleInputKeyupAndFocusBound);
        this.el.addEventListener('keydown', this._handleInputKeydownBound);
        this.container.addEventListener('mousedown', this._handleContainerMousedownAndTouchstartBound);

        if (typeof window.ontouchstart !== 'undefined') {
          this.container.addEventListener('touchstart', this._handleContainerMousedownAndTouchstartBound);
        }
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('blur', this._handleInputBlurBound);
        this.el.removeEventListener('keyup', this._handleInputKeyupAndFocusBound);
        this.el.removeEventListener('focus', this._handleInputKeyupAndFocusBound);
        this.el.removeEventListener('keydown', this._handleInputKeydownBound);
        this.container.removeEventListener('mousedown', this._handleContainerMousedownAndTouchstartBound);

        if (typeof window.ontouchstart !== 'undefined') {
          this.container.removeEventListener('touchstart', this._handleContainerMousedownAndTouchstartBound);
        }
      }

      /**
       * Setup dropdown
       */

    }, {
      key: "_setupDropdown",
      value: function _setupDropdown() {
        this.container = document.createElement('ul');
        this.container.id = "autocomplete-options-" + M.guid();
        $(this.container).addClass('autocomplete-content dropdown-content');
        this.$inputField.append(this.container);
        this.el.setAttribute('data-target', this.container.id);

        this.dropdown = M.Dropdown.init(this.el, {
          autoFocus: false,
          closeOnClick: false,
          coverTrigger: false
        });

        // Sketchy removal of dropdown click handler
        this.el.removeEventListener('click', this.dropdown._handleClickBound);
      }

      /**
       * Remove dropdown
       */

    }, {
      key: "_removeDropdown",
      value: function _removeDropdown() {
        this.container.parentNode.removeChild(this.container);
      }

      /**
       * Handle Input Blur
       */

    }, {
      key: "_handleInputBlur",
      value: function _handleInputBlur() {
        this.dropdown.close();
        this._resetAutocomplete();
      }

      /**
       * Handle Input Keyup and Focus
       * @param {Event} e
       */

    }, {
      key: "_handleInputKeyupAndFocus",
      value: function _handleInputKeyupAndFocus(e) {
        var _this37 = this;

        if (e.type === 'keyup') {
          Autocomplete._keydown = false;
        }

        this.count = 0;
        var val = this.el.value.toLowerCase();

        // Don't capture enter or arrow key usage.
        if (e.keyCode === 13 || e.keyCode === 38 || e.keyCode === 40) {
          return;
        }

        // Check if the input isn't empty
        if (this.oldVal !== val) {
          this._resetAutocomplete();

          if (val.length >= this.options.minLength) {
            this.isOpen = true;
            this._renderDropdown(this.options.data, val);
          }

          // Open dropdown
          if (!this.dropdown.isOpen) {
            // Timeout to prevent dropdown temp doc click handler from firing
            setTimeout(function () {
              _this37.dropdown.open();
            }, 100);

            // Recalculate dropdown when its already open
          } else {
            this.dropdown.recalculateDimensions();
          }
        }

        // Update oldVal
        this.oldVal = val;
      }

      /**
       * Handle Input Keydown
       * @param {Event} e
       */

    }, {
      key: "_handleInputKeydown",
      value: function _handleInputKeydown(e) {
        Autocomplete._keydown = true;

        // Arrow keys and enter key usage
        var keyCode = e.keyCode,
            liElement = void 0,
            numItems = $(this.container).children('li').length;

        // select element on Enter
        if (keyCode === 13 && this.activeIndex >= 0) {
          liElement = $(this.container).children('li').eq(this.activeIndex);
          if (liElement.length) {
            this.selectOption(liElement);
            e.preventDefault();
          }
          return;
        }

        // Capture up and down key
        if (keyCode === 38 || keyCode === 40) {
          e.preventDefault();

          if (keyCode === 38 && this.activeIndex > 0) {
            this.activeIndex--;
          }

          if (keyCode === 40 && this.activeIndex < numItems - 1) {
            this.activeIndex++;
          }

          this.$active.removeClass('active');
          if (this.activeIndex >= 0) {
            this.$active = $(this.container).children('li').eq(this.activeIndex);
            this.$active.addClass('active');
          }
        }
      }

      /**
       * Handle Container Mousedown and Touchstart
       * @param {Event} e
       */

    }, {
      key: "_handleContainerMousedownAndTouchstart",
      value: function _handleContainerMousedownAndTouchstart(e) {
        var $autocompleteOption = $(e.target).closest('li');
        this.selectOption($autocompleteOption);
      }

      /**
       * Highlight partial match
       */

    }, {
      key: "_highlight",
      value: function _highlight(string, $el) {
        var img = $el.find('img');
        var matchStart = $el.text().toLowerCase().indexOf("" + string.toLowerCase() + ""),
            matchEnd = matchStart + string.length - 1,
            beforeMatch = $el.text().slice(0, matchStart),
            matchText = $el.text().slice(matchStart, matchEnd + 1),
            afterMatch = $el.text().slice(matchEnd + 1);
        $el.html("<span>" + beforeMatch + "<span class='highlight'>" + matchText + "</span>" + afterMatch + "</span>");
        if (img.length) {
          $el.prepend(img);
        }
      }

      /**
       * Reset current element position
       */

    }, {
      key: "_resetCurrentElement",
      value: function _resetCurrentElement() {
        this.activeIndex = -1;
        this.$active.removeClass('active');
      }

      /**
       * Reset autocomplete elements
       */

    }, {
      key: "_resetAutocomplete",
      value: function _resetAutocomplete() {
        $(this.container).empty();
        this._resetCurrentElement();
        this.oldVal = null;
        this.isOpen = false;
      }

      /**
       * Select autocomplete option
       * @param {Element} el  Autocomplete option list item element
       */

    }, {
      key: "selectOption",
      value: function selectOption(el) {
        var text = el.text().trim();
        this.el.value = text;
        this.$el.trigger('change');
        this._resetAutocomplete();
        this.dropdown.close();

        // Handle onAutocomplete callback.
        if (typeof this.options.onAutocomplete === 'function') {
          this.options.onAutocomplete.call(this, text);
        }
      }

      /**
       * Render dropdown content
       * @param {Object} data  data set
       * @param {String} val  current input value
       */

    }, {
      key: "_renderDropdown",
      value: function _renderDropdown(data, val) {
        var _this38 = this;

        this._resetAutocomplete();

        var matchingData = [];

        // Gather all matching data
        for (var key in data) {
          if (data.hasOwnProperty(key) && key.toLowerCase().indexOf(val) !== -1) {
            // Break if past limit
            if (this.count >= this.options.limit) {
              break;
            }

            var entry = {
              data: data[key],
              key: key
            };
            matchingData.push(entry);

            this.count++;
          }
        }

        // Sort
        var sortFunctionBound = function (a, b) {
          return _this38.options.sortFunction(a.key.toLowerCase(), b.key.toLowerCase(), val.toLowerCase());
        };
        matchingData.sort(sortFunctionBound);

        // Render
        for (var i = 0; i < matchingData.length; i++) {
          var _entry = matchingData[i];
          var $autocompleteOption = $('<li></li>');
          if (!!_entry.data) {
            $autocompleteOption.append('<img src="' + _entry.data + '" class="right circle"><span>' + _entry.key + '</span>');
          } else {
            $autocompleteOption.append('<span>' + _entry.key + '</span>');
          }

          $(this.container).append($autocompleteOption);
          this._highlight(val, $autocompleteOption);
        }
      }

      /**
       * Update Data
       * @param {Object} data
       */

    }, {
      key: "updateData",
      value: function updateData(data) {
        var val = this.el.value.toLowerCase();
        this.options.data = data;

        if (this.isOpen) {
          this._renderDropdown(data, val);
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Autocomplete.__proto__ || Object.getPrototypeOf(Autocomplete), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Autocomplete;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Autocomplete;
  }(Component);

  /**
   * @static
   * @memberof Autocomplete
   */


  Autocomplete._keydown = false;

  M.Autocomplete = Autocomplete;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Autocomplete, 'autocomplete', 'M_Autocomplete');
  }
})(cash);
;(function ($) {
  // Function to update labels of text fields
  M.updateTextFields = function () {
    var input_selector = 'input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], input[type=search], input[type=date], input[type=time], textarea';
    $(input_selector).each(function (element, index) {
      var $this = $(this);
      if (element.value.length > 0 || $(element).is(':focus') || element.autofocus || $this.attr('placeholder') !== null) {
        $this.siblings('label').addClass('active');
      } else if (element.validity) {
        $this.siblings('label').toggleClass('active', element.validity.badInput === true);
      } else {
        $this.siblings('label').removeClass('active');
      }
    });
  };

  M.validate_field = function (object) {
    var hasLength = object.attr('data-length') !== null;
    var lenAttr = parseInt(object.attr('data-length'));
    var len = object[0].value.length;

    if (len === 0 && object[0].validity.badInput === false && !object.is(':required')) {
      if (object.hasClass('validate')) {
        object.removeClass('valid');
        object.removeClass('invalid');
      }
    } else {
      if (object.hasClass('validate')) {
        // Check for character counter attributes
        if (object.is(':valid') && hasLength && len <= lenAttr || object.is(':valid') && !hasLength) {
          object.removeClass('invalid');
          object.addClass('valid');
        } else {
          object.removeClass('valid');
          object.addClass('invalid');
        }
      }
    }
  };

  M.textareaAutoResize = function ($textarea) {
    // Wrap if native element
    if ($textarea instanceof Element) {
      $textarea = $($textarea);
    }

    if (!$textarea.length) {
      console.error("No textarea element found");
      return;
    }

    // Textarea Auto Resize
    var hiddenDiv = $('.hiddendiv').first();
    if (!hiddenDiv.length) {
      hiddenDiv = $('<div class="hiddendiv common"></div>');
      $('body').append(hiddenDiv);
    }

    // Set font properties of hiddenDiv
    var fontFamily = $textarea.css('font-family');
    var fontSize = $textarea.css('font-size');
    var lineHeight = $textarea.css('line-height');

    // Firefox can't handle padding shorthand.
    var paddingTop = $textarea.css('padding-top');
    var paddingRight = $textarea.css('padding-right');
    var paddingBottom = $textarea.css('padding-bottom');
    var paddingLeft = $textarea.css('padding-left');

    if (fontSize) {
      hiddenDiv.css('font-size', fontSize);
    }
    if (fontFamily) {
      hiddenDiv.css('font-family', fontFamily);
    }
    if (lineHeight) {
      hiddenDiv.css('line-height', lineHeight);
    }
    if (paddingTop) {
      hiddenDiv.css('padding-top', paddingTop);
    }
    if (paddingRight) {
      hiddenDiv.css('padding-right', paddingRight);
    }
    if (paddingBottom) {
      hiddenDiv.css('padding-bottom', paddingBottom);
    }
    if (paddingLeft) {
      hiddenDiv.css('padding-left', paddingLeft);
    }

    // Set original-height, if none
    if (!$textarea.data('original-height')) {
      $textarea.data('original-height', $textarea.height());
    }

    if ($textarea.attr('wrap') === 'off') {
      hiddenDiv.css('overflow-wrap', 'normal').css('white-space', 'pre');
    }

    hiddenDiv.text($textarea[0].value + '\n');
    var content = hiddenDiv.html().replace(/\n/g, '<br>');
    hiddenDiv.html(content);

    // When textarea is hidden, width goes crazy.
    // Approximate with half of window size

    if ($textarea[0].offsetWidth > 0 && $textarea[0].offsetHeight > 0) {
      hiddenDiv.css('width', $textarea.width() + 'px');
    } else {
      hiddenDiv.css('width', window.innerWidth / 2 + 'px');
    }

    /**
     * Resize if the new height is greater than the
     * original height of the textarea
     */
    if ($textarea.data('original-height') <= hiddenDiv.innerHeight()) {
      $textarea.css('height', hiddenDiv.innerHeight() + 'px');
    } else if ($textarea[0].value.length < $textarea.data('previous-length')) {
      /**
       * In case the new height is less than original height, it
       * means the textarea has less text than before
       * So we set the height to the original one
       */
      $textarea.css('height', $textarea.data('original-height') + 'px');
    }
    $textarea.data('previous-length', $textarea[0].value.length);
  };

  $(document).ready(function () {
    // Text based inputs
    var input_selector = 'input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], input[type=search], input[type=date], input[type=time], textarea';

    // Add active if form auto complete
    $(document).on('change', input_selector, function () {
      if (this.value.length !== 0 || $(this).attr('placeholder') !== null) {
        $(this).siblings('label').addClass('active');
      }
      M.validate_field($(this));
    });

    // Add active if input element has been pre-populated on document ready
    $(document).ready(function () {
      M.updateTextFields();
    });

    // HTML DOM FORM RESET handling
    $(document).on('reset', function (e) {
      var formReset = $(e.target);
      if (formReset.is('form')) {
        formReset.find(input_selector).removeClass('valid').removeClass('invalid');
        formReset.find(input_selector).each(function (e) {
          if (this.value.length) {
            $(this).siblings('label').removeClass('active');
          }
        });

        // Reset select (after native reset)
        setTimeout(function () {
          formReset.find('select').each(function () {
            // check if initialized
            if (this.M_FormSelect) {
              var reset_text = $(this).find('option[selected]').text();
              $(this).siblings('input.select-dropdown')[0].value = reset_text;
            }
          });
        }, 0);
      }
    });

    /**
     * Add active when element has focus
     * @param {Event} e
     */
    document.addEventListener('focus', function (e) {
      if ($(e.target).is(input_selector)) {
        $(e.target).siblings('label, .prefix').addClass('active');
      }
    }, true);

    /**
     * Remove active when element is blurred
     * @param {Event} e
     */
    document.addEventListener('blur', function (e) {
      var $inputElement = $(e.target);
      if ($inputElement.is(input_selector)) {
        var selector = ".prefix";

        if ($inputElement[0].value.length === 0 && $inputElement[0].validity.badInput !== true && $inputElement.attr('placeholder') === null) {
          selector += ", label";
        }
        $inputElement.siblings(selector).removeClass('active');
        M.validate_field($inputElement);
      }
    }, true);

    // Radio and Checkbox focus class
    var radio_checkbox = 'input[type=radio], input[type=checkbox]';
    $(document).on('keyup', radio_checkbox, function (e) {
      // TAB, check if tabbing to radio or checkbox.
      if (e.which === M.keys.TAB) {
        $(this).addClass('tabbed');
        var $this = $(this);
        $this.one('blur', function (e) {
          $(this).removeClass('tabbed');
        });
        return;
      }
    });

    var text_area_selector = '.materialize-textarea';
    $(text_area_selector).each(function () {
      var $textarea = $(this);
      /**
       * Resize textarea on document load after storing
       * the original height and the original length
       */
      $textarea.data('original-height', $textarea.height());
      $textarea.data('previous-length', this.value.length);
      M.textareaAutoResize($textarea);
    });

    $(document).on('keyup', text_area_selector, function () {
      M.textareaAutoResize($(this));
    });
    $(document).on('keydown', text_area_selector, function () {
      M.textareaAutoResize($(this));
    });

    // File Input Path
    $(document).on('change', '.file-field input[type="file"]', function () {
      var file_field = $(this).closest('.file-field');
      var path_input = file_field.find('input.file-path');
      var files = $(this)[0].files;
      var file_names = [];
      for (var i = 0; i < files.length; i++) {
        file_names.push(files[i].name);
      }
      path_input[0].value = file_names.join(", ");
      path_input.trigger('change');
    });
  }); // End of $(document).ready
})(cash);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    indicators: true,
    height: 400,
    duration: 500,
    interval: 6000
  };

  /**
   * @class
   *
   */

  var Slider = function (_Component11) {
    _inherits(Slider, _Component11);

    /**
     * Construct Slider instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Slider(el, options) {
      _classCallCheck(this, Slider);

      var _this39 = _possibleConstructorReturn(this, (Slider.__proto__ || Object.getPrototypeOf(Slider)).call(this, Slider, el, options));

      _this39.el.M_Slider = _this39;

      /**
       * Options for the modal
       * @member Slider#options
       * @prop {Boolean} [indicators=true] - Show indicators
       * @prop {Number} [height=400] - height of slider
       * @prop {Number} [duration=500] - Length in ms of slide transition
       * @prop {Number} [interval=6000] - Length in ms of slide interval
       */
      _this39.options = $.extend({}, Slider.defaults, options);

      // setup
      _this39.$slider = _this39.$el.find('.slides');
      _this39.$slides = _this39.$slider.children('li');
      _this39.activeIndex = _this39.$slides.filter(function (item) {
        return $(item).hasClass('active');
      }).first().index();
      if (_this39.activeIndex != -1) {
        _this39.$active = _this39.$slides.eq(_this39.activeIndex);
      }

      _this39._setSliderHeight();

      // Set initial positions of captions
      _this39.$slides.find('.caption').each(function (el) {
        _this39._animateCaptionIn(el, 0);
      });

      // Move img src into background-image
      _this39.$slides.find('img').each(function (el) {
        var placeholderBase64 = 'data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
        if ($(el).attr('src') !== placeholderBase64) {
          $(el).css('background-image', 'url("' + $(el).attr('src') + '")');
          $(el).attr('src', placeholderBase64);
        }
      });

      _this39._setupIndicators();

      // Show active slide
      if (_this39.$active) {
        _this39.$active.css('display', 'block');
      } else {
        _this39.$slides.first().addClass('active');
        anim({
          targets: _this39.$slides.first()[0],
          opacity: 1,
          duration: _this39.options.duration,
          easing: 'easeOutQuad'
        });

        _this39.activeIndex = 0;
        _this39.$active = _this39.$slides.eq(_this39.activeIndex);

        // Update indicators
        if (_this39.options.indicators) {
          _this39.$indicators.eq(_this39.activeIndex).addClass('active');
        }
      }

      // Adjust height to current slide
      _this39.$active.find('img').each(function (el) {
        anim({
          targets: _this39.$active.find('.caption')[0],
          opacity: 1,
          translateX: 0,
          translateY: 0,
          duration: _this39.options.duration,
          easing: 'easeOutQuad'
        });
      });

      _this39._setupEventHandlers();

      // auto scroll
      _this39.start();
      return _this39;
    }

    _createClass(Slider, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this.pause();
        this._removeIndicators();
        this._removeEventHandlers();
        this.el.M_Slider = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        var _this40 = this;

        this._handleIntervalBound = this._handleInterval.bind(this);
        this._handleIndicatorClickBound = this._handleIndicatorClick.bind(this);

        if (this.options.indicators) {
          this.$indicators.each(function (el) {
            el.addEventListener('click', _this40._handleIndicatorClickBound);
          });
        }
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        var _this41 = this;

        if (this.options.indicators) {
          this.$indicators.each(function (el) {
            el.removeEventListener('click', _this41._handleIndicatorClickBound);
          });
        }
      }

      /**
       * Handle indicator click
       * @param {Event} e
       */

    }, {
      key: "_handleIndicatorClick",
      value: function _handleIndicatorClick(e) {
        var currIndex = $(e.target).index();
        this.set(currIndex);
      }

      /**
       * Handle Interval
       */

    }, {
      key: "_handleInterval",
      value: function _handleInterval() {
        var newActiveIndex = this.$slider.find('.active').index();
        if (this.$slides.length === newActiveIndex + 1) newActiveIndex = 0; // loop to start
        else newActiveIndex += 1;

        this.set(newActiveIndex);
      }

      /**
       * Animate in caption
       * @param {Element} caption
       * @param {Number} duration
       */

    }, {
      key: "_animateCaptionIn",
      value: function _animateCaptionIn(caption, duration) {
        var animOptions = {
          targets: caption,
          opacity: 0,
          duration: duration,
          easing: 'easeOutQuad'
        };

        if ($(caption).hasClass('center-align')) {
          animOptions.translateY = -100;
        } else if ($(caption).hasClass('right-align')) {
          animOptions.translateX = 100;
        } else if ($(caption).hasClass('left-align')) {
          animOptions.translateX = -100;
        }

        anim(animOptions);
      }

      /**
       * Set height of slider
       */

    }, {
      key: "_setSliderHeight",
      value: function _setSliderHeight() {
        // If fullscreen, do nothing
        if (!this.$el.hasClass('fullscreen')) {
          if (this.options.indicators) {
            // Add height if indicators are present
            this.$el.css('height', this.options.height + 40 + 'px');
          } else {
            this.$el.css('height', this.options.height + 'px');
          }
          this.$slider.css('height', this.options.height + 'px');
        }
      }

      /**
       * Setup indicators
       */

    }, {
      key: "_setupIndicators",
      value: function _setupIndicators() {
        var _this42 = this;

        if (this.options.indicators) {
          this.$indicators = $('<ul class="indicators"></ul>');
          this.$slides.each(function (el, index) {
            var $indicator = $('<li class="indicator-item"></li>');
            _this42.$indicators.append($indicator[0]);
          });
          this.$el.append(this.$indicators[0]);
          this.$indicators = this.$indicators.children('li.indicator-item');
        }
      }

      /**
       * Remove indicators
       */

    }, {
      key: "_removeIndicators",
      value: function _removeIndicators() {
        this.$el.find('ul.indicators').remove();
      }

      /**
       * Cycle to nth item
       * @param {Number} index
       */

    }, {
      key: "set",
      value: function set(index) {
        var _this43 = this;

        // Wrap around indices.
        if (index >= this.$slides.length) index = 0;else if (index < 0) index = this.$slides.length - 1;

        // Only do if index changes
        if (this.activeIndex != index) {
          this.$active = this.$slides.eq(this.activeIndex);
          var $caption = this.$active.find('.caption');
          this.$active.removeClass('active');

          anim({
            targets: this.$active[0],
            opacity: 0,
            duration: this.options.duration,
            easing: 'easeOutQuad',
            complete: function () {
              _this43.$slides.not('.active').each(function (el) {
                anim({
                  targets: el,
                  opacity: 0,
                  translateX: 0,
                  translateY: 0,
                  duration: 0,
                  easing: 'easeOutQuad'
                });
              });
            }
          });

          this._animateCaptionIn($caption[0], this.options.duration);

          // Update indicators
          if (this.options.indicators) {
            this.$indicators.eq(this.activeIndex).removeClass('active');
            this.$indicators.eq(index).addClass('active');
          }

          anim({
            targets: this.$slides.eq(index)[0],
            opacity: 1,
            duration: this.options.duration,
            easing: 'easeOutQuad'
          });

          anim({
            targets: this.$slides.eq(index).find('.caption')[0],
            opacity: 1,
            translateX: 0,
            translateY: 0,
            duration: this.options.duration,
            delay: this.options.duration,
            easing: 'easeOutQuad'
          });

          this.$slides.eq(index).addClass('active');
          this.activeIndex = index;

          // Reset interval
          this.start();
        }
      }

      /**
       * Pause slider interval
       */

    }, {
      key: "pause",
      value: function pause() {
        clearInterval(this.interval);
      }

      /**
       * Start slider interval
       */

    }, {
      key: "start",
      value: function start() {
        clearInterval(this.interval);
        this.interval = setInterval(this._handleIntervalBound, this.options.duration + this.options.interval);
      }

      /**
       * Move to next slide
       */

    }, {
      key: "next",
      value: function next() {
        var newIndex = this.activeIndex + 1;

        // Wrap around indices.
        if (newIndex >= this.$slides.length) newIndex = 0;else if (newIndex < 0) newIndex = this.$slides.length - 1;

        this.set(newIndex);
      }

      /**
       * Move to previous slide
       */

    }, {
      key: "prev",
      value: function prev() {
        var newIndex = this.activeIndex - 1;

        // Wrap around indices.
        if (newIndex >= this.$slides.length) newIndex = 0;else if (newIndex < 0) newIndex = this.$slides.length - 1;

        this.set(newIndex);
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Slider.__proto__ || Object.getPrototypeOf(Slider), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Slider;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Slider;
  }(Component);

  M.Slider = Slider;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Slider, 'slider', 'M_Slider');
  }
})(cash, M.anime);
;(function ($, anim) {
  $(document).on('click', '.card', function (e) {
    if ($(this).children('.card-reveal').length) {
      var $card = $(e.target).closest('.card');
      if ($card.data('initialOverflow') === undefined) {
        $card.data('initialOverflow', $card.css('overflow') === undefined ? '' : $card.css('overflow'));
      }
      var $cardReveal = $(this).find('.card-reveal');
      if ($(e.target).is($('.card-reveal .card-title')) || $(e.target).is($('.card-reveal .card-title i'))) {
        // Make Reveal animate down and display none
        anim({
          targets: $cardReveal[0],
          translateY: 0,
          duration: 225,
          easing: 'easeInOutQuad',
          complete: function (anim) {
            var el = anim.animatables[0].target;
            $(el).css({ display: 'none' });
            $card.css('overflow', $card.data('initialOverflow'));
          }
        });
      } else if ($(e.target).is($('.card .activator')) || $(e.target).is($('.card .activator i'))) {
        $card.css('overflow', 'hidden');
        $cardReveal.css({ display: 'block' });
        anim({
          targets: $cardReveal[0],
          translateY: '-100%',
          duration: 300,
          easing: 'easeInOutQuad'
        });
      }
    }
  });
})(cash, M.anime);
;(function ($) {
  'use strict';

  var _defaults = {
    data: [],
    placeholder: '',
    secondaryPlaceholder: '',
    autocompleteOptions: {},
    limit: Infinity,
    onChipAdd: null,
    onChipSelect: null,
    onChipDelete: null
  };

  /**
   * @typedef {Object} chip
   * @property {String} tag  chip tag string
   * @property {String} [image]  chip avatar image string
   */

  /**
   * @class
   *
   */

  var Chips = function (_Component12) {
    _inherits(Chips, _Component12);

    /**
     * Construct Chips instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Chips(el, options) {
      _classCallCheck(this, Chips);

      var _this44 = _possibleConstructorReturn(this, (Chips.__proto__ || Object.getPrototypeOf(Chips)).call(this, Chips, el, options));

      _this44.el.M_Chips = _this44;

      /**
       * Options for the modal
       * @member Chips#options
       * @prop {Array} data
       * @prop {String} placeholder
       * @prop {String} secondaryPlaceholder
       * @prop {Object} autocompleteOptions
       */
      _this44.options = $.extend({}, Chips.defaults, options);

      _this44.$el.addClass('chips input-field');
      _this44.chipsData = [];
      _this44.$chips = $();
      _this44._setupInput();
      _this44.hasAutocomplete = Object.keys(_this44.options.autocompleteOptions).length > 0;

      // Set input id
      if (!_this44.$input.attr('id')) {
        _this44.$input.attr('id', M.guid());
      }

      // Render initial chips
      if (_this44.options.data.length) {
        _this44.chipsData = _this44.options.data;
        _this44._renderChips(_this44.chipsData);
      }

      // Setup autocomplete if needed
      if (_this44.hasAutocomplete) {
        _this44._setupAutocomplete();
      }

      _this44._setPlaceholder();
      _this44._setupLabel();
      _this44._setupEventHandlers();
      return _this44;
    }

    _createClass(Chips, [{
      key: "getData",


      /**
       * Get Chips Data
       */
      value: function getData() {
        return this.chipsData;
      }

      /**
       * Teardown component
       */

    }, {
      key: "destroy",
      value: function destroy() {
        this._removeEventHandlers();
        this.$chips.remove();
        this.el.M_Chips = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleChipClickBound = this._handleChipClick.bind(this);
        this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
        this._handleInputFocusBound = this._handleInputFocus.bind(this);
        this._handleInputBlurBound = this._handleInputBlur.bind(this);

        this.el.addEventListener('click', this._handleChipClickBound);
        document.addEventListener('keydown', Chips._handleChipsKeydown);
        document.addEventListener('keyup', Chips._handleChipsKeyup);
        this.el.addEventListener('blur', Chips._handleChipsBlur, true);
        this.$input[0].addEventListener('focus', this._handleInputFocusBound);
        this.$input[0].addEventListener('blur', this._handleInputBlurBound);
        this.$input[0].addEventListener('keydown', this._handleInputKeydownBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('click', this._handleChipClickBound);
        document.removeEventListener('keydown', Chips._handleChipsKeydown);
        document.removeEventListener('keyup', Chips._handleChipsKeyup);
        this.el.removeEventListener('blur', Chips._handleChipsBlur, true);
        this.$input[0].removeEventListener('focus', this._handleInputFocusBound);
        this.$input[0].removeEventListener('blur', this._handleInputBlurBound);
        this.$input[0].removeEventListener('keydown', this._handleInputKeydownBound);
      }

      /**
       * Handle Chip Click
       * @param {Event} e
       */

    }, {
      key: "_handleChipClick",
      value: function _handleChipClick(e) {
        var $chip = $(e.target).closest('.chip');
        var clickedClose = $(e.target).is('.close');
        if ($chip.length) {
          var index = $chip.index();
          if (clickedClose) {
            // delete chip
            this.deleteChip(index);
            this.$input[0].focus();
          } else {
            // select chip
            this.selectChip(index);
          }

          // Default handle click to focus on input
        } else {
          this.$input[0].focus();
        }
      }

      /**
       * Handle Chips Keydown
       * @param {Event} e
       */

    }, {
      key: "_handleInputFocus",


      /**
       * Handle Input Focus
       */
      value: function _handleInputFocus() {
        this.$el.addClass('focus');
      }

      /**
       * Handle Input Blur
       */

    }, {
      key: "_handleInputBlur",
      value: function _handleInputBlur() {
        this.$el.removeClass('focus');
      }

      /**
       * Handle Input Keydown
       * @param {Event} e
       */

    }, {
      key: "_handleInputKeydown",
      value: function _handleInputKeydown(e) {
        Chips._keydown = true;

        // enter
        if (e.keyCode === 13) {
          // Override enter if autocompleting.
          if (this.hasAutocomplete && this.autocomplete && this.autocomplete.isOpen) {
            return;
          }

          e.preventDefault();
          this.addChip({
            tag: this.$input[0].value
          });
          this.$input[0].value = '';

          // delete or left
        } else if ((e.keyCode === 8 || e.keyCode === 37) && this.$input[0].value === '' && this.chipsData.length) {
          e.preventDefault();
          this.selectChip(this.chipsData.length - 1);
        }
      }

      /**
       * Render Chip
       * @param {chip} chip
       * @return {Element}
       */

    }, {
      key: "_renderChip",
      value: function _renderChip(chip) {
        if (!chip.tag) {
          return;
        }

        var renderedChip = document.createElement('div');
        var closeIcon = document.createElement('i');
        renderedChip.classList.add('chip');
        renderedChip.textContent = chip.tag;
        renderedChip.setAttribute('tabindex', 0);
        $(closeIcon).addClass('material-icons close');
        closeIcon.textContent = 'close';

        // attach image if needed
        if (chip.image) {
          var img = document.createElement('img');
          img.setAttribute('src', chip.image);
          renderedChip.insertBefore(img, renderedChip.firstChild);
        }

        renderedChip.appendChild(closeIcon);
        return renderedChip;
      }

      /**
       * Render Chips
       */

    }, {
      key: "_renderChips",
      value: function _renderChips() {
        this.$chips.remove();
        for (var i = 0; i < this.chipsData.length; i++) {
          var chipEl = this._renderChip(this.chipsData[i]);
          this.$el.append(chipEl);
          this.$chips.add(chipEl);
        }

        // move input to end
        this.$el.append(this.$input[0]);
      }

      /**
       * Setup Autocomplete
       */

    }, {
      key: "_setupAutocomplete",
      value: function _setupAutocomplete() {
        var _this45 = this;

        this.options.autocompleteOptions.onAutocomplete = function (val) {
          _this45.addChip({
            tag: val
          });
          _this45.$input[0].value = '';
          _this45.$input[0].focus();
        };

        this.autocomplete = M.Autocomplete.init(this.$input[0], this.options.autocompleteOptions);
      }

      /**
       * Setup Input
       */

    }, {
      key: "_setupInput",
      value: function _setupInput() {
        this.$input = this.$el.find('input');
        if (!this.$input.length) {
          this.$input = $('<input></input>');
          this.$el.append(this.$input);
        }

        this.$input.addClass('input');
      }

      /**
       * Setup Label
       */

    }, {
      key: "_setupLabel",
      value: function _setupLabel() {
        this.$label = this.$el.find('label');
        if (this.$label.length) {
          this.$label.setAttribute('for', this.$input.attr('id'));
        }
      }

      /**
       * Set placeholder
       */

    }, {
      key: "_setPlaceholder",
      value: function _setPlaceholder() {
        if (this.chipsData !== undefined && !this.chipsData.length && this.options.placeholder) {
          $(this.$input).prop('placeholder', this.options.placeholder);
        } else if ((this.chipsData === undefined || !!this.chipsData.length) && this.options.secondaryPlaceholder) {
          $(this.$input).prop('placeholder', this.options.secondaryPlaceholder);
        }
      }

      /**
       * Check if chip is valid
       * @param {chip} chip
       */

    }, {
      key: "_isValid",
      value: function _isValid(chip) {
        if (chip.hasOwnProperty('tag') && chip.tag !== '') {
          var exists = false;
          for (var i = 0; i < this.chipsData.length; i++) {
            if (this.chipsData[i].tag === chip.tag) {
              exists = true;
              break;
            }
          }
          return !exists;
        }

        return false;
      }

      /**
       * Add chip
       * @param {chip} chip
       */

    }, {
      key: "addChip",
      value: function addChip(chip) {
        if (!this._isValid(chip) || this.chipsData.length >= this.options.limit) {
          return;
        }

        var renderedChip = this._renderChip(chip);
        this.$chips.add(renderedChip);
        this.chipsData.push(chip);
        $(this.$input).before(renderedChip);
        this._setPlaceholder();

        // fire chipAdd callback
        if (typeof this.options.onChipAdd === 'function') {
          this.options.onChipAdd.call(this, this.$el, renderedChip);
        }
      }

      /**
       * Delete chip
       * @param {Number} chip
       */

    }, {
      key: "deleteChip",
      value: function deleteChip(chipIndex) {
        var $chip = this.$chips.eq(chipIndex);
        this.$chips.eq(chipIndex).remove();
        this.$chips = this.$chips.filter(function (el) {
          return $(el).index() >= 0;
        });
        this.chipsData.splice(chipIndex, 1);
        this._setPlaceholder();

        // fire chipDelete callback
        if (typeof this.options.onChipDelete === 'function') {
          this.options.onChipDelete.call(this, this.$el, $chip[0]);
        }
      }

      /**
       * Select chip
       * @param {Number} chip
       */

    }, {
      key: "selectChip",
      value: function selectChip(chipIndex) {
        var $chip = this.$chips.eq(chipIndex);
        this._selectedChip = $chip;
        $chip[0].focus();

        // fire chipSelect callback
        if (typeof this.options.onChipSelect === 'function') {
          this.options.onChipSelect.call(this, this.$el, $chip[0]);
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Chips.__proto__ || Object.getPrototypeOf(Chips), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Chips;
      }
    }, {
      key: "_handleChipsKeydown",
      value: function _handleChipsKeydown(e) {
        Chips._keydown = true;

        var $chips = $(e.target).closest('.chips');
        var chipsKeydown = e.target && $chips.length;

        // Don't handle keydown inputs on input and textarea
        if ($(e.target).is('input, textarea') || !chipsKeydown) {
          return;
        }

        var currChips = $chips[0].M_Chips;

        // backspace and delete
        if (e.keyCode === 8 || e.keyCode === 46) {
          e.preventDefault();

          var selectIndex = currChips.chipsData.length;
          if (currChips._selectedChip) {
            var index = currChips._selectedChip.index();
            currChips.deleteChip(index);
            currChips._selectedChip = null;

            // Make sure selectIndex doesn't go negative
            selectIndex = Math.max(index - 1, 0);
          }

          if (currChips.chipsData.length) {
            currChips.selectChip(selectIndex);
          }

          // left arrow key
        } else if (e.keyCode === 37) {
          if (currChips._selectedChip) {
            var _selectIndex = currChips._selectedChip.index() - 1;
            if (_selectIndex < 0) {
              return;
            }
            currChips.selectChip(_selectIndex);
          }

          // right arrow key
        } else if (e.keyCode === 39) {
          if (currChips._selectedChip) {
            var _selectIndex2 = currChips._selectedChip.index() + 1;

            if (_selectIndex2 >= currChips.chipsData.length) {
              currChips.$input[0].focus();
            } else {
              currChips.selectChip(_selectIndex2);
            }
          }
        }
      }

      /**
       * Handle Chips Keyup
       * @param {Event} e
       */

    }, {
      key: "_handleChipsKeyup",
      value: function _handleChipsKeyup(e) {
        Chips._keydown = false;
      }

      /**
       * Handle Chips Blur
       * @param {Event} e
       */

    }, {
      key: "_handleChipsBlur",
      value: function _handleChipsBlur(e) {
        if (!Chips._keydown) {
          var $chips = $(e.target).closest('.chips');
          var currChips = $chips[0].M_Chips;

          currChips._selectedChip = null;
        }
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Chips;
  }(Component);

  /**
   * @static
   * @memberof Chips
   */


  Chips._keydown = false;

  M.Chips = Chips;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Chips, 'chips', 'M_Chips');
  }

  $(document).ready(function () {
    // Handle removal of static chips.
    $(document.body).on('click', '.chip .close', function () {
      var $chips = $(this).closest('.chips');
      if ($chips.length && $chips[0].M_Chips) {
        return;
      }
      $(this).closest('.chip').remove();
    });
  });
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {
    top: 0,
    bottom: Infinity,
    offset: 0,
    onPositionChange: null
  };

  /**
   * @class
   *
   */

  var Pushpin = function (_Component13) {
    _inherits(Pushpin, _Component13);

    /**
     * Construct Pushpin instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Pushpin(el, options) {
      _classCallCheck(this, Pushpin);

      var _this46 = _possibleConstructorReturn(this, (Pushpin.__proto__ || Object.getPrototypeOf(Pushpin)).call(this, Pushpin, el, options));

      _this46.el.M_Pushpin = _this46;

      /**
       * Options for the modal
       * @member Pushpin#options
       */
      _this46.options = $.extend({}, Pushpin.defaults, options);

      _this46.originalOffset = _this46.el.offsetTop;
      Pushpin._pushpins.push(_this46);
      _this46._setupEventHandlers();
      _this46._updatePosition();
      return _this46;
    }

    _createClass(Pushpin, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this.el.style.top = null;
        this._removePinClasses();
        this._removeEventHandlers();

        // Remove pushpin Inst
        var index = Pushpin._pushpins.indexOf(this);
        Pushpin._pushpins.splice(index, 1);
      }
    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        document.addEventListener('scroll', Pushpin._updateElements);
      }
    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        document.removeEventListener('scroll', Pushpin._updateElements);
      }
    }, {
      key: "_updatePosition",
      value: function _updatePosition() {
        var scrolled = M.getDocumentScrollTop() + this.options.offset;

        if (this.options.top <= scrolled && this.options.bottom >= scrolled && !this.el.classList.contains('pinned')) {
          this._removePinClasses();

          this.el.style.top = this.options.offset + "px";
          this.el.classList.add('pinned');

          // onPositionChange callback
          if (typeof this.options.onPositionChange === 'function') {
            this.options.onPositionChange.call(this, 'pinned');
          }
        }

        // Add pin-top (when scrolled position is above top)
        if (scrolled < this.options.top && !this.el.classList.contains('pin-top')) {
          this._removePinClasses();
          this.el.style.top = 0;
          this.el.classList.add('pin-top');

          // onPositionChange callback
          if (typeof this.options.onPositionChange === 'function') {
            this.options.onPositionChange.call(this, 'pin-top');
          }
        }

        // Add pin-bottom (when scrolled position is below bottom)
        if (scrolled > this.options.bottom && !this.el.classList.contains('pin-bottom')) {
          this._removePinClasses();
          this.el.classList.add('pin-bottom');
          this.el.style.top = this.options.bottom - this.originalOffset + "px";

          // onPositionChange callback
          if (typeof this.options.onPositionChange === 'function') {
            this.options.onPositionChange.call(this, 'pin-bottom');
          }
        }
      }
    }, {
      key: "_removePinClasses",
      value: function _removePinClasses() {
        this.el.classList.remove('pin-top', 'pinned', 'pin-bottom');
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Pushpin.__proto__ || Object.getPrototypeOf(Pushpin), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Pushpin;
      }
    }, {
      key: "_updateElements",
      value: function _updateElements() {
        for (var elIndex in Pushpin._pushpins) {
          var pInstance = Pushpin._pushpins[elIndex];
          pInstance._updatePosition();
        }
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Pushpin;
  }(Component);

  /**
   * @static
   * @memberof Pushpin
   */


  Pushpin._pushpins = [];

  M.Pushpin = Pushpin;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Pushpin, 'pushpin', 'M_Pushpin');
  }
})(cash);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    direction: 'top',
    hoverEnabled: true,
    toolbarEnabled: false
  };

  $.fn.reverse = [].reverse;

  /**
   * @class
   *
   */

  var FloatingActionButton = function (_Component14) {
    _inherits(FloatingActionButton, _Component14);

    /**
     * Construct FloatingActionButton instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function FloatingActionButton(el, options) {
      _classCallCheck(this, FloatingActionButton);

      var _this47 = _possibleConstructorReturn(this, (FloatingActionButton.__proto__ || Object.getPrototypeOf(FloatingActionButton)).call(this, FloatingActionButton, el, options));

      _this47.el.M_FloatingActionButton = _this47;

      /**
       * Options for the fab
       * @member FloatingActionButton#options
       * @prop {Boolean} [direction] - Direction fab menu opens
       * @prop {Boolean} [hoverEnabled=true] - Enable hover vs click
       * @prop {Boolean} [toolbarEnabled=false] - Enable toolbar transition
       */
      _this47.options = $.extend({}, FloatingActionButton.defaults, options);

      _this47.isOpen = false;
      _this47.$anchor = _this47.$el.children('a').first();
      _this47.$menu = _this47.$el.children('ul').first();
      _this47.$floatingBtns = _this47.$el.find('ul .btn-floating');
      _this47.$floatingBtnsReverse = _this47.$el.find('ul .btn-floating').reverse();
      _this47.offsetY = 0;
      _this47.offsetX = 0;
      if (_this47.options.direction === 'top') {
        _this47.$el.addClass('direction-top');
        _this47.offsetY = 40;
      } else if (_this47.options.direction === 'right') {
        _this47.$el.addClass('direction-right');
        _this47.offsetX = -40;
      } else if (_this47.options.direction === 'bottom') {
        _this47.$el.addClass('direction-bottom');
        _this47.offsetY = -40;
      } else {
        _this47.$el.addClass('direction-left');
        _this47.offsetX = 40;
      }
      _this47._setupEventHandlers();
      return _this47;
    }

    _createClass(FloatingActionButton, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.M_FloatingActionButton = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleFABClickBound = this._handleFABClick.bind(this);
        this._handleOpenBound = this.open.bind(this);
        this._handleCloseBound = this.close.bind(this);

        if (this.options.hoverEnabled && !this.options.toolbarEnabled) {
          this.el.addEventListener('mouseenter', this._handleOpenBound);
          this.el.addEventListener('mouseleave', this._handleCloseBound);
        } else {
          this.el.addEventListener('click', this._handleFABClickBound);
        }
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        if (this.options.hoverEnabled && !this.options.toolbarEnabled) {
          this.el.removeEventListener('mouseenter', this._handleOpenBound);
          this.el.removeEventListener('mouseleave', this._handleCloseBound);
        } else {
          this.el.removeEventListener('click', this._handleFABClickBound);
        }
      }

      /**
       * Handle FAB Click
       */

    }, {
      key: "_handleFABClick",
      value: function _handleFABClick() {
        if (this.isOpen) {
          this.close();
        } else {
          this.open();
        }
      }

      /**
       * Handle Document Click
       * @param {Event} e
       */

    }, {
      key: "_handleDocumentClick",
      value: function _handleDocumentClick(e) {
        if (!$(e.target).closest(this.$menu).length) {
          this.close();
        }
      }

      /**
       * Open FAB
       */

    }, {
      key: "open",
      value: function open() {
        if (this.isOpen) {
          return;
        }

        if (this.options.toolbarEnabled) {
          this._animateInToolbar();
        } else {
          this._animateInFAB();
        }
        this.isOpen = true;
      }

      /**
       * Close FAB
       */

    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        if (this.options.toolbarEnabled) {
          window.removeEventListener('scroll', this._handleCloseBound, true);
          document.body.removeEventListener('click', this._handleDocumentClickBound, true);
          this._animateOutToolbar();
        } else {
          this._animateOutFAB();
        }
        this.isOpen = false;
      }

      /**
       * Classic FAB Menu open
       */

    }, {
      key: "_animateInFAB",
      value: function _animateInFAB() {
        var _this48 = this;

        this.$el.addClass('active');

        var time = 0;
        this.$floatingBtnsReverse.each(function (el) {
          anim({
            targets: el,
            opacity: 1,
            scale: [.4, 1],
            translateY: [_this48.offsetY, 0],
            translateX: [_this48.offsetX, 0],
            duration: 275,
            delay: time,
            easing: 'easeInOutQuad'
          });
          time += 40;
        });
      }

      /**
       * Classic FAB Menu close
       */

    }, {
      key: "_animateOutFAB",
      value: function _animateOutFAB() {
        var _this49 = this;

        this.$floatingBtnsReverse.each(function (el) {
          anim.remove(el);
          anim({
            targets: el,
            opacity: 0,
            scale: .4,
            translateY: _this49.offsetY,
            translateX: _this49.offsetX,
            duration: 175,
            easing: 'easeOutQuad',
            complete: function () {
              _this49.$el.removeClass('active');
            }
          });
        });
      }

      /**
       * Toolbar transition Menu open
       */

    }, {
      key: "_animateInToolbar",
      value: function _animateInToolbar() {
        var _this50 = this;

        var scaleFactor = void 0;
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var btnRect = this.el.getBoundingClientRect();
        var backdrop = $('<div class="fab-backdrop"></div>');
        var fabColor = this.$anchor.css('background-color');
        this.$anchor.append(backdrop);

        this.offsetX = btnRect.left - windowWidth / 2 + btnRect.width / 2;
        this.offsetY = windowHeight - btnRect.bottom;
        scaleFactor = windowWidth / backdrop[0].clientWidth;
        this.btnBottom = btnRect.bottom;
        this.btnLeft = btnRect.left;
        this.btnWidth = btnRect.width;

        // Set initial state
        this.$el.addClass('active');
        this.$el.css({
          'text-align': 'center',
          width: '100%',
          bottom: 0,
          left: 0,
          transform: 'translateX(' + this.offsetX + 'px)',
          transition: 'none'
        });
        this.$anchor.css({
          transform: 'translateY(' + -this.offsetY + 'px)',
          transition: 'none'
        });
        backdrop.css({
          'background-color': fabColor
        });

        setTimeout(function () {
          _this50.$el.css({
            transform: '',
            transition: 'transform .2s cubic-bezier(0.550, 0.085, 0.680, 0.530), background-color 0s linear .2s'
          });
          _this50.$anchor.css({
            overflow: 'visible',
            transform: '',
            transition: 'transform .2s'
          });

          setTimeout(function () {
            _this50.$el.css({
              overflow: 'hidden',
              'background-color': fabColor
            });
            backdrop.css({
              transform: 'scale(' + scaleFactor + ')',
              transition: 'transform .2s cubic-bezier(0.550, 0.055, 0.675, 0.190)'
            });
            _this50.$menu.children('li').children('a').css({
              opacity: 1
            });

            // Scroll to close.
            _this50._handleDocumentClickBound = _this50._handleDocumentClick.bind(_this50);
            window.addEventListener('scroll', _this50._handleCloseBound, true);
            document.body.addEventListener('click', _this50._handleDocumentClickBound, true);
          }, 100);
        }, 0);
      }

      /**
       * Toolbar transition Menu close
       */

    }, {
      key: "_animateOutToolbar",
      value: function _animateOutToolbar() {
        var _this51 = this;

        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var backdrop = this.$el.find('.fab-backdrop');
        var fabColor = this.$anchor.css('background-color');

        this.offsetX = this.btnLeft - windowWidth / 2 + this.btnWidth / 2;
        this.offsetY = windowHeight - this.btnBottom;

        // Hide backdrop
        this.$el.removeClass('active');
        this.$el.css({
          'background-color': 'transparent',
          transition: 'none'
        });
        this.$anchor.css({
          transition: 'none'
        });
        backdrop.css({
          transform: 'scale(0)',
          'background-color': fabColor
        });
        this.$menu.children('li').children('a').css({
          opacity: ''
        });

        setTimeout(function () {
          backdrop.remove();

          // Set initial state.
          _this51.$el.css({
            'text-align': '',
            width: '',
            bottom: '',
            left: '',
            overflow: '',
            'background-color': '',
            transform: 'translate3d(' + -_this51.offsetX + 'px,0,0)'
          });
          _this51.$anchor.css({
            overflow: '',
            transform: 'translate3d(0,' + _this51.offsetY + 'px,0)'
          });

          setTimeout(function () {
            _this51.$el.css({
              transform: 'translate3d(0,0,0)',
              transition: 'transform .2s'
            });
            _this51.$anchor.css({
              transform: 'translate3d(0,0,0)',
              transition: 'transform .2s cubic-bezier(0.550, 0.055, 0.675, 0.190)'
            });
          }, 20);
        }, 200);
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(FloatingActionButton.__proto__ || Object.getPrototypeOf(FloatingActionButton), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_FloatingActionButton;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return FloatingActionButton;
  }(Component);

  M.FloatingActionButton = FloatingActionButton;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(FloatingActionButton, 'floatingActionButton', 'M_FloatingActionButton');
  }
})(cash, M.anime);
;(function ($) {
  'use strict';

  var _defaults = {

    // the default output format for the input field value
    format: 'mmm dd, yyyy',

    // Used to create date object from current input string
    parse: null,

    // The initial date to view when first opened
    defaultDate: null,

    // Make the `defaultDate` the initial selected value
    setDefaultDate: false,

    disableWeekends: false,

    disableDayFn: null,

    // First day of week (0: Sunday, 1: Monday etc)
    firstDay: 0,

    // The earliest date that can be selected
    minDate: null,
    // Thelatest date that can be selected
    maxDate: null,

    // Number of years either side, or array of upper/lower range
    yearRange: 10,

    // used internally (don't config outside)
    minYear: 0,
    maxYear: 9999,
    minMonth: undefined,
    maxMonth: undefined,

    startRange: null,
    endRange: null,

    isRTL: false,

    // Render the month after year in the calendar title
    showMonthAfterYear: false,

    // Render days of the calendar grid that fall in the next or previous month
    showDaysInNextAndPreviousMonths: false,

    // Specify a DOM element to render the calendar in
    container: null,

    // Show clear button
    showClearBtn: false,

    // internationalization
    i18n: {
      cancel: 'Cancel',
      clear: 'Clear',
      done: 'Ok',
      previousMonth: '‹',
      nextMonth: '›',
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      weekdaysAbbrev: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    },

    // events array
    events: [],

    // callback function
    onSelect: null,
    onOpen: null,
    onClose: null,
    onDraw: null
  };

  /**
   * @class
   *
   */

  var Datepicker = function (_Component15) {
    _inherits(Datepicker, _Component15);

    /**
     * Construct Datepicker instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Datepicker(el, options) {
      _classCallCheck(this, Datepicker);

      var _this52 = _possibleConstructorReturn(this, (Datepicker.__proto__ || Object.getPrototypeOf(Datepicker)).call(this, Datepicker, el, options));

      _this52.el.M_Datepicker = _this52;

      _this52.options = $.extend({}, Datepicker.defaults, options);

      // make sure i18n defaults are not lost when only few i18n option properties are passed
      if (!!options && options.hasOwnProperty('i18n') && typeof options.i18n === 'object') {
        _this52.options.i18n = $.extend({}, Datepicker.defaults.i18n, options.i18n);
      }

      // Remove time component from minDate and maxDate options
      if (_this52.options.minDate) _this52.options.minDate.setHours(0, 0, 0, 0);
      if (_this52.options.maxDate) _this52.options.maxDate.setHours(0, 0, 0, 0);

      _this52.id = M.guid();

      _this52._setupVariables();
      _this52._insertHTMLIntoDOM();
      _this52._setupModal();

      _this52._setupEventHandlers();

      if (!_this52.options.defaultDate) {
        _this52.options.defaultDate = new Date(Date.parse(_this52.el.value));
        _this52.options.setDefaultDate = true;
      }

      var defDate = _this52.options.defaultDate;

      if (Datepicker._isDate(defDate)) {
        if (_this52.options.setDefaultDate) {
          _this52.setDate(defDate, true);
        } else {
          _this52.gotoDate(defDate);
        }
      } else {
        _this52.gotoDate(new Date());
      }

      /**
       * Describes open/close state of datepicker
       * @type {Boolean}
       */
      _this52.isOpen = false;

      return _this52;
    }

    _createClass(Datepicker, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.modal.destroy();
        $(this.modalEl).remove();
        this.destroySelects();
        this.el.M_Datepicker = undefined;
      }
    }, {
      key: "destroySelects",
      value: function destroySelects() {
        var oldYearSelect = this.calendarEl.querySelector('.pika-select-year');
        if (oldYearSelect) {
          M.FormSelect.getInstance(oldYearSelect).destroy();
        }
        var oldMonthSelect = this.calendarEl.querySelector('.pika-select-month');
        if (oldMonthSelect) {
          M.FormSelect.getInstance(oldMonthSelect).destroy();
        }
      }
    }, {
      key: "_insertHTMLIntoDOM",
      value: function _insertHTMLIntoDOM() {
        if (this.options.showClearBtn) {
          $(this.clearBtn).css({ visibility: '' });
          this.clearBtn.innerHTML = this.options.i18n.clear;
        }

        this.doneBtn.innerHTML = this.options.i18n.done;
        this.cancelBtn.innerHTML = this.options.i18n.cancel;

        if (this.options.container) {
          this.$modalEl.appendTo(this.options.container);
        } else {
          this.$modalEl.insertBefore(this.el);
        }
      }
    }, {
      key: "_setupModal",
      value: function _setupModal() {
        var _this53 = this;

        this.modalEl.id = 'modal-' + this.id;
        this.modal = M.Modal.init(this.modalEl, {
          onCloseEnd: function () {
            _this53.isOpen = false;
          }
        });
      }
    }, {
      key: "toString",
      value: function toString(format) {
        var _this54 = this;

        format = format || this.options.format;
        if (!Datepicker._isDate(this.date)) {
          return '';
        }

        var formatArray = format.split(/(d{1,4}|m{1,4}|y{4}|yy|!.)/g);
        var formattedDate = formatArray.map(function (label) {
          if (_this54.formats[label]) {
            return _this54.formats[label]();
          }

          return label;
        }).join('');
        return formattedDate;
      }
    }, {
      key: "setDate",
      value: function setDate(date, preventOnSelect) {
        if (!date) {
          this.date = null;
          this._renderDateDisplay();
          return this.draw();
        }
        if (typeof date === 'string') {
          date = new Date(Date.parse(date));
        }
        if (!Datepicker._isDate(date)) {
          return;
        }

        var min = this.options.minDate,
            max = this.options.maxDate;

        if (Datepicker._isDate(min) && date < min) {
          date = min;
        } else if (Datepicker._isDate(max) && date > max) {
          date = max;
        }

        this.date = new Date(date.getTime());

        this._renderDateDisplay();

        Datepicker._setToStartOfDay(this.date);
        this.gotoDate(this.date);

        if (!preventOnSelect && typeof this.options.onSelect === 'function') {
          this.options.onSelect.call(this, this.date);
        }
      }
    }, {
      key: "setInputValue",
      value: function setInputValue() {
        this.el.value = this.toString();
        this.$el.trigger('change', { firedBy: this });
      }
    }, {
      key: "_renderDateDisplay",
      value: function _renderDateDisplay() {
        var displayDate = Datepicker._isDate(this.date) ? this.date : new Date();
        var i18n = this.options.i18n;
        var day = i18n.weekdaysShort[displayDate.getDay()];
        var month = i18n.monthsShort[displayDate.getMonth()];
        var date = displayDate.getDate();
        this.yearTextEl.innerHTML = displayDate.getFullYear();
        this.dateTextEl.innerHTML = day + ", " + month + " " + date;
      }

      /**
       * change view to a specific date
       */

    }, {
      key: "gotoDate",
      value: function gotoDate(date) {
        var newCalendar = true;

        if (!Datepicker._isDate(date)) {
          return;
        }

        if (this.calendars) {
          var firstVisibleDate = new Date(this.calendars[0].year, this.calendars[0].month, 1),
              lastVisibleDate = new Date(this.calendars[this.calendars.length - 1].year, this.calendars[this.calendars.length - 1].month, 1),
              visibleDate = date.getTime();
          // get the end of the month
          lastVisibleDate.setMonth(lastVisibleDate.getMonth() + 1);
          lastVisibleDate.setDate(lastVisibleDate.getDate() - 1);
          newCalendar = visibleDate < firstVisibleDate.getTime() || lastVisibleDate.getTime() < visibleDate;
        }

        if (newCalendar) {
          this.calendars = [{
            month: date.getMonth(),
            year: date.getFullYear()
          }];
          // if (this.options.mainCalendar === 'right') {
          //   this.calendars[0].month += 1 - this.options.numberOfMonths;
          // }
        }

        this.adjustCalendars();
      }
    }, {
      key: "adjustCalendars",
      value: function adjustCalendars() {
        this.calendars[0] = this.adjustCalendar(this.calendars[0]);
        // for (let c = 1; c < this.options.numberOfMonths; c++) {
        //   this.calendars[c] = this.adjustCalendar({
        //     month: this.calendars[0].month + c,
        //     year: this.calendars[0].year
        //   });
        // }
        this.draw();
      }
    }, {
      key: "adjustCalendar",
      value: function adjustCalendar(calendar) {
        if (calendar.month < 0) {
          calendar.year -= Math.ceil(Math.abs(calendar.month) / 12);
          calendar.month += 12;
        }
        if (calendar.month > 11) {
          calendar.year += Math.floor(Math.abs(calendar.month) / 12);
          calendar.month -= 12;
        }
        return calendar;
      }
    }, {
      key: "nextMonth",
      value: function nextMonth() {
        this.calendars[0].month++;
        this.adjustCalendars();
      }
    }, {
      key: "prevMonth",
      value: function prevMonth() {
        this.calendars[0].month--;
        this.adjustCalendars();
      }
    }, {
      key: "render",
      value: function render(year, month, randId) {
        var opts = this.options,
            now = new Date(),
            days = Datepicker._getDaysInMonth(year, month),
            before = new Date(year, month, 1).getDay(),
            data = [],
            row = [];
        Datepicker._setToStartOfDay(now);
        if (opts.firstDay > 0) {
          before -= opts.firstDay;
          if (before < 0) {
            before += 7;
          }
        }
        var previousMonth = month === 0 ? 11 : month - 1,
            nextMonth = month === 11 ? 0 : month + 1,
            yearOfPreviousMonth = month === 0 ? year - 1 : year,
            yearOfNextMonth = month === 11 ? year + 1 : year,
            daysInPreviousMonth = Datepicker._getDaysInMonth(yearOfPreviousMonth, previousMonth);
        var cells = days + before,
            after = cells;
        while (after > 7) {
          after -= 7;
        }
        cells += 7 - after;
        var isWeekSelected = false;
        for (var i = 0, r = 0; i < cells; i++) {
          var day = new Date(year, month, 1 + (i - before)),
              isSelected = Datepicker._isDate(this.date) ? Datepicker._compareDates(day, this.date) : false,
              isToday = Datepicker._compareDates(day, now),
              hasEvent = opts.events.indexOf(day.toDateString()) !== -1 ? true : false,
              isEmpty = i < before || i >= days + before,
              dayNumber = 1 + (i - before),
              monthNumber = month,
              yearNumber = year,
              isStartRange = opts.startRange && Datepicker._compareDates(opts.startRange, day),
              isEndRange = opts.endRange && Datepicker._compareDates(opts.endRange, day),
              isInRange = opts.startRange && opts.endRange && opts.startRange < day && day < opts.endRange,
              isDisabled = opts.minDate && day < opts.minDate || opts.maxDate && day > opts.maxDate || opts.disableWeekends && Datepicker._isWeekend(day) || opts.disableDayFn && opts.disableDayFn(day);

          if (isEmpty) {
            if (i < before) {
              dayNumber = daysInPreviousMonth + dayNumber;
              monthNumber = previousMonth;
              yearNumber = yearOfPreviousMonth;
            } else {
              dayNumber = dayNumber - days;
              monthNumber = nextMonth;
              yearNumber = yearOfNextMonth;
            }
          }

          var dayConfig = {
            day: dayNumber,
            month: monthNumber,
            year: yearNumber,
            hasEvent: hasEvent,
            isSelected: isSelected,
            isToday: isToday,
            isDisabled: isDisabled,
            isEmpty: isEmpty,
            isStartRange: isStartRange,
            isEndRange: isEndRange,
            isInRange: isInRange,
            showDaysInNextAndPreviousMonths: opts.showDaysInNextAndPreviousMonths
          };

          row.push(this.renderDay(dayConfig));

          if (++r === 7) {
            data.push(this.renderRow(row, opts.isRTL, isWeekSelected));
            row = [];
            r = 0;
            isWeekSelected = false;
          }
        }
        return this.renderTable(opts, data, randId);
      }
    }, {
      key: "renderDay",
      value: function renderDay(opts) {
        var arr = [];
        var ariaSelected = 'false';
        if (opts.isEmpty) {
          if (opts.showDaysInNextAndPreviousMonths) {
            arr.push('is-outside-current-month');
            arr.push('is-selection-disabled');
          } else {
            return '<td class="is-empty"></td>';
          }
        }
        if (opts.isDisabled) {
          arr.push('is-disabled');
        }

        if (opts.isToday) {
          arr.push('is-today');
        }
        if (opts.isSelected) {
          arr.push('is-selected');
          ariaSelected = 'true';
        }
        if (opts.hasEvent) {
          arr.push('has-event');
        }
        if (opts.isInRange) {
          arr.push('is-inrange');
        }
        if (opts.isStartRange) {
          arr.push('is-startrange');
        }
        if (opts.isEndRange) {
          arr.push('is-endrange');
        }
        return '<td data-day="' + opts.day + '" class="' + arr.join(' ') + '" aria-selected="' + ariaSelected + '">' + '<button class="datepicker-day-button" type="button" ' + 'data-pika-year="' + opts.year + '" data-pika-month="' + opts.month + '" data-pika-day="' + opts.day + '">' + opts.day + '</button>' + '</td>';
      }
    }, {
      key: "renderRow",
      value: function renderRow(days, isRTL, isRowSelected) {
        return '<tr class="pika-row' + (isRowSelected ? ' is-selected' : '') + '">' + (isRTL ? days.reverse() : days).join('') + '</tr>';
      }
    }, {
      key: "renderTable",
      value: function renderTable(opts, data, randId) {
        return '<div class="datepicker-table-wrapper"><table cellpadding="0" cellspacing="0" class="datepicker-table" role="grid" aria-labelledby="' + randId + '">' + this.renderHead(opts) + this.renderBody(data) + '</table></div>';
      }
    }, {
      key: "renderHead",
      value: function renderHead(opts) {
        var i = void 0,
            arr = [];
        for (i = 0; i < 7; i++) {
          arr.push('<th scope="col"><abbr title="' + this.renderDayName(opts, i) + '">' + this.renderDayName(opts, i, true) + '</abbr></th>');
        }
        return '<thead><tr>' + (opts.isRTL ? arr.reverse() : arr).join('') + '</tr></thead>';
      }
    }, {
      key: "renderBody",
      value: function renderBody(rows) {
        return '<tbody>' + rows.join('') + '</tbody>';
      }
    }, {
      key: "renderTitle",
      value: function renderTitle(instance, c, year, month, refYear, randId) {
        var i = void 0,
            j = void 0,
            arr = void 0,
            opts = this.options,
            isMinYear = year === opts.minYear,
            isMaxYear = year === opts.maxYear,
            html = '<div id="' + randId + '" class="datepicker-controls" role="heading" aria-live="assertive">',
            monthHtml = void 0,
            yearHtml = void 0,
            prev = true,
            next = true;

        for (arr = [], i = 0; i < 12; i++) {
          arr.push('<option value="' + (year === refYear ? i - c : 12 + i - c) + '"' + (i === month ? ' selected="selected"' : '') + (isMinYear && i < opts.minMonth || isMaxYear && i > opts.maxMonth ? 'disabled="disabled"' : '') + '>' + opts.i18n.months[i] + '</option>');
        }

        monthHtml = '<select class="pika-select pika-select-month" tabindex="-1">' + arr.join('') + '</select>';

        if ($.isArray(opts.yearRange)) {
          i = opts.yearRange[0];
          j = opts.yearRange[1] + 1;
        } else {
          i = year - opts.yearRange;
          j = 1 + year + opts.yearRange;
        }

        for (arr = []; i < j && i <= opts.maxYear; i++) {
          if (i >= opts.minYear) {
            arr.push('<option value="' + i + '"' + (i === year ? ' selected="selected"' : '') + '>' + i + '</option>');
          }
        }

        yearHtml = '<select class="pika-select pika-select-year" tabindex="-1">' + arr.join('') + '</select>';

        var leftArrow = '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/><path d="M0-.5h24v24H0z" fill="none"/></svg>';
        html += '<button class="month-prev' + (prev ? '' : ' is-disabled') + '" type="button">' + leftArrow + '</button>';

        html += '<div class="selects-container">';
        if (opts.showMonthAfterYear) {
          html += yearHtml + monthHtml;
        } else {
          html += monthHtml + yearHtml;
        }
        html += '</div>';

        if (isMinYear && (month === 0 || opts.minMonth >= month)) {
          prev = false;
        }

        if (isMaxYear && (month === 11 || opts.maxMonth <= month)) {
          next = false;
        }

        // if (c === (this.options.numberOfMonths - 1) ) {
        var rightArrow = '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/><path d="M0-.25h24v24H0z" fill="none"/></svg>';
        html += '<button class="month-next' + (next ? '' : ' is-disabled') + '" type="button">' + rightArrow + '</button>';
        // }

        return html += '</div>';
      }

      /**
       * refresh the HTML
       */

    }, {
      key: "draw",
      value: function draw(force) {
        if (!this.isOpen && !force) {
          return;
        }
        var opts = this.options,
            minYear = opts.minYear,
            maxYear = opts.maxYear,
            minMonth = opts.minMonth,
            maxMonth = opts.maxMonth,
            html = '',
            randId = void 0;

        if (this._y <= minYear) {
          this._y = minYear;
          if (!isNaN(minMonth) && this._m < minMonth) {
            this._m = minMonth;
          }
        }
        if (this._y >= maxYear) {
          this._y = maxYear;
          if (!isNaN(maxMonth) && this._m > maxMonth) {
            this._m = maxMonth;
          }
        }

        randId = 'pika-title-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 2);

        for (var c = 0; c < 1; c++) {
          this._renderDateDisplay();
          html += this.renderTitle(this, c, this.calendars[c].year, this.calendars[c].month, this.calendars[0].year, randId) + this.render(this.calendars[c].year, this.calendars[c].month, randId);
        }

        this.destroySelects();

        this.calendarEl.innerHTML = html;

        // Init Materialize Select
        var yearSelect = this.calendarEl.querySelector('.pika-select-year');
        var monthSelect = this.calendarEl.querySelector('.pika-select-month');
        M.FormSelect.init(yearSelect, { classes: 'select-year', dropdownOptions: { container: document.body, constrainWidth: false } });
        M.FormSelect.init(monthSelect, { classes: 'select-month', dropdownOptions: { container: document.body, constrainWidth: false } });

        // Add change handlers for select
        yearSelect.addEventListener('change', this._handleYearChange.bind(this));
        monthSelect.addEventListener('change', this._handleMonthChange.bind(this));

        if (typeof this.options.onDraw === 'function') {
          this.options.onDraw(this);
        }
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
        this._handleInputClickBound = this._handleInputClick.bind(this);
        this._handleInputChangeBound = this._handleInputChange.bind(this);
        this._handleCalendarClickBound = this._handleCalendarClick.bind(this);
        this._finishSelectionBound = this._finishSelection.bind(this);
        this._handleMonthChange = this._handleMonthChange.bind(this);
        this._closeBound = this.close.bind(this);

        this.el.addEventListener('click', this._handleInputClickBound);
        this.el.addEventListener('keydown', this._handleInputKeydownBound);
        this.el.addEventListener('change', this._handleInputChangeBound);
        this.calendarEl.addEventListener('click', this._handleCalendarClickBound);
        this.doneBtn.addEventListener('click', this._finishSelectionBound);
        this.cancelBtn.addEventListener('click', this._closeBound);

        if (this.options.showClearBtn) {
          this._handleClearClickBound = this._handleClearClick.bind(this);
          this.clearBtn.addEventListener('click', this._handleClearClickBound);
        }
      }
    }, {
      key: "_setupVariables",
      value: function _setupVariables() {
        var _this55 = this;

        this.$modalEl = $(Datepicker._template);
        this.modalEl = this.$modalEl[0];

        this.calendarEl = this.modalEl.querySelector('.pika-single');

        this.yearTextEl = this.modalEl.querySelector('.year-text');
        this.dateTextEl = this.modalEl.querySelector('.date-text');
        if (this.options.showClearBtn) {
          this.clearBtn = this.modalEl.querySelector('.datepicker-clear');
        }
        this.doneBtn = this.modalEl.querySelector('.datepicker-done');
        this.cancelBtn = this.modalEl.querySelector('.datepicker-cancel');

        this.formats = {

          d: function () {
            return _this55.date.getDate();
          },
          dd: function () {
            var d = _this55.date.getDate();
            return (d < 10 ? '0' : '') + d;
          },
          ddd: function () {
            return _this55.options.i18n.weekdaysShort[_this55.date.getDay()];
          },
          dddd: function () {
            return _this55.options.i18n.weekdays[_this55.date.getDay()];
          },
          m: function () {
            return _this55.date.getMonth() + 1;
          },
          mm: function () {
            var m = _this55.date.getMonth() + 1;
            return (m < 10 ? '0' : '') + m;
          },
          mmm: function () {
            return _this55.options.i18n.monthsShort[_this55.date.getMonth()];
          },
          mmmm: function () {
            return _this55.options.i18n.months[_this55.date.getMonth()];
          },
          yy: function () {
            return ('' + _this55.date.getFullYear()).slice(2);
          },
          yyyy: function () {
            return _this55.date.getFullYear();
          }
        };
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('click', this._handleInputClickBound);
        this.el.removeEventListener('keydown', this._handleInputKeydownBound);
        this.el.removeEventListener('change', this._handleInputChangeBound);
        this.calendarEl.removeEventListener('click', this._handleCalendarClickBound);
      }
    }, {
      key: "_handleInputClick",
      value: function _handleInputClick() {
        this.open();
      }
    }, {
      key: "_handleInputKeydown",
      value: function _handleInputKeydown(e) {
        if (e.which === M.keys.ENTER) {
          e.preventDefault();
          this.open();
        }
      }
    }, {
      key: "_handleCalendarClick",
      value: function _handleCalendarClick(e) {
        if (!this.isOpen) {
          return;
        }

        var $target = $(e.target);
        if (!$target.hasClass('is-disabled')) {
          if ($target.hasClass('datepicker-day-button') && !$target.hasClass('is-empty') && !$target.parent().hasClass('is-disabled')) {
            this.setDate(new Date(e.target.getAttribute('data-pika-year'), e.target.getAttribute('data-pika-month'), e.target.getAttribute('data-pika-day')));
          } else if ($target.closest('.month-prev').length) {
            this.prevMonth();
          } else if ($target.closest('.month-next').length) {
            this.nextMonth();
          }
        }
        // if (!$target.hasClass('pika-select')) {
        //   // if this is touch event prevent mouse events emulation
        //   // if (e.preventDefault) {
        //   //   e.preventDefault();
        //   // } else {
        //   //   e.returnValue = false;
        //   //   return false;
        //   // }
        // } else {
        //   this._c = true;
        // }
      }
    }, {
      key: "_handleClearClick",
      value: function _handleClearClick() {
        this.date = null;
        this.setInputValue();
        this.close();
      }
    }, {
      key: "_handleMonthChange",
      value: function _handleMonthChange(e) {
        this.gotoMonth(e.target.value);
      }
    }, {
      key: "_handleYearChange",
      value: function _handleYearChange(e) {
        this.gotoYear(e.target.value);
      }

      /**
       * change view to a specific month (zero-index, e.g. 0: January)
       */

    }, {
      key: "gotoMonth",
      value: function gotoMonth(month) {
        if (!isNaN(month)) {
          this.calendars[0].month = parseInt(month, 10);
          this.adjustCalendars();
        }
      }

      /**
       * change view to a specific full year (e.g. "2012")
       */

    }, {
      key: "gotoYear",
      value: function gotoYear(year) {
        if (!isNaN(year)) {
          this.calendars[0].year = parseInt(year, 10);
          this.adjustCalendars();
        }
      }
    }, {
      key: "_handleInputChange",
      value: function _handleInputChange(e) {
        var date = void 0;

        // Prevent change event from being fired when triggered by the plugin
        if (e.firedBy === this) {
          return;
        }
        if (this.options.parse) {
          date = this.options.parse(this.el.value, this.options.format);
        } else {
          date = new Date(Date.parse(this.el.value));
        }

        if (Datepicker._isDate(date)) {
          this.setDate(date);
        }
        // if (!self._v) {
        //   self.show();
        // }
      }
    }, {
      key: "renderDayName",
      value: function renderDayName(opts, day, abbr) {
        day += opts.firstDay;
        while (day >= 7) {
          day -= 7;
        }
        return abbr ? opts.i18n.weekdaysAbbrev[day] : opts.i18n.weekdays[day];
      }

      /**
       * Set input value to the selected date and close Datepicker
       */

    }, {
      key: "_finishSelection",
      value: function _finishSelection() {
        this.setInputValue();
        this.close();
      }

      /**
       * Open Datepicker
       */

    }, {
      key: "open",
      value: function open() {
        if (this.isOpen) {
          return;
        }

        this.isOpen = true;
        if (typeof this.options.onOpen === 'function') {
          this.options.onOpen.call(this);
        }
        this.draw();
        this.modal.open();
        return this;
      }

      /**
       * Close Datepicker
       */

    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        this.isOpen = false;
        if (typeof this.options.onClose === 'function') {
          this.options.onClose.call(this);
        }
        this.modal.close();
        return this;
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Datepicker.__proto__ || Object.getPrototypeOf(Datepicker), "init", this).call(this, this, els, options);
      }
    }, {
      key: "_isDate",
      value: function _isDate(obj) {
        return (/Date/.test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime())
        );
      }
    }, {
      key: "_isWeekend",
      value: function _isWeekend(date) {
        var day = date.getDay();
        return day === 0 || day === 6;
      }
    }, {
      key: "_setToStartOfDay",
      value: function _setToStartOfDay(date) {
        if (Datepicker._isDate(date)) date.setHours(0, 0, 0, 0);
      }
    }, {
      key: "_getDaysInMonth",
      value: function _getDaysInMonth(year, month) {
        return [31, Datepicker._isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
      }
    }, {
      key: "_isLeapYear",
      value: function _isLeapYear(year) {
        // solution by Matti Virkkunen: http://stackoverflow.com/a/4881951
        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
      }
    }, {
      key: "_compareDates",
      value: function _compareDates(a, b) {
        // weak date comparison (use setToStartOfDay(date) to ensure correct result)
        return a.getTime() === b.getTime();
      }
    }, {
      key: "_setToStartOfDay",
      value: function _setToStartOfDay(date) {
        if (Datepicker._isDate(date)) date.setHours(0, 0, 0, 0);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Datepicker;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Datepicker;
  }(Component);

  Datepicker._template = ['<div class= "modal datepicker-modal">', '<div class="modal-content datepicker-container">', '<div class="datepicker-date-display">', '<span class="year-text"></span>', '<span class="date-text"></span>', '</div>', '<div class="datepicker-calendar-container">', '<div class="pika-single"></div>', '<div class="datepicker-footer">', '<button class="btn-flat datepicker-clear waves-effect" style="visibility: hidden;" type="button"></button>', '<div class="confirmation-btns">', '<button class="btn-flat datepicker-cancel waves-effect" type="button"></button>', '<button class="btn-flat datepicker-done waves-effect" type="button"></button>', '</div>', '</div>', '</div>', '</div>', '</div>'].join('');

  M.Datepicker = Datepicker;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Datepicker, 'datepicker', 'M_Datepicker');
  }
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {
    dialRadius: 135,
    outerRadius: 105,
    innerRadius: 70,
    tickRadius: 20,
    duration: 350,
    container: null,
    defaultTime: 'now', // default time, 'now' or '13:14' e.g.
    fromNow: 0, // Millisecond offset from the defaultTime
    showClearBtn: false,

    // internationalization
    i18n: {
      cancel: 'Cancel',
      clear: 'Clear',
      done: 'Ok'
    },

    autoClose: false, // auto close when minute is selected
    twelveHour: true, // change to 12 hour AM/PM clock from 24 hour
    vibrate: true // vibrate the device when dragging clock hand
  };

  /**
   * @class
   *
   */

  var Timepicker = function (_Component16) {
    _inherits(Timepicker, _Component16);

    function Timepicker(el, options) {
      _classCallCheck(this, Timepicker);

      var _this56 = _possibleConstructorReturn(this, (Timepicker.__proto__ || Object.getPrototypeOf(Timepicker)).call(this, Timepicker, el, options));

      _this56.el.M_Timepicker = _this56;

      _this56.options = $.extend({}, Timepicker.defaults, options);

      _this56.id = M.guid();
      _this56._insertHTMLIntoDOM();
      _this56._setupModal();
      _this56._setupVariables();
      _this56._setupEventHandlers();

      _this56._clockSetup();
      _this56._pickerSetup();
      return _this56;
    }

    _createClass(Timepicker, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.modal.destroy();
        $(this.modalEl).remove();
        this.el.M_Timepicker = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
        this._handleInputClickBound = this._handleInputClick.bind(this);
        this._handleClockClickStartBound = this._handleClockClickStart.bind(this);
        this._handleDocumentClickMoveBound = this._handleDocumentClickMove.bind(this);
        this._handleDocumentClickEndBound = this._handleDocumentClickEnd.bind(this);

        this.el.addEventListener('click', this._handleInputClickBound);
        this.el.addEventListener('keydown', this._handleInputKeydownBound);
        this.plate.addEventListener('mousedown', this._handleClockClickStartBound);
        this.plate.addEventListener('touchstart', this._handleClockClickStartBound);

        $(this.spanHours).on('click', this.showView.bind(this, 'hours'));
        $(this.spanMinutes).on('click', this.showView.bind(this, 'minutes'));
      }
    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('click', this._handleInputClickBound);
        this.el.removeEventListener('keydown', this._handleInputKeydownBound);
      }
    }, {
      key: "_handleInputClick",
      value: function _handleInputClick() {
        this.open();
      }
    }, {
      key: "_handleInputKeydown",
      value: function _handleInputKeydown(e) {
        if (e.which === M.keys.ENTER) {
          e.preventDefault();
          this.open();
        }
      }
    }, {
      key: "_handleClockClickStart",
      value: function _handleClockClickStart(e) {
        e.preventDefault();
        var clockPlateBR = this.plate.getBoundingClientRect();
        var offset = { x: clockPlateBR.left, y: clockPlateBR.top };

        this.x0 = offset.x + this.options.dialRadius;
        this.y0 = offset.y + this.options.dialRadius;
        this.moved = false;
        var clickPos = Timepicker._Pos(e);
        this.dx = clickPos.x - this.x0;
        this.dy = clickPos.y - this.y0;

        // Set clock hands
        this.setHand(this.dx, this.dy, false);

        // Mousemove on document
        document.addEventListener('mousemove', this._handleDocumentClickMoveBound);
        document.addEventListener('touchmove', this._handleDocumentClickMoveBound);

        // Mouseup on document
        document.addEventListener('mouseup', this._handleDocumentClickEndBound);
        document.addEventListener('touchend', this._handleDocumentClickEndBound);
      }
    }, {
      key: "_handleDocumentClickMove",
      value: function _handleDocumentClickMove(e) {
        e.preventDefault();
        var clickPos = Timepicker._Pos(e);
        var x = clickPos.x - this.x0;
        var y = clickPos.y - this.y0;
        this.moved = true;
        this.setHand(x, y, false, true);
      }
    }, {
      key: "_handleDocumentClickEnd",
      value: function _handleDocumentClickEnd(e) {
        var _this57 = this;

        e.preventDefault();
        document.removeEventListener('mouseup', this._handleDocumentClickEndBound);
        document.removeEventListener('touchend', this._handleDocumentClickEndBound);
        var clickPos = Timepicker._Pos(e);
        var x = clickPos.x - this.x0;
        var y = clickPos.y - this.y0;
        if (this.moved && x === this.dx && y === this.dy) {
          this.setHand(x, y);
        }

        if (this.currentView === 'hours') {
          this.showView('minutes', this.options.duration / 2);
        } else if (this.options.autoClose) {
          $(this.minutesView).addClass('timepicker-dial-out');
          setTimeout(function () {
            _this57.done();
          }, this.options.duration / 2);
        }

        // Unbind mousemove event
        document.removeEventListener('mousemove', this._handleDocumentClickMoveBound);
        document.removeEventListener('touchmove', this._handleDocumentClickMoveBound);
      }
    }, {
      key: "_insertHTMLIntoDOM",
      value: function _insertHTMLIntoDOM() {
        this.$modalEl = $(Timepicker._template);
        this.modalEl = this.$modalEl[0];
        this.modalEl.id = 'modal-' + this.id;

        // Append popover to input by default
        var containerEl = document.querySelector(this.options.container);
        if (this.options.container && !!containerEl) {
          this.$modalEl.appendTo(containerEl);
        } else {
          this.$modalEl.insertBefore(this.el);
        }
      }
    }, {
      key: "_setupModal",
      value: function _setupModal() {
        var _this58 = this;

        this.modal = M.Modal.init(this.modalEl, {
          onCloseEnd: function () {
            _this58.isOpen = false;
          }
        });
      }
    }, {
      key: "_setupVariables",
      value: function _setupVariables() {
        this.currentView = 'hours';
        this.vibrate = navigator.vibrate ? 'vibrate' : navigator.webkitVibrate ? 'webkitVibrate' : null;

        this._canvas = this.modalEl.querySelector('.timepicker-canvas');
        this.plate = this.modalEl.querySelector('.timepicker-plate');

        this.hoursView = this.modalEl.querySelector('.timepicker-hours');
        this.minutesView = this.modalEl.querySelector('.timepicker-minutes');
        this.spanHours = this.modalEl.querySelector('.timepicker-span-hours');
        this.spanMinutes = this.modalEl.querySelector('.timepicker-span-minutes');
        this.spanAmPm = this.modalEl.querySelector('.timepicker-span-am-pm');
        this.footer = this.modalEl.querySelector('.timepicker-footer');
        this.amOrPm = 'PM';
      }
    }, {
      key: "_pickerSetup",
      value: function _pickerSetup() {

        var $clearBtn = $('<button class="btn-flat timepicker-clear waves-effect" style="visibility: hidden;" type="button" tabindex="' + (this.options.twelveHour ? '3' : '1') + '">' + this.options.i18n.clear + '</button>').appendTo(this.footer).on('click', this.clear.bind(this));
        if (this.options.showClearBtn) {
          $clearBtn.css({ visibility: '' });
        }

        var confirmationBtnsContainer = $('<div class="confirmation-btns"></div>');
        $('<button class="btn-flat timepicker-close waves-effect" type="button" tabindex="' + (this.options.twelveHour ? '3' : '1') + '">' + this.options.i18n.cancel + '</button>').appendTo(confirmationBtnsContainer).on('click', this.close.bind(this));
        $('<button class="btn-flat timepicker-close waves-effect" type="button" tabindex="' + (this.options.twelveHour ? '3' : '1') + '">' + this.options.i18n.done + '</button>').appendTo(confirmationBtnsContainer).on('click', this.done.bind(this));
        confirmationBtnsContainer.appendTo(this.footer);
      }
    }, {
      key: "_clockSetup",
      value: function _clockSetup() {
        if (this.options.twelveHour) {
          this.$amBtn = $('<div class="am-btn">AM</div>');
          this.$pmBtn = $('<div class="pm-btn">PM</div>');
          this.$amBtn.on('click', this._handleAmPmClick.bind(this)).appendTo(this.spanAmPm);
          this.$pmBtn.on('click', this._handleAmPmClick.bind(this)).appendTo(this.spanAmPm);
        }

        this._buildHoursView();
        this._buildMinutesView();
        this._buildSVGClock();
      }
    }, {
      key: "_buildSVGClock",
      value: function _buildSVGClock() {
        // Draw clock hands and others
        var dialRadius = this.options.dialRadius;
        var tickRadius = this.options.tickRadius;
        var diameter = dialRadius * 2;

        var svg = Timepicker._createSVGEl('svg');
        svg.setAttribute('class', 'timepicker-svg');
        svg.setAttribute('width', diameter);
        svg.setAttribute('height', diameter);
        var g = Timepicker._createSVGEl('g');
        g.setAttribute('transform', 'translate(' + dialRadius + ',' + dialRadius + ')');
        var bearing = Timepicker._createSVGEl('circle');
        bearing.setAttribute('class', 'timepicker-canvas-bearing');
        bearing.setAttribute('cx', 0);
        bearing.setAttribute('cy', 0);
        bearing.setAttribute('r', 4);
        var hand = Timepicker._createSVGEl('line');
        hand.setAttribute('x1', 0);
        hand.setAttribute('y1', 0);
        var bg = Timepicker._createSVGEl('circle');
        bg.setAttribute('class', 'timepicker-canvas-bg');
        bg.setAttribute('r', tickRadius);
        g.appendChild(hand);
        g.appendChild(bg);
        g.appendChild(bearing);
        svg.appendChild(g);
        this._canvas.appendChild(svg);

        this.hand = hand;
        this.bg = bg;
        this.bearing = bearing;
        this.g = g;
      }
    }, {
      key: "_buildHoursView",
      value: function _buildHoursView() {
        var $tick = $('<div class="timepicker-tick"></div>');
        // Hours view
        if (this.options.twelveHour) {
          for (var i = 1; i < 13; i += 1) {
            var tick = $tick.clone();
            var radian = i / 6 * Math.PI;
            var radius = this.options.outerRadius;
            tick.css({
              left: this.options.dialRadius + Math.sin(radian) * radius - this.options.tickRadius + 'px',
              top: this.options.dialRadius - Math.cos(radian) * radius - this.options.tickRadius + 'px'
            });
            tick.html(i === 0 ? '00' : i);
            this.hoursView.appendChild(tick[0]);
            // tick.on(mousedownEvent, mousedown);
          }
        } else {
          for (var _i2 = 0; _i2 < 24; _i2 += 1) {
            var _tick = $tick.clone();
            var _radian = _i2 / 6 * Math.PI;
            var inner = _i2 > 0 && _i2 < 13;
            var _radius = inner ? this.options.innerRadius : this.options.outerRadius;
            _tick.css({
              left: this.options.dialRadius + Math.sin(_radian) * _radius - this.options.tickRadius + 'px',
              top: this.options.dialRadius - Math.cos(_radian) * _radius - this.options.tickRadius + 'px'
            });
            _tick.html(_i2 === 0 ? '00' : _i2);
            this.hoursView.appendChild(_tick[0]);
            // tick.on(mousedownEvent, mousedown);
          }
        }
      }
    }, {
      key: "_buildMinutesView",
      value: function _buildMinutesView() {
        var $tick = $('<div class="timepicker-tick"></div>');
        // Minutes view
        for (var i = 0; i < 60; i += 5) {
          var tick = $tick.clone();
          var radian = i / 30 * Math.PI;
          tick.css({
            left: this.options.dialRadius + Math.sin(radian) * this.options.outerRadius - this.options.tickRadius + 'px',
            top: this.options.dialRadius - Math.cos(radian) * this.options.outerRadius - this.options.tickRadius + 'px'
          });
          tick.html(Timepicker._addLeadingZero(i));
          this.minutesView.appendChild(tick[0]);
        }
      }
    }, {
      key: "_handleAmPmClick",
      value: function _handleAmPmClick(e) {
        var $btnClicked = $(e.target);
        this.amOrPm = $btnClicked.hasClass('am-btn') ? 'AM' : 'PM';
        this._updateAmPmView();
      }
    }, {
      key: "_updateAmPmView",
      value: function _updateAmPmView() {
        if (this.options.twelveHour) {
          this.$amBtn.toggleClass('text-primary', this.amOrPm === 'AM');
          this.$pmBtn.toggleClass('text-primary', this.amOrPm === 'PM');
        }
      }
    }, {
      key: "_updateTimeFromInput",
      value: function _updateTimeFromInput() {
        // Get the time
        var value = ((this.el.value || this.options.defaultTime || '') + '').split(':');
        if (this.options.twelveHour && !(typeof value[1] === 'undefined')) {
          if (value[1].toUpperCase().indexOf("AM") > 0) {
            this.amOrPm = 'AM';
          } else {
            this.amOrPm = 'PM';
          }
          value[1] = value[1].replace("AM", "").replace("PM", "");
        }
        if (value[0] === 'now') {
          var now = new Date(+new Date() + this.options.fromNow);
          value = [now.getHours(), now.getMinutes()];
          if (this.options.twelveHour) {
            this.amOrPm = value[0] >= 12 && value[0] < 24 ? 'PM' : 'AM';
          }
        }
        this.hours = +value[0] || 0;
        this.minutes = +value[1] || 0;
        this.spanHours.innerHTML = this.hours;
        this.spanMinutes.innerHTML = Timepicker._addLeadingZero(this.minutes);

        this._updateAmPmView();
      }
    }, {
      key: "showView",
      value: function showView(view, delay) {
        if (view === 'minutes' && $(this.hoursView).css("visibility") === "visible") {
          // raiseCallback(this.options.beforeHourSelect);
        }
        var isHours = view === 'hours',
            nextView = isHours ? this.hoursView : this.minutesView,
            hideView = isHours ? this.minutesView : this.hoursView;
        this.currentView = view;

        $(this.spanHours).toggleClass('text-primary', isHours);
        $(this.spanMinutes).toggleClass('text-primary', !isHours);

        // Transition view
        hideView.classList.add('timepicker-dial-out');
        $(nextView).css('visibility', 'visible').removeClass('timepicker-dial-out');

        // Reset clock hand
        this.resetClock(delay);

        // After transitions ended
        clearTimeout(this.toggleViewTimer);
        this.toggleViewTimer = setTimeout(function () {
          $(hideView).css('visibility', 'hidden');
        }, this.options.duration);
      }
    }, {
      key: "resetClock",
      value: function resetClock(delay) {
        var view = this.currentView,
            value = this[view],
            isHours = view === 'hours',
            unit = Math.PI / (isHours ? 6 : 30),
            radian = value * unit,
            radius = isHours && value > 0 && value < 13 ? this.options.innerRadius : this.options.outerRadius,
            x = Math.sin(radian) * radius,
            y = -Math.cos(radian) * radius,
            self = this;

        if (delay) {
          $(this.canvas).addClass('timepicker-canvas-out');
          setTimeout(function () {
            $(self.canvas).removeClass('timepicker-canvas-out');
            self.setHand(x, y);
          }, delay);
        } else {
          this.setHand(x, y);
        }
      }
    }, {
      key: "setHand",
      value: function setHand(x, y, roundBy5) {
        var _this59 = this;

        var radian = Math.atan2(x, -y),
            isHours = this.currentView === 'hours',
            unit = Math.PI / (isHours || roundBy5 ? 6 : 30),
            z = Math.sqrt(x * x + y * y),
            inner = isHours && z < (this.options.outerRadius + this.options.innerRadius) / 2,
            radius = inner ? this.options.innerRadius : this.options.outerRadius;

        if (this.options.twelveHour) {
          radius = this.options.outerRadius;
        }

        // Radian should in range [0, 2PI]
        if (radian < 0) {
          radian = Math.PI * 2 + radian;
        }

        // Get the round value
        var value = Math.round(radian / unit);

        // Get the round radian
        radian = value * unit;

        // Correct the hours or minutes
        if (this.options.twelveHour) {
          if (isHours) {
            if (value === 0) value = 12;
          } else {
            if (roundBy5) value *= 5;
            if (value === 60) value = 0;
          }
        } else {
          if (isHours) {
            if (value === 12) {
              value = 0;
            }
            value = inner ? value === 0 ? 12 : value : value === 0 ? 0 : value + 12;
          } else {
            if (roundBy5) {
              value *= 5;
            }
            if (value === 60) {
              value = 0;
            }
          }
        }

        // Once hours or minutes changed, vibrate the device
        if (this[this.currentView] !== value) {
          if (this.vibrate && this.options.vibrate) {
            // Do not vibrate too frequently
            if (!this.vibrateTimer) {
              navigator[this.vibrate](10);
              this.vibrateTimer = setTimeout(function () {
                _this59.vibrateTimer = null;
              }, 100);
            }
          }
        }

        this[this.currentView] = value;
        if (isHours) {
          this['spanHours'].innerHTML = value;
        } else {
          this['spanMinutes'].innerHTML = Timepicker._addLeadingZero(value);
        }

        // Set clock hand and others' position
        var cx1 = Math.sin(radian) * (radius - this.options.tickRadius),
            cy1 = -Math.cos(radian) * (radius - this.options.tickRadius),
            cx2 = Math.sin(radian) * radius,
            cy2 = -Math.cos(radian) * radius;
        this.hand.setAttribute('x2', cx1);
        this.hand.setAttribute('y2', cy1);
        this.bg.setAttribute('cx', cx2);
        this.bg.setAttribute('cy', cy2);
      }
    }, {
      key: "open",
      value: function open() {
        if (this.isOpen) {
          return;
        }

        this.isOpen = true;
        this._updateTimeFromInput();
        this.showView('hours');
        this.modal.open();
      }
    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        this.isOpen = false;
        this.modal.close();
      }

      /**
       * Finish timepicker selection.
       */

    }, {
      key: "done",
      value: function done(e, clearValue) {
        // Set input value
        var last = this.el.value;
        var value = clearValue ? '' : Timepicker._addLeadingZero(this.hours) + ':' + Timepicker._addLeadingZero(this.minutes);
        this.time = value;
        if (!clearValue && this.options.twelveHour) {
          value = value + " " + this.amOrPm;
        }
        this.el.value = value;

        // Trigger change event
        if (value !== last) {
          this.$el.trigger('change');
        }

        this.close();
        this.el.focus();
      }
    }, {
      key: "clear",
      value: function clear() {
        this.done(null, true);
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Timepicker.__proto__ || Object.getPrototypeOf(Timepicker), "init", this).call(this, this, els, options);
      }
    }, {
      key: "_addLeadingZero",
      value: function _addLeadingZero(num) {
        return (num < 10 ? '0' : '') + num;
      }
    }, {
      key: "_createSVGEl",
      value: function _createSVGEl(name) {
        var svgNS = 'http://www.w3.org/2000/svg';
        return document.createElementNS(svgNS, name);
      }

      /**
       * @typedef {Object} Point
       * @property {number} x The X Coordinate
       * @property {number} y The Y Coordinate
       */

      /**
       * Get x position of mouse or touch event
       * @param {Event} e
       * @return {Point} x and y location
       */

    }, {
      key: "_Pos",
      value: function _Pos(e) {
        if (e.targetTouches && e.targetTouches.length >= 1) {
          return { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
        }
        // mouse event
        return { x: e.clientX, y: e.clientY };
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Timepicker;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Timepicker;
  }(Component);

  Timepicker._template = ['<div class= "modal timepicker-modal">', '<div class="modal-content timepicker-container">', '<div class="timepicker-digital-display">', '<div class="timepicker-text-container">', '<div class="timepicker-display-column">', '<span class="timepicker-span-hours text-primary"></span>', ':', '<span class="timepicker-span-minutes"></span>', '</div>', '<div class="timepicker-display-column timepicker-display-am-pm">', '<div class="timepicker-span-am-pm"></div>', '</div>', '</div>', '</div>', '<div class="timepicker-analog-display">', '<div class="timepicker-plate">', '<div class="timepicker-canvas"></div>', '<div class="timepicker-dial timepicker-hours"></div>', '<div class="timepicker-dial timepicker-minutes timepicker-dial-out"></div>', '</div>', '<div class="timepicker-footer"></div>', '</div>', '</div>', '</div>'].join('');

  M.Timepicker = Timepicker;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Timepicker, 'timepicker', 'M_Timepicker');
  }
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {};

  /**
   * @class
   *
   */

  var CharacterCounter = function (_Component17) {
    _inherits(CharacterCounter, _Component17);

    /**
     * Construct CharacterCounter instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function CharacterCounter(el, options) {
      _classCallCheck(this, CharacterCounter);

      var _this60 = _possibleConstructorReturn(this, (CharacterCounter.__proto__ || Object.getPrototypeOf(CharacterCounter)).call(this, CharacterCounter, el, options));

      _this60.el.M_CharacterCounter = _this60;

      /**
       * Options for the character counter
       */
      _this60.options = $.extend({}, CharacterCounter.defaults, options);

      _this60.isInvalid = false;
      _this60.isValidLength = false;
      _this60._setupCounter();
      _this60._setupEventHandlers();
      return _this60;
    }

    _createClass(CharacterCounter, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.CharacterCounter = undefined;
        this._removeCounter();
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleUpdateCounterBound = this.updateCounter.bind(this);

        this.el.addEventListener('focus', this._handleUpdateCounterBound, true);
        this.el.addEventListener('input', this._handleUpdateCounterBound, true);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('focus', this._handleUpdateCounterBound, true);
        this.el.removeEventListener('input', this._handleUpdateCounterBound, true);
      }

      /**
       * Setup counter element
       */

    }, {
      key: "_setupCounter",
      value: function _setupCounter() {
        this.counterEl = document.createElement('span');
        $(this.counterEl).addClass('character-counter').css({
          float: 'right',
          'font-size': '12px',
          height: 1
        });

        this.$el.parent().append(this.counterEl);
      }

      /**
       * Remove counter element
       */

    }, {
      key: "_removeCounter",
      value: function _removeCounter() {
        $(this.counterEl).remove();
      }

      /**
       * Update counter
       */

    }, {
      key: "updateCounter",
      value: function updateCounter() {
        var maxLength = +this.$el.attr('data-length'),
            actualLength = this.el.value.length;
        this.isValidLength = actualLength <= maxLength;
        var counterString = actualLength;

        if (maxLength) {
          counterString += '/' + maxLength;
          this._validateInput();
        }

        $(this.counterEl).html(counterString);
      }

      /**
       * Add validation classes
       */

    }, {
      key: "_validateInput",
      value: function _validateInput() {
        if (this.isValidLength && this.isInvalid) {
          this.isInvalid = false;
          this.$el.removeClass('invalid');
        } else if (!this.isValidLength && !this.isInvalid) {
          this.isInvalid = true;
          this.$el.removeClass('valid');
          this.$el.addClass('invalid');
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(CharacterCounter.__proto__ || Object.getPrototypeOf(CharacterCounter), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_CharacterCounter;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return CharacterCounter;
  }(Component);

  M.CharacterCounter = CharacterCounter;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(CharacterCounter, 'characterCounter', 'M_CharacterCounter');
  }
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {
    duration: 200, // ms
    dist: -100, // zoom scale TODO: make this more intuitive as an option
    shift: 0, // spacing for center image
    padding: 0, // Padding between non center items
    numVisible: 5, // Number of visible items in carousel
    fullWidth: false, // Change to full width styles
    indicators: false, // Toggle indicators
    noWrap: false, // Don't wrap around and cycle through items.
    onCycleTo: null // Callback for when a new slide is cycled to.
  };

  /**
   * @class
   *
   */

  var Carousel = function (_Component18) {
    _inherits(Carousel, _Component18);

    /**
     * Construct Carousel instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Carousel(el, options) {
      _classCallCheck(this, Carousel);

      var _this61 = _possibleConstructorReturn(this, (Carousel.__proto__ || Object.getPrototypeOf(Carousel)).call(this, Carousel, el, options));

      _this61.el.M_Carousel = _this61;

      /**
       * Options for the carousel
       * @member Carousel#options
       * @prop {Number} duration
       * @prop {Number} dist
       * @prop {Number} shift
       * @prop {Number} padding
       * @prop {Number} numVisible
       * @prop {Boolean} fullWidth
       * @prop {Boolean} indicators
       * @prop {Boolean} noWrap
       * @prop {Function} onCycleTo
       */
      _this61.options = $.extend({}, Carousel.defaults, options);

      // Setup
      _this61.hasMultipleSlides = _this61.$el.find('.carousel-item').length > 1;
      _this61.showIndicators = _this61.options.indicators && _this61.hasMultipleSlides;
      _this61.noWrap = _this61.options.noWrap || !_this61.hasMultipleSlides;
      _this61.pressed = false;
      _this61.dragged = false;
      _this61.offset = _this61.target = 0;
      _this61.images = [];
      _this61.itemWidth = _this61.$el.find('.carousel-item').first().innerWidth();
      _this61.itemHeight = _this61.$el.find('.carousel-item').first().innerHeight();
      _this61.dim = _this61.itemWidth * 2 + _this61.options.padding || 1; // Make sure dim is non zero for divisions.
      _this61._autoScrollBound = _this61._autoScroll.bind(_this61);
      _this61._trackBound = _this61._track.bind(_this61);

      // Full Width carousel setup
      if (_this61.options.fullWidth) {
        _this61.options.dist = 0;
        _this61._setCarouselHeight();

        // Offset fixed items when indicators.
        if (_this61.showIndicators) {
          _this61.$el.find('.carousel-fixed-item').addClass('with-indicators');
        }
      }

      // Iterate through slides
      _this61.$indicators = $('<ul class="indicators"></ul>');
      _this61.$el.find('.carousel-item').each(function (el, i) {
        _this61.images.push(el);
        if (_this61.showIndicators) {
          var $indicator = $('<li class="indicator-item"></li>');

          // Add active to first by default.
          if (i === 0) {
            $indicator[0].classList.add('active');
          }

          _this61.$indicators.append($indicator);
        }
      });
      if (_this61.showIndicators) {
        _this61.$el.append(_this61.$indicators);
      }
      _this61.count = _this61.images.length;

      // Cap numVisible at count
      _this61.options.numVisible = Math.min(_this61.count, _this61.options.numVisible);

      // Setup cross browser string
      _this61.xform = 'transform';
      ['webkit', 'Moz', 'O', 'ms'].every(function (prefix) {
        var e = prefix + 'Transform';
        if (typeof document.body.style[e] !== 'undefined') {
          _this61.xform = e;
          return false;
        }
        return true;
      });

      _this61._setupEventHandlers();
      _this61._scroll(_this61.offset);
      return _this61;
    }

    _createClass(Carousel, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.M_Carousel = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        var _this62 = this;

        this._handleCarouselTapBound = this._handleCarouselTap.bind(this);
        this._handleCarouselDragBound = this._handleCarouselDrag.bind(this);
        this._handleCarouselReleaseBound = this._handleCarouselRelease.bind(this);
        this._handleCarouselClickBound = this._handleCarouselClick.bind(this);

        if (typeof window.ontouchstart !== 'undefined') {
          this.el.addEventListener('touchstart', this._handleCarouselTapBound);
          this.el.addEventListener('touchmove', this._handleCarouselDragBound);
          this.el.addEventListener('touchend', this._handleCarouselReleaseBound);
        }

        this.el.addEventListener('mousedown', this._handleCarouselTapBound);
        this.el.addEventListener('mousemove', this._handleCarouselDragBound);
        this.el.addEventListener('mouseup', this._handleCarouselReleaseBound);
        this.el.addEventListener('mouseleave', this._handleCarouselReleaseBound);
        this.el.addEventListener('click', this._handleCarouselClickBound);

        if (this.showIndicators && this.$indicators) {
          this._handleIndicatorClickBound = this._handleIndicatorClick.bind(this);
          this.$indicators.find('.indicator-item').each(function (el, i) {
            el.addEventListener('click', _this62._handleIndicatorClickBound);
          });
        }

        // Resize
        var throttledResize = M.throttle(this._handleResize, 200);
        this._handleThrottledResizeBound = throttledResize.bind(this);

        window.addEventListener('resize', this._handleThrottledResizeBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        var _this63 = this;

        if (typeof window.ontouchstart !== 'undefined') {
          this.el.removeEventListener('touchstart', this._handleCarouselTapBound);
          this.el.removeEventListener('touchmove', this._handleCarouselDragBound);
          this.el.removeEventListener('touchend', this._handleCarouselReleaseBound);
        }
        this.el.removeEventListener('mousedown', this._handleCarouselTapBound);
        this.el.removeEventListener('mousemove', this._handleCarouselDragBound);
        this.el.removeEventListener('mouseup', this._handleCarouselReleaseBound);
        this.el.removeEventListener('mouseleave', this._handleCarouselReleaseBound);
        this.el.removeEventListener('click', this._handleCarouselClickBound);

        if (this.showIndicators && this.$indicators) {
          this.$indicators.find('.indicator-item').each(function (el, i) {
            el.removeEventListener('click', _this63._handleIndicatorClickBound);
          });
        }

        window.removeEventListener('resize', this._handleThrottledResizeBound);
      }

      /**
       * Handle Carousel Tap
       * @param {Event} e
       */

    }, {
      key: "_handleCarouselTap",
      value: function _handleCarouselTap(e) {
        // Fixes firefox draggable image bug
        if (e.type === 'mousedown' && $(e.target).is('img')) {
          e.preventDefault();
        }
        this.pressed = true;
        this.dragged = false;
        this.verticalDragged = false;
        this.reference = this._xpos(e);
        this.referenceY = this._ypos(e);

        this.velocity = this.amplitude = 0;
        this.frame = this.offset;
        this.timestamp = Date.now();
        clearInterval(this.ticker);
        this.ticker = setInterval(this._trackBound, 100);
      }

      /**
       * Handle Carousel Drag
       * @param {Event} e
       */

    }, {
      key: "_handleCarouselDrag",
      value: function _handleCarouselDrag(e) {
        var x = void 0,
            y = void 0,
            delta = void 0,
            deltaY = void 0;
        if (this.pressed) {
          x = this._xpos(e);
          y = this._ypos(e);
          delta = this.reference - x;
          deltaY = Math.abs(this.referenceY - y);
          if (deltaY < 30 && !this.verticalDragged) {
            // If vertical scrolling don't allow dragging.
            if (delta > 2 || delta < -2) {
              this.dragged = true;
              this.reference = x;
              this._scroll(this.offset + delta);
            }
          } else if (this.dragged) {
            // If dragging don't allow vertical scroll.
            e.preventDefault();
            e.stopPropagation();
            return false;
          } else {
            // Vertical scrolling.
            this.verticalDragged = true;
          }
        }

        if (this.dragged) {
          // If dragging don't allow vertical scroll.
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      /**
       * Handle Carousel Release
       * @param {Event} e
       */

    }, {
      key: "_handleCarouselRelease",
      value: function _handleCarouselRelease(e) {
        if (this.pressed) {
          this.pressed = false;
        } else {
          return;
        }

        clearInterval(this.ticker);
        this.target = this.offset;
        if (this.velocity > 10 || this.velocity < -10) {
          this.amplitude = 0.9 * this.velocity;
          this.target = this.offset + this.amplitude;
        }
        this.target = Math.round(this.target / this.dim) * this.dim;

        // No wrap of items.
        if (this.noWrap) {
          if (this.target >= this.dim * (this.count - 1)) {
            this.target = this.dim * (this.count - 1);
          } else if (this.target < 0) {
            this.target = 0;
          }
        }
        this.amplitude = this.target - this.offset;
        this.timestamp = Date.now();
        requestAnimationFrame(this._autoScrollBound);

        if (this.dragged) {
          e.preventDefault();
          e.stopPropagation();
        }
        return false;
      }

      /**
       * Handle Carousel CLick
       * @param {Event} e
       */

    }, {
      key: "_handleCarouselClick",
      value: function _handleCarouselClick(e) {
        // Disable clicks if carousel was dragged.
        if (this.dragged) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        } else if (!this.options.fullWidth) {
          var clickedIndex = $(e.target).closest('.carousel-item').index();
          var diff = this._wrap(this.center) - clickedIndex;

          // Disable clicks if carousel was shifted by click
          if (diff !== 0) {
            e.preventDefault();
            e.stopPropagation();
          }
          this._cycleTo(clickedIndex);
        }
      }

      /**
       * Handle Indicator CLick
       * @param {Event} e
       */

    }, {
      key: "_handleIndicatorClick",
      value: function _handleIndicatorClick(e) {
        e.stopPropagation();

        var indicator = $(e.target).closest('.indicator-item');
        if (indicator.length) {
          this._cycleTo(indicator.index());
        }
      }

      /**
       * Handle Throttle Resize
       * @param {Event} e
       */

    }, {
      key: "_handleResize",
      value: function _handleResize(e) {
        if (this.options.fullWidth) {
          this.itemWidth = this.$el.find('.carousel-item').first().innerWidth();
          this.imageHeight = this.$el.find('.carousel-item.active').height();
          this.dim = this.itemWidth * 2 + this.options.padding;
          this.offset = this.center * 2 * this.itemWidth;
          this.target = this.offset;
          this._setCarouselHeight(true);
        } else {
          this._scroll();
        }
      }

      /**
       * Set carousel height based on first slide
       * @param {Booleam} imageOnly - true for image slides
       */

    }, {
      key: "_setCarouselHeight",
      value: function _setCarouselHeight(imageOnly) {
        var _this64 = this;

        var firstSlide = this.$el.find('.carousel-item.active').length ? this.$el.find('.carousel-item.active').first() : this.$el.find('.carousel-item').first();
        var firstImage = firstSlide.find('img').first();
        if (firstImage.length) {
          if (firstImage[0].complete) {
            // If image won't trigger the load event
            var imageHeight = firstImage.height();
            if (imageHeight > 0) {
              this.$el.css('height', imageHeight + 'px');
            } else {
              // If image still has no height, use the natural dimensions to calculate
              var naturalWidth = firstImage[0].naturalWidth;
              var naturalHeight = firstImage[0].naturalHeight;
              var adjustedHeight = this.$el.width() / naturalWidth * naturalHeight;
              this.$el.css('height', adjustedHeight + 'px');
            }
          } else {
            // Get height when image is loaded normally
            firstImage.one('load', function (el, i) {
              _this64.$el.css('height', el.offsetHeight + 'px');
            });
          }
        } else if (!imageOnly) {
          var slideHeight = firstSlide.height();
          this.$el.css('height', slideHeight + 'px');
        }
      }

      /**
       * Get x position from event
       * @param {Event} e
       */

    }, {
      key: "_xpos",
      value: function _xpos(e) {
        // touch event
        if (e.targetTouches && e.targetTouches.length >= 1) {
          return e.targetTouches[0].clientX;
        }

        // mouse event
        return e.clientX;
      }

      /**
       * Get y position from event
       * @param {Event} e
       */

    }, {
      key: "_ypos",
      value: function _ypos(e) {
        // touch event
        if (e.targetTouches && e.targetTouches.length >= 1) {
          return e.targetTouches[0].clientY;
        }

        // mouse event
        return e.clientY;
      }

      /**
       * Wrap index
       * @param {Number} x
       */

    }, {
      key: "_wrap",
      value: function _wrap(x) {
        return x >= this.count ? x % this.count : x < 0 ? this._wrap(this.count + x % this.count) : x;
      }

      /**
       * Tracks scrolling information
       */

    }, {
      key: "_track",
      value: function _track() {
        var now = void 0,
            elapsed = void 0,
            delta = void 0,
            v = void 0;

        now = Date.now();
        elapsed = now - this.timestamp;
        this.timestamp = now;
        delta = this.offset - this.frame;
        this.frame = this.offset;

        v = 1000 * delta / (1 + elapsed);
        this.velocity = 0.8 * v + 0.2 * this.velocity;
      }

      /**
       * Auto scrolls to nearest carousel item.
       */

    }, {
      key: "_autoScroll",
      value: function _autoScroll() {
        var elapsed = void 0,
            delta = void 0;

        if (this.amplitude) {
          elapsed = Date.now() - this.timestamp;
          delta = this.amplitude * Math.exp(-elapsed / this.options.duration);
          if (delta > 2 || delta < -2) {
            this._scroll(this.target - delta);
            requestAnimationFrame(this._autoScrollBound);
          } else {
            this._scroll(this.target);
          }
        }
      }

      /**
       * Scroll to target
       * @param {Number} x
       */

    }, {
      key: "_scroll",
      value: function _scroll(x) {
        var _this65 = this;

        // Track scrolling state
        if (!this.$el.hasClass('scrolling')) {
          this.el.classList.add('scrolling');
        }
        if (this.scrollingTimeout != null) {
          window.clearTimeout(this.scrollingTimeout);
        }
        this.scrollingTimeout = window.setTimeout(function () {
          _this65.$el.removeClass('scrolling');
        }, this.options.duration);

        // Start actual scroll
        var i = void 0,
            half = void 0,
            delta = void 0,
            dir = void 0,
            tween = void 0,
            el = void 0,
            alignment = void 0,
            zTranslation = void 0,
            tweenedOpacity = void 0,
            centerTweenedOpacity = void 0;
        var lastCenter = this.center;
        var numVisibleOffset = 1 / this.options.numVisible;

        this.offset = typeof x === 'number' ? x : this.offset;
        this.center = Math.floor((this.offset + this.dim / 2) / this.dim);
        delta = this.offset - this.center * this.dim;
        dir = delta < 0 ? 1 : -1;
        tween = -dir * delta * 2 / this.dim;
        half = this.count >> 1;

        if (this.options.fullWidth) {
          alignment = 'translateX(0)';
          centerTweenedOpacity = 1;
        } else {
          alignment = 'translateX(' + (this.el.clientWidth - this.itemWidth) / 2 + 'px) ';
          alignment += 'translateY(' + (this.el.clientHeight - this.itemHeight) / 2 + 'px)';
          centerTweenedOpacity = 1 - numVisibleOffset * tween;
        }

        // Set indicator active
        if (this.showIndicators) {
          var diff = this.center % this.count;
          var activeIndicator = this.$indicators.find('.indicator-item.active');
          if (activeIndicator.index() !== diff) {
            activeIndicator.removeClass('active');
            this.$indicators.find('.indicator-item').eq(diff)[0].classList.add('active');
          }
        }

        // center
        // Don't show wrapped items.
        if (!this.noWrap || this.center >= 0 && this.center < this.count) {
          el = this.images[this._wrap(this.center)];

          // Add active class to center item.
          if (!$(el).hasClass('active')) {
            this.$el.find('.carousel-item').removeClass('active');
            el.classList.add('active');
          }
          var transformString = alignment + ' translateX(' + -delta / 2 + 'px)' + ' translateX(' + dir * this.options.shift * tween * i + 'px)' + ' translateZ(' + this.options.dist * tween + 'px)';
          this._updateItemStyle(el, centerTweenedOpacity, 0, transformString);
        }

        for (i = 1; i <= half; ++i) {
          // right side
          if (this.options.fullWidth) {
            zTranslation = this.options.dist;
            tweenedOpacity = i === half && delta < 0 ? 1 - tween : 1;
          } else {
            zTranslation = this.options.dist * (i * 2 + tween * dir);
            tweenedOpacity = 1 - numVisibleOffset * (i * 2 + tween * dir);
          }
          // Don't show wrapped items.
          if (!this.noWrap || this.center + i < this.count) {
            el = this.images[this._wrap(this.center + i)];
            var _transformString = alignment + ' translateX(' + (this.options.shift + (this.dim * i - delta) / 2) + 'px)' + ' translateZ(' + zTranslation + 'px)';
            this._updateItemStyle(el, tweenedOpacity, -i, _transformString);
          }

          // left side
          if (this.options.fullWidth) {
            zTranslation = this.options.dist;
            tweenedOpacity = i === half && delta > 0 ? 1 - tween : 1;
          } else {
            zTranslation = this.options.dist * (i * 2 - tween * dir);
            tweenedOpacity = 1 - numVisibleOffset * (i * 2 - tween * dir);
          }
          // Don't show wrapped items.
          if (!this.noWrap || this.center - i >= 0) {
            el = this.images[this._wrap(this.center - i)];
            var _transformString2 = alignment + ' translateX(' + (-this.options.shift + (-this.dim * i - delta) / 2) + 'px)' + ' translateZ(' + zTranslation + 'px)';
            this._updateItemStyle(el, tweenedOpacity, -i, _transformString2);
          }
        }

        // center
        // Don't show wrapped items.
        if (!this.noWrap || this.center >= 0 && this.center < this.count) {
          el = this.images[this._wrap(this.center)];
          var _transformString3 = alignment + ' translateX(' + -delta / 2 + 'px)' + ' translateX(' + dir * this.options.shift * tween + 'px)' + ' translateZ(' + this.options.dist * tween + 'px)';
          this._updateItemStyle(el, centerTweenedOpacity, 0, _transformString3);
        }

        // onCycleTo callback
        var $currItem = this.$el.find('.carousel-item').eq(this._wrap(this.center));
        if (lastCenter !== this.center && typeof this.options.onCycleTo === "function") {
          this.options.onCycleTo.call(this, $currItem[0], this.dragged);
        }

        // One time callback
        if (typeof this.oneTimeCallback === "function") {
          this.oneTimeCallback.call(this, $currItem[0], this.dragged);
          this.oneTimeCallback = null;
        }
      }

      /**
       * Cycle to target
       * @param {Element} el
       * @param {Number} opacity
       * @param {Number} zIndex
       * @param {String} transform
       */

    }, {
      key: "_updateItemStyle",
      value: function _updateItemStyle(el, opacity, zIndex, transform) {
        el.style[this.xform] = transform;
        el.style.zIndex = zIndex;
        el.style.opacity = opacity;
        el.style.visibility = 'visible';
      }

      /**
       * Cycle to target
       * @param {Number} n
       * @param {Function} callback
       */

    }, {
      key: "_cycleTo",
      value: function _cycleTo(n, callback) {
        var diff = this.center % this.count - n;

        // Account for wraparound.
        if (!this.noWrap) {
          if (diff < 0) {
            if (Math.abs(diff + this.count) < Math.abs(diff)) {
              diff += this.count;
            }
          } else if (diff > 0) {
            if (Math.abs(diff - this.count) < diff) {
              diff -= this.count;
            }
          }
        }

        this.target = this.dim * Math.round(this.offset / this.dim);
        // Next
        if (diff < 0) {
          this.target += this.dim * Math.abs(diff);

          // Prev
        } else if (diff > 0) {
          this.target -= this.dim * diff;
        }

        // Set one time callback
        if (typeof callback === "function") {
          this.oneTimeCallback = callback;
        }

        // Scroll
        if (this.offset !== this.target) {
          this.amplitude = this.target - this.offset;
          this.timestamp = Date.now();
          requestAnimationFrame(this._autoScrollBound);
        }
      }

      /**
       * Cycle to next item
       * @param {Number} [n]
       */

    }, {
      key: "next",
      value: function next(n) {
        if (n === undefined || isNaN(n)) {
          n = 1;
        }

        var index = this.center + n;
        if (index > this.count || index < 0) {
          if (this.noWrap) {
            return;
          }

          index = this._wrap(index);
        }
        this._cycleTo(index);
      }

      /**
       * Cycle to previous item
       * @param {Number} [n]
       */

    }, {
      key: "prev",
      value: function prev(n) {
        if (n === undefined || isNaN(n)) {
          n = 1;
        }

        var index = this.center - n;
        if (index > this.count || index < 0) {
          if (this.noWrap) {
            return;
          }

          index = this._wrap(index);
        }

        this._cycleTo(index);
      }

      /**
       * Cycle to nth item
       * @param {Number} [n]
       * @param {Function} callback
       */

    }, {
      key: "set",
      value: function set(n, callback) {
        if (n === undefined || isNaN(n)) {
          n = 0;
        }

        if (n > this.count || n < 0) {
          if (this.noWrap) {
            return;
          }

          n = this._wrap(n);
        }

        this._cycleTo(n, callback);
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Carousel.__proto__ || Object.getPrototypeOf(Carousel), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Carousel;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Carousel;
  }(Component);

  M.Carousel = Carousel;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Carousel, 'carousel', 'M_Carousel');
  }
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {
    onOpen: undefined,
    onClose: undefined
  };

  /**
   * @class
   *
   */

  var TapTarget = function (_Component19) {
    _inherits(TapTarget, _Component19);

    /**
     * Construct TapTarget instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function TapTarget(el, options) {
      _classCallCheck(this, TapTarget);

      var _this66 = _possibleConstructorReturn(this, (TapTarget.__proto__ || Object.getPrototypeOf(TapTarget)).call(this, TapTarget, el, options));

      _this66.el.M_TapTarget = _this66;

      /**
       * Options for the select
       * @member TapTarget#options
       * @prop {Function} onOpen - Callback function called when feature discovery is opened
       * @prop {Function} onClose - Callback function called when feature discovery is closed
       */
      _this66.options = $.extend({}, TapTarget.defaults, options);

      _this66.isOpen = false;

      // setup
      _this66.$origin = $('#' + _this66.$el.attr('data-target'));
      _this66._setup();

      _this66._calculatePositioning();
      _this66._setupEventHandlers();
      return _this66;
    }

    _createClass(TapTarget, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.TapTarget = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleDocumentClickBound = this._handleDocumentClick.bind(this);
        this._handleTargetClickBound = this._handleTargetClick.bind(this);
        this._handleOriginClickBound = this._handleOriginClick.bind(this);

        this.el.addEventListener('click', this._handleTargetClickBound);
        this.originEl.addEventListener('click', this._handleOriginClickBound);

        // Resize
        var throttledResize = M.throttle(this._handleResize, 200);
        this._handleThrottledResizeBound = throttledResize.bind(this);

        window.addEventListener('resize', this._handleThrottledResizeBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('click', this._handleTargetClickBound);
        this.originEl.removeEventListener('click', this._handleOriginClickBound);
        window.removeEventListener('resize', this._handleThrottledResizeBound);
      }

      /**
       * Handle Target Click
       * @param {Event} e
       */

    }, {
      key: "_handleTargetClick",
      value: function _handleTargetClick(e) {
        this.open();
      }

      /**
       * Handle Origin Click
       * @param {Event} e
       */

    }, {
      key: "_handleOriginClick",
      value: function _handleOriginClick(e) {
        this.close();
      }

      /**
       * Handle Resize
       * @param {Event} e
       */

    }, {
      key: "_handleResize",
      value: function _handleResize(e) {
        this._calculatePositioning();
      }

      /**
       * Handle Resize
       * @param {Event} e
       */

    }, {
      key: "_handleDocumentClick",
      value: function _handleDocumentClick(e) {
        if (!$(e.target).closest('.tap-target-wrapper').length) {
          this.close();
          e.preventDefault();
          e.stopPropagation();
        }
      }

      /**
       * Setup Tap Target
       */

    }, {
      key: "_setup",
      value: function _setup() {
        // Creating tap target
        this.wrapper = this.$el.parent()[0];
        this.waveEl = $(this.wrapper).find('.tap-target-wave')[0];
        this.originEl = $(this.wrapper).find('.tap-target-origin')[0];
        this.contentEl = this.$el.find('.tap-target-content')[0];

        // Creating wrapper
        if (!$(this.wrapper).hasClass('.tap-target-wrapper')) {
          this.wrapper = document.createElement('div');
          this.wrapper.classList.add('tap-target-wrapper');
          this.$el.before($(this.wrapper));
          this.wrapper.append(this.el);
        }

        // Creating content
        if (!this.contentEl) {
          this.contentEl = document.createElement('div');
          this.contentEl.classList.add('tap-target-content');
          this.$el.append(this.contentEl);
        }

        // Creating foreground wave
        if (!this.waveEl) {
          this.waveEl = document.createElement('div');
          this.waveEl.classList.add('tap-target-wave');

          // Creating origin
          if (!this.originEl) {
            this.originEl = this.$origin.clone(true, true);
            this.originEl.addClass('tap-target-origin');
            this.originEl.removeAttr('id');
            this.originEl.removeAttr('style');
            this.originEl = this.originEl[0];
            this.waveEl.append(this.originEl);
          }

          this.wrapper.append(this.waveEl);
        }
      }

      /**
       * Calculate positioning
       */

    }, {
      key: "_calculatePositioning",
      value: function _calculatePositioning() {
        // Element or parent is fixed position?
        var isFixed = this.$origin.css('position') === 'fixed';
        if (!isFixed) {
          var parents = this.$origin.parents();
          for (var i = 0; i < parents.length; i++) {
            isFixed = $(parents[i]).css('position') == 'fixed';
            if (isFixed) {
              break;
            }
          }
        }

        // Calculating origin
        var originWidth = this.$origin.outerWidth();
        var originHeight = this.$origin.outerHeight();
        var originTop = isFixed ? this.$origin.offset().top - M.getDocumentScrollTop() : this.$origin.offset().top;
        var originLeft = isFixed ? this.$origin.offset().left - M.getDocumentScrollLeft() : this.$origin.offset().left;

        // Calculating screen
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var centerX = windowWidth / 2;
        var centerY = windowHeight / 2;
        var isLeft = originLeft <= centerX;
        var isRight = originLeft > centerX;
        var isTop = originTop <= centerY;
        var isBottom = originTop > centerY;
        var isCenterX = originLeft >= windowWidth * 0.25 && originLeft <= windowWidth * 0.75;

        // Calculating tap target
        var tapTargetWidth = this.$el.outerWidth();
        var tapTargetHeight = this.$el.outerHeight();
        var tapTargetTop = originTop + originHeight / 2 - tapTargetHeight / 2;
        var tapTargetLeft = originLeft + originWidth / 2 - tapTargetWidth / 2;
        var tapTargetPosition = isFixed ? 'fixed' : 'absolute';

        // Calculating content
        var tapTargetTextWidth = isCenterX ? tapTargetWidth : tapTargetWidth / 2 + originWidth;
        var tapTargetTextHeight = tapTargetHeight / 2;
        var tapTargetTextTop = isTop ? tapTargetHeight / 2 : 0;
        var tapTargetTextBottom = 0;
        var tapTargetTextLeft = isLeft && !isCenterX ? tapTargetWidth / 2 - originWidth : 0;
        var tapTargetTextRight = 0;
        var tapTargetTextPadding = originWidth;
        var tapTargetTextAlign = isBottom ? 'bottom' : 'top';

        // Calculating wave
        var tapTargetWaveWidth = originWidth > originHeight ? originWidth * 2 : originWidth * 2;
        var tapTargetWaveHeight = tapTargetWaveWidth;
        var tapTargetWaveTop = tapTargetHeight / 2 - tapTargetWaveHeight / 2;
        var tapTargetWaveLeft = tapTargetWidth / 2 - tapTargetWaveWidth / 2;

        // Setting tap target
        var tapTargetWrapperCssObj = {};
        tapTargetWrapperCssObj.top = isTop ? tapTargetTop + 'px' : '';
        tapTargetWrapperCssObj.right = isRight ? windowWidth - tapTargetLeft - tapTargetWidth + 'px' : '';
        tapTargetWrapperCssObj.bottom = isBottom ? windowHeight - tapTargetTop - tapTargetHeight + 'px' : '';
        tapTargetWrapperCssObj.left = isLeft ? tapTargetLeft + 'px' : '';
        tapTargetWrapperCssObj.position = tapTargetPosition;
        $(this.wrapper).css(tapTargetWrapperCssObj);

        // Setting content
        $(this.contentEl).css({
          width: tapTargetTextWidth + 'px',
          height: tapTargetTextHeight + 'px',
          top: tapTargetTextTop + 'px',
          right: tapTargetTextRight + 'px',
          bottom: tapTargetTextBottom + 'px',
          left: tapTargetTextLeft + 'px',
          padding: tapTargetTextPadding + 'px',
          verticalAlign: tapTargetTextAlign
        });

        // Setting wave
        $(this.waveEl).css({
          top: tapTargetWaveTop + 'px',
          left: tapTargetWaveLeft + 'px',
          width: tapTargetWaveWidth + 'px',
          height: tapTargetWaveHeight + 'px'
        });
      }

      /**
       * Open TapTarget
       */

    }, {
      key: "open",
      value: function open() {
        if (this.isOpen) {
          return;
        }

        // onOpen callback
        if (typeof this.options.onOpen === 'function') {
          this.options.onOpen.call(this, this.$origin[0]);
        }

        this.isOpen = true;
        this.wrapper.classList.add('open');

        document.body.addEventListener('click', this._handleDocumentClickBound, true);
        document.body.addEventListener('touchend', this._handleDocumentClickBound);
      }

      /**
       * Close Tap Target
       */

    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        // onClose callback
        if (typeof this.options.onClose === 'function') {
          this.options.onClose.call(this, this.$origin[0]);
        }

        this.isOpen = false;
        this.wrapper.classList.remove('open');

        document.body.removeEventListener('click', this._handleDocumentClickBound, true);
        document.body.removeEventListener('touchend', this._handleDocumentClickBound);
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(TapTarget.__proto__ || Object.getPrototypeOf(TapTarget), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_TapTarget;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return TapTarget;
  }(Component);

  M.TapTarget = TapTarget;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(TapTarget, 'tapTarget', 'M_TapTarget');
  }
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {
    classes: '',
    dropdownOptions: {}
  };

  /**
   * @class
   *
   */

  var FormSelect = function (_Component20) {
    _inherits(FormSelect, _Component20);

    /**
     * Construct FormSelect instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function FormSelect(el, options) {
      _classCallCheck(this, FormSelect);

      // Don't init if browser default version
      var _this67 = _possibleConstructorReturn(this, (FormSelect.__proto__ || Object.getPrototypeOf(FormSelect)).call(this, FormSelect, el, options));

      if (_this67.$el.hasClass('browser-default')) {
        return _possibleConstructorReturn(_this67);
      }

      _this67.el.M_FormSelect = _this67;

      /**
       * Options for the select
       * @member FormSelect#options
       */
      _this67.options = $.extend({}, FormSelect.defaults, options);

      _this67.isMultiple = _this67.$el.prop('multiple');

      // Setup
      _this67.el.tabIndex = -1;
      _this67._keysSelected = {};
      _this67._valueDict = {}; // Maps key to original and generated option element.
      _this67._setupDropdown();

      _this67._setupEventHandlers();
      return _this67;
    }

    _createClass(FormSelect, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this._removeDropdown();
        this.el.M_FormSelect = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        var _this68 = this;

        this._handleSelectChangeBound = this._handleSelectChange.bind(this);
        this._handleOptionClickBound = this._handleOptionClick.bind(this);
        this._handleInputClickBound = this._handleInputClick.bind(this);

        $(this.dropdownOptions).find('li:not(.optgroup)').each(function (el) {
          el.addEventListener('click', _this68._handleOptionClickBound);
        });
        this.el.addEventListener('change', this._handleSelectChangeBound);
        this.input.addEventListener('click', this._handleInputClickBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        var _this69 = this;

        $(this.dropdownOptions).find('li:not(.optgroup)').each(function (el) {
          el.removeEventListener('click', _this69._handleOptionClickBound);
        });
        this.el.removeEventListener('change', this._handleSelectChangeBound);
        this.input.removeEventListener('click', this._handleInputClickBound);
      }

      /**
       * Handle Select Change
       * @param {Event} e
       */

    }, {
      key: "_handleSelectChange",
      value: function _handleSelectChange(e) {
        this._setValueToInput();
      }

      /**
       * Handle Option Click
       * @param {Event} e
       */

    }, {
      key: "_handleOptionClick",
      value: function _handleOptionClick(e) {
        e.preventDefault();
        var option = $(e.target).closest('li')[0];
        var key = option.id;
        if (!$(option).hasClass('disabled') && !$(option).hasClass('optgroup') && key.length) {
          var selected = true;

          if (this.isMultiple) {
            // Deselect placeholder option if still selected.
            var placeholderOption = $(this.dropdownOptions).find('li.disabled.selected');
            if (placeholderOption.length) {
              placeholderOption.removeClass('selected');
              placeholderOption.find('input[type="checkbox"]').prop('checked', false);
              this._toggleEntryFromArray(placeholderOption[0].id);
            }

            var checkbox = $(option).find('input[type="checkbox"]');
            checkbox.prop('checked', !checkbox.prop('checked'));
            selected = this._toggleEntryFromArray(key);
          } else {
            $(this.dropdownOptions).find('li').removeClass('active');
            $(option).toggleClass('active');
            this.input.value = option.textContent;
          }

          this._activateOption($(this.dropdownOptions), option);
          $(this._valueDict[key].el).prop('selected', selected);
          this.$el.trigger('change');
        }

        e.stopPropagation();
      }

      /**
       * Handle Input Click
       */

    }, {
      key: "_handleInputClick",
      value: function _handleInputClick() {
        if (this.dropdown && this.dropdown.isOpen) {
          this._setValueToInput();
          this._setSelectedStates();
        }
      }

      /**
       * Setup dropdown
       */

    }, {
      key: "_setupDropdown",
      value: function _setupDropdown() {
        var _this70 = this;

        this.wrapper = document.createElement('div');
        $(this.wrapper).addClass('select-wrapper' + ' ' + this.options.classes);
        this.$el.before($(this.wrapper));
        this.wrapper.appendChild(this.el);

        if (this.el.disabled) {
          this.wrapper.classList.add('disabled');
        }

        // Create dropdown
        this.$selectOptions = this.$el.children('option, optgroup');
        this.dropdownOptions = document.createElement('ul');
        this.dropdownOptions.id = "select-options-" + M.guid();
        $(this.dropdownOptions).addClass('dropdown-content select-dropdown ' + (this.isMultiple ? 'multiple-select-dropdown' : ''));

        // Create dropdown structure.
        if (this.$selectOptions.length) {
          this.$selectOptions.each(function (el) {
            if ($(el).is('option')) {
              // Direct descendant option.
              var optionEl = void 0;
              if (_this70.isMultiple) {
                optionEl = _this70._appendOptionWithIcon(_this70.$el, el, 'multiple');
              } else {
                optionEl = _this70._appendOptionWithIcon(_this70.$el, el);
              }

              _this70._addOptionToValueDict(el, optionEl);
            } else if ($(el).is('optgroup')) {
              // Optgroup.
              var selectOptions = $(el).children('option');
              $(_this70.dropdownOptions).append($('<li class="optgroup"><span>' + el.getAttribute('label') + '</span></li>')[0]);

              selectOptions.each(function (el) {
                var optionEl = _this70._appendOptionWithIcon(_this70.$el, el, 'optgroup-option');
                _this70._addOptionToValueDict(el, optionEl);
              });
            }
          });
        }

        this.$el.after(this.dropdownOptions);

        // Add input dropdown
        this.input = document.createElement('input');
        $(this.input).addClass('select-dropdown dropdown-trigger');
        this.input.setAttribute('type', 'text');
        this.input.setAttribute('readonly', 'true');
        this.input.setAttribute('data-target', this.dropdownOptions.id);
        if (this.el.disabled) {
          $(this.input).prop('disabled', 'true');
        }

        this.$el.before(this.input);
        this._setValueToInput();

        // Add caret
        var dropdownIcon = $('<svg class="caret" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>');
        this.$el.before(dropdownIcon[0]);

        // Initialize dropdown
        if (!this.el.disabled) {
          var dropdownOptions = $.extend({}, this.options.dropdownOptions);

          // Add callback for centering selected option when dropdown content is scrollable
          dropdownOptions.onOpenEnd = function (el) {
            var selectedOption = $(_this70.dropdownOptions).find('.selected').first();
            if (_this70.dropdown.isScrollable && selectedOption.length) {
              var scrollOffset = selectedOption[0].getBoundingClientRect().top - _this70.dropdownOptions.getBoundingClientRect().top; // scroll to selected option
              scrollOffset -= _this70.dropdownOptions.clientHeight / 2; // center in dropdown
              _this70.dropdownOptions.scrollTop = scrollOffset;
            }
          };

          if (this.isMultiple) {
            dropdownOptions.closeOnClick = false;
          }
          this.dropdown = M.Dropdown.init(this.input, dropdownOptions);
        }

        // Add initial selections
        this._setSelectedStates();
      }

      /**
       * Add option to value dict
       * @param {Element} el  original option element
       * @param {Element} optionEl  generated option element
       */

    }, {
      key: "_addOptionToValueDict",
      value: function _addOptionToValueDict(el, optionEl) {
        var index = Object.keys(this._valueDict).length;
        var key = this.dropdownOptions.id + index;
        var obj = {};
        optionEl.id = key;

        obj.el = el;
        obj.optionEl = optionEl;
        this._valueDict[key] = obj;
      }

      /**
       * Remove dropdown
       */

    }, {
      key: "_removeDropdown",
      value: function _removeDropdown() {
        $(this.wrapper).find('.caret').remove();
        $(this.input).remove();
        $(this.dropdownOptions).remove();
        $(this.wrapper).before(this.$el);
        $(this.wrapper).remove();
      }

      /**
       * Setup dropdown
       * @param {Element} select  select element
       * @param {Element} option  option element from select
       * @param {String} type
       * @return {Element}  option element added
       */

    }, {
      key: "_appendOptionWithIcon",
      value: function _appendOptionWithIcon(select, option, type) {
        // Add disabled attr if disabled
        var disabledClass = option.disabled ? 'disabled ' : '';
        var optgroupClass = type === 'optgroup-option' ? 'optgroup-option ' : '';
        var multipleCheckbox = this.isMultiple ? "<label><input type=\"checkbox\"" + disabledClass + "\"/><span>" + option.innerHTML + "</span></label>" : option.innerHTML;
        var liEl = $('<li></li>');
        var spanEl = $('<span></span>');
        spanEl.html(multipleCheckbox);
        liEl.addClass(disabledClass + " " + optgroupClass);
        liEl.append(spanEl);

        // add icons
        var iconUrl = option.getAttribute('data-icon');
        var classes = option.getAttribute('class');
        if (!!iconUrl) {
          var imgEl = $('<img alt="" src="' + iconUrl + '">');
          liEl.prepend(imgEl);
        }

        // Check for multiple type.
        $(this.dropdownOptions).append(liEl[0]);
        return liEl[0];
      }

      /**
       * Toggle entry from option
       * @param {String} key  Option key
       * @return {Boolean}  if entry was added or removed
       */

    }, {
      key: "_toggleEntryFromArray",
      value: function _toggleEntryFromArray(key) {
        var notAdded = !this._keysSelected.hasOwnProperty(key);
        if (notAdded) {
          this._keysSelected[key] = true;
        } else {
          delete this._keysSelected[key];
        }

        $(this._valueDict[key].optionEl).toggleClass('active');

        // use notAdded instead of true (to detect if the option is selected or not)
        $(this._valueDict[key].el).prop('selected', notAdded);

        return notAdded;
      }

      /**
       * Set value to input
       */

    }, {
      key: "_setValueToInput",
      value: function _setValueToInput() {
        var value = '';
        var options = this.$el.find('option');

        options.each(function (el) {
          if ($(el).prop('selected')) {
            var text = $(el).text();
            value === '' ? value += text : value += ', ' + text;
          }
        });

        if (value === '') {
          var firstDisabled = this.$el.find('option:disabled').eq(0);
          if (firstDisabled.length) {
            value = firstDisabled.text();
          }
        }

        this.input.value = value;
      }

      /**
       * Set selected state of dropdown too match actual select element
       */

    }, {
      key: "_setSelectedStates",
      value: function _setSelectedStates() {
        this._keysSelected = {};

        for (var key in this._valueDict) {
          var option = this._valueDict[key];
          if ($(option.el).prop('selected')) {
            $(option.optionEl).find('input[type="checkbox"]').prop("checked", true);
            this._activateOption($(this.dropdownOptions), $(option.optionEl));
            this._keysSelected[key] = true;
          } else {
            $(option.optionEl).find('input[type="checkbox"]').prop("checked", false);
            $(option.optionEl).removeClass('selected');
          }
        }
      }

      /**
       * Make option as selected and scroll to selected position
       * @param {jQuery} collection  Select options jQuery element
       * @param {Element} newOption  element of the new option
       */

    }, {
      key: "_activateOption",
      value: function _activateOption(collection, newOption) {
        if (newOption) {
          if (!this.isMultiple) {
            collection.find('li.selected').removeClass('selected');
          }

          var option = $(newOption);
          option.addClass('selected');
        }
      }

      /**
       * Get Selected Values
       * @return {Array}  Array of selected values
       */

    }, {
      key: "getSelectedValues",
      value: function getSelectedValues() {
        var selectedValues = [];
        for (var key in this._keysSelected) {
          selectedValues.push(this._valueDict[key].el.value);
        }
        return selectedValues;
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(FormSelect.__proto__ || Object.getPrototypeOf(FormSelect), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_FormSelect;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return FormSelect;
  }(Component);

  M.FormSelect = FormSelect;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(FormSelect, 'formSelect', 'M_FormSelect');
  }
})(cash);
;(function ($, anim) {
  'use strict';

  var _defaults = {};

  /**
   * @class
   *
   */

  var Range = function (_Component21) {
    _inherits(Range, _Component21);

    /**
     * Construct Range instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Range(el, options) {
      _classCallCheck(this, Range);

      var _this71 = _possibleConstructorReturn(this, (Range.__proto__ || Object.getPrototypeOf(Range)).call(this, Range, el, options));

      _this71.el.M_Range = _this71;

      /**
       * Options for the range
       * @member Range#options
       */
      _this71.options = $.extend({}, Range.defaults, options);

      _this71._mousedown = false;

      // Setup
      _this71._setupThumb();

      _this71._setupEventHandlers();
      return _this71;
    }

    _createClass(Range, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this._removeThumb();
        this.el.M_Range = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleRangeChangeBound = this._handleRangeChange.bind(this);
        this._handleRangeFocusBound = this._handleRangeFocus.bind(this);
        this._handleRangeMousedownTouchstartBound = this._handleRangeMousedownTouchstart.bind(this);
        this._handleRangeInputMousemoveTouchmoveBound = this._handleRangeInputMousemoveTouchmove.bind(this);
        this._handleRangeMouseupTouchendBound = this._handleRangeMouseupTouchend.bind(this);
        this._handleRangeBlurMouseoutTouchleaveBound = this._handleRangeBlurMouseoutTouchleave.bind(this);

        this.el.addEventListener('change', this._handleRangeChangeBound);
        this.el.addEventListener('focus', this._handleRangeFocusBound);

        this.el.addEventListener('mousedown', this._handleRangeMousedownTouchstartBound);
        this.el.addEventListener('touchstart', this._handleRangeMousedownTouchstartBound);

        this.el.addEventListener('input', this._handleRangeInputMousemoveTouchmoveBound);
        this.el.addEventListener('mousemove', this._handleRangeInputMousemoveTouchmoveBound);
        this.el.addEventListener('touchmove', this._handleRangeInputMousemoveTouchmoveBound);

        this.el.addEventListener('mouseup', this._handleRangeMouseupTouchendBound);
        this.el.addEventListener('touchend', this._handleRangeMouseupTouchendBound);

        this.el.addEventListener('blur', this._handleRangeBlurMouseoutTouchleaveBound);
        this.el.addEventListener('mouseout', this._handleRangeBlurMouseoutTouchleaveBound);
        this.el.addEventListener('touchleave', this._handleRangeBlurMouseoutTouchleaveBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('change', this._handleRangeChangeBound);
        this.el.removeEventListener('focus', this._handleRangeFocusBound);

        this.el.removeEventListener('mousedown', this._handleRangeMousedownTouchstartBound);
        this.el.removeEventListener('touchstart', this._handleRangeMousedownTouchstartBound);

        this.el.removeEventListener('input', this._handleRangeInputMousemoveTouchmoveBound);
        this.el.removeEventListener('mousemove', this._handleRangeInputMousemoveTouchmoveBound);
        this.el.removeEventListener('touchmove', this._handleRangeInputMousemoveTouchmoveBound);

        this.el.removeEventListener('mouseup', this._handleRangeMouseupTouchendBound);
        this.el.removeEventListener('touchend', this._handleRangeMouseupTouchendBound);

        this.el.removeEventListener('blur', this._handleRangeBlurMouseoutTouchleaveBound);
        this.el.removeEventListener('mouseout', this._handleRangeBlurMouseoutTouchleaveBound);
        this.el.removeEventListener('touchleave', this._handleRangeBlurMouseoutTouchleaveBound);
      }

      /**
       * Handle Range Change
       * @param {Event} e
       */

    }, {
      key: "_handleRangeChange",
      value: function _handleRangeChange() {
        $(this.value).html(this.$el.val());

        if (!$(this.thumb).hasClass('active')) {
          this._showRangeBubble();
        }

        var offsetLeft = this._calcRangeOffset();
        $(this.thumb).addClass('active').css('left', offsetLeft + 'px');
      }

      /**
       * Handle Range Focus
       * @param {Event} e
       */

    }, {
      key: "_handleRangeFocus",
      value: function _handleRangeFocus() {
        if (M.tabPressed) {
          this.$el.addClass('focused');
        }
      }

      /**
       * Handle Range Mousedown and Touchstart
       * @param {Event} e
       */

    }, {
      key: "_handleRangeMousedownTouchstart",
      value: function _handleRangeMousedownTouchstart(e) {
        // Set indicator value
        $(this.value).html(this.$el.val());

        this._mousedown = true;
        this.$el.addClass('active');

        if (!$(this.thumb).hasClass('active')) {
          this._showRangeBubble();
        }

        if (e.type !== 'input') {
          var offsetLeft = this._calcRangeOffset();
          $(this.thumb).addClass('active').css('left', offsetLeft + 'px');
        }
      }

      /**
       * Handle Range Input, Mousemove and Touchmove
       */

    }, {
      key: "_handleRangeInputMousemoveTouchmove",
      value: function _handleRangeInputMousemoveTouchmove() {
        if (this._mousedown) {
          if (!$(this.thumb).hasClass('active')) {
            this._showRangeBubble();
          }

          var offsetLeft = this._calcRangeOffset();
          $(this.thumb).addClass('active').css('left', offsetLeft + 'px');
          $(this.value).html(this.$el.val());
        }
      }

      /**
       * Handle Range Mouseup and Touchend
       */

    }, {
      key: "_handleRangeMouseupTouchend",
      value: function _handleRangeMouseupTouchend() {
        this._mousedown = false;
        this.$el.removeClass('active');
      }

      /**
       * Handle Range Blur, Mouseout and Touchleave
       */

    }, {
      key: "_handleRangeBlurMouseoutTouchleave",
      value: function _handleRangeBlurMouseoutTouchleave() {
        if (!this._mousedown) {
          this.$el.removeClass('focused');
          var paddingLeft = parseInt(this.$el.css('padding-left'));
          var marginLeft = 7 + paddingLeft + 'px';

          if ($(this.thumb).hasClass('active')) {
            anim.remove(this.thumb);
            anim({
              targets: this.thumb,
              height: 0,
              width: 0,
              top: 10,
              easing: 'easeOutQuad',
              marginLeft: marginLeft,
              duration: 100
            });
          }
          $(this.thumb).removeClass('active');
        }
      }

      /**
       * Setup dropdown
       */

    }, {
      key: "_setupThumb",
      value: function _setupThumb() {
        this.thumb = document.createElement('span');
        this.value = document.createElement('span');
        $(this.thumb).addClass('thumb');
        $(this.value).addClass('value');
        $(this.thumb).append(this.value);
        this.$el.after(this.thumb);
      }

      /**
       * Remove dropdown
       */

    }, {
      key: "_removeThumb",
      value: function _removeThumb() {
        $(this.thumb).remove();
      }

      /**
       * morph thumb into bubble
       */

    }, {
      key: "_showRangeBubble",
      value: function _showRangeBubble() {
        var paddingLeft = parseInt($(this.thumb).parent().css('padding-left'));
        var marginLeft = -7 + paddingLeft + 'px'; // TODO: fix magic number?
        anim.remove(this.thumb);
        anim({
          targets: this.thumb,
          height: 30,
          width: 30,
          top: -30,
          marginLeft: marginLeft,
          duration: 300,
          easing: 'easeOutQuint'
        });
      }

      /**
       * Calculate the offset of the thumb
       * @return {Number}  offset in pixels
       */

    }, {
      key: "_calcRangeOffset",
      value: function _calcRangeOffset() {
        var width = this.$el.width() - 15;
        var max = parseFloat(this.$el.attr('max'));
        var min = parseFloat(this.$el.attr('min'));
        var percent = (parseFloat(this.$el.val()) - min) / (max - min);
        return percent * width;
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Range.__proto__ || Object.getPrototypeOf(Range), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Range;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Range;
  }(Component);

  M.Range = Range;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Range, 'range', 'M_Range');
  }

  Range.init($('input[type=range]'));
})(cash, M.anime);
/*!
 * Materialize v1.0.0-beta (http://materializecss.com)
 * Copyright 2014-2017 Materialize
 * MIT License (https://raw.githubusercontent.com/Dogfalo/materialize/master/LICENSE)
 */

function _possibleConstructorReturn(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function _inherits(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var _get=function t(e,i,n){null===e&&(e=Function.prototype);var s=Object.getOwnPropertyDescriptor(e,i);if(void 0===s){var o=Object.getPrototypeOf(e);return null===o?void 0:t(o,i,n)}if("value"in s)return s.value;var a=s.get;if(void 0!==a)return a.call(n)},_createClass=function(){function t(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,i,n){return i&&t(e.prototype,i),n&&t(e,n),e}}();!function(t){window.cash=t()}(function(){function t(t,e){return e=e||O,H.test(t)?e.getElementsByClassName(t.slice(1)):W.test(t)?e.getElementsByTagName(t):e.querySelectorAll(t)}function e(t){if(!x){var e=(x=O.implementation.createHTMLDocument(null)).createElement("base");e.href=O.location.href,x.head.appendChild(e)}return x.body.innerHTML=t,x.body.childNodes}function i(t){"loading"!==O.readyState?t():O.addEventListener("DOMContentLoaded",t)}function n(n,s){if(!n)return this;if(n.cash&&n!==T)return n;var o,a=n,r=0;if(A(n))a=R.test(n)?O.getElementById(n.slice(1)):P.test(n)?e(n):t(n,s);else if(I(n))return i(n),this;if(!a)return this;if(a.nodeType||a===T)this[0]=a,this.length=1;else for(o=this.length=a.length;r<o;r++)this[r]=a[r];return this}function s(t,e){return new n(t,e)}function o(t,e){for(var i=t.length,n=0;n<i&&!1!==e.call(t[n],t[n],n,t);n++);}function a(t,e){var i=t&&(t.matches||t.webkitMatchesSelector||t.mozMatchesSelector||t.msMatchesSelector||t.oMatchesSelector);return!!i&&i.call(t,e)}function r(t){return A(t)?a:t.cash?function(e){return t.is(e)}:function(t,e){return t===e}}function l(t){return s($.call(t).filter(function(t,e,i){return i.indexOf(t)===e}))}function h(t){return t[F]=t[F]||{}}function d(t,e,i){return h(t)[e]=i}function u(t,e){var i=h(t);return void 0===i[e]&&(i[e]=t.dataset?t.dataset[e]:s(t).attr("data-"+e)),i[e]}function c(t,e){var i=h(t);i?delete i[e]:t.dataset?delete t.dataset[e]:s(t).removeAttr("data-"+name)}function p(t){return A(t)&&t.match(q)}function v(t,e){return t.classList?t.classList.contains(e):new RegExp("(^| )"+e+"( |$)","gi").test(t.className)}function f(t,e,i){t.classList?t.classList.add(e):i.indexOf(" "+e+" ")&&(t.className+=" "+e)}function m(t,e){t.classList?t.classList.remove(e):t.className=t.className.replace(e,"")}function g(t,e){return parseInt(T.getComputedStyle(t[0],null)[e],10)||0}function _(t,e,i){var n=u(t,"_cashEvents")||d(t,"_cashEvents",{});n[e]=n[e]||[],n[e].push(i),t.addEventListener(e,i)}function y(t,e,i){var n,s=u(t,"_cashEvents"),a=s&&s[e];a&&(i?(t.removeEventListener(e,i),(n=a.indexOf(i))>=0&&a.splice(n,1)):(o(a,function(i){t.removeEventListener(e,i)}),a=[]))}function k(t,e){return"&"+encodeURIComponent(t)+"="+encodeURIComponent(e).replace(/%20/g,"+")}function b(t){var e=[];return o(t.options,function(t){t.selected&&e.push(t.value)}),e.length?e:null}function w(t){var e=t.selectedIndex;return e>=0?t.options[e].value:null}function C(t){var e=t.type;if(!e)return null;switch(e.toLowerCase()){case"select-one":return w(t);case"select-multiple":return b(t);case"radio":case"checkbox":return t.checked?t.value:null;default:return t.value?t.value:null}}function E(t,e,i){if(i){var n=t.childNodes[0];t.insertBefore(e,n)}else t.appendChild(e)}function M(t,e,i){var n=A(e);n||!e.length?o(t,n?function(t){return t.insertAdjacentHTML(i?"afterbegin":"beforeend",e)}:function(t,n){return E(t,0===n?e:e.cloneNode(!0),i)}):o(e,function(e){return M(t,e,i)})}var x,O=document,T=window,L=Array.prototype,$=L.slice,B=L.filter,D=L.push,S=function(){},I=function(t){return typeof t==typeof S&&t.call},A=function(t){return"string"==typeof t},R=/^#[\w-]*$/,H=/^\.[\w-]*$/,P=/<.+>/,W=/^\w+$/,j=s.fn=s.prototype=n.prototype={cash:!0,length:0,push:D,splice:L.splice,map:L.map,init:n};Object.defineProperty(j,"constructor",{value:s}),s.parseHTML=e,s.noop=S,s.isFunction=I,s.isString=A,s.extend=j.extend=function(t){t=t||{};var e=$.call(arguments),i=e.length,n=1;for(1===e.length&&(t=this,n=0);n<i;n++)if(e[n])for(var s in e[n])e[n].hasOwnProperty(s)&&(t[s]=e[n][s]);return t},s.extend({merge:function(t,e){for(var i=+e.length,n=t.length,s=0;s<i;n++,s++)t[n]=e[s];return t.length=n,t},each:o,matches:a,unique:l,isArray:Array.isArray,isNumeric:function(t){return!isNaN(parseFloat(t))&&isFinite(t)}});var F=s.uid="_cash"+Date.now();j.extend({data:function(t,e){if(A(t))return void 0===e?u(this[0],t):this.each(function(i){return d(i,t,e)});for(var i in t)this.data(i,t[i]);return this},removeData:function(t){return this.each(function(e){return c(e,t)})}});var q=/\S+/g;j.extend({addClass:function(t){var e=p(t);return e?this.each(function(t){var i=" "+t.className+" ";o(e,function(e){f(t,e,i)})}):this},attr:function(t,e){if(t){if(A(t))return void 0===e?this[0]?this[0].getAttribute?this[0].getAttribute(t):this[0][t]:void 0:this.each(function(i){i.setAttribute?i.setAttribute(t,e):i[t]=e});for(var i in t)this.attr(i,t[i]);return this}},hasClass:function(t){var e=!1,i=p(t);return i&&i.length&&this.each(function(t){return!(e=v(t,i[0]))}),e},prop:function(t,e){if(A(t))return void 0===e?this[0][t]:this.each(function(i){i[t]=e});for(var i in t)this.prop(i,t[i]);return this},removeAttr:function(t){return this.each(function(e){e.removeAttribute?e.removeAttribute(t):delete e[t]})},removeClass:function(t){if(!arguments.length)return this.attr("class","");var e=p(t);return e?this.each(function(t){o(e,function(e){m(t,e)})}):this},removeProp:function(t){return this.each(function(e){delete e[t]})},toggleClass:function(t,e){if(void 0!==e)return this[e?"addClass":"removeClass"](t);var i=p(t);return i?this.each(function(t){var e=" "+t.className+" ";o(i,function(i){v(t,i)?m(t,i):f(t,i,e)})}):this}}),j.extend({add:function(t,e){return l(s.merge(this,s(t,e)))},each:function(t){return o(this,t),this},eq:function(t){return s(this.get(t))},filter:function(t){if(!t)return this;var e=I(t)?t:r(t);return s(B.call(this,function(i){return e(i,t)}))},first:function(){return this.eq(0)},get:function(t){return void 0===t?$.call(this):t<0?this[t+this.length]:this[t]},index:function(t){var e=t?s(t)[0]:this[0],i=t?this:s(e).parent().children();return $.call(i).indexOf(e)},last:function(){return this.eq(-1)}});var z=function(){var t=/(?:^\w|[A-Z]|\b\w)/g,e=/[\s-_]+/g;return function(i){return i.replace(t,function(t,e){return t[0===e?"toLowerCase":"toUpperCase"]()}).replace(e,"")}}(),N=function(){var t={},e=document.createElement("div").style;return function(i){if(i=z(i),t[i])return t[i];var n=i.charAt(0).toUpperCase()+i.slice(1);return o((i+" "+["webkit","moz","ms","o"].join(n+" ")+n).split(" "),function(n){if(n in e)return t[n]=i=t[i]=n,!1}),t[i]}}();s.prefixedProp=N,s.camelCase=z,j.extend({css:function(t,e){if(A(t))return t=N(t),arguments.length>1?this.each(function(i){return i.style[t]=e}):T.getComputedStyle(this[0])[t];for(var i in t)this.css(i,t[i]);return this}}),o(["Width","Height"],function(t){var e=t.toLowerCase();j[e]=function(){return this[0].getBoundingClientRect()[e]},j["inner"+t]=function(){return this[0]["client"+t]},j["outer"+t]=function(e){return this[0]["offset"+t]+(e?g(this,"margin"+("Width"===t?"Left":"Top"))+g(this,"margin"+("Width"===t?"Right":"Bottom")):0)}}),j.extend({off:function(t,e){return this.each(function(i){return y(i,t,e)})},on:function(t,e,n,s){var o;if(!A(t)){for(var r in t)this.on(r,e,t[r]);return this}return I(e)&&(n=e,e=null),"ready"===t?(i(n),this):(e&&(o=n,n=function(t){for(var i=t.target;!a(i,e);){if(i===this||null===i)return i=!1;i=i.parentNode}i&&o.call(i,t)}),this.each(function(e){var i=n;s&&(i=function(){n.apply(this,arguments),y(e,t,i)}),_(e,t,i)}))},one:function(t,e,i){return this.on(t,e,i,!0)},ready:i,trigger:function(t,e){if(document.createEvent){var i=document.createEvent("HTMLEvents");return i.initEvent(t,!0,!1),i=this.extend(i,e),this.each(function(t){return t.dispatchEvent(i)})}}}),j.extend({serialize:function(){var t="";return o(this[0].elements||this,function(e){if(!e.disabled&&"FIELDSET"!==e.tagName){var i=e.name;switch(e.type.toLowerCase()){case"file":case"reset":case"submit":case"button":break;case"select-multiple":var n=C(e);null!==n&&o(n,function(e){t+=k(i,e)});break;default:var s=C(e);null!==s&&(t+=k(i,s))}}}),t.substr(1)},val:function(t){return void 0===t?C(this[0]):this.each(function(e){return e.value=t})}}),j.extend({after:function(t){return s(t).insertAfter(this),this},append:function(t){return M(this,t),this},appendTo:function(t){return M(s(t),this),this},before:function(t){return s(t).insertBefore(this),this},clone:function(){return s(this.map(function(t){return t.cloneNode(!0)}))},empty:function(){return this.html(""),this},html:function(t){if(void 0===t)return this[0].innerHTML;var e=t.nodeType?t[0].outerHTML:t;return this.each(function(t){return t.innerHTML=e})},insertAfter:function(t){var e=this;return s(t).each(function(t,i){var n=t.parentNode,s=t.nextSibling;e.each(function(t){n.insertBefore(0===i?t:t.cloneNode(!0),s)})}),this},insertBefore:function(t){var e=this;return s(t).each(function(t,i){var n=t.parentNode;e.each(function(e){n.insertBefore(0===i?e:e.cloneNode(!0),t)})}),this},prepend:function(t){return M(this,t,!0),this},prependTo:function(t){return M(s(t),this,!0),this},remove:function(){return this.each(function(t){if(t.parentNode)return t.parentNode.removeChild(t)})},text:function(t){return void 0===t?this[0].textContent:this.each(function(e){return e.textContent=t})}});var V=O.documentElement;return j.extend({position:function(){var t=this[0];return{left:t.offsetLeft,top:t.offsetTop}},offset:function(){var t=this[0].getBoundingClientRect();return{top:t.top+T.pageYOffset-V.clientTop,left:t.left+T.pageXOffset-V.clientLeft}},offsetParent:function(){return s(this[0].offsetParent)}}),j.extend({children:function(t){var e=[];return this.each(function(t){D.apply(e,t.children)}),e=l(e),t?e.filter(function(e){return a(e,t)}):e},closest:function(t){return!t||this.length<1?s():this.is(t)?this.filter(t):this.parent().closest(t)},is:function(t){if(!t)return!1;var e=!1,i=r(t);return this.each(function(n){return!(e=i(n,t))}),e},find:function(e){if(!e||e.nodeType)return s(e&&this.has(e).length?e:null);var i=[];return this.each(function(n){D.apply(i,t(e,n))}),l(i)},has:function(e){var i=A(e)?function(i){return 0!==t(e,i).length}:function(t){return t.contains(e)};return this.filter(i)},next:function(){return s(this[0].nextElementSibling)},not:function(t){if(!t)return this;var e=r(t);return this.filter(function(i){return!e(i,t)})},parent:function(){var t=[];return this.each(function(e){e&&e.parentNode&&t.push(e.parentNode)}),l(t)},parents:function(t){var e,i=[];return this.each(function(n){for(e=n;e&&e.parentNode&&e!==O.body.parentNode;)e=e.parentNode,(!t||t&&a(e,t))&&i.push(e)}),l(i)},prev:function(){return s(this[0].previousElementSibling)},siblings:function(t){var e=this.parent().children(t),i=this[0];return e.filter(function(t){return t!==i})}}),s});var Component=function(){function t(e,i,n){_classCallCheck(this,t),i instanceof Element||console.error(Error(i+" is not an HTML Element"));var s=e.getInstance(i);s&&s.destroy(),this.el=i,this.$el=cash(i)}return _createClass(t,null,[{key:"init",value:function(t,e,i){var n=null;if(e instanceof Element)n=new t(e,i);else if(e&&(e.jquery||e.cash||e instanceof NodeList)){for(var s=[],o=0;o<e.length;o++)s.push(new t(e[o],i));n=s}return n}}]),t}();!function(t){t.Package?M={}:t.M={},M.jQueryLoaded=!!t.jQuery}(window),"function"==typeof define&&define.amd?define("M",[],function(){return M}):"undefined"==typeof exports||exports.nodeType||("undefined"!=typeof module&&!module.nodeType&&module.exports&&(exports=module.exports=M),exports.default=M),M.keys={TAB:9,ENTER:13,ESC:27,ARROW_UP:38,ARROW_DOWN:40},M.tabPressed=!1;var docHandleKeydown=function(t){t.which===M.keys.TAB&&(M.tabPressed=!0)},docHandleKeyup=function(t){t.which===M.keys.TAB&&(M.tabPressed=!1)};document.addEventListener("keydown",docHandleKeydown),document.addEventListener("keyup",docHandleKeyup),M.initializeJqueryWrapper=function(t,e,i){jQuery.fn[e]=function(n){if(t.prototype[n]){var s=Array.prototype.slice.call(arguments,1);if("get"===n.slice(0,3)){var o=this.first()[0][i];return o[n].apply(o,s)}return this.each(function(){var t=this[i];t[n].apply(t,s)})}if("object"==typeof n||!n)return t.init(this,arguments[0]),this;jQuery.error("Method "+n+" does not exist on jQuery."+e)}},M.AutoInit=function(t){var e=t||document.body,i={Autocomplete:e.querySelectorAll(".autocomplete:not(.no-autoinit)"),Carousel:e.querySelectorAll(".carousel:not(.no-autoinit)"),Chips:e.querySelectorAll(".chips:not(.no-autoinit)"),Collapsible:e.querySelectorAll(".collapsible:not(.no-autoinit)"),Datepicker:e.querySelectorAll(".datepicker:not(.no-autoinit)"),Dropdown:e.querySelectorAll(".dropdown-trigger:not(.no-autoinit)"),Materialbox:e.querySelectorAll(".materialboxed:not(.no-autoinit)"),Modal:e.querySelectorAll(".modal:not(.no-autoinit)"),Parallax:e.querySelectorAll(".parallax:not(.no-autoinit)"),Pushpin:e.querySelectorAll(".pushpin:not(.no-autoinit)"),ScrollSpy:e.querySelectorAll(".scrollspy:not(.no-autoinit)"),FormSelect:e.querySelectorAll("select:not(.no-autoinit)"),Sidenav:e.querySelectorAll(".sidenav:not(.no-autoinit)"),Tabs:e.querySelectorAll(".tabs:not(.no-autoinit)"),TapTarget:e.querySelectorAll(".tap-target:not(.no-autoinit)"),Timepicker:e.querySelectorAll(".timepicker:not(.no-autoinit)"),Tooltip:e.querySelectorAll(".tooltipped:not(.no-autoinit)"),FloatingActionButton:e.querySelectorAll(".fixed-action-btn:not(.no-autoinit)")};for(var n in i)M[n].init(i[n])},M.objectSelectorString=function(t){return((t.prop("tagName")||"")+(t.attr("id")||"")+(t.attr("class")||"")).replace(/\s/g,"")},M.guid=function(){function t(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return function(){return t()+t()+"-"+t()+"-"+t()+"-"+t()+"-"+t()+t()+t()}}(),M.escapeHash=function(t){return t.replace(/(:|\.|\[|\]|,|=|\/)/g,"\\$1")},M.elementOrParentIsFixed=function(t){var e=$(t),i=!1;return e.add(e.parents()).each(function(){if("fixed"===$(this).css("position"))return i=!0,!1}),i},M.checkWithinContainer=function(t,e,i){var n={top:!1,right:!1,bottom:!1,left:!1},s=t.getBoundingClientRect(),o=t.scrollLeft,a=t.scrollTop,r=e.left-o,l=e.top-a;return(r<s.left+i||r<i)&&(n.left=!0),(r+e.width>s.right-i||r+e.width>window.innerWidth-i)&&(n.right=!0),(l<s.top+i||l<i)&&(n.top=!0),(l+e.height>s.bottom-i||l+e.height>window.innerHeight-i)&&(n.bottom=!0),n},M.checkPossibleAlignments=function(t,e,i,n){var s={top:!0,right:!0,bottom:!0,left:!0,spaceOnTop:null,spaceOnRight:null,spaceOnBottom:null,spaceOnLeft:null},o="visible"===getComputedStyle(e).overflow,a=e.getBoundingClientRect(),r=Math.min(a.height,window.innerHeight),l=Math.min(a.width,window.innerWidth),h=t.getBoundingClientRect(),d=e.scrollLeft,u=e.scrollTop,c=i.left-d,p=i.top-u,v=i.top+h.height-u;return s.spaceOnRight=o?window.innerWidth-(h.left+i.width):l-(c+i.width),s.spaceOnRight<0&&(s.left=!1),s.spaceOnLeft=o?h.right-i.width:c-i.width+h.width,s.spaceOnLeft<0&&(s.right=!1),s.spaceOnBottom=o?window.innerHeight-(h.top+i.height+n):r-(p+i.height+n),s.spaceOnBottom<0&&(s.top=!1),s.spaceOnTop=o?h.bottom-(i.height+n):v-(i.height-n),s.spaceOnTop<0&&(s.bottom=!1),s},M.getOverflowParent=function(t){return null==t?null:t===document.body||"visible"!==getComputedStyle(t).overflow?t:M.getOverflowParent(t.parentElement)},M.getIdFromTrigger=function(t){var e=t.getAttribute("data-target");return e||(e=(e=t.getAttribute("href"))?e.slice(1):""),e},M.getDocumentScrollTop=function(){return window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop||0},M.getDocumentScrollLeft=function(){return window.pageXOffset||document.documentElement.scrollLeft||document.body.scrollLeft||0};var getTime=Date.now||function(){return(new Date).getTime()};M.throttle=function(t,e,i){var n=void 0,s=void 0,o=void 0,a=null,r=0;i||(i={});var l=function(){r=!1===i.leading?0:getTime(),a=null,o=t.apply(n,s),n=s=null};return function(){var h=getTime();r||!1!==i.leading||(r=h);var d=e-(h-r);return n=this,s=arguments,d<=0?(clearTimeout(a),a=null,r=h,o=t.apply(n,s),n=s=null):a||!1===i.trailing||(a=setTimeout(l,d)),o}};var $jscomp={scope:{}};$jscomp.defineProperty="function"==typeof Object.defineProperties?Object.defineProperty:function(t,e,i){if(i.get||i.set)throw new TypeError("ES3 does not support getters and setters.");t!=Array.prototype&&t!=Object.prototype&&(t[e]=i.value)},$jscomp.getGlobal=function(t){return"undefined"!=typeof window&&window===t?t:"undefined"!=typeof global&&null!=global?global:t},$jscomp.global=$jscomp.getGlobal(this),$jscomp.SYMBOL_PREFIX="jscomp_symbol_",$jscomp.initSymbol=function(){$jscomp.initSymbol=function(){},$jscomp.global.Symbol||($jscomp.global.Symbol=$jscomp.Symbol)},$jscomp.symbolCounter_=0,$jscomp.Symbol=function(t){return $jscomp.SYMBOL_PREFIX+(t||"")+$jscomp.symbolCounter_++},$jscomp.initSymbolIterator=function(){$jscomp.initSymbol();var t=$jscomp.global.Symbol.iterator;t||(t=$jscomp.global.Symbol.iterator=$jscomp.global.Symbol("iterator")),"function"!=typeof Array.prototype[t]&&$jscomp.defineProperty(Array.prototype,t,{configurable:!0,writable:!0,value:function(){return $jscomp.arrayIterator(this)}}),$jscomp.initSymbolIterator=function(){}},$jscomp.arrayIterator=function(t){var e=0;return $jscomp.iteratorPrototype(function(){return e<t.length?{done:!1,value:t[e++]}:{done:!0}})},$jscomp.iteratorPrototype=function(t){return $jscomp.initSymbolIterator(),t={next:t},t[$jscomp.global.Symbol.iterator]=function(){return this},t},$jscomp.array=$jscomp.array||{},$jscomp.iteratorFromArray=function(t,e){$jscomp.initSymbolIterator(),t instanceof String&&(t+="");var i=0,n={next:function(){if(i<t.length){var s=i++;return{value:e(s,t[s]),done:!1}}return n.next=function(){return{done:!0,value:void 0}},n.next()}};return n[Symbol.iterator]=function(){return n},n},$jscomp.polyfill=function(t,e,i,n){if(e){for(i=$jscomp.global,t=t.split("."),n=0;n<t.length-1;n++){var s=t[n];s in i||(i[s]={}),i=i[s]}(e=e(n=i[t=t[t.length-1]]))!=n&&null!=e&&$jscomp.defineProperty(i,t,{configurable:!0,writable:!0,value:e})}},$jscomp.polyfill("Array.prototype.keys",function(t){return t||function(){return $jscomp.iteratorFromArray(this,function(t){return t})}},"es6-impl","es3");var $jscomp$this=this;!function(t){M.anime=t()}(function(){function t(t){if(!H.col(t))try{return document.querySelectorAll(t)}catch(t){}}function e(t,e){for(var i=t.length,n=2<=arguments.length?arguments[1]:void 0,s=[],o=0;o<i;o++)if(o in t){var a=t[o];e.call(n,a,o,t)&&s.push(a)}return s}function i(t){return t.reduce(function(t,e){return t.concat(H.arr(e)?i(e):e)},[])}function n(e){return H.arr(e)?e:(H.str(e)&&(e=t(e)||e),e instanceof NodeList||e instanceof HTMLCollection?[].slice.call(e):[e])}function s(t,e){return t.some(function(t){return t===e})}function o(t){var e,i={};for(e in t)i[e]=t[e];return i}function a(t,e){var i,n=o(t);for(i in t)n[i]=e.hasOwnProperty(i)?e[i]:t[i];return n}function r(t,e){var i,n=o(t);for(i in e)n[i]=H.und(t[i])?e[i]:t[i];return n}function l(t){t=t.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,function(t,e,i,n){return e+e+i+i+n+n});var e=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return"rgba("+(t=parseInt(e[1],16))+","+parseInt(e[2],16)+","+(e=parseInt(e[3],16))+",1)"}function h(t){function e(t,e,i){return 0>i&&(i+=1),1<i&&--i,i<1/6?t+6*(e-t)*i:.5>i?e:i<2/3?t+(e-t)*(2/3-i)*6:t}s=/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(t)||/hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(t);t=parseInt(s[1])/360;var i=parseInt(s[2])/100,n=parseInt(s[3])/100,s=s[4]||1;if(0==i)n=i=t=n;else{var o=.5>n?n*(1+i):n+i-n*i,a=2*n-o,n=e(a,o,t+1/3),i=e(a,o,t);t=e(a,o,t-1/3)}return"rgba("+255*n+","+255*i+","+255*t+","+s+")"}function d(t){if(t=/([\+\-]?[0-9#\.]+)(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(t))return t[2]}function u(t){return-1<t.indexOf("translate")||"perspective"===t?"px":-1<t.indexOf("rotate")||-1<t.indexOf("skew")?"deg":void 0}function c(t,e){return H.fnc(t)?t(e.target,e.id,e.total):t}function p(t,e){if(e in t.style)return getComputedStyle(t).getPropertyValue(e.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase())||"0"}function v(t,e){return H.dom(t)&&s(R,e)?"transform":H.dom(t)&&(t.getAttribute(e)||H.svg(t)&&t[e])?"attribute":H.dom(t)&&"transform"!==e&&p(t,e)?"css":null!=t[e]?"object":void 0}function f(t,i){var n=u(i),n=-1<i.indexOf("scale")?1:0+n;if(!(t=t.style.transform))return n;for(var s=[],o=[],a=[],r=/(\w+)\((.+?)\)/g;s=r.exec(t);)o.push(s[1]),a.push(s[2]);return(t=e(a,function(t,e){return o[e]===i})).length?t[0]:n}function m(t,e){switch(v(t,e)){case"transform":return f(t,e);case"css":return p(t,e);case"attribute":return t.getAttribute(e)}return t[e]||0}function g(t,e){var i=/^(\*=|\+=|-=)/.exec(t);if(!i)return t;var n=d(t)||0;switch(e=parseFloat(e),t=parseFloat(t.replace(i[0],"")),i[0][0]){case"+":return e+t+n;case"-":return e-t+n;case"*":return e*t+n}}function _(t,e){return Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))}function y(t){t=t.points;for(var e,i=0,n=0;n<t.numberOfItems;n++){var s=t.getItem(n);0<n&&(i+=_(e,s)),e=s}return i}function k(t){if(t.getTotalLength)return t.getTotalLength();switch(t.tagName.toLowerCase()){case"circle":return 2*Math.PI*t.getAttribute("r");case"rect":return 2*t.getAttribute("width")+2*t.getAttribute("height");case"line":return _({x:t.getAttribute("x1"),y:t.getAttribute("y1")},{x:t.getAttribute("x2"),y:t.getAttribute("y2")});case"polyline":return y(t);case"polygon":var e=t.points;return y(t)+_(e.getItem(e.numberOfItems-1),e.getItem(0))}}function b(t,e){function i(i){return i=void 0===i?0:i,t.el.getPointAtLength(1<=e+i?e+i:0)}var n=i(),s=i(-1),o=i(1);switch(t.property){case"x":return n.x;case"y":return n.y;case"angle":return 180*Math.atan2(o.y-s.y,o.x-s.x)/Math.PI}}function w(t,e){var i,n=/-?\d*\.?\d+/g;if(i=H.pth(t)?t.totalLength:t,H.col(i))if(H.rgb(i)){var s=/rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(i);i=s?"rgba("+s[1]+",1)":i}else i=H.hex(i)?l(i):H.hsl(i)?h(i):void 0;else s=(s=d(i))?i.substr(0,i.length-s.length):i,i=e&&!/\s/g.test(i)?s+e:s;return i+="",{original:i,numbers:i.match(n)?i.match(n).map(Number):[0],strings:H.str(t)||e?i.split(n):[]}}function C(t){return t=t?i(H.arr(t)?t.map(n):n(t)):[],e(t,function(t,e,i){return i.indexOf(t)===e})}function E(t){var e=C(t);return e.map(function(t,i){return{target:t,id:i,total:e.length}})}function M(t,e){var i=o(e);if(H.arr(t)){var s=t.length;2!==s||H.obj(t[0])?H.fnc(e.duration)||(i.duration=e.duration/s):t={value:t}}return n(t).map(function(t,i){return i=i?0:e.delay,t=H.obj(t)&&!H.pth(t)?t:{value:t},H.und(t.delay)&&(t.delay=i),t}).map(function(t){return r(t,i)})}function x(t,e){var i,n={};for(i in t){var s=c(t[i],e);H.arr(s)&&1===(s=s.map(function(t){return c(t,e)})).length&&(s=s[0]),n[i]=s}return n.duration=parseFloat(n.duration),n.delay=parseFloat(n.delay),n}function O(t){return H.arr(t)?P.apply(this,t):W[t]}function T(t,e){var i;return t.tweens.map(function(n){var s=(n=x(n,e)).value,o=m(e.target,t.name),a=i?i.to.original:o,a=H.arr(s)?s[0]:a,r=g(H.arr(s)?s[1]:s,a),o=d(r)||d(a)||d(o);return n.from=w(a,o),n.to=w(r,o),n.start=i?i.end:t.offset,n.end=n.start+n.delay+n.duration,n.easing=O(n.easing),n.elasticity=(1e3-Math.min(Math.max(n.elasticity,1),999))/1e3,n.isPath=H.pth(s),n.isColor=H.col(n.from.original),n.isColor&&(n.round=1),i=n})}function L(t,n){return e(i(t.map(function(t){return n.map(function(e){var i=v(t.target,e.name);if(i){var n=T(e,t);e={type:i,property:e.name,animatable:t,tweens:n,duration:n[n.length-1].end,delay:n[0].delay}}else e=void 0;return e})})),function(t){return!H.und(t)})}function $(t,e,i,n){var s="delay"===t;return e.length?(s?Math.min:Math.max).apply(Math,e.map(function(e){return e[t]})):s?n.delay:i.offset+n.delay+n.duration}function B(t){var e,i=a(I,t),n=a(A,t),s=E(t.targets),o=[],l=r(i,n);for(e in t)l.hasOwnProperty(e)||"targets"===e||o.push({name:e,offset:l.offset,tweens:M(t[e],n)});return t=L(s,o),r(i,{children:[],animatables:s,animations:t,duration:$("duration",t,i,n),delay:$("delay",t,i,n)})}function D(t){function i(){return window.Promise&&new Promise(function(t){return u=t})}function n(t){return v.reversed?v.duration-t:t}function s(t){for(var i=0,n={},s=v.animations,o=s.length;i<o;){var a=s[i],r=a.animatable,l=(h=a.tweens)[c=h.length-1];c&&(l=e(h,function(e){return t<e.end})[0]||l);for(var h=Math.min(Math.max(t-l.start-l.delay,0),l.duration)/l.duration,d=isNaN(h)?1:l.easing(h,l.elasticity),h=l.to.strings,u=l.round,c=[],f=void 0,f=l.to.numbers.length,m=0;m<f;m++){var g=void 0,g=l.to.numbers[m],_=l.from.numbers[m],g=l.isPath?b(l.value,d*g):_+d*(g-_);u&&(l.isColor&&2<m||(g=Math.round(g*u)/u)),c.push(g)}if(l=h.length)for(f=h[0],d=0;d<l;d++)u=h[d+1],m=c[d],isNaN(m)||(f=u?f+(m+u):f+(m+" "));else f=c[0];j[a.type](r.target,a.property,f,n,r.id),a.currentValue=f,i++}if(i=Object.keys(n).length)for(s=0;s<i;s++)S||(S=p(document.body,"transform")?"transform":"-webkit-transform"),v.animatables[s].target.style[S]=n[s].join(" ");v.currentTime=t,v.progress=t/v.duration*100}function o(t){v[t]&&v[t](v)}function a(){v.remaining&&!0!==v.remaining&&v.remaining--}function r(t){var e=v.duration,r=v.offset,p=r+v.delay,f=v.currentTime,m=v.reversed,g=n(t);if(v.children.length){var _=v.children,y=_.length;if(g>=v.currentTime)for(var k=0;k<y;k++)_[k].seek(g);else for(;y--;)_[y].seek(g)}(g>=p||!e)&&(v.began||(v.began=!0,o("begin")),o("run")),g>r&&g<e?s(g):(g<=r&&0!==f&&(s(0),m&&a()),(g>=e&&f!==e||!e)&&(s(e),m||a())),o("update"),t>=e&&(v.remaining?(h=l,"alternate"===v.direction&&(v.reversed=!v.reversed)):(v.pause(),v.completed||(v.completed=!0,o("complete"),"Promise"in window&&(u(),c=i()))),d=0)}t=void 0===t?{}:t;var l,h,d=0,u=null,c=i(),v=B(t);return v.reset=function(){var t=v.direction,e=v.loop;for(v.currentTime=0,v.progress=0,v.paused=!0,v.began=!1,v.completed=!1,v.reversed="reverse"===t,v.remaining="alternate"===t&&1===e?2:e,s(0),t=v.children.length;t--;)v.children[t].reset()},v.tick=function(t){l=t,h||(h=l),r((d+l-h)*D.speed)},v.seek=function(t){r(n(t))},v.pause=function(){var t=F.indexOf(v);-1<t&&F.splice(t,1),v.paused=!0},v.play=function(){v.paused&&(v.paused=!1,h=0,d=n(v.currentTime),F.push(v),q||z())},v.reverse=function(){v.reversed=!v.reversed,h=0,d=n(v.currentTime)},v.restart=function(){v.pause(),v.reset(),v.play()},v.finished=c,v.reset(),v.autoplay&&v.play(),v}var S,I={update:void 0,begin:void 0,run:void 0,complete:void 0,loop:1,direction:"normal",autoplay:!0,offset:0},A={duration:1e3,delay:0,easing:"easeOutElastic",elasticity:500,round:0},R="translateX translateY translateZ rotate rotateX rotateY rotateZ scale scaleX scaleY scaleZ skewX skewY perspective".split(" "),H={arr:function(t){return Array.isArray(t)},obj:function(t){return-1<Object.prototype.toString.call(t).indexOf("Object")},pth:function(t){return H.obj(t)&&t.hasOwnProperty("totalLength")},svg:function(t){return t instanceof SVGElement},dom:function(t){return t.nodeType||H.svg(t)},str:function(t){return"string"==typeof t},fnc:function(t){return"function"==typeof t},und:function(t){return void 0===t},hex:function(t){return/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(t)},rgb:function(t){return/^rgb/.test(t)},hsl:function(t){return/^hsl/.test(t)},col:function(t){return H.hex(t)||H.rgb(t)||H.hsl(t)}},P=function(){function t(t,e,i){return(((1-3*i+3*e)*t+(3*i-6*e))*t+3*e)*t}return function(e,i,n,s){if(0<=e&&1>=e&&0<=n&&1>=n){var o=new Float32Array(11);if(e!==i||n!==s)for(var a=0;11>a;++a)o[a]=t(.1*a,e,n);return function(a){if(e===i&&n===s)return a;if(0===a)return 0;if(1===a)return 1;for(var r=0,l=1;10!==l&&o[l]<=a;++l)r+=.1;var l=r+(a-o[--l])/(o[l+1]-o[l])*.1,h=3*(1-3*n+3*e)*l*l+2*(3*n-6*e)*l+3*e;if(.001<=h){for(r=0;4>r&&0!=(h=3*(1-3*n+3*e)*l*l+2*(3*n-6*e)*l+3*e);++r)var d=t(l,e,n)-a,l=l-d/h;a=l}else if(0===h)a=l;else{var l=r,r=r+.1,u=0;do{0<(h=t(d=l+(r-l)/2,e,n)-a)?r=d:l=d}while(1e-7<Math.abs(h)&&10>++u);a=d}return t(a,i,s)}}}}(),W=function(){function t(t,e){return 0===t||1===t?t:-Math.pow(2,10*(t-1))*Math.sin(2*(t-1-e/(2*Math.PI)*Math.asin(1))*Math.PI/e)}var e,i="Quad Cubic Quart Quint Sine Expo Circ Back Elastic".split(" "),n={In:[[.55,.085,.68,.53],[.55,.055,.675,.19],[.895,.03,.685,.22],[.755,.05,.855,.06],[.47,0,.745,.715],[.95,.05,.795,.035],[.6,.04,.98,.335],[.6,-.28,.735,.045],t],Out:[[.25,.46,.45,.94],[.215,.61,.355,1],[.165,.84,.44,1],[.23,1,.32,1],[.39,.575,.565,1],[.19,1,.22,1],[.075,.82,.165,1],[.175,.885,.32,1.275],function(e,i){return 1-t(1-e,i)}],InOut:[[.455,.03,.515,.955],[.645,.045,.355,1],[.77,0,.175,1],[.86,0,.07,1],[.445,.05,.55,.95],[1,0,0,1],[.785,.135,.15,.86],[.68,-.55,.265,1.55],function(e,i){return.5>e?t(2*e,i)/2:1-t(-2*e+2,i)/2}]},s={linear:P(.25,.25,.75,.75)},o={};for(e in n)o.type=e,n[o.type].forEach(function(t){return function(e,n){s["ease"+t.type+i[n]]=H.fnc(e)?e:P.apply($jscomp$this,e)}}(o)),o={type:o.type};return s}(),j={css:function(t,e,i){return t.style[e]=i},attribute:function(t,e,i){return t.setAttribute(e,i)},object:function(t,e,i){return t[e]=i},transform:function(t,e,i,n,s){n[s]||(n[s]=[]),n[s].push(e+"("+i+")")}},F=[],q=0,z=function(){function t(){q=requestAnimationFrame(e)}function e(e){var i=F.length;if(i){for(var n=0;n<i;)F[n]&&F[n].tick(e),n++;t()}else cancelAnimationFrame(q),q=0}return t}();return D.version="2.2.0",D.speed=1,D.running=F,D.remove=function(t){t=C(t);for(var e=F.length;e--;)for(var i=F[e],n=i.animations,o=n.length;o--;)s(t,n[o].animatable.target)&&(n.splice(o,1),n.length||i.pause())},D.getValue=m,D.path=function(e,i){var n=H.str(e)?t(e)[0]:e,s=i||100;return function(t){return{el:n,property:t,totalLength:k(n)*(s/100)}}},D.setDashoffset=function(t){var e=k(t);return t.setAttribute("stroke-dasharray",e),e},D.bezier=P,D.easings=W,D.timeline=function(t){var e=D(t);return e.pause(),e.duration=0,e.add=function(i){return e.children.forEach(function(t){t.began=!0,t.completed=!0}),n(i).forEach(function(i){var n=r(i,a(A,t||{}));n.targets=n.targets||t.targets,i=e.duration;var s=n.offset;n.autoplay=!1,n.direction=e.direction,n.offset=H.und(s)?i:g(s,i),e.began=!0,e.completed=!0,e.seek(n.offset),(n=D(n)).began=!0,n.completed=!0,n.duration>i&&(e.duration=n.duration),e.children.push(n)}),e.seek(0),e.reset(),e.autoplay&&e.restart(),e},e},D.random=function(t,e){return Math.floor(Math.random()*(e-t+1))+t},D}),function(t,e){"use strict";var i={accordion:!0,onOpenStart:void 0,onOpenEnd:void 0,onCloseStart:void 0,onCloseEnd:void 0,inDuration:300,outDuration:300},n=function(n){function s(e,i){_classCallCheck(this,s);var n=_possibleConstructorReturn(this,(s.__proto__||Object.getPrototypeOf(s)).call(this,s,e,i));n.el.M_Collapsible=n,n.options=t.extend({},s.defaults,i),n.$headers=n.$el.children("li").children(".collapsible-header"),n.$headers.attr("tabindex",0),n._setupEventHandlers();var o=n.$el.children("li.active").children(".collapsible-body");return n.options.accordion?o.first().css("display","block"):o.css("display","block"),n}return _inherits(s,Component),_createClass(s,[{key:"destroy",value:function(){this._removeEventHandlers(),this.el.M_Collapsible=void 0}},{key:"_setupEventHandlers",value:function(){var t=this;this._handleCollapsibleClickBound=this._handleCollapsibleClick.bind(this),this._handleCollapsibleKeydownBound=this._handleCollapsibleKeydown.bind(this),this.el.addEventListener("click",this._handleCollapsibleClickBound),this.$headers.each(function(e){e.addEventListener("keydown",t._handleCollapsibleKeydownBound)})}},{key:"_removeEventHandlers",value:function(){this.el.removeEventListener("click",this._handleCollapsibleClickBound)}},{key:"_handleCollapsibleClick",value:function(e){var i=t(e.target).closest(".collapsible-header");if(e.target&&i.length){var n=i.closest(".collapsible");if(n[0]===this.el){var s=i.closest("li"),o=n.children("li"),a=s[0].classList.contains("active"),r=o.index(s);a?this.close(r):this.open(r)}}}},{key:"_handleCollapsibleKeydown",value:function(t){13===t.keyCode&&this._handleCollapsibleClickBound(t)}},{key:"_animateIn",value:function(t){var i=this,n=this.$el.children("li").eq(t);if(n.length){var s=n.children(".collapsible-body");e.remove(s[0]),s.css({display:"block",overflow:"hidden",height:0,paddingTop:"",paddingBottom:""});var o=s.css("padding-top"),a=s.css("padding-bottom"),r=s[0].scrollHeight;s.css({paddingTop:0,paddingBottom:0}),e({targets:s[0],height:r,paddingTop:o,paddingBottom:a,duration:this.options.inDuration,easing:"easeInOutCubic",complete:function(t){s.css({overflow:"",paddingTop:"",paddingBottom:"",height:""}),"function"==typeof i.options.onOpenEnd&&i.options.onOpenEnd.call(i,n[0])}})}}},{key:"_animateOut",value:function(t){var i=this,n=this.$el.children("li").eq(t);if(n.length){var s=n.children(".collapsible-body");e.remove(s[0]),s.css("overflow","hidden"),e({targets:s[0],height:0,paddingTop:0,paddingBottom:0,duration:this.options.outDuration,easing:"easeInOutCubic",complete:function(){s.css({height:"",overflow:"",padding:"",display:""}),"function"==typeof i.options.onCloseEnd&&i.options.onCloseEnd.call(i,n[0])}})}}},{key:"open",value:function(e){var i=this,n=this.$el.children("li").eq(e);if(n.length&&!n[0].classList.contains("active")){if("function"==typeof this.options.onOpenStart&&this.options.onOpenStart.call(this,n[0]),this.options.accordion){var s=this.$el.children("li");this.$el.children("li.active").each(function(e){var n=s.index(t(e));i.close(n)})}n[0].classList.add("active"),this._animateIn(e)}}},{key:"close",value:function(t){var e=this.$el.children("li").eq(t);e.length&&e[0].classList.contains("active")&&("function"==typeof this.options.onCloseStart&&this.options.onCloseStart.call(this,e[0]),e[0].classList.remove("active"),this._animateOut(t))}}],[{key:"init",value:function(t,e){return _get(s.__proto__||Object.getPrototypeOf(s),"init",this).call(this,this,t,e)}},{key:"getInstance",value:function(t){return(t.jquery?t[0]:t).M_Collapsible}},{key:"defaults",get:function(){return i}}]),s}();M.Collapsible=n,M.jQueryLoaded&&M.initializeJqueryWrapper(n,"collapsible","M_Collapsible")}(cash,M.anime),function(t,e){"use strict";var i={alignment:"left",autoFocus:!0,constrainWidth:!0,container:null,coverTrigger:!0,closeOnClick:!0,hover:!1,inDuration:150,outDuration:250,onOpenStart:null,onOpenEnd:null,onCloseStart:null,onCloseEnd:null},n=function(n){function s(e,i){_classCallCheck(this,s);var n=_possibleConstructorReturn(this,(s.__proto__||Object.getPrototypeOf(s)).call(this,s,e,i));return n.el.M_Dropdown=n,s._dropdowns.push(n),n.id=M.getIdFromTrigger(e),n.dropdownEl=document.getElementById(n.id),n.$dropdownEl=t(n.dropdownEl),n.options=t.extend({},s.defaults,i),n.isOpen=!1,n.isScrollable=!1,n.isTouchMoving=!1,n.focusedIndex=-1,n.filterQuery=[],n.options.container?t(n.options.container).append(n.dropdownEl):n.$el.after(n.dropdownEl),n._makeDropdownFocusable(),n._resetFilterQueryBound=n._resetFilterQuery.bind(n),n._handleDocumentClickBound=n._handleDocumentClick.bind(n),n._handleDocumentTouchmoveBound=n._handleDocumentTouchmove.bind(n),n._handleDropdownKeydownBound=n._handleDropdownKeydown.bind(n),n._handleTriggerKeydownBound=n._handleTriggerKeydown.bind(n),n._setupEventHandlers(),n}return _inherits(s,Component),_createClass(s,[{key:"destroy",value:function(){this._resetDropdownStyles(),this._removeEventHandlers(),s._dropdowns.splice(s._dropdowns.indexOf(this),1),this.el.M_Dropdown=void 0}},{key:"_setupEventHandlers",value:function(){this.el.addEventListener("keydown",this._handleTriggerKeydownBound),this.options.hover?(this._handleMouseEnterBound=this._handleMouseEnter.bind(this),this.el.addEventListener("mouseenter",this._handleMouseEnterBound),this._handleMouseLeaveBound=this._handleMouseLeave.bind(this),this.el.addEventListener("mouseleave",this._handleMouseLeaveBound),this.dropdownEl.addEventListener("mouseleave",this._handleMouseLeaveBound)):(this._handleClickBound=this._handleClick.bind(this),this.el.addEventListener("click",this._handleClickBound))}},{key:"_removeEventHandlers",value:function(){this.el.removeEventListener("keydown",this._handleTriggerKeydownBound),this.options.hover?(this.el.removeEventHandlers("mouseenter",this._handleMouseEnterBound),this.el.removeEventHandlers("mouseleave",this._handleMouseLeaveBound),this.dropdownEl.removeEventHandlers("mouseleave",this._handleMouseLeaveBound)):this.el.removeEventListener("click",this._handleClickBound)}},{key:"_setupTemporaryEventHandlers",value:function(){document.body.addEventListener("click",this._handleDocumentClickBound,!0),document.body.addEventListener("touchend",this._handleDocumentClickBound),document.body.addEventListener("touchmove",this._handleDocumentTouchmoveBound),this.dropdownEl.addEventListener("keydown",this._handleDropdownKeydownBound)}},{key:"_removeTemporaryEventHandlers",value:function(){document.body.removeEventListener("click",this._handleDocumentClickBound,!0),document.body.removeEventListener("touchend",this._handleDocumentClickBound),document.body.removeEventListener("touchmove",this._handleDocumentTouchmoveBound),this.dropdownEl.removeEventListener("keydown",this._handleDropdownKeydownBound)}},{key:"_handleClick",value:function(t){t.preventDefault(),this.open()}},{key:"_handleMouseEnter",value:function(){this.open()}},{key:"_handleMouseLeave",value:function(e){var i=e.toElement||e.relatedTarget,n=!!t(i).closest(".dropdown-content").length,s=!1,o=t(i).closest(".dropdown-trigger");o.length&&o[0].M_Dropdown&&o[0].M_Dropdown.isOpen&&(s=!0),s||n||this.close()}},{key:"_handleDocumentClick",value:function(e){var i=this,n=t(e.target);this.options.closeOnClick&&n.closest(".dropdown-content").length&&!this.isTouchMoving?setTimeout(function(){i.close()},0):!n.closest(".dropdown-trigger").length&&n.closest(".dropdown-content").length||setTimeout(function(){i.close()},0),this.isTouchMoving=!1}},{key:"_handleTriggerKeydown",value:function(t){t.which!==M.keys.ARROW_DOWN&&t.which!==M.keys.ENTER||this.isOpen||(t.preventDefault(),this.open())}},{key:"_handleDocumentTouchmove",value:function(e){t(e.target).closest(".dropdown-content").length&&(this.isTouchMoving=!0)}},{key:"_handleDropdownKeydown",value:function(e){if(e.which===M.keys.TAB)e.preventDefault(),this.close();else if(e.which!==M.keys.ARROW_DOWN&&e.which!==M.keys.ARROW_UP||!this.isOpen)if(e.which===M.keys.ENTER&&this.isOpen){var i=this.dropdownEl.children[this.focusedIndex],n=t(i).find("a, button").first();n.length?n[0].click():i.click()}else e.which===M.keys.ESC&&this.isOpen&&(e.preventDefault(),this.close());else{e.preventDefault();var s=e.which===M.keys.ARROW_DOWN?1:-1,o=this.focusedIndex,a=!1;do{if(o+=s,this.dropdownEl.children[o]&&-1!==this.dropdownEl.children[o].tabIndex){a=!0;break}}while(o<this.dropdownEl.children.length&&o>=0);a&&(this.focusedIndex=o,this._focusFocusedItem())}var r=String.fromCharCode(e.which).toLowerCase(),l=[9,13,27,38,40];if(r&&-1===l.indexOf(e.which)){this.filterQuery.push(r);var h=this.filterQuery.join(""),d=t(this.dropdownEl).find("li").filter(function(e){return 0===t(e).text().toLowerCase().indexOf(h)})[0];d&&(this.focusedIndex=t(d).index(),this._focusFocusedItem())}this.filterTimeout=setTimeout(this._resetFilterQueryBound,1e3)}},{key:"_resetFilterQuery",value:function(){this.filterQuery=[]}},{key:"_resetDropdownStyles",value:function(){this.$dropdownEl.css({display:"",width:"",height:"",left:"",top:"","transform-origin":"",transform:"",opacity:""})}},{key:"_makeDropdownFocusable",value:function(){this.dropdownEl.tabIndex=0,t(this.dropdownEl).children().each(function(t){t.getAttribute("tabindex")||t.setAttribute("tabindex",0)})}},{key:"_focusFocusedItem",value:function(){this.focusedIndex>=0&&this.focusedIndex<this.dropdownEl.children.length&&this.options.autoFocus&&this.dropdownEl.children[this.focusedIndex].focus()}},{key:"_getDropdownPosition",value:function(){this.el.offsetParent.getBoundingClientRect();var t=this.el.getBoundingClientRect(),e=this.dropdownEl.getBoundingClientRect(),i=e.height,n=e.width,s=t.left-e.left,o=t.top-e.top,a={left:s,top:o,height:i,width:n},r=this.dropdownEl.offsetParent,l=M.checkPossibleAlignments(this.el,r,a,this.options.coverTrigger?0:t.height),h="top",d=this.options.alignment;if(o+=this.options.coverTrigger?0:t.height,this.isScrollable=!1,l.top||(l.bottom?h="bottom":(this.isScrollable=!0,l.spaceOnTop>l.spaceOnBottom?(h="bottom",i+=l.spaceOnTop,o-=l.spaceOnTop):i+=l.spaceOnBottom)),!l[d]){var u="left"===d?"right":"left";l[u]?d=u:l.spaceOnLeft>l.spaceOnRight?(d="right",n+=l.spaceOnLeft,s-=l.spaceOnLeft):(d="left",n+=l.spaceOnRight)}return"bottom"===h&&(o=o-e.height+(this.options.coverTrigger?t.height:0)),"right"===d&&(s=s-e.width+t.width),{x:s,y:o,verticalAlignment:h,horizontalAlignment:d,height:i,width:n}}},{key:"_animateIn",value:function(){var t=this;e.remove(this.dropdownEl),e({targets:this.dropdownEl,opacity:{value:[0,1],easing:"easeOutQuad"},scaleX:[.3,1],scaleY:[.3,1],duration:this.options.inDuration,easing:"easeOutQuint",complete:function(e){if(t.options.autoFocus&&t.dropdownEl.focus(),"function"==typeof t.options.onOpenEnd){var i=e.animatables[0].target;t.options.onOpenEnd.call(i,t.el)}}})}},{key:"_animateOut",value:function(){var t=this;e.remove(this.dropdownEl),e({targets:this.dropdownEl,opacity:{value:0,easing:"easeOutQuint"},scaleX:.3,scaleY:.3,duration:this.options.outDuration,easing:"easeOutQuint",complete:function(e){if(t._resetDropdownStyles(),"function"==typeof t.options.onCloseEnd){e.animatables[0].target;t.options.onCloseEnd.call(t,t.el)}}})}},{key:"_placeDropdown",value:function(){var t=this.options.constrainWidth?this.el.getBoundingClientRect().width:this.dropdownEl.getBoundingClientRect().width;this.dropdownEl.style.width=t+"px";var e=this._getDropdownPosition();this.dropdownEl.style.left=e.x+"px",this.dropdownEl.style.top=e.y+"px",this.dropdownEl.style.height=e.height+"px",this.dropdownEl.style.width=e.width+"px",this.dropdownEl.style.transformOrigin=("left"===e.horizontalAlignment?"0":"100%")+" "+("top"===e.verticalAlignment?"0":"100%")}},{key:"open",value:function(){this.isOpen||(this.isOpen=!0,"function"==typeof this.options.onOpenStart&&this.options.onOpenStart.call(this,this.el),this._resetDropdownStyles(),this.dropdownEl.style.display="block",this._placeDropdown(),this._animateIn(),this._setupTemporaryEventHandlers())}},{key:"close",value:function(){this.isOpen&&(this.isOpen=!1,this.focusedIndex=-1,"function"==typeof this.options.onCloseStart&&this.options.onCloseStart.call(this,this.el),this._animateOut(),this._removeTemporaryEventHandlers(),this.options.autoFocus&&this.el.focus())}},{key:"recalculateDimensions",value:function(){this.isOpen&&(this.$dropdownEl.css({width:"",height:"",left:"",top:"","transform-origin":""}),this._placeDropdown())}}],[{key:"init",value:function(t,e){return _get(s.__proto__||Object.getPrototypeOf(s),"init",this).call(this,this,t,e)}},{key:"getInstance",value:function(t){return(t.jquery?t[0]:t).M_Dropdown}},{key:"defaults",get:function(){return i}}]),s}();n._dropdowns=[],window.M.Dropdown=n,M.jQueryLoaded&&M.initializeJqueryWrapper(n,"dropdown","M_Dropdown")}(cash,M.anime),function(t,e){"use strict";var i={opacity:.5,inDuration:250,outDuration:250,onOpenStart:null,onOpenEnd:null,onCloseStart:null,onCloseEnd:null,preventScrolling:!0,dismissible:!0,startingTop:"4%",endingTop:"10%"},n=function(n){function s(e,i){_classCallCheck(this,s);var n=_possibleConstructorReturn(this,(s.__proto__||Object.getPrototypeOf(s)).call(this,s,e,i));return n.el.M_Modal=n,n.options=t.extend({},s.defaults,i),n.isOpen=!1,n.id=n.$el.attr("id"),n._openingTrigger=void 0,n.$overlay=t('<div class="modal-overlay"></div>'),n.el.tabIndex=0,s._count++,n._setupEventHandlers(),n}return _inherits(s,Component),_createClass(s,[{key:"destroy",value:function(){s._count--,this._removeEventHandlers(),this.el.removeAttribute("style"),this.$overlay.remove(),this.el.M_Modal=void 0}},{key:"_setupEventHandlers",value:function(){this._handleOverlayClickBound=this._handleOverlayClick.bind(this),this._handleModalCloseClickBound=this._handleModalCloseClick.bind(this),1===s._count&&document.body.addEventListener("click",this._handleTriggerClick),this.$overlay[0].addEventListener("click",this._handleOverlayClickBound),this.el.addEventListener("click",this._handleModalCloseClickBound)}},{key:"_removeEventHandlers",value:function(){0===s._count&&document.body.removeEventListener("click",this._handleTriggerClick),this.$overlay[0].removeEventListener("click",this._handleOverlayClickBound),this.el.removeEventListener("click",this._handleModalCloseClickBound)}},{key:"_handleTriggerClick",value:function(e){var i=t(e.target).closest(".modal-trigger");if(i.length){var n=M.getIdFromTrigger(i[0]),s=document.getElementById(n).M_Modal;s&&s.open(i),e.preventDefault()}}},{key:"_handleOverlayClick",value:function(){this.options.dismissible&&this.close()}},{key:"_handleModalCloseClick",value:function(e){t(e.target).closest(".modal-close").length&&this.close()}},{key:"_handleKeydown",value:function(t){27===t.keyCode&&this.options.dismissible&&this.close()}},{key:"_handleFocus",value:function(t){this.el.contains(t.target)||this.el.focus()}},{key:"_animateIn",value:function(){var i=this;t.extend(this.el.style,{display:"block",opacity:0}),t.extend(this.$overlay[0].style,{display:"block",opacity:0}),e({targets:this.$overlay[0],opacity:this.options.opacity,duration:this.options.inDuration,easing:"easeOutQuad"});var n={targets:this.el,duration:this.options.inDuration,easing:"easeOutCubic",complete:function(){"function"==typeof i.options.onOpenEnd&&i.options.onOpenEnd.call(i,i.el,i._openingTrigger)}};this.el.classList.contains("bottom-sheet")?(t.extend(n,{bottom:0,opacity:1}),e(n)):(t.extend(n,{top:[this.options.startingTop,this.options.endingTop],opacity:1,scaleX:[.8,1],scaleY:[.8,1]}),e(n))}},{key:"_animateOut",value:function(){var i=this;e({targets:this.$overlay[0],opacity:0,duration:this.options.outDuration,easing:"easeOutQuart"});var n={targets:this.el,duration:this.options.outDuration,easing:"easeOutCubic",complete:function(){i.el.style.display="none",i.$overlay.remove(),"function"==typeof i.options.onCloseEnd&&i.options.onCloseEnd.call(i,i.el)}};this.el.classList.contains("bottom-sheet")?(t.extend(n,{bottom:"-100%",opacity:0}),e(n)):(t.extend(n,{top:[this.options.endingTop,this.options.startingTop],opacity:0,scaleX:.8,scaleY:.8}),e(n))}},{key:"open",value:function(t){if(!this.isOpen)return this.isOpen=!0,s._modalsOpen++,this.$overlay[0].style.zIndex=1e3+2*s._modalsOpen,this.el.style.zIndex=1e3+2*s._modalsOpen+1,this._openingTrigger=t?t[0]:void 0,"function"==typeof this.options.onOpenStart&&this.options.onOpenStart.call(this,this.el,this._openingTrigger),this.options.preventScrolling&&(document.body.style.overflow="hidden"),this.el.classList.add("open"),this.el.insertAdjacentElement("afterend",this.$overlay[0]),this.options.dismissible&&(this._handleKeydownBound=this._handleKeydown.bind(this),this._handleFocusBound=this._handleFocus.bind(this),document.addEventListener("keydown",this._handleKeydownBound),document.addEventListener("focus",this._handleFocusBound,!0)),e.remove(this.el),e.remove(this.$overlay[0]),this._animateIn(),this.el.focus(),this}},{key:"close",value:function(){if(this.isOpen)return this.isOpen=!1,s._modalsOpen--,"function"==typeof this.options.onCloseStart&&this.options.onCloseStart.call(this,this.el),this.el.classList.remove("open"),0===s._modalsOpen&&(document.body.style.overflow=""),this.options.dismissible&&(document.removeEventListener("keydown",this._handleKeydownBound),document.removeEventListener("focus",this._handleFocusBound)),e.remove(this.el),e.remove(this.$overlay[0]),this._animateOut(),this}}],[{key:"init",value:function(t,e){return _get(s.__proto__||Object.getPrototypeOf(s),"init",this).call(this,this,t,e)}},{key:"getInstance",value:function(t){return(t.jquery?t[0]:t).M_Modal}},{key:"defaults",get:function(){return i}}]),s}();n._modalsOpen=0,n._count=0,M.Modal=n,M.jQueryLoaded&&M.initializeJqueryWrapper(n,"modal","M_Modal")}(cash,M.anime),function(t,e){"use strict";var i={inDuration:275,outDuration:200,onOpenStart:null,onOpenEnd:null,onCloseStart:null,onCloseEnd:null},n=function(n){function s(e,i){_classCallCheck(this,s);var n=_possibleConstructorReturn(this,(s.__proto__||Object.getPrototypeOf(s)).call(this,s,e,i));return n.el.M_Materialbox=n,n.options=t.extend({},s.defaults,i),n.overlayActive=!1,n.doneAnimating=!0,n.placeholder=t("<div></div>").addClass("material-placeholder"),n.originalWidth=0,n.originalHeight=0,n.originInlineStyles=n.$el.attr("style"),n.caption=n.el.getAttribute("data-caption")||"",n.$el.before(n.placeholder),n.placeholder.append(n.$el),n._setupEventHandlers(),n}return _inherits(s,Component),_createClass(s,[{key:"destroy",value:function(){this._removeEventHandlers(),this.el.M_Materialbox=void 0}},{key:"_setupEventHandlers",value:function(){this._handleMaterialboxClickBound=this._handleMaterialboxClick.bind(this),this.el.addEventListener("click",this._handleMaterialboxClickBound)}},{key:"_removeEventHandlers",value:function(){this.el.removeEventListener("click",this._handleMaterialboxClickBound)}},{key:"_handleMaterialboxClick",value:function(t){!1===this.doneAnimating||this.overlayActive&&this.doneAnimating?this.close():this.open()}},{key:"_handleWindowScroll",value:function(){this.overlayActive&&this.close()}},{key:"_handleWindowResize",value:function(){this.overlayActive&&this.close()}},{key:"_handleWindowEscape",value:function(t){27===t.keyCode&&this.doneAnimating&&this.overlayActive&&this.close()}},{key:"_makeAncestorsOverflowVisible",value:function(){this.ancestorsChanged=t();for(var e=this.placeholder[0].parentNode;null!==e&&!t(e).is(document);){var i=t(e);"visible"!==i.css("overflow")&&(i.css("overflow","visible"),void 0===this.ancestorsChanged?this.ancestorsChanged=i:this.ancestorsChanged=this.ancestorsChanged.add(i)),e=e.parentNode}}},{key:"_animateImageIn",value:function(){var t=this,i={targets:this.el,height:[this.originalHeight,this.newHeight],width:[this.originalWidth,this.newWidth],left:M.getDocumentScrollLeft()+this.windowWidth/2-this.placeholder.offset().left-this.newWidth/2,top:M.getDocumentScrollTop()+this.windowHeight/2-this.placeholder.offset().top-this.newHeight/2,duration:this.options.inDuration,easing:"easeOutQuad",complete:function(){t.doneAnimating=!0,"function"==typeof t.options.onOpenEnd&&t.options.onOpenEnd.call(t,t.el)}};this.maxWidth=this.$el.css("max-width"),this.maxHeight=this.$el.css("max-height"),"none"!==this.maxWidth&&(i.maxWidth=this.newWidth),"none"!==this.maxHeight&&(i.maxHeight=this.newHeight),e(i)}},{key:"_animateImageOut",value:function(){var t=this,i={targets:this.el,width:this.originalWidth,height:this.originalHeight,left:0,top:0,duration:this.options.outDuration,easing:"easeOutQuad",complete:function(){t.placeholder.css({height:"",width:"",position:"",top:"",left:""}),t.attrWidth&&t.$el.attr("width",t.attrWidth),t.attrHeight&&t.$el.attr("height",t.attrHeight),t.$el.removeAttr("style"),t.$el.attr("style",t.originInlineStyles),t.$el.removeClass("active"),t.doneAnimating=!0,t.ancestorsChanged.length&&t.ancestorsChanged.css("overflow",""),"function"==typeof t.options.onCloseEnd&&t.options.onCloseEnd.call(t,t.el)}};e(i)}},{key:"_updateVars",value:function(){this.windowWidth=window.innerWidth,this.windowHeight=window.innerHeight,this.caption=this.el.getAttribute("data-caption")||""}},{key:"open",value:function(){var i=this;this._updateVars(),this.originalWidth=this.el.getBoundingClientRect().width,this.originalHeight=this.el.getBoundingClientRect().height,this.doneAnimating=!1,this.$el.addClass("active"),this.overlayActive=!0,"function"==typeof this.options.onOpenStart&&this.options.onOpenStart.call(this,this.el),this.placeholder.css({width:this.placeholder[0].getBoundingClientRect().width+"px",height:this.placeholder[0].getBoundingClientRect().height+"px",position:"relative",top:0,left:0}),this._makeAncestorsOverflowVisible(),this.$el.css({position:"absolute","z-index":1e3,"will-change":"left, top, width, height"}),this.attrWidth=this.$el.attr("width"),this.attrHeight=this.$el.attr("height"),this.attrWidth&&(this.$el.css("width",this.attrWidth+"px"),this.$el.removeAttr("width")),this.attrHeight&&(this.$el.css("width",this.attrHeight+"px"),this.$el.removeAttr("height")),this.$overlay=t('<div id="materialbox-overlay"></div>').css({opacity:0}).one("click",function(){i.doneAnimating&&i.close()}),this.$el.before(this.$overlay);var n=this.$overlay[0].getBoundingClientRect();this.$overlay.css({width:this.windowWidth+"px",height:this.windowHeight+"px",left:-1*n.left+"px",top:-1*n.top+"px"}),e.remove(this.el),e.remove(this.$overlay[0]),e({targets:this.$overlay[0],opacity:1,duration:this.options.inDuration,easing:"easeOutQuad"}),""!==this.caption&&(this.$photocaption&&e.remove(this.$photoCaption[0]),this.$photoCaption=t('<div class="materialbox-caption"></div>'),this.$photoCaption.text(this.caption),t("body").append(this.$photoCaption),this.$photoCaption.css({display:"inline"}),e({targets:this.$photoCaption[0],opacity:1,duration:this.options.inDuration,easing:"easeOutQuad"}));var s=0,o=this.originalWidth/this.windowWidth,a=this.originalHeight/this.windowHeight;this.newWidth=0,this.newHeight=0,o>a?(s=this.originalHeight/this.originalWidth,this.newWidth=.9*this.windowWidth,this.newHeight=.9*this.windowWidth*s):(s=this.originalWidth/this.originalHeight,this.newWidth=.9*this.windowHeight*s,this.newHeight=.9*this.windowHeight),this._animateImageIn(),this._handleWindowScrollBound=this._handleWindowScroll.bind(this),this._handleWindowResizeBound=this._handleWindowResize.bind(this),this._handleWindowEscapeBound=this._handleWindowEscape.bind(this),window.addEventListener("scroll",this._handleWindowScrollBound),window.addEventListener("resize",this._handleWindowResizeBound),window.addEventListener("keyup",this._handleWindowEscapeBound)}},{key:"close",value:function(){var t=this;this._updateVars(),this.doneAnimating=!1,"function"==typeof this.options.onCloseStart&&this.options.onCloseStart.call(this,this.el),e.remove(this.el),e.remove(this.$overlay[0]),""!==this.caption&&e.remove(this.$photoCaption[0]),window.removeEventListener("scroll",this._handleWindowScrollBound),window.removeEventListener("resize",this._handleWindowResizeBound),window.removeEventListener("keyup",this._handleWindowEscapeBound),e({targets:this.$overlay[0],opacity:0,duration:this.options.outDuration,easing:"easeOutQuad",complete:function(){t.overlayActive=!1,t.$overlay.remove()}}),this._animateImageOut(),""!==this.caption&&e({targets:this.$photoCaption[0],opacity:0,duration:this.options.outDuration,easing:"easeOutQuad",complete:function(){t.$photoCaption.remove()}})}}],[{key:"init",value:function(t,e){return _get(s.__proto__||Object.getPrototypeOf(s),"init",this).call(this,this,t,e)}},{key:"getInstance",value:function(t){return(t.jquery?t[0]:t).M_Materialbox}},{key:"defaults",get:function(){return i}}]),s}();M.Materialbox=n,M.jQueryLoaded&&M.initializeJqueryWrapper(n,"materialbox","M_Materialbox")}(cash,M.anime),function(t){"use strict";var e={responsiveThreshold:0},i=function(i){function n(e,i){_classCallCheck(this,n);var s=_possibleConstructorReturn(this,(n.__proto__||Object.getPrototypeOf(n)).call(this,n,e,i));return s.el.M_Parallax=s,s.options=t.extend({},n.defaults,i),s._enabled=window.innerWidth>s.options.responsiveThreshold,s.$img=s.$el.find("img").first(),s.$img.each(function(){var e=this;e.complete&&t(e).trigger("load")}),s._updateParallax(),s._setupEventHandlers(),s._setupStyles(),n._parallaxes.push(s),s}return _inherits(n,Component),_createClass(n,[{key:"destroy",value:function(){n._parallaxes.splice(n._parallaxes.indexOf(this),1),this.$img[0].style.transform="",this._removeEventHandlers(),this.$el[0].M_Parallax=void 0}},{key:"_setupEventHandlers",value:function(){this._handleImageLoadBound=this._handleImageLoad.bind(this),this.$img[0].addEventListener("load",this._handleImageLoadBound),0===n._parallaxes.length&&(n._handleScrollThrottled=M.throttle(n._handleScroll,5),window.addEventListener("scroll",n._handleScrollThrottled),n._handleWindowResizeThrottled=M.throttle(n._handleWindowResize,5),window.addEventListener("resize",n._handleWindowResizeThrottled))}},{key:"_removeEventHandlers",value:function(){this.$img[0].removeEventListener("load",this._handleImageLoadBound),0===n._parallaxes.length&&(window.removeEventListener("scroll",n._handleScrollThrottled),window.removeEventListener("resize",n._handleWindowResizeThrottled))}},{key:"_setupStyles",value:function(){this.$img[0].style.opacity=1}},{key:"_handleImageLoad",value:function(){this._updateParallax()}},{key:"_updateParallax",value:function(){var t=this.$el.height()>0?this.el.parentNode.offsetHeight:500,e=this.$img[0].offsetHeight-t,i=this.$el.offset().top+t,n=this.$el.offset().top,s=M.getDocumentScrollTop(),o=window.innerHeight,a=e*((s+o-n)/(t+o));this._enabled?i>s&&n<s+o&&(this.$img[0].style.transform="translate3D(-50%, "+a+"px, 0)"):this.$img[0].style.transform=""}}],[{key:"init",value:function(t,e){return _get(n.__proto__||Object.getPrototypeOf(n),"init",this).call(this,this,t,e)}},{key:"getInstance",value:function(t){return(t.jquery?t[0]:t).M_Parallax}},{key:"_handleScroll",value:function(){for(var t=0;t<n._parallaxes.length;t++){var e=n._parallaxes[t];e._updateParallax.call(e)}}},{key:"_handleWindowResize",value:function(){for(var t=0;t<n._parallaxes.length;t++){var e=n._parallaxes[t];e._enabled=window.innerWidth>e.options.responsiveThreshold}}},{key:"defaults",get:function(){return e}}]),n}();i._parallaxes=[],M.Parallax=i,M.jQueryLoaded&&M.initializeJqueryWrapper(i,"parallax","M_Parallax")}(cash),function(t,e){"use strict";var i={duration:300,onShow:null,swipeable:!1,responsiveThreshold:1/0},n=function(n){function s(e,i){_classCallCheck(this,s);var n=_possibleConstructorReturn(this,(s.__proto__||Object.getPrototypeOf(s)).call(this,s,e,i));return n.el.M_Tabs=n,n.options=t.extend({},s.defaults,i),n.$tabLinks=n.$el.children("li.tab").children("a"),n.index=0,n._setTabsAndTabWidth(),n._setupActiveTabLink(),n._createIndicator(),n.options.swipeable?n._setupSwipeableTabs():n._setupNormalTabs(),n._setupEventHandlers(),n}return _inherits(s,Component),_createClass(s,[{key:"destroy",value:function(){this._removeEventHandlers(),this._indicator.parentNode.removeChild(this._indicator),this.options.swipeable?this._teardownSwipeableTabs():this._teardownNormalTabs(),this.$el[0].M_Tabs=void 0}},{key:"_setupEventHandlers",value:function(){this._handleWindowResizeBound=this._handleWindowResize.bind(this),window.addEventListener("resize",this._handleWindowResizeBound),this._handleTabClickBound=this._handleTabClick.bind(this),this.el.addEventListener("click",this._handleTabClickBound)}},{key:"_removeEventHandlers",value:function(){window.removeEventListener("resize",this._handleWindowResizeBound),this.el.removeEventListener("click",this._handleTabClickBound)}},{key:"_handleWindowResize",value:function(){this._setTabsAndTabWidth(),0!==this.tabWidth&&0!==this.tabsWidth&&(this._indicator.style.left=this._calcLeftPos(this.$activeTabLink)+"px",this._indicator.style.right=this._calcRightPos(this.$activeTabLink)+"px")}},{key:"_handleTabClick",value:function(e){var i=this,n=t(e.target).closest("li.tab"),s=t(e.target).closest("a");if(s.length&&s.parent().hasClass("tab"))if(n.hasClass("disabled"))e.preventDefault();else if(!s.attr("target")){this._setTabsAndTabWidth(),this.$activeTabLink.removeClass("active");var o=this.$content;this.$activeTabLink=s,this.$content=t(M.escapeHash(s[0].hash)),this.$tabLinks=this.$el.children("li.tab").children("a"),this.$activeTabLink.addClass("active");var a=this.index;this.index=Math.max(this.$tabLinks.index(s),0),this.options.swipeable?this._tabsCarousel&&this._tabsCarousel.set(this.index,function(){"function"==typeof i.options.onShow&&i.options.onShow.call(i,i.$content[0])}):this.$content.length&&(this.$content[0].style.display="block",this.$content.addClass("active"),"function"==typeof this.options.onShow&&this.options.onShow.call(this,this.$content[0]),o.length&&!o.is(this.$content)&&(o[0].style.display="none",o.removeClass("active"))),this._animateIndicator(a),e.preventDefault()}}},{key:"_createIndicator",value:function(){var t=this,e=document.createElement("li");e.classList.add("indicator"),this.el.appendChild(e),this._indicator=e,setTimeout(function(){t._indicator.style.left=t._calcLeftPos(t.$activeTabLink)+"px",t._indicator.style.right=t._calcRightPos(t.$activeTabLink)+"px"},0)}},{key:"_setupActiveTabLink",value:function(){this.$activeTabLink=t(this.$tabLinks.filter('[href="'+location.hash+'"]')),0===this.$activeTabLink.length&&(this.$activeTabLink=this.$el.children("li.tab").children("a.active").first()),0===this.$activeTabLink.length&&(this.$activeTabLink=this.$el.children("li.tab").children("a").first()),this.$tabLinks.removeClass("active"),this.$activeTabLink[0].classList.add("active"),this.index=Math.max(this.$tabLinks.index(this.$activeTabLink),0),this.$activeTabLink.length&&(this.$content=t(M.escapeHash(this.$activeTabLink[0].hash)),this.$content.addClass("active"))}},{key:"_setupSwipeableTabs",value:function(){var e=this;window.innerWidth>this.options.responsiveThreshold&&(this.options.swipeable=!1);var i=t();this.$tabLinks.each(function(e){var n=t(M.escapeHash(e.hash));n.addClass("carousel-item"),i=i.add(n)});var n=t('<div class="tabs-content carousel carousel-slider"></div>');i.first().before(n),n.append(i),i[0].style.display="";var s=this.$activeTabLink.closest(".tab").index();this._tabsCarousel=M.Carousel.init(n[0],{fullWidth:!0,noWrap:!0,onCycleTo:function(i){var n=e.index;e.index=t(i).index(),e.$activeTabLink.removeClass("active"),e.$activeTabLink=e.$tabLinks.eq(e.index),e.$activeTabLink.addClass("active"),e._animateIndicator(n),"function"==typeof e.options.onShow&&e.options.onShow.call(e,e.$content[0])}}),this._tabsCarousel.set(s)}},{key:"_teardownSwipeableTabs",value:function(){var t=this._tabsCarousel.$el;this._tabsCarousel.destroy(),t.after(t.children()),t.remove()}},{key:"_setupNormalTabs",value:function(){this.$tabLinks.not(this.$activeTabLink).each(function(e){if(e.hash){var i=t(M.escapeHash(e.hash));i.length&&(i[0].style.display="none")}})}},{key:"_teardownNormalTabs",value:function(){this.$tabLinks.each(function(e){if(e.hash){var i=t(M.escapeHash(e.hash));i.length&&(i[0].style.display="")}})}},{key:"_setTabsAndTabWidth",value:function(){this.tabsWidth=this.$el.width(),this.tabWidth=Math.max(this.tabsWidth,this.el.scrollWidth)/this.$tabLinks.length}},{key:"_calcRightPos",value:function(t){return Math.ceil(this.tabsWidth-t.position().left-t[0].getBoundingClientRect().width)}},{key:"_calcLeftPos",value:function(t){return Math.floor(t.position().left)}},{key:"updateTabIndicator",value:function(){this._animateIndicator(this.index)}},{key:"_animateIndicator",value:function(t){var i=0,n=0;this.index-t>=0?i=90:n=90;var s={targets:this._indicator,left:{value:this._calcLeftPos(this.$activeTabLink),delay:i},right:{value:this._calcRightPos(this.$activeTabLink),delay:n},duration:this.options.duration,easing:"easeOutQuad"};e.remove(this._indicator),e(s)}},{key:"select",value:function(t){var e=this.$tabLinks.filter('[href="#'+t+'"]');e.length&&e.trigger("click")}}],[{key:"init",value:function(t,e){return _get(s.__proto__||Object.getPrototypeOf(s),"init",this).call(this,this,t,e)}},{key:"getInstance",value:function(t){return(t.jquery?t[0]:t).M_Tabs}},{key:"defaults",get:function(){return i}}]),s}();window.M.Tabs=n,M.jQueryLoaded&&M.initializeJqueryWrapper(n,"tabs","M_Tabs")}(cash,M.anime),function(t,e){"use strict";var i={exitDelay:200,enterDelay:0,html:null,margin:5,inDuration:250,outDuration:200,position:"bottom",transitionMovement:10},n=function(n){function s(e,i){_classCallCheck(this,s);var n=_possibleConstructorReturn(this,(s.__proto__||Object.getPrototypeOf(s)).call(this,s,e,i));return n.el.M_Tooltip=n,n.options=t.extend({},s.defaults,i),n.isOpen=!1,n.isHovered=!1,n.isFocused=!1,n._appendTooltipEl(),n._setupEventHandlers(),n}return _inherits(s,Component),_createClass(s,[{key:"destroy",value:function(){t(this.tooltipEl).remove(),this._removeEventHandlers(),this.el.M_Tooltip=void 0}},{key:"_appendTooltipEl",value:function(){var t=document.createElement("div");t.classList.add("material-tooltip"),this.tooltipEl=t;var e=document.createElement("div");e.classList.add("tooltip-content"),e.innerHTML=this.options.html,t.appendChild(e),document.body.appendChild(t)}},{key:"_updateTooltipContent",value:function(){this.tooltipEl.querySelector(".tooltip-content").innerHTML=this.options.html}},{key:"_setupEventHandlers",value:function(){this._handleMouseEnterBound=this._handleMouseEnter.bind(this),this._handleMouseLeaveBound=this._handleMouseLeave.bind(this),this._handleFocusBound=this._handleFocus.bind(this),this._handleBlurBound=this._handleBlur.bind(this),this.el.addEventListener("mouseenter",this._handleMouseEnterBound),this.el.addEventListener("mouseleave",this._handleMouseLeaveBound),this.el.addEventListener("focus",this._handleFocusBound,!0),this.el.addEventListener("blur",this._handleBlurBound,!0)}},{key:"_removeEventHandlers",value:function(){this.el.removeEventListener("mouseenter",this._handleMouseEnterBound),this.el.removeEventListener("mouseleave",this._handleMouseLeaveBound),this.el.removeEventListener("focus",this._handleFocusBound,!0),this.el.removeEventListener("blur",this._handleBlurBound,!0)}},{key:"open",value:function(){this.isOpen||(this.isOpen=!0,this.options=t.extend({},this.options,this._getAttributeOptions()),this._updateTooltipContent(),this._setEnterDelayTimeout())}},{key:"close",value:function(){this.isOpen&&(this.isOpen=!1,this._setExitDelayTimeout())}},{key:"_setExitDelayTimeout",value:function(){var t=this;clearTimeout(this._exitDelayTimeout),this._exitDelayTimeout=setTimeout(function(){t.isHovered||t.isFocused||t._animateOut()},this.options.exitDelay)}},{key:"_setEnterDelayTimeout",value:function(){var t=this;clearTimeout(this._enterDelayTimeout),this._enterDelayTimeout=setTimeout(function(){(t.isHovered||t.isFocused)&&t._animateIn()},this.options.enterDelay)}},{key:"_positionTooltip",value:function(){var e=this.el,i=this.tooltipEl,n=e.offsetHeight,s=e.offsetWidth,o=i.offsetHeight,a=i.offsetWidth,r=void 0,l=this.options.margin,h=void 0,d=void 0;this.xMovement=0,this.yMovement=0,h=e.getBoundingClientRect().top+M.getDocumentScrollTop(),d=e.getBoundingClientRect().left+M.getDocumentScrollLeft(),"top"===this.options.position?(h+=-o-l,d+=s/2-a/2,this.yMovement=-this.options.transitionMovement):"right"===this.options.position?(h+=n/2-o/2,d+=s+l,this.xMovement=this.options.transitionMovement):"left"===this.options.position?(h+=n/2-o/2,d+=-a-l,this.xMovement=-this.options.transitionMovement):(h+=n+l,d+=s/2-a/2,this.yMovement=this.options.transitionMovement),r=this._repositionWithinScreen(d,h,a,o),t(i).css({top:r.y+"px",left:r.x+"px"})}},{key:"_repositionWithinScreen",value:function(t,e,i,n){var s=M.getDocumentScrollLeft(),o=M.getDocumentScrollTop(),a=t-s,r=e-o,l={left:a,top:r,width:i,height:n},h=this.options.margin+this.options.transitionMovement,d=M.checkWithinContainer(document.body,l,h);return d.left?a=h:d.right&&(a-=a+i-window.innerWidth),d.top?r=h:d.bottom&&(r-=r+n-window.innerHeight),{x:a+s,y:r+o}}},{key:"_animateIn",value:function(){this._positionTooltip(),this.tooltipEl.style.visibility="visible",e.remove(this.tooltipEl),e({targets:this.tooltipEl,opacity:1,translateX:this.xMovement,translateY:this.yMovement,duration:this.options.inDuration,easing:"easeOutCubic"})}},{key:"_animateOut",value:function(){e.remove(this.tooltipEl),e({targets:this.tooltipEl,opacity:0,translateX:0,translateY:0,duration:this.options.outDuration,easing:"easeOutCubic"})}},{key:"_handleMouseEnter",value:function(){this.isHovered=!0,this.open()}},{key:"_handleMouseLeave",value:function(){this.isHovered=!1,this.close()}},{key:"_handleFocus",value:function(){this.isFocused=!0,this.open()}},{key:"_handleBlur",value:function(){this.isFocused=!1,this.close()}},{key:"_getAttributeOptions",value:function(){var t={},e=this.el.getAttribute("data-tooltip"),i=this.el.getAttribute("data-position");return e&&(t.html=e),i&&(t.position=i),t}}],[{key:"init",value:function(t,e){return _get(s.__proto__||Object.getPrototypeOf(s),"init",this).call(this,this,t,e)}},{key:"getInstance",value:function(t){return(t.jquery?t[0]:t).M_Tooltip}},{key:"defaults",get:function(){return i}}]),s}();M.Tooltip=n,M.jQueryLoaded&&M.initializeJqueryWrapper(n,"tooltip","M_Tooltip")}(cash,M.anime),function(t){"use strict";function e(t){return null!==t&&t===t.window}function i(t){return e(t)?t:9===t.nodeType&&t.defaultView}function n(t){var e,n,s={top:0,left:0},o=t&&t.ownerDocument;return e=o.documentElement,void 0!==t.getBoundingClientRect&&(s=t.getBoundingClientRect()),n=i(o),{top:s.top+n.pageYOffset-e.clientTop,left:s.left+n.pageXOffset-e.clientLeft}}function s(t){var e="";for(var i in t)t.hasOwnProperty(i)&&(e+=i+":"+t[i]+";");return e}function o(t){if(!1===d.allowEvent(t))return null;for(var e=null,i=t.target||t.srcElement;null!==i.parentNode;){if(!(i instanceof SVGElement)&&-1!==i.className.indexOf("waves-effect")){e=i;break}i=i.parentNode}return e}function a(e){var i=o(e);null!==i&&(h.show(e,i),"ontouchstart"in t&&(i.addEventListener("touchend",h.hide,!1),i.addEventListener("touchcancel",h.hide,!1)),i.addEventListener("mouseup",h.hide,!1),i.addEventListener("mouseleave",h.hide,!1),i.addEventListener("dragend",h.hide,!1))}var r=r||{},l=document.querySelectorAll.bind(document),h={duration:750,show:function(t,e){if(2===t.button)return!1;var i=e||this,o=document.createElement("div");o.className="waves-ripple",i.appendChild(o);var a=n(i),r=t.pageY-a.top,l=t.pageX-a.left,d="scale("+i.clientWidth/100*10+")";"touches"in t&&(r=t.touches[0].pageY-a.top,l=t.touches[0].pageX-a.left),o.setAttribute("data-hold",Date.now()),o.setAttribute("data-scale",d),o.setAttribute("data-x",l),o.setAttribute("data-y",r);var u={top:r+"px",left:l+"px"};o.className=o.className+" waves-notransition",o.setAttribute("style",s(u)),o.className=o.className.replace("waves-notransition",""),u["-webkit-transform"]=d,u["-moz-transform"]=d,u["-ms-transform"]=d,u["-o-transform"]=d,u.transform=d,u.opacity="1",u["-webkit-transition-duration"]=h.duration+"ms",u["-moz-transition-duration"]=h.duration+"ms",u["-o-transition-duration"]=h.duration+"ms",u["transition-duration"]=h.duration+"ms",u["-webkit-transition-timing-function"]="cubic-bezier(0.250, 0.460, 0.450, 0.940)",u["-moz-transition-timing-function"]="cubic-bezier(0.250, 0.460, 0.450, 0.940)",u["-o-transition-timing-function"]="cubic-bezier(0.250, 0.460, 0.450, 0.940)",u["transition-timing-function"]="cubic-bezier(0.250, 0.460, 0.450, 0.940)",o.setAttribute("style",s(u))},hide:function(t){d.touchup(t);var e=this,i=(e.clientWidth,null),n=e.getElementsByClassName("waves-ripple");if(!(n.length>0))return!1;var o=(i=n[n.length-1]).getAttribute("data-x"),a=i.getAttribute("data-y"),r=i.getAttribute("data-scale"),l=350-(Date.now()-Number(i.getAttribute("data-hold")));l<0&&(l=0),setTimeout(function(){var t={top:a+"px",left:o+"px",opacity:"0","-webkit-transition-duration":h.duration+"ms","-moz-transition-duration":h.duration+"ms","-o-transition-duration":h.duration+"ms","transition-duration":h.duration+"ms","-webkit-transform":r,"-moz-transform":r,"-ms-transform":r,"-o-transform":r,transform:r};i.setAttribute("style",s(t)),setTimeout(function(){try{e.removeChild(i)}catch(t){return!1}},h.duration)},l)},wrapInput:function(t){for(var e=0;e<t.length;e++){var i=t[e];if("input"===i.tagName.toLowerCase()){var n=i.parentNode;if("i"===n.tagName.toLowerCase()&&-1!==n.className.indexOf("waves-effect"))continue;var s=document.createElement("i");s.className=i.className+" waves-input-wrapper";var o=i.getAttribute("style");o||(o=""),s.setAttribute("style",o),i.className="waves-button-input",i.removeAttribute("style"),n.replaceChild(s,i),s.appendChild(i)}}}},d={touches:0,allowEvent:function(t){var e=!0;return"touchstart"===t.type?d.touches+=1:"touchend"===t.type||"touchcancel"===t.type?setTimeout(function(){d.touches>0&&(d.touches-=1)},500):"mousedown"===t.type&&d.touches>0&&(e=!1),e},touchup:function(t){d.allowEvent(t)}};r.displayEffect=function(e){"duration"in(e=e||{})&&(h.duration=e.duration),h.wrapInput(l(".waves-effect")),"ontouchstart"in t&&document.body.addEventListener("touchstart",a,!1),document.body.addEventListener("mousedown",a,!1)},r.attach=function(e){"input"===e.tagName.toLowerCase()&&(h.wrapInput([e]),e=e.parentNode),"ontouchstart"in t&&e.addEventListener("touchstart",a,!1),e.addEventListener("mousedown",a,!1)},t.Waves=r,document.addEventListener("DOMContentLoaded",function(){r.displayEffect()},!1)}(window),function(t,e){"use strict";var i={html:"",displayLength:4e3,inDuration:300,outDuration:375,classes:"",completeCallback:null,activationPercent:.8},n=function(){function n(e){_classCallCheck(this,n),this.options=t.extend({},n.defaults,e),this.message=this.options.html,this.panning=!1,this.timeRemaining=this.options.displayLength,0===n._toasts.length&&n._createContainer(),n._toasts.push(this);var i=this._createToast();i.M_Toast=this,this.el=i,this._animateIn(),this._setTimer()}return _createClass(n,[{key:"_createToast",value:function(){var e=document.createElement("div");return e.classList.add("toast"),this.options.classes.length&&t(e).addClass(this.options.classes),("object"==typeof HTMLElement?this.message instanceof HTMLElement:this.message&&"object"==typeof this.message&&null!==this.message&&1===this.message.nodeType&&"string"==typeof this.message.nodeName)?e.appendChild(this.message):this.message.jquery?t(e).append(this.message[0]):e.innerHTML=this.message,n._container.appendChild(e),e}},{key:"_animateIn",value:function(){e({targets:this.el,top:0,opacity:1,duration:300,easing:"easeOutCubic"})}},{key:"_setTimer",value:function(){var t=this;this.timeRemaining!==1/0&&(this.counterInterval=setInterval(function(){t.panning||(t.timeRemaining-=20),t.timeRemaining<=0&&t.dismiss()},20))}},{key:"dismiss",value:function(){var t=this;window.clearInterval(this.counterInterval);var i=this.el.offsetWidth*this.options.activationPercent;this.wasSwiped&&(this.el.style.transition="transform .05s, opacity .05s",this.el.style.transform="translateX("+i+"px)",this.el.style.opacity=0),e({targets:this.el,opacity:0,marginTop:-40,duration:this.options.outDuration,easing:"easeOutExpo",complete:function(){"function"==typeof t.options.completeCallback&&t.options.completeCallback(),t.el.parentNode.removeChild(t.el),n._toasts.splice(n._toasts.indexOf(t),1),0===n._toasts.length&&n._removeContainer()}})}}],[{key:"getInstance",value:function(t){return(t.jquery?t[0]:t).M_Toast}},{key:"_createContainer",value:function(){var t=document.createElement("div");t.setAttribute("id","toast-container"),t.addEventListener("touchstart",n._onDragStart),t.addEventListener("touchmove",n._onDragMove),t.addEventListener("touchend",n._onDragEnd),t.addEventListener("mousedown",n._onDragStart),document.addEventListener("mousemove",n._onDragMove),document.addEventListener("mouseup",n._onDragEnd),document.body.appendChild(t),n._container=t}},{key:"_removeContainer",value:function(){document.removeEventListener("mousemove",n._onDragMove),document.removeEventListener("mouseup",n._onDragEnd),n._container.parentNode.removeChild(n._container),n._container=null}},{key:"_onDragStart",value:function(e){if(e.target&&t(e.target).closest(".toast").length){var i=t(e.target).closest(".toast")[0].M_Toast;i.panning=!0,n._draggedToast=i,i.el.classList.add("panning"),i.el.style.transition="",i.startingXPos=n._xPos(e),i.time=Date.now(),i.xPos=n._xPos(e)}}},{key:"_onDragMove",value:function(t){if(n._draggedToast){t.preventDefault();var e=n._draggedToast;e.deltaX=Math.abs(e.xPos-n._xPos(t)),e.xPos=n._xPos(t),e.velocityX=e.deltaX/(Date.now()-e.time),e.time=Date.now();var i=e.xPos-e.startingXPos,s=e.el.offsetWidth*e.options.activationPercent;e.el.style.transform="translateX("+i+"px)",e.el.style.opacity=1-Math.abs(i/s)}}},{key:"_onDragEnd",value:function(){if(n._draggedToast){var t=n._draggedToast;t.panning=!1,t.el.classList.remove("panning");var e=t.xPos-t.startingXPos,i=t.el.offsetWidth*t.options.activationPercent;Math.abs(e)>i||t.velocityX>1?(t.wasSwiped=!0,t.dismiss()):(t.el.style.transition="transform .2s, opacity .2s",t.el.style.transform="",t.el.style.opacity=""),n._draggedToast=null}}},{key:"_xPos",value:function(t){return t.targetTouches&&t.targetTouches.length>=1?t.targetTouches[0].clientX:t.clientX}},{key:"dismissAll",value:function(){for(var t in n._toasts)n._toasts[t].dismiss()}},{key:"defaults",get:function(){return i}}]),n}();n._toasts=[],n._container=null,n._draggedToast=null,M.Toast=n,M.toast=function(t){return new n(t)}}(cash,M.anime),function(t,e){"use strict";var i={edge:"left",draggable:!0,inDuration:250,outDuration:200,onOpenStart:null,onOpenEnd:null,onCloseStart:null,onCloseEnd:null,preventScrolling:!0},n=function(n){function s(e,i){_classCallCheck(this,s);var n=_possibleConstructorReturn(this,(s.__proto__||Object.getPrototypeOf(s)).call(this,s,e,i));return n.el.M_Sidenav=n,n.id=n.$el.attr("id"),n.options=t.extend({},s.defaults,i),n.isOpen=!1,n.isFixed=n.el.classList.contains("sidenav-fixed"),n.isDragged=!1,n.lastWindowWidth=window.innerWidth,n.lastWindowHeight=window.innerHeight,n._createOverlay(),n._createDragTarget(),n._setupEventHandlers(),n._setupClasses(),n._setupFixed(),s._sidenavs.push(n),n}return _inherits(s,Component),_createClass(s,[{key:"destroy",value:function(){this._removeEventHandlers(),this._overlay.parentNode.removeChild(this._overlay),this.dragTarget.parentNode.removeChild(this.dragTarget),this.el.M_Sidenav=void 0;var t=s._sidenavs.indexOf(this);t>=0&&s._sidenavs.splice(t,1)}},{key:"_createOverlay",value:function(){var t=document.createElement("div");this._closeBound=this.close.bind(this),t.classList.add("sidenav-overlay"),t.addEventListener("click",this._closeBound),document.body.appendChild(t),this._overlay=t}},{key:"_setupEventHandlers",value:function(){0===s._sidenavs.length&&document.body.addEventListener("click",this._handleTriggerClick),this._handleDragTargetDragBound=this._handleDragTargetDrag.bind(this),this._handleDragTargetReleaseBound=this._handleDragTargetRelease.bind(this),this._handleCloseDragBound=this._handleCloseDrag.bind(this),this._handleCloseReleaseBound=this._handleCloseRelease.bind(this),this._handleCloseTriggerClickBound=this._handleCloseTriggerClick.bind(this),this.dragTarget.addEventListener("touchmove",this._handleDragTargetDragBound),this.dragTarget.addEventListener("touchend",this._handleDragTargetReleaseBound),this._overlay.addEventListener("touchmove",this._handleCloseDragBound),this._overlay.addEventListener("touchend",this._handleCloseReleaseBound),this.el.addEventListener("touchmove",this._handleCloseDragBound),this.el.addEventListener("touchend",this._handleCloseReleaseBound),this.el.addEventListener("click",this._handleCloseTriggerClickBound),this.isFixed&&(this._handleWindowResizeBound=this._handleWindowResize.bind(this),window.addEventListener("resize",this._handleWindowResizeBound))}},{key:"_removeEventHandlers",value:function(){1===s._sidenavs.length&&document.body.removeEventListener("click",this._handleTriggerClick),this.dragTarget.removeEventListener("touchmove",this._handleDragTargetDragBound),this.dragTarget.removeEventListener("touchend",this._handleDragTargetReleaseBound),this._overlay.removeEventListener("touchmove",this._handleCloseDragBound),this._overlay.removeEventListener("touchend",this._handleCloseReleaseBound),this.el.removeEventListener("touchmove",this._handleCloseDragBound),this.el.removeEventListener("touchend",this._handleCloseReleaseBound),this.el.removeEventListener("click",this._handleCloseTriggerClickBound),this.isFixed&&window.removeEventListener("resize",this._handleWindowResizeBound)}},{key:"_handleTriggerClick",value:function(e){var i=t(e.target).closest(".sidenav-trigger");if(e.target&&i.length){var n=M.getIdFromTrigger(i[0]),s=document.getElementById(n).M_Sidenav;s&&s.open(i),e.preventDefault()}}},{key:"_startDrag",value:function(t){var i=t.targetTouches[0].clientX;this.isDragged=!0,this._startingXpos=i,this._xPos=this._startingXpos,this._time=Date.now(),this._width=this.el.getBoundingClientRect().width,this._overlay.style.display="block",this._initialScrollTop=this.isOpen?this.el.scrollTop:M.getDocumentScrollTop(),this._verticallyScrolling=!1,e.remove(this.el),e.remove(this._overlay)}},{key:"_dragMoveUpdate",value:function(t){var e=t.targetTouches[0].clientX,i=this.isOpen?this.el.scrollTop:M.getDocumentScrollTop();this.deltaX=Math.abs(this._xPos-e),this._xPos=e,this.velocityX=this.deltaX/(Date.now()-this._time),this._time=Date.now(),this._initialScrollTop!==i&&(this._verticallyScrolling=!0)}},{key:"_handleDragTargetDrag",value:function(t){if(this.options.draggable&&!this._isCurrentlyFixed()&&!this._verticallyScrolling){this.isDragged||this._startDrag(t),this._dragMoveUpdate(t);var e=this._xPos-this._startingXpos,i=e>0?"right":"left";e=Math.min(this._width,Math.abs(e)),this.options.edge===i&&(e=0);var n=e,s="translateX(-100%)";"right"===this.options.edge&&(s="translateX(100%)",n=-n),this.percentOpen=Math.min(1,e/this._width),this.el.style.transform=s+" translateX("+n+"px)",this._overlay.style.opacity=this.percentOpen}}},{key:"_handleDragTargetRelease",value:function(){this.isDragged&&(this.percentOpen>.5?this.open():this._animateOut(),this.isDragged=!1,this._verticallyScrolling=!1)}},{key:"_handleCloseDrag",value:function(t){if(this.isOpen){if(!this.options.draggable||this._isCurrentlyFixed()||this._verticallyScrolling)return;this.isDragged||this._startDrag(t),this._dragMoveUpdate(t);var e=this._xPos-this._startingXpos,i=e>0?"right":"left";e=Math.min(this._width,Math.abs(e)),this.options.edge!==i&&(e=0);var n=-e;"right"===this.options.edge&&(n=-n),this.percentOpen=Math.min(1,1-e/this._width),this.el.style.transform="translateX("+n+"px)",this._overlay.style.opacity=this.percentOpen}}},{key:"_handleCloseRelease",value:function(){this.isOpen&&this.isDragged&&(this.percentOpen>.5?this._animateIn():this.close(),this.isDragged=!1,this._verticallyScrolling=!1)}},{key:"_handleCloseTriggerClick",value:function(e){t(e.target).closest(".sidenav-close").length&&!this._isCurrentlyFixed()&&this.close()}},{key:"_handleWindowResize",value:function(){this.lastWindowWidth!==window.innerWidth&&(window.innerWidth>992?this.open():this.close()),this.lastWindowWidth=window.innerWidth,this.lastWindowHeight=window.innerHeight}},{key:"_setupClasses",value:function(){"right"===this.options.edge&&(this.el.classList.add("right-aligned"),this.dragTarget.classList.add("right-aligned"))}},{key:"_removeClasses",value:function(){this.el.classList.remove("right-aligned"),this.dragTarget.classList.remove("right-aligned")}},{key:"_setupFixed",value:function(){this._isCurrentlyFixed()&&this.open()}},{key:"_isCurrentlyFixed",value:function(){return this.isFixed&&window.innerWidth>992}},{key:"_createDragTarget",value:function(){var t=document.createElement("div");t.classList.add("drag-target"),document.body.appendChild(t),this.dragTarget=t}},{key:"_preventBodyScrolling",value:function(){document.body.style.overflow="hidden"}},{key:"_enableBodyScrolling",value:function(){document.body.style.overflow=""}},{key:"open",value:function(){!0!==this.isOpen&&(this.isOpen=!0,"function"==typeof this.options.onOpenStart&&this.options.onOpenStart.call(this,this.el),this._isCurrentlyFixed()?(e.remove(this.el),e({targets:this.el,translateX:0,duration:0,easing:"easeOutQuad"}),this._enableBodyScrolling(),this._overlay.style.display="none"):(this.options.preventScrolling&&this._preventBodyScrolling(),this.isDragged&&1==this.percentOpen||this._animateIn()))}},{key:"close",value:function(){if(!1!==this.isOpen)if(this.isOpen=!1,"function"==typeof this.options.onCloseStart&&this.options.onCloseStart.call(this,this.el),this._isCurrentlyFixed()){var t="left"===this.options.edge?"-105%":"105%";this.el.style.transform="translateX("+t+")"}else this._enableBodyScrolling(),this.isDragged&&0==this.percentOpen?this._overlay.style.display="none":this._animateOut()}},{key:"_animateIn",value:function(){this._animateSidenavIn(),this._animateOverlayIn()}},{key:"_animateSidenavIn",value:function(){var t=this,i="left"===this.options.edge?-1:1;this.isDragged&&(i="left"===this.options.edge?i+this.percentOpen:i-this.percentOpen),e.remove(this.el),e({targets:this.el,translateX:[100*i+"%",0],duration:this.options.inDuration,easing:"easeOutQuad",complete:function(){"function"==typeof t.options.onOpenEnd&&t.options.onOpenEnd.call(t,t.el)}})}},{key:"_animateOverlayIn",value:function(){var i=0;this.isDragged?i=this.percentOpen:t(this._overlay).css({display:"block"}),e.remove(this._overlay),e({targets:this._overlay,opacity:[i,1],duration:this.options.inDuration,easing:"easeOutQuad"})}},{key:"_animateOut",value:function(){this._animateSidenavOut(),this._animateOverlayOut()}},{key:"_animateSidenavOut",value:function(){var t=this,i="left"===this.options.edge?-1:1,n=0;this.isDragged&&(n="left"===this.options.edge?i+this.percentOpen:i-this.percentOpen),e.remove(this.el),e({targets:this.el,translateX:[100*n+"%",105*i+"%"],duration:this.options.outDuration,easing:"easeOutQuad",complete:function(){"function"==typeof t.options.onCloseEnd&&t.options.onCloseEnd.call(t,t.el)}})}},{key:"_animateOverlayOut",value:function(){var i=this;e.remove(this._overlay),e({targets:this._overlay,opacity:0,duration:this.options.outDuration,easing:"easeOutQuad",complete:function(){t(i._overlay).css("display","none")}})}}],[{key:"init",value:function(t,e){return _get(s.__proto__||Object.getPrototypeOf(s),"init",this).call(this,this,t,e)}},{key:"getInstance",value:function(t){return(t.jquery?t[0]:t).M_Sidenav}},{key:"defaults",get:function(){return i}}]),s}();n._sidenavs=[],window.M.Sidenav=n,M.jQueryLoaded&&M.initializeJqueryWrapper(n,"sidenav","M_Sidenav")}(cash,M.anime),function(t,e){"use strict";var i={throttle:100,scrollOffset:200,activeClass:"active",getActiveElement:function(t){return'a[href="#'+t+'"]'}},n=function(n){function s(e,i){_classCallCheck(this,s);var n=_possibleConstructorReturn(this,(s.__proto__||Object.getPrototypeOf(s)).call(this,s,e,i));return n.el.M_ScrollSpy=n,n.options=t.extend({},s.defaults,i),s._elements.push(n),s._count++,s._increment++,n.tickId=-1,n.id=s._increment,n._setupEventHandlers(),n._handleWindowScroll(),n}return _inherits(s,Component),_createClass(s,[{key:"destroy",value:function(){s._elements.splice(s._elements.indexOf(this),1),s._elementsInView.splice(s._elementsInView.indexOf(this),1),s._visibleElements.splice(s._visibleElements.indexOf(this.$el),1),s._count--,this._removeEventHandlers(),t(this.options.getActiveElement(this.$el.attr("id"))).removeClass(this.options.activeClass),this.el.M_ScrollSpy=void 0}},{key:"_setupEventHandlers",value:function(){var t=M.throttle(this._handleWindowScroll,200);this._handleThrottledResizeBound=t.bind(this),this._handleWindowScrollBound=this._handleWindowScroll.bind(this),1===s._count&&(window.addEventListener("scroll",this._handleWindowScrollBound),window.addEventListener("resize",this._handleThrottledResizeBound),document.body.addEventListener("click",this._handleTriggerClick))}},{key:"_removeEventHandlers",value:function(){0===s._count&&(window.removeEventListener("scroll",this._handleWindowScrollBound),window.removeEventListener("resize",this._handleThrottledResizeBound),document.body.removeEventListener("click",this._handleTriggerClick))}},{key:"_handleTriggerClick",value:function(i){for(var n=t(i.target),o=s._elements.length-1;o>=0;o--){var a=s._elements[o];if(n.is('a[href="#'+a.$el.attr("id")+'"]')){i.preventDefault();var r=a.$el.offset().top+1;e({targets:[document.documentElement,document.body],scrollTop:r-a.options.scrollOffset,duration:400,easing:"easeOutCubic"});break}}}},{key:"_handleWindowScroll",value:function(){s._ticks++;for(var t=M.getDocumentScrollTop(),e=M.getDocumentScrollLeft(),i=e+window.innerWidth,n=t+window.innerHeight,o=s._findElements(t,i,n,e),a=0;a<o.length;a++){var r=o[a];r.tickId<0&&r._enter(),r.tickId=s._ticks}for(var l=0;l<s._elementsInView.length;l++){var h=s._elementsInView[l],d=h.tickId;d>=0&&d!==s._ticks&&(h._exit(),h.tickId=-1)}s._elementsInView=o}},{key:"_enter",value:function(){s._visibleElements=s._visibleElements.filter(function(t){return 0!=t.height()}),s._visibleElements[0]?(t(this.options.getActiveElement(s._visibleElements[0].attr("id"))).removeClass(this.options.activeClass),s._visibleElements[0][0].M_ScrollSpy&&this.id<s._visibleElements[0][0].M_ScrollSpy.id?s._visibleElements.unshift(this.$el):s._visibleElements.push(this.$el)):s._visibleElements.push(this.$el),t(this.options.getActiveElement(s._visibleElements[0].attr("id"))).addClass(this.options.activeClass)}},{key:"_exit",value:function(){var e=this;s._visibleElements=s._visibleElements.filter(function(t){return 0!=t.height()}),s._visibleElements[0]&&(t(this.options.getActiveElement(s._visibleElements[0].attr("id"))).removeClass(this.options.activeClass),s._visibleElements=s._visibleElements.filter(function(t){return t.attr("id")!=e.$el.attr("id")}),s._visibleElements[0]&&t(this.options.getActiveElement(s._visibleElements[0].attr("id"))).addClass(this.options.activeClass))}}],[{key:"init",value:function(t,e){return _get(s.__proto__||Object.getPrototypeOf(s),"init",this).call(this,this,t,e)}},{key:"getInstance",value:function(t){return(t.jquery?t[0]:t).M_ScrollSpy}},{key:"_findElements",value:function(t,e,i,n){for(var o=[],a=0;a<s._elements.length;a++){var r=s._elements[a],l=t+r.options.scrollOffset||200;if(r.$el.height()>0){var h=r.$el.offset().top,d=r.$el.offset().left,u=d+r.$el.width(),c=h+r.$el.height();!(d>e||u<n||h>i||c<l)&&o.push(r)}}return o}},{key:"defaults",get:function(){return i}}]),s}();n._elements=[],n._elementsInView=[],n._visibleElements=[],n._count=0,n._increment=0,n._ticks=0,M.ScrollSpy=n,M.jQueryLoaded&&M.initializeJqueryWrapper(n,"scrollSpy","M_ScrollSpy")}(cash,M.anime),function(t){"use strict";var e={data:{},limit:1/0,onAutocomplete:null,minLength:1,sortFunction:function(t,e,i){return t.indexOf(i)-e.indexOf(i)}},i=function(i){function n(e,i){_classCallCheck(this,n);var s=_possibleConstructorReturn(this,(n.__proto__||Object.getPrototypeOf(n)).call(this,n,e,i));return s.el.M_Autocomplete=s,s.options=t.extend({},n.defaults,i),s.isOpen=!1,s.count=0,s.activeIndex=-1,s.oldVal,s.$inputField=s.$el.closest(".input-field"),s.$active=t(),s._setupDropdown(),s._setupEventHandlers(),s}return _inherits(n,Component),_createClass(n,[{key:"destroy",value:function(){this._removeEventHandlers(),this._removeDropdown(),this.el.M_Autocomplete=void 0}},{key:"_setupEventHandlers",value:function(){this._handleInputBlurBound=this._handleInputBlur.bind(this),this._handleInputKeyupAndFocusBound=this._handleInputKeyupAndFocus.bind(this),this._handleInputKeydownBound=this._handleInputKeydown.bind(this),this._handleContainerMousedownAndTouchstartBound=this._handleContainerMousedownAndTouchstart.bind(this),this.el.addEventListener("blur",this._handleInputBlurBound),this.el.addEventListener("keyup",this._handleInputKeyupAndFocusBound),this.el.addEventListener("focus",this._handleInputKeyupAndFocusBound),this.el.addEventListener("keydown",this._handleInputKeydownBound),this.container.addEventListener("mousedown",this._handleContainerMousedownAndTouchstartBound),void 0!==window.ontouchstart&&this.container.addEventListener("touchstart",this._handleContainerMousedownAndTouchstartBound)}},{key:"_removeEventHandlers",value:function(){this.el.removeEventListener("blur",this._handleInputBlurBound),this.el.removeEventListener("keyup",this._handleInputKeyupAndFocusBound),this.el.removeEventListener("focus",this._handleInputKeyupAndFocusBound),this.el.removeEventListener("keydown",this._handleInputKeydownBound),this.container.removeEventListener("mousedown",this._handleContainerMousedownAndTouchstartBound),void 0!==window.ontouchstart&&this.container.removeEventListener("touchstart",this._handleContainerMousedownAndTouchstartBound)}},{key:"_setupDropdown",value:function(){this.container=document.createElement("ul"),this.container.id="autocomplete-options-"+M.guid(),t(this.container).addClass("autocomplete-content dropdown-content"),this.$inputField.append(this.container),this.el.setAttribute("data-target",this.container.id),this.dropdown=M.Dropdown.init(this.el,{autoFocus:!1,closeOnClick:!1,coverTrigger:!1}),this.el.removeEventListener("click",this.dropdown._handleClickBound)}},{key:"_removeDropdown",value:function(){this.container.parentNode.removeChild(this.container)}},{key:"_handleInputBlur",value:function(){this.dropdown.close(),this._resetAutocomplete()}},{key:"_handleInputKeyupAndFocus",value:function(t){var e=this;"keyup"===t.type&&(n._keydown=!1),this.count=0;var i=this.el.value.toLowerCase();13!==t.keyCode&&38!==t.keyCode&&40!==t.keyCode&&(this.oldVal!==i&&(this._resetAutocomplete(),i.length>=this.options.minLength&&(this.isOpen=!0,this._renderDropdown(this.options.data,i)),this.dropdown.isOpen?this.dropdown.recalculateDimensions():setTimeout(function(){e.dropdown.open()},100)),this.oldVal=i)}},{key:"_handleInputKeydown",value:function(e){n._keydown=!0;var i=e.keyCode,s=void 0,o=t(this.container).children("li").length;13===i&&this.activeIndex>=0?(s=t(this.container).children("li").eq(this.activeIndex)).length&&(this.selectOption(s),e.preventDefault()):38!==i&&40!==i||(e.preventDefault(),38===i&&this.activeIndex>0&&this.activeIndex--,40===i&&this.activeIndex<o-1&&this.activeIndex++,this.$active.removeClass("active"),this.activeIndex>=0&&(this.$active=t(this.container).children("li").eq(this.activeIndex),this.$active.addClass("active")))}},{key:"_handleContainerMousedownAndTouchstart",value:function(e){var i=t(e.target).closest("li");this.selectOption(i)}},{key:"_highlight",value:function(t,e){var i=e.find("img"),n=e.text().toLowerCase().indexOf(""+t.toLowerCase()),s=n+t.length-1,o=e.text().slice(0,n),a=e.text().slice(n,s+1),r=e.text().slice(s+1);e.html("<span>"+o+"<span class='highlight'>"+a+"</span>"+r+"</span>"),i.length&&e.prepend(i)}},{key:"_resetCurrentElement",value:function(){this.activeIndex=-1,this.$active.removeClass("active")}},{key:"_resetAutocomplete",value:function(){t(this.container).empty(),this._resetCurrentElement(),this.oldVal=null,this.isOpen=!1}},{key:"selectOption",value:function(t){var e=t.text().trim();this.el.value=e,this.$el.trigger("change"),this._resetAutocomplete(),this.dropdown.close(),"function"==typeof this.options.onAutocomplete&&this.options.onAutocomplete.call(this,e)}},{key:"_renderDropdown",value:function(e,i){var n=this;this._resetAutocomplete();var s=[];for(var o in e)if(e.hasOwnProperty(o)&&-1!==o.toLowerCase().indexOf(i)){if(this.count>=this.options.limit)break;var a={data:e[o],key:o};s.push(a),this.count++}s.sort(function(t,e){return n.options.sortFunction(t.key.toLowerCase(),e.key.toLowerCase(),i.toLowerCase())});for(var r=0;r<s.length;r++){var l=s[r],h=t("<li></li>");l.data?h.append('<img src="'+l.data+'" class="right circle"><span>'+l.key+"</span>"):h.append("<span>"+l.key+"</span>"),t(this.container).append(h),this._highlight(i,h)}}},{key:"updateData",value:function(t){var e=this.el.value.toLowerCase();this.options.data=t,this.isOpen&&this._renderDropdown(t,e)}}],[{key:"init",value:function(t,e){return _get(n.__proto__||Object.getPrototypeOf(n),"init",this).call(this,this,t,e)}},{key:"getInstance",value:function(t){return(t.jquery?t[0]:t).M_Autocomplete}},{key:"defaults",get:function(){return e}}]),n}();i._keydown=!1,M.Autocomplete=i,M.jQueryLoaded&&M.initializeJqueryWrapper(i,"autocomplete","M_Autocomplete")}(cash),function(t){M.updateTextFields=function(){t("input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], input[type=search], input[type=date], input[type=time], textarea").each(function(e,i){var n=t(this);e.value.length>0||t(e).is(":focus")||e.autofocus||null!==n.attr("placeholder")?n.siblings("label").addClass("active"):e.validity?n.siblings("label").toggleClass("active",!0===e.validity.badInput):n.siblings("label").removeClass("active")})},M.validate_field=function(t){var e=null!==t.attr("data-length"),i=parseInt(t.attr("data-length")),n=t[0].value.length;0!==n||!1!==t[0].validity.badInput||t.is(":required")?t.hasClass("validate")&&(t.is(":valid")&&e&&n<=i||t.is(":valid")&&!e?(t.removeClass("invalid"),t.addClass("valid")):(t.removeClass("valid"),t.addClass("invalid"))):t.hasClass("validate")&&(t.removeClass("valid"),t.removeClass("invalid"))},M.textareaAutoResize=function(e){if(e instanceof Element&&(e=t(e)),e.length){var i=t(".hiddendiv").first();i.length||(i=t('<div class="hiddendiv common"></div>'),t("body").append(i));var n=e.css("font-family"),s=e.css("font-size"),o=e.css("line-height"),a=e.css("padding-top"),r=e.css("padding-right"),l=e.css("padding-bottom"),h=e.css("padding-left");s&&i.css("font-size",s),n&&i.css("font-family",n),o&&i.css("line-height",o),a&&i.css("padding-top",a),r&&i.css("padding-right",r),l&&i.css("padding-bottom",l),h&&i.css("padding-left",h),e.data("original-height")||e.data("original-height",e.height()),"off"===e.attr("wrap")&&i.css("overflow-wrap","normal").css("white-space","pre"),i.text(e[0].value+"\n");var d=i.html().replace(/\n/g,"<br>");i.html(d),e[0].offsetWidth>0&&e[0].offsetHeight>0?i.css("width",e.width()+"px"):i.css("width",window.innerWidth/2+"px"),e.data("original-height")<=i.innerHeight()?e.css("height",i.innerHeight()+"px"):e[0].value.length<e.data("previous-length")&&e.css("height",e.data("original-height")+"px"),e.data("previous-length",e[0].value.length)}else console.error("No textarea element found")},t(document).ready(function(){var e="input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], input[type=search], input[type=date], input[type=time], textarea";t(document).on("change",e,function(){0===this.value.length&&null===t(this).attr("placeholder")||t(this).siblings("label").addClass("active"),M.validate_field(t(this))}),t(document).ready(function(){M.updateTextFields()}),t(document).on("reset",function(i){var n=t(i.target);n.is("form")&&(n.find(e).removeClass("valid").removeClass("invalid"),n.find(e).each(function(e){this.value.length&&t(this).siblings("label").removeClass("active")}),setTimeout(function(){n.find("select").each(function(){if(this.M_FormSelect){var e=t(this).find("option[selected]").text();t(this).siblings("input.select-dropdown")[0].value=e}})},0))}),document.addEventListener("focus",function(i){t(i.target).is(e)&&t(i.target).siblings("label, .prefix").addClass("active")},!0),document.addEventListener("blur",function(i){var n=t(i.target);if(n.is(e)){var s=".prefix";0===n[0].value.length&&!0!==n[0].validity.badInput&&null===n.attr("placeholder")&&(s+=", label"),n.siblings(s).removeClass("active"),M.validate_field(n)}},!0);t(document).on("keyup","input[type=radio], input[type=checkbox]",function(e){if(e.which===M.keys.TAB)return t(this).addClass("tabbed"),void t(this).one("blur",function(e){t(this).removeClass("tabbed")})});t(".materialize-textarea").each(function(){var e=t(this);e.data("original-height",e.height()),e.data("previous-length",this.value.length),M.textareaAutoResize(e)}),t(document).on("keyup",".materialize-textarea",function(){M.textareaAutoResize(t(this))}),t(document).on("keydown",".materialize-textarea",function(){M.textareaAutoResize(t(this))}),t(document).on("change",'.file-field input[type="file"]',function(){for(var e=t(this).closest(".file-field").find("input.file-path"),i=t(this)[0].files,n=[],s=0;s<i.length;s++)n.push(i[s].name);e[0].value=n.join(", "),e.trigger("change")})})}(cash),function(t,e){"use strict";var i={indicators:!0,height:400,duration:500,interval:6e3},n=function(n){function s(i,n){_classCallCheck(this,s);var o=_possibleConstructorReturn(this,(s.__proto__||Object.getPrototypeOf(s)).call(this,s,i,n));return o.el.M_Slider=o,o.options=t.extend({},s.defaults,n),o.$slider=o.$el.find(".slides"),o.$slides=o.$slider.children("li"),o.activeIndex=o.$slides.filter(function(e){return t(e).hasClass("active")}).first().index(),-1!=o.activeIndex&&(o.$active=o.$slides.eq(o.activeIndex)),o._setSliderHeight(),o.$slides.find(".caption").each(function(t){o._animateCaptionIn(t,0)}),o.$slides.find("img").each(function(e){var i="data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";t(e).attr("src")!==i&&(t(e).css("background-image",'url("'+t(e).attr("src")+'")'),t(e).attr("src",i))}),o._setupIndicators(),o.$active?o.$active.css("display","block"):(o.$slides.first().addClass("active"),e({targets:o.$slides.first()[0],opacity:1,duration:o.options.duration,easing:"easeOutQuad"}),o.activeIndex=0,o.$active=o.$slides.eq(o.activeIndex),o.options.indicators&&o.$indicators.eq(o.activeIndex).addClass("active")),o.$active.find("img").each(function(t){e({targets:o.$active.find(".caption")[0],opacity:1,translateX:0,translateY:0,duration:o.options.duration,easing:"easeOutQuad"})}),o._setupEventHandlers(),o.start(),o}return _inherits(s,Component),_createClass(s,[{key:"destroy",value:function(){this.pause(),this._removeIndicators(),this._removeEventHandlers(),this.el.M_Slider=void 0}},{key:"_setupEventHandlers",value:function(){var t=this;this._handleIntervalBound=this._handleInterval.bind(this),this._handleIndicatorClickBound=this._handleIndicatorClick.bind(this),this.options.indicators&&this.$indicators.each(function(e){e.addEventListener("click",t._handleIndicatorClickBound)})}},{key:"_removeEventHandlers",value:function(){var t=this;this.options.indicators&&this.$indicators.each(function(e){e.removeEventListener("click",t._handleIndicatorClickBound)})}},{key:"_handleIndicatorClick",value:function(e){var i=t(e.target).index();this.set(i)}},{key:"_handleInterval",value:function(){var t=this.$slider.find(".active").index();this.$slides.length===t+1?t=0:t+=1,this.set(t)}},{key:"_animateCaptionIn",value:function(i,n){var s={targets:i,opacity:0,duration:n,easing:"easeOutQuad"};t(i).hasClass("center-align")?s.translateY=-100:t(i).hasClass("right-align")?s.translateX=100:t(i).hasClass("left-align")&&(s.translateX=-100),e(s)}},{key:"_setSliderHeight",value:function(){this.$el.hasClass("fullscreen")||(this.options.indicators?this.$el.css("height",this.options.height+40+"px"):this.$el.css("height",this.options.height+"px"),this.$slider.css("height",this.options.height+"px"))}},{key:"_setupIndicators",value:function(){var e=this;this.options.indicators&&(this.$indicators=t('<ul class="indicators"></ul>'),this.$slides.each(function(i,n){var s=t('<li class="indicator-item"></li>');e.$indicators.append(s[0])}),this.$el.append(this.$indicators[0]),this.$indicators=this.$indicators.children("li.indicator-item"))}},{key:"_removeIndicators",value:function(){this.$el.find("ul.indicators").remove()}},{key:"set",value:function(t){var i=this;if(t>=this.$slides.length?t=0:t<0&&(t=this.$slides.length-1),this.activeIndex!=t){this.$active=this.$slides.eq(this.activeIndex);var n=this.$active.find(".caption");this.$active.removeClass("active"),e({targets:this.$active[0],opacity:0,duration:this.options.duration,easing:"easeOutQuad",complete:function(){i.$slides.not(".active").each(function(t){e({targets:t,opacity:0,translateX:0,translateY:0,duration:0,easing:"easeOutQuad"})})}}),this._animateCaptionIn(n[0],this.options.duration),this.options.indicators&&(this.$indicators.eq(this.activeIndex).removeClass("active"),this.$indicators.eq(t).addClass("active")),e({targets:this.$slides.eq(t)[0],opacity:1,duration:this.options.duration,easing:"easeOutQuad"}),e({targets:this.$slides.eq(t).find(".caption")[0],opacity:1,translateX:0,translateY:0,duration:this.options.duration,delay:this.options.duration,easing:"easeOutQuad"}),this.$slides.eq(t).addClass("active"),this.activeIndex=t,this.start()}}},{key:"pause",value:function(){clearInterval(this.interval)}},{key:"start",value:function(){clearInterval(this.interval),this.interval=setInterval(this._handleIntervalBound,this.options.duration+this.options.interval)}},{key:"next",value:function(){var t=this.activeIndex+1;t>=this.$slides.length?t=0:t<0&&(t=this.$slides.length-1),this.set(t)}},{key:"prev",value:function(){var t=this.activeIndex-1;t>=this.$slides.length?t=0:t<0&&(t=this.$slides.length-1),this.set(t)}}],[{key:"init",value:function(t,e){return _get(s.__proto__||Object.getPrototypeOf(s),"init",this).call(this,this,t,e)}},{key:"getInstance",value:function(t){return(t.jquery?t[0]:t).M_Slider}},{key:"defaults",get:function(){return i}}]),s}();M.Slider=n,M.jQueryLoaded&&M.initializeJqueryWrapper(n,"slider","M_Slider")}(cash,M.anime),function(t,e){t(document).on("click",".card",function(i){if(t(this).children(".card-reveal").length){var n=t(i.target).closest(".card");void 0===n.data("initialOverflow")&&n.data("initialOverflow",void 0===n.css("overflow")?"":n.css("overflow"));var s=t(this).find(".card-reveal");t(i.target).is(t(".card-reveal .card-title"))||t(i.target).is(t(".card-reveal .card-title i"))?e({targets:s[0],translateY:0,duration:225,easing:"easeInOutQuad",complete:function(e){var i=e.animatables[0].target;t(i).css({display:"none"}),n.css("overflow",n.data("initialOverflow"))}}):(t(i.target).is(t(".card .activator"))||t(i.target).is(t(".card .activator i")))&&(n.css("overflow","hidden"),s.css({display:"block"}),e({targets:s[0],translateY:"-100%",duration:300,easing:"easeInOutQuad"}))}})}(cash,M.anime),function(t){"use strict";var e={data:[],placeholder:"",secondaryPlaceholder:"",autocompleteOptions:{},limit:1/0,onChipAdd:null,onChipSelect:null,onChipDelete:null},i=function(i){function n(e,i){_classCallCheck(this,n);var s=_possibleConstructorReturn(this,(n.__proto__||Object.getPrototypeOf(n)).call(this,n,e,i));return s.el.M_Chips=s,s.options=t.extend({},n.defaults,i),s.$el.addClass("chips input-field"),s.chipsData=[],s.$chips=t(),s._setupInput(),s.hasAutocomplete=Object.keys(s.options.autocompleteOptions).length>0,s.$input.attr("id")||s.$input.attr("id",M.guid()),s.options.data.length&&(s.chipsData=s.options.data,s._renderChips(s.chipsData)),s.hasAutocomplete&&s._setupAutocomplete(),s._setPlaceholder(),s._setupLabel(),s._setupEventHandlers(),s}return _inherits(n,Component),_createClass(n,[{key:"getData",value:function(){return this.chipsData}},{key:"destroy",value:function(){this._removeEventHandlers(),this.$chips.remove(),this.el.M_Chips=void 0}},{key:"_setupEventHandlers",value:function(){this._handleChipClickBound=this._handleChipClick.bind(this),this._handleInputKeydownBound=this._handleInputKeydown.bind(this),this._handleInputFocusBound=this._handleInputFocus.bind(this),this._handleInputBlurBound=this._handleInputBlur.bind(this),this.el.addEventListener("click",this._handleChipClickBound),document.addEventListener("keydown",n._handleChipsKeydown),document.addEventListener("keyup",n._handleChipsKeyup),this.el.addEventListener("blur",n._handleChipsBlur,!0),this.$input[0].addEventListener("focus",this._handleInputFocusBound),this.$input[0].addEventListener("blur",this._handleInputBlurBound),this.$input[0].addEventListener("keydown",this._handleInputKeydownBound)}},{key:"_removeEventHandlers",value:function(){this.el.removeEventListener("click",this._handleChipClickBound),document.removeEventListener("keydown",n._handleChipsKeydown),document.removeEventListener("keyup",n._handleChipsKeyup),this.el.removeEventListener("blur",n._handleChipsBlur,!0),this.$input[0].removeEventListener("focus",this._handleInputFocusBound),this.$input[0].removeEventListener("blur",this._handleInputBlurBound),this.$input[0].removeEventListener("keydown",this._handleInputKeydownBound)}},{key:"_handleChipClick",value:function(e){var i=t(e.target).closest(".chip"),n=t(e.target).is(".close");if(i.length){var s=i.index();n?(this.deleteChip(s),this.$input[0].focus()):this.selectChip(s)}else this.$input[0].focus()}},{key:"_handleInputFocus",value:function(){this.$el.addClass("focus")}},{key:"_handleInputBlur",value:function(){this.$el.removeClass("focus")}},{key:"_handleInputKeydown",value:function(t){if(n._keydown=!0,13===t.keyCode){if(this.hasAutocomplete&&this.autocomplete&&this.autocomplete.isOpen)return;t.preventDefault(),this.addChip({tag:this.$input[0].value}),this.$input[0].value=""}else 8!==t.keyCode&&37!==t.keyCode||""!==this.$input[0].value||!this.chipsData.length||(t.preventDefault(),this.selectChip(this.chipsData.length-1))}},{key:"_renderChip",value:function(e){if(e.tag){var i=document.createElement("div"),n=document.createElement("i");if(i.classList.add("chip"),i.textContent=e.tag,i.setAttribute("tabindex",0),t(n).addClass("material-icons close"),n.textContent="close",e.image){var s=document.createElement("img");s.setAttribute("src",e.image),i.insertBefore(s,i.firstChild)}return i.appendChild(n),i}}},{key:"_renderChips",value:function(){this.$chips.remove();for(var t=0;t<this.chipsData.length;t++){var e=this._renderChip(this.chipsData[t]);this.$el.append(e),this.$chips.add(e)}this.$el.append(this.$input[0])}},{key:"_setupAutocomplete",value:function(){var t=this;this.options.autocompleteOptions.onAutocomplete=function(e){t.addChip({tag:e}),t.$input[0].value="",t.$input[0].focus()},this.autocomplete=M.Autocomplete.init(this.$input[0],this.options.autocompleteOptions)}},{key:"_setupInput",value:function(){this.$input=this.$el.find("input"),this.$input.length||(this.$input=t("<input></input>"),this.$el.append(this.$input)),this.$input.addClass("input")}},{key:"_setupLabel",value:function(){this.$label=this.$el.find("label"),this.$label.length&&this.$label.setAttribute("for",this.$input.attr("id"))}},{key:"_setPlaceholder",value:function(){void 0!==this.chipsData&&!this.chipsData.length&&this.options.placeholder?t(this.$input).prop("placeholder",this.options.placeholder):(void 0===this.chipsData||this.chipsData.length)&&this.options.secondaryPlaceholder&&t(this.$input).prop("placeholder",this.options.secondaryPlaceholder)}},{key:"_isValid",value:function(t){if(t.hasOwnProperty("tag")&&""!==t.tag){for(var e=!1,i=0;i<this.chipsData.length;i++)if(this.chipsData[i].tag===t.tag){e=!0;break}return!e}return!1}},{key:"addChip",value:function(e){if(this._isValid(e)&&!(this.chipsData.length>=this.options.limit)){var i=this._renderChip(e);this.$chips.add(i),this.chipsData.push(e),t(this.$input).before(i),this._setPlaceholder(),"function"==typeof this.options.onChipAdd&&this.options.onChipAdd.call(this,this.$el,i)}}},{key:"deleteChip",value:function(e){var i=this.$chips.eq(e);this.$chips.eq(e).remove(),this.$chips=this.$chips.filter(function(e){return t(e).index()>=0}),this.chipsData.splice(e,1),this._setPlaceholder(),"function"==typeof this.options.onChipDelete&&this.options.onChipDelete.call(this,this.$el,i[0])}},{key:"selectChip",value:function(t){var e=this.$chips.eq(t);this._selectedChip=e,e[0].focus(),"function"==typeof this.options.onChipSelect&&this.options.onChipSelect.call(this,this.$el,e[0])}}],[{key:"init",value:function(t,e){return _get(n.__proto__||Object.getPrototypeOf(n),"init",this).call(this,this,t,e)}},{key:"getInstance",value:function(t){return(t.jquery?t[0]:t).M_Chips}},{key:"_handleChipsKeydown",value:function(e){n._keydown=!0;var i=t(e.target).closest(".chips"),s=e.target&&i.length;if(!t(e.target).is("input, textarea")&&s){var o=i[0].M_Chips;if(8===e.keyCode||46===e.keyCode){e.preventDefault();var a=o.chipsData.length;if(o._selectedChip){var r=o._selectedChip.index();o.deleteChip(r),o._selectedChip=null,a=Math.max(r-1,0)}o.chipsData.length&&o.selectChip(a)}else if(37===e.keyCode){if(o._selectedChip){var l=o._selectedChip.index()-1;if(l<0)return;o.selectChip(l)}}else if(39===e.keyCode&&o._selectedChip){var h=o._selectedChip.index()+1;h>=o.chipsData.length?o.$input[0].focus():o.selectChip(h)}}}},{key:"_handleChipsKeyup",value:function(t){n._keydown=!1}},{key:"_handleChipsBlur",value:function(e){n._keydown||(t(e.target).closest(".chips")[0].M_Chips._selectedChip=null)}},{key:"defaults",get:function(){return e}}]),n}();i._keydown=!1,M.Chips=i,M.jQueryLoaded&&M.initializeJqueryWrapper(i,"chips","M_Chips"),t(document).ready(function(){t(document.body).on("click",".chip .close",function(){var e=t(this).closest(".chips");e.length&&e[0].M_Chips||t(this).closest(".chip").remove()})})}(cash),function(t){"use strict";var e={top:0,bottom:1/0,offset:0,onPositionChange:null},i=function(i){function n(e,i){_classCallCheck(this,n);var s=_possibleConstructorReturn(this,(n.__proto__||Object.getPrototypeOf(n)).call(this,n,e,i));return s.el.M_Pushpin=s,s.options=t.extend({},n.defaults,i),s.originalOffset=s.el.offsetTop,n._pushpins.push(s),s._setupEventHandlers(),s._updatePosition(),s}return _inherits(n,Component),_createClass(n,[{key:"destroy",value:function(){this.el.style.top=null,this._removePinClasses(),this._removeEventHandlers();var t=n._pushpins.indexOf(this);n._pushpins.splice(t,1)}},{key:"_setupEventHandlers",value:function(){document.addEventListener("scroll",n._updateElements)}},{key:"_removeEventHandlers",value:function(){document.removeEventListener("scroll",n._updateElements)}},{key:"_updatePosition",value:function(){var t=M.getDocumentScrollTop()+this.options.offset;this.options.top<=t&&this.options.bottom>=t&&!this.el.classList.contains("pinned")&&(this._removePinClasses(),this.el.style.top=this.options.offset+"px",this.el.classList.add("pinned"),"function"==typeof this.options.onPositionChange&&this.options.onPositionChange.call(this,"pinned")),t<this.options.top&&!this.el.classList.contains("pin-top")&&(this._removePinClasses(),this.el.style.top=0,this.el.classList.add("pin-top"),"function"==typeof this.options.onPositionChange&&this.options.onPositionChange.call(this,"pin-top")),t>this.options.bottom&&!this.el.classList.contains("pin-bottom")&&(this._removePinClasses(),this.el.classList.add("pin-bottom"),this.el.style.top=this.options.bottom-this.originalOffset+"px","function"==typeof this.options.onPositionChange&&this.options.onPositionChange.call(this,"pin-bottom"))}},{key:"_removePinClasses",value:function(){this.el.classList.remove("pin-top","pinned","pin-bottom")}}],[{key:"init",value:function(t,e){return _get(n.__proto__||Object.getPrototypeOf(n),"init",this).call(this,this,t,e)}},{key:"getInstance",value:function(t){return(t.jquery?t[0]:t).M_Pushpin}},{key:"_updateElements",value:function(){for(var t in n._pushpins)n._pushpins[t]._updatePosition()}},{key:"defaults",get:function(){return e}}]),n}();i._pushpins=[],M.Pushpin=i,M.jQueryLoaded&&M.initializeJqueryWrapper(i,"pushpin","M_Pushpin")}(cash),function(t,e){"use strict";var i={direction:"top",hoverEnabled:!0,toolbarEnabled:!1};t.fn.reverse=[].reverse;var n=function(n){function s(e,i){_classCallCheck(this,s);var n=_possibleConstructorReturn(this,(s.__proto__||Object.getPrototypeOf(s)).call(this,s,e,i));return n.el.M_FloatingActionButton=n,n.options=t.extend({},s.defaults,i),n.isOpen=!1,n.$anchor=n.$el.children("a").first(),n.$menu=n.$el.children("ul").first(),n.$floatingBtns=n.$el.find("ul .btn-floating"),n.$floatingBtnsReverse=n.$el.find("ul .btn-floating").reverse(),n.offsetY=0,n.offsetX=0,"top"===n.options.direction?(n.$el.addClass("direction-top"),n.offsetY=40):"right"===n.options.direction?(n.$el.addClass("direction-right"),n.offsetX=-40):"bottom"===n.options.direction?(n.$el.addClass("direction-bottom"),n.offsetY=-40):(n.$el.addClass("direction-left"),n.offsetX=40),n._setupEventHandlers(),n}return _inherits(s,Component),_createClass(s,[{key:"destroy",value:function(){this._removeEventHandlers(),this.el.M_FloatingActionButton=void 0}},{key:"_setupEventHandlers",value:function(){this._handleFABClickBound=this._handleFABClick.bind(this),this._handleOpenBound=this.open.bind(this),this._handleCloseBound=this.close.bind(this),this.options.hoverEnabled&&!this.options.toolbarEnabled?(this.el.addEventListener("mouseenter",this._handleOpenBound),this.el.addEventListener("mouseleave",this._handleCloseBound)):this.el.addEventListener("click",this._handleFABClickBound)}},{key:"_removeEventHandlers",value:function(){this.options.hoverEnabled&&!this.options.toolbarEnabled?(this.el.removeEventListener("mouseenter",this._handleOpenBound),this.el.removeEventListener("mouseleave",this._handleCloseBound)):this.el.removeEventListener("click",this._handleFABClickBound)}},{key:"_handleFABClick",value:function(){this.isOpen?this.close():this.open()}},{key:"_handleDocumentClick",value:function(e){t(e.target).closest(this.$menu).length||this.close()}},{key:"open",value:function(){this.isOpen||(this.options.toolbarEnabled?this._animateInToolbar():this._animateInFAB(),this.isOpen=!0)}},{key:"close",value:function(){this.isOpen&&(this.options.toolbarEnabled?(window.removeEventListener("scroll",this._handleCloseBound,!0),document.body.removeEventListener("click",this._handleDocumentClickBound,!0),this._animateOutToolbar()):this._animateOutFAB(),this.isOpen=!1)}},{key:"_animateInFAB",value:function(){var t=this;this.$el.addClass("active");var i=0;this.$floatingBtnsReverse.each(function(n){e({targets:n,opacity:1,scale:[.4,1],translateY:[t.offsetY,0],translateX:[t.offsetX,0],duration:275,delay:i,easing:"easeInOutQuad"}),i+=40})}},{key:"_animateOutFAB",value:function(){var t=this;this.$floatingBtnsReverse.each(function(i){e.remove(i),e({targets:i,opacity:0,scale:.4,translateY:t.offsetY,translateX:t.offsetX,duration:175,easing:"easeOutQuad",complete:function(){t.$el.removeClass("active")}})})}},{key:"_animateInToolbar",value:function(){var e=this,i=void 0,n=window.innerWidth,s=window.innerHeight,o=this.el.getBoundingClientRect(),a=t('<div class="fab-backdrop"></div>'),r=this.$anchor.css("background-color");this.$anchor.append(a),this.offsetX=o.left-n/2+o.width/2,this.offsetY=s-o.bottom,i=n/a[0].clientWidth,this.btnBottom=o.bottom,this.btnLeft=o.left,this.btnWidth=o.width,this.$el.addClass("active"),this.$el.css({"text-align":"center",width:"100%",bottom:0,left:0,transform:"translateX("+this.offsetX+"px)",transition:"none"}),this.$anchor.css({transform:"translateY("+-this.offsetY+"px)",transition:"none"}),a.css({"background-color":r}),setTimeout(function(){e.$el.css({transform:"",transition:"transform .2s cubic-bezier(0.550, 0.085, 0.680, 0.530), background-color 0s linear .2s"}),e.$anchor.css({overflow:"visible",transform:"",transition:"transform .2s"}),setTimeout(function(){e.$el.css({overflow:"hidden","background-color":r}),a.css({transform:"scale("+i+")",transition:"transform .2s cubic-bezier(0.550, 0.055, 0.675, 0.190)"}),e.$menu.children("li").children("a").css({opacity:1}),e._handleDocumentClickBound=e._handleDocumentClick.bind(e),window.addEventListener("scroll",e._handleCloseBound,!0),document.body.addEventListener("click",e._handleDocumentClickBound,!0)},100)},0)}},{key:"_animateOutToolbar",value:function(){var t=this,e=window.innerWidth,i=window.innerHeight,n=this.$el.find(".fab-backdrop"),s=this.$anchor.css("background-color");this.offsetX=this.btnLeft-e/2+this.btnWidth/2,this.offsetY=i-this.btnBottom,this.$el.removeClass("active"),this.$el.css({"background-color":"transparent",transition:"none"}),this.$anchor.css({transition:"none"}),n.css({transform:"scale(0)","background-color":s}),this.$menu.children("li").children("a").css({opacity:""}),setTimeout(function(){n.remove(),t.$el.css({"text-align":"",width:"",bottom:"",left:"",overflow:"","background-color":"",transform:"translate3d("+-t.offsetX+"px,0,0)"}),t.$anchor.css({overflow:"",transform:"translate3d(0,"+t.offsetY+"px,0)"}),setTimeout(function(){t.$el.css({transform:"translate3d(0,0,0)",transition:"transform .2s"}),t.$anchor.css({transform:"translate3d(0,0,0)",transition:"transform .2s cubic-bezier(0.550, 0.055, 0.675, 0.190)"})},20)},200)}}],[{key:"init",value:function(t,e){return _get(s.__proto__||Object.getPrototypeOf(s),"init",this).call(this,this,t,e)}},{key:"getInstance",value:function(t){return(t.jquery?t[0]:t).M_FloatingActionButton}},{key:"defaults",get:function(){return i}}]),s}();M.FloatingActionButton=n,M.jQueryLoaded&&M.initializeJqueryWrapper(n,"floatingActionButton","M_FloatingActionButton")}(cash,M.anime),function(t){"use strict";var e={format:"mmm dd, yyyy",parse:null,defaultDate:null,setDefaultDate:!1,disableWeekends:!1,disableDayFn:null,firstDay:0,minDate:null,maxDate:null,yearRange:10,minYear:0,maxYear:9999,minMonth:void 0,maxMonth:void 0,startRange:null,endRange:null,isRTL:!1,showMonthAfterYear:!1,showDaysInNextAndPreviousMonths:!1,container:null,showClearBtn:!1,i18n:{cancel:"Cancel",clear:"Clear",done:"Ok",previousMonth:"‹",nextMonth:"›",months:["January","February","March","April","May","June","July","August","September","October","November","December"],monthsShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],weekdays:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],weekdaysShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],weekdaysAbbrev:["S","M","T","W","T","F","S"]},events:[],onSelect:null,onOpen:null,onClose:null,onDraw:null},i=function(i){function n(e,i){_classCallCheck(this,n);var s=_possibleConstructorReturn(this,(n.__proto__||Object.getPrototypeOf(n)).call(this,n,e,i));s.el.M_Datepicker=s,s.options=t.extend({},n.defaults,i),i&&i.hasOwnProperty("i18n")&&"object"==typeof i.i18n&&(s.options.i18n=t.extend({},n.defaults.i18n,i.i18n)),s.options.minDate&&s.options.minDate.setHours(0,0,0,0),s.options.maxDate&&s.options.maxDate.setHours(0,0,0,0),s.id=M.guid(),s._setupVariables(),s._insertHTMLIntoDOM(),s._setupModal(),s._setupEventHandlers(),s.options.defaultDate||(s.options.defaultDate=new Date(Date.parse(s.el.value)),s.options.setDefaultDate=!0);var o=s.options.defaultDate;return n._isDate(o)?s.options.setDefaultDate?s.setDate(o,!0):s.gotoDate(o):s.gotoDate(new Date),s.isOpen=!1,s}return _inherits(n,Component),_createClass(n,[{key:"destroy",value:function(){this._removeEventHandlers(),this.modal.destroy(),t(this.modalEl).remove(),this.destroySelects(),this.el.M_Datepicker=void 0}},{key:"destroySelects",value:function(){var t=this.calendarEl.querySelector(".pika-select-year");t&&M.FormSelect.getInstance(t).destroy();var e=this.calendarEl.querySelector(".pika-select-month");e&&M.FormSelect.getInstance(e).destroy()}},{key:"_insertHTMLIntoDOM",value:function(){this.options.showClearBtn&&(t(this.clearBtn).css({visibility:""}),this.clearBtn.innerHTML=this.options.i18n.clear),this.doneBtn.innerHTML=this.options.i18n.done,this.cancelBtn.innerHTML=this.options.i18n.cancel,this.options.container?this.$modalEl.appendTo(this.options.container):this.$modalEl.insertBefore(this.el)}},{key:"_setupModal",value:function(){var t=this;this.modalEl.id="modal-"+this.id,this.modal=M.Modal.init(this.modalEl,{onCloseEnd:function(){t.isOpen=!1}})}},{key:"toString",value:function(t){var e=this;return t=t||this.options.format,n._isDate(this.date)?t.split(/(d{1,4}|m{1,4}|y{4}|yy|!.)/g).map(function(t){return e.formats[t]?e.formats[t]():t}).join(""):""}},{key:"setDate",value:function(t,e){if(!t)return this.date=null,this._renderDateDisplay(),this.draw();if("string"==typeof t&&(t=new Date(Date.parse(t))),n._isDate(t)){var i=this.options.minDate,s=this.options.maxDate;n._isDate(i)&&t<i?t=i:n._isDate(s)&&t>s&&(t=s),this.date=new Date(t.getTime()),this._renderDateDisplay(),n._setToStartOfDay(this.date),this.gotoDate(this.date),e||"function"!=typeof this.options.onSelect||this.options.onSelect.call(this,this.date)}}},{key:"setInputValue",value:function(){this.el.value=this.toString(),this.$el.trigger("change",{firedBy:this})}},{key:"_renderDateDisplay",value:function(){var t=n._isDate(this.date)?this.date:new Date,e=this.options.i18n,i=e.weekdaysShort[t.getDay()],s=e.monthsShort[t.getMonth()],o=t.getDate();this.yearTextEl.innerHTML=t.getFullYear(),this.dateTextEl.innerHTML=i+", "+s+" "+o}},{key:"gotoDate",value:function(t){var e=!0;if(n._isDate(t)){if(this.calendars){var i=new Date(this.calendars[0].year,this.calendars[0].month,1),s=new Date(this.calendars[this.calendars.length-1].year,this.calendars[this.calendars.length-1].month,1),o=t.getTime();s.setMonth(s.getMonth()+1),s.setDate(s.getDate()-1),e=o<i.getTime()||s.getTime()<o}e&&(this.calendars=[{month:t.getMonth(),year:t.getFullYear()}]),this.adjustCalendars()}}},{key:"adjustCalendars",value:function(){this.calendars[0]=this.adjustCalendar(this.calendars[0]),this.draw()}},{key:"adjustCalendar",value:function(t){return t.month<0&&(t.year-=Math.ceil(Math.abs(t.month)/12),t.month+=12),t.month>11&&(t.year+=Math.floor(Math.abs(t.month)/12),t.month-=12),t}},{key:"nextMonth",value:function(){this.calendars[0].month++,this.adjustCalendars()}},{key:"prevMonth",value:function(){this.calendars[0].month--,this.adjustCalendars()}},{key:"render",value:function(t,e,i){var s=this.options,o=new Date,a=n._getDaysInMonth(t,e),r=new Date(t,e,1).getDay(),l=[],h=[];n._setToStartOfDay(o),s.firstDay>0&&(r-=s.firstDay)<0&&(r+=7);for(var d=0===e?11:e-1,u=11===e?0:e+1,c=0===e?t-1:t,p=11===e?t+1:t,v=n._getDaysInMonth(c,d),f=a+r,m=f;m>7;)m-=7;f+=7-m;for(var g=!1,_=0,y=0;_<f;_++){var k=new Date(t,e,_-r+1),b=!!n._isDate(this.date)&&n._compareDates(k,this.date),w=n._compareDates(k,o),C=-1!==s.events.indexOf(k.toDateString()),E=_<r||_>=a+r,M=_-r+1,x=e,O=t,T=s.startRange&&n._compareDates(s.startRange,k),L=s.endRange&&n._compareDates(s.endRange,k),$=s.startRange&&s.endRange&&s.startRange<k&&k<s.endRange,B=s.minDate&&k<s.minDate||s.maxDate&&k>s.maxDate||s.disableWeekends&&n._isWeekend(k)||s.disableDayFn&&s.disableDayFn(k);E&&(_<r?(M=v+M,x=d,O=c):(M-=a,x=u,O=p));var D={day:M,month:x,year:O,hasEvent:C,isSelected:b,isToday:w,isDisabled:B,isEmpty:E,isStartRange:T,isEndRange:L,isInRange:$,showDaysInNextAndPreviousMonths:s.showDaysInNextAndPreviousMonths};h.push(this.renderDay(D)),7==++y&&(l.push(this.renderRow(h,s.isRTL,g)),h=[],y=0,g=!1)}return this.renderTable(s,l,i)}},{key:"renderDay",value:function(t){var e=[],i="false";if(t.isEmpty){if(!t.showDaysInNextAndPreviousMonths)return'<td class="is-empty"></td>';e.push("is-outside-current-month"),e.push("is-selection-disabled")}return t.isDisabled&&e.push("is-disabled"),t.isToday&&e.push("is-today"),t.isSelected&&(e.push("is-selected"),i="true"),t.hasEvent&&e.push("has-event"),t.isInRange&&e.push("is-inrange"),t.isStartRange&&e.push("is-startrange"),t.isEndRange&&e.push("is-endrange"),'<td data-day="'+t.day+'" class="'+e.join(" ")+'" aria-selected="'+i+'"><button class="datepicker-day-button" type="button" data-pika-year="'+t.year+'" data-pika-month="'+t.month+'" data-pika-day="'+t.day+'">'+t.day+"</button></td>"}},{key:"renderRow",value:function(t,e,i){return'<tr class="pika-row'+(i?" is-selected":"")+'">'+(e?t.reverse():t).join("")+"</tr>"}},{key:"renderTable",value:function(t,e,i){return'<div class="datepicker-table-wrapper"><table cellpadding="0" cellspacing="0" class="datepicker-table" role="grid" aria-labelledby="'+i+'">'+this.renderHead(t)+this.renderBody(e)+"</table></div>"}},{key:"renderHead",value:function(t){var e=void 0,i=[];for(e=0;e<7;e++)i.push('<th scope="col"><abbr title="'+this.renderDayName(t,e)+'">'+this.renderDayName(t,e,!0)+"</abbr></th>");return"<thead><tr>"+(t.isRTL?i.reverse():i).join("")+"</tr></thead>"}},{key:"renderBody",value:function(t){return"<tbody>"+t.join("")+"</tbody>"}},{key:"renderTitle",value:function(e,i,n,s,o,a){var r=void 0,l=void 0,h=void 0,d=this.options,u=n===d.minYear,c=n===d.maxYear,p='<div id="'+a+'" class="datepicker-controls" role="heading" aria-live="assertive">',v=void 0,f=void 0,m=!0,g=!0;for(h=[],r=0;r<12;r++)h.push('<option value="'+(n===o?r-i:12+r-i)+'"'+(r===s?' selected="selected"':"")+(u&&r<d.minMonth||c&&r>d.maxMonth?'disabled="disabled"':"")+">"+d.i18n.months[r]+"</option>");for(v='<select class="pika-select pika-select-month" tabindex="-1">'+h.join("")+"</select>",t.isArray(d.yearRange)?(r=d.yearRange[0],l=d.yearRange[1]+1):(r=n-d.yearRange,l=1+n+d.yearRange),h=[];r<l&&r<=d.maxYear;r++)r>=d.minYear&&h.push('<option value="'+r+'"'+(r===n?' selected="selected"':"")+">"+r+"</option>");f='<select class="pika-select pika-select-year" tabindex="-1">'+h.join("")+"</select>";p+='<button class="month-prev'+(m?"":" is-disabled")+'" type="button"><svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/><path d="M0-.5h24v24H0z" fill="none"/></svg></button>',p+='<div class="selects-container">',d.showMonthAfterYear?p+=f+v:p+=v+f,p+="</div>",u&&(0===s||d.minMonth>=s)&&(m=!1),c&&(11===s||d.maxMonth<=s)&&(g=!1);return p+='<button class="month-next'+(g?"":" is-disabled")+'" type="button"><svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/><path d="M0-.25h24v24H0z" fill="none"/></svg></button>',p+="</div>"}},{key:"draw",value:function(t){if(this.isOpen||t){var e=this.options,i=e.minYear,n=e.maxYear,s=e.minMonth,o=e.maxMonth,a="",r=void 0;this._y<=i&&(this._y=i,!isNaN(s)&&this._m<s&&(this._m=s)),this._y>=n&&(this._y=n,!isNaN(o)&&this._m>o&&(this._m=o)),r="pika-title-"+Math.random().toString(36).replace(/[^a-z]+/g,"").substr(0,2);for(var l=0;l<1;l++)this._renderDateDisplay(),a+=this.renderTitle(this,l,this.calendars[l].year,this.calendars[l].month,this.calendars[0].year,r)+this.render(this.calendars[l].year,this.calendars[l].month,r);this.destroySelects(),this.calendarEl.innerHTML=a;var h=this.calendarEl.querySelector(".pika-select-year"),d=this.calendarEl.querySelector(".pika-select-month");M.FormSelect.init(h,{classes:"select-year",dropdownOptions:{container:document.body,constrainWidth:!1}}),M.FormSelect.init(d,{classes:"select-month",dropdownOptions:{container:document.body,constrainWidth:!1}}),h.addEventListener("change",this._handleYearChange.bind(this)),d.addEventListener("change",this._handleMonthChange.bind(this)),"function"==typeof this.options.onDraw&&this.options.onDraw(this)}}},{key:"_setupEventHandlers",value:function(){this._handleInputKeydownBound=this._handleInputKeydown.bind(this),this._handleInputClickBound=this._handleInputClick.bind(this),this._handleInputChangeBound=this._handleInputChange.bind(this),this._handleCalendarClickBound=this._handleCalendarClick.bind(this),this._finishSelectionBound=this._finishSelection.bind(this),this._handleMonthChange=this._handleMonthChange.bind(this),this._closeBound=this.close.bind(this),this.el.addEventListener("click",this._handleInputClickBound),this.el.addEventListener("keydown",this._handleInputKeydownBound),this.el.addEventListener("change",this._handleInputChangeBound),this.calendarEl.addEventListener("click",this._handleCalendarClickBound),this.doneBtn.addEventListener("click",this._finishSelectionBound),this.cancelBtn.addEventListener("click",this._closeBound),this.options.showClearBtn&&(this._handleClearClickBound=this._handleClearClick.bind(this),this.clearBtn.addEventListener("click",this._handleClearClickBound))}},{key:"_setupVariables",value:function(){var e=this;this.$modalEl=t(n._template),this.modalEl=this.$modalEl[0],this.calendarEl=this.modalEl.querySelector(".pika-single"),this.yearTextEl=this.modalEl.querySelector(".year-text"),this.dateTextEl=this.modalEl.querySelector(".date-text"),this.options.showClearBtn&&(this.clearBtn=this.modalEl.querySelector(".datepicker-clear")),this.doneBtn=this.modalEl.querySelector(".datepicker-done"),this.cancelBtn=this.modalEl.querySelector(".datepicker-cancel"),this.formats={d:function(){return e.date.getDate()},dd:function(){var t=e.date.getDate();return(t<10?"0":"")+t},ddd:function(){return e.options.i18n.weekdaysShort[e.date.getDay()]},dddd:function(){return e.options.i18n.weekdays[e.date.getDay()]},m:function(){return e.date.getMonth()+1},mm:function(){var t=e.date.getMonth()+1;return(t<10?"0":"")+t},mmm:function(){return e.options.i18n.monthsShort[e.date.getMonth()]},mmmm:function(){return e.options.i18n.months[e.date.getMonth()]},yy:function(){return(""+e.date.getFullYear()).slice(2)},yyyy:function(){return e.date.getFullYear()}}}},{key:"_removeEventHandlers",value:function(){this.el.removeEventListener("click",this._handleInputClickBound),this.el.removeEventListener("keydown",this._handleInputKeydownBound),this.el.removeEventListener("change",this._handleInputChangeBound),this.calendarEl.removeEventListener("click",this._handleCalendarClickBound)}},{key:"_handleInputClick",value:function(){this.open()}},{key:"_handleInputKeydown",value:function(t){t.which===M.keys.ENTER&&(t.preventDefault(),this.open())}},{key:"_handleCalendarClick",value:function(e){if(this.isOpen){var i=t(e.target);i.hasClass("is-disabled")||(!i.hasClass("datepicker-day-button")||i.hasClass("is-empty")||i.parent().hasClass("is-disabled")?i.closest(".month-prev").length?this.prevMonth():i.closest(".month-next").length&&this.nextMonth():this.setDate(new Date(e.target.getAttribute("data-pika-year"),e.target.getAttribute("data-pika-month"),e.target.getAttribute("data-pika-day"))))}}},{key:"_handleClearClick",value:function(){this.date=null,this.setInputValue(),this.close()}},{key:"_handleMonthChange",value:function(t){this.gotoMonth(t.target.value)}},{key:"_handleYearChange",value:function(t){this.gotoYear(t.target.value)}},{key:"gotoMonth",value:function(t){isNaN(t)||(this.calendars[0].month=parseInt(t,10),this.adjustCalendars())}},{key:"gotoYear",value:function(t){isNaN(t)||(this.calendars[0].year=parseInt(t,10),this.adjustCalendars())}},{key:"_handleInputChange",value:function(t){var e=void 0;t.firedBy!==this&&(e=this.options.parse?this.options.parse(this.el.value,this.options.format):new Date(Date.parse(this.el.value)),n._isDate(e)&&this.setDate(e))}},{key:"renderDayName",value:function(t,e,i){for(e+=t.firstDay;e>=7;)e-=7;return i?t.i18n.weekdaysAbbrev[e]:t.i18n.weekdays[e]}},{key:"_finishSelection",value:function(){this.setInputValue(),this.close()}},{key:"open",value:function(){if(!this.isOpen)return this.isOpen=!0,"function"==typeof this.options.onOpen&&this.options.onOpen.call(this),this.draw(),this.modal.open(),this}},{key:"close",value:function(){if(this.isOpen)return this.isOpen=!1,"function"==typeof this.options.onClose&&this.options.onClose.call(this),this.modal.close(),this}}],[{key:"init",value:function(t,e){return _get(n.__proto__||Object.getPrototypeOf(n),"init",this).call(this,this,t,e)}},{key:"_isDate",value:function(t){return/Date/.test(Object.prototype.toString.call(t))&&!isNaN(t.getTime())}},{key:"_isWeekend",value:function(t){var e=t.getDay();return 0===e||6===e}},{key:"_setToStartOfDay",value:function(t){n._isDate(t)&&t.setHours(0,0,0,0)}},{key:"_getDaysInMonth",value:function(t,e){return[31,n._isLeapYear(t)?29:28,31,30,31,30,31,31,30,31,30,31][e]}},{key:"_isLeapYear",value:function(t){return t%4==0&&t%100!=0||t%400==0}},{key:"_compareDates",value:function(t,e){return t.getTime()===e.getTime()}},{key:"_setToStartOfDay",value:function(t){n._isDate(t)&&t.setHours(0,0,0,0)}},{key:"getInstance",value:function(t){return(t.jquery?t[0]:t).M_Datepicker}},{key:"defaults",get:function(){return e}}]),n}();i._template=['<div class= "modal datepicker-modal">','<div class="modal-content datepicker-container">','<div class="datepicker-date-display">','<span class="year-text"></span>','<span class="date-text"></span>',"</div>",'<div class="datepicker-calendar-container">','<div class="pika-single"></div>','<div class="datepicker-footer">','<button class="btn-flat datepicker-clear waves-effect" style="visibility: hidden;" type="button"></button>','<div class="confirmation-btns">','<button class="btn-flat datepicker-cancel waves-effect" type="button"></button>','<button class="btn-flat datepicker-done waves-effect" type="button"></button>',"</div>","</div>","</div>","</div>","</div>"].join(""),M.Datepicker=i,M.jQueryLoaded&&M.initializeJqueryWrapper(i,"datepicker","M_Datepicker")}(cash),function(t){"use strict";var e={dialRadius:135,outerRadius:105,innerRadius:70,tickRadius:20,duration:350,container:null,defaultTime:"now",fromNow:0,showClearBtn:!1,i18n:{cancel:"Cancel",clear:"Clear",done:"Ok"},autoClose:!1,twelveHour:!0,vibrate:!0},i=function(i){function n(e,i){_classCallCheck(this,n);var s=_possibleConstructorReturn(this,(n.__proto__||Object.getPrototypeOf(n)).call(this,n,e,i));return s.el.M_Timepicker=s,s.options=t.extend({},n.defaults,i),s.id=M.guid(),s._insertHTMLIntoDOM(),s._setupModal(),s._setupVariables(),s._setupEventHandlers(),s._clockSetup(),s._pickerSetup(),s}return _inherits(n,Component),_createClass(n,[{key:"destroy",value:function(){this._removeEventHandlers(),this.modal.destroy(),t(this.modalEl).remove(),this.el.M_Timepicker=void 0}},{key:"_setupEventHandlers",value:function(){this._handleInputKeydownBound=this._handleInputKeydown.bind(this),this._handleInputClickBound=this._handleInputClick.bind(this),this._handleClockClickStartBound=this._handleClockClickStart.bind(this),this._handleDocumentClickMoveBound=this._handleDocumentClickMove.bind(this),this._handleDocumentClickEndBound=this._handleDocumentClickEnd.bind(this),this.el.addEventListener("click",this._handleInputClickBound),this.el.addEventListener("keydown",this._handleInputKeydownBound),this.plate.addEventListener("mousedown",this._handleClockClickStartBound),this.plate.addEventListener("touchstart",this._handleClockClickStartBound),t(this.spanHours).on("click",this.showView.bind(this,"hours")),t(this.spanMinutes).on("click",this.showView.bind(this,"minutes"))}},{key:"_removeEventHandlers",value:function(){this.el.removeEventListener("click",this._handleInputClickBound),this.el.removeEventListener("keydown",this._handleInputKeydownBound)}},{key:"_handleInputClick",value:function(){this.open()}},{key:"_handleInputKeydown",value:function(t){t.which===M.keys.ENTER&&(t.preventDefault(),this.open())}},{key:"_handleClockClickStart",value:function(t){t.preventDefault();var e=this.plate.getBoundingClientRect(),i={x:e.left,y:e.top};this.x0=i.x+this.options.dialRadius,this.y0=i.y+this.options.dialRadius,this.moved=!1;var s=n._Pos(t);this.dx=s.x-this.x0,this.dy=s.y-this.y0,this.setHand(this.dx,this.dy,!1),document.addEventListener("mousemove",this._handleDocumentClickMoveBound),document.addEventListener("touchmove",this._handleDocumentClickMoveBound),document.addEventListener("mouseup",this._handleDocumentClickEndBound),document.addEventListener("touchend",this._handleDocumentClickEndBound)}},{key:"_handleDocumentClickMove",value:function(t){t.preventDefault();var e=n._Pos(t),i=e.x-this.x0,s=e.y-this.y0;this.moved=!0,this.setHand(i,s,!1,!0)}},{key:"_handleDocumentClickEnd",value:function(e){var i=this;e.preventDefault(),document.removeEventListener("mouseup",this._handleDocumentClickEndBound),document.removeEventListener("touchend",this._handleDocumentClickEndBound);var s=n._Pos(e),o=s.x-this.x0,a=s.y-this.y0;this.moved&&o===this.dx&&a===this.dy&&this.setHand(o,a),"hours"===this.currentView?this.showView("minutes",this.options.duration/2):this.options.autoClose&&(t(this.minutesView).addClass("timepicker-dial-out"),setTimeout(function(){i.done()},this.options.duration/2)),document.removeEventListener("mousemove",this._handleDocumentClickMoveBound),document.removeEventListener("touchmove",this._handleDocumentClickMoveBound)}},{key:"_insertHTMLIntoDOM",value:function(){this.$modalEl=t(n._template),this.modalEl=this.$modalEl[0],this.modalEl.id="modal-"+this.id;var e=document.querySelector(this.options.container);this.options.container&&e?this.$modalEl.appendTo(e):this.$modalEl.insertBefore(this.el)}},{key:"_setupModal",value:function(){var t=this;this.modal=M.Modal.init(this.modalEl,{onCloseEnd:function(){t.isOpen=!1}})}},{key:"_setupVariables",value:function(){this.currentView="hours",this.vibrate=navigator.vibrate?"vibrate":navigator.webkitVibrate?"webkitVibrate":null,this._canvas=this.modalEl.querySelector(".timepicker-canvas"),this.plate=this.modalEl.querySelector(".timepicker-plate"),this.hoursView=this.modalEl.querySelector(".timepicker-hours"),this.minutesView=this.modalEl.querySelector(".timepicker-minutes"),this.spanHours=this.modalEl.querySelector(".timepicker-span-hours"),this.spanMinutes=this.modalEl.querySelector(".timepicker-span-minutes"),this.spanAmPm=this.modalEl.querySelector(".timepicker-span-am-pm"),this.footer=this.modalEl.querySelector(".timepicker-footer"),this.amOrPm="PM"}},{key:"_pickerSetup",value:function(){var e=t('<button class="btn-flat timepicker-clear waves-effect" style="visibility: hidden;" type="button" tabindex="'+(this.options.twelveHour?"3":"1")+'">'+this.options.i18n.clear+"</button>").appendTo(this.footer).on("click",this.clear.bind(this));this.options.showClearBtn&&e.css({visibility:""});var i=t('<div class="confirmation-btns"></div>');t('<button class="btn-flat timepicker-close waves-effect" type="button" tabindex="'+(this.options.twelveHour?"3":"1")+'">'+this.options.i18n.cancel+"</button>").appendTo(i).on("click",this.close.bind(this)),t('<button class="btn-flat timepicker-close waves-effect" type="button" tabindex="'+(this.options.twelveHour?"3":"1")+'">'+this.options.i18n.done+"</button>").appendTo(i).on("click",this.done.bind(this)),i.appendTo(this.footer)}},{key:"_clockSetup",value:function(){this.options.twelveHour&&(this.$amBtn=t('<div class="am-btn">AM</div>'),this.$pmBtn=t('<div class="pm-btn">PM</div>'),this.$amBtn.on("click",this._handleAmPmClick.bind(this)).appendTo(this.spanAmPm),this.$pmBtn.on("click",this._handleAmPmClick.bind(this)).appendTo(this.spanAmPm)),this._buildHoursView(),this._buildMinutesView(),this._buildSVGClock()}},{key:"_buildSVGClock",value:function(){var t=this.options.dialRadius,e=this.options.tickRadius,i=2*t,s=n._createSVGEl("svg");s.setAttribute("class","timepicker-svg"),s.setAttribute("width",i),s.setAttribute("height",i);var o=n._createSVGEl("g");o.setAttribute("transform","translate("+t+","+t+")");var a=n._createSVGEl("circle");a.setAttribute("class","timepicker-canvas-bearing"),a.setAttribute("cx",0),a.setAttribute("cy",0),a.setAttribute("r",4);var r=n._createSVGEl("line");r.setAttribute("x1",0),r.setAttribute("y1",0);var l=n._createSVGEl("circle");l.setAttribute("class","timepicker-canvas-bg"),l.setAttribute("r",e),o.appendChild(r),o.appendChild(l),o.appendChild(a),s.appendChild(o),this._canvas.appendChild(s),this.hand=r,this.bg=l,this.bearing=a,this.g=o}},{key:"_buildHoursView",value:function(){var e=t('<div class="timepicker-tick"></div>');if(this.options.twelveHour)for(var i=1;i<13;i+=1){var n=e.clone(),s=i/6*Math.PI,o=this.options.outerRadius;n.css({left:this.options.dialRadius+Math.sin(s)*o-this.options.tickRadius+"px",top:this.options.dialRadius-Math.cos(s)*o-this.options.tickRadius+"px"}),n.html(0===i?"00":i),this.hoursView.appendChild(n[0])}else for(var a=0;a<24;a+=1){var r=e.clone(),l=a/6*Math.PI,h=a>0&&a<13?this.options.innerRadius:this.options.outerRadius;r.css({left:this.options.dialRadius+Math.sin(l)*h-this.options.tickRadius+"px",top:this.options.dialRadius-Math.cos(l)*h-this.options.tickRadius+"px"}),r.html(0===a?"00":a),this.hoursView.appendChild(r[0])}}},{key:"_buildMinutesView",value:function(){for(var e=t('<div class="timepicker-tick"></div>'),i=0;i<60;i+=5){var s=e.clone(),o=i/30*Math.PI;s.css({left:this.options.dialRadius+Math.sin(o)*this.options.outerRadius-this.options.tickRadius+"px",top:this.options.dialRadius-Math.cos(o)*this.options.outerRadius-this.options.tickRadius+"px"}),s.html(n._addLeadingZero(i)),this.minutesView.appendChild(s[0])}}},{key:"_handleAmPmClick",value:function(e){var i=t(e.target);this.amOrPm=i.hasClass("am-btn")?"AM":"PM",this._updateAmPmView()}},{key:"_updateAmPmView",value:function(){this.options.twelveHour&&(this.$amBtn.toggleClass("text-primary","AM"===this.amOrPm),this.$pmBtn.toggleClass("text-primary","PM"===this.amOrPm))}},{key:"_updateTimeFromInput",value:function(){var t=((this.el.value||this.options.defaultTime||"")+"").split(":");if(this.options.twelveHour&&void 0!==t[1]&&(t[1].toUpperCase().indexOf("AM")>0?this.amOrPm="AM":this.amOrPm="PM",t[1]=t[1].replace("AM","").replace("PM","")),"now"===t[0]){var e=new Date(+new Date+this.options.fromNow);t=[e.getHours(),e.getMinutes()],this.options.twelveHour&&(this.amOrPm=t[0]>=12&&t[0]<24?"PM":"AM")}this.hours=+t[0]||0,this.minutes=+t[1]||0,this.spanHours.innerHTML=this.hours,this.spanMinutes.innerHTML=n._addLeadingZero(this.minutes),this._updateAmPmView()}},{key:"showView",value:function(e,i){"minutes"===e&&t(this.hoursView).css("visibility");var n="hours"===e,s=n?this.hoursView:this.minutesView,o=n?this.minutesView:this.hoursView;this.currentView=e,t(this.spanHours).toggleClass("text-primary",n),t(this.spanMinutes).toggleClass("text-primary",!n),o.classList.add("timepicker-dial-out"),t(s).css("visibility","visible").removeClass("timepicker-dial-out"),this.resetClock(i),clearTimeout(this.toggleViewTimer),this.toggleViewTimer=setTimeout(function(){t(o).css("visibility","hidden")},this.options.duration)}},{key:"resetClock",value:function(e){var i=this.currentView,n=this[i],s="hours"===i,o=n*(Math.PI/(s?6:30)),a=s&&n>0&&n<13?this.options.innerRadius:this.options.outerRadius,r=Math.sin(o)*a,l=-Math.cos(o)*a,h=this;e?(t(this.canvas).addClass("timepicker-canvas-out"),setTimeout(function(){t(h.canvas).removeClass("timepicker-canvas-out"),h.setHand(r,l)},e)):this.setHand(r,l)}},{key:"setHand",value:function(t,e,i){var s=this,o=Math.atan2(t,-e),a="hours"===this.currentView,r=Math.PI/(a||i?6:30),l=Math.sqrt(t*t+e*e),h=a&&l<(this.options.outerRadius+this.options.innerRadius)/2,d=h?this.options.innerRadius:this.options.outerRadius;this.options.twelveHour&&(d=this.options.outerRadius),o<0&&(o=2*Math.PI+o);var u=Math.round(o/r);o=u*r,this.options.twelveHour?a?0===u&&(u=12):(i&&(u*=5),60===u&&(u=0)):a?(12===u&&(u=0),u=h?0===u?12:u:0===u?0:u+12):(i&&(u*=5),60===u&&(u=0)),this[this.currentView]!==u&&this.vibrate&&this.options.vibrate&&(this.vibrateTimer||(navigator[this.vibrate](10),this.vibrateTimer=setTimeout(function(){s.vibrateTimer=null},100))),this[this.currentView]=u,a?this.spanHours.innerHTML=u:this.spanMinutes.innerHTML=n._addLeadingZero(u);var c=Math.sin(o)*(d-this.options.tickRadius),p=-Math.cos(o)*(d-this.options.tickRadius),v=Math.sin(o)*d,f=-Math.cos(o)*d;this.hand.setAttribute("x2",c),this.hand.setAttribute("y2",p),this.bg.setAttribute("cx",v),this.bg.setAttribute("cy",f)}},{key:"open",value:function(){this.isOpen||(this.isOpen=!0,this._updateTimeFromInput(),this.showView("hours"),this.modal.open())}},{key:"close",value:function(){this.isOpen&&(this.isOpen=!1,this.modal.close())}},{key:"done",value:function(t,e){var i=this.el.value,s=e?"":n._addLeadingZero(this.hours)+":"+n._addLeadingZero(this.minutes);this.time=s,!e&&this.options.twelveHour&&(s=s+" "+this.amOrPm),this.el.value=s,s!==i&&this.$el.trigger("change"),this.close(),this.el.focus()}},{key:"clear",value:function(){this.done(null,!0)}}],[{key:"init",value:function(t,e){return _get(n.__proto__||Object.getPrototypeOf(n),"init",this).call(this,this,t,e)}},{key:"_addLeadingZero",value:function(t){return(t<10?"0":"")+t}},{key:"_createSVGEl",value:function(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}},{key:"_Pos",value:function(t){return t.targetTouches&&t.targetTouches.length>=1?{x:t.targetTouches[0].clientX,y:t.targetTouches[0].clientY}:{x:t.clientX,y:t.clientY}}},{key:"getInstance",value:function(t){return(t.jquery?t[0]:t).M_Timepicker}},{key:"defaults",get:function(){return e}}]),n}();i._template=['<div class= "modal timepicker-modal">','<div class="modal-content timepicker-container">','<div class="timepicker-digital-display">','<div class="timepicker-text-container">','<div class="timepicker-display-column">','<span class="timepicker-span-hours text-primary"></span>',":",'<span class="timepicker-span-minutes"></span>',"</div>",'<div class="timepicker-display-column timepicker-display-am-pm">','<div class="timepicker-span-am-pm"></div>',"</div>","</div>","</div>",'<div class="timepicker-analog-display">','<div class="timepicker-plate">','<div class="timepicker-canvas"></div>','<div class="timepicker-dial timepicker-hours"></div>','<div class="timepicker-dial timepicker-minutes timepicker-dial-out"></div>',"</div>",'<div class="timepicker-footer"></div>',"</div>","</div>","</div>"].join(""),M.Timepicker=i,M.jQueryLoaded&&M.initializeJqueryWrapper(i,"timepicker","M_Timepicker")}(cash),function(t){"use strict";var e={},i=function(i){function n(e,i){_classCallCheck(this,n);var s=_possibleConstructorReturn(this,(n.__proto__||Object.getPrototypeOf(n)).call(this,n,e,i));return s.el.M_CharacterCounter=s,s.options=t.extend({},n.defaults,i),s.isInvalid=!1,s.isValidLength=!1,s._setupCounter(),s._setupEventHandlers(),s}return _inherits(n,Component),_createClass(n,[{key:"destroy",value:function(){this._removeEventHandlers(),this.el.CharacterCounter=void 0,this._removeCounter()}},{key:"_setupEventHandlers",value:function(){this._handleUpdateCounterBound=this.updateCounter.bind(this),this.el.addEventListener("focus",this._handleUpdateCounterBound,!0),this.el.addEventListener("input",this._handleUpdateCounterBound,!0)}},{key:"_removeEventHandlers",value:function(){this.el.removeEventListener("focus",this._handleUpdateCounterBound,!0),this.el.removeEventListener("input",this._handleUpdateCounterBound,!0)}},{key:"_setupCounter",value:function(){this.counterEl=document.createElement("span"),t(this.counterEl).addClass("character-counter").css({float:"right","font-size":"12px",height:1}),this.$el.parent().append(this.counterEl)}},{key:"_removeCounter",value:function(){t(this.counterEl).remove()}},{key:"updateCounter",value:function(){var e=+this.$el.attr("data-length"),i=this.el.value.length;this.isValidLength=i<=e;var n=i;e&&(n+="/"+e,this._validateInput()),t(this.counterEl).html(n)}},{key:"_validateInput",value:function(){this.isValidLength&&this.isInvalid?(this.isInvalid=!1,this.$el.removeClass("invalid")):this.isValidLength||this.isInvalid||(this.isInvalid=!0,this.$el.removeClass("valid"),this.$el.addClass("invalid"))}}],[{key:"init",value:function(t,e){return _get(n.__proto__||Object.getPrototypeOf(n),"init",this).call(this,this,t,e)}},{key:"getInstance",value:function(t){return(t.jquery?t[0]:t).M_CharacterCounter}},{key:"defaults",get:function(){return e}}]),n}();M.CharacterCounter=i,M.jQueryLoaded&&M.initializeJqueryWrapper(i,"characterCounter","M_CharacterCounter")}(cash),function(t){"use strict";var e={duration:200,dist:-100,shift:0,padding:0,numVisible:5,fullWidth:!1,indicators:!1,noWrap:!1,onCycleTo:null},i=function(i){function n(e,i){_classCallCheck(this,n);var s=_possibleConstructorReturn(this,(n.__proto__||Object.getPrototypeOf(n)).call(this,n,e,i));return s.el.M_Carousel=s,s.options=t.extend({},n.defaults,i),s.hasMultipleSlides=s.$el.find(".carousel-item").length>1,s.showIndicators=s.options.indicators&&s.hasMultipleSlides,s.noWrap=s.options.noWrap||!s.hasMultipleSlides,s.pressed=!1,s.dragged=!1,s.offset=s.target=0,s.images=[],s.itemWidth=s.$el.find(".carousel-item").first().innerWidth(),s.itemHeight=s.$el.find(".carousel-item").first().innerHeight(),s.dim=2*s.itemWidth+s.options.padding||1,s._autoScrollBound=s._autoScroll.bind(s),s._trackBound=s._track.bind(s),s.options.fullWidth&&(s.options.dist=0,s._setCarouselHeight(),s.showIndicators&&s.$el.find(".carousel-fixed-item").addClass("with-indicators")),s.$indicators=t('<ul class="indicators"></ul>'),s.$el.find(".carousel-item").each(function(e,i){if(s.images.push(e),s.showIndicators){var n=t('<li class="indicator-item"></li>');0===i&&n[0].classList.add("active"),s.$indicators.append(n)}}),s.showIndicators&&s.$el.append(s.$indicators),s.count=s.images.length,s.options.numVisible=Math.min(s.count,s.options.numVisible),s.xform="transform",["webkit","Moz","O","ms"].every(function(t){var e=t+"Transform";return void 0===document.body.style[e]||(s.xform=e,!1)}),s._setupEventHandlers(),s._scroll(s.offset),s}return _inherits(n,Component),_createClass(n,[{key:"destroy",value:function(){this._removeEventHandlers(),this.el.M_Carousel=void 0}},{key:"_setupEventHandlers",value:function(){var t=this;this._handleCarouselTapBound=this._handleCarouselTap.bind(this),this._handleCarouselDragBound=this._handleCarouselDrag.bind(this),this._handleCarouselReleaseBound=this._handleCarouselRelease.bind(this),this._handleCarouselClickBound=this._handleCarouselClick.bind(this),void 0!==window.ontouchstart&&(this.el.addEventListener("touchstart",this._handleCarouselTapBound),this.el.addEventListener("touchmove",this._handleCarouselDragBound),this.el.addEventListener("touchend",this._handleCarouselReleaseBound)),this.el.addEventListener("mousedown",this._handleCarouselTapBound),this.el.addEventListener("mousemove",this._handleCarouselDragBound),this.el.addEventListener("mouseup",this._handleCarouselReleaseBound),this.el.addEventListener("mouseleave",this._handleCarouselReleaseBound),this.el.addEventListener("click",this._handleCarouselClickBound),this.showIndicators&&this.$indicators&&(this._handleIndicatorClickBound=this._handleIndicatorClick.bind(this),this.$indicators.find(".indicator-item").each(function(e,i){e.addEventListener("click",t._handleIndicatorClickBound)}));var e=M.throttle(this._handleResize,200);this._handleThrottledResizeBound=e.bind(this),window.addEventListener("resize",this._handleThrottledResizeBound)}},{key:"_removeEventHandlers",value:function(){var t=this;void 0!==window.ontouchstart&&(this.el.removeEventListener("touchstart",this._handleCarouselTapBound),this.el.removeEventListener("touchmove",this._handleCarouselDragBound),this.el.removeEventListener("touchend",this._handleCarouselReleaseBound)),this.el.removeEventListener("mousedown",this._handleCarouselTapBound),this.el.removeEventListener("mousemove",this._handleCarouselDragBound),this.el.removeEventListener("mouseup",this._handleCarouselReleaseBound),this.el.removeEventListener("mouseleave",this._handleCarouselReleaseBound),this.el.removeEventListener("click",this._handleCarouselClickBound),this.showIndicators&&this.$indicators&&this.$indicators.find(".indicator-item").each(function(e,i){e.removeEventListener("click",t._handleIndicatorClickBound)}),window.removeEventListener("resize",this._handleThrottledResizeBound)}},{key:"_handleCarouselTap",value:function(e){"mousedown"===e.type&&t(e.target).is("img")&&e.preventDefault(),this.pressed=!0,this.dragged=!1,this.verticalDragged=!1,this.reference=this._xpos(e),this.referenceY=this._ypos(e),this.velocity=this.amplitude=0,this.frame=this.offset,this.timestamp=Date.now(),clearInterval(this.ticker),this.ticker=setInterval(this._trackBound,100)}},{key:"_handleCarouselDrag",value:function(t){var e=void 0,i=void 0,n=void 0;if(this.pressed)if(e=this._xpos(t),i=this._ypos(t),n=this.reference-e,Math.abs(this.referenceY-i)<30&&!this.verticalDragged)(n>2||n<-2)&&(this.dragged=!0,this.reference=e,this._scroll(this.offset+n));else{if(this.dragged)return t.preventDefault(),t.stopPropagation(),!1;this.verticalDragged=!0}if(this.dragged)return t.preventDefault(),t.stopPropagation(),!1}},{key:"_handleCarouselRelease",value:function(t){if(this.pressed)return this.pressed=!1,clearInterval(this.ticker),this.target=this.offset,(this.velocity>10||this.velocity<-10)&&(this.amplitude=.9*this.velocity,this.target=this.offset+this.amplitude),this.target=Math.round(this.target/this.dim)*this.dim,this.noWrap&&(this.target>=this.dim*(this.count-1)?this.target=this.dim*(this.count-1):this.target<0&&(this.target=0)),this.amplitude=this.target-this.offset,this.timestamp=Date.now(),requestAnimationFrame(this._autoScrollBound),this.dragged&&(t.preventDefault(),t.stopPropagation()),!1}},{key:"_handleCarouselClick",value:function(e){if(this.dragged)return e.preventDefault(),e.stopPropagation(),!1;if(!this.options.fullWidth){var i=t(e.target).closest(".carousel-item").index();0!==this._wrap(this.center)-i&&(e.preventDefault(),e.stopPropagation()),this._cycleTo(i)}}},{key:"_handleIndicatorClick",value:function(e){e.stopPropagation();var i=t(e.target).closest(".indicator-item");i.length&&this._cycleTo(i.index())}},{key:"_handleResize",value:function(t){this.options.fullWidth?(this.itemWidth=this.$el.find(".carousel-item").first().innerWidth(),this.imageHeight=this.$el.find(".carousel-item.active").height(),this.dim=2*this.itemWidth+this.options.padding,this.offset=2*this.center*this.itemWidth,this.target=this.offset,this._setCarouselHeight(!0)):this._scroll()}},{key:"_setCarouselHeight",value:function(t){var e=this,i=this.$el.find(".carousel-item.active").length?this.$el.find(".carousel-item.active").first():this.$el.find(".carousel-item").first(),n=i.find("img").first();if(n.length)if(n[0].complete){var s=n.height();if(s>0)this.$el.css("height",s+"px");else{var o=n[0].naturalWidth,a=n[0].naturalHeight,r=this.$el.width()/o*a;this.$el.css("height",r+"px")}}else n.one("load",function(t,i){e.$el.css("height",t.offsetHeight+"px")});else if(!t){var l=i.height();this.$el.css("height",l+"px")}}},{key:"_xpos",value:function(t){return t.targetTouches&&t.targetTouches.length>=1?t.targetTouches[0].clientX:t.clientX}},{key:"_ypos",value:function(t){return t.targetTouches&&t.targetTouches.length>=1?t.targetTouches[0].clientY:t.clientY}},{key:"_wrap",value:function(t){return t>=this.count?t%this.count:t<0?this._wrap(this.count+t%this.count):t}},{key:"_track",value:function(){var t=void 0,e=void 0,i=void 0,n=void 0;e=(t=Date.now())-this.timestamp,this.timestamp=t,i=this.offset-this.frame,this.frame=this.offset,n=1e3*i/(1+e),this.velocity=.8*n+.2*this.velocity}},{key:"_autoScroll",value:function(){var t=void 0,e=void 0;this.amplitude&&(t=Date.now()-this.timestamp,(e=this.amplitude*Math.exp(-t/this.options.duration))>2||e<-2?(this._scroll(this.target-e),requestAnimationFrame(this._autoScrollBound)):this._scroll(this.target))}},{key:"_scroll",value:function(e){var i=this;this.$el.hasClass("scrolling")||this.el.classList.add("scrolling"),null!=this.scrollingTimeout&&window.clearTimeout(this.scrollingTimeout),this.scrollingTimeout=window.setTimeout(function(){i.$el.removeClass("scrolling")},this.options.duration);var n=void 0,s=void 0,o=void 0,a=void 0,r=void 0,l=void 0,h=void 0,d=void 0,u=void 0,c=void 0,p=this.center,v=1/this.options.numVisible;if(this.offset="number"==typeof e?e:this.offset,this.center=Math.floor((this.offset+this.dim/2)/this.dim),o=this.offset-this.center*this.dim,a=o<0?1:-1,r=-a*o*2/this.dim,s=this.count>>1,this.options.fullWidth?(h="translateX(0)",c=1):(h="translateX("+(this.el.clientWidth-this.itemWidth)/2+"px) ",h+="translateY("+(this.el.clientHeight-this.itemHeight)/2+"px)",c=1-v*r),this.showIndicators){var f=this.center%this.count,m=this.$indicators.find(".indicator-item.active");m.index()!==f&&(m.removeClass("active"),this.$indicators.find(".indicator-item").eq(f)[0].classList.add("active"))}if(!this.noWrap||this.center>=0&&this.center<this.count){l=this.images[this._wrap(this.center)],t(l).hasClass("active")||(this.$el.find(".carousel-item").removeClass("active"),l.classList.add("active"));var g=h+" translateX("+-o/2+"px) translateX("+a*this.options.shift*r*n+"px) translateZ("+this.options.dist*r+"px)";this._updateItemStyle(l,c,0,g)}for(n=1;n<=s;++n){if(this.options.fullWidth?(d=this.options.dist,u=n===s&&o<0?1-r:1):(d=this.options.dist*(2*n+r*a),u=1-v*(2*n+r*a)),!this.noWrap||this.center+n<this.count){l=this.images[this._wrap(this.center+n)];var _=h+" translateX("+(this.options.shift+(this.dim*n-o)/2)+"px) translateZ("+d+"px)";this._updateItemStyle(l,u,-n,_)}if(this.options.fullWidth?(d=this.options.dist,u=n===s&&o>0?1-r:1):(d=this.options.dist*(2*n-r*a),u=1-v*(2*n-r*a)),!this.noWrap||this.center-n>=0){l=this.images[this._wrap(this.center-n)];var y=h+" translateX("+(-this.options.shift+(-this.dim*n-o)/2)+"px) translateZ("+d+"px)";this._updateItemStyle(l,u,-n,y)}}if(!this.noWrap||this.center>=0&&this.center<this.count){l=this.images[this._wrap(this.center)];var k=h+" translateX("+-o/2+"px) translateX("+a*this.options.shift*r+"px) translateZ("+this.options.dist*r+"px)";this._updateItemStyle(l,c,0,k)}var b=this.$el.find(".carousel-item").eq(this._wrap(this.center));p!==this.center&&"function"==typeof this.options.onCycleTo&&this.options.onCycleTo.call(this,b[0],this.dragged),"function"==typeof this.oneTimeCallback&&(this.oneTimeCallback.call(this,b[0],this.dragged),this.oneTimeCallback=null)}},{key:"_updateItemStyle",value:function(t,e,i,n){t.style[this.xform]=n,t.style.zIndex=i,t.style.opacity=e,t.style.visibility="visible"}},{key:"_cycleTo",value:function(t,e){var i=this.center%this.count-t;this.noWrap||(i<0?Math.abs(i+this.count)<Math.abs(i)&&(i+=this.count):i>0&&Math.abs(i-this.count)<i&&(i-=this.count)),this.target=this.dim*Math.round(this.offset/this.dim),i<0?this.target+=this.dim*Math.abs(i):i>0&&(this.target-=this.dim*i),"function"==typeof e&&(this.oneTimeCallback=e),this.offset!==this.target&&(this.amplitude=this.target-this.offset,this.timestamp=Date.now(),requestAnimationFrame(this._autoScrollBound))}},{key:"next",value:function(t){(void 0===t||isNaN(t))&&(t=1);var e=this.center+t;if(e>this.count||e<0){if(this.noWrap)return;e=this._wrap(e)}this._cycleTo(e)}},{key:"prev",value:function(t){(void 0===t||isNaN(t))&&(t=1);var e=this.center-t;if(e>this.count||e<0){if(this.noWrap)return;e=this._wrap(e)}this._cycleTo(e)}},{key:"set",value:function(t,e){if((void 0===t||isNaN(t))&&(t=0),t>this.count||t<0){if(this.noWrap)return;t=this._wrap(t)}this._cycleTo(t,e)}}],[{key:"init",value:function(t,e){return _get(n.__proto__||Object.getPrototypeOf(n),"init",this).call(this,this,t,e)}},{key:"getInstance",value:function(t){return(t.jquery?t[0]:t).M_Carousel}},{key:"defaults",get:function(){return e}}]),n}();M.Carousel=i,M.jQueryLoaded&&M.initializeJqueryWrapper(i,"carousel","M_Carousel")}(cash),function(t){"use strict";var e={onOpen:void 0,onClose:void 0},i=function(i){function n(e,i){_classCallCheck(this,n);var s=_possibleConstructorReturn(this,(n.__proto__||Object.getPrototypeOf(n)).call(this,n,e,i));return s.el.M_TapTarget=s,s.options=t.extend({},n.defaults,i),s.isOpen=!1,s.$origin=t("#"+s.$el.attr("data-target")),s._setup(),s._calculatePositioning(),s._setupEventHandlers(),s}return _inherits(n,Component),_createClass(n,[{key:"destroy",value:function(){this._removeEventHandlers(),this.el.TapTarget=void 0}},{key:"_setupEventHandlers",value:function(){this._handleDocumentClickBound=this._handleDocumentClick.bind(this),this._handleTargetClickBound=this._handleTargetClick.bind(this),this._handleOriginClickBound=this._handleOriginClick.bind(this),this.el.addEventListener("click",this._handleTargetClickBound),this.originEl.addEventListener("click",this._handleOriginClickBound);var t=M.throttle(this._handleResize,200);this._handleThrottledResizeBound=t.bind(this),window.addEventListener("resize",this._handleThrottledResizeBound)}},{key:"_removeEventHandlers",value:function(){this.el.removeEventListener("click",this._handleTargetClickBound),this.originEl.removeEventListener("click",this._handleOriginClickBound),window.removeEventListener("resize",this._handleThrottledResizeBound)}},{key:"_handleTargetClick",value:function(t){this.open()}},{key:"_handleOriginClick",value:function(t){this.close()}},{key:"_handleResize",value:function(t){this._calculatePositioning()}},{key:"_handleDocumentClick",value:function(e){t(e.target).closest(".tap-target-wrapper").length||(this.close(),e.preventDefault(),e.stopPropagation())}},{key:"_setup",value:function(){this.wrapper=this.$el.parent()[0],this.waveEl=t(this.wrapper).find(".tap-target-wave")[0],this.originEl=t(this.wrapper).find(".tap-target-origin")[0],this.contentEl=this.$el.find(".tap-target-content")[0],t(this.wrapper).hasClass(".tap-target-wrapper")||(this.wrapper=document.createElement("div"),this.wrapper.classList.add("tap-target-wrapper"),this.$el.before(t(this.wrapper)),this.wrapper.append(this.el)),this.contentEl||(this.contentEl=document.createElement("div"),this.contentEl.classList.add("tap-target-content"),this.$el.append(this.contentEl)),this.waveEl||(this.waveEl=document.createElement("div"),this.waveEl.classList.add("tap-target-wave"),this.originEl||(this.originEl=this.$origin.clone(!0,!0),this.originEl.addClass("tap-target-origin"),this.originEl.removeAttr("id"),this.originEl.removeAttr("style"),this.originEl=this.originEl[0],this.waveEl.append(this.originEl)),this.wrapper.append(this.waveEl))}},{key:"_calculatePositioning",value:function(){var e="fixed"===this.$origin.css("position");if(!e)for(var i=this.$origin.parents(),n=0;n<i.length&&!(e="fixed"==t(i[n]).css("position"));n++);var s=this.$origin.outerWidth(),o=this.$origin.outerHeight(),a=e?this.$origin.offset().top-M.getDocumentScrollTop():this.$origin.offset().top,r=e?this.$origin.offset().left-M.getDocumentScrollLeft():this.$origin.offset().left,l=window.innerWidth,h=window.innerHeight,d=l/2,u=h/2,c=r<=d,p=r>d,v=a<=u,f=a>u,m=r>=.25*l&&r<=.75*l,g=this.$el.outerWidth(),_=this.$el.outerHeight(),y=a+o/2-_/2,k=r+s/2-g/2,b=e?"fixed":"absolute",w=m?g:g/2+s,C=_/2,E=v?_/2:0,x=c&&!m?g/2-s:0,O=s,T=f?"bottom":"top",L=2*s,$=L,B=_/2-$/2,D=g/2-L/2,S={};S.top=v?y+"px":"",S.right=p?l-k-g+"px":"",S.bottom=f?h-y-_+"px":"",S.left=c?k+"px":"",S.position=b,t(this.wrapper).css(S),t(this.contentEl).css({width:w+"px",height:C+"px",top:E+"px",right:"0px",bottom:"0px",left:x+"px",padding:O+"px",verticalAlign:T}),t(this.waveEl).css({top:B+"px",left:D+"px",width:L+"px",height:$+"px"})}},{key:"open",value:function(){this.isOpen||("function"==typeof this.options.onOpen&&this.options.onOpen.call(this,this.$origin[0]),this.isOpen=!0,this.wrapper.classList.add("open"),document.body.addEventListener("click",this._handleDocumentClickBound,!0),document.body.addEventListener("touchend",this._handleDocumentClickBound))}},{key:"close",value:function(){this.isOpen&&("function"==typeof this.options.onClose&&this.options.onClose.call(this,this.$origin[0]),this.isOpen=!1,this.wrapper.classList.remove("open"),document.body.removeEventListener("click",this._handleDocumentClickBound,!0),document.body.removeEventListener("touchend",this._handleDocumentClickBound))}}],[{key:"init",value:function(t,e){return _get(n.__proto__||Object.getPrototypeOf(n),"init",this).call(this,this,t,e)}},{key:"getInstance",value:function(t){return(t.jquery?t[0]:t).M_TapTarget}},{key:"defaults",get:function(){return e}}]),n}();M.TapTarget=i,M.jQueryLoaded&&M.initializeJqueryWrapper(i,"tapTarget","M_TapTarget")}(cash),function(t){"use strict";var e={classes:"",dropdownOptions:{}},i=function(i){function n(e,i){_classCallCheck(this,n);var s=_possibleConstructorReturn(this,(n.__proto__||Object.getPrototypeOf(n)).call(this,n,e,i));return s.$el.hasClass("browser-default")?_possibleConstructorReturn(s):(s.el.M_FormSelect=s,s.options=t.extend({},n.defaults,i),s.isMultiple=s.$el.prop("multiple"),s.el.tabIndex=-1,s._keysSelected={},s._valueDict={},s._setupDropdown(),s._setupEventHandlers(),s)}return _inherits(n,Component),_createClass(n,[{key:"destroy",value:function(){this._removeEventHandlers(),this._removeDropdown(),this.el.M_FormSelect=void 0}},{key:"_setupEventHandlers",value:function(){var e=this;this._handleSelectChangeBound=this._handleSelectChange.bind(this),this._handleOptionClickBound=this._handleOptionClick.bind(this),this._handleInputClickBound=this._handleInputClick.bind(this),t(this.dropdownOptions).find("li:not(.optgroup)").each(function(t){t.addEventListener("click",e._handleOptionClickBound)}),this.el.addEventListener("change",this._handleSelectChangeBound),this.input.addEventListener("click",this._handleInputClickBound)}},{key:"_removeEventHandlers",value:function(){var e=this;t(this.dropdownOptions).find("li:not(.optgroup)").each(function(t){t.removeEventListener("click",e._handleOptionClickBound)}),this.el.removeEventListener("change",this._handleSelectChangeBound),this.input.removeEventListener("click",this._handleInputClickBound)}},{key:"_handleSelectChange",value:function(t){this._setValueToInput()}},{key:"_handleOptionClick",value:function(e){e.preventDefault();var i=t(e.target).closest("li")[0],n=i.id;if(!t(i).hasClass("disabled")&&!t(i).hasClass("optgroup")&&n.length){var s=!0;if(this.isMultiple){var o=t(this.dropdownOptions).find("li.disabled.selected");o.length&&(o.removeClass("selected"),o.find('input[type="checkbox"]').prop("checked",!1),this._toggleEntryFromArray(o[0].id));var a=t(i).find('input[type="checkbox"]');a.prop("checked",!a.prop("checked")),s=this._toggleEntryFromArray(n)}else t(this.dropdownOptions).find("li").removeClass("active"),t(i).toggleClass("active"),this.input.value=i.textContent;this._activateOption(t(this.dropdownOptions),i),t(this._valueDict[n].el).prop("selected",s),this.$el.trigger("change")}e.stopPropagation()}},{key:"_handleInputClick",value:function(){this.dropdown&&this.dropdown.isOpen&&(this._setValueToInput(),this._setSelectedStates())}},{key:"_setupDropdown",value:function(){var e=this;this.wrapper=document.createElement("div"),t(this.wrapper).addClass("select-wrapper "+this.options.classes),this.$el.before(t(this.wrapper)),this.wrapper.appendChild(this.el),this.el.disabled&&this.wrapper.classList.add("disabled"),this.$selectOptions=this.$el.children("option, optgroup"),this.dropdownOptions=document.createElement("ul"),this.dropdownOptions.id="select-options-"+M.guid(),t(this.dropdownOptions).addClass("dropdown-content select-dropdown "+(this.isMultiple?"multiple-select-dropdown":"")),this.$selectOptions.length&&this.$selectOptions.each(function(i){if(t(i).is("option")){var n=void 0;n=e.isMultiple?e._appendOptionWithIcon(e.$el,i,"multiple"):e._appendOptionWithIcon(e.$el,i),e._addOptionToValueDict(i,n)}else if(t(i).is("optgroup")){var s=t(i).children("option");t(e.dropdownOptions).append(t('<li class="optgroup"><span>'+i.getAttribute("label")+"</span></li>")[0]),s.each(function(t){var i=e._appendOptionWithIcon(e.$el,t,"optgroup-option");e._addOptionToValueDict(t,i)})}}),this.$el.after(this.dropdownOptions),this.input=document.createElement("input"),t(this.input).addClass("select-dropdown dropdown-trigger"),this.input.setAttribute("type","text"),this.input.setAttribute("readonly","true"),this.input.setAttribute("data-target",this.dropdownOptions.id),this.el.disabled&&t(this.input).prop("disabled","true"),this.$el.before(this.input),this._setValueToInput();var i=t('<svg class="caret" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>');if(this.$el.before(i[0]),!this.el.disabled){var n=t.extend({},this.options.dropdownOptions);n.onOpenEnd=function(i){var n=t(e.dropdownOptions).find(".selected").first();if(e.dropdown.isScrollable&&n.length){var s=n[0].getBoundingClientRect().top-e.dropdownOptions.getBoundingClientRect().top;s-=e.dropdownOptions.clientHeight/2,e.dropdownOptions.scrollTop=s}},this.isMultiple&&(n.closeOnClick=!1),this.dropdown=M.Dropdown.init(this.input,n)}this._setSelectedStates()}},{key:"_addOptionToValueDict",value:function(t,e){var i=Object.keys(this._valueDict).length,n=this.dropdownOptions.id+i,s={};e.id=n,s.el=t,s.optionEl=e,this._valueDict[n]=s}},{key:"_removeDropdown",value:function(){t(this.wrapper).find(".caret").remove(),t(this.input).remove(),t(this.dropdownOptions).remove(),t(this.wrapper).before(this.$el),t(this.wrapper).remove()}},{key:"_appendOptionWithIcon",value:function(e,i,n){var s=i.disabled?"disabled ":"",o="optgroup-option"===n?"optgroup-option ":"",a=this.isMultiple?'<label><input type="checkbox"'+s+'"/><span>'+i.innerHTML+"</span></label>":i.innerHTML,r=t("<li></li>"),l=t("<span></span>");l.html(a),r.addClass(s+" "+o),r.append(l);var h=i.getAttribute("data-icon");i.getAttribute("class");if(h){var d=t('<img alt="" src="'+h+'">');r.prepend(d)}return t(this.dropdownOptions).append(r[0]),r[0]}},{key:"_toggleEntryFromArray",value:function(e){var i=!this._keysSelected.hasOwnProperty(e);return i?this._keysSelected[e]=!0:delete this._keysSelected[e],t(this._valueDict[e].optionEl).toggleClass("active"),t(this._valueDict[e].el).prop("selected",i),i}},{key:"_setValueToInput",value:function(){var e="";if(this.$el.find("option").each(function(i){if(t(i).prop("selected")){var n=t(i).text();e+=""===e?n:", "+n}}),""===e){var i=this.$el.find("option:disabled").eq(0);i.length&&(e=i.text())}this.input.value=e}},{key:"_setSelectedStates",value:function(){this._keysSelected={};for(var e in this._valueDict){var i=this._valueDict[e];t(i.el).prop("selected")?(t(i.optionEl).find('input[type="checkbox"]').prop("checked",!0),this._activateOption(t(this.dropdownOptions),t(i.optionEl)),this._keysSelected[e]=!0):(t(i.optionEl).find('input[type="checkbox"]').prop("checked",!1),t(i.optionEl).removeClass("selected"))}}},{key:"_activateOption",value:function(e,i){i&&(this.isMultiple||e.find("li.selected").removeClass("selected"),t(i).addClass("selected"))}},{key:"getSelectedValues",value:function(){var t=[];for(var e in this._keysSelected)t.push(this._valueDict[e].el.value);return t}}],[{key:"init",value:function(t,e){return _get(n.__proto__||Object.getPrototypeOf(n),"init",this).call(this,this,t,e)}},{key:"getInstance",value:function(t){return(t.jquery?t[0]:t).M_FormSelect}},{key:"defaults",get:function(){return e}}]),n}();M.FormSelect=i,M.jQueryLoaded&&M.initializeJqueryWrapper(i,"formSelect","M_FormSelect")}(cash),function(t,e){"use strict";var i={},n=function(n){function s(e,i){_classCallCheck(this,s);var n=_possibleConstructorReturn(this,(s.__proto__||Object.getPrototypeOf(s)).call(this,s,e,i));return n.el.M_Range=n,n.options=t.extend({},s.defaults,i),n._mousedown=!1,n._setupThumb(),n._setupEventHandlers(),n}return _inherits(s,Component),_createClass(s,[{key:"destroy",value:function(){this._removeEventHandlers(),this._removeThumb(),this.el.M_Range=void 0}},{key:"_setupEventHandlers",value:function(){this._handleRangeChangeBound=this._handleRangeChange.bind(this),this._handleRangeFocusBound=this._handleRangeFocus.bind(this),this._handleRangeMousedownTouchstartBound=this._handleRangeMousedownTouchstart.bind(this),this._handleRangeInputMousemoveTouchmoveBound=this._handleRangeInputMousemoveTouchmove.bind(this),this._handleRangeMouseupTouchendBound=this._handleRangeMouseupTouchend.bind(this),this._handleRangeBlurMouseoutTouchleaveBound=this._handleRangeBlurMouseoutTouchleave.bind(this),this.el.addEventListener("change",this._handleRangeChangeBound),this.el.addEventListener("focus",this._handleRangeFocusBound),this.el.addEventListener("mousedown",this._handleRangeMousedownTouchstartBound),this.el.addEventListener("touchstart",this._handleRangeMousedownTouchstartBound),this.el.addEventListener("input",this._handleRangeInputMousemoveTouchmoveBound),this.el.addEventListener("mousemove",this._handleRangeInputMousemoveTouchmoveBound),this.el.addEventListener("touchmove",this._handleRangeInputMousemoveTouchmoveBound),this.el.addEventListener("mouseup",this._handleRangeMouseupTouchendBound),this.el.addEventListener("touchend",this._handleRangeMouseupTouchendBound),this.el.addEventListener("blur",this._handleRangeBlurMouseoutTouchleaveBound),this.el.addEventListener("mouseout",this._handleRangeBlurMouseoutTouchleaveBound),this.el.addEventListener("touchleave",this._handleRangeBlurMouseoutTouchleaveBound)}},{key:"_removeEventHandlers",value:function(){this.el.removeEventListener("change",this._handleRangeChangeBound),this.el.removeEventListener("focus",this._handleRangeFocusBound),this.el.removeEventListener("mousedown",this._handleRangeMousedownTouchstartBound),this.el.removeEventListener("touchstart",this._handleRangeMousedownTouchstartBound),this.el.removeEventListener("input",this._handleRangeInputMousemoveTouchmoveBound),this.el.removeEventListener("mousemove",this._handleRangeInputMousemoveTouchmoveBound),this.el.removeEventListener("touchmove",this._handleRangeInputMousemoveTouchmoveBound),this.el.removeEventListener("mouseup",this._handleRangeMouseupTouchendBound),this.el.removeEventListener("touchend",this._handleRangeMouseupTouchendBound),this.el.removeEventListener("blur",this._handleRangeBlurMouseoutTouchleaveBound),this.el.removeEventListener("mouseout",this._handleRangeBlurMouseoutTouchleaveBound),this.el.removeEventListener("touchleave",this._handleRangeBlurMouseoutTouchleaveBound)}},{key:"_handleRangeChange",value:function(){t(this.value).html(this.$el.val()),t(this.thumb).hasClass("active")||this._showRangeBubble();var e=this._calcRangeOffset();t(this.thumb).addClass("active").css("left",e+"px")}},{key:"_handleRangeFocus",value:function(){M.tabPressed&&this.$el.addClass("focused")}},{key:"_handleRangeMousedownTouchstart",value:function(e){if(t(this.value).html(this.$el.val()),this._mousedown=!0,this.$el.addClass("active"),t(this.thumb).hasClass("active")||this._showRangeBubble(),"input"!==e.type){var i=this._calcRangeOffset();t(this.thumb).addClass("active").css("left",i+"px")}}},{key:"_handleRangeInputMousemoveTouchmove",value:function(){if(this._mousedown){t(this.thumb).hasClass("active")||this._showRangeBubble();var e=this._calcRangeOffset();t(this.thumb).addClass("active").css("left",e+"px"),t(this.value).html(this.$el.val())}}},{key:"_handleRangeMouseupTouchend",value:function(){this._mousedown=!1,this.$el.removeClass("active")}},{key:"_handleRangeBlurMouseoutTouchleave",value:function(){if(!this._mousedown){this.$el.removeClass("focused");var i=7+parseInt(this.$el.css("padding-left"))+"px";t(this.thumb).hasClass("active")&&(e.remove(this.thumb),e({targets:this.thumb,height:0,width:0,top:10,easing:"easeOutQuad",marginLeft:i,duration:100})),t(this.thumb).removeClass("active")}}},{key:"_setupThumb",value:function(){this.thumb=document.createElement("span"),this.value=document.createElement("span"),t(this.thumb).addClass("thumb"),t(this.value).addClass("value"),t(this.thumb).append(this.value),this.$el.after(this.thumb)}},{key:"_removeThumb",value:function(){t(this.thumb).remove()}},{key:"_showRangeBubble",value:function(){var i=-7+parseInt(t(this.thumb).parent().css("padding-left"))+"px";e.remove(this.thumb),e({targets:this.thumb,height:30,width:30,top:-30,marginLeft:i,duration:300,easing:"easeOutQuint"})}},{key:"_calcRangeOffset",value:function(){var t=this.$el.width()-15,e=parseFloat(this.$el.attr("max")),i=parseFloat(this.$el.attr("min"));return(parseFloat(this.$el.val())-i)/(e-i)*t}}],[{key:"init",value:function(t,e){return _get(s.__proto__||Object.getPrototypeOf(s),"init",this).call(this,this,t,e)}},{key:"getInstance",value:function(t){return(t.jquery?t[0]:t).M_Range}},{key:"defaults",get:function(){return i}}]),s}();M.Range=n,M.jQueryLoaded&&M.initializeJqueryWrapper(n,"range","M_Range"),n.init(t("input[type=range]"))}(cash,M.anime);
(function ($, anim) {
  'use strict';

  let _defaults = {
    direction: 'top',
    hoverEnabled: true,
    toolbarEnabled: false
  };

  $.fn.reverse = [].reverse;

  /**
   * @class
   *
   */
  class FloatingActionButton extends Component {
    /**
     * Construct FloatingActionButton instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(FloatingActionButton, el, options);

      this.el.M_FloatingActionButton = this;

      /**
       * Options for the fab
       * @member FloatingActionButton#options
       * @prop {Boolean} [direction] - Direction fab menu opens
       * @prop {Boolean} [hoverEnabled=true] - Enable hover vs click
       * @prop {Boolean} [toolbarEnabled=false] - Enable toolbar transition
       */
      this.options = $.extend({}, FloatingActionButton.defaults, options);

      this.isOpen = false;
      this.$anchor = this.$el.children('a').first();
      this.$menu = this.$el.children('ul').first();
      this.$floatingBtns = this.$el.find('ul .btn-floating');
      this.$floatingBtnsReverse = this.$el.find('ul .btn-floating').reverse();
      this.offsetY = 0;
      this.offsetX = 0;
      if (this.options.direction === 'top') {
        this.$el.addClass('direction-top');
        this.offsetY = 40;
      } else if (this.options.direction === 'right') {
        this.$el.addClass('direction-right');
        this.offsetX = -40;
      } else if (this.options.direction === 'bottom') {
        this.$el.addClass('direction-bottom');
        this.offsetY = -40;
      } else {
        this.$el.addClass('direction-left');
        this.offsetX = 40;
      }
      this._setupEventHandlers();
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_FloatingActionButton;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this.el.M_FloatingActionButton = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleFABClickBound = this._handleFABClick.bind(this);
      this._handleOpenBound = this.open.bind(this);
      this._handleCloseBound = this.close.bind(this);

      if (this.options.hoverEnabled && !this.options.toolbarEnabled) {
        this.el.addEventListener('mouseenter', this._handleOpenBound);
        this.el.addEventListener('mouseleave', this._handleCloseBound);

      } else {
        this.el.addEventListener('click', this._handleFABClickBound);
      }
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      if (this.options.hoverEnabled && !this.options.toolbarEnabled) {
        this.el.removeEventListener('mouseenter', this._handleOpenBound);
        this.el.removeEventListener('mouseleave', this._handleCloseBound);

      } else {
        this.el.removeEventListener('click', this._handleFABClickBound);
      }
    }

    /**
     * Handle FAB Click
     */
    _handleFABClick() {
      if (this.isOpen) {
        this.close();

      } else {
        this.open();
      }
    }

    /**
     * Handle Document Click
     * @param {Event} e
     */
    _handleDocumentClick(e) {
      if (!$(e.target).closest(this.$menu).length) {
        this.close();
      }
    }

    /**
     * Open FAB
     */
    open() {
      if (this.isOpen) {
        return;
      }

      if (this.options.toolbarEnabled) {
        this._animateInToolbar();
      } else {
        this._animateInFAB();
      }
      this.isOpen = true;
    }

    /**
     * Close FAB
     */
    close() {
      if (!this.isOpen) {
        return;
      }

      if (this.options.toolbarEnabled) {
        window.removeEventListener('scroll', this._handleCloseBound, true);
        document.body.removeEventListener('click', this._handleDocumentClickBound, true);
        this._animateOutToolbar();
      } else {
        this._animateOutFAB();
      }
      this.isOpen = false;
    }

    /**
     * Classic FAB Menu open
     */
    _animateInFAB() {
      this.$el.addClass('active');

      let time = 0;
      this.$floatingBtnsReverse.each((el) => {
        anim({
          targets: el,
          opacity: 1,
          scale: [.4, 1],
          translateY: [this.offsetY, 0],
          translateX: [this.offsetX, 0],
          duration: 275,
          delay: time,
          easing: 'easeInOutQuad'
        });
        time += 40;
      });
    }

    /**
     * Classic FAB Menu close
     */
    _animateOutFAB() {
      this.$floatingBtnsReverse.each((el) => {
        anim.remove(el);
        anim({
          targets: el,
          opacity: 0,
          scale: .4,
          translateY: this.offsetY,
          translateX: this.offsetX,
          duration: 175,
          easing: 'easeOutQuad',
          complete: () => {
            this.$el.removeClass('active');
          }
        });
      });
    }

    /**
     * Toolbar transition Menu open
     */
    _animateInToolbar() {
      let scaleFactor;
      let windowWidth = window.innerWidth;
      let windowHeight = window.innerHeight;
      let btnRect = this.el.getBoundingClientRect();
      let backdrop = $('<div class="fab-backdrop"></div>');
      let fabColor = this.$anchor.css('background-color');
      this.$anchor.append(backdrop);

      this.offsetX = btnRect.left - (windowWidth / 2) + (btnRect.width / 2);
      this.offsetY = windowHeight - btnRect.bottom;
      scaleFactor = windowWidth / backdrop[0].clientWidth;
      this.btnBottom = btnRect.bottom;
      this.btnLeft = btnRect.left;
      this.btnWidth = btnRect.width;

      // Set initial state
      this.$el.addClass('active');
      this.$el.css({
        'text-align': 'center',
        width: '100%',
        bottom: 0,
        left: 0,
        transform: 'translateX(' + this.offsetX + 'px)',
        transition: 'none'
      });
      this.$anchor.css({
        transform: 'translateY(' + -this.offsetY + 'px)',
        transition: 'none'
      });
      backdrop.css({
        'background-color': fabColor
      });


      setTimeout(() => {
        this.$el.css({
          transform: '',
          transition: 'transform .2s cubic-bezier(0.550, 0.085, 0.680, 0.530), background-color 0s linear .2s'
        });
        this.$anchor.css({
          overflow: 'visible',
          transform: '',
          transition: 'transform .2s'
        });

        setTimeout(() => {
          this.$el.css({
            overflow: 'hidden',
            'background-color': fabColor
          });
          backdrop.css({
            transform: 'scale(' + scaleFactor + ')',
            transition: 'transform .2s cubic-bezier(0.550, 0.055, 0.675, 0.190)'
          });
          this.$menu.children('li').children('a').css({
            opacity: 1
          });

          // Scroll to close.
          this._handleDocumentClickBound = this._handleDocumentClick.bind(this);
          window.addEventListener('scroll', this._handleCloseBound, true);
          document.body.addEventListener('click', this._handleDocumentClickBound, true);
        }, 100);
      }, 0);
    }

    /**
     * Toolbar transition Menu close
     */
    _animateOutToolbar() {
      let windowWidth = window.innerWidth;
      let windowHeight = window.innerHeight;
      let backdrop = this.$el.find('.fab-backdrop');
      let fabColor = this.$anchor.css('background-color');

      this.offsetX = this.btnLeft - (windowWidth / 2) + (this.btnWidth / 2);
      this.offsetY = windowHeight - this.btnBottom;

      // Hide backdrop
      this.$el.removeClass('active');
      this.$el.css({
        'background-color': 'transparent',
        transition: 'none'
      });
      this.$anchor.css({
        transition: 'none'
      });
      backdrop.css({
        transform: 'scale(0)',
        'background-color': fabColor
      });
      this.$menu.children('li').children('a').css({
        opacity: ''
      });

      setTimeout(() => {
        backdrop.remove();

        // Set initial state.
        this.$el.css({
          'text-align': '',
          width: '',
          bottom: '',
          left: '',
          overflow: '',
          'background-color': '',
          transform: 'translate3d(' + -this.offsetX + 'px,0,0)'
        });
        this.$anchor.css({
          overflow: '',
          transform: 'translate3d(0,' + this.offsetY + 'px,0)'
        });

        setTimeout(() => {
          this.$el.css({
            transform: 'translate3d(0,0,0)',
            transition: 'transform .2s'
          });
          this.$anchor.css({
            transform: 'translate3d(0,0,0)',
            transition: 'transform .2s cubic-bezier(0.550, 0.055, 0.675, 0.190)'
          });
        }, 20);
      }, 200);
    }
  }

  M.FloatingActionButton = FloatingActionButton;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(FloatingActionButton, 'floatingActionButton', 'M_FloatingActionButton');
  }

}(cash, M.anime));
(function ($, anim) {
  $(document).on('click', '.card', function (e) {
    if ($(this).children('.card-reveal').length) {
      var $card = $(e.target).closest('.card');
      if ($card.data('initialOverflow') === undefined) {
        $card.data(
          'initialOverflow',
          $card.css('overflow') === undefined ? '' : $card.css('overflow')
        );
      }
      let $cardReveal = $(this).find('.card-reveal');
      if ($(e.target).is($('.card-reveal .card-title')) || $(e.target).is($('.card-reveal .card-title i'))) {
        // Make Reveal animate down and display none
        anim({
          targets: $cardReveal[0],
          translateY: 0,
          duration: 225,
          easing: 'easeInOutQuad',
          complete: function(anim) {
            let el = anim.animatables[0].target;
            $(el).css({ display: 'none'});
            $card.css('overflow', $card.data('initialOverflow'));
          }
        });
      }
      else if ($(e.target).is($('.card .activator')) ||
               $(e.target).is($('.card .activator i')) ) {
        $card.css('overflow', 'hidden');
        $cardReveal.css({ display: 'block'});
        anim({
          targets: $cardReveal[0],
          translateY: '-100%',
          duration: 300,
          easing: 'easeInOutQuad'
        });
      }
    }
  });
}( cash, M.anime));
(function ($) {
  'use strict';

  let _defaults = {
    duration: 200, // ms
    dist: -100, // zoom scale TODO: make this more intuitive as an option
    shift: 0, // spacing for center image
    padding: 0, // Padding between non center items
    numVisible: 5, // Number of visible items in carousel
    fullWidth: false, // Change to full width styles
    indicators: false, // Toggle indicators
    noWrap: false, // Don't wrap around and cycle through items.
    onCycleTo: null // Callback for when a new slide is cycled to.
  };


  /**
   * @class
   *
   */
  class Carousel extends Component {
    /**
     * Construct Carousel instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Carousel, el, options);

      this.el.M_Carousel = this;

      /**
       * Options for the carousel
       * @member Carousel#options
       * @prop {Number} duration
       * @prop {Number} dist
       * @prop {Number} shift
       * @prop {Number} padding
       * @prop {Number} numVisible
       * @prop {Boolean} fullWidth
       * @prop {Boolean} indicators
       * @prop {Boolean} noWrap
       * @prop {Function} onCycleTo
       */
      this.options = $.extend({}, Carousel.defaults, options);

      // Setup
      this.hasMultipleSlides = this.$el.find('.carousel-item').length > 1;
      this.showIndicators = this.options.indicators && this.hasMultipleSlides;
      this.noWrap = this.options.noWrap || !this.hasMultipleSlides;
      this.pressed = false;
      this.dragged = false;
      this.offset = this.target = 0;
      this.images = [];
      this.itemWidth = this.$el.find('.carousel-item').first().innerWidth();
      this.itemHeight = this.$el.find('.carousel-item').first().innerHeight();
      this.dim = this.itemWidth * 2 + this.options.padding || 1; // Make sure dim is non zero for divisions.
      this._autoScrollBound = this._autoScroll.bind(this);
      this._trackBound = this._track.bind(this);

      // Full Width carousel setup
      if (this.options.fullWidth) {
        this.options.dist = 0;
        this._setCarouselHeight();

        // Offset fixed items when indicators.
        if (this.showIndicators) {
          this.$el.find('.carousel-fixed-item').addClass('with-indicators');
        }
      }

      // Iterate through slides
      this.$indicators = $('<ul class="indicators"></ul>');
      this.$el.find('.carousel-item').each((el, i) => {
        this.images.push(el);
        if (this.showIndicators) {
          let $indicator = $('<li class="indicator-item"></li>');

          // Add active to first by default.
          if (i === 0) {
            $indicator[0].classList.add('active');
          }

          this.$indicators.append($indicator);
        }
      });
      if (this.showIndicators) {
        this.$el.append(this.$indicators);
      }
      this.count = this.images.length;

      // Cap numVisible at count
      this.options.numVisible = Math.min(this.count, this.options.numVisible);

      // Setup cross browser string
      this.xform = 'transform';
      ['webkit', 'Moz', 'O', 'ms'].every((prefix) => {
        var e = prefix + 'Transform';
        if (typeof document.body.style[e] !== 'undefined') {
          this.xform = e;
          return false;
        }
        return true;
      });

      this._setupEventHandlers();
      this._scroll(this.offset);
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Carousel;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this.el.M_Carousel = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleCarouselTapBound = this._handleCarouselTap.bind(this);
      this._handleCarouselDragBound = this._handleCarouselDrag.bind(this);
      this._handleCarouselReleaseBound = this._handleCarouselRelease.bind(this);
      this._handleCarouselClickBound = this._handleCarouselClick.bind(this);

      if (typeof window.ontouchstart !== 'undefined') {
        this.el.addEventListener('touchstart', this._handleCarouselTapBound);
        this.el.addEventListener('touchmove', this._handleCarouselDragBound);
        this.el.addEventListener('touchend', this._handleCarouselReleaseBound);
      }

      this.el.addEventListener('mousedown', this._handleCarouselTapBound);
      this.el.addEventListener('mousemove', this._handleCarouselDragBound);
      this.el.addEventListener('mouseup', this._handleCarouselReleaseBound);
      this.el.addEventListener('mouseleave', this._handleCarouselReleaseBound);
      this.el.addEventListener('click', this._handleCarouselClickBound);

      if (this.showIndicators && this.$indicators) {
        this._handleIndicatorClickBound = this._handleIndicatorClick.bind(this);
        this.$indicators.find('.indicator-item').each((el, i) => {
          el.addEventListener('click', this._handleIndicatorClickBound);
        });
      }

      // Resize
      let throttledResize = M.throttle(this._handleResize, 200);
      this._handleThrottledResizeBound = throttledResize.bind(this);

      window.addEventListener('resize', this._handleThrottledResizeBound);
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      if (typeof window.ontouchstart !== 'undefined') {
        this.el.removeEventListener('touchstart', this._handleCarouselTapBound);
        this.el.removeEventListener('touchmove', this._handleCarouselDragBound);
        this.el.removeEventListener('touchend', this._handleCarouselReleaseBound);
      }
      this.el.removeEventListener('mousedown', this._handleCarouselTapBound);
      this.el.removeEventListener('mousemove', this._handleCarouselDragBound);
      this.el.removeEventListener('mouseup', this._handleCarouselReleaseBound);
      this.el.removeEventListener('mouseleave', this._handleCarouselReleaseBound);
      this.el.removeEventListener('click', this._handleCarouselClickBound);

      if (this.showIndicators && this.$indicators) {
        this.$indicators.find('.indicator-item').each((el, i) => {
          el.removeEventListener('click', this._handleIndicatorClickBound);
        });
      }

      window.removeEventListener('resize', this._handleThrottledResizeBound);
    }

    /**
     * Handle Carousel Tap
     * @param {Event} e
     */
    _handleCarouselTap(e) {
      // Fixes firefox draggable image bug
      if (e.type === 'mousedown' && $(e.target).is('img')) {
        e.preventDefault();
      }
      this.pressed = true;
      this.dragged = false;
      this.verticalDragged = false;
      this.reference = this._xpos(e);
      this.referenceY = this._ypos(e);

      this.velocity = this.amplitude = 0;
      this.frame = this.offset;
      this.timestamp = Date.now();
      clearInterval(this.ticker);
      this.ticker = setInterval(this._trackBound, 100);
    }

    /**
     * Handle Carousel Drag
     * @param {Event} e
     */
    _handleCarouselDrag(e) {
      let x, y, delta, deltaY;
      if (this.pressed) {
        x = this._xpos(e);
        y = this._ypos(e);
        delta = this.reference - x;
        deltaY = Math.abs(this.referenceY - y);
        if (deltaY < 30 && !this.verticalDragged) {
          // If vertical scrolling don't allow dragging.
          if (delta > 2 || delta < -2) {
            this.dragged = true;
            this.reference = x;
            this._scroll(this.offset + delta);
          }

        } else if (this.dragged) {
          // If dragging don't allow vertical scroll.
          e.preventDefault();
          e.stopPropagation();
          return false;

        } else {
          // Vertical scrolling.
          this.verticalDragged = true;
        }
      }

      if (this.dragged) {
        // If dragging don't allow vertical scroll.
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }

    /**
     * Handle Carousel Release
     * @param {Event} e
     */
    _handleCarouselRelease(e) {
      if (this.pressed) {
        this.pressed = false;
      } else {
        return;
      }

      clearInterval(this.ticker);
      this.target = this.offset;
      if (this.velocity > 10 || this.velocity < -10) {
        this.amplitude = 0.9 * this.velocity;
        this.target = this.offset + this.amplitude;
      }
      this.target = Math.round(this.target / this.dim) * this.dim;

      // No wrap of items.
      if (this.noWrap) {
        if (this.target >= this.dim * (this.count - 1)) {
          this.target = this.dim * (this.count - 1);
        } else if (this.target < 0) {
          this.target = 0;
        }
      }
      this.amplitude = this.target - this.offset;
      this.timestamp = Date.now();
      requestAnimationFrame(this._autoScrollBound);

      if (this.dragged) {
        e.preventDefault();
        e.stopPropagation();
      }
      return false;
    }

    /**
     * Handle Carousel CLick
     * @param {Event} e
     */
    _handleCarouselClick(e) {
      // Disable clicks if carousel was dragged.
      if (this.dragged) {
        e.preventDefault();
        e.stopPropagation();
        return false;

      } else if (!this.options.fullWidth) {
        let clickedIndex = $(e.target).closest('.carousel-item').index();
        let diff = this._wrap(this.center) - clickedIndex;

        // Disable clicks if carousel was shifted by click
        if (diff !== 0) {
          e.preventDefault();
          e.stopPropagation();
        }
        this._cycleTo(clickedIndex);
      }
    }

    /**
     * Handle Indicator CLick
     * @param {Event} e
     */
    _handleIndicatorClick(e) {
      e.stopPropagation();

      let indicator = $(e.target).closest('.indicator-item');
      if (indicator.length) {
        this._cycleTo(indicator.index());
      }
    }

    /**
     * Handle Throttle Resize
     * @param {Event} e
     */
    _handleResize(e) {
      if (this.options.fullWidth) {
        this.itemWidth = this.$el.find('.carousel-item').first().innerWidth();
        this.imageHeight = this.$el.find('.carousel-item.active').height();
        this.dim = this.itemWidth * 2 + this.options.padding;
        this.offset = this.center * 2 * this.itemWidth;
        this.target = this.offset;
        this._setCarouselHeight(true);
      } else {
        this._scroll();
      }
    }


    /**
     * Set carousel height based on first slide
     * @param {Booleam} imageOnly - true for image slides
     */
    _setCarouselHeight(imageOnly) {
      let firstSlide = this.$el.find('.carousel-item.active').length ? this.$el.find('.carousel-item.active').first() : this.$el.find('.carousel-item').first();
      let firstImage = firstSlide.find('img').first();
      if (firstImage.length) {
        if (firstImage[0].complete) {
          // If image won't trigger the load event
          let imageHeight = firstImage.height();
          if (imageHeight > 0) {
            this.$el.css('height', imageHeight + 'px');
          } else {
            // If image still has no height, use the natural dimensions to calculate
            let naturalWidth = firstImage[0].naturalWidth;
            let naturalHeight = firstImage[0].naturalHeight;
            let adjustedHeight = (this.$el.width() / naturalWidth) * naturalHeight;
            this.$el.css('height', adjustedHeight + 'px');
          }
        } else {
          // Get height when image is loaded normally
          firstImage.one('load', (el, i) => {
            this.$el.css('height', el.offsetHeight + 'px');
          });
        }
      } else if (!imageOnly) {
        let slideHeight = firstSlide.height();
        this.$el.css('height', slideHeight + 'px');
      }
    }

    /**
     * Get x position from event
     * @param {Event} e
     */
    _xpos(e) {
      // touch event
      if (e.targetTouches && (e.targetTouches.length >= 1)) {
        return e.targetTouches[0].clientX;
      }

      // mouse event
      return e.clientX;
    }

    /**
     * Get y position from event
     * @param {Event} e
     */
    _ypos(e) {
      // touch event
      if (e.targetTouches && (e.targetTouches.length >= 1)) {
        return e.targetTouches[0].clientY;
      }

      // mouse event
      return e.clientY;
    }

    /**
     * Wrap index
     * @param {Number} x
     */
    _wrap(x) {
      return (x >= this.count) ? (x % this.count) : (x < 0) ? this._wrap(this.count + (x % this.count)) : x;
    }

    /**
     * Tracks scrolling information
     */
    _track() {
      let now, elapsed, delta, v;

      now = Date.now();
      elapsed = now - this.timestamp;
      this.timestamp = now;
      delta = this.offset - this.frame;
      this.frame = this.offset;

      v = 1000 * delta / (1 + elapsed);
      this.velocity = 0.8 * v + 0.2 * this.velocity;
    }

    /**
     * Auto scrolls to nearest carousel item.
     */
    _autoScroll() {
      let elapsed, delta;

      if (this.amplitude) {
        elapsed = Date.now() - this.timestamp;
        delta = this.amplitude * Math.exp(-elapsed / this.options.duration);
        if (delta > 2 || delta < -2) {
          this._scroll(this.target - delta);
          requestAnimationFrame(this._autoScrollBound);
        } else {
          this._scroll(this.target);
        }
      }
    }

    /**
     * Scroll to target
     * @param {Number} x
     */
    _scroll(x) {
      // Track scrolling state
      if (!this.$el.hasClass('scrolling')) {
        this.el.classList.add('scrolling');
      }
      if (this.scrollingTimeout != null) {
        window.clearTimeout(this.scrollingTimeout);
      }
      this.scrollingTimeout = window.setTimeout(() => {
        this.$el.removeClass('scrolling');
      }, this.options.duration);

      // Start actual scroll
      let i, half, delta, dir, tween, el, alignment, zTranslation, tweenedOpacity, centerTweenedOpacity;
      let lastCenter = this.center;
      let numVisibleOffset = 1 / this.options.numVisible;

      this.offset = (typeof x === 'number') ? x : this.offset;
      this.center = Math.floor((this.offset + this.dim / 2) / this.dim);
      delta = this.offset - this.center * this.dim;
      dir = (delta < 0) ? 1 : -1;
      tween = -dir * delta * 2 / this.dim;
      half = this.count >> 1;

      if (this.options.fullWidth) {
        alignment = 'translateX(0)';
        centerTweenedOpacity = 1;
      } else {
        alignment = 'translateX(' + (this.el.clientWidth - this.itemWidth) / 2 + 'px) ';
        alignment += 'translateY(' + (this.el.clientHeight - this.itemHeight) / 2 + 'px)';
        centerTweenedOpacity = 1 - numVisibleOffset * tween;
      }

      // Set indicator active
      if (this.showIndicators) {
        let diff = (this.center % this.count);
        let activeIndicator = this.$indicators.find('.indicator-item.active');
        if (activeIndicator.index() !== diff) {
          activeIndicator.removeClass('active');
          this.$indicators.find('.indicator-item').eq(diff)[0].classList.add('active');
        }
      }

      // center
      // Don't show wrapped items.
      if (!this.noWrap || (this.center >= 0 && this.center < this.count)) {
        el = this.images[this._wrap(this.center)];

        // Add active class to center item.
        if (!$(el).hasClass('active')) {
          this.$el.find('.carousel-item').removeClass('active');
          el.classList.add('active');
        }
        let transformString = alignment +
          ' translateX(' + (-delta / 2) + 'px)' +
          ' translateX(' + (dir * this.options.shift * tween * i) + 'px)' +
          ' translateZ(' + (this.options.dist * tween) + 'px)';
        this._updateItemStyle(el, centerTweenedOpacity, 0, transformString);
      }

      for (i = 1; i <= half; ++i) {
        // right side
        if (this.options.fullWidth) {
          zTranslation = this.options.dist;
          tweenedOpacity = (i === half && delta < 0) ? 1 - tween : 1;
        } else {
          zTranslation = this.options.dist * (i * 2 + tween * dir);
          tweenedOpacity = 1 - numVisibleOffset * (i * 2 + tween * dir);
        }
        // Don't show wrapped items.
        if (!this.noWrap || this.center + i < this.count) {
          el = this.images[this._wrap(this.center + i)];
          let transformString = alignment +
            ' translateX(' + (this.options.shift + (this.dim * i - delta) / 2) + 'px)' +
            ' translateZ(' + zTranslation + 'px)';
          this._updateItemStyle(el, tweenedOpacity, -i, transformString);
        }


        // left side
        if (this.options.fullWidth) {
          zTranslation = this.options.dist;
          tweenedOpacity = (i === half && delta > 0) ? 1 - tween : 1;
        } else {
          zTranslation = this.options.dist * (i * 2 - tween * dir);
          tweenedOpacity = 1 - numVisibleOffset * (i * 2 - tween * dir);
        }
        // Don't show wrapped items.
        if (!this.noWrap || this.center - i >= 0) {
          el = this.images[this._wrap(this.center - i)];
          let transformString = alignment +
            ' translateX(' + (-this.options.shift + (-this.dim * i - delta) / 2) + 'px)' +
            ' translateZ(' + zTranslation + 'px)';
          this._updateItemStyle(el, tweenedOpacity, -i, transformString);
        }
      }

      // center
      // Don't show wrapped items.
      if (!this.noWrap || (this.center >= 0 && this.center < this.count)) {
        el = this.images[this._wrap(this.center)];
        let transformString = alignment +
          ' translateX(' + (-delta / 2) + 'px)' +
          ' translateX(' + (dir * this.options.shift * tween) + 'px)' +
          ' translateZ(' + (this.options.dist * tween) + 'px)';
        this._updateItemStyle(el, centerTweenedOpacity, 0, transformString);
      }

      // onCycleTo callback
      let $currItem = this.$el.find('.carousel-item').eq(this._wrap(this.center));
      if (lastCenter !== this.center &&
        typeof (this.options.onCycleTo) === "function") {
        this.options.onCycleTo.call(this, $currItem[0], this.dragged);
      }

      // One time callback
      if (typeof (this.oneTimeCallback) === "function") {
        this.oneTimeCallback.call(this, $currItem[0], this.dragged);
        this.oneTimeCallback = null;
      }
    }


    /**
     * Cycle to target
     * @param {Element} el
     * @param {Number} opacity
     * @param {Number} zIndex
     * @param {String} transform
     */
    _updateItemStyle(el, opacity, zIndex, transform) {
      el.style[this.xform] = transform;
      el.style.zIndex = zIndex;
      el.style.opacity = opacity;
      el.style.visibility = 'visible';
    }


    /**
     * Cycle to target
     * @param {Number} n
     * @param {Function} callback
     */
    _cycleTo(n, callback) {
      let diff = (this.center % this.count) - n;

      // Account for wraparound.
      if (!this.noWrap) {
        if (diff < 0) {
          if (Math.abs(diff + this.count) < Math.abs(diff)) {
            diff += this.count;
          }

        } else if (diff > 0) {
          if (Math.abs(diff - this.count) < diff) {
            diff -= this.count;
          }
        }
      }

      this.target = (this.dim * Math.round(this.offset / this.dim));
      // Next
      if (diff < 0) {
        this.target += (this.dim * Math.abs(diff));

        // Prev
      } else if (diff > 0) {
        this.target -= (this.dim * diff);
      }

      // Set one time callback
      if (typeof (callback) === "function") {
        this.oneTimeCallback = callback;
      }

      // Scroll
      if (this.offset !== this.target) {
        this.amplitude = this.target - this.offset;
        this.timestamp = Date.now();
        requestAnimationFrame(this._autoScrollBound);
      }
    }


    /**
     * Cycle to next item
     * @param {Number} [n]
     */
    next(n) {
      if (n === undefined || isNaN(n)) {
        n = 1;
      }

      let index = this.center + n;
      if (index > this.count || index < 0) {
        if (this.noWrap) {
          return;
        }

        index = this._wrap(index);
      }
      this._cycleTo(index);
    }

    /**
     * Cycle to previous item
     * @param {Number} [n]
     */
    prev(n) {
      if (n === undefined || isNaN(n)) {
        n = 1;
      }

      let index = this.center - n;
      if (index > this.count || index < 0) {
        if (this.noWrap) {
          return;
        }

        index = this._wrap(index);
      }

      this._cycleTo(index);
    }

    /**
     * Cycle to nth item
     * @param {Number} [n]
     * @param {Function} callback
     */
    set(n, callback) {
      if (n === undefined || isNaN(n)) {
        n = 0;
      }

      if (n > this.count || n < 0) {
        if (this.noWrap) {
          return;
        }

        n = this._wrap(n);
      }

      this._cycleTo(n, callback);
    }
  }

  M.Carousel = Carousel;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Carousel, 'carousel', 'M_Carousel');
  }

}(cash));
/*! cash-dom 1.3.5, https://github.com/kenwheeler/cash @license MIT */

(function (factory) {
  window.cash = factory();
})(function () {
  var doc = document, win = window, ArrayProto = Array.prototype, slice = ArrayProto.slice, filter = ArrayProto.filter, push = ArrayProto.push;

  var noop = function () {}, isFunction = function (item) {
    // @see https://crbug.com/568448
    return typeof item === typeof noop && item.call;
  }, isString = function (item) {
    return typeof item === typeof "";
  };

  var idMatch = /^#[\w-]*$/, classMatch = /^\.[\w-]*$/, htmlMatch = /<.+>/, singlet = /^\w+$/;

  function find(selector, context) {
    context = context || doc;
    var elems = (classMatch.test(selector) ? context.getElementsByClassName(selector.slice(1)) : singlet.test(selector) ? context.getElementsByTagName(selector) : context.querySelectorAll(selector));
    return elems;
  }

  var frag;
  function parseHTML(str) {
    if (!frag) {
      frag = doc.implementation.createHTMLDocument(null);
      var base = frag.createElement("base");
      base.href = doc.location.href;
      frag.head.appendChild(base);
    }

    frag.body.innerHTML = str;

    return frag.body.childNodes;
  }

  function onReady(fn) {
    if (doc.readyState !== "loading") {
      fn();
    } else {
      doc.addEventListener("DOMContentLoaded", fn);
    }
  }

  function Init(selector, context) {
    if (!selector) {
      return this;
    }

    // If already a cash collection, don't do any further processing
    if (selector.cash && selector !== win) {
      return selector;
    }

    var elems = selector, i = 0, length;

    if (isString(selector)) {
      elems = (idMatch.test(selector) ?
      // If an ID use the faster getElementById check
      doc.getElementById(selector.slice(1)) : htmlMatch.test(selector) ?
      // If HTML, parse it into real elements
      parseHTML(selector) :
      // else use `find`
      find(selector, context));

      // If function, use as shortcut for DOM ready
    } else if (isFunction(selector)) {
      onReady(selector);return this;
    }

    if (!elems) {
      return this;
    }

    // If a single DOM element is passed in or received via ID, return the single element
    if (elems.nodeType || elems === win) {
      this[0] = elems;
      this.length = 1;
    } else {
      // Treat like an array and loop through each item.
      length = this.length = elems.length;
      for (; i < length; i++) {
        this[i] = elems[i];
      }
    }

    return this;
  }

  function cash(selector, context) {
    return new Init(selector, context);
  }

  var fn = cash.fn = cash.prototype = Init.prototype = { // jshint ignore:line
    cash: true,
    length: 0,
    push: push,
    splice: ArrayProto.splice,
    map: ArrayProto.map,
    init: Init
  };

  Object.defineProperty(fn, "constructor", { value: cash });

  cash.parseHTML = parseHTML;
  cash.noop = noop;
  cash.isFunction = isFunction;
  cash.isString = isString;

  cash.extend = fn.extend = function (target) {
    target = target || {};

    var args = slice.call(arguments), length = args.length, i = 1;

    if (args.length === 1) {
      target = this;
      i = 0;
    }

    for (; i < length; i++) {
      if (!args[i]) {
        continue;
      }
      for (var key in args[i]) {
        if (args[i].hasOwnProperty(key)) {
          target[key] = args[i][key];
        }
      }
    }

    return target;
  };

  function each(collection, callback) {
    var l = collection.length, i = 0;

    for (; i < l; i++) {
      if (callback.call(collection[i], collection[i], i, collection) === false) {
        break;
      }
    }
  }

  function matches(el, selector) {
    var m = el && (el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector || el.oMatchesSelector);
    return !!m && m.call(el, selector);
  }

  function getCompareFunction(selector) {
    return (
    /* Use browser's `matches` function if string */
    isString(selector) ? matches :
    /* Match a cash element */
    selector.cash ? function (el) {
      return selector.is(el);
    } :
    /* Direct comparison */
    function (el, selector) {
      return el === selector;
    });
  }

  function unique(collection) {
    return cash(slice.call(collection).filter(function (item, index, self) {
      return self.indexOf(item) === index;
    }));
  }

  cash.extend({
    merge: function (first, second) {
      var len = +second.length, i = first.length, j = 0;

      for (; j < len; i++, j++) {
        first[i] = second[j];
      }

      first.length = i;
      return first;
    },

    each: each,
    matches: matches,
    unique: unique,
    isArray: Array.isArray,
    isNumeric: function (n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

  });

  var uid = cash.uid = "_cash" + Date.now();

  function getDataCache(node) {
    return (node[uid] = node[uid] || {});
  }

  function setData(node, key, value) {
    return (getDataCache(node)[key] = value);
  }

  function getData(node, key) {
    var c = getDataCache(node);
    if (c[key] === undefined) {
      c[key] = node.dataset ? node.dataset[key] : cash(node).attr("data-" + key);
    }
    return c[key];
  }

  function removeData(node, key) {
    var c = getDataCache(node);
    if (c) {
      delete c[key];
    } else if (node.dataset) {
      delete node.dataset[key];
    } else {
      cash(node).removeAttr("data-" + name);
    }
  }

  fn.extend({
    data: function (name, value) {
      if (isString(name)) {
        return (value === undefined ? getData(this[0], name) : this.each(function (v) {
          return setData(v, name, value);
        }));
      }

      for (var key in name) {
        this.data(key, name[key]);
      }

      return this;
    },

    removeData: function (key) {
      return this.each(function (v) {
        return removeData(v, key);
      });
    }

  });

  var notWhiteMatch = /\S+/g;

  function getClasses(c) {
    return isString(c) && c.match(notWhiteMatch);
  }

  function hasClass(v, c) {
    return (v.classList ? v.classList.contains(c) : new RegExp("(^| )" + c + "( |$)", "gi").test(v.className));
  }

  function addClass(v, c, spacedName) {
    if (v.classList) {
      v.classList.add(c);
    } else if (spacedName.indexOf(" " + c + " ")) {
      v.className += " " + c;
    }
  }

  function removeClass(v, c) {
    if (v.classList) {
      v.classList.remove(c);
    } else {
      v.className = v.className.replace(c, "");
    }
  }

  fn.extend({
    addClass: function (c) {
      var classes = getClasses(c);

      return (classes ? this.each(function (v) {
        var spacedName = " " + v.className + " ";
        each(classes, function (c) {
          addClass(v, c, spacedName);
        });
      }) : this);
    },

    attr: function (name, value) {
      if (!name) {
        return undefined;
      }

      if (isString(name)) {
        if (value === undefined) {
          return this[0] ? this[0].getAttribute ? this[0].getAttribute(name) : this[0][name] : undefined;
        }

        return this.each(function (v) {
          if (v.setAttribute) {
            v.setAttribute(name, value);
          } else {
            v[name] = value;
          }
        });
      }

      for (var key in name) {
        this.attr(key, name[key]);
      }

      return this;
    },

    hasClass: function (c) {
      var check = false, classes = getClasses(c);
      if (classes && classes.length) {
        this.each(function (v) {
          check = hasClass(v, classes[0]);
          return !check;
        });
      }
      return check;
    },

    prop: function (name, value) {
      if (isString(name)) {
        return (value === undefined ? this[0][name] : this.each(function (v) {
          v[name] = value;
        }));
      }

      for (var key in name) {
        this.prop(key, name[key]);
      }

      return this;
    },

    removeAttr: function (name) {
      return this.each(function (v) {
        if (v.removeAttribute) {
          v.removeAttribute(name);
        } else {
          delete v[name];
        }
      });
    },

    removeClass: function (c) {
      if (!arguments.length) {
        return this.attr("class", "");
      }
      var classes = getClasses(c);
      return (classes ? this.each(function (v) {
        each(classes, function (c) {
          removeClass(v, c);
        });
      }) : this);
    },

    removeProp: function (name) {
      return this.each(function (v) {
        delete v[name];
      });
    },

    toggleClass: function (c, state) {
      if (state !== undefined) {
        return this[state ? "addClass" : "removeClass"](c);
      }
      var classes = getClasses(c);
      return (classes ? this.each(function (v) {
        var spacedName = " " + v.className + " ";
        each(classes, function (c) {
          if (hasClass(v, c)) {
            removeClass(v, c);
          } else {
            addClass(v, c, spacedName);
          }
        });
      }) : this);
    } });

  fn.extend({
    add: function (selector, context) {
      return unique(cash.merge(this, cash(selector, context)));
    },

    each: function (callback) {
      each(this, callback);
      return this;
    },

    eq: function (index) {
      return cash(this.get(index));
    },

    filter: function (selector) {
      if (!selector) {
        return this;
      }

      var comparator = (isFunction(selector) ? selector : getCompareFunction(selector));

      return cash(filter.call(this, function (e) {
        return comparator(e, selector);
      }));
    },

    first: function () {
      return this.eq(0);
    },

    get: function (index) {
      if (index === undefined) {
        return slice.call(this);
      }
      return (index < 0 ? this[index + this.length] : this[index]);
    },

    index: function (elem) {
      var child = elem ? cash(elem)[0] : this[0], collection = elem ? this : cash(child).parent().children();
      return slice.call(collection).indexOf(child);
    },

    last: function () {
      return this.eq(-1);
    }

  });

  var camelCase = (function () {
    var camelRegex = /(?:^\w|[A-Z]|\b\w)/g, whiteSpace = /[\s-_]+/g;
    return function (str) {
      return str.replace(camelRegex, function (letter, index) {
        return letter[index === 0 ? "toLowerCase" : "toUpperCase"]();
      }).replace(whiteSpace, "");
    };
  }());

  var getPrefixedProp = (function () {
    var cache = {}, doc = document, div = doc.createElement("div"), style = div.style;

    return function (prop) {
      prop = camelCase(prop);
      if (cache[prop]) {
        return cache[prop];
      }

      var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1), prefixes = ["webkit", "moz", "ms", "o"], props = (prop + " " + (prefixes).join(ucProp + " ") + ucProp).split(" ");

      each(props, function (p) {
        if (p in style) {
          cache[p] = prop = cache[prop] = p;
          return false;
        }
      });

      return cache[prop];
    };
  }());

  cash.prefixedProp = getPrefixedProp;
  cash.camelCase = camelCase;

  fn.extend({
    css: function (prop, value) {
      if (isString(prop)) {
        prop = getPrefixedProp(prop);
        return (arguments.length > 1 ? this.each(function (v) {
          return v.style[prop] = value;
        }) : win.getComputedStyle(this[0])[prop]);
      }

      for (var key in prop) {
        this.css(key, prop[key]);
      }

      return this;
    }

  });

  function compute(el, prop) {
    return parseInt(win.getComputedStyle(el[0], null)[prop], 10) || 0;
  }

  each(["Width", "Height"], function (v) {
    var lower = v.toLowerCase();

    fn[lower] = function () {
      return this[0].getBoundingClientRect()[lower];
    };

    fn["inner" + v] = function () {
      return this[0]["client" + v];
    };

    fn["outer" + v] = function (margins) {
      return this[0]["offset" + v] + (margins ? compute(this, "margin" + (v === "Width" ? "Left" : "Top")) + compute(this, "margin" + (v === "Width" ? "Right" : "Bottom")) : 0);
    };
  });

  function registerEvent(node, eventName, callback) {
    var eventCache = getData(node, "_cashEvents") || setData(node, "_cashEvents", {});
    eventCache[eventName] = eventCache[eventName] || [];
    eventCache[eventName].push(callback);
    node.addEventListener(eventName, callback);
  }

  function removeEvent(node, eventName, callback) {
    var events = getData(node, "_cashEvents"), eventCache = (events && events[eventName]), index;

    if (!eventCache) {
      return;
    }

    if (callback) {
      node.removeEventListener(eventName, callback);
      index = eventCache.indexOf(callback);
      if (index >= 0) {
        eventCache.splice(index, 1);
      }
    } else {
      each(eventCache, function (event) {
        node.removeEventListener(eventName, event);
      });
      eventCache = [];
    }
  }

  fn.extend({
    off: function (eventName, callback) {
      return this.each(function (v) {
        return removeEvent(v, eventName, callback);
      });
    },

    on: function (eventName, delegate, callback, runOnce) {
      // jshint ignore:line
      var originalCallback;
      if (!isString(eventName)) {
        for (var key in eventName) {
          this.on(key, delegate, eventName[key]);
        }
        return this;
      }

      if (isFunction(delegate)) {
        callback = delegate;
        delegate = null;
      }

      if (eventName === "ready") {
        onReady(callback);
        return this;
      }

      if (delegate) {
        originalCallback = callback;
        callback = function (e) {
          var t = e.target;
          while (!matches(t, delegate)) {
            if (t === this || t === null) {
              return (t = false);
            }

            t = t.parentNode;
          }

          if (t) {
            originalCallback.call(t, e);
          }
        };
      }

      return this.each(function (v) {
        var finalCallback = callback;
        if (runOnce) {
          finalCallback = function () {
            callback.apply(this, arguments);
            removeEvent(v, eventName, finalCallback);
          };
        }
        registerEvent(v, eventName, finalCallback);
      });
    },

    one: function (eventName, delegate, callback) {
      return this.on(eventName, delegate, callback, true);
    },

    ready: onReady,

    /**
     * Modified
     * Triggers browser event
     * @param String eventName
     * @param Object data - Add properties to event object
     */
    trigger: function (eventName, data) {
      if (document.createEvent) {
        let evt = document.createEvent('HTMLEvents');
        evt.initEvent(eventName, true, false);
        evt = this.extend(evt, data);
        return this.each(function (v) {
          return v.dispatchEvent(evt);
        });
      }
    }

  });

  function encode(name, value) {
    return "&" + encodeURIComponent(name) + "=" + encodeURIComponent(value).replace(/%20/g, "+");
  }

  function getSelectMultiple_(el) {
    var values = [];
    each(el.options, function (o) {
      if (o.selected) {
        values.push(o.value);
      }
    });
    return values.length ? values : null;
  }

  function getSelectSingle_(el) {
    var selectedIndex = el.selectedIndex;
    return selectedIndex >= 0 ? el.options[selectedIndex].value : null;
  }

  function getValue(el) {
    var type = el.type;
    if (!type) {
      return null;
    }
    switch (type.toLowerCase()) {
      case "select-one":
        return getSelectSingle_(el);
      case "select-multiple":
        return getSelectMultiple_(el);
      case "radio":
        return (el.checked) ? el.value : null;
      case "checkbox":
        return (el.checked) ? el.value : null;
      default:
        return el.value ? el.value : null;
    }
  }

  fn.extend({
    serialize: function () {
      var query = "";

      each(this[0].elements || this, function (el) {
        if (el.disabled || el.tagName === "FIELDSET") {
          return;
        }
        var name = el.name;
        switch (el.type.toLowerCase()) {
          case "file":
          case "reset":
          case "submit":
          case "button":
            break;
          case "select-multiple":
            var values = getValue(el);
            if (values !== null) {
              each(values, function (value) {
                query += encode(name, value);
              });
            }
            break;
          default:
            var value = getValue(el);
            if (value !== null) {
              query += encode(name, value);
            }
        }
      });

      return query.substr(1);
    },

    val: function (value) {
      if (value === undefined) {
        return getValue(this[0]);
      }

      return this.each(function (v) {
        return v.value = value;
      });
    }

  });

  function insertElement(el, child, prepend) {
    if (prepend) {
      var first = el.childNodes[0];
      el.insertBefore(child, first);
    } else {
      el.appendChild(child);
    }
  }

  function insertContent(parent, child, prepend) {
    var str = isString(child);

    if (!str && child.length) {
      each(child, function (v) {
        return insertContent(parent, v, prepend);
      });
      return;
    }

    each(parent, str ? function (v) {
      return v.insertAdjacentHTML(prepend ? "afterbegin" : "beforeend", child);
    } : function (v, i) {
      return insertElement(v, (i === 0 ? child : child.cloneNode(true)), prepend);
    });
  }

  fn.extend({
    after: function (selector) {
      cash(selector).insertAfter(this);
      return this;
    },

    append: function (content) {
      insertContent(this, content);
      return this;
    },

    appendTo: function (parent) {
      insertContent(cash(parent), this);
      return this;
    },

    before: function (selector) {
      cash(selector).insertBefore(this);
      return this;
    },

    clone: function () {
      return cash(this.map(function (v) {
        return v.cloneNode(true);
      }));
    },

    empty: function () {
      this.html("");
      return this;
    },

    html: function (content) {
      if (content === undefined) {
        return this[0].innerHTML;
      }
      var source = (content.nodeType ? content[0].outerHTML : content);
      return this.each(function (v) {
        return v.innerHTML = source;
      });
    },

    insertAfter: function (selector) {
      var _this = this;


      cash(selector).each(function (el, i) {
        var parent = el.parentNode, sibling = el.nextSibling;
        _this.each(function (v) {
          parent.insertBefore((i === 0 ? v : v.cloneNode(true)), sibling);
        });
      });

      return this;
    },

    insertBefore: function (selector) {
      var _this2 = this;
      cash(selector).each(function (el, i) {
        var parent = el.parentNode;
        _this2.each(function (v) {
          parent.insertBefore((i === 0 ? v : v.cloneNode(true)), el);
        });
      });
      return this;
    },

    prepend: function (content) {
      insertContent(this, content, true);
      return this;
    },

    prependTo: function (parent) {
      insertContent(cash(parent), this, true);
      return this;
    },

    remove: function () {
      return this.each(function (v) {
        if (!!v.parentNode) {
          return v.parentNode.removeChild(v);
        }
      });
    },

    text: function (content) {
      if (content === undefined) {
        return this[0].textContent;
      }
      return this.each(function (v) {
        return v.textContent = content;
      });
    }

  });

  var docEl = doc.documentElement;

  fn.extend({
    position: function () {
      var el = this[0];
      return {
        left: el.offsetLeft,
        top: el.offsetTop
      };
    },

    offset: function () {
      var rect = this[0].getBoundingClientRect();
      return {
        top: rect.top + win.pageYOffset - docEl.clientTop,
        left: rect.left + win.pageXOffset - docEl.clientLeft
      };
    },

    offsetParent: function () {
      return cash(this[0].offsetParent);
    }

  });

  fn.extend({
    children: function (selector) {
      var elems = [];
      this.each(function (el) {
        push.apply(elems, el.children);
      });
      elems = unique(elems);

      return (!selector ? elems : elems.filter(function (v) {
        return matches(v, selector);
      }));
    },

    closest: function (selector) {
      if (!selector || this.length < 1) {
        return cash();
      }
      if (this.is(selector)) {
        return this.filter(selector);
      }
      return this.parent().closest(selector);
    },

    is: function (selector) {
      if (!selector) {
        return false;
      }

      var match = false, comparator = getCompareFunction(selector);

      this.each(function (el) {
        match = comparator(el, selector);
        return !match;
      });

      return match;
    },

    find: function (selector) {
      if (!selector || selector.nodeType) {
        return cash(selector && this.has(selector).length ? selector : null);
      }

      var elems = [];
      this.each(function (el) {
        push.apply(elems, find(selector, el));
      });

      return unique(elems);
    },

    has: function (selector) {
      var comparator = (isString(selector) ? function (el) {
        return find(selector, el).length !== 0;
      } : function (el) {
        return el.contains(selector);
      });

      return this.filter(comparator);
    },

    next: function () {
      return cash(this[0].nextElementSibling);
    },

    not: function (selector) {
      if (!selector) {
        return this;
      }

      var comparator = getCompareFunction(selector);

      return this.filter(function (el) {
        return !comparator(el, selector);
      });
    },

    parent: function () {
      var result = [];

      this.each(function (item) {
        if (item && item.parentNode) {
          result.push(item.parentNode);
        }
      });

      return unique(result);
    },

    parents: function (selector) {
      var last, result = [];

      this.each(function (item) {
        last = item;

        while (last && last.parentNode && last !== doc.body.parentNode) {
          last = last.parentNode;

          if (!selector || (selector && matches(last, selector))) {
            result.push(last);
          }
        }
      });

      return unique(result);
    },

    prev: function () {
      return cash(this[0].previousElementSibling);
    },

    siblings: function (selector) {
      var collection = this.parent().children(selector), el = this[0];

      return collection.filter(function (i) {
        return i !== el;
      });
    }

  });


  return cash;
});
(function ($) {
  'use strict';

  let _defaults = {};


  /**
   * @class
   *
   */
  class CharacterCounter extends Component {
    /**
     * Construct CharacterCounter instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(CharacterCounter, el, options);

      this.el.M_CharacterCounter = this;

      /**
       * Options for the character counter
       */
      this.options = $.extend({}, CharacterCounter.defaults, options);

      this.isInvalid = false;
      this.isValidLength = false;
      this._setupCounter();
      this._setupEventHandlers();
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_CharacterCounter;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this.el.CharacterCounter = undefined;
      this._removeCounter();
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleUpdateCounterBound = this.updateCounter.bind(this);

      this.el.addEventListener('focus', this._handleUpdateCounterBound, true);
      this.el.addEventListener('input', this._handleUpdateCounterBound, true);
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      this.el.removeEventListener('focus', this._handleUpdateCounterBound, true);
      this.el.removeEventListener('input', this._handleUpdateCounterBound, true);
    }

    /**
     * Setup counter element
     */
    _setupCounter() {
      this.counterEl = document.createElement('span');
      $(this.counterEl)
        .addClass('character-counter')
        .css({
          float: 'right',
          'font-size': '12px',
          height: 1
        });

      this.$el.parent().append(this.counterEl);
    }

    /**
     * Remove counter element
     */
    _removeCounter() {
      $(this.counterEl).remove();
    }

    /**
     * Update counter
     */
    updateCounter() {
      let maxLength = +this.$el.attr('data-length'),
        actualLength = this.el.value.length;
      this.isValidLength = actualLength <= maxLength;
      let counterString = actualLength;

      if (maxLength) {
        counterString += '/' + maxLength;
        this._validateInput();
      }

      $(this.counterEl).html(counterString);
    }

    /**
     * Add validation classes
     */
    _validateInput() {
      if (this.isValidLength && this.isInvalid) {
        this.isInvalid = false;
        this.$el.removeClass('invalid');
      } else if (!this.isValidLength && !this.isInvalid) {
        this.isInvalid = true;
        this.$el.removeClass('valid');
        this.$el.addClass('invalid');
      }
    }
  }

  M.CharacterCounter = CharacterCounter;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(CharacterCounter, 'characterCounter', 'M_CharacterCounter');
  }

}(cash));
(function ($) {
  'use strict';

  let _defaults = {
    data: [],
    placeholder: '',
    secondaryPlaceholder: '',
    autocompleteOptions: {},
    limit: Infinity,
    onChipAdd: null,
    onChipSelect: null,
    onChipDelete: null
  };


  /**
   * @typedef {Object} chip
   * @property {String} tag  chip tag string
   * @property {String} [image]  chip avatar image string
   */

  /**
   * @class
   *
   */
  class Chips extends Component {
    /**
     * Construct Chips instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Chips, el, options);

      this.el.M_Chips = this;

      /**
       * Options for the modal
       * @member Chips#options
       * @prop {Array} data
       * @prop {String} placeholder
       * @prop {String} secondaryPlaceholder
       * @prop {Object} autocompleteOptions
       */
      this.options = $.extend({}, Chips.defaults, options);

      this.$el.addClass('chips input-field');
      this.chipsData = [];
      this.$chips = $();
      this._setupInput();
      this.hasAutocomplete = Object.keys(this.options.autocompleteOptions).length > 0;

      // Set input id
      if (!this.$input.attr('id')) {
        this.$input.attr('id', M.guid());
      }

      // Render initial chips
      if (this.options.data.length) {
        this.chipsData = this.options.data;
        this._renderChips(this.chipsData);
      }

      // Setup autocomplete if needed
      if (this.hasAutocomplete) {
        this._setupAutocomplete();
      }

      this._setPlaceholder();
      this._setupLabel();
      this._setupEventHandlers();
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Chips;
    }

    /**
     * Get Chips Data
     */
    getData() {
      return this.chipsData;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this.$chips.remove();
      this.el.M_Chips = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleChipClickBound = this._handleChipClick.bind(this);
      this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
      this._handleInputFocusBound = this._handleInputFocus.bind(this);
      this._handleInputBlurBound = this._handleInputBlur.bind(this);

      this.el.addEventListener('click', this._handleChipClickBound);
      document.addEventListener('keydown', Chips._handleChipsKeydown);
      document.addEventListener('keyup', Chips._handleChipsKeyup);
      this.el.addEventListener('blur', Chips._handleChipsBlur, true);
      this.$input[0].addEventListener('focus', this._handleInputFocusBound);
      this.$input[0].addEventListener('blur', this._handleInputBlurBound);
      this.$input[0].addEventListener('keydown', this._handleInputKeydownBound);
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      this.el.removeEventListener('click', this._handleChipClickBound);
      document.removeEventListener('keydown', Chips._handleChipsKeydown);
      document.removeEventListener('keyup', Chips._handleChipsKeyup);
      this.el.removeEventListener('blur', Chips._handleChipsBlur, true);
      this.$input[0].removeEventListener('focus', this._handleInputFocusBound);
      this.$input[0].removeEventListener('blur', this._handleInputBlurBound);
      this.$input[0].removeEventListener('keydown', this._handleInputKeydownBound);
    }

    /**
     * Handle Chip Click
     * @param {Event} e
     */
    _handleChipClick(e) {
      let $chip = $(e.target).closest('.chip');
      let clickedClose = $(e.target).is('.close');
      if ($chip.length) {
        let index = $chip.index();
        if (clickedClose) {
          // delete chip
          this.deleteChip(index);
          this.$input[0].focus();

        } else {
          // select chip
          this.selectChip(index);
        }

        // Default handle click to focus on input
      } else {
        this.$input[0].focus();
      }
    }

    /**
     * Handle Chips Keydown
     * @param {Event} e
     */
    static _handleChipsKeydown(e) {
      Chips._keydown = true;

      let $chips = $(e.target).closest('.chips');
      let chipsKeydown = e.target && $chips.length;

      // Don't handle keydown inputs on input and textarea
      if ($(e.target).is('input, textarea') || !chipsKeydown) {
        return;
      }

      let currChips = $chips[0].M_Chips;

      // backspace and delete
      if (e.keyCode === 8 || e.keyCode === 46) {
        e.preventDefault();

        let selectIndex = currChips.chipsData.length;
        if (currChips._selectedChip) {
          let index = currChips._selectedChip.index();
          currChips.deleteChip(index);
          currChips._selectedChip = null;

          // Make sure selectIndex doesn't go negative
          selectIndex = Math.max(index - 1, 0);
        }

        if (currChips.chipsData.length) {
          currChips.selectChip(selectIndex);
        }

        // left arrow key
      } else if (e.keyCode === 37) {
        if (currChips._selectedChip) {
          let selectIndex = currChips._selectedChip.index() - 1;
          if (selectIndex < 0) {
            return;
          }
          currChips.selectChip(selectIndex);
        }

        // right arrow key
      } else if (e.keyCode === 39) {
        if (currChips._selectedChip) {
          let selectIndex = currChips._selectedChip.index() + 1;

          if (selectIndex >= currChips.chipsData.length) {
            currChips.$input[0].focus();
          } else {
            currChips.selectChip(selectIndex);
          }
        }
      }
    }

    /**
     * Handle Chips Keyup
     * @param {Event} e
     */
    static _handleChipsKeyup(e) {
      Chips._keydown = false;
    }

    /**
     * Handle Chips Blur
     * @param {Event} e
     */
    static _handleChipsBlur(e) {
      if (!Chips._keydown) {
        let $chips = $(e.target).closest('.chips');
        let currChips = $chips[0].M_Chips;

        currChips._selectedChip = null;
      }
    }

    /**
     * Handle Input Focus
     */
    _handleInputFocus() {
      this.$el.addClass('focus');
    }

    /**
     * Handle Input Blur
     */
    _handleInputBlur() {
      this.$el.removeClass('focus');
    }

    /**
     * Handle Input Keydown
     * @param {Event} e
     */
    _handleInputKeydown(e) {
      Chips._keydown = true;

      // enter
      if (e.keyCode === 13) {
        // Override enter if autocompleting.
        if (this.hasAutocomplete &&
          this.autocomplete &&
          this.autocomplete.isOpen) {
          return;
        }

        e.preventDefault();
        this.addChip({
          tag: this.$input[0].value
        });
        this.$input[0].value = '';

        // delete or left
      } else if ((e.keyCode === 8 || e.keyCode === 37) && this.$input[0].value === '' && this.chipsData.length) {
        e.preventDefault();
        this.selectChip(this.chipsData.length - 1);
      }
    }

    /**
     * Render Chip
     * @param {chip} chip
     * @return {Element}
     */
    _renderChip(chip) {
      if (!chip.tag) {
        return;
      }

      let renderedChip = document.createElement('div');
      let closeIcon = document.createElement('i');
      renderedChip.classList.add('chip');
      renderedChip.textContent = chip.tag;
      renderedChip.setAttribute('tabindex', 0);
      $(closeIcon).addClass('material-icons close');
      closeIcon.textContent = 'close';

      // attach image if needed
      if (chip.image) {
        let img = document.createElement('img');
        img.setAttribute('src', chip.image);
        renderedChip.insertBefore(img, renderedChip.firstChild);
      }

      renderedChip.appendChild(closeIcon);
      return renderedChip;
    }

    /**
     * Render Chips
     */
    _renderChips() {
      this.$chips.remove();
      for (let i = 0; i < this.chipsData.length; i++) {
        let chipEl = this._renderChip(this.chipsData[i]);
        this.$el.append(chipEl);
        this.$chips.add(chipEl);
      }

      // move input to end
      this.$el.append(this.$input[0]);
    }

    /**
     * Setup Autocomplete
     */
    _setupAutocomplete() {
      this.options.autocompleteOptions.onAutocomplete = (val) => {
        this.addChip({
          tag: val
        });
        this.$input[0].value = '';
        this.$input[0].focus();
      };

      this.autocomplete = M.Autocomplete.init(this.$input[0], this.options.autocompleteOptions);
    }

    /**
     * Setup Input
     */
    _setupInput() {
      this.$input = this.$el.find('input');
      if (!this.$input.length) {
        this.$input = $('<input></input>');
        this.$el.append(this.$input);
      }

      this.$input.addClass('input');
    }

    /**
     * Setup Label
     */
    _setupLabel() {
      this.$label = this.$el.find('label');
      if (this.$label.length) {
        this.$label.setAttribute('for', this.$input.attr('id'));
      }
    }

    /**
     * Set placeholder
     */
    _setPlaceholder() {
      if ((this.chipsData !== undefined && !this.chipsData.length) && this.options.placeholder) {
        $(this.$input).prop('placeholder', this.options.placeholder);

      } else if ((this.chipsData === undefined || !!this.chipsData.length) && this.options.secondaryPlaceholder) {
        $(this.$input).prop('placeholder', this.options.secondaryPlaceholder);
      }
    }

    /**
     * Check if chip is valid
     * @param {chip} chip
     */
    _isValid(chip) {
      if (chip.hasOwnProperty('tag') && chip.tag !== '') {
        let exists = false;
        for (let i = 0; i < this.chipsData.length; i++) {
          if (this.chipsData[i].tag === chip.tag) {
            exists = true;
            break;
          }
        }
        return !exists;

      }

      return false;
    }

    /**
     * Add chip
     * @param {chip} chip
     */
    addChip(chip) {
      if (!this._isValid(chip) ||
        this.chipsData.length >= this.options.limit) {
        return;
      }

      let renderedChip = this._renderChip(chip);
      this.$chips.add(renderedChip);
      this.chipsData.push(chip);
      $(this.$input).before(renderedChip);
      this._setPlaceholder();

      // fire chipAdd callback
      if (typeof (this.options.onChipAdd) === 'function') {
        this.options.onChipAdd.call(this, this.$el, renderedChip);
      }
    }

    /**
     * Delete chip
     * @param {Number} chip
     */
    deleteChip(chipIndex) {
      let $chip = this.$chips.eq(chipIndex);
      this.$chips.eq(chipIndex).remove();
      this.$chips = this.$chips.filter(function (el) {
        return $(el).index() >= 0;
      });
      this.chipsData.splice(chipIndex, 1);
      this._setPlaceholder();

      // fire chipDelete callback
      if (typeof (this.options.onChipDelete) === 'function') {
        this.options.onChipDelete.call(this, this.$el, $chip[0]);
      }
    }

    /**
     * Select chip
     * @param {Number} chip
     */
    selectChip(chipIndex) {
      let $chip = this.$chips.eq(chipIndex);
      this._selectedChip = $chip;
      $chip[0].focus();

      // fire chipSelect callback
      if (typeof (this.options.onChipSelect) === 'function') {
        this.options.onChipSelect.call(this, this.$el, $chip[0]);
      }
    }
  }

  /**
   * @static
   * @memberof Chips
   */
  Chips._keydown = false;

  M.Chips = Chips;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Chips, 'chips', 'M_Chips');
  }

  $(document).ready(function () {
    // Handle removal of static chips.
    $(document.body).on('click', '.chip .close', function () {
      let $chips = $(this).closest('.chips');
      if ($chips.length && $chips[0].M_Chips) {
        return;
      }
      $(this).closest('.chip').remove();
    });
  });
}(cash));
(function ($, anim) {
  'use strict';

  let _defaults = {
    accordion: true,
    onOpenStart: undefined,
    onOpenEnd: undefined,
    onCloseStart: undefined,
    onCloseEnd: undefined,
    inDuration: 300,
    outDuration: 300
  };


  /**
   * @class
   *
   */
  class Collapsible extends Component {
    /**
     * Construct Collapsible instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Collapsible, el, options);

      this.el.M_Collapsible = this;

      /**
       * Options for the collapsible
       * @member Collapsible#options
       * @prop {Boolean} [accordion=false] - Type of the collapsible
       * @prop {Function} onOpenStart - Callback function called before collapsible is opened
       * @prop {Function} onOpenEnd - Callback function called after collapsible is opened
       * @prop {Function} onCloseStart - Callback function called before collapsible is closed
       * @prop {Function} onCloseEnd - Callback function called after collapsible is closed
       * @prop {Number} inDuration - Transition in duration in milliseconds.
       * @prop {Number} outDuration - Transition duration in milliseconds.
       */
      this.options = $.extend({}, Collapsible.defaults, options);

      // Setup tab indices
      this.$headers = this.$el.children('li').children('.collapsible-header');
      this.$headers.attr('tabindex', 0);

      this._setupEventHandlers();

      // Open first active
      let $activeBodies = this.$el.children('li.active').children('.collapsible-body');
      if (this.options.accordion) { // Handle Accordion
        $activeBodies.first().css('display', 'block');

      } else { // Handle Expandables
        $activeBodies.css('display', 'block');
      }
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Collapsible;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this.el.M_Collapsible = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleCollapsibleClickBound = this._handleCollapsibleClick.bind(this);
      this._handleCollapsibleKeydownBound = this._handleCollapsibleKeydown.bind(this);
      this.el.addEventListener('click', this._handleCollapsibleClickBound);
      this.$headers.each((header) => {
        header.addEventListener('keydown', this._handleCollapsibleKeydownBound);
      });
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      this.el.removeEventListener('click', this._handleCollapsibleClickBound);
    }

    /**
     * Handle Collapsible Click
     * @param {Event} e
     */
    _handleCollapsibleClick(e) {
      let $header = $(e.target).closest('.collapsible-header');
      if (e.target && $header.length) {
        let $collapsible = $header.closest('.collapsible');
        if ($collapsible[0] === this.el) {
          let $collapsibleLi = $header.closest('li');
          let $collapsibleLis = $collapsible.children('li');
          let isActive = $collapsibleLi[0].classList.contains('active');
          let index = $collapsibleLis.index($collapsibleLi);

          if (isActive) {
            this.close(index);
          } else {
            this.open(index);
          }
        }
      }
    }

    /**
     * Handle Collapsible Keydown
     * @param {Event} e
     */
    _handleCollapsibleKeydown(e) {
      if (e.keyCode === 13) {
        this._handleCollapsibleClickBound(e);
      }
    }

    /**
     * Animate in collapsible slide
     * @param {Number} index - 0th index of slide
     */
    _animateIn(index) {
      let $collapsibleLi = this.$el.children('li').eq(index);
      if ($collapsibleLi.length) {
        let $body = $collapsibleLi.children('.collapsible-body');

        anim.remove($body[0]);
        $body.css({
          display: 'block',
          overflow: 'hidden',
          height: 0,
          paddingTop: '',
          paddingBottom: ''
        });

        let pTop = $body.css('padding-top');
        let pBottom = $body.css('padding-bottom');
        let finalHeight = $body[0].scrollHeight;
        $body.css({
          paddingTop: 0,
          paddingBottom: 0
        });

        anim({
          targets: $body[0],
          height: finalHeight,
          paddingTop: pTop,
          paddingBottom: pBottom,
          duration: this.options.inDuration,
          easing: 'easeInOutCubic',
          complete: (anim) => {
            $body.css({
              overflow: '',
              paddingTop: '',
              paddingBottom: '',
              height: ''
            });

            // onOpenEnd callback
            if (typeof (this.options.onOpenEnd) === 'function') {
              this.options.onOpenEnd.call(this, $collapsibleLi[0]);
            }
          }
        });
      }
    }

    /**
     * Animate out collapsible slide
     * @param {Number} index - 0th index of slide to open
     */
    _animateOut(index) {
      let $collapsibleLi = this.$el.children('li').eq(index);
      if ($collapsibleLi.length) {
        let $body = $collapsibleLi.children('.collapsible-body');
        anim.remove($body[0]);
        $body.css('overflow', 'hidden');
        anim({
          targets: $body[0],
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          duration: this.options.outDuration,
          easing: 'easeInOutCubic',
          complete: () => {
            $body.css({
              height: '',
              overflow: '',
              padding: '',
              display: ''
            });

            // onCloseEnd callback
            if (typeof (this.options.onCloseEnd) === 'function') {
              this.options.onCloseEnd.call(this, $collapsibleLi[0]);
            }
          }
        });
      }
    }

    /**
     * Open Collapsible
     * @param {Number} index - 0th index of slide
     */
    open(index) {
      let $collapsibleLi = this.$el.children('li').eq(index);
      if ($collapsibleLi.length && !$collapsibleLi[0].classList.contains('active')) {

        // onOpenStart callback
        if (typeof (this.options.onOpenStart) === 'function') {
          this.options.onOpenStart.call(this, $collapsibleLi[0]);
        }

        // Handle accordion behavior
        if (this.options.accordion) {
          let $collapsibleLis = this.$el.children('li');
          let $activeLis = this.$el.children('li.active');
          $activeLis.each((el) => {
            let index = $collapsibleLis.index($(el));
            this.close(index);
          });
        }

        // Animate in
        $collapsibleLi[0].classList.add('active');
        this._animateIn(index);
      }
    }

    /**
     * Close Collapsible
     * @param {Number} index - 0th index of slide
     */
    close(index) {
      let $collapsibleLi = this.$el.children('li').eq(index);
      if ($collapsibleLi.length && $collapsibleLi[0].classList.contains('active')) {

        // onCloseStart callback
        if (typeof (this.options.onCloseStart) === 'function') {
          this.options.onCloseStart.call(this, $collapsibleLi[0]);
        }

        // Animate out
        $collapsibleLi[0].classList.remove('active');
        this._animateOut(index);
      }
    }
  }

  M.Collapsible = Collapsible;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Collapsible, 'collapsible', 'M_Collapsible');
  }

}(cash, M.anime));
class Component {
  /**
   * Generic constructor for all components
   * @constructor
   * @param {Element} el
   * @param {Object} options
   */
  constructor(classDef, el, options) {
    // Display error if el is valid HTML Element
    if (!(el instanceof Element)) {
      console.error( Error(el + ' is not an HTML Element'));
    }

    // If exists, destroy and reinitialize in child
    let ins = classDef.getInstance(el);
    if (!!ins) {
      ins.destroy();
    }

    this.el = el;
    this.$el = cash(el);
  }


  /**
   * Initializes components
   * @param {class} classDef
   * @param {Element | NodeList | jQuery} els
   * @param {Object} options
   */
  static init(classDef, els, options) {
    let instances = null;
    if (els instanceof Element) {
      instances = new classDef(els, options);

    } else if (!!els && (els.jquery || els.cash || els instanceof NodeList)) {
      let instancesArr = [];
      for (let i = 0; i < els.length; i++) {
        instancesArr.push(new classDef(els[i], options));
      }
      instances = instancesArr;
    }

    return instances;
  }
}
;
(function($) {
  'use strict';

  let _defaults = {

    // the default output format for the input field value
    format: 'mmm dd, yyyy',

    // Used to create date object from current input string
    parse: null,

    // The initial date to view when first opened
    defaultDate: null,

    // Make the `defaultDate` the initial selected value
    setDefaultDate: false,

    disableWeekends: false,

    disableDayFn: null,

    // First day of week (0: Sunday, 1: Monday etc)
    firstDay: 0,

    // The earliest date that can be selected
    minDate: null,
    // Thelatest date that can be selected
    maxDate: null,

    // Number of years either side, or array of upper/lower range
    yearRange: 10,

    // used internally (don't config outside)
    minYear: 0,
    maxYear: 9999,
    minMonth: undefined,
    maxMonth: undefined,

    startRange: null,
    endRange: null,

    isRTL: false,

    // Render the month after year in the calendar title
    showMonthAfterYear: false,

    // Render days of the calendar grid that fall in the next or previous month
    showDaysInNextAndPreviousMonths: false,

    // Specify a DOM element to render the calendar in
    container: null,

    // Show clear button
    showClearBtn: false,

    // internationalization
    i18n: {
      cancel: 'Cancel',
      clear: 'Clear',
      done: 'Ok',
      previousMonth : '‹',
      nextMonth     : '›',
      months        : ['January','February','March','April','May','June','July','August','September','October','November','December'],
      monthsShort   : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      weekdays      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      weekdaysShort : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
      weekdaysAbbrev : ['S','M','T','W','T','F','S']
    },

    // events array
    events: [],

    // callback function
    onSelect: null,
    onOpen: null,
    onClose: null,
    onDraw: null,
  };


  /**
   * @class
   *
   */
  class Datepicker extends Component {
    /**
     * Construct Datepicker instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Datepicker, el, options);

      this.el.M_Datepicker = this;

      this.options = $.extend({}, Datepicker.defaults, options);

      // make sure i18n defaults are not lost when only few i18n option properties are passed
      if(!!options && options.hasOwnProperty('i18n') && typeof options.i18n === 'object') {
         this.options.i18n = $.extend({}, Datepicker.defaults.i18n, options.i18n);
      }

      // Remove time component from minDate and maxDate options
      if (this.options.minDate) this.options.minDate.setHours(0, 0, 0, 0);
      if (this.options.maxDate) this.options.maxDate.setHours(0, 0, 0, 0);

      this.id = M.guid();

      this._setupVariables();
      this._insertHTMLIntoDOM();
      this._setupModal();

      this._setupEventHandlers();

      if (!this.options.defaultDate) {
        this.options.defaultDate = new Date(Date.parse(this.el.value));
        this.options.setDefaultDate = true;
      }

      let defDate = this.options.defaultDate;

      if (Datepicker._isDate(defDate)) {
        if (this.options.setDefaultDate) {
          this.setDate(defDate, true);
        }
        else {
          this.gotoDate(defDate);
        }
      } else {
        this.gotoDate(new Date());
      }


      /**
       * Describes open/close state of datepicker
       * @type {Boolean}
       */
      this.isOpen = false;

    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    static _isDate(obj) {
      return (/Date/).test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime());
    }

    static _isWeekend(date) {
      let day = date.getDay();
      return day === 0 || day === 6;
    }

    static _setToStartOfDay(date) {
      if (Datepicker._isDate(date)) date.setHours(0,0,0,0);
    }

    static _getDaysInMonth(year, month) {
      return [31, Datepicker._isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    }

    static _isLeapYear(year) {
      // solution by Matti Virkkunen: http://stackoverflow.com/a/4881951
      return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
    }

    static _compareDates(a,b) {
      // weak date comparison (use setToStartOfDay(date) to ensure correct result)
      return a.getTime() === b.getTime();
    }

    static _setToStartOfDay(date) {
      if (Datepicker._isDate(date)) date.setHours(0,0,0,0);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Datepicker;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this.modal.destroy();
      $(this.modalEl).remove();
      this.destroySelects();
      this.el.M_Datepicker = undefined;
    }


    destroySelects() {
      let oldYearSelect = this.calendarEl.querySelector('.pika-select-year');
      if (oldYearSelect) {
        M.FormSelect.getInstance(oldYearSelect).destroy();
      }
      let oldMonthSelect = this.calendarEl.querySelector('.pika-select-month');
      if (oldMonthSelect) {
        M.FormSelect.getInstance(oldMonthSelect).destroy();
      }
    }


    _insertHTMLIntoDOM() {
      if (this.options.showClearBtn) {
        $(this.clearBtn).css({visibility: ''});
        this.clearBtn.innerHTML = this.options.i18n.clear;
      }

      this.doneBtn.innerHTML = this.options.i18n.done;
      this.cancelBtn.innerHTML = this.options.i18n.cancel;

      if (this.options.container) {
        this.$modalEl.appendTo(this.options.container);

      } else {
        this.$modalEl.insertBefore(this.el);
      }
    }


    _setupModal() {
      this.modalEl.id = 'modal-' + this.id;
      this.modal = M.Modal.init(this.modalEl, {
        onCloseEnd: () => {
          this.isOpen = false;
        }
      });
    }

    toString(format) {
      format = format || this.options.format;
      if (!Datepicker._isDate(this.date)) {
        return '';
      }

      let formatArray = format.split( /(d{1,4}|m{1,4}|y{4}|yy|!.)/g );
      let formattedDate = formatArray.map((label) => {
        if (this.formats[label]) {
          return this.formats[label]();
        }

        return label;
      }).join( '' );
      return formattedDate;
    }

    setDate(date, preventOnSelect) {
      if (!date) {
        this.date = null;
        this._renderDateDisplay();
        return this.draw();
      }
      if (typeof date === 'string') {
        date = new Date(Date.parse(date));
      }
      if (!Datepicker._isDate(date)) {
        return;
      }

      let min = this.options.minDate,
          max = this.options.maxDate;

      if (Datepicker._isDate(min) && date < min) {
        date = min;
      } else if (Datepicker._isDate(max) && date > max) {
        date = max;
      }

      this.date = new Date(date.getTime());

      this._renderDateDisplay();

      Datepicker._setToStartOfDay(this.date);
      this.gotoDate(this.date);

      if (!preventOnSelect && typeof this.options.onSelect === 'function') {
        this.options.onSelect.call(this, this.date);
      }
    }

    setInputValue() {
      this.el.value = this.toString();
      this.$el.trigger('change', {firedBy: this});
    }

    _renderDateDisplay() {
      let displayDate = Datepicker._isDate(this.date) ? this.date : new Date();
      let i18n = this.options.i18n;
      let day = i18n.weekdaysShort[displayDate.getDay()];
      let month = i18n.monthsShort[displayDate.getMonth()];
      let date = displayDate.getDate();
      this.yearTextEl.innerHTML = displayDate.getFullYear();
      this.dateTextEl.innerHTML = `${day}, ${month} ${date}`;
    }

    /**
     * change view to a specific date
     */
    gotoDate(date) {
      let newCalendar = true;

      if (!Datepicker._isDate(date)) {
        return;
      }

      if (this.calendars) {
        let firstVisibleDate = new Date(this.calendars[0].year, this.calendars[0].month, 1),
            lastVisibleDate = new Date(this.calendars[this.calendars.length-1].year, this.calendars[this.calendars.length-1].month, 1),
            visibleDate = date.getTime();
        // get the end of the month
        lastVisibleDate.setMonth(lastVisibleDate.getMonth()+1);
        lastVisibleDate.setDate(lastVisibleDate.getDate()-1);
        newCalendar = (visibleDate < firstVisibleDate.getTime() || lastVisibleDate.getTime() < visibleDate);
      }

      if (newCalendar) {
        this.calendars = [{
          month: date.getMonth(),
          year: date.getFullYear()
        }];
        // if (this.options.mainCalendar === 'right') {
        //   this.calendars[0].month += 1 - this.options.numberOfMonths;
        // }
      }

      this.adjustCalendars();
    }

    adjustCalendars() {
      this.calendars[0] = this.adjustCalendar(this.calendars[0]);
      // for (let c = 1; c < this.options.numberOfMonths; c++) {
      //   this.calendars[c] = this.adjustCalendar({
      //     month: this.calendars[0].month + c,
      //     year: this.calendars[0].year
      //   });
      // }
      this.draw();
    }

    adjustCalendar(calendar) {
      if (calendar.month < 0) {
        calendar.year -= Math.ceil(Math.abs(calendar.month)/12);
        calendar.month += 12;
      }
      if (calendar.month > 11) {
        calendar.year += Math.floor(Math.abs(calendar.month)/12);
        calendar.month -= 12;
      }
      return calendar;
    }

    nextMonth() {
      this.calendars[0].month++;
      this.adjustCalendars();
    }

    prevMonth() {
      this.calendars[0].month--;
      this.adjustCalendars();
    }

    render(year, month, randId) {
      let opts   = this.options,
          now    = new Date(),
          days   = Datepicker._getDaysInMonth(year, month),
          before = new Date(year, month, 1).getDay(),
          data   = [],
          row    = [];
      Datepicker._setToStartOfDay(now);
      if (opts.firstDay > 0) {
        before -= opts.firstDay;
        if (before < 0) {
          before += 7;
        }
      }
      let previousMonth = month === 0 ? 11 : month - 1,
          nextMonth = month === 11 ? 0 : month + 1,
          yearOfPreviousMonth = month === 0 ? year - 1 : year,
          yearOfNextMonth = month === 11 ? year + 1 : year,
          daysInPreviousMonth = Datepicker._getDaysInMonth(yearOfPreviousMonth, previousMonth);
      let cells = days + before,
          after = cells;
      while(after > 7) {
        after -= 7;
      }
      cells += 7 - after;
      let isWeekSelected = false;
      for (let i = 0, r = 0; i < cells; i++) {
        let day = new Date(year, month, 1 + (i - before)),
            isSelected = Datepicker._isDate(this.date) ? Datepicker._compareDates(day, this.date) : false,
            isToday = Datepicker._compareDates(day, now),
            hasEvent = opts.events.indexOf(day.toDateString()) !== -1 ? true : false,
            isEmpty = i < before || i >= (days + before),
            dayNumber = 1 + (i - before),
            monthNumber = month,
            yearNumber = year,
            isStartRange = opts.startRange && Datepicker._compareDates(opts.startRange, day),
            isEndRange = opts.endRange && Datepicker._compareDates(opts.endRange, day),
            isInRange = opts.startRange && opts.endRange && opts.startRange < day && day < opts.endRange,
            isDisabled = (opts.minDate && day < opts.minDate) ||
                (opts.maxDate && day > opts.maxDate) ||
                (opts.disableWeekends && Datepicker._isWeekend(day)) ||
                (opts.disableDayFn && opts.disableDayFn(day));

        if (isEmpty) {
          if (i < before) {
            dayNumber = daysInPreviousMonth + dayNumber;
            monthNumber = previousMonth;
            yearNumber = yearOfPreviousMonth;
          } else {
            dayNumber = dayNumber - days;
            monthNumber = nextMonth;
            yearNumber = yearOfNextMonth;
          }
        }

        let dayConfig = {
          day: dayNumber,
          month: monthNumber,
          year: yearNumber,
          hasEvent: hasEvent,
          isSelected: isSelected,
          isToday: isToday,
          isDisabled: isDisabled,
          isEmpty: isEmpty,
          isStartRange: isStartRange,
          isEndRange: isEndRange,
          isInRange: isInRange,
          showDaysInNextAndPreviousMonths: opts.showDaysInNextAndPreviousMonths,
        };

        row.push(this.renderDay(dayConfig));

        if (++r === 7) {
          data.push(this.renderRow(row, opts.isRTL, isWeekSelected));
          row = [];
          r = 0;
          isWeekSelected = false;
        }
      }
      return this.renderTable(opts, data, randId);
    }

    renderDay(opts) {
      let arr = [];
      let ariaSelected = 'false';
      if (opts.isEmpty) {
        if (opts.showDaysInNextAndPreviousMonths) {
          arr.push('is-outside-current-month');
          arr.push('is-selection-disabled');

        } else {
          return '<td class="is-empty"></td>';
        }
      }
      if (opts.isDisabled) {
        arr.push('is-disabled');
      }

      if (opts.isToday) {
        arr.push('is-today');
      }
      if (opts.isSelected) {
        arr.push('is-selected');
        ariaSelected = 'true';
      }
      if (opts.hasEvent) {
        arr.push('has-event');
      }
      if (opts.isInRange) {
        arr.push('is-inrange');
      }
      if (opts.isStartRange) {
        arr.push('is-startrange');
      }
      if (opts.isEndRange) {
        arr.push('is-endrange');
      }
      return '<td data-day="' + opts.day + '" class="' + arr.join(' ') + '" aria-selected="' + ariaSelected + '">' +
        '<button class="datepicker-day-button" type="button" ' +
        'data-pika-year="' + opts.year + '" data-pika-month="' + opts.month + '" data-pika-day="' + opts.day + '">' +
        opts.day +
        '</button>' +
        '</td>';
    }

    renderRow(days, isRTL, isRowSelected) {
      return '<tr class="pika-row' + (isRowSelected ? ' is-selected' : '') + '">' + (isRTL ? days.reverse() : days).join('') + '</tr>';
    }

    renderTable(opts, data, randId) {
      return '<div class="datepicker-table-wrapper"><table cellpadding="0" cellspacing="0" class="datepicker-table" role="grid" aria-labelledby="' +
        randId + '">' +
        this.renderHead(opts) + this.renderBody(data) + '</table></div>';
    }

    renderHead(opts) {
      let i, arr = [];
      for (i = 0; i < 7; i++) {
        arr.push('<th scope="col"><abbr title="' +
                 this.renderDayName(opts, i) + '">' +
                 this.renderDayName(opts, i, true) + '</abbr></th>');
      }
      return '<thead><tr>' + (opts.isRTL ? arr.reverse() : arr).join('') + '</tr></thead>';
    }

    renderBody(rows) {
      return '<tbody>' + rows.join('') + '</tbody>';
    }

    renderTitle(instance, c, year, month, refYear, randId) {
      let i, j, arr,
          opts = this.options,
          isMinYear = year === opts.minYear,
          isMaxYear = year === opts.maxYear,
          html = '<div id="' + randId + '" class="datepicker-controls" role="heading" aria-live="assertive">',
          monthHtml,
          yearHtml,
          prev = true,
          next = true;

      for (arr = [], i = 0; i < 12; i++) {
        arr.push('<option value="' + (year === refYear ? i - c : 12 + i - c) + '"' +
                 (i === month ? ' selected="selected"': '') +
                 ((isMinYear && i < opts.minMonth) || (isMaxYear && i > opts.maxMonth) ? 'disabled="disabled"' : '') + '>' +
                 opts.i18n.months[i] + '</option>');
      }

      monthHtml = '<select class="pika-select pika-select-month" tabindex="-1">' + arr.join('') + '</select>';

      if ($.isArray(opts.yearRange)) {
        i = opts.yearRange[0];
        j = opts.yearRange[1] + 1;
      } else {
        i = year - opts.yearRange;
        j = 1 + year + opts.yearRange;
      }

      for (arr = []; i < j && i <= opts.maxYear; i++) {
        if (i >= opts.minYear) {
          arr.push('<option value="' + i + '"' + (i === year ? ' selected="selected"': '') + '>' + (i) + '</option>');
        }
      }

      yearHtml = '<select class="pika-select pika-select-year" tabindex="-1">' + arr.join('') + '</select>';

      let leftArrow = '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/><path d="M0-.5h24v24H0z" fill="none"/></svg>';
      html += '<button class="month-prev' + (prev ? '' : ' is-disabled') + '" type="button">' + leftArrow + '</button>';


      html += '<div class="selects-container">';
      if (opts.showMonthAfterYear) {
        html += yearHtml + monthHtml;
      } else {
        html += monthHtml + yearHtml;
      }
      html += '</div>';

      if (isMinYear && (month === 0 || opts.minMonth >= month)) {
        prev = false;
      }

      if (isMaxYear && (month === 11 || opts.maxMonth <= month)) {
        next = false;
      }


      // if (c === (this.options.numberOfMonths - 1) ) {
      let rightArrow = '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/><path d="M0-.25h24v24H0z" fill="none"/></svg>';
        html += '<button class="month-next' + (next ? '' : ' is-disabled') + '" type="button">' + rightArrow + '</button>';
      // }

      return html += '</div>';
    }


    /**
     * refresh the HTML
     */
    draw(force) {
      if (!this.isOpen && !force) {
        return;
      }
      let opts = this.options,
          minYear = opts.minYear,
          maxYear = opts.maxYear,
          minMonth = opts.minMonth,
          maxMonth = opts.maxMonth,
          html = '',
          randId;

      if (this._y <= minYear) {
        this._y = minYear;
        if (!isNaN(minMonth) && this._m < minMonth) {
          this._m = minMonth;
        }
      }
      if (this._y >= maxYear) {
        this._y = maxYear;
        if (!isNaN(maxMonth) && this._m > maxMonth) {
          this._m = maxMonth;
        }
      }

      randId = 'pika-title-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 2);


      for (let c = 0; c < 1; c++) {
        this._renderDateDisplay();
        html +=
          this.renderTitle(this,
                      c,
                      this.calendars[c].year,
                      this.calendars[c].month,
                      this.calendars[0].year, randId) +
          this.render(this.calendars[c].year, this.calendars[c].month, randId);
      }

      this.destroySelects();

      this.calendarEl.innerHTML = html;

      // Init Materialize Select
      let yearSelect = this.calendarEl.querySelector('.pika-select-year');
      let monthSelect = this.calendarEl.querySelector('.pika-select-month');
      M.FormSelect.init(yearSelect, {classes: 'select-year', dropdownOptions: {container: document.body, constrainWidth: false}});
      M.FormSelect.init(monthSelect, {classes: 'select-month', dropdownOptions: {container: document.body, constrainWidth: false}});

      // Add change handlers for select
      yearSelect.addEventListener('change', this._handleYearChange.bind(this));
      monthSelect.addEventListener('change', this._handleMonthChange.bind(this));

      if (typeof this.options.onDraw === 'function') {
        this.options.onDraw(this);
      }
    }


    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
      this._handleInputClickBound = this._handleInputClick.bind(this);
      this._handleInputChangeBound= this._handleInputChange.bind(this);
      this._handleCalendarClickBound = this._handleCalendarClick.bind(this);
      this._finishSelectionBound = this._finishSelection.bind(this);
      this._handleMonthChange = this._handleMonthChange.bind(this);
      this._closeBound = this.close.bind(this);

      this.el.addEventListener('click', this._handleInputClickBound);
      this.el.addEventListener('keydown', this._handleInputKeydownBound);
      this.el.addEventListener('change', this._handleInputChangeBound);
      this.calendarEl.addEventListener('click', this._handleCalendarClickBound);
      this.doneBtn.addEventListener('click', this._finishSelectionBound);
      this.cancelBtn.addEventListener('click', this._closeBound);

      if (this.options.showClearBtn) {
        this._handleClearClickBound = this._handleClearClick.bind(this);
        this.clearBtn.addEventListener('click', this._handleClearClickBound);
      }
    }

    _setupVariables() {
      this.$modalEl = $(Datepicker._template);
      this.modalEl = this.$modalEl[0];

		  this.calendarEl = this.modalEl.querySelector('.pika-single');

      this.yearTextEl = this.modalEl.querySelector('.year-text');
      this.dateTextEl = this.modalEl.querySelector('.date-text');
      if (this.options.showClearBtn) {
        this.clearBtn = this.modalEl.querySelector('.datepicker-clear');
      }
      this.doneBtn = this.modalEl.querySelector('.datepicker-done');
      this.cancelBtn = this.modalEl.querySelector('.datepicker-cancel');

      this.formats = {

        d: () => {
          return this.date.getDate();
        },
        dd: () => {
          let d = this.date.getDate();
          return (d < 10 ? '0' : '') + d;
        },
        ddd: () => {
          return this.options.i18n.weekdaysShort[this.date.getDay()];
        },
        dddd: () => {
          return this.options.i18n.weekdays[this.date.getDay()];
        },
        m: () => {
          return this.date.getMonth() + 1;
        },
        mm: () => {
          let m = this.date.getMonth() + 1;
          return (m < 10 ? '0' : '') + m;
        },
        mmm: () => {
          return this.options.i18n.monthsShort[this.date.getMonth()];
        },
        mmmm: () => {
          return this.options.i18n.months[this.date.getMonth()];
        },
        yy: () => {
          return ('' + this.date.getFullYear()).slice(2);
        },
        yyyy: () => {
          return this.date.getFullYear();
        }
      };
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      this.el.removeEventListener('click', this._handleInputClickBound);
      this.el.removeEventListener('keydown', this._handleInputKeydownBound);
      this.el.removeEventListener('change', this._handleInputChangeBound);
      this.calendarEl.removeEventListener('click', this._handleCalendarClickBound);
    }

    _handleInputClick() {
      this.open();
    }

    _handleInputKeydown(e) {
      if (e.which === M.keys.ENTER) {
        e.preventDefault();
        this.open();
      }
    }

    _handleCalendarClick(e) {
      if (!this.isOpen) {
        return;
      }

      let $target = $(e.target);
      if (!$target.hasClass('is-disabled')) {
        if ($target.hasClass('datepicker-day-button') &&
            !$target.hasClass('is-empty') &&
            !$target.parent().hasClass('is-disabled')) {
          this.setDate(new Date(e.target.getAttribute('data-pika-year'),
                                e.target.getAttribute('data-pika-month'),
                                e.target.getAttribute('data-pika-day')));
        }
        else if ($target.closest('.month-prev').length) {
          this.prevMonth();
        }
        else if ($target.closest('.month-next').length) {
          this.nextMonth();
        }
      }
      // if (!$target.hasClass('pika-select')) {
      //   // if this is touch event prevent mouse events emulation
      //   // if (e.preventDefault) {
      //   //   e.preventDefault();
      //   // } else {
      //   //   e.returnValue = false;
      //   //   return false;
      //   // }
      // } else {
      //   this._c = true;
      // }
    }


    _handleClearClick() {
      this.date = null;
      this.setInputValue();
      this.close();
    }

    _handleMonthChange(e) {
      this.gotoMonth(e.target.value);
    }

    _handleYearChange(e) {
      this.gotoYear(e.target.value);
    }


    /**
     * change view to a specific month (zero-index, e.g. 0: January)
     */
    gotoMonth(month) {
      if (!isNaN(month)) {
        this.calendars[0].month = parseInt(month, 10);
        this.adjustCalendars();
      }
    }


    /**
     * change view to a specific full year (e.g. "2012")
     */
    gotoYear(year) {
      if (!isNaN(year)) {
        this.calendars[0].year = parseInt(year, 10);
        this.adjustCalendars();
      }
    }

    _handleInputChange(e) {
      let date;

      // Prevent change event from being fired when triggered by the plugin
      if (e.firedBy === this) {
        return;
      }
      if (this.options.parse) {
        date = this.options.parse(this.el.value, this.options.format);
      } else {
        date = new Date(Date.parse(this.el.value));
      }

      if (Datepicker._isDate(date)) {
        this.setDate(date);
      }
      // if (!self._v) {
      //   self.show();
      // }
    }

    renderDayName(opts, day, abbr) {
      day += opts.firstDay;
      while (day >= 7) {
        day -= 7;
      }
      return abbr ? opts.i18n.weekdaysAbbrev[day] : opts.i18n.weekdays[day];
    }

    /**
     * Set input value to the selected date and close Datepicker
     */
    _finishSelection() {
      this.setInputValue();
      this.close();
    }


    /**
     * Open Datepicker
     */
    open() {
      if (this.isOpen) {
        return;
      }

      this.isOpen = true;
      if (typeof this.options.onOpen === 'function') {
        this.options.onOpen.call(this);
      }
      this.draw();
      this.modal.open();
      return this;
    }

    /**
     * Close Datepicker
     */
    close() {
      if (!this.isOpen) {
        return;
      }

      this.isOpen = false;
      if (typeof this.options.onClose === 'function') {
        this.options.onClose.call(this);
      }
      this.modal.close();
      return this;
    }
  }

  Datepicker._template = [
		'<div class= "modal datepicker-modal">',
		  '<div class="modal-content datepicker-container">',
        '<div class="datepicker-date-display">',
          '<span class="year-text"></span>',
          '<span class="date-text"></span>',
        '</div>',
        '<div class="datepicker-calendar-container">',
          '<div class="pika-single"></div>',
          '<div class="datepicker-footer">',
            '<button class="btn-flat datepicker-clear waves-effect" style="visibility: hidden;" type="button"></button>',
            '<div class="confirmation-btns">',
              '<button class="btn-flat datepicker-cancel waves-effect" type="button"></button>',
              '<button class="btn-flat datepicker-done waves-effect" type="button"></button>',
            '</div>',
          '</div>',
        '</div>',
      '</div>',
		'</div>'
	].join('');

  M.Datepicker = Datepicker;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Datepicker, 'datepicker', 'M_Datepicker');
  }

})(cash);
(function ($, anim) {
  'use strict';

  let _defaults = {
    alignment: 'left',
    autoFocus: true,
    constrainWidth: true,
    container: null,
    coverTrigger: true,
    closeOnClick: true,
    hover: false,
    inDuration: 150,
    outDuration: 250,
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null
  };


  /**
   * @class
   */
  class Dropdown extends Component {
    constructor(el, options) {
      super(Dropdown, el, options);

      this.el.M_Dropdown = this;
      Dropdown._dropdowns.push(this);

      this.id = M.getIdFromTrigger(el);
      this.dropdownEl = document.getElementById(this.id);
      this.$dropdownEl = $(this.dropdownEl);


      /**
       * Options for the dropdown
       * @member Dropdown#options
       * @prop {String} [alignment='left'] - Edge which the dropdown is aligned to
       * @prop {Boolean} [autoFocus=true] - Automatically focus dropdown el for keyboard
       * @prop {Boolean} [constrainWidth=true] - Constrain width to width of the button
       * @prop {Element} container - Container element to attach dropdown to (optional)
       * @prop {Boolean} [coverTrigger=true] - Place dropdown over trigger
       * @prop {Boolean} [closeOnClick=true] - Close on click of dropdown item
       * @prop {Boolean} [hover=false] - Open dropdown on hover
       * @prop {Number} [inDuration=150] - Duration of open animation in ms
       * @prop {Number} [outDuration=250] - Duration of close animation in ms
       * @prop {Function} onOpenStart - Function called when dropdown starts opening
       * @prop {Function} onOpenEnd - Function called when dropdown finishes opening
       * @prop {Function} onCloseStart - Function called when dropdown starts closing
       * @prop {Function} onCloseEnd - Function called when dropdown finishes closing
       */
      this.options = $.extend({}, Dropdown.defaults, options);

      /**
       * Describes open/close state of dropdown
       * @type {Boolean}
       */
      this.isOpen = false;

      /**
       * Describes if dropdown content is scrollable
       * @type {Boolean}
       */
      this.isScrollable = false;

      /**
       * Describes if touch moving on dropdown content
       * @type {Boolean}
       */
      this.isTouchMoving = false;

      this.focusedIndex = -1;
      this.filterQuery = [];

      // Move dropdown-content after dropdown-trigger
      if (!!this.options.container) {
        $(this.options.container).append(this.dropdownEl);
      } else {
        this.$el.after(this.dropdownEl);
      }

      this._makeDropdownFocusable();
      this._resetFilterQueryBound = this._resetFilterQuery.bind(this);
      this._handleDocumentClickBound = this._handleDocumentClick.bind(this);
      this._handleDocumentTouchmoveBound = this._handleDocumentTouchmove.bind(this);
      this._handleDropdownKeydownBound = this._handleDropdownKeydown.bind(this);
      this._handleTriggerKeydownBound = this._handleTriggerKeydown.bind(this);
      this._setupEventHandlers();
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Dropdown;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._resetDropdownStyles();
      this._removeEventHandlers();
      Dropdown._dropdowns.splice(Dropdown._dropdowns.indexOf(this), 1);
      this.el.M_Dropdown = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      // Trigger keydown handler
      this.el.addEventListener('keydown', this._handleTriggerKeydownBound);

      // Hover event handlers
      if (this.options.hover) {
        this._handleMouseEnterBound = this._handleMouseEnter.bind(this);
        this.el.addEventListener('mouseenter', this._handleMouseEnterBound);
        this._handleMouseLeaveBound = this._handleMouseLeave.bind(this);
        this.el.addEventListener('mouseleave', this._handleMouseLeaveBound);
        this.dropdownEl.addEventListener('mouseleave', this._handleMouseLeaveBound);

        // Click event handlers
      } else {
        this._handleClickBound = this._handleClick.bind(this);
        this.el.addEventListener('click', this._handleClickBound);
      }
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      // Trigger keydown handler
      this.el.removeEventListener('keydown', this._handleTriggerKeydownBound);

      if (this.options.hover) {
        this.el.removeEventHandlers('mouseenter', this._handleMouseEnterBound);
        this.el.removeEventHandlers('mouseleave', this._handleMouseLeaveBound);
        this.dropdownEl.removeEventHandlers('mouseleave', this._handleMouseLeaveBound);
      } else {
        this.el.removeEventListener('click', this._handleClickBound);
      }
    }

    _setupTemporaryEventHandlers() {
      // Use capture phase event handler to prevent click
      document.body.addEventListener('click', this._handleDocumentClickBound, true);
      document.body.addEventListener('touchend', this._handleDocumentClickBound);
      document.body.addEventListener('touchmove', this._handleDocumentTouchmoveBound);
      this.dropdownEl.addEventListener('keydown', this._handleDropdownKeydownBound);
    }

    _removeTemporaryEventHandlers() {
      // Use capture phase event handler to prevent click
      document.body.removeEventListener('click', this._handleDocumentClickBound, true);
      document.body.removeEventListener('touchend', this._handleDocumentClickBound);
      document.body.removeEventListener('touchmove', this._handleDocumentTouchmoveBound);
      this.dropdownEl.removeEventListener('keydown', this._handleDropdownKeydownBound);
    }

    _handleClick(e) {
      e.preventDefault();
      this.open();
    }

    _handleMouseEnter() {
      this.open();
    }

    _handleMouseLeave(e) {
      let toEl = e.toElement || e.relatedTarget;
      let leaveToDropdownContent = !!$(toEl).closest('.dropdown-content').length;
      let leaveToActiveDropdownTrigger = false;

      let $closestTrigger = $(toEl).closest('.dropdown-trigger');
      if ($closestTrigger.length && !!$closestTrigger[0].M_Dropdown &&
        $closestTrigger[0].M_Dropdown.isOpen) {
        leaveToActiveDropdownTrigger = true;
      }

      // Close hover dropdown if mouse did not leave to either active dropdown-trigger or dropdown-content
      if (!leaveToActiveDropdownTrigger && !leaveToDropdownContent) {
        this.close();
      }
    }

    _handleDocumentClick(e) {
      let $target = $(e.target);
      if (this.options.closeOnClick &&
          $target.closest('.dropdown-content').length &&
          !this.isTouchMoving) { // isTouchMoving to check if scrolling on mobile.
        setTimeout(() => {
          this.close();
        }, 0);
      } else if ($target.closest('.dropdown-trigger').length ||
        !$target.closest('.dropdown-content').length) {
        setTimeout(() => {
          this.close();
        }, 0);
      }
      this.isTouchMoving = false;
    }

    _handleTriggerKeydown(e) {
      // ARROW DOWN OR ENTER WHEN SELECT IS CLOSED - open Dropdown
      if ((e.which === M.keys.ARROW_DOWN ||
          e.which === M.keys.ENTER) && !this.isOpen) {
        e.preventDefault();
        this.open();
      }
    }

    /**
     * Handle Document Touchmove
     * @param {Event} e
     */
    _handleDocumentTouchmove(e) {
      let $target = $(e.target);
      if ($target.closest('.dropdown-content').length) {
        this.isTouchMoving = true;
      }
    }

    /**
     * Handle Dropdown Keydown
     * @param {Event} e
     */
    _handleDropdownKeydown(e) {
      if (e.which === M.keys.TAB) {
        e.preventDefault();
        this.close();

        // Navigate down dropdown list
      } else if ((e.which === M.keys.ARROW_DOWN ||
                  e.which === M.keys.ARROW_UP) && this.isOpen) {
        e.preventDefault();
        let direction = e.which === M.keys.ARROW_DOWN ? 1 : -1;
        let newFocusedIndex = this.focusedIndex;
        let foundNewIndex = false;
        do {
          newFocusedIndex = newFocusedIndex + direction;

          if (!!this.dropdownEl.children[newFocusedIndex] &&
              this.dropdownEl.children[newFocusedIndex].tabIndex !== -1) {
            foundNewIndex = true;
            break;
          }
        }
        while (newFocusedIndex < this.dropdownEl.children.length &&
               newFocusedIndex >= 0);

        if (foundNewIndex) {
          this.focusedIndex = newFocusedIndex;
          this._focusFocusedItem();
        }

        // ENTER selects choice on focused item
      } else if (e.which === M.keys.ENTER && this.isOpen) {
        // Search for <a> and <button>
        let focusedElement = this.dropdownEl.children[this.focusedIndex];
        let $activatableElement = $(focusedElement).find('a, button').first();

        // Click a or button tag if exists, otherwise click li tag
        !!$activatableElement.length ? $activatableElement[0].click() : focusedElement.click();

        // Close dropdown on ESC
      } else if (e.which === M.keys.ESC && this.isOpen) {
        e.preventDefault();
        this.close();
      }

      // CASE WHEN USER TYPE LETTERS
      let letter = String.fromCharCode(e.which).toLowerCase(),
        nonLetters = [9, 13, 27, 38, 40];
      if (letter && (nonLetters.indexOf(e.which) === -1)) {
        this.filterQuery.push(letter);

        let string = this.filterQuery.join(''),
          newOptionEl = $(this.dropdownEl).find('li').filter((el) => {
            return $(el).text().toLowerCase().indexOf(string) === 0;
          })[0];

        if (newOptionEl) {
          this.focusedIndex = $(newOptionEl).index();
          this._focusFocusedItem();
        }
      }

      this.filterTimeout = setTimeout(this._resetFilterQueryBound, 1000);
    }

    /**
     * Setup dropdown
     */
    _resetFilterQuery() {
      this.filterQuery = [];
    }

    _resetDropdownStyles() {
      this.$dropdownEl.css({
        display: '',
        width: '',
        height: '',
        left: '',
        top: '',
        'transform-origin': '',
        transform: '',
        opacity: ''
      });
    }

    _makeDropdownFocusable() {
      // Needed for arrow key navigation
      this.dropdownEl.tabIndex = 0;

      // Only set tabindex if it hasn't been set by user
      $(this.dropdownEl).children().each(function(el) {
        if (!el.getAttribute('tabindex')) {
          el.setAttribute('tabindex', 0);
        }
      });
    }

    _focusFocusedItem() {
      if (this.focusedIndex >= 0 &&
          this.focusedIndex < this.dropdownEl.children.length &&
          this.options.autoFocus) {
        this.dropdownEl.children[this.focusedIndex].focus();
      }
    }

    _getDropdownPosition() {
      let offsetParentBRect = this.el.offsetParent.getBoundingClientRect();
      let triggerBRect = this.el.getBoundingClientRect();
      let dropdownBRect = this.dropdownEl.getBoundingClientRect();

      let idealHeight = dropdownBRect.height;
      let idealWidth = dropdownBRect.width;
      let idealXPos = triggerBRect.left - dropdownBRect.left;
      let idealYPos = triggerBRect.top - dropdownBRect.top;

      let dropdownBounds = {
        left: idealXPos,
        top: idealYPos,
        height: idealHeight,
        width: idealWidth
      };


      // Countainer here will be closest ancestor with overflow: hidden
      let closestOverflowParent = this.dropdownEl.offsetParent;
      let alignments = M.checkPossibleAlignments(this.el, closestOverflowParent, dropdownBounds, this.options.coverTrigger ? 0 : triggerBRect.height);

      let verticalAlignment = 'top';
      let horizontalAlignment = this.options.alignment;
      idealYPos += (this.options.coverTrigger ? 0 : triggerBRect.height);

      // Reset isScrollable
      this.isScrollable = false;

      if (!alignments.top) {
        if (alignments.bottom) {
          verticalAlignment = 'bottom';
        } else {
          this.isScrollable = true;

          // Determine which side has most space and cutoff at correct height
          if (alignments.spaceOnTop > alignments.spaceOnBottom) {
            verticalAlignment = 'bottom';
            idealHeight += alignments.spaceOnTop;
            idealYPos -= alignments.spaceOnTop;
          } else {
            idealHeight += alignments.spaceOnBottom;
          }
        }
      }

      // If preferred horizontal alignment is possible
      if (!alignments[horizontalAlignment]) {
        let oppositeAlignment = horizontalAlignment === 'left' ? 'right' : 'left';
        if (alignments[oppositeAlignment]) {
          horizontalAlignment = oppositeAlignment;
        } else {
          // Determine which side has most space and cutoff at correct height
          if (alignments.spaceOnLeft > alignments.spaceOnRight) {
            horizontalAlignment = 'right';
            idealWidth += alignments.spaceOnLeft;
            idealXPos -= alignments.spaceOnLeft;
          } else {
            horizontalAlignment = 'left';
            idealWidth += alignments.spaceOnRight;
          }
        }
      }

      if (verticalAlignment === 'bottom') {
        idealYPos = idealYPos - dropdownBRect.height +
          (this.options.coverTrigger ? triggerBRect.height : 0);
      }
      if (horizontalAlignment === 'right') {
        idealXPos = idealXPos - dropdownBRect.width + triggerBRect.width;
      }
      return {
        x: idealXPos,
        y: idealYPos,
        verticalAlignment: verticalAlignment,
        horizontalAlignment: horizontalAlignment,
        height: idealHeight,
        width: idealWidth
      };
    }


    /**
     * Animate in dropdown
     */
    _animateIn() {
      anim.remove(this.dropdownEl);
      anim({
        targets: this.dropdownEl,
        opacity: {
          value: [0, 1],
          easing: 'easeOutQuad'
        },
        scaleX: [.3, 1],
        scaleY: [.3, 1],
        duration: this.options.inDuration,
        easing: 'easeOutQuint',
        complete: (anim) => {
          if (this.options.autoFocus) {
            this.dropdownEl.focus();
          }

          // onOpenEnd callback
          if (typeof (this.options.onOpenEnd) === 'function') {
            let elem = anim.animatables[0].target;
            this.options.onOpenEnd.call(elem, this.el);
          }
        }
      });
    }

    /**
     * Animate out dropdown
     */
    _animateOut() {
      anim.remove(this.dropdownEl);
      anim({
        targets: this.dropdownEl,
        opacity: {
          value: 0,
          easing: 'easeOutQuint'
        },
        scaleX: .3,
        scaleY: .3,
        duration: this.options.outDuration,
        easing: 'easeOutQuint',
        complete: (anim) => {
          this._resetDropdownStyles();

          // onCloseEnd callback
          if (typeof (this.options.onCloseEnd) === 'function') {
            let elem = anim.animatables[0].target;
            this.options.onCloseEnd.call(this, this.el);
          }
        }
      });
    }

    /**
     * Place dropdown
     */
    _placeDropdown() {
      // Set width before calculating positionInfo
      let idealWidth = this.options.constrainWidth ?
        this.el.getBoundingClientRect().width : this.dropdownEl.getBoundingClientRect().width;
      this.dropdownEl.style.width = idealWidth + 'px';

      let positionInfo = this._getDropdownPosition();
      this.dropdownEl.style.left = positionInfo.x + 'px';
      this.dropdownEl.style.top = positionInfo.y + 'px';
      this.dropdownEl.style.height = positionInfo.height + 'px';
      this.dropdownEl.style.width = positionInfo.width + 'px';
      this.dropdownEl.style.transformOrigin =
        `${positionInfo.horizontalAlignment === 'left' ? '0' : '100%'} ${positionInfo.verticalAlignment === 'top' ? '0' : '100%'}`;
    }


    /**
     * Open Dropdown
     */
    open() {
      if (this.isOpen) {
        return;
      }
      this.isOpen = true;

      // onOpenStart callback
      if (typeof (this.options.onOpenStart) === 'function') {
        this.options.onOpenStart.call(this, this.el);
      }

      // Reset styles
      this._resetDropdownStyles();
      this.dropdownEl.style.display = 'block';

      this._placeDropdown();
      this._animateIn();
      this._setupTemporaryEventHandlers();
    }

    /**
     * Close Dropdown
     */
    close() {
      if (!this.isOpen) {
        return;
      }
      this.isOpen = false;
      this.focusedIndex = -1;

      // onCloseStart callback
      if (typeof (this.options.onCloseStart) === 'function') {
        this.options.onCloseStart.call(this, this.el);
      }

      this._animateOut();
      this._removeTemporaryEventHandlers();

      if (this.options.autoFocus) {
        this.el.focus();
      }
    }

    /**
     * Recalculate dimensions
     */
    recalculateDimensions() {
      if (this.isOpen) {
        this.$dropdownEl.css({
          width: '',
          height: '',
          left: '',
          top: '',
          'transform-origin': '',
        });
        this._placeDropdown();
      }
    }
  }

  /**
   * @static
   * @memberof Dropdown
   */
  Dropdown._dropdowns = [];

  window.M.Dropdown = Dropdown;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Dropdown, 'dropdown', 'M_Dropdown');
  }

})(cash, M.anime);
(function ($) {
  // Function to update labels of text fields
  M.updateTextFields = function() {
    let input_selector = 'input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], input[type=search], input[type=date], input[type=time], textarea';
    $(input_selector).each(function(element, index) {
      let $this = $(this);
      if (element.value.length > 0 || $(element).is(':focus') || element.autofocus || $this.attr('placeholder') !== null) {
        $this.siblings('label').addClass('active');
      } else if (element.validity) {
        $this.siblings('label').toggleClass('active', element.validity.badInput === true);
      } else {
        $this.siblings('label').removeClass('active');
      }
    });
  };

  M.validate_field = function(object) {
    let hasLength = object.attr('data-length') !== null;
    let lenAttr = parseInt(object.attr('data-length'));
    let len = object[0].value.length;

    if (len === 0 && object[0].validity.badInput === false && !object.is(':required')) {
      if (object.hasClass('validate')) {
        object.removeClass('valid');
        object.removeClass('invalid');
      }

    } else {
      if (object.hasClass('validate')) {
        // Check for character counter attributes
        if ((object.is(':valid') && hasLength && (len <= lenAttr)) || (object.is(':valid') && !hasLength)) {
          object.removeClass('invalid');
          object.addClass('valid');
        }
        else {
          object.removeClass('valid');
          object.addClass('invalid');
        }
      }
    }
  };


  M.textareaAutoResize = function($textarea) {
    // Wrap if native element
    if ($textarea instanceof Element) {
      $textarea = $($textarea);
    }

    if (!$textarea.length) {
      console.error("No textarea element found");
      return;
    }

    // Textarea Auto Resize
    let hiddenDiv = $('.hiddendiv').first();
    if (!hiddenDiv.length) {
      hiddenDiv = $('<div class="hiddendiv common"></div>');
      $('body').append(hiddenDiv);
    }

    // Set font properties of hiddenDiv
    let fontFamily = $textarea.css('font-family');
    let fontSize = $textarea.css('font-size');
    let lineHeight = $textarea.css('line-height');

    // Firefox can't handle padding shorthand.
    let paddingTop = $textarea.css('padding-top');
    let paddingRight = $textarea.css('padding-right');
    let paddingBottom = $textarea.css('padding-bottom');
    let paddingLeft = $textarea.css('padding-left');

    if (fontSize) { hiddenDiv.css('font-size', fontSize); }
    if (fontFamily) { hiddenDiv.css('font-family', fontFamily); }
    if (lineHeight) { hiddenDiv.css('line-height', lineHeight); }
    if (paddingTop) { hiddenDiv.css('padding-top', paddingTop); }
    if (paddingRight) { hiddenDiv.css('padding-right', paddingRight); }
    if (paddingBottom) { hiddenDiv.css('padding-bottom', paddingBottom); }
    if (paddingLeft) { hiddenDiv.css('padding-left', paddingLeft); }

    // Set original-height, if none
    if (!$textarea.data('original-height')) {
      $textarea.data('original-height', $textarea.height());
    }

    if ($textarea.attr('wrap') === 'off') {
      hiddenDiv.css('overflow-wrap', 'normal')
        .css('white-space', 'pre');
    }

    hiddenDiv.text($textarea[0].value + '\n');
    let content = hiddenDiv.html().replace(/\n/g, '<br>');
    hiddenDiv.html(content);


    // When textarea is hidden, width goes crazy.
    // Approximate with half of window size

    if ($textarea[0].offsetWidth > 0 && $textarea[0].offsetHeight > 0) {
      hiddenDiv.css('width', $textarea.width() + 'px');
    }
    else {
      hiddenDiv.css('width', (window.innerWidth/2) + 'px');
    }


    /**
     * Resize if the new height is greater than the
     * original height of the textarea
     */
    if ($textarea.data('original-height') <= hiddenDiv.innerHeight()) {
      $textarea.css('height', hiddenDiv.innerHeight() + 'px');
    } else if ($textarea[0].value.length < $textarea.data('previous-length')) {
      /**
       * In case the new height is less than original height, it
       * means the textarea has less text than before
       * So we set the height to the original one
       */
      $textarea.css('height', $textarea.data('original-height') + 'px');
    }
    $textarea.data('previous-length', $textarea[0].value.length);
  };


  $(document).ready(function() {
    // Text based inputs
    let input_selector = 'input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], input[type=search], input[type=date], input[type=time], textarea';

    // Add active if form auto complete
    $(document).on('change', input_selector, function () {
      if(this.value.length !== 0 || $(this).attr('placeholder') !== null) {
        $(this).siblings('label').addClass('active');
      }
      M.validate_field($(this));
    });

    // Add active if input element has been pre-populated on document ready
    $(document).ready(function() {
      M.updateTextFields();
    });

    // HTML DOM FORM RESET handling
    $(document).on('reset', function(e) {
      let formReset = $(e.target);
      if (formReset.is('form')) {
        formReset.find(input_selector).removeClass('valid').removeClass('invalid');
        formReset.find(input_selector).each(function (e) {
          if (this.value.length) {
            $(this).siblings('label').removeClass('active');
          }
        });

        // Reset select (after native reset)
        setTimeout(function() {
          formReset.find('select').each(function () {
            // check if initialized
            if (this.M_FormSelect) {
              let reset_text = $(this).find('option[selected]').text();
              $(this).siblings('input.select-dropdown')[0].value = reset_text;
            }
          });
        }, 0);
      }
    });

    /**
     * Add active when element has focus
     * @param {Event} e
     */
    document.addEventListener('focus', function(e) {
      if ($(e.target).is(input_selector)) {
        $(e.target).siblings('label, .prefix').addClass('active');
      }
    }, true);

    /**
     * Remove active when element is blurred
     * @param {Event} e
     */
    document.addEventListener('blur', function(e) {
      let $inputElement = $(e.target);
      if ($inputElement.is(input_selector)) {
        let selector = ".prefix";

        if ($inputElement[0].value.length === 0 && $inputElement[0].validity.badInput !== true && $inputElement.attr('placeholder') === null) {
          selector += ", label";
        }
        $inputElement.siblings(selector).removeClass('active');
        M.validate_field($inputElement);
      }
    }, true);

    // Radio and Checkbox focus class
    let radio_checkbox = 'input[type=radio], input[type=checkbox]';
    $(document).on('keyup', radio_checkbox, function(e) {
      // TAB, check if tabbing to radio or checkbox.
      if (e.which === M.keys.TAB) {
        $(this).addClass('tabbed');
        let $this = $(this);
        $this.one('blur', function(e) {
          $(this).removeClass('tabbed');
        });
        return;
      }
    });

    let text_area_selector = '.materialize-textarea';
    $(text_area_selector).each(function () {
      let $textarea = $(this);
      /**
       * Resize textarea on document load after storing
       * the original height and the original length
       */
      $textarea.data('original-height', $textarea.height());
      $textarea.data('previous-length', this.value.length);
      M.textareaAutoResize($textarea);
    });

    $(document).on('keyup', text_area_selector, function () {
      M.textareaAutoResize($(this));
    });
    $(document).on('keydown', text_area_selector, function () {
      M.textareaAutoResize($(this));
    });

    // File Input Path
    $(document).on('change', '.file-field input[type="file"]', function () {
      let file_field = $(this).closest('.file-field');
      let path_input = file_field.find('input.file-path');
      let files      = $(this)[0].files;
      let file_names = [];
      for (let i = 0; i < files.length; i++) {
        file_names.push(files[i].name);
      }
      path_input[0].value = file_names.join(", ");
      path_input.trigger('change');
    });

  }); // End of $(document).ready
}( cash ));
// Required for Meteor package, the use of window prevents export by Meteor
(function(window){
  if(window.Package){
    M = {};
  } else {
    window.M = {};
  }

  // Check for jQuery
  M.jQueryLoaded = !!window.jQuery;
})(window);


// AMD
if ( typeof define === "function" && define.amd ) {
	define( "M", [], function() {
		return M;
	} );

// Common JS
} else if (typeof exports !== 'undefined' && !exports.nodeType) {
  if (typeof module !== 'undefined' && !module.nodeType && module.exports) {
    exports = module.exports = M;
  }
  exports.default = M;
}

M.keys = {
  TAB: 9,
  ENTER: 13,
  ESC: 27,
  ARROW_UP: 38,
  ARROW_DOWN: 40
};


/**
 * TabPress Keydown handler
 */
M.tabPressed = false;
let docHandleKeydown = function(e) {
  if (e.which === M.keys.TAB) {
    M.tabPressed = true;
  }
};
let docHandleKeyup = function(e) {
  if (e.which === M.keys.TAB) {
    M.tabPressed = false;
  }
};
document.addEventListener('keydown', docHandleKeydown);
document.addEventListener('keyup', docHandleKeyup);


/**
 * Initialize jQuery wrapper for plugin
 * @param {Class} plugin  javascript class
 * @param {string} pluginName  jQuery plugin name
 * @param {string} classRef  Class reference name
 */
M.initializeJqueryWrapper = function(plugin, pluginName, classRef) {
  jQuery.fn[pluginName] = function(methodOrOptions) {
    // Call plugin method if valid method name is passed in
    if (plugin.prototype[methodOrOptions]) {
      let params = Array.prototype.slice.call( arguments, 1 );

      // Getter methods
      if (methodOrOptions.slice(0,3) === 'get') {
        let instance = this.first()[0][classRef];
        return instance[methodOrOptions].apply(instance, params);
      }

      // Void methods
      return this.each(function() {
        let instance = this[classRef];
        instance[methodOrOptions].apply(instance, params);
      });

    // Initialize plugin if options or no argument is passed in
    } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
      plugin.init(this, arguments[0]);
      return this;

    }

    // Return error if an unrecognized  method name is passed in
    jQuery.error(`Method ${methodOrOptions} does not exist on jQuery.${pluginName}`);
  };
};


/**
 * Automatically initialize components
 * @param {Element} context  DOM Element to search within for components
 */
M.AutoInit = function(context) {
  // Use document.body if no context is given
  let root  = !!context ? context : document.body;

  let registry = {
    Autocomplete: root.querySelectorAll('.autocomplete:not(.no-autoinit)'),
    Carousel: root.querySelectorAll('.carousel:not(.no-autoinit)'),
    Chips: root.querySelectorAll('.chips:not(.no-autoinit)'),
    Collapsible: root.querySelectorAll('.collapsible:not(.no-autoinit)'),
    Datepicker: root.querySelectorAll('.datepicker:not(.no-autoinit)'),
    Dropdown: root.querySelectorAll('.dropdown-trigger:not(.no-autoinit)'),
    Materialbox: root.querySelectorAll('.materialboxed:not(.no-autoinit)'),
    Modal: root.querySelectorAll('.modal:not(.no-autoinit)'),
    Parallax: root.querySelectorAll('.parallax:not(.no-autoinit)'),
    Pushpin: root.querySelectorAll('.pushpin:not(.no-autoinit)'),
    ScrollSpy: root.querySelectorAll('.scrollspy:not(.no-autoinit)'),
    FormSelect: root.querySelectorAll('select:not(.no-autoinit)'),
    Sidenav: root.querySelectorAll('.sidenav:not(.no-autoinit)'),
    Tabs: root.querySelectorAll('.tabs:not(.no-autoinit)'),
    TapTarget: root.querySelectorAll('.tap-target:not(.no-autoinit)'),
    Timepicker: root.querySelectorAll('.timepicker:not(.no-autoinit)'),
    Tooltip: root.querySelectorAll('.tooltipped:not(.no-autoinit)'),
    FloatingActionButton: root.querySelectorAll('.fixed-action-btn:not(.no-autoinit)')
  };

  for (let pluginName in registry) {
    let plugin = M[pluginName];
    plugin.init(registry[pluginName]);
  }
};


/**
 * Generate approximated selector string for a jQuery object
 * @param {jQuery} obj  jQuery object to be parsed
 * @returns {string}
 */
M.objectSelectorString = function(obj) {
  let tagStr = obj.prop('tagName') || '';
  let idStr = obj.attr('id') || '';
  let classStr = obj.attr('class') || '';
  return (tagStr + idStr + classStr).replace(/\s/g,'');
};


// Unique Random ID
M.guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();

/**
 * Escapes hash from special characters
 * @param {string} hash  String returned from this.hash
 * @returns {string}
 */
M.escapeHash = function(hash) {
  return hash.replace( /(:|\.|\[|\]|,|=|\/)/g, "\\$1" );
};

M.elementOrParentIsFixed = function(element) {
  let $element = $(element);
  let $checkElements = $element.add($element.parents());
  let isFixed = false;
  $checkElements.each(function(){
    if ($(this).css("position") === "fixed") {
      isFixed = true;
      return false;
    }
  });
  return isFixed;
};

/**
 * @typedef {Object} Edges
 * @property {Boolean} top  If the top edge was exceeded
 * @property {Boolean} right  If the right edge was exceeded
 * @property {Boolean} bottom  If the bottom edge was exceeded
 * @property {Boolean} left  If the left edge was exceeded
 */

/**
 * @typedef {Object} Bounding
 * @property {Number} left  left offset coordinate
 * @property {Number} top  top offset coordinate
 * @property {Number} width
 * @property {Number} height
 */

/**
 * Escapes hash from special characters
 * @param {Element} container  Container element that acts as the boundary
 * @param {Bounding} bounding  element bounding that is being checked
 * @param {Number} offset  offset from edge that counts as exceeding
 * @returns {Edges}
 */
M.checkWithinContainer = function(container, bounding, offset) {
  let edges = {
    top: false,
    right: false,
    bottom: false,
    left: false
  };

  let containerRect = container.getBoundingClientRect();

  let scrollLeft = container.scrollLeft;
  let scrollTop = container.scrollTop;

  let scrolledX = bounding.left - scrollLeft;
  let scrolledY = bounding.top - scrollTop;

  // Check for container and viewport for each edge
  if (scrolledX < containerRect.left + offset ||
      scrolledX < offset) {
    edges.left = true;
  }

  if (scrolledX + bounding.width > containerRect.right - offset ||
      scrolledX + bounding.width > window.innerWidth - offset) {
    edges.right = true;
  }

  if (scrolledY < containerRect.top + offset ||
      scrolledY < offset) {
    edges.top = true;
  }

  if (scrolledY + bounding.height > containerRect.bottom - offset ||
      scrolledY + bounding.height > window.innerHeight - offset) {
    edges.bottom = true;
  }

  return edges;
};


M.checkPossibleAlignments = function(el, container, bounding, offset) {
  let canAlign = {
    top: true,
    right: true,
    bottom: true,
    left: true,
    spaceOnTop: null,
    spaceOnRight: null,
    spaceOnBottom: null,
    spaceOnLeft: null
  };

  let containerAllowsOverflow = getComputedStyle(container).overflow === 'visible';
  let containerRect = container.getBoundingClientRect();
  let containerHeight = Math.min(containerRect.height, window.innerHeight);
  let containerWidth = Math.min(containerRect.width, window.innerWidth);
  let elOffsetRect = el.getBoundingClientRect();

  let scrollLeft = container.scrollLeft;
  let scrollTop = container.scrollTop;

  let scrolledX = bounding.left - scrollLeft;
  let scrolledYTopEdge = bounding.top - scrollTop;
  let scrolledYBottomEdge = bounding.top + elOffsetRect.height - scrollTop;

  // Check for container and viewport for left
  canAlign.spaceOnRight = !containerAllowsOverflow ? containerWidth - (scrolledX + bounding.width) :
    window.innerWidth - (elOffsetRect.left + bounding.width);
  if (canAlign.spaceOnRight < 0) {
    canAlign.left = false;
  }

  // Check for container and viewport for Right
  canAlign.spaceOnLeft = !containerAllowsOverflow ? scrolledX - bounding.width + elOffsetRect.width :
    elOffsetRect.right - bounding.width;
  if (canAlign.spaceOnLeft < 0) {
    canAlign.right = false;
  }

  // Check for container and viewport for Top
  canAlign.spaceOnBottom = !containerAllowsOverflow ? containerHeight - (scrolledYTopEdge + bounding.height + offset) :
    window.innerHeight - (elOffsetRect.top + bounding.height + offset);
  if (canAlign.spaceOnBottom < 0) {
    canAlign.top = false;
  }

  // Check for container and viewport for Bottom
  canAlign.spaceOnTop = !containerAllowsOverflow ? scrolledYBottomEdge - (bounding.height - offset) :
    elOffsetRect.bottom - (bounding.height + offset);
  if (canAlign.spaceOnTop < 0) {
    canAlign.bottom = false;
  }

  return canAlign;
};


M.getOverflowParent = function(element) {
  if (element == null) {
    return null;
  }

  if (element === document.body || getComputedStyle(element).overflow !== 'visible') {
    return element;
  }

  return M.getOverflowParent(element.parentElement);
};


/**
 * Gets id of component from a trigger
 * @param {Element} trigger  trigger
 * @returns {string}
 */
M.getIdFromTrigger = function(trigger) {
  let id = trigger.getAttribute('data-target');
  if (!id) {
    id = trigger.getAttribute('href');
    if (id) {
      id = id.slice(1);
    } else {
      id = "";
    }
  }
  return id;
};


/**
 * Multi browser support for document scroll top
 * @returns {Number}
 */
M.getDocumentScrollTop = function() {
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
};

/**
 * Multi browser support for document scroll left
 * @returns {Number}
 */
M.getDocumentScrollLeft = function() {
  return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
};


/**
 * @typedef {Object} Edges
 * @property {Boolean} top  If the top edge was exceeded
 * @property {Boolean} right  If the right edge was exceeded
 * @property {Boolean} bottom  If the bottom edge was exceeded
 * @property {Boolean} left  If the left edge was exceeded
 */

/**
 * @typedef {Object} Bounding
 * @property {Number} left  left offset coordinate
 * @property {Number} top  top offset coordinate
 * @property {Number} width
 * @property {Number} height
 */


/**
 * Get time in ms
 * @license https://raw.github.com/jashkenas/underscore/master/LICENSE
 * @type {function}
 * @return {number}
 */
let getTime = (Date.now || function () {
  return new Date().getTime();
});


/**
 * Returns a function, that, when invoked, will only be triggered at most once
 * during a given window of time. Normally, the throttled function will run
 * as much as it can, without ever going more than once per `wait` duration;
 * but if you'd like to disable the execution on the leading edge, pass
 * `{leading: false}`. To disable execution on the trailing edge, ditto.
 * @license https://raw.github.com/jashkenas/underscore/master/LICENSE
 * @param {function} func
 * @param {number} wait
 * @param {Object=} options
 * @returns {Function}
 */
M.throttle = function(func, wait, options) {
  let context, args, result;
  let timeout = null;
  let previous = 0;
  options || (options = {});
  let later = function () {
    previous = options.leading === false ? 0 : getTime();
    timeout = null;
    result = func.apply(context, args);
    context = args = null;
  };
  return function () {
    let now = getTime();
    if (!previous && options.leading === false) previous = now;
    let remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0) {
      clearTimeout(timeout);
      timeout = null;
      previous = now;
      result = func.apply(context, args);
      context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};
(function ($, anim) {
  'use strict';

  let _defaults = {
    inDuration: 275,
    outDuration: 200,
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null
  };

  /**
   * @class
   *
   */
  class Materialbox extends Component {
    /**
     * Construct Materialbox instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {

      super(Materialbox, el, options);

      this.el.M_Materialbox = this;

      /**
       * Options for the modal
       * @member Materialbox#options
       * @prop {Number} [inDuration=275] - Length in ms of enter transition
       * @prop {Number} [outDuration=200] - Length in ms of exit transition
       * @prop {Function} onOpenStart - Callback function called before materialbox is opened
       * @prop {Function} onOpenEnd - Callback function called after materialbox is opened
       * @prop {Function} onCloseStart - Callback function called before materialbox is closed
       * @prop {Function} onCloseEnd - Callback function called after materialbox is closed
       */
      this.options = $.extend({}, Materialbox.defaults, options);

      this.overlayActive = false;
      this.doneAnimating = true;
      this.placeholder = $('<div></div>').addClass('material-placeholder');
      this.originalWidth = 0;
      this.originalHeight = 0;
      this.originInlineStyles = this.$el.attr('style');
      this.caption = this.el.getAttribute('data-caption') || "";

      // Wrap
      this.$el.before(this.placeholder);
      this.placeholder.append(this.$el);

      this._setupEventHandlers();
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Materialbox;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this.el.M_Materialbox = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleMaterialboxClickBound = this._handleMaterialboxClick.bind(this);
      this.el.addEventListener('click', this._handleMaterialboxClickBound);
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      this.el.removeEventListener('click', this._handleMaterialboxClickBound);
    }

    /**
     * Handle Materialbox Click
     * @param {Event} e
     */
    _handleMaterialboxClick(e) {
      // If already modal, return to original
      if (this.doneAnimating === false ||
          (this.overlayActive && this.doneAnimating)) {
        this.close();
      } else {
        this.open();
      }
    }

    /**
     * Handle Window Scroll
     */
    _handleWindowScroll() {
      if (this.overlayActive) {
        this.close();
      }
    }

    /**
     * Handle Window Resize
     */
    _handleWindowResize() {
      if (this.overlayActive) {
        this.close();
      }
    }

    /**
     * Handle Window Resize
     * @param {Event} e
     */
    _handleWindowEscape(e) {
      // ESC key
      if (e.keyCode === 27 &&
          this.doneAnimating &&
          this.overlayActive) {
        this.close();
      }
    }

    /**
     * Find ancestors with overflow: hidden; and make visible
     */
    _makeAncestorsOverflowVisible() {
      this.ancestorsChanged = $();
      let ancestor = this.placeholder[0].parentNode;
      while (ancestor !== null && !$(ancestor).is(document)) {
        let curr = $(ancestor);
        if (curr.css('overflow') !== 'visible') {
          curr.css('overflow', 'visible');
          if (this.ancestorsChanged === undefined) {
            this.ancestorsChanged = curr;
          }
          else {
            this.ancestorsChanged = this.ancestorsChanged.add(curr);
          }
        }
        ancestor = ancestor.parentNode;
      }
    }

    /**
     * Animate image in
     */
    _animateImageIn() {
      let animOptions = {
        targets: this.el,
        height: [this.originalHeight, this.newHeight],
        width: [this.originalWidth, this.newWidth],
        left: M.getDocumentScrollLeft() + this.windowWidth/2 - this.placeholder.offset().left - this.newWidth/2,
        top: M.getDocumentScrollTop() + this.windowHeight/2 - this.placeholder.offset().top - this.newHeight/2,
        duration: this.options.inDuration,
        easing: 'easeOutQuad',
        complete: () => {
          this.doneAnimating = true;

          // onOpenEnd callback
          if (typeof(this.options.onOpenEnd) === 'function') {
            this.options.onOpenEnd.call(this, this.el);
          }
        }
      };

      // Override max-width or max-height if needed
      this.maxWidth = this.$el.css('max-width');
      this.maxHeight = this.$el.css('max-height');
      if (this.maxWidth !== 'none') {
        animOptions.maxWidth = this.newWidth;
      }
      if (this.maxHeight !== 'none') {
        animOptions.maxHeight = this.newHeight;
      }

      anim(animOptions);
    }

    /**
     * Animate image out
     */
    _animateImageOut() {
      let animOptions = {
        targets: this.el,
        width: this.originalWidth,
        height: this.originalHeight,
        left: 0,
        top: 0,
        duration: this.options.outDuration,
        easing: 'easeOutQuad',
        complete: () => {
          this.placeholder.css({
            height: '',
            width: '',
            position: '',
            top: '',
            left: ''
          });

          // Revert to width or height attribute
          if (this.attrWidth) {
            this.$el.attr('width', this.attrWidth);
          }
          if (this.attrHeight) {
            this.$el.attr('height', this.attrHeight);
          }

          this.$el.removeAttr('style');
          this.$el.attr('style', this.originInlineStyles);

          // Remove class
          this.$el.removeClass('active');
          this.doneAnimating = true;

          // Remove overflow overrides on ancestors
          if (this.ancestorsChanged.length) {
            this.ancestorsChanged.css('overflow', '');
          }

          // onCloseEnd callback
          if (typeof(this.options.onCloseEnd) === 'function') {
            this.options.onCloseEnd.call(this, this.el);
          }
        }
      };

      anim(animOptions);
    }

    /**
     * Update open and close vars
     */
    _updateVars() {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
      this.caption = this.el.getAttribute('data-caption') || "";
    }

    /**
     * Open Materialbox
     */
    open() {
      this._updateVars();
      this.originalWidth = this.el.getBoundingClientRect().width;
      this.originalHeight = this.el.getBoundingClientRect().height;

      // Set states
      this.doneAnimating = false;
      this.$el.addClass('active');
      this.overlayActive = true;

      // onOpenStart callback
      if (typeof(this.options.onOpenStart) === 'function') {
        this.options.onOpenStart.call(this, this.el);
      }

      // Set positioning for placeholder
      this.placeholder.css({
        width: this.placeholder[0].getBoundingClientRect().width + 'px',
        height: this.placeholder[0].getBoundingClientRect().height + 'px',
        position: 'relative',
        top: 0,
        left: 0
      });

      this._makeAncestorsOverflowVisible();

      // Set css on origin
      this.$el.css({
        position: 'absolute',
        'z-index': 1000,
        'will-change': 'left, top, width, height'
      });

      // Change from width or height attribute to css
      this.attrWidth = this.$el.attr('width');
      this.attrHeight = this.$el.attr('height');
      if (this.attrWidth) {
        this.$el.css('width', this.attrWidth + 'px');
        this.$el.removeAttr('width');
      }
      if (this.attrHeight) {
        this.$el.css('width', this.attrHeight + 'px');
        this.$el.removeAttr('height');
      }

      // Add overlay
      this.$overlay = $('<div id="materialbox-overlay"></div>')
        .css({
          opacity: 0
        })
        .one('click', () => {
          if (this.doneAnimating) {
            this.close();
          }
        });

      // Put before in origin image to preserve z-index layering.
      this.$el.before(this.$overlay);

      // Set dimensions if needed
      let overlayOffset = this.$overlay[0].getBoundingClientRect();
      this.$overlay.css({
        width: this.windowWidth + 'px',
        height: this.windowHeight + 'px',
        left: -1 * overlayOffset.left + 'px',
        top: -1 * overlayOffset.top + 'px'
      });

      anim.remove(this.el);
      anim.remove(this.$overlay[0]);

      // Animate Overlay
      anim({
        targets: this.$overlay[0],
        opacity: 1,
        duration: this.options.inDuration,
        easing: 'easeOutQuad'
      });

      // Add and animate caption if it exists
      if (this.caption !== "") {
        if (this.$photocaption) {
          anim.remove(this.$photoCaption[0]);
        }
        this.$photoCaption = $('<div class="materialbox-caption"></div>');
        this.$photoCaption.text(this.caption);
        $('body').append(this.$photoCaption);
        this.$photoCaption.css({ "display": "inline" });

        anim({
          targets: this.$photoCaption[0],
          opacity: 1,
          duration: this.options.inDuration,
          easing: 'easeOutQuad'
        });
      }

      // Resize Image
      let ratio = 0;
      let widthPercent = this.originalWidth / this.windowWidth;
      let heightPercent = this.originalHeight / this.windowHeight;
      this.newWidth = 0;
      this.newHeight = 0;

      if (widthPercent > heightPercent) {
        ratio = this.originalHeight / this.originalWidth;
        this.newWidth = this.windowWidth * 0.9;
        this.newHeight = this.windowWidth * 0.9 * ratio;
      }
      else {
        ratio = this.originalWidth / this.originalHeight;
        this.newWidth = this.windowHeight * 0.9 * ratio;
        this.newHeight = this.windowHeight * 0.9;
      }

      this._animateImageIn();

      // Handle Exit triggers
      this._handleWindowScrollBound = this._handleWindowScroll.bind(this);
      this._handleWindowResizeBound = this._handleWindowResize.bind(this);
      this._handleWindowEscapeBound = this._handleWindowEscape.bind(this);

      window.addEventListener('scroll', this._handleWindowScrollBound);
      window.addEventListener('resize', this._handleWindowResizeBound);
      window.addEventListener('keyup', this._handleWindowEscapeBound);
    }

    /**
     * Close Materialbox
     */
    close() {
      this._updateVars();
      this.doneAnimating = false;

      // onCloseStart callback
      if (typeof(this.options.onCloseStart) === 'function') {
        this.options.onCloseStart.call(this, this.el);
      }

      anim.remove(this.el);
      anim.remove(this.$overlay[0]);

      if (this.caption !== "") {
        anim.remove(this.$photoCaption[0]);
      }

      // disable exit handlers
      window.removeEventListener('scroll', this._handleWindowScrollBound);
      window.removeEventListener('resize', this._handleWindowResizeBound);
      window.removeEventListener('keyup', this._handleWindowEscapeBound);

      anim({
        targets: this.$overlay[0],
        opacity: 0,
        duration: this.options.outDuration,
        easing: 'easeOutQuad',
        complete: () => {
          this.overlayActive = false;
          this.$overlay.remove();
        }
      });

      this._animateImageOut();

      // Remove Caption + reset css settings on image
      if (this.caption !== "") {
        anim({
          targets: this.$photoCaption[0],
          opacity: 0,
          duration: this.options.outDuration,
          easing: 'easeOutQuad',
          complete: () => {
            this.$photoCaption.remove();
          }
        });
      }
    }
  }

  M.Materialbox = Materialbox;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Materialbox, 'materialbox', 'M_Materialbox');
  }

}(cash, M.anime));
(function($, anim) {
  'use strict';

  let _defaults = {
    opacity: 0.5,
    inDuration: 250,
    outDuration: 250,
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null,
    preventScrolling: true,
    dismissible: true,
    startingTop: '4%',
    endingTop: '10%'
  };


  /**
   * @class
   *
   */
  class Modal extends Component {
    /**
     * Construct Modal instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Modal, el, options);

      this.el.M_Modal = this;

      /**
       * Options for the modal
       * @member Modal#options
       * @prop {Number} [opacity=0.5] - Opacity of the modal overlay
       * @prop {Number} [inDuration=250] - Length in ms of enter transition
       * @prop {Number} [outDuration=250] - Length in ms of exit transition
       * @prop {Function} onOpenStart - Callback function called before modal is opened
       * @prop {Function} onOpenEnd - Callback function called after modal is opened
       * @prop {Function} onCloseStart - Callback function called before modal is closed
       * @prop {Function} onCloseEnd - Callback function called after modal is closed
       * @prop {Boolean} [dismissible=true] - Allow modal to be dismissed by keyboard or overlay click
       * @prop {String} [startingTop='4%'] - startingTop
       * @prop {String} [endingTop='10%'] - endingTop
       */
      this.options = $.extend({}, Modal.defaults, options);

      /**
       * Describes open/close state of modal
       * @type {Boolean}
       */
      this.isOpen = false;

      this.id = this.$el.attr('id');
      this._openingTrigger = undefined;
      this.$overlay = $('<div class="modal-overlay"></div>');
      this.el.tabIndex = 0;

      Modal._count++;
      this._setupEventHandlers();
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Modal;
    }

    /**
     * Teardown component
     */
    destroy() {
      Modal._count--;
      this._removeEventHandlers();
      this.el.removeAttribute('style');
      this.$overlay.remove();
      this.el.M_Modal = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleOverlayClickBound = this._handleOverlayClick.bind(this);
      this._handleModalCloseClickBound = this._handleModalCloseClick.bind(this);

      if (Modal._count === 1) {
        document.body.addEventListener('click', this._handleTriggerClick);
      }
      this.$overlay[0].addEventListener('click', this._handleOverlayClickBound);
      this.el.addEventListener('click', this._handleModalCloseClickBound);
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      if (Modal._count === 0) {
        document.body.removeEventListener('click', this._handleTriggerClick);
      }
      this.$overlay[0].removeEventListener('click', this._handleOverlayClickBound);
      this.el.removeEventListener('click', this._handleModalCloseClickBound);
    }

    /**
     * Handle Trigger Click
     * @param {Event} e
     */
    _handleTriggerClick(e) {
      let $trigger =  $(e.target).closest('.modal-trigger');
      if ($trigger.length) {
        let modalId = M.getIdFromTrigger($trigger[0]);
        let modalInstance = document.getElementById(modalId).M_Modal;
        if (modalInstance) {
          modalInstance.open($trigger);
        }
        e.preventDefault();
      }
    }

    /**
     * Handle Overlay Click
     */
    _handleOverlayClick() {
      if (this.options.dismissible) {
        this.close();
      }
    }

    /**
     * Handle Modal Close Click
     * @param {Event} e
     */
    _handleModalCloseClick(e) {
      let $closeTrigger = $(e.target).closest('.modal-close');
      if ($closeTrigger.length) {
        this.close();
      }
    }

    /**
     * Handle Keydown
     * @param {Event} e
     */
    _handleKeydown(e) {
      // ESC key
      if (e.keyCode === 27 && this.options.dismissible) {
        this.close();
      }
    }

    /**
     * Handle Focus
     * @param {Event} e
     */
    _handleFocus(e) {
      if (!this.el.contains(e.target)) {
        this.el.focus();
      }
    }

    /**
     * Animate in modal
     */
    _animateIn() {
      // Set initial styles
      $.extend(this.el.style, {
        display: 'block',
        opacity: 0
      });
      $.extend(this.$overlay[0].style, {
        display: 'block',
        opacity: 0
      });

      // Animate overlay
      anim({
        targets: this.$overlay[0],
        opacity: this.options.opacity,
        duration: this.options.inDuration,
        easing: 'easeOutQuad'
      });

      // Define modal animation options
      let enterAnimOptions = {
        targets: this.el,
        duration: this.options.inDuration,
        easing: 'easeOutCubic',
        // Handle modal onOpenEnd callback
        complete: () => {
          if (typeof(this.options.onOpenEnd) === 'function') {
            this.options.onOpenEnd.call(this, this.el, this._openingTrigger);
          }
        }
      };

      // Bottom sheet animation
      if (this.el.classList.contains('bottom-sheet')) {
        $.extend(enterAnimOptions, {
          bottom: 0,
          opacity: 1
        });
        anim(enterAnimOptions);

      // Normal modal animation
      } else {
        $.extend(enterAnimOptions, {
          top: [this.options.startingTop, this.options.endingTop],
          opacity: 1,
          scaleX: [.8, 1],
          scaleY: [.8, 1]
        });
        anim(enterAnimOptions);
      }
    }

    /**
     * Animate out modal
     */
    _animateOut() {
      // Animate overlay
      anim({
        targets: this.$overlay[0],
        opacity: 0,
        duration: this.options.outDuration,
        easing: 'easeOutQuart'
      });

      // Define modal animation options
      let exitAnimOptions = {
        targets: this.el,
        duration: this.options.outDuration,
        easing: 'easeOutCubic',
        // Handle modal ready callback
        complete: () => {
          this.el.style.display = 'none';
          this.$overlay.remove();

          // Call onCloseEnd callback
          if (typeof(this.options.onCloseEnd) === 'function') {
            this.options.onCloseEnd.call(this, this.el);
          }
        }
      };

      // Bottom sheet animation
      if (this.el.classList.contains('bottom-sheet')) {
        $.extend(exitAnimOptions, {
          bottom: '-100%',
          opacity: 0
        });
        anim(exitAnimOptions);

      // Normal modal animation
      } else {
        $.extend(exitAnimOptions, {
          top: [this.options.endingTop, this.options.startingTop],
          opacity: 0,
          scaleX: 0.8,
          scaleY: 0.8
        });
        anim(exitAnimOptions);
      }
    }


    /**
     * Open Modal
     * @param {cash} [$trigger]
     */
    open($trigger) {
      if (this.isOpen) {
        return;
      }

      this.isOpen = true;
      Modal._modalsOpen++;

      // Set Z-Index based on number of currently open modals
      this.$overlay[0].style.zIndex = 1000 + Modal._modalsOpen * 2;
      this.el.style.zIndex = 1000 + Modal._modalsOpen * 2 + 1;

      // Set opening trigger, undefined indicates modal was opened by javascript
      this._openingTrigger = !!$trigger ? $trigger[0] : undefined;

      // onOpenStart callback
      if (typeof(this.options.onOpenStart) === 'function') {
        this.options.onOpenStart.call(this, this.el, this._openingTrigger);
      }

      if (this.options.preventScrolling) {
        document.body.style.overflow = 'hidden';
      }

      this.el.classList.add('open');
      this.el.insertAdjacentElement('afterend', this.$overlay[0]);

      if (this.options.dismissible) {
        this._handleKeydownBound = this._handleKeydown.bind(this);
        this._handleFocusBound = this._handleFocus.bind(this);
        document.addEventListener('keydown', this._handleKeydownBound);
        document.addEventListener('focus', this._handleFocusBound, true);
      }

      anim.remove(this.el);
      anim.remove(this.$overlay[0]);
      this._animateIn();

      // Focus modal
      this.el.focus();

      return this;
    }

    /**
     * Close Modal
     */
    close() {
      if (!this.isOpen) {
        return;
      }

      this.isOpen = false;
      Modal._modalsOpen--;

      // Call onCloseStart callback
      if (typeof(this.options.onCloseStart) === 'function') {
        this.options.onCloseStart.call(this, this.el);
      }

      this.el.classList.remove('open');

      // Enable body scrolling only if there are no more modals open.
      if (Modal._modalsOpen === 0) {
        document.body.style.overflow = '';
      }

      if (this.options.dismissible) {
        document.removeEventListener('keydown', this._handleKeydownBound);
        document.removeEventListener('focus', this._handleFocusBound);
      }

      anim.remove(this.el);
      anim.remove(this.$overlay[0]);
      this._animateOut();
      return this;
    }
  }

  /**
   * @static
   * @memberof Modal
   */
  Modal._modalsOpen = 0;

  /**
   * @static
   * @memberof Modal
   */
  Modal._count = 0;

  M.Modal = Modal;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Modal, 'modal', 'M_Modal');
  }

})(cash, M.anime);
(function($) {
  'use strict';

  let _defaults = {
    responsiveThreshold: 0, // breakpoint for swipeable
  };

  class Parallax extends Component {

    constructor(el, options) {
      super(Parallax, el, options);

      this.el.M_Parallax = this;

      /**
       * Options for the Parallax
       * @member Parallax#options
       * @prop {Number} responsiveThreshold
       */
      this.options = $.extend({}, Parallax.defaults, options);
      this._enabled = window.innerWidth > this.options.responsiveThreshold;

      this.$img = this.$el.find('img').first();
      this.$img.each(function() {
        let el = this;
        if (el.complete) $(el).trigger("load");
      });

      this._updateParallax();
      this._setupEventHandlers();
      this._setupStyles();

      Parallax._parallaxes.push(this);
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Parallax;
    }

    /**
     * Teardown component
     */
    destroy() {
      Parallax._parallaxes.splice(Parallax._parallaxes.indexOf(this), 1);
      this.$img[0].style.transform = '';
      this._removeEventHandlers();

      this.$el[0].M_Parallax = undefined;
    }

    static _handleScroll() {
      for (let i = 0; i < Parallax._parallaxes.length; i++) {
        let parallaxInstance = Parallax._parallaxes[i];
        parallaxInstance._updateParallax.call(parallaxInstance);
      }
    }

    static _handleWindowResize() {
      for (let i = 0; i < Parallax._parallaxes.length; i++) {
        let parallaxInstance = Parallax._parallaxes[i];
        parallaxInstance._enabled = window.innerWidth > parallaxInstance.options.responsiveThreshold;
      }
    }

    _setupEventHandlers() {
      this._handleImageLoadBound = this._handleImageLoad.bind(this);
      this.$img[0].addEventListener('load', this._handleImageLoadBound);

      if (Parallax._parallaxes.length === 0) {
        Parallax._handleScrollThrottled = M.throttle(Parallax._handleScroll, 5);
        window.addEventListener('scroll', Parallax._handleScrollThrottled);

        Parallax._handleWindowResizeThrottled = M.throttle(Parallax._handleWindowResize, 5);
        window.addEventListener('resize', Parallax._handleWindowResizeThrottled);
      }
    }

    _removeEventHandlers() {
      this.$img[0].removeEventListener('load', this._handleImageLoadBound);

      if (Parallax._parallaxes.length === 0) {
        window.removeEventListener('scroll', Parallax._handleScrollThrottled);
        window.removeEventListener('resize', Parallax._handleWindowResizeThrottled);
      }
    }

    _setupStyles() {
      this.$img[0].style.opacity = 1;
    }

    _handleImageLoad() {
      this._updateParallax();
    }

    _updateParallax() {
      let containerHeight = this.$el.height() > 0 ? this.el.parentNode.offsetHeight : 500;
      let imgHeight = this.$img[0].offsetHeight;
      let parallaxDist = imgHeight - containerHeight;
      let bottom = this.$el.offset().top + containerHeight;
      let top = this.$el.offset().top;
      let scrollTop = M.getDocumentScrollTop();
      let windowHeight = window.innerHeight;
      let windowBottom = scrollTop + windowHeight;
      let percentScrolled = (windowBottom - top) / (containerHeight + windowHeight);
      let parallax = parallaxDist * percentScrolled;

      if (!this._enabled) {
        this.$img[0].style.transform = '';

      } else if (bottom > scrollTop && top < scrollTop + windowHeight) {
        this.$img[0].style.transform = `translate3D(-50%, ${parallax}px, 0)`;
      }
    }
  }

  /**
   * @static
   * @memberof Parallax
   */
  Parallax._parallaxes = [];

  M.Parallax = Parallax;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Parallax, 'parallax', 'M_Parallax');
  }

})(cash);
(function ($) {
  'use strict';

  let _defaults = {
    top: 0,
    bottom: Infinity,
    offset: 0,
    onPositionChange: null
  };


  /**
   * @class
   *
   */
  class Pushpin extends Component {
    /**
     * Construct Pushpin instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Pushpin, el, options);

      this.el.M_Pushpin = this;

      /**
       * Options for the modal
       * @member Pushpin#options
       */
      this.options = $.extend({}, Pushpin.defaults, options);

      this.originalOffset = this.el.offsetTop;
      Pushpin._pushpins.push(this);
      this._setupEventHandlers();
      this._updatePosition();
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Pushpin;
    }

    /**
     * Teardown component
     */
    destroy() {
      this.el.style.top = null;
      this._removePinClasses();
      this._removeEventHandlers();

      // Remove pushpin Inst
      let index = Pushpin._pushpins.indexOf(this);
      Pushpin._pushpins.splice(index, 1);
    }

    static _updateElements() {
      for (let elIndex in Pushpin._pushpins) {
        let pInstance = Pushpin._pushpins[elIndex];
        pInstance._updatePosition();
      }
    }

    _setupEventHandlers() {
      document.addEventListener('scroll', Pushpin._updateElements);
    }

    _removeEventHandlers() {
      document.removeEventListener('scroll', Pushpin._updateElements);
    }

    _updatePosition() {
      let scrolled = M.getDocumentScrollTop() + this.options.offset;

      if (this.options.top <= scrolled && this.options.bottom >= scrolled &&
        !this.el.classList.contains('pinned')) {
        this._removePinClasses();

        this.el.style.top = `${this.options.offset}px`;
        this.el.classList.add('pinned');

        // onPositionChange callback
        if (typeof(this.options.onPositionChange) === 'function') {
          this.options.onPositionChange.call(this, 'pinned');
        }
      }

      // Add pin-top (when scrolled position is above top)
      if (scrolled < this.options.top && !this.el.classList.contains('pin-top')) {
        this._removePinClasses();
        this.el.style.top = 0;
        this.el.classList.add('pin-top');

        // onPositionChange callback
        if (typeof(this.options.onPositionChange) === 'function') {
          this.options.onPositionChange.call(this, 'pin-top');
        }
      }

      // Add pin-bottom (when scrolled position is below bottom)
      if (scrolled > this.options.bottom && !this.el.classList.contains('pin-bottom')) {
        this._removePinClasses();
        this.el.classList.add('pin-bottom');
        this.el.style.top = `${this.options.bottom - this.originalOffset}px`;

        // onPositionChange callback
        if (typeof(this.options.onPositionChange) === 'function') {
          this.options.onPositionChange.call(this, 'pin-bottom');
        }
      }
    }

    _removePinClasses() {
      this.el.classList.remove('pin-top', 'pinned', 'pin-bottom');
    }
  }

  /**
   * @static
   * @memberof Pushpin
   */
  Pushpin._pushpins = [];

  M.Pushpin = Pushpin;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Pushpin, 'pushpin', 'M_Pushpin');
  }

})(cash);
(function ($, anim) {
  'use strict';

  let _defaults = {};


  /**
   * @class
   *
   */
  class Range extends Component {
    /**
     * Construct Range instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Range, el, options);

      this.el.M_Range = this;

      /**
       * Options for the range
       * @member Range#options
       */
      this.options = $.extend({}, Range.defaults, options);

      this._mousedown = false;

      // Setup
      this._setupThumb();

      this._setupEventHandlers();
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Range;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this._removeThumb();
      this.el.M_Range = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleRangeChangeBound = this._handleRangeChange.bind(this);
      this._handleRangeFocusBound = this._handleRangeFocus.bind(this);
      this._handleRangeMousedownTouchstartBound = this._handleRangeMousedownTouchstart.bind(this);
      this._handleRangeInputMousemoveTouchmoveBound = this._handleRangeInputMousemoveTouchmove.bind(this);
      this._handleRangeMouseupTouchendBound = this._handleRangeMouseupTouchend.bind(this);
      this._handleRangeBlurMouseoutTouchleaveBound = this._handleRangeBlurMouseoutTouchleave.bind(this);



      this.el.addEventListener('change', this._handleRangeChangeBound);
      this.el.addEventListener('focus', this._handleRangeFocusBound);

      this.el.addEventListener('mousedown', this._handleRangeMousedownTouchstartBound);
      this.el.addEventListener('touchstart', this._handleRangeMousedownTouchstartBound);

      this.el.addEventListener('input', this._handleRangeInputMousemoveTouchmoveBound);
      this.el.addEventListener('mousemove', this._handleRangeInputMousemoveTouchmoveBound);
      this.el.addEventListener('touchmove', this._handleRangeInputMousemoveTouchmoveBound);

      this.el.addEventListener('mouseup', this._handleRangeMouseupTouchendBound);
      this.el.addEventListener('touchend', this._handleRangeMouseupTouchendBound);

      this.el.addEventListener('blur', this._handleRangeBlurMouseoutTouchleaveBound);
      this.el.addEventListener('mouseout', this._handleRangeBlurMouseoutTouchleaveBound);
      this.el.addEventListener('touchleave', this._handleRangeBlurMouseoutTouchleaveBound);
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      this.el.removeEventListener('change', this._handleRangeChangeBound);
      this.el.removeEventListener('focus', this._handleRangeFocusBound);

      this.el.removeEventListener('mousedown', this._handleRangeMousedownTouchstartBound);
      this.el.removeEventListener('touchstart', this._handleRangeMousedownTouchstartBound);

      this.el.removeEventListener('input', this._handleRangeInputMousemoveTouchmoveBound);
      this.el.removeEventListener('mousemove', this._handleRangeInputMousemoveTouchmoveBound);
      this.el.removeEventListener('touchmove', this._handleRangeInputMousemoveTouchmoveBound);

      this.el.removeEventListener('mouseup', this._handleRangeMouseupTouchendBound);
      this.el.removeEventListener('touchend', this._handleRangeMouseupTouchendBound);

      this.el.removeEventListener('blur', this._handleRangeBlurMouseoutTouchleaveBound);
      this.el.removeEventListener('mouseout', this._handleRangeBlurMouseoutTouchleaveBound);
      this.el.removeEventListener('touchleave', this._handleRangeBlurMouseoutTouchleaveBound);
    }

    /**
     * Handle Range Change
     * @param {Event} e
     */
    _handleRangeChange() {
      $(this.value).html(this.$el.val());

      if (!$(this.thumb).hasClass('active')) {
        this._showRangeBubble();
      }

      let offsetLeft = this._calcRangeOffset();
      $(this.thumb).addClass('active').css('left', offsetLeft + 'px');
    }

    /**
     * Handle Range Focus
     * @param {Event} e
     */
    _handleRangeFocus() {
      if (M.tabPressed) {
        this.$el.addClass('focused');
      }
    }


    /**
     * Handle Range Mousedown and Touchstart
     * @param {Event} e
     */
    _handleRangeMousedownTouchstart(e) {
      // Set indicator value
      $(this.value).html(this.$el.val());

      this._mousedown = true;
      this.$el.addClass('active');

      if (!$(this.thumb).hasClass('active')) {
        this._showRangeBubble();
      }

      if (e.type !== 'input') {
        let offsetLeft = this._calcRangeOffset();
        $(this.thumb).addClass('active').css('left', offsetLeft + 'px');
      }
    }

    /**
     * Handle Range Input, Mousemove and Touchmove
     */
    _handleRangeInputMousemoveTouchmove() {
      if (this._mousedown) {
        if (!$(this.thumb).hasClass('active')) {
          this._showRangeBubble();
        }

        let offsetLeft = this._calcRangeOffset();
        $(this.thumb).addClass('active').css('left', offsetLeft + 'px');
        $(this.value).html(this.$el.val());
      }
    }

    /**
     * Handle Range Mouseup and Touchend
     */
    _handleRangeMouseupTouchend() {
      this._mousedown = false;
      this.$el.removeClass('active');
    }

    /**
     * Handle Range Blur, Mouseout and Touchleave
     */
    _handleRangeBlurMouseoutTouchleave() {
      if (!this._mousedown) {
        this.$el.removeClass('focused');
        let paddingLeft = parseInt(this.$el.css('padding-left'));
        let marginLeft = (7 + paddingLeft) + 'px';

        if ($(this.thumb).hasClass('active')) {
          anim.remove(this.thumb);
          anim({
            targets: this.thumb,
            height: 0,
            width: 0,
            top: 10,
            easing: 'easeOutQuad',
            marginLeft: marginLeft,
            duration: 100
          });
        }
        $(this.thumb).removeClass('active');
      }
    }

    /**
     * Setup dropdown
     */
    _setupThumb() {
      this.thumb = document.createElement('span');
      this.value = document.createElement('span');
      $(this.thumb).addClass('thumb');
      $(this.value).addClass('value');
      $(this.thumb).append(this.value);
      this.$el.after(this.thumb);
    }

    /**
     * Remove dropdown
     */
    _removeThumb() {
      $(this.thumb).remove();
    }

    /**
     * morph thumb into bubble
     */
    _showRangeBubble() {
      let paddingLeft = parseInt($(this.thumb).parent().css('padding-left'));
      let marginLeft = (-7 + paddingLeft) + 'px'; // TODO: fix magic number?
      anim.remove(this.thumb);
      anim({
        targets: this.thumb,
        height: 30,
        width: 30,
        top: -30,
        marginLeft: marginLeft,
        duration: 300,
        easing: 'easeOutQuint'
      });
    }

    /**
     * Calculate the offset of the thumb
     * @return {Number}  offset in pixels
     */
    _calcRangeOffset() {
      let width = this.$el.width() - 15;
      let max = parseFloat(this.$el.attr('max'));
      let min = parseFloat(this.$el.attr('min'));
      let percent = (parseFloat(this.$el.val()) - min) / (max - min);
      return percent * width;
    }
  }

  M.Range = Range;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Range, 'range', 'M_Range');
  }

  Range.init($('input[type=range]'));
}(cash, M.anime));
(function ($, anim) {
  'use strict';

  let _defaults = {
    throttle: 100,
    scrollOffset: 200, // offset - 200 allows elements near bottom of page to scroll
    activeClass: 'active',
    getActiveElement: function (id) {
      return 'a[href="#' + id + '"]';
    }
  };

  /**
   * @class
   *
   */
  class ScrollSpy extends Component {
    /**
     * Construct ScrollSpy instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(ScrollSpy, el, options);

      this.el.M_ScrollSpy = this;

      /**
       * Options for the modal
       * @member Modal#options
       * @prop {Number} [throttle=100] - Throttle of scroll handler
       * @prop {Number} [scrollOffset=200] - Offset for centering element when scrolled to
       * @prop {String} [activeClass='active'] - Class applied to active elements
       * @prop {Function} [getActiveElement] - Used to find active element
       */
      this.options = $.extend({}, ScrollSpy.defaults, options);

      // setup
      ScrollSpy._elements.push(this);
      ScrollSpy._count++;
      ScrollSpy._increment++;
      this.tickId = -1;
      this.id = ScrollSpy._increment;
      this._setupEventHandlers();
      this._handleWindowScroll();
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_ScrollSpy;
    }

    /**
     * Teardown component
     */
    destroy() {
      ScrollSpy._elements.splice(ScrollSpy._elements.indexOf(this), 1);
      ScrollSpy._elementsInView.splice(ScrollSpy._elementsInView.indexOf(this), 1);
      ScrollSpy._visibleElements.splice(ScrollSpy._visibleElements.indexOf(this.$el), 1);
      ScrollSpy._count--;
      this._removeEventHandlers();
      $(this.options.getActiveElement(this.$el.attr('id'))).removeClass(this.options.activeClass);
      this.el.M_ScrollSpy = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      let throttledResize = M.throttle(this._handleWindowScroll, 200);
      this._handleThrottledResizeBound = throttledResize.bind(this);
      this._handleWindowScrollBound = this._handleWindowScroll.bind(this);
      if (ScrollSpy._count === 1) {
        window.addEventListener('scroll', this._handleWindowScrollBound);
        window.addEventListener('resize', this._handleThrottledResizeBound);
        document.body.addEventListener('click', this._handleTriggerClick);
      }
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      if (ScrollSpy._count === 0) {
        window.removeEventListener('scroll', this._handleWindowScrollBound);
        window.removeEventListener('resize', this._handleThrottledResizeBound);
        document.body.removeEventListener('click', this._handleTriggerClick);
      }
    }

    /**
     * Handle Trigger Click
     * @param {Event} e
     */
    _handleTriggerClick(e) {
      let $trigger = $(e.target);
      for (let i = ScrollSpy._elements.length - 1; i >= 0; i--) {
        let scrollspy = ScrollSpy._elements[i];
        if ($trigger.is('a[href="#' + scrollspy.$el.attr('id') + '"]')) {
          e.preventDefault();
          let offset = scrollspy.$el.offset().top + 1;

          anim({
            targets: [document.documentElement, document.body],
            scrollTop: offset - scrollspy.options.scrollOffset,
            duration: 400,
            easing: 'easeOutCubic'
          });
          break;
        }
      }
    }

    /**
     * Handle Window Scroll
     */
    _handleWindowScroll() {
      // unique tick id
      ScrollSpy._ticks++;

      // viewport rectangle
      let top = M.getDocumentScrollTop(),
        left = M.getDocumentScrollLeft(),
        right = left + window.innerWidth,
        bottom = top + window.innerHeight;

      // determine which elements are in view
      let intersections = ScrollSpy._findElements(top, right, bottom, left);
      for (let i = 0; i < intersections.length; i++) {
        let scrollspy = intersections[i];
        let lastTick = scrollspy.tickId;
        if (lastTick < 0) {
          // entered into view
          scrollspy._enter();
        }

        // update tick id
        scrollspy.tickId = ScrollSpy._ticks;
      }

      for (let i = 0; i < ScrollSpy._elementsInView.length; i++) {
        let scrollspy = ScrollSpy._elementsInView[i];
        let lastTick = scrollspy.tickId;
        if (lastTick >= 0 && lastTick !== ScrollSpy._ticks) {
          // exited from view
          scrollspy._exit();
          scrollspy.tickId = -1;
        }
      }

      // remember elements in view for next tick
      ScrollSpy._elementsInView = intersections;
    }

    /**
     * Find elements that are within the boundary
     * @param {number} top
     * @param {number} right
     * @param {number} bottom
     * @param {number} left
     * @return {Array.<ScrollSpy>}   A collection of elements
     */
    static _findElements(top, right, bottom, left) {
      let hits = [];
      for (let i = 0; i < ScrollSpy._elements.length; i++) {
        let scrollspy = ScrollSpy._elements[i];
        let currTop = top + scrollspy.options.scrollOffset || 200;

        if (scrollspy.$el.height() > 0) {
          let elTop = scrollspy.$el.offset().top,
            elLeft = scrollspy.$el.offset().left,
            elRight = elLeft + scrollspy.$el.width(),
            elBottom = elTop + scrollspy.$el.height();

          let isIntersect = !(elLeft > right ||
            elRight < left ||
            elTop > bottom ||
            elBottom < currTop);

          if (isIntersect) {
            hits.push(scrollspy);
          }
        }
      }
      return hits;
    }

    _enter() {
      ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter(function (value) {
        return value.height() != 0;
      });

      if (ScrollSpy._visibleElements[0]) {
        $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).removeClass(this.options.activeClass);
        if (ScrollSpy._visibleElements[0][0].M_ScrollSpy && this.id < ScrollSpy._visibleElements[0][0].M_ScrollSpy.id) {
          ScrollSpy._visibleElements.unshift(this.$el);
        } else {
          ScrollSpy._visibleElements.push(this.$el);
        }
      } else {
        ScrollSpy._visibleElements.push(this.$el);
      }

      $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).addClass(this.options.activeClass);
    }

    _exit() {
      ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter(function (value) {
        return value.height() != 0;
      });

      if (ScrollSpy._visibleElements[0]) {
        $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).removeClass(this.options.activeClass);

        ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter((el) => {
          return el.attr('id') != this.$el.attr('id');
        });
        if (ScrollSpy._visibleElements[0]) { // Check if empty
          $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).addClass(this.options.activeClass);
        }
      }
    }
  }

  /**
   * @static
   * @memberof ScrollSpy
   * @type {Array.<ScrollSpy>}
   */
  ScrollSpy._elements = [];

  /**
   * @static
   * @memberof ScrollSpy
   * @type {Array.<ScrollSpy>}
   */
  ScrollSpy._elementsInView = [];

  /**
   * @static
   * @memberof ScrollSpy
   * @type {Array.<cash>}
   */
  ScrollSpy._visibleElements = [];

  /**
   * @static
   * @memberof ScrollSpy
   */
  ScrollSpy._count = 0;

  /**
   * @static
   * @memberof ScrollSpy
   */
  ScrollSpy._increment = 0;

  /**
   * @static
   * @memberof ScrollSpy
   */
  ScrollSpy._ticks = 0;


  M.ScrollSpy = ScrollSpy;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(ScrollSpy, 'scrollSpy', 'M_ScrollSpy');
  }

})(cash, M.anime);
(function ($) {
  'use strict';

  let _defaults = {
    classes: '',
    dropdownOptions: {}
  };


  /**
   * @class
   *
   */
  class FormSelect extends Component {
    /**
     * Construct FormSelect instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(FormSelect, el, options);

      // Don't init if browser default version
      if (this.$el.hasClass('browser-default')) {
        return;
      }

      this.el.M_FormSelect = this;

      /**
       * Options for the select
       * @member FormSelect#options
       */
      this.options = $.extend({}, FormSelect.defaults, options);

      this.isMultiple = this.$el.prop('multiple');

      // Setup
      this.el.tabIndex = -1;
      this._keysSelected = {};
      this._valueDict = {}; // Maps key to original and generated option element.
      this._setupDropdown();

      this._setupEventHandlers();
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_FormSelect;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this._removeDropdown();
      this.el.M_FormSelect = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleSelectChangeBound = this._handleSelectChange.bind(this);
      this._handleOptionClickBound = this._handleOptionClick.bind(this);
      this._handleInputClickBound = this._handleInputClick.bind(this);

      $(this.dropdownOptions).find('li:not(.optgroup)').each((el) => {
        el.addEventListener('click', this._handleOptionClickBound);
      });
      this.el.addEventListener('change', this._handleSelectChangeBound);
      this.input.addEventListener('click', this._handleInputClickBound);
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      $(this.dropdownOptions).find('li:not(.optgroup)').each((el) => {
        el.removeEventListener('click', this._handleOptionClickBound);
      });
      this.el.removeEventListener('change', this._handleSelectChangeBound);
      this.input.removeEventListener('click', this._handleInputClickBound);
    }

    /**
     * Handle Select Change
     * @param {Event} e
     */
    _handleSelectChange(e) {
      this._setValueToInput();
    }

    /**
     * Handle Option Click
     * @param {Event} e
     */
    _handleOptionClick(e) {
      e.preventDefault();
      let option = $(e.target).closest('li')[0];
      let key = option.id;
      if (!$(option).hasClass('disabled') && !$(option).hasClass('optgroup') && key.length) {
        let selected = true;

        if (this.isMultiple) {
          // Deselect placeholder option if still selected.
          let placeholderOption = $(this.dropdownOptions).find('li.disabled.selected');
          if (placeholderOption.length) {
            placeholderOption.removeClass('selected');
            placeholderOption.find('input[type="checkbox"]').prop('checked', false);
            this._toggleEntryFromArray(placeholderOption[0].id);
          }

          let checkbox = $(option).find('input[type="checkbox"]');
          checkbox.prop('checked', !checkbox.prop('checked'));
          selected = this._toggleEntryFromArray(key);

        } else {
          $(this.dropdownOptions).find('li').removeClass('active');
          $(option).toggleClass('active');
          this.input.value = option.textContent;
        }

        this._activateOption($(this.dropdownOptions), option);
        $(this._valueDict[key].el).prop('selected', selected);
        this.$el.trigger('change');
      }

      e.stopPropagation();
    }

    /**
     * Handle Input Click
     */
    _handleInputClick() {
      if (this.dropdown && this.dropdown.isOpen) {
        this._setValueToInput();
        this._setSelectedStates();
      }
    }

    /**
     * Setup dropdown
     */
    _setupDropdown() {
      this.wrapper = document.createElement('div');
      $(this.wrapper).addClass('select-wrapper' + ' ' + this.options.classes);
      this.$el.before($(this.wrapper));
      this.wrapper.appendChild(this.el);

      if (this.el.disabled) {
        this.wrapper.classList.add('disabled');
      }

      // Create dropdown
      this.$selectOptions = this.$el.children('option, optgroup');
      this.dropdownOptions = document.createElement('ul');
      this.dropdownOptions.id = `select-options-${M.guid()}`;
      $(this.dropdownOptions).addClass('dropdown-content select-dropdown ' + (this.isMultiple ? 'multiple-select-dropdown' : ''));

      // Create dropdown structure.
      if (this.$selectOptions.length) {
        this.$selectOptions.each((el) => {
          if ($(el).is('option')) {
            // Direct descendant option.
            let optionEl;
            if (this.isMultiple) {
              optionEl = this._appendOptionWithIcon(this.$el, el, 'multiple');

            } else {
              optionEl = this._appendOptionWithIcon(this.$el, el);
            }

            this._addOptionToValueDict(el, optionEl);

          } else if ($(el).is('optgroup')) {
            // Optgroup.
            let selectOptions = $(el).children('option');
            $(this.dropdownOptions).append($('<li class="optgroup"><span>' + el.getAttribute('label') + '</span></li>')[0]);

            selectOptions.each((el) => {
              let optionEl = this._appendOptionWithIcon(this.$el, el, 'optgroup-option');
              this._addOptionToValueDict(el, optionEl);
            });
          }
        });
      }

      this.$el.after(this.dropdownOptions);

      // Add input dropdown
      this.input = document.createElement('input');
      $(this.input).addClass('select-dropdown dropdown-trigger');
      this.input.setAttribute('type', 'text');
      this.input.setAttribute('readonly', 'true');
      this.input.setAttribute('data-target', this.dropdownOptions.id);
      if (this.el.disabled) {
        $(this.input).prop('disabled', 'true');
      }

      this.$el.before(this.input);
      this._setValueToInput();

      // Add caret
      let dropdownIcon = $('<svg class="caret" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>');
      this.$el.before(dropdownIcon[0]);

      // Initialize dropdown
      if (!this.el.disabled) {
        let dropdownOptions = $.extend({}, this.options.dropdownOptions);

        // Add callback for centering selected option when dropdown content is scrollable
        dropdownOptions.onOpenEnd = (el) => {
          let selectedOption = $(this.dropdownOptions).find('.selected').first();
          if (this.dropdown.isScrollable && selectedOption.length) {
            let scrollOffset = selectedOption[0].getBoundingClientRect().top - this.dropdownOptions.getBoundingClientRect().top; // scroll to selected option
            scrollOffset -= this.dropdownOptions.clientHeight / 2; // center in dropdown
            this.dropdownOptions.scrollTop = scrollOffset;
          }
        };

        if (this.isMultiple) {
          dropdownOptions.closeOnClick = false;
        }
        this.dropdown = M.Dropdown.init(this.input, dropdownOptions);
      }

      // Add initial selections
      this._setSelectedStates();
    }

    /**
     * Add option to value dict
     * @param {Element} el  original option element
     * @param {Element} optionEl  generated option element
     */
    _addOptionToValueDict(el, optionEl) {
      let index = Object.keys(this._valueDict).length;
      let key = this.dropdownOptions.id + index;
      let obj = {};
      optionEl.id = key;

      obj.el = el;
      obj.optionEl = optionEl;
      this._valueDict[key] = obj;
    }

    /**
     * Remove dropdown
     */
    _removeDropdown() {
      $(this.wrapper).find('.caret').remove();
      $(this.input).remove();
      $(this.dropdownOptions).remove();
      $(this.wrapper).before(this.$el);
      $(this.wrapper).remove();
    }

    /**
     * Setup dropdown
     * @param {Element} select  select element
     * @param {Element} option  option element from select
     * @param {String} type
     * @return {Element}  option element added
     */
    _appendOptionWithIcon(select, option, type) {
      // Add disabled attr if disabled
      let disabledClass = (option.disabled) ? 'disabled ' : '';
      let optgroupClass = (type === 'optgroup-option') ? 'optgroup-option ' : '';
      let multipleCheckbox = this.isMultiple ? `<label><input type="checkbox"${disabledClass}"/><span>${option.innerHTML}</span></label>` : option.innerHTML;
      let liEl = $('<li></li>');
      let spanEl = $('<span></span>');
      spanEl.html(multipleCheckbox);
      liEl.addClass(`${disabledClass} ${optgroupClass}`);
      liEl.append(spanEl);

      // add icons
      let iconUrl = option.getAttribute('data-icon');
      let classes = option.getAttribute('class');
      if (!!iconUrl) {
        let imgEl = $('<img alt="" src="' + iconUrl + '">');
        liEl.prepend(imgEl);
      }

      // Check for multiple type.
      $(this.dropdownOptions).append(liEl[0]);
      return liEl[0];
    }

    /**
     * Toggle entry from option
     * @param {String} key  Option key
     * @return {Boolean}  if entry was added or removed
     */
    _toggleEntryFromArray(key) {
      let notAdded = !this._keysSelected.hasOwnProperty(key);
      if (notAdded) {
        this._keysSelected[key] = true;
      } else {
        delete this._keysSelected[key];
      }

      $(this._valueDict[key].optionEl).toggleClass('active');

      // use notAdded instead of true (to detect if the option is selected or not)
      $(this._valueDict[key].el).prop('selected', notAdded);

      return notAdded;
    }

    /**
     * Set value to input
     */
    _setValueToInput() {
      let value = '';
      let options = this.$el.find('option');

      options.each((el) => {
        if ($(el).prop('selected')) {
          let text = $(el).text();
          value === '' ? value += text : value += ', ' + text;
        }
      });

      if (value === '') {
        let firstDisabled = this.$el.find('option:disabled').eq(0);
        if (firstDisabled.length) {
          value = firstDisabled.text();
        }
      }

      this.input.value = value;
    }

    /**
     * Set selected state of dropdown too match actual select element
     */
    _setSelectedStates() {
      this._keysSelected = {};

      for (let key in this._valueDict) {
        let option = this._valueDict[key];
        if ($(option.el).prop('selected')) {
          $(option.optionEl).find('input[type="checkbox"]').prop("checked", true);
          this._activateOption($(this.dropdownOptions), $(option.optionEl));
          this._keysSelected[key] = true;

        } else {
          $(option.optionEl).find('input[type="checkbox"]').prop("checked", false);
          $(option.optionEl).removeClass('selected');
        }
      }
    }

    /**
     * Make option as selected and scroll to selected position
     * @param {jQuery} collection  Select options jQuery element
     * @param {Element} newOption  element of the new option
     */
    _activateOption(collection, newOption) {
      if (newOption) {
        if (!this.isMultiple) {
          collection.find('li.selected').removeClass('selected');
        }

        let option = $(newOption);
        option.addClass('selected');
      }
    }

    /**
     * Get Selected Values
     * @return {Array}  Array of selected values
     */
    getSelectedValues() {
      let selectedValues = [];
      for (let key in this._keysSelected) {
        selectedValues.push(this._valueDict[key].el.value);
      }
      return selectedValues;
    }
  }

  M.FormSelect = FormSelect;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(FormSelect, 'formSelect', 'M_FormSelect');
  }
}(cash));
(function($, anim) {
  'use strict';

  let _defaults = {
    edge: 'left',
    draggable: true,
    inDuration: 250,
    outDuration: 200,
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null,
    preventScrolling: true
  };


  /**
   * @class
   */
  class Sidenav extends Component {
    /**
     * Construct Sidenav instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor (el, options) {
      super(Sidenav, el, options);

      this.el.M_Sidenav = this;
      this.id = this.$el.attr('id');

      /**
       * Options for the Sidenav
       * @member Sidenav#options
       * @prop {String} [edge='left'] - Side of screen on which Sidenav appears
       * @prop {Boolean} [draggable=true] - Allow swipe gestures to open/close Sidenav
       * @prop {Number} [inDuration=250] - Length in ms of enter transition
       * @prop {Number} [outDuration=200] - Length in ms of exit transition
       * @prop {Function} onOpenStart - Function called when sidenav starts entering
       * @prop {Function} onOpenEnd - Function called when sidenav finishes entering
       * @prop {Function} onCloseStart - Function called when sidenav starts exiting
       * @prop {Function} onCloseEnd - Function called when sidenav finishes exiting
       */
      this.options = $.extend({}, Sidenav.defaults, options);

      /**
       * Describes open/close state of Sidenav
       * @type {Boolean}
       */
      this.isOpen = false;

      /**
       * Describes if Sidenav is fixed
       * @type {Boolean}
       */
      this.isFixed = this.el.classList.contains('sidenav-fixed');

      /**
       * Describes if Sidenav is being draggeed
       * @type {Boolean}
       */
      this.isDragged = false;

      // Window size variables for window resize checks
      this.lastWindowWidth = window.innerWidth;
      this.lastWindowHeight = window.innerHeight;

      this._createOverlay();
      this._createDragTarget();
      this._setupEventHandlers();
      this._setupClasses();
      this._setupFixed();

      Sidenav._sidenavs.push(this);
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Sidenav;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this._overlay.parentNode.removeChild(this._overlay);
      this.dragTarget.parentNode.removeChild(this.dragTarget);
      this.el.M_Sidenav = undefined;

      let index = Sidenav._sidenavs.indexOf(this);
      if (index >= 0) {
        Sidenav._sidenavs.splice(index, 1);
      }
    }

    _createOverlay() {
      let overlay = document.createElement('div');
      this._closeBound = this.close.bind(this);
      overlay.classList.add('sidenav-overlay');

      overlay.addEventListener('click', this._closeBound);

      document.body.appendChild(overlay);
      this._overlay = overlay;
    }

    _setupEventHandlers() {
      if (Sidenav._sidenavs.length === 0) {
        document.body.addEventListener('click', this._handleTriggerClick);
      }

      this._handleDragTargetDragBound = this._handleDragTargetDrag.bind(this);
      this._handleDragTargetReleaseBound = this._handleDragTargetRelease.bind(this);
      this._handleCloseDragBound = this._handleCloseDrag.bind(this);
      this._handleCloseReleaseBound = this._handleCloseRelease.bind(this);
      this._handleCloseTriggerClickBound = this._handleCloseTriggerClick.bind(this);

      this.dragTarget.addEventListener('touchmove', this._handleDragTargetDragBound);
      this.dragTarget.addEventListener('touchend', this._handleDragTargetReleaseBound);
      this._overlay.addEventListener('touchmove', this._handleCloseDragBound);
      this._overlay.addEventListener('touchend', this._handleCloseReleaseBound);
      this.el.addEventListener('touchmove', this._handleCloseDragBound);
      this.el.addEventListener('touchend', this._handleCloseReleaseBound);
      this.el.addEventListener('click', this._handleCloseTriggerClickBound);


      // Add resize for side nav fixed
      if (this.isFixed) {
        this._handleWindowResizeBound = this._handleWindowResize.bind(this);
        window.addEventListener('resize', this._handleWindowResizeBound);
      }
    }

    _removeEventHandlers() {
      if (Sidenav._sidenavs.length === 1) {
        document.body.removeEventListener('click', this._handleTriggerClick);
      }

      this.dragTarget.removeEventListener('touchmove', this._handleDragTargetDragBound);
      this.dragTarget.removeEventListener('touchend', this._handleDragTargetReleaseBound);
      this._overlay.removeEventListener('touchmove', this._handleCloseDragBound);
      this._overlay.removeEventListener('touchend', this._handleCloseReleaseBound);
      this.el.removeEventListener('touchmove', this._handleCloseDragBound);
      this.el.removeEventListener('touchend', this._handleCloseReleaseBound);
      this.el.removeEventListener('click', this._handleCloseTriggerClickBound);

      // Remove resize for side nav fixed
      if (this.isFixed) {
        window.removeEventListener('resize', this._handleWindowResizeBound);
      }
    }

    /**
     * Handle Trigger Click
     * @param {Event} e
     */
    _handleTriggerClick(e) {
      let $trigger =  $(e.target).closest('.sidenav-trigger');
      if (e.target && $trigger.length) {
        let sidenavId = M.getIdFromTrigger($trigger[0]);

        let sidenavInstance = document.getElementById(sidenavId).M_Sidenav;
        if (sidenavInstance) {
          sidenavInstance.open($trigger);
        }
        e.preventDefault();
      }
    }


    /**
     * Set variables needed at the beggining of drag
     * and stop any current transition.
     * @param {Event} e
     */
    _startDrag(e) {
      let clientX = e.targetTouches[0].clientX;
      this.isDragged = true;
      this._startingXpos = clientX;
      this._xPos = this._startingXpos;
      this._time = Date.now();
      this._width = this.el.getBoundingClientRect().width;
      this._overlay.style.display = 'block';
      this._initialScrollTop = this.isOpen ? this.el.scrollTop : M.getDocumentScrollTop();
      this._verticallyScrolling = false;
      anim.remove(this.el);
      anim.remove(this._overlay);
    }


    /**
     * Set variables needed at each drag move update tick
     * @param {Event} e
     */
    _dragMoveUpdate(e) {
      let clientX = e.targetTouches[0].clientX;
      let currentScrollTop = this.isOpen ? this.el.scrollTop : M.getDocumentScrollTop();
      this.deltaX = Math.abs(this._xPos - clientX);
      this._xPos = clientX;
      this.velocityX = this.deltaX / (Date.now() - this._time);
      this._time = Date.now();
      if (this._initialScrollTop !== currentScrollTop) {
        this._verticallyScrolling = true;
      }
    }


    /**
     * Handles Dragging of Sidenav
     * @param {Event} e
     */
    _handleDragTargetDrag(e) {
      // Check if draggable
      if (!this.options.draggable || this._isCurrentlyFixed() || this._verticallyScrolling) {
        return;
      }

      // If not being dragged, set initial drag start variables
      if (!this.isDragged) {
        this._startDrag(e);
      }

      // Run touchmove updates
      this._dragMoveUpdate(e);

      // Calculate raw deltaX
      let totalDeltaX = this._xPos - this._startingXpos;

      // dragDirection is the attempted user drag direction
      let dragDirection = totalDeltaX > 0 ? 'right' : 'left';

      // Don't allow totalDeltaX to exceed Sidenav width or be dragged in the opposite direction
      totalDeltaX = Math.min(this._width, Math.abs(totalDeltaX));
      if (this.options.edge === dragDirection) {
        totalDeltaX = 0;
      }


      /**
       * transformX is the drag displacement
       * transformPrefix is the initial transform placement
       * Invert values if Sidenav is right edge
       */
      let transformX = totalDeltaX;
      let transformPrefix = 'translateX(-100%)';
      if (this.options.edge === 'right') {
        transformPrefix = 'translateX(100%)';
        transformX = -transformX;
      }

      // Calculate open/close percentage of sidenav, with open = 1 and close = 0
      this.percentOpen = Math.min(1, totalDeltaX / this._width);

      // Set transform and opacity styles
      this.el.style.transform = `${transformPrefix} translateX(${transformX}px)`;
      this._overlay.style.opacity = this.percentOpen;
    }

    /**
     * Handle Drag Target Release
     */
    _handleDragTargetRelease() {
      if (this.isDragged) {
        if (this.percentOpen > .5) {
          this.open();
        } else {
          this._animateOut();
        }

        this.isDragged = false;
        this._verticallyScrolling = false;
      }
    }

    /**
     * Handle Close Drag
     * @param {Event} e
     */
    _handleCloseDrag(e) {
      if (this.isOpen) {
        // Check if draggable
        if (!this.options.draggable || this._isCurrentlyFixed() || this._verticallyScrolling) {
          return;
        }

        // If not being dragged, set initial drag start variables
        if (!this.isDragged) {
          this._startDrag(e);
        }

        // Run touchmove updates
        this._dragMoveUpdate(e);

        // Calculate raw deltaX
        let totalDeltaX = this._xPos - this._startingXpos;

        // dragDirection is the attempted user drag direction
        let dragDirection = totalDeltaX > 0 ? 'right' : 'left';

        // Don't allow totalDeltaX to exceed Sidenav width or be dragged in the opposite direction
        totalDeltaX = Math.min(this._width, Math.abs(totalDeltaX));
        if (this.options.edge !== dragDirection) {
          totalDeltaX = 0;
        }

        let transformX = -totalDeltaX;
        if (this.options.edge === 'right') {
          transformX = -transformX;
        }

        // Calculate open/close percentage of sidenav, with open = 1 and close = 0
        this.percentOpen = Math.min(1, 1 - totalDeltaX / this._width);

        // Set transform and opacity styles
        this.el.style.transform = `translateX(${transformX}px)`;
        this._overlay.style.opacity = this.percentOpen;
      }
    }

    /**
     * Handle Close Release
     */
    _handleCloseRelease() {
      if (this.isOpen && this.isDragged) {
        if (this.percentOpen > .5) {
          this._animateIn();
        } else {
          this.close();
        }

        this.isDragged = false;
        this._verticallyScrolling = false;
      }
    }


    /**
     * Handles closing of Sidenav when element with class .sidenav-close
     */
    _handleCloseTriggerClick(e) {
      let $closeTrigger = $(e.target).closest('.sidenav-close');
      if ($closeTrigger.length && !this._isCurrentlyFixed()) {
        this.close();
      }
    }

    /**
     * Handle Window Resize
     */
    _handleWindowResize() {
      // Only handle horizontal resizes
      if (this.lastWindowWidth !== window.innerWidth) {
        if (window.innerWidth > 992) {
          this.open();
        }
        else {
          this.close();
        }
      }

      this.lastWindowWidth = window.innerWidth;
      this.lastWindowHeight = window.innerHeight;
    }

    _setupClasses() {
      if (this.options.edge === 'right') {
        this.el.classList.add('right-aligned');
        this.dragTarget.classList.add('right-aligned');
      }
    }

    _removeClasses() {
      this.el.classList.remove('right-aligned');
      this.dragTarget.classList.remove('right-aligned');
    }

    _setupFixed() {
      if (this._isCurrentlyFixed()) {
        this.open();
      }
    }

    _isCurrentlyFixed() {
      return this.isFixed && window.innerWidth > 992;
    }

    _createDragTarget() {
      let dragTarget = document.createElement('div');
      dragTarget.classList.add('drag-target');
      document.body.appendChild(dragTarget);
      this.dragTarget = dragTarget;
    }

    _preventBodyScrolling() {
      let body = document.body;
      body.style.overflow = 'hidden';
    }

    _enableBodyScrolling() {
      let body = document.body;
      body.style.overflow = '';
    }

    open() {
      if (this.isOpen === true) {
        return;
      }

      this.isOpen = true;

      // Run onOpenStart callback
      if (typeof(this.options.onOpenStart) === 'function') {
        this.options.onOpenStart.call(this, this.el);
      }

      // Handle fixed Sidenav
      if (this._isCurrentlyFixed()) {
        anim.remove(this.el);
        anim({
          targets: this.el,
          translateX: 0,
          duration: 0,
          easing: 'easeOutQuad'
        });
        this._enableBodyScrolling();
        this._overlay.style.display = 'none';

      // Handle non-fixed Sidenav
      } else {
        if (this.options.preventScrolling) {
          this._preventBodyScrolling();
        }

        if (!this.isDragged || this.percentOpen != 1) {
          this._animateIn();
        }
      }
    }

    close() {
      if (this.isOpen === false) {
        return;
      }

      this.isOpen = false;

      // Run onCloseStart callback
      if (typeof(this.options.onCloseStart) === 'function') {
        this.options.onCloseStart.call(this, this.el);
      }

      // Handle fixed Sidenav
      if (this._isCurrentlyFixed()) {
        let transformX = this.options.edge === 'left' ? '-105%' : '105%';
        this.el.style.transform = `translateX(${transformX})`;

      // Handle non-fixed Sidenav
      } else {
        this._enableBodyScrolling();

        if (!this.isDragged || this.percentOpen != 0) {
          this._animateOut();
        } else {
          this._overlay.style.display = 'none';
        }
      }
    }

    _animateIn() {
      this._animateSidenavIn();
      this._animateOverlayIn();
    }

    _animateSidenavIn() {
      let slideOutPercent = this.options.edge === 'left' ? -1 : 1;
      if (this.isDragged) {
        slideOutPercent = this.options.edge === 'left' ? slideOutPercent + this.percentOpen : slideOutPercent - this.percentOpen;
      }

      anim.remove(this.el);
      anim({
        targets: this.el,
        translateX:  [`${slideOutPercent * 100}%`, 0],
        duration: this.options.inDuration,
        easing: 'easeOutQuad',
        complete: () => {
          // Run onOpenEnd callback
          if (typeof(this.options.onOpenEnd) === 'function') {
            this.options.onOpenEnd.call(this, this.el);
          }
        }
      });
    }

    _animateOverlayIn() {
      let start = 0;
      if (this.isDragged) {
        start = this.percentOpen;
      } else {
        $(this._overlay).css({
          display: 'block'
        });
      }

      anim.remove(this._overlay);
      anim({
        targets: this._overlay,
        opacity: [start, 1],
        duration: this.options.inDuration,
        easing: 'easeOutQuad'
      });
    }

    _animateOut() {
      this._animateSidenavOut();
      this._animateOverlayOut();
    }

    _animateSidenavOut() {
      let endPercent = this.options.edge === 'left' ? -1 : 1;
      let slideOutPercent = 0;
      if (this.isDragged) {
        slideOutPercent = this.options.edge === 'left' ? endPercent + this.percentOpen : endPercent - this.percentOpen;
      }

      anim.remove(this.el);
      anim({
        targets: this.el,
        translateX: [`${slideOutPercent * 100}%`, `${endPercent * 105}%`],
        duration: this.options.outDuration,
        easing: 'easeOutQuad',
        complete: () => {
          // Run onOpenEnd callback
          if (typeof(this.options.onCloseEnd) === 'function') {
            this.options.onCloseEnd.call(this, this.el);
          }
        }
      });
    }

    _animateOverlayOut() {
      anim.remove(this._overlay);
      anim({
        targets: this._overlay,
        opacity: 0,
        duration: this.options.outDuration,
        easing: 'easeOutQuad',
        complete: () => {
          $(this._overlay).css('display', 'none');
        }
      });
    }
  }

  /**
   * @static
   * @memberof Sidenav
   * @type {Array.<Sidenav>}
   */
  Sidenav._sidenavs = [];

  window.M.Sidenav = Sidenav;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Sidenav, 'sidenav', 'M_Sidenav');
  }

})(cash, M.anime);
(function ($, anim) {
  'use strict';

  let _defaults = {
    indicators: true,
    height: 400,
    duration: 500,
    interval: 6000
  };


  /**
   * @class
   *
   */
  class Slider extends Component {
    /**
     * Construct Slider instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Slider, el, options);

      this.el.M_Slider = this;

      /**
       * Options for the modal
       * @member Slider#options
       * @prop {Boolean} [indicators=true] - Show indicators
       * @prop {Number} [height=400] - height of slider
       * @prop {Number} [duration=500] - Length in ms of slide transition
       * @prop {Number} [interval=6000] - Length in ms of slide interval
       */
      this.options = $.extend({}, Slider.defaults, options);

      // setup
      this.$slider = this.$el.find('.slides');
      this.$slides = this.$slider.children('li');
      this.activeIndex = this.$slides.filter(function(item) { return $(item).hasClass('active'); }).first().index();
      if (this.activeIndex != -1) {
        this.$active = this.$slides.eq(this.activeIndex);
      }

      this._setSliderHeight();

      // Set initial positions of captions
      this.$slides.find('.caption').each((el) => {
        this._animateCaptionIn(el, 0);
      });

      // Move img src into background-image
      this.$slides.find('img').each((el) => {
        let placeholderBase64 = 'data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
        if ($(el).attr('src') !== placeholderBase64) {
          $(el).css('background-image', 'url("' + $(el).attr('src') + '")');
          $(el).attr('src', placeholderBase64);
        }
      });

      this._setupIndicators();

      // Show active slide
      if (this.$active) {
        this.$active.css('display', 'block');
      } else {
        this.$slides.first().addClass('active');
        anim({
          targets: this.$slides.first()[0],
          opacity: 1,
          duration: this.options.duration,
          easing: 'easeOutQuad'
        });

        this.activeIndex = 0;
        this.$active = this.$slides.eq(this.activeIndex);

        // Update indicators
        if (this.options.indicators) {
          this.$indicators.eq(this.activeIndex).addClass('active');
        }
      }

      // Adjust height to current slide
      this.$active.find('img').each((el) => {
        anim({
          targets: this.$active.find('.caption')[0],
          opacity: 1,
          translateX: 0,
          translateY: 0,
          duration: this.options.duration,
          easing: 'easeOutQuad'
        });
      });

      this._setupEventHandlers();

      // auto scroll
      this.start();
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Slider;
    }

    /**
     * Teardown component
     */
    destroy() {
      this.pause();
      this._removeIndicators();
      this._removeEventHandlers();
      this.el.M_Slider = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleIntervalBound = this._handleInterval.bind(this);
      this._handleIndicatorClickBound = this._handleIndicatorClick.bind(this);

      if (this.options.indicators) {
        this.$indicators.each((el) => {
          el.addEventListener('click', this._handleIndicatorClickBound);
        });
      }
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      if (this.options.indicators) {
        this.$indicators.each((el) => {
          el.removeEventListener('click', this._handleIndicatorClickBound);
        });
      }
    }

    /**
     * Handle indicator click
     * @param {Event} e
     */
    _handleIndicatorClick(e) {
      let currIndex = $(e.target).index();
      this.set(currIndex);
    }

    /**
     * Handle Interval
     */
    _handleInterval() {
      let newActiveIndex = this.$slider.find('.active').index();
      if (this.$slides.length === newActiveIndex + 1) newActiveIndex = 0; // loop to start
      else newActiveIndex += 1;

      this.set(newActiveIndex);
    }

    /**
     * Animate in caption
     * @param {Element} caption
     * @param {Number} duration
     */
    _animateCaptionIn(caption, duration) {
      let animOptions = {
        targets: caption,
        opacity: 0,
        duration: duration,
        easing: 'easeOutQuad'
      };

      if ($(caption).hasClass('center-align')) {
        animOptions.translateY = -100;

      } else if ($(caption).hasClass('right-align')) {
        animOptions.translateX = 100;

      } else if ($(caption).hasClass('left-align')) {
        animOptions.translateX = -100;
      }

      anim(animOptions);
    }

    /**
     * Set height of slider
     */
    _setSliderHeight() {
      // If fullscreen, do nothing
      if (!this.$el.hasClass('fullscreen')) {
        if (this.options.indicators) {
          // Add height if indicators are present
          this.$el.css('height', (this.options.height + 40) + 'px');
        } else {
          this.$el.css('height', this.options.height + 'px');
        }
        this.$slider.css('height', this.options.height + 'px');
      }
    }

    /**
     * Setup indicators
     */
    _setupIndicators() {
      if (this.options.indicators) {
        this.$indicators = $('<ul class="indicators"></ul>');
        this.$slides.each((el, index) => {
          let $indicator = $('<li class="indicator-item"></li>');
          this.$indicators.append($indicator[0]);
        });
        this.$el.append(this.$indicators[0]);
        this.$indicators = this.$indicators.children('li.indicator-item');
      }
    }

    /**
     * Remove indicators
     */
    _removeIndicators() {
      this.$el.find('ul.indicators').remove();
    }

    /**
     * Cycle to nth item
     * @param {Number} index
     */
    set(index) {
      // Wrap around indices.
      if (index >= this.$slides.length) index = 0;
      else if (index < 0) index = this.$slides.length - 1;

      // Only do if index changes
      if (this.activeIndex != index) {
        this.$active = this.$slides.eq(this.activeIndex);
        let $caption = this.$active.find('.caption');
        this.$active.removeClass('active');

        anim({
          targets: this.$active[0],
          opacity: 0,
          duration: this.options.duration,
          easing: 'easeOutQuad',
          complete: () => {
            this.$slides.not('.active').each((el) => {
              anim({
                targets: el,
                opacity: 0,
                translateX: 0,
                translateY: 0,
                duration: 0,
                easing: 'easeOutQuad'
              });
            });
          }
        });

        this._animateCaptionIn($caption[0], this.options.duration);

        // Update indicators
        if (this.options.indicators) {
          this.$indicators.eq(this.activeIndex).removeClass('active');
          this.$indicators.eq(index).addClass('active');
        }

        anim({
          targets: this.$slides.eq(index)[0],
          opacity: 1,
          duration: this.options.duration,
          easing: 'easeOutQuad'
        });

        anim({
          targets: this.$slides.eq(index).find('.caption')[0],
          opacity: 1,
          translateX: 0,
          translateY: 0,
          duration: this.options.duration,
          delay: this.options.duration,
          easing: 'easeOutQuad'
        });

        this.$slides.eq(index).addClass('active');
        this.activeIndex = index;

        // Reset interval
        this.start();
      }
    }

    /**
     * Pause slider interval
     */
    pause() {
      clearInterval(this.interval);
    }

    /**
     * Start slider interval
     */
    start() {
      clearInterval(this.interval);
      this.interval = setInterval(
        this._handleIntervalBound, this.options.duration + this.options.interval
      );
    }

    /**
     * Move to next slide
     */
    next() {
      let newIndex = this.activeIndex + 1;

      // Wrap around indices.
      if (newIndex >= this.$slides.length) newIndex = 0;
      else if (newIndex < 0) newIndex = this.$slides.length - 1;

      this.set(newIndex);
    }

    /**
     * Move to previous slide
     */
    prev() {
      let newIndex = this.activeIndex - 1;

      // Wrap around indices.
      if (newIndex >= this.$slides.length) newIndex = 0;
      else if (newIndex < 0) newIndex = this.$slides.length - 1;

      this.set(newIndex);
    }
  }

  M.Slider = Slider;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Slider, 'slider', 'M_Slider');
  }

}(cash, M.anime));
(function ($, anim) {
  'use strict';

  let _defaults = {
    duration: 300,
    onShow: null,
    swipeable: false,
    responsiveThreshold: Infinity, // breakpoint for swipeable
  };

  /**
   * @class
   *
   */
  class Tabs extends Component {
    /**
     * Construct Tabs instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Tabs, el, options);

      this.el.M_Tabs = this;

      /**
       * Options for the Tabs
       * @member Tabs#options
       * @prop {Number} duration
       * @prop {Function} onShow
       * @prop {Boolean} swipeable
       * @prop {Number} responsiveThreshold
       */
      this.options = $.extend({}, Tabs.defaults, options);

      // Setup
      this.$tabLinks = this.$el.children('li.tab').children('a');
      this.index = 0;
      this._setTabsAndTabWidth();
      this._setupActiveTabLink();
      this._createIndicator();

      if (this.options.swipeable) {
        this._setupSwipeableTabs();

      } else {
        this._setupNormalTabs();
      }


      this._setupEventHandlers();
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Tabs;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this._indicator.parentNode.removeChild(this._indicator);

      if (this.options.swipeable) {
        this._teardownSwipeableTabs();
      } else {
        this._teardownNormalTabs();
      }

      this.$el[0].M_Tabs = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleWindowResizeBound = this._handleWindowResize.bind(this);
      window.addEventListener('resize', this._handleWindowResizeBound);

      this._handleTabClickBound = this._handleTabClick.bind(this);
      this.el.addEventListener('click', this._handleTabClickBound);
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      window.removeEventListener('resize', this._handleWindowResizeBound);
      this.el.removeEventListener('click', this._handleTabClickBound);
    }

    /**
     * Handle window Resize
     */
    _handleWindowResize() {
      this._setTabsAndTabWidth();

      if (this.tabWidth !== 0 && this.tabsWidth !== 0) {
        this._indicator.style.left = this._calcLeftPos(this.$activeTabLink) + 'px';
        this._indicator.style.right = this._calcRightPos(this.$activeTabLink) + 'px';
      }
    }

    /**
     * Handle tab click
     * @param {Event} e
     */
    _handleTabClick(e) {
      let tab = $(e.target).closest('li.tab');
      let tabLink = $(e.target).closest('a');

      // Handle click on tab link only
      if (!tabLink.length || !tabLink.parent().hasClass('tab')) {
        return;
      }

      if (tab.hasClass('disabled')) {
        e.preventDefault();
        return;
      }

      // Act as regular link if target attribute is specified.
      if (!!tabLink.attr("target")) {
        return;
      }

      this._setTabsAndTabWidth();

      // Make the old tab inactive.
      this.$activeTabLink.removeClass('active');
      let $oldContent = this.$content;

      // Update the variables with the new link and content
      this.$activeTabLink = tabLink;
      this.$content = $(M.escapeHash(tabLink[0].hash));
      this.$tabLinks = this.$el.children('li.tab').children('a');

      // Make the tab active.
      this.$activeTabLink.addClass('active');
      let prevIndex = this.index;
      this.index = Math.max(this.$tabLinks.index(tabLink), 0);

      // Swap content
      if (this.options.swipeable) {
        if (this._tabsCarousel) {
          this._tabsCarousel.set(this.index, () => {
            if (typeof(this.options.onShow) === "function") {
              this.options.onShow.call(this, this.$content[0]);
            }
          });
        }
      } else {
        if (this.$content.length) {
          this.$content[0].style.display = 'block';
          this.$content.addClass('active');
          if (typeof(this.options.onShow) === 'function') {
            this.options.onShow.call(this, this.$content[0]);
          }

          if ($oldContent.length &&
              !$oldContent.is(this.$content)) {
            $oldContent[0].style.display = 'none';
            $oldContent.removeClass('active');
          }
        }
      }

      // Update indicator
      this._animateIndicator(prevIndex);

      // Prevent the anchor's default click action
      e.preventDefault();
    }


    /**
     * Generate elements for tab indicator.
     */
    _createIndicator() {
      let indicator = document.createElement('li');
      indicator.classList.add('indicator');

      this.el.appendChild(indicator);
      this._indicator = indicator;

      setTimeout(() => {
        this._indicator.style.left = this._calcLeftPos(this.$activeTabLink) + 'px';
        this._indicator.style.right = this._calcRightPos(this.$activeTabLink) + 'px';
      }, 0);
    }

    /**
     * Setup first active tab link.
     */
    _setupActiveTabLink() {
      // If the location.hash matches one of the links, use that as the active tab.
      this.$activeTabLink = $(this.$tabLinks.filter('[href="'+location.hash+'"]'));

      // If no match is found, use the first link or any with class 'active' as the initial active tab.
      if (this.$activeTabLink.length === 0) {
        this.$activeTabLink = this.$el.children('li.tab').children('a.active').first();
      }
      if (this.$activeTabLink.length === 0) {
        this.$activeTabLink = this.$el.children('li.tab').children('a').first();
      }

      this.$tabLinks.removeClass('active');
      this.$activeTabLink[0].classList.add('active');

      this.index = Math.max(this.$tabLinks.index(this.$activeTabLink), 0);

      if (this.$activeTabLink.length) {
        this.$content = $(M.escapeHash(this.$activeTabLink[0].hash));
        this.$content.addClass('active');
      }
    }

    /**
     * Setup swipeable tabs
     */
    _setupSwipeableTabs() {
      // Change swipeable according to responsive threshold
      if (window.innerWidth > this.options.responsiveThreshold) {
        this.options.swipeable = false;
      }

      let $tabsContent = $();
      this.$tabLinks.each((link) => {
        let $currContent = $(M.escapeHash(link.hash));
        $currContent.addClass('carousel-item');
        $tabsContent = $tabsContent.add($currContent);
      });

      let $tabsWrapper = $('<div class="tabs-content carousel carousel-slider"></div>');
      $tabsContent.first().before($tabsWrapper);
      $tabsWrapper.append($tabsContent);
      $tabsContent[0].style.display = '';

      // Keep active tab index to set initial carousel slide
      let activeTabIndex = this.$activeTabLink.closest('.tab').index();

      this._tabsCarousel = M.Carousel.init($tabsWrapper[0], {
        fullWidth: true,
        noWrap: true,
        onCycleTo: (item) => {
          let prevIndex = this.index;
          this.index = $(item).index();
          this.$activeTabLink.removeClass('active');
          this.$activeTabLink = this.$tabLinks.eq(this.index);
          this.$activeTabLink.addClass('active');
          this._animateIndicator(prevIndex);
          if (typeof(this.options.onShow) === "function") {
            this.options.onShow.call(this, this.$content[0]);
          }
        },
      });

      // Set initial carousel slide to active tab
      this._tabsCarousel.set(activeTabIndex);
    }

    /**
     * Teardown normal tabs.
     */
    _teardownSwipeableTabs() {
      let $tabsWrapper = this._tabsCarousel.$el;
      this._tabsCarousel.destroy();

      // Unwrap
      $tabsWrapper.after($tabsWrapper.children());
      $tabsWrapper.remove();
    }

    /**
     * Setup normal tabs.
     */
    _setupNormalTabs() {
      // Hide Tabs Content
      this.$tabLinks.not(this.$activeTabLink).each((link) => {
        if (!!link.hash) {
          let $currContent = $(M.escapeHash(link.hash));
          if ($currContent.length) {
            $currContent[0].style.display = 'none';
          }
        }
      });
    }

    /**
     * Teardown normal tabs.
     */
    _teardownNormalTabs() {
      // show Tabs Content
      this.$tabLinks.each((link) => {
        if (!!link.hash) {
          let $currContent = $(M.escapeHash(link.hash));
          if ($currContent.length) {
            $currContent[0].style.display = '';
          }
        }
      });
    }

    /**
     * set tabs and tab width
     */
    _setTabsAndTabWidth() {
      this.tabsWidth = this.$el.width();
      this.tabWidth = Math.max(this.tabsWidth, this.el.scrollWidth) / this.$tabLinks.length;
    }

    /**
     * Finds right attribute for indicator based on active tab.
     * @param {cash} el
     */
    _calcRightPos(el) {
      return Math.ceil(this.tabsWidth - el.position().left - el[0].getBoundingClientRect().width);
    }

    /**
     * Finds left attribute for indicator based on active tab.
     * @param {cash} el
     */
    _calcLeftPos(el) {
      return Math.floor(el.position().left);
    }

    updateTabIndicator() {
      this._animateIndicator(this.index);
    }

    /**
     * Animates Indicator to active tab.
     * @param {Number} prevIndex
     */
    _animateIndicator(prevIndex) {
      let leftDelay = 0,
          rightDelay = 0;

      if ((this.index - prevIndex) >= 0) {
        leftDelay = 90;

      } else {
        rightDelay = 90;
      }

      // Animate
      let animOptions = {
        targets: this._indicator,
        left: {
          value: this._calcLeftPos(this.$activeTabLink),
          delay: leftDelay
        },
        right: {
          value: this._calcRightPos(this.$activeTabLink),
          delay: rightDelay
        },
        duration: this.options.duration,
        easing: 'easeOutQuad'
      };
      anim.remove(this._indicator);
      anim(animOptions);
    }

    /**
     * Select tab.
     * @param {String} tabId
     */
    select(tabId) {
      let tab = this.$tabLinks.filter('[href="#' + tabId + '"]');
      if (tab.length) {
        tab.trigger('click');
      }
    }
  }


  window.M.Tabs = Tabs;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Tabs, 'tabs', 'M_Tabs');
  }

})(cash, M.anime);
(function ($) {
  'use strict';

  let _defaults = {
    onOpen: undefined,
    onClose: undefined,
  };


  /**
   * @class
   *
   */
  class TapTarget extends Component {
    /**
     * Construct TapTarget instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(TapTarget, el, options);

      this.el.M_TapTarget = this;

      /**
       * Options for the select
       * @member TapTarget#options
       * @prop {Function} onOpen - Callback function called when feature discovery is opened
       * @prop {Function} onClose - Callback function called when feature discovery is closed
       */
      this.options = $.extend({}, TapTarget.defaults, options);

      this.isOpen = false;

      // setup
      this.$origin = $('#' + this.$el.attr('data-target'));
      this._setup();

      this._calculatePositioning();
      this._setupEventHandlers();
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_TapTarget;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this.el.TapTarget = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleDocumentClickBound = this._handleDocumentClick.bind(this);
      this._handleTargetClickBound = this._handleTargetClick.bind(this);
      this._handleOriginClickBound = this._handleOriginClick.bind(this);

      this.el.addEventListener('click', this._handleTargetClickBound);
      this.originEl.addEventListener('click', this._handleOriginClickBound);

      // Resize
      let throttledResize = M.throttle(this._handleResize, 200);
      this._handleThrottledResizeBound = throttledResize.bind(this);

      window.addEventListener('resize', this._handleThrottledResizeBound);
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      this.el.removeEventListener('click', this._handleTargetClickBound);
      this.originEl.removeEventListener('click', this._handleOriginClickBound);
      window.removeEventListener('resize', this._handleThrottledResizeBound);
    }

    /**
     * Handle Target Click
     * @param {Event} e
     */
    _handleTargetClick(e) {
      this.open();
    }

    /**
     * Handle Origin Click
     * @param {Event} e
     */
    _handleOriginClick(e) {
      this.close();
    }

    /**
     * Handle Resize
     * @param {Event} e
     */
    _handleResize(e) {
      this._calculatePositioning();
    }

    /**
     * Handle Resize
     * @param {Event} e
     */
    _handleDocumentClick(e) {
      if (!$(e.target).closest('.tap-target-wrapper').length) {
        this.close();
        e.preventDefault();
        e.stopPropagation();
      }
    }

    /**
     * Setup Tap Target
     */
    _setup() {
      // Creating tap target
      this.wrapper = this.$el.parent()[0];
      this.waveEl = $(this.wrapper).find('.tap-target-wave')[0];
      this.originEl = $(this.wrapper).find('.tap-target-origin')[0];
      this.contentEl = this.$el.find('.tap-target-content')[0];

      // Creating wrapper
      if (!$(this.wrapper).hasClass('.tap-target-wrapper')) {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('tap-target-wrapper');
        this.$el.before($(this.wrapper));
        this.wrapper.append(this.el);
      }

      // Creating content
      if (!this.contentEl) {
        this.contentEl = document.createElement('div');
        this.contentEl.classList.add('tap-target-content');
        this.$el.append(this.contentEl);
      }

      // Creating foreground wave
      if (!this.waveEl) {
        this.waveEl = document.createElement('div');
        this.waveEl.classList.add('tap-target-wave');

        // Creating origin
        if (!this.originEl) {
          this.originEl = this.$origin.clone(true, true);
          this.originEl.addClass('tap-target-origin');
          this.originEl.removeAttr('id');
          this.originEl.removeAttr('style');
          this.originEl = this.originEl[0];
          this.waveEl.append(this.originEl);
        }

        this.wrapper.append(this.waveEl);
      }
    }

    /**
     * Calculate positioning
     */
    _calculatePositioning() {
      // Element or parent is fixed position?
      let isFixed = this.$origin.css('position') === 'fixed';
      if (!isFixed) {
        let parents = this.$origin.parents();
        for (let i = 0; i < parents.length; i++) {
          isFixed = $(parents[i]).css('position') == 'fixed';
          if (isFixed) {
            break;
          }
        }
      }

      // Calculating origin
      let originWidth = this.$origin.outerWidth();
      let originHeight = this.$origin.outerHeight();
      let originTop = isFixed ? this.$origin.offset().top - M.getDocumentScrollTop() : this.$origin.offset().top;
      let originLeft = isFixed ? this.$origin.offset().left - M.getDocumentScrollLeft() : this.$origin.offset().left;

      // Calculating screen
      let windowWidth = window.innerWidth;
      let windowHeight = window.innerHeight;
      let centerX = windowWidth / 2;
      let centerY = windowHeight / 2;
      let isLeft = originLeft <= centerX;
      let isRight = originLeft > centerX;
      let isTop = originTop <= centerY;
      let isBottom = originTop > centerY;
      let isCenterX = originLeft >= windowWidth * 0.25 && originLeft <= windowWidth * 0.75;

      // Calculating tap target
      let tapTargetWidth = this.$el.outerWidth();
      let tapTargetHeight = this.$el.outerHeight();
      let tapTargetTop = originTop + originHeight / 2 - tapTargetHeight / 2;
      let tapTargetLeft = originLeft + originWidth / 2 - tapTargetWidth / 2;
      let tapTargetPosition = isFixed ? 'fixed' : 'absolute';

      // Calculating content
      let tapTargetTextWidth = isCenterX ? tapTargetWidth : tapTargetWidth / 2 + originWidth;
      let tapTargetTextHeight = tapTargetHeight / 2;
      let tapTargetTextTop = isTop ? tapTargetHeight / 2 : 0;
      let tapTargetTextBottom = 0;
      let tapTargetTextLeft = isLeft && !isCenterX ? tapTargetWidth / 2 - originWidth : 0;
      let tapTargetTextRight = 0;
      let tapTargetTextPadding = originWidth;
      let tapTargetTextAlign = isBottom ? 'bottom' : 'top';

      // Calculating wave
      let tapTargetWaveWidth = originWidth > originHeight ? originWidth * 2 : originWidth * 2;
      let tapTargetWaveHeight = tapTargetWaveWidth;
      let tapTargetWaveTop = tapTargetHeight / 2 - tapTargetWaveHeight / 2;
      let tapTargetWaveLeft = tapTargetWidth / 2 - tapTargetWaveWidth / 2;

      // Setting tap target
      let tapTargetWrapperCssObj = {};
      tapTargetWrapperCssObj.top = isTop ? tapTargetTop + 'px' : '';
      tapTargetWrapperCssObj.right = isRight ? (windowWidth - tapTargetLeft - tapTargetWidth) + 'px' : '';
      tapTargetWrapperCssObj.bottom = isBottom ? (windowHeight - tapTargetTop - tapTargetHeight) + 'px' : '';
      tapTargetWrapperCssObj.left = isLeft ? tapTargetLeft + 'px' : '';
      tapTargetWrapperCssObj.position = tapTargetPosition;
      $(this.wrapper).css(tapTargetWrapperCssObj);

      // Setting content
      $(this.contentEl).css({
        width: tapTargetTextWidth + 'px',
        height: tapTargetTextHeight + 'px',
        top: tapTargetTextTop + 'px',
        right: tapTargetTextRight + 'px',
        bottom: tapTargetTextBottom + 'px',
        left: tapTargetTextLeft + 'px',
        padding: tapTargetTextPadding + 'px',
        verticalAlign: tapTargetTextAlign
      });

      // Setting wave
      $(this.waveEl).css({
        top: tapTargetWaveTop + 'px',
        left: tapTargetWaveLeft + 'px',
        width: tapTargetWaveWidth + 'px',
        height: tapTargetWaveHeight + 'px'
      });
    }

    /**
     * Open TapTarget
     */
    open() {
      if (this.isOpen) {
        return;
      }

      // onOpen callback
      if (typeof (this.options.onOpen) === 'function') {
        this.options.onOpen.call(this, this.$origin[0]);
      }

      this.isOpen = true;
      this.wrapper.classList.add('open');

      document.body.addEventListener('click', this._handleDocumentClickBound, true);
      document.body.addEventListener('touchend', this._handleDocumentClickBound);
    }

    /**
     * Close Tap Target
     */
    close() {
      if (!this.isOpen) {
        return;
      }

      // onClose callback
      if (typeof (this.options.onClose) === 'function') {
        this.options.onClose.call(this, this.$origin[0]);
      }

      this.isOpen = false;
      this.wrapper.classList.remove('open');

      document.body.removeEventListener('click', this._handleDocumentClickBound, true);
      document.body.removeEventListener('touchend', this._handleDocumentClickBound);
    }
  }

  M.TapTarget = TapTarget;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(TapTarget, 'tapTarget', 'M_TapTarget');
  }

}(cash));
(function($) {
  'use strict';

  let _defaults = {
    dialRadius: 135,
		outerRadius: 105,
		innerRadius: 70,
		tickRadius: 20,
		duration: 350,
    container: null,
    defaultTime: 'now',         // default time, 'now' or '13:14' e.g.
		fromNow: 0,            // Millisecond offset from the defaultTime
    showClearBtn: false,

    // internationalization
    i18n: {
      cancel: 'Cancel',
      clear: 'Clear',
      done: 'Ok'
    },

		autoClose: false,      // auto close when minute is selected
		twelveHour: true,      // change to 12 hour AM/PM clock from 24 hour
		vibrate: true          // vibrate the device when dragging clock hand
  };


  /**
   * @class
   *
   */
  class Timepicker extends Component {
    constructor(el, options) {
      super(Timepicker, el, options);

      this.el.M_Timepicker = this;

      this.options = $.extend({}, Timepicker.defaults, options);

      this.id = M.guid();
      this._insertHTMLIntoDOM();
      this._setupModal();
      this._setupVariables();
      this._setupEventHandlers();

      this._clockSetup();
      this._pickerSetup();
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    static _addLeadingZero(num) {
      return (num < 10 ? '0' : '') + num;
    }

    static _createSVGEl (name) {
      let svgNS = 'http://www.w3.org/2000/svg';
      return document.createElementNS(svgNS, name);
    }


    /**
     * @typedef {Object} Point
     * @property {number} x The X Coordinate
     * @property {number} y The Y Coordinate
     */

    /**
     * Get x position of mouse or touch event
     * @param {Event} e
     * @return {Point} x and y location
     */
    static _Pos(e) {
      if (e.targetTouches && (e.targetTouches.length >= 1)) {
        return {x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY};
      }
      // mouse event
      return {x: e.clientX, y: e.clientY};
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Timepicker;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this.modal.destroy();
      $(this.modalEl).remove();
      this.el.M_Timepicker = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
      this._handleInputClickBound = this._handleInputClick.bind(this);
      this._handleClockClickStartBound = this._handleClockClickStart.bind(this);
      this._handleDocumentClickMoveBound = this._handleDocumentClickMove.bind(this);
      this._handleDocumentClickEndBound = this._handleDocumentClickEnd.bind(this);

      this.el.addEventListener('click', this._handleInputClickBound);
      this.el.addEventListener('keydown', this._handleInputKeydownBound);
      this.plate.addEventListener('mousedown', this._handleClockClickStartBound);
      this.plate.addEventListener('touchstart', this._handleClockClickStartBound);

      $(this.spanHours).on('click', this.showView.bind(this, 'hours'));
		  $(this.spanMinutes).on('click', this.showView.bind(this, 'minutes'));
    }

    _removeEventHandlers() {
      this.el.removeEventListener('click', this._handleInputClickBound);
      this.el.removeEventListener('keydown', this._handleInputKeydownBound);
    }

    _handleInputClick() {
      this.open();
    }

    _handleInputKeydown(e) {
      if (e.which === M.keys.ENTER) {
        e.preventDefault();
        this.open();
      }
    }

    _handleClockClickStart(e) {
      e.preventDefault();
      let clockPlateBR = this.plate.getBoundingClientRect();
	    let offset = {x: clockPlateBR.left, y: clockPlateBR.top};

      this.x0 = offset.x + this.options.dialRadius;
			this.y0 = offset.y + this.options.dialRadius;
      this.moved = false;
      let clickPos = Timepicker._Pos(e);
			this.dx = clickPos.x - this.x0;
      this.dy = clickPos.y - this.y0;

      // Set clock hands
      this.setHand(this.dx, this.dy, false);

			// Mousemove on document
      document.addEventListener('mousemove', this._handleDocumentClickMoveBound);
      document.addEventListener('touchmove', this._handleDocumentClickMoveBound);

			// Mouseup on document
      document.addEventListener('mouseup', this._handleDocumentClickEndBound);
      document.addEventListener('touchend', this._handleDocumentClickEndBound);
    }

    _handleDocumentClickMove(e) {
      e.preventDefault();
			let clickPos = Timepicker._Pos(e);
			let x = clickPos.x - this.x0;
			let y = clickPos.y - this.y0;
			this.moved = true;
			this.setHand(x, y, false, true);
    }

    _handleDocumentClickEnd(e) {
      e.preventDefault();
      document.removeEventListener('mouseup', this._handleDocumentClickEndBound);
      document.removeEventListener('touchend', this._handleDocumentClickEndBound);
			let clickPos = Timepicker._Pos(e);
			let x = clickPos.x - this.x0;
			let y = clickPos.y - this.y0;
			if (this.moved && x === this.dx && y === this.dy) {
				this.setHand(x, y);
      }

			if (this.currentView === 'hours') {
				this.showView('minutes', this.options.duration / 2);

      } else if (this.options.autoClose) {
				$(this.minutesView).addClass('timepicker-dial-out');
				setTimeout(() => {
					this.done();
				}, this.options.duration / 2);
      }

			// Unbind mousemove event
			document.removeEventListener('mousemove', this._handleDocumentClickMoveBound);
      document.removeEventListener('touchmove', this._handleDocumentClickMoveBound);
    }

    _insertHTMLIntoDOM() {
      this.$modalEl = $(Timepicker._template);
      this.modalEl = this.$modalEl[0];
      this.modalEl.id = 'modal-' + this.id;

      // Append popover to input by default
      let containerEl = document.querySelector(this.options.container);
      if (this.options.container && !!containerEl) {
        this.$modalEl.appendTo(containerEl);

      } else {
        this.$modalEl.insertBefore(this.el);
      }
    }

    _setupModal() {
      this.modal = M.Modal.init(this.modalEl, {
        onCloseEnd: () => {
          this.isOpen = false;
        }
      });
    }

    _setupVariables() {
		  this.currentView = 'hours';
      this.vibrate = navigator.vibrate ? 'vibrate' : navigator.webkitVibrate ? 'webkitVibrate' : null;

      this._canvas = this.modalEl.querySelector('.timepicker-canvas');
		  this.plate = this.modalEl.querySelector('.timepicker-plate');

		  this.hoursView = this.modalEl.querySelector('.timepicker-hours');
		  this.minutesView = this.modalEl.querySelector('.timepicker-minutes');
		  this.spanHours = this.modalEl.querySelector('.timepicker-span-hours');
		  this.spanMinutes = this.modalEl.querySelector('.timepicker-span-minutes');
		  this.spanAmPm = this.modalEl.querySelector('.timepicker-span-am-pm');
		  this.footer = this.modalEl.querySelector('.timepicker-footer');
		  this.amOrPm = 'PM';
    }

    _pickerSetup() {

      let $clearBtn = $('<button class="btn-flat timepicker-clear waves-effect" style="visibility: hidden;" type="button" tabindex="' + (this.options.twelveHour? '3' : '1') + '">' + this.options.i18n.clear + '</button>')
        .appendTo(this.footer).on('click', this.clear.bind(this));
      if (this.options.showClearBtn) {
        $clearBtn.css({visibility: ''});
      }

      let confirmationBtnsContainer = $('<div class="confirmation-btns"></div>');
		  $('<button class="btn-flat timepicker-close waves-effect" type="button" tabindex="' + (this.options.twelveHour? '3' : '1') + '">' + this.options.i18n.cancel + '</button>')
        .appendTo(confirmationBtnsContainer).on('click', this.close.bind(this));
		  $('<button class="btn-flat timepicker-close waves-effect" type="button" tabindex="' + (this.options.twelveHour? '3' : '1') + '">' + this.options.i18n.done + '</button>')
        .appendTo(confirmationBtnsContainer).on('click', this.done.bind(this));
      confirmationBtnsContainer.appendTo(this.footer);
    }


    _clockSetup() {
      if (this.options.twelveHour) {
        this.$amBtn = $('<div class="am-btn">AM</div>');
        this.$pmBtn = $('<div class="pm-btn">PM</div>');
        this.$amBtn.on('click', this._handleAmPmClick.bind(this)).appendTo(this.spanAmPm);
				this.$pmBtn.on('click', this._handleAmPmClick.bind(this)).appendTo(this.spanAmPm);
		  }

      this._buildHoursView();
      this._buildMinutesView();
      this._buildSVGClock();
    }

    _buildSVGClock() {
      // Draw clock hands and others
      let dialRadius = this.options.dialRadius;
      let tickRadius = this.options.tickRadius;
      let diameter = dialRadius * 2;

			let svg = Timepicker._createSVGEl('svg');
			svg.setAttribute('class', 'timepicker-svg');
			svg.setAttribute('width', diameter);
			svg.setAttribute('height', diameter);
			let g = Timepicker._createSVGEl('g');
			g.setAttribute('transform', 'translate(' + dialRadius + ',' + dialRadius + ')');
			let bearing = Timepicker._createSVGEl('circle');
			bearing.setAttribute('class', 'timepicker-canvas-bearing');
			bearing.setAttribute('cx', 0);
			bearing.setAttribute('cy', 0);
			bearing.setAttribute('r', 4);
			let hand = Timepicker._createSVGEl('line');
			hand.setAttribute('x1', 0);
			hand.setAttribute('y1', 0);
			let bg = Timepicker._createSVGEl('circle');
			bg.setAttribute('class', 'timepicker-canvas-bg');
			bg.setAttribute('r', tickRadius);
			g.appendChild(hand);
			g.appendChild(bg);
			g.appendChild(bearing);
			svg.appendChild(g);
			this._canvas.appendChild(svg);

			this.hand = hand;
			this.bg = bg;
			this.bearing = bearing;
			this.g = g;
    }

    _buildHoursView() {
      let $tick = $('<div class="timepicker-tick"></div>');
	    // Hours view
		  if (this.options.twelveHour) {
			  for (let i = 1; i < 13; i += 1) {
				  let tick = $tick.clone();
				  let radian = i / 6 * Math.PI;
				  let radius = this.options.outerRadius;
				  tick.css({
					  left: this.options.dialRadius + Math.sin(radian) * radius - this.options.tickRadius + 'px',
					  top: this.options.dialRadius - Math.cos(radian) * radius - this.options.tickRadius + 'px'
				  });
				  tick.html(i === 0 ? '00' : i);
				  this.hoursView.appendChild(tick[0]);
				  // tick.on(mousedownEvent, mousedown);
			  }
		  } else {
			  for (let i = 0; i < 24; i += 1) {
				  let tick = $tick.clone();
				  let radian = i / 6 * Math.PI;
				  let inner = i > 0 && i < 13;
				  let radius = inner ? this.options.innerRadius : this.options.outerRadius;
				  tick.css({
					  left: this.options.dialRadius + Math.sin(radian) * radius - this.options.tickRadius + 'px',
					  top: this.options.dialRadius - Math.cos(radian) * radius - this.options.tickRadius + 'px'
				  });
				  tick.html(i === 0 ? '00' : i);
				  this.hoursView.appendChild(tick[0]);
				  // tick.on(mousedownEvent, mousedown);
			  }
		  }
    }

    _buildMinutesView() {
      let $tick = $('<div class="timepicker-tick"></div>');
		  // Minutes view
		  for (let i = 0; i < 60; i += 5) {
			  let tick = $tick.clone();
			  let radian = i / 30 * Math.PI;
			  tick.css({
				  left: this.options.dialRadius + Math.sin(radian) * this.options.outerRadius - this.options.tickRadius + 'px',
				  top: this.options.dialRadius - Math.cos(radian) * this.options.outerRadius - this.options.tickRadius + 'px'
			  });
			  tick.html(Timepicker._addLeadingZero(i));
			  this.minutesView.appendChild(tick[0]);
		  }
    }

    _handleAmPmClick(e) {
      let $btnClicked = $(e.target);
      this.amOrPm = $btnClicked.hasClass('am-btn') ? 'AM' : 'PM';
      this._updateAmPmView();
    }

    _updateAmPmView() {
      if (this.options.twelveHour) {
        this.$amBtn.toggleClass('text-primary', this.amOrPm === 'AM');
        this.$pmBtn.toggleClass('text-primary', this.amOrPm === 'PM');
      }
    }

    _updateTimeFromInput() {
      // Get the time
		  let value = ((this.el.value || this.options.defaultTime || '') + '').split(':');
		  if (this.options.twelveHour && !(typeof value[1] === 'undefined')) {
			  if (value[1].toUpperCase().indexOf("AM") > 0){
				  this.amOrPm = 'AM';
			  } else {
				  this.amOrPm = 'PM';
			  }
			  value[1] = value[1].replace("AM", "").replace("PM", "");
		  }
		  if (value[0] === 'now') {
			  let now = new Date(+ new Date() + this.options.fromNow);
			  value = [
				  now.getHours(),
				  now.getMinutes()
			  ];
        if (this.options.twelveHour) {
          this.amOrPm = value[0] >= 12 && value[0] < 24 ? 'PM' : 'AM';
        }
		  }
		  this.hours = + value[0] || 0;
		  this.minutes = + value[1] || 0;
		  this.spanHours.innerHTML= this.hours;
		  this.spanMinutes.innerHTML = Timepicker._addLeadingZero(this.minutes);

      this._updateAmPmView();
    }

    showView(view, delay) {
		  if (view === 'minutes' && $(this.hoursView).css("visibility") === "visible") {
			  // raiseCallback(this.options.beforeHourSelect);
		  }
		  let isHours = view === 'hours',
				  nextView = isHours ? this.hoursView : this.minutesView,
				  hideView = isHours ? this.minutesView : this.hoursView;
		  this.currentView = view;

		  $(this.spanHours).toggleClass('text-primary', isHours);
		  $(this.spanMinutes).toggleClass('text-primary', !isHours);

		  // Transition view
		  hideView.classList.add('timepicker-dial-out');
		  $(nextView).css('visibility', 'visible')
          .removeClass('timepicker-dial-out');

		  // Reset clock hand
		  this.resetClock(delay);

		  // After transitions ended
		  clearTimeout(this.toggleViewTimer);
		  this.toggleViewTimer = setTimeout(() => {
			  $(hideView).css('visibility', 'hidden');
		  }, this.options.duration);
    }

    resetClock(delay) {
      let view = this.currentView,
				  value = this[view],
				  isHours = view === 'hours',
				  unit = Math.PI / (isHours ? 6 : 30),
				  radian = value * unit,
				  radius = isHours && value > 0 && value < 13 ?
          this.options.innerRadius : this.options.outerRadius,
				  x = Math.sin(radian) * radius,
				  y = - Math.cos(radian) * radius,
				  self = this;

		  if (delay) {
			  $(this.canvas).addClass('timepicker-canvas-out');
			  setTimeout(() => {
				  $(self.canvas).removeClass('timepicker-canvas-out');
				  self.setHand(x, y);
			  }, delay);
		  } else {
			  this.setHand(x, y);
      }
    }

    setHand(x, y, roundBy5) {
		  let radian = Math.atan2(x, - y),
			isHours = this.currentView === 'hours',
			unit = Math.PI / (isHours || roundBy5? 6 : 30),
			z = Math.sqrt(x * x + y * y),
			inner = isHours && z < (this.options.outerRadius + this.options.innerRadius) / 2,
			radius = inner ? this.options.innerRadius : this.options.outerRadius;

		  if (this.options.twelveHour) {
			  radius = this.options.outerRadius;
      }

		  // Radian should in range [0, 2PI]
		  if (radian < 0) {
			  radian = Math.PI * 2 + radian;
      }

		  // Get the round value
		  let value = Math.round(radian / unit);

		  // Get the round radian
		  radian = value * unit;

		  // Correct the hours or minutes
		  if (this.options.twelveHour) {
			  if (isHours) {
				  if (value === 0)
					  value = 12;
			  } else {
				  if (roundBy5)
					  value *= 5;
				  if (value === 60)
					  value = 0;
			  }
		  } else {
			  if (isHours) {
				  if (value === 12) {
					  value = 0;
          }
				  value = inner ? (value === 0 ? 12 : value) : value === 0 ? 0 : value + 12;
			  } else {
				  if (roundBy5) {
					  value *= 5;
          }
				  if (value === 60) {
					  value = 0;
          }
			  }
		  }

		  // Once hours or minutes changed, vibrate the device
		  if (this[this.currentView] !== value) {
			  if (this.vibrate && this.options.vibrate) {
				  // Do not vibrate too frequently
				  if (!this.vibrateTimer) {
					  navigator[this.vibrate](10);
					  this.vibrateTimer = setTimeout(() => {
						  this.vibrateTimer = null;
					  }, 100);
				  }
        }
      }

		  this[this.currentView] = value;
      if (isHours) {
        this['spanHours'].innerHTML = value;
      } else {
        this['spanMinutes'].innerHTML = Timepicker._addLeadingZero(value);
      }

		  // Set clock hand and others' position
		  let cx1 = Math.sin(radian) * (radius - this.options.tickRadius),
			    cy1 = - Math.cos(radian) * (radius - this.options.tickRadius),
		      cx2 = Math.sin(radian) * radius,
			    cy2 = - Math.cos(radian) * radius;
		  this.hand.setAttribute('x2', cx1);
		  this.hand.setAttribute('y2', cy1);
		  this.bg.setAttribute('cx', cx2);
		  this.bg.setAttribute('cy', cy2);
    }

    open() {
      if (this.isOpen) {
        return;
      }

      this.isOpen = true;
      this._updateTimeFromInput();
      this.showView('hours');
      this.modal.open();
    }

    close() {
      if (!this.isOpen) {
        return;
      }

      this.isOpen = false;
      this.modal.close();
    }

    /**
     * Finish timepicker selection.
     */
    done(e, clearValue) {
      // Set input value
		  let last = this.el.value;
		  let value = clearValue ? '' : Timepicker._addLeadingZero(this.hours) + ':' +
          Timepicker._addLeadingZero(this.minutes);
      this.time = value;
		  if (!clearValue && this.options.twelveHour) {
			  value = `${value} ${this.amOrPm}`;
      }
		  this.el.value = value;

      // Trigger change event
		  if (value !== last) {
			  this.$el.trigger('change');
		  }

      this.close();
      this.el.focus();
    }

    clear() {
      this.done(null, true);
    }
  }

  Timepicker._template = [
		'<div class= "modal timepicker-modal">',
			'<div class="modal-content timepicker-container">',
				'<div class="timepicker-digital-display">',
					'<div class="timepicker-text-container">',
						'<div class="timepicker-display-column">',
							'<span class="timepicker-span-hours text-primary"></span>',
							':',
							'<span class="timepicker-span-minutes"></span>',
						'</div>',
						'<div class="timepicker-display-column timepicker-display-am-pm">',
							'<div class="timepicker-span-am-pm"></div>',
						'</div>',
					'</div>',
				'</div>',
				'<div class="timepicker-analog-display">',
					'<div class="timepicker-plate">',
						'<div class="timepicker-canvas"></div>',
						'<div class="timepicker-dial timepicker-hours"></div>',
						'<div class="timepicker-dial timepicker-minutes timepicker-dial-out"></div>',
				  '</div>',
		      '<div class="timepicker-footer"></div>',
				'</div>',
			'</div>',
		'</div>'
	].join('');

  M.Timepicker = Timepicker;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Timepicker, 'timepicker', 'M_Timepicker');
  }

})(cash);
(function($, anim) {
  'use strict';

  let _defaults = {
    html: '',
    displayLength: 4000,
    inDuration: 300,
    outDuration: 375,
    classes: '',
    completeCallback: null,
    activationPercent: 0.8
  };

  class Toast {
    constructor(options) {

      /**
       * Options for the toast
       * @member Toast#options
       */
      this.options = $.extend({}, Toast.defaults, options);
      this.message = this.options.html;

      /**
       * Describes current pan state toast
       * @type {Boolean}
       */
      this.panning = false;

      /**
       * Time remaining until toast is removed
       */
      this.timeRemaining = this.options.displayLength;

      if (Toast._toasts.length === 0) {
        Toast._createContainer();
      }

      // Create new toast
      Toast._toasts.push(this);
      let toastElement = this._createToast();
      toastElement.M_Toast = this;
      this.el = toastElement;
      this._animateIn();
      this._setTimer();
    }

    static get defaults() {
      return _defaults;
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Toast;
    }

    /**
     * Append toast container and add event handlers
     */
    static _createContainer() {
      let container = document.createElement('div');
      container.setAttribute('id', 'toast-container');

      // Add event handler
      container.addEventListener('touchstart', Toast._onDragStart);
      container.addEventListener('touchmove', Toast._onDragMove);
      container.addEventListener('touchend', Toast._onDragEnd);

      container.addEventListener('mousedown', Toast._onDragStart);
      document.addEventListener('mousemove', Toast._onDragMove);
      document.addEventListener('mouseup', Toast._onDragEnd);

      document.body.appendChild(container);
      Toast._container = container;
    }

    /**
     * Remove toast container and event handlers
     */
    static _removeContainer() {
      // Add event handler
      document.removeEventListener('mousemove', Toast._onDragMove);
      document.removeEventListener('mouseup', Toast._onDragEnd);

      Toast._container.parentNode.removeChild(Toast._container);
      Toast._container = null;
    }

    /**
     * Begin drag handler
     * @param {Event} e
     */
    static _onDragStart(e) {
      if (e.target && $(e.target).closest('.toast').length) {
        let $toast = $(e.target).closest('.toast');
        let toast = $toast[0].M_Toast;
        toast.panning = true;
        Toast._draggedToast = toast;
        toast.el.classList.add('panning');
        toast.el.style.transition = '';
        toast.startingXPos = Toast._xPos(e);
        toast.time = Date.now();
        toast.xPos = Toast._xPos(e);
      }
    }

    /**
     * Drag move handler
     * @param {Event} e
     */
    static _onDragMove(e) {
      if (!!Toast._draggedToast) {
        e.preventDefault();
        let toast = Toast._draggedToast;
        toast.deltaX = Math.abs(toast.xPos - Toast._xPos(e));
        toast.xPos = Toast._xPos(e);
        toast.velocityX = toast.deltaX / (Date.now() - toast.time);
        toast.time = Date.now();

        let totalDeltaX = toast.xPos - toast.startingXPos;
        let activationDistance =
            toast.el.offsetWidth * toast.options.activationPercent;
        toast.el.style.transform = `translateX(${totalDeltaX}px)`;
        toast.el.style.opacity = 1-Math.abs(totalDeltaX / activationDistance);
      }
    }

    /**
     * End drag handler
     */
    static _onDragEnd() {
      if (!!Toast._draggedToast) {
        let toast = Toast._draggedToast;
        toast.panning = false;
        toast.el.classList.remove('panning');

        let totalDeltaX = toast.xPos - toast.startingXPos;
        let activationDistance =
            toast.el.offsetWidth * toast.options.activationPercent;
        let shouldBeDismissed = Math.abs(totalDeltaX) > activationDistance ||
            toast.velocityX > 1;

        // Remove toast
        if (shouldBeDismissed) {
          toast.wasSwiped = true;
          toast.dismiss();

        // Animate toast back to original position
        } else {
          toast.el.style.transition = 'transform .2s, opacity .2s';
          toast.el.style.transform = '';
          toast.el.style.opacity = '';
        }
        Toast._draggedToast = null;
      }
    }

    /**
     * Get x position of mouse or touch event
     * @param {Event} e
     */
    static _xPos(e) {
      if (e.targetTouches && (e.targetTouches.length >= 1)) {
        return e.targetTouches[0].clientX;
      }
      // mouse event
      return e.clientX;
    }

    /**
     * Remove all toasts
     */
    static dismissAll() {
      for(let toastIndex in Toast._toasts) {
        Toast._toasts[toastIndex].dismiss();
      }
    }


    /**
     * Create toast and append it to toast container
     */
    _createToast() {
      let toast = document.createElement('div');
      toast.classList.add('toast');

      // Add custom classes onto toast
      if (!!this.options.classes.length) {
        $(toast).addClass(this.options.classes);
      }

      // Set content
      if ( typeof HTMLElement === 'object' ?
           this.message instanceof HTMLElement :
           this.message && typeof this.message === 'object' &&
           this.message !== null && this.message.nodeType === 1 &&
           typeof this.message.nodeName==='string'
         ) {
        toast.appendChild(this.message);

      // Check if it is jQuery object
      } else if (!!this.message.jquery) {
        $(toast).append(this.message[0]);

      // Insert as html;
      } else {
        toast.innerHTML = this.message;
      }

      // Append toasft
      Toast._container.appendChild(toast);
      return toast;
    }

    /**
     * Animate in toast
     */
    _animateIn() {
      // Animate toast in
      anim({
        targets: this.el,
        top: 0,
        opacity: 1,
        duration: 300,
        easing: 'easeOutCubic'
      });
    }


    /**
     * Create setInterval which automatically removes toast when timeRemaining >= 0
     * has been reached
     */
    _setTimer() {
      if (this.timeRemaining !== Infinity)  {
        this.counterInterval = setInterval(() => {
          // If toast is not being dragged, decrease its time remaining
          if (!this.panning) {
            this.timeRemaining -= 20;
          }

          // Animate toast out
          if (this.timeRemaining <= 0) {
            this.dismiss();
          }
        }, 20);
      }
    }


    /**
     * Dismiss toast with animation
     */
    dismiss() {
      window.clearInterval(this.counterInterval);
      let activationDistance =
          this.el.offsetWidth * this.options.activationPercent;

      if(this.wasSwiped) {
        this.el.style.transition = 'transform .05s, opacity .05s';
        this.el.style.transform = `translateX(${activationDistance}px)`;
        this.el.style.opacity = 0;
      }


      anim({
        targets: this.el,
        opacity: 0,
        marginTop: -40,
        duration: this.options.outDuration,
        easing: 'easeOutExpo',
        complete: () => {
          // Call the optional callback
          if(typeof(this.options.completeCallback) === 'function') {
            this.options.completeCallback();
          }
          // Remove toast from DOM
          this.el.parentNode.removeChild(this.el);
          Toast._toasts.splice(Toast._toasts.indexOf(this), 1);
          if (Toast._toasts.length === 0) {
            Toast._removeContainer();
          }
        }
      });
    }
  }

  /**
   * @static
   * @memberof Toast
   * @type {Array.<Toast>}
   */
  Toast._toasts = [];

  /**
   * @static
   * @memberof Toast
   */
  Toast._container = null;

  /**
   * @static
   * @memberof Toast
   * @type {Toast}
   */
  Toast._draggedToast = null;

  M.Toast = Toast;
  M.toast = function(options) {
    return new Toast(options);
  };
})(cash, M.anime);
(function ($, anim) {
  'use strict';

  let _defaults = {
    exitDelay: 200,
    enterDelay: 0,
    html: null,
    margin: 5,
    inDuration: 250,
    outDuration: 200,
    position: 'bottom',
    transitionMovement: 10
  };


  /**
   * @class
   *
   */
  class Tooltip extends Component {
    /**
     * Construct Tooltip instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Tooltip, el, options);

      this.el.M_Tooltip = this;
      this.options = $.extend({}, Tooltip.defaults, options);

      this.isOpen = false;
      this.isHovered = false;
      this.isFocused = false;
      this._appendTooltipEl();
      this._setupEventHandlers();
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Tooltip;
    }

    /**
     * Teardown component
     */
    destroy() {
      $(this.tooltipEl).remove();
      this._removeEventHandlers();
      this.el.M_Tooltip = undefined;
    }

    _appendTooltipEl() {
      let tooltipEl = document.createElement('div');
      tooltipEl.classList.add('material-tooltip');
      this.tooltipEl = tooltipEl;

      let tooltipContentEl = document.createElement('div');
      tooltipContentEl.classList.add('tooltip-content');
      tooltipContentEl.innerHTML = this.options.html;
      tooltipEl.appendChild(tooltipContentEl);
      document.body.appendChild(tooltipEl);
    }

    _updateTooltipContent() {
      this.tooltipEl.querySelector('.tooltip-content').innerHTML = this.options.html;
    }

    _setupEventHandlers() {
      this._handleMouseEnterBound = this._handleMouseEnter.bind(this);
      this._handleMouseLeaveBound = this._handleMouseLeave.bind(this);
      this._handleFocusBound = this._handleFocus.bind(this);
      this._handleBlurBound = this._handleBlur.bind(this);
      this.el.addEventListener('mouseenter', this._handleMouseEnterBound);
      this.el.addEventListener('mouseleave', this._handleMouseLeaveBound);
      this.el.addEventListener('focus', this._handleFocusBound, true);
      this.el.addEventListener('blur', this._handleBlurBound, true);
    }

    _removeEventHandlers() {
      this.el.removeEventListener('mouseenter', this._handleMouseEnterBound);
      this.el.removeEventListener('mouseleave', this._handleMouseLeaveBound);
      this.el.removeEventListener('focus', this._handleFocusBound, true);
      this.el.removeEventListener('blur', this._handleBlurBound, true);
    }

    open() {
      if (this.isOpen) {
        return;
      }

      this.isOpen = true;
      // Update tooltip content with HTML attribute options
      this.options = $.extend({}, this.options, this._getAttributeOptions());
      this._updateTooltipContent();
      this._setEnterDelayTimeout();
    }

    close() {
      if (!this.isOpen) {
        return;
      }

      this.isOpen = false;
      this._setExitDelayTimeout();
    }

    /**
     * Create timeout which delays when the tooltip closes
     */
    _setExitDelayTimeout() {
      clearTimeout(this._exitDelayTimeout);

      this._exitDelayTimeout = setTimeout(() => {
        if (this.isHovered || this.isFocused) {
          return;
        }

        this._animateOut();
      }, this.options.exitDelay);
    }

    /**
     * Create timeout which delays when the toast closes
     */
    _setEnterDelayTimeout() {
      clearTimeout(this._enterDelayTimeout);

      this._enterDelayTimeout = setTimeout(() => {
        if (!this.isHovered && !this.isFocused) {
          return;
        }

        this._animateIn();
      }, this.options.enterDelay);
    }

    _positionTooltip() {
      let origin = this.el,
        tooltip = this.tooltipEl,
        originHeight = origin.offsetHeight,
        originWidth = origin.offsetWidth,
        tooltipHeight = tooltip.offsetHeight,
        tooltipWidth = tooltip.offsetWidth,
        newCoordinates,
        margin = this.options.margin,
        targetTop,
        targetLeft;

      this.xMovement = 0,
        this.yMovement = 0;

      targetTop = origin.getBoundingClientRect().top + M.getDocumentScrollTop();
      targetLeft = origin.getBoundingClientRect().left + M.getDocumentScrollLeft();

      if (this.options.position === 'top') {
        targetTop += -(tooltipHeight) - margin;
        targetLeft += originWidth / 2 - tooltipWidth / 2;
        this.yMovement = -(this.options.transitionMovement);

      } else if (this.options.position === 'right') {
        targetTop += originHeight / 2 - tooltipHeight / 2;
        targetLeft += originWidth + margin;
        this.xMovement = this.options.transitionMovement;

      } else if (this.options.position === 'left') {
        targetTop += originHeight / 2 - tooltipHeight / 2;
        targetLeft += -(tooltipWidth) - margin;
        this.xMovement = -(this.options.transitionMovement);

      } else {
        targetTop += originHeight + margin;
        targetLeft += originWidth / 2 - tooltipWidth / 2;
        this.yMovement = this.options.transitionMovement;
      }

      newCoordinates = this._repositionWithinScreen(
        targetLeft, targetTop, tooltipWidth, tooltipHeight);
      $(tooltip).css({
        top: newCoordinates.y + 'px',
        left: newCoordinates.x + 'px'
      });
    }

    _repositionWithinScreen(x, y, width, height) {
      let scrollLeft = M.getDocumentScrollLeft();
      let scrollTop = M.getDocumentScrollTop();
      let newX = x - scrollLeft;
      let newY = y - scrollTop;

      let bounding = {
        left: newX,
        top: newY,
        width: width,
        height: height
      };

      let offset = this.options.margin + this.options.transitionMovement;
      let edges = M.checkWithinContainer(document.body, bounding, offset);

      if (edges.left) {
        newX = offset;
      } else if (edges.right) {
        newX -= newX + width - window.innerWidth;
      }

      if (edges.top) {
        newY = offset;
      } else if (edges.bottom) {
        newY -= newY + height - window.innerHeight;
      }

      return {
        x: newX + scrollLeft,
        y: newY + scrollTop
      };
    }

    _animateIn() {
      this._positionTooltip();
      this.tooltipEl.style.visibility = 'visible';
      anim.remove(this.tooltipEl);
      anim({
        targets: this.tooltipEl,
        opacity: 1,
        translateX: this.xMovement,
        translateY: this.yMovement,
        duration: this.options.inDuration,
        easing: 'easeOutCubic'
      });
    }

    _animateOut() {
      anim.remove(this.tooltipEl);
      anim({
        targets: this.tooltipEl,
        opacity: 0,
        translateX: 0,
        translateY: 0,
        duration: this.options.outDuration,
        easing: 'easeOutCubic'
      });
    }

    _handleMouseEnter() {
      this.isHovered = true;
      this.open();
    }

    _handleMouseLeave() {
      this.isHovered = false;
      this.close();
    }

    _handleFocus() {
      this.isFocused = true;
      this.open();
    }

    _handleBlur() {
      this.isFocused = false;
      this.close();
    }

    _getAttributeOptions() {
      let attributeOptions = {};
      let tooltipTextOption = this.el.getAttribute('data-tooltip');
      let positionOption = this.el.getAttribute('data-position');

      if (tooltipTextOption) {
        attributeOptions.html = tooltipTextOption;
      }

      if (positionOption) {
        attributeOptions.position = positionOption;
      }
      return attributeOptions;
    }
  }

  M.Tooltip = Tooltip;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Tooltip, 'tooltip', 'M_Tooltip');
  }

})(cash, M.anime);
/*!
 * Waves v0.6.4
 * http://fian.my.id/Waves
 *
 * Copyright 2014 Alfiana E. Sibuea and other contributors
 * Released under the MIT license
 * https://github.com/fians/Waves/blob/master/LICENSE
 */


;(function(window) {
    'use strict';

    var Waves = Waves || {};
    var $$ = document.querySelectorAll.bind(document);

    // Find exact position of element
    function isWindow(obj) {
        return obj !== null && obj === obj.window;
    }

    function getWindow(elem) {
        return isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
    }

    function offset(elem) {
        var docElem, win,
            box = {top: 0, left: 0},
            doc = elem && elem.ownerDocument;

        docElem = doc.documentElement;

        if (typeof elem.getBoundingClientRect !== typeof undefined) {
            box = elem.getBoundingClientRect();
        }
        win = getWindow(doc);
        return {
            top: box.top + win.pageYOffset - docElem.clientTop,
            left: box.left + win.pageXOffset - docElem.clientLeft
        };
    }

    function convertStyle(obj) {
        var style = '';

        for (var a in obj) {
            if (obj.hasOwnProperty(a)) {
                style += (a + ':' + obj[a] + ';');
            }
        }

        return style;
    }

    var Effect = {

        // Effect delay
        duration: 750,

        show: function(e, element) {

            // Disable right click
            if (e.button === 2) {
                return false;
            }

            var el = element || this;

            // Create ripple
            var ripple = document.createElement('div');
            ripple.className = 'waves-ripple';
            el.appendChild(ripple);

            // Get click coordinate and element witdh
            var pos         = offset(el);
            var relativeY   = (e.pageY - pos.top);
            var relativeX   = (e.pageX - pos.left);
            var scale       = 'scale('+((el.clientWidth / 100) * 10)+')';

            // Support for touch devices
            if ('touches' in e) {
              relativeY   = (e.touches[0].pageY - pos.top);
              relativeX   = (e.touches[0].pageX - pos.left);
            }

            // Attach data to element
            ripple.setAttribute('data-hold', Date.now());
            ripple.setAttribute('data-scale', scale);
            ripple.setAttribute('data-x', relativeX);
            ripple.setAttribute('data-y', relativeY);

            // Set ripple position
            var rippleStyle = {
                'top': relativeY+'px',
                'left': relativeX+'px'
            };

            ripple.className = ripple.className + ' waves-notransition';
            ripple.setAttribute('style', convertStyle(rippleStyle));
            ripple.className = ripple.className.replace('waves-notransition', '');

            // Scale the ripple
            rippleStyle['-webkit-transform'] = scale;
            rippleStyle['-moz-transform'] = scale;
            rippleStyle['-ms-transform'] = scale;
            rippleStyle['-o-transform'] = scale;
            rippleStyle.transform = scale;
            rippleStyle.opacity   = '1';

            rippleStyle['-webkit-transition-duration'] = Effect.duration + 'ms';
            rippleStyle['-moz-transition-duration']    = Effect.duration + 'ms';
            rippleStyle['-o-transition-duration']      = Effect.duration + 'ms';
            rippleStyle['transition-duration']         = Effect.duration + 'ms';

            rippleStyle['-webkit-transition-timing-function'] = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
            rippleStyle['-moz-transition-timing-function']    = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
            rippleStyle['-o-transition-timing-function']      = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
            rippleStyle['transition-timing-function']         = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';

            ripple.setAttribute('style', convertStyle(rippleStyle));
        },

        hide: function(e) {
            TouchHandler.touchup(e);

            var el = this;
            var width = el.clientWidth * 1.4;

            // Get first ripple
            var ripple = null;
            var ripples = el.getElementsByClassName('waves-ripple');
            if (ripples.length > 0) {
                ripple = ripples[ripples.length - 1];
            } else {
                return false;
            }

            var relativeX   = ripple.getAttribute('data-x');
            var relativeY   = ripple.getAttribute('data-y');
            var scale       = ripple.getAttribute('data-scale');

            // Get delay beetween mousedown and mouse leave
            var diff = Date.now() - Number(ripple.getAttribute('data-hold'));
            var delay = 350 - diff;

            if (delay < 0) {
                delay = 0;
            }

            // Fade out ripple after delay
            setTimeout(function() {
                var style = {
                    'top': relativeY+'px',
                    'left': relativeX+'px',
                    'opacity': '0',

                    // Duration
                    '-webkit-transition-duration': Effect.duration + 'ms',
                    '-moz-transition-duration': Effect.duration + 'ms',
                    '-o-transition-duration': Effect.duration + 'ms',
                    'transition-duration': Effect.duration + 'ms',
                    '-webkit-transform': scale,
                    '-moz-transform': scale,
                    '-ms-transform': scale,
                    '-o-transform': scale,
                    'transform': scale,
                };

                ripple.setAttribute('style', convertStyle(style));

                setTimeout(function() {
                    try {
                        el.removeChild(ripple);
                    } catch(e) {
                        return false;
                    }
                }, Effect.duration);
            }, delay);
        },

        // Little hack to make <input> can perform waves effect
        wrapInput: function(elements) {
            for (var a = 0; a < elements.length; a++) {
                var el = elements[a];

                if (el.tagName.toLowerCase() === 'input') {
                    var parent = el.parentNode;

                    // If input already have parent just pass through
                    if (parent.tagName.toLowerCase() === 'i' && parent.className.indexOf('waves-effect') !== -1) {
                        continue;
                    }

                    // Put element class and style to the specified parent
                    var wrapper = document.createElement('i');
                    wrapper.className = el.className + ' waves-input-wrapper';

                    var elementStyle = el.getAttribute('style');

                    if (!elementStyle) {
                        elementStyle = '';
                    }

                    wrapper.setAttribute('style', elementStyle);

                    el.className = 'waves-button-input';
                    el.removeAttribute('style');

                    // Put element as child
                    parent.replaceChild(wrapper, el);
                    wrapper.appendChild(el);
                }
            }
        }
    };


    /**
     * Disable mousedown event for 500ms during and after touch
     */
    var TouchHandler = {
        /* uses an integer rather than bool so there's no issues with
         * needing to clear timeouts if another touch event occurred
         * within the 500ms. Cannot mouseup between touchstart and
         * touchend, nor in the 500ms after touchend. */
        touches: 0,
        allowEvent: function(e) {
            var allow = true;

            if (e.type === 'touchstart') {
                TouchHandler.touches += 1; //push
            } else if (e.type === 'touchend' || e.type === 'touchcancel') {
                setTimeout(function() {
                    if (TouchHandler.touches > 0) {
                        TouchHandler.touches -= 1; //pop after 500ms
                    }
                }, 500);
            } else if (e.type === 'mousedown' && TouchHandler.touches > 0) {
                allow = false;
            }

            return allow;
        },
        touchup: function(e) {
            TouchHandler.allowEvent(e);
        }
    };


    /**
     * Delegated click handler for .waves-effect element.
     * returns null when .waves-effect element not in "click tree"
     */
    function getWavesEffectElement(e) {
        if (TouchHandler.allowEvent(e) === false) {
            return null;
        }

        var element = null;
        var target = e.target || e.srcElement;

        while (target.parentNode !== null) {
            if (!(target instanceof SVGElement) && target.className.indexOf('waves-effect') !== -1) {
                element = target;
                break;
            }
            target = target.parentNode;
        }
        return element;
    }

    /**
     * Bubble the click and show effect if .waves-effect elem was found
     */
    function showEffect(e) {
        var element = getWavesEffectElement(e);

        if (element !== null) {
            Effect.show(e, element);

            if ('ontouchstart' in window) {
                element.addEventListener('touchend', Effect.hide, false);
                element.addEventListener('touchcancel', Effect.hide, false);
            }

            element.addEventListener('mouseup', Effect.hide, false);
            element.addEventListener('mouseleave', Effect.hide, false);
            element.addEventListener('dragend', Effect.hide, false);
        }
    }

    Waves.displayEffect = function(options) {
        options = options || {};

        if ('duration' in options) {
            Effect.duration = options.duration;
        }

        //Wrap input inside <i> tag
        Effect.wrapInput($$('.waves-effect'));

        if ('ontouchstart' in window) {
            document.body.addEventListener('touchstart', showEffect, false);
        }

        document.body.addEventListener('mousedown', showEffect, false);
    };

    /**
     * Attach Waves to an input element (or any element which doesn't
     * bubble mouseup/mousedown events).
     *   Intended to be used with dynamically loaded forms/inputs, or
     * where the user doesn't want a delegated click handler.
     */
    Waves.attach = function(element) {
        //FUTURE: automatically add waves classes and allow users
        // to specify them with an options param? Eg. light/classic/button
        if (element.tagName.toLowerCase() === 'input') {
            Effect.wrapInput([element]);
            element = element.parentNode;
        }

        if ('ontouchstart' in window) {
            element.addEventListener('touchstart', showEffect, false);
        }

        element.addEventListener('mousedown', showEffect, false);
    };

    window.Waves = Waves;

    document.addEventListener('DOMContentLoaded', function() {
        Waves.displayEffect();
    }, false);

})(window);
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//




function setColors() {
    var vehicles = $('.vehicle-container');
    for (var i = 0; i < vehicles.length; i++) {
        if (!addUpNaNString($(vehicles[i]).css('background-color')) || $(vehicles[i]).hasClass('white')){
            $(vehicles[i]).addClass('rainbow-effect');
            $(vehicles[i]).removeClass('lighten-2');
        }
    }
    console.log(addUpNaNString($(vehicles[0]).css('background-color')))
}

function addUpNaNString(st){
    var counter = 0;
    for(var i = 0; i < st.length; i++){
        if (!isNaN(st[i]) && st[i] !== ' '){
            counter += parseInt(st[i]);
        }
    }
    console.log(st)
    return counter;
}

// load stars on review index
function loadRatings() {
    var ratings = $(".review-rating")
    for (var i = 0; i < ratings.length; i++) {
        var rating = $(ratings[i])
        rating.rateYo({
            rating: rating.attr('value'),
            readOnly: true
        });
    }
}

var currentSearch = "make"
$(document).ready(function () {
    // create fixed table headers
    console.log($('.navbar-fixed').css("height"));
    $('table.vehicle-table').floatThead({
        position: 'fixed',
        scrollingTop: $('.navbar-fixed').height(),
        top: $('.navbar-fixed').height(),
        scrollContainer: true,

    });
    // get vehicles based on search condition
    $('body').on('click', '.v-headers > tr > th', function(e){
        var url = window.location.origin + '/vehicles';
        var data = new Object;
        var method = 'GET'
        data.search_string = $(this).html().toLowerCase();
        if (currentSearch == data.search_string){
            data.backwards = "true"
        } else {
            data.backwards = "false"
        }
        currentSearch = data.search_string
        $.ajax({
            url: url,
            data: data,
            method: method
        }).done(function(res){
            $('.v-container').html(res);
        })
    })

    // show review content on click
    $('body').on('click', '.review-item', function(e){
        
    })
    
})
;
