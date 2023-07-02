"use strict";
var _tokenCaptcha = '';
var _recaptchaLoaded = false;
/**
 * Script loader
 * @param {string} href         // This is the url of library
 * @param {function} callback   // callback doesn't return any data
 */
function _getScript(href,callback){
	callback = callback || "";
	var script=document.createElement('script');
	script.src=href;
	var head=document.getElementsByTagName('head')[0],done=false;
	script.onload=script.onreadystatechange = function(){
		if ( !done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') ) {
			done=true;
			if (typeof callback === "function") callback();
			script.onload = script.onreadystatechange = null;
            head.removeChild(script);
		}
	};
	head.appendChild(script);
}

/**
 * Load reCaptcha API Library
 * @param {string} siteKey      // This is your recaptcha site key
 * @param {function} _cb        // callback doesn't return any data
 */
function _loadCaptcha(siteKey, _cb) {
    if(_recaptchaLoaded === false) {
        // Get reCaptcha API v3
        _getScript('https://www.google.com/recaptcha/api.js?render='+siteKey, function() {
            _recaptchaLoaded = true;  
            if(_cb && typeof _cb === "function") {
                _cb();   
            }
        });
    }
}

/**
 * Get Token reCaptcha
 * @param {string} action       // This is your action name
 * @param {string} siteKey      // This is your recaptcha site key
 * @param {function} _cb        // callback will return (error, response)
 */
function _getTokenCaptcha(action, siteKey, _cb) {
    grecaptcha.ready(function() {
        try {
            grecaptcha.execute(siteKey, {action: action}).then(function(token) {
                _tokenCaptcha = token
                if(_cb && typeof _cb === "function") {
                    _cb(null, token);
                }
            })
        } catch (e) {
            _cb(e, null);
        }
    });
}

/**
 * Refresh Captcha Token
 * @param {string} action       // This is your action name
 * @param {string} siteKey      // This is your recaptcha site key
 * @param {function} _cb        // callback will return (error, response)
 */
function refreshCaptcha(action, siteKey, _cb) {
    if(_recaptchaLoaded) {
        _getTokenCaptcha(action, siteKey, _cb);
    } else {
        _loadCaptcha(siteKey, function() {
            _getTokenCaptcha(action, siteKey, _cb);
        });
    }
}

/**
 * Verify Captcha
 * @param {string} baseUrl      // This is your base url
 * @param {function} _cb        // callback will return (error, response)
 */
function verifyCaptcha(baseUrl, _cb) {
    _ajax({
        method: 'post',
        url: baseUrl+'/verify/recaptcha',
        headers: {'content-type': 'application/json'},
        data: {
          token: _tokenCaptcha
        }
      }, function(err, response) {
        if (err) {
            if(_cb && typeof _cb === "function") {
              _cb(response.error);
            }
            return;
        }
        if(_cb && typeof _cb === "function") {
          _cb(null, response);
        }
      });
}

/**
 * Hide Google reCaptcha Badge
 */
function hideBadge() {
    var css = document.createElement('link');
    var head = window.document.getElementsByTagName('head')[0];
    css.setAttribute('rel', 'stylesheet');
    css.setAttribute('type', 'text/css');
    css.setAttribute('href', 'data:text/css;charset=UTF-8,' + encodeURIComponent('.grecaptcha-badge{visibility:hidden;}'));
    head.appendChild(css);
}
