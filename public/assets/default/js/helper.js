"use strict";

/**
 * Defer JS (support callback)
 * @param {string} href 
 * @param {callback} callback 
 */
 function getScript(href,callback){
	callback = callback || "";
	var script=document.createElement('script');
	script.src=href;
	var head=document.getElementsByTagName('head')[0],done=false;
	script.onload=script.onreadystatechange = function(){
		if ( !done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') ) {
			done=true;
			if (typeof callback == "function") callback();
			script.onload = script.onreadystatechange = null;
			head.removeChild(script);
		}
	};
	head.appendChild(script);
}

/**
 * Defer CSS (support callback)
 * @param {string} href 
 * @param {callback} callback 
 */
function getCss(href,callback){
	callback = callback || "";
	var link=document.createElement('link');
	link.rel= "stylesheet";
	link.href=href;
	var head=document.getElementsByTagName('head')[0],done=false;
	link.onload=link.onreadystatechange = function(){
		if ( !done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') ) {
			done=true;
			if (typeof callback == "function") callback();
			link.onload = link.onreadystatechange = null;
		}
	};
	head.appendChild(link);
}

/**
 * Parse JWT
 * @param {string} token 
 * @return {object}
 */
function parseJWT (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
};

/**
 * Decode parsed HTML
 * @param {string} input 
 * @return {string}
 */
function htmlDecode(input) {
  var doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
}

/**
 * Determine text is contain spesific word
 * @param {string} text 
 * @param {string} source 
 * @return {bool}
 */
function isContain(text, source) {
  return source.indexOf(text) !== -1;
}

/**
 * Get url query parameter
 * @param {string} url 
 * @returns 
 */
function getUrlParam (url) {
  if (url) {
    var query = url.split('?');
    if (query[1]) {
      var data = {};
      var queries = query[1].split('&');
      for (var i = 0; i < queries.length; i++) {
        var item = queries[i].split('=');
        data[item[0]] = decodeURIComponent(item[1]);
      }
      return data;
    }
  }
  return '';
}

/**
 * Axios callback wrapper
 * @param {object} options 
 * @param {callback} _cb 
 */
function _ajax (options, _cb) {
  axios(options)
    .then(function (response) {
      if (_cb && typeof _cb === 'function') {
        _cb(null, response.data);
      }
    })
    .catch(function (error) {
      if (_cb && typeof _cb === 'function') {
        _cb(error.message, null);
      }
    })
}

/**
 * Inject alert message html bootstrap 5
 * @param {string} el       This is document element id 
 * @param {sring} type      This is the type alert success, danger, warning, info, primary, etc. 
 * @param {string} msg      text or html about the message 
 */
function sendAlert (el, type, msg) {
  document.getElementById(el).innerHTML = '<div class="alert alert-' + type + ' alert-dismissible fade show text-white" role="alert">' + msg + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
}

/**
 * Simple formating number
 * @param {float|integer} value     Number to be converted
 * @param {integer} dec             Decimal places, default is 0
 * @return {string}
 */
function formatNumber(value, dec) {
  dec = (dec === undefined ? 0 : dec);
  return new Intl.NumberFormat().format(value.toFixed(dec));
}

/**
 * Simple delay event
 * @param {callback} fn       Function to be executed after the delay finished
 * @param {integer} ms        Number of delay in micro seconds
 */
function delay (fn, ms) {
  var timer = 0;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(fn.bind(this, ...args), ms || 0);
  }
}

/**
 * Invalid form effect
 * @param {string} el       This is the document element id 
 * @param {bool} bool       This is the boolean invalid status
 * @param {string} msg      Text or html value about message
 */
function setInvalid (el, bool, msg) {
  if (bool) {
    document.getElementById(el).classList.add('is-invalid');
    document.getElementById(el + '-error').innerHTML = msg;
    document.getElementById(el + '-error').style.visibility = 'visible';
  } else {
    document.getElementById(el).classList.remove('is-invalid');
    document.getElementById(el + '-error').innerHTML = '';
    document.getElementById(el + '-error').style.visibility = 'hidden';
  }
}

/**
 * Check session
 * @param {callback} _cb 
 * @return {callback}
 */
function checkSession (_cb) {
  try {
    if (storage.has(fastify_prefix + 'data')) {
      fastify_data = storage.get(fastify_prefix + 'data');
      if (new Date().getTime() > fastify_data.expire) {
        storage.remove(fastify_prefix + 'data');
        if (_cb && typeof _cb === 'function') {
          _cb('Session expired!!!', null);
          return false;
        }
      }
      if (_cb && typeof _cb === 'function') {
        _cb(null, true);
      }
      return true;
    } else {
      if (_cb && typeof _cb === 'function') {
        _cb('Session not available!!!', null);
      }
    }
  } catch (err) {
    if (_cb && typeof _cb === 'function') {
      _cb(err, null);
    }
  }
  return false;
}

/**
 * Get Token
 * @return {string}
 */
function getToken () {
  var key = fastify_prefix + 'data';
  if (storage.has(key)) {
    return storage.get(key).token;
  }
  return false;
}

/**
 * Clear Token
 */
function clearToken() {
  var key = fastify_prefix + 'data';
  storage.remove(key);
}

/**
 * Logout
 */
function logout () {
  clearToken();
  var key = fastify_prefix + 'data';
  if (!storage.has(key)) {
    location.href = './sign-in';
  }
}

/**
 * Populate array or object to select option element
 * @param {string} el
 * @param {object|array} data
 * @param {string} valKey     [Optional] If the data is object, then you have to specify the key name of the object to fill the value for select option
 * @param {string} textKey    [Optional] If the data is object, then you have to specify the key name of the object to fill the text for select option
 */
function populateSelect(el, data, valKey, textKey) {
  const sel = document.getElementById(el);
  valKey = ( valKey === undefined ? false : valKey);
  for (let i = 0; i < data.length; i++) {
    const option = document.createElement("option");
    if(valKey) {
      option.value = data[i][valKey];
      option.text = data[i][textKey];
    } else {
      option.value = data[i];
      option.text = data[i];
    }
    sel.add(option);
  }
}

/**
 * Set Selected Option
 * @param {string} el       This is the document element id
 * @param {string} type     You can set select option by 'text' or 'value'
 * @param {string} value    Select option wil be changed following this value 
 */
function setSelectedOption(el, type, value) {
  const sel = document.getElementById(el);
  switch(type) {
    case 'text': 
      const $options = Array.from(sel.options);
      const optionToSelect = $options.find(item => item.innerText === value);
      if(optionToSelect) optionToSelect.selected = true;
      break;
    case 'value':
      sel.value = value;
      break;
  }
}

/**
 * Get Selected Option
 * @param {string} el       This is the document element id
 * @return {object}
 */
function getSelectedOption(el) {  
  let opt;
  const sel = document.getElementById(el);
  for (let i= 0, len= sel.options.length; i<len; i++) {  
    opt = sel.options[i];
    if (opt.selected === true) {
      break;
    }
  }
  return opt;
}

/**
 * Confirmation wrapper SweetAlert 2
 * @param {string} title 
 * @param {string} msg 
 * @param {callback} _cb 
 */
function confirmation(title, msg, _cb) {
  swal({
    title: title,
    text: msg,
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
  .then((confirm) => {
    if (confirm) {
      if (_cb && typeof _cb === 'function') {
        _cb();
      }
    }
  });
}

// URL Query
var urlQuery = getUrlParam(window.location.href);

// Storage
var storage = new BrowserStorageClass(window.localStorage);

// Global Variable
var fastify_prefix = 'fastify_';
var fastify_data = null;
