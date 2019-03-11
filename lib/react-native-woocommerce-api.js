'use strict';

import OAuth from "oauth-1.0a";
import CryptoJS from 'crypto-js';

module.exports = NorsaniAPI;

/**
 * Norsani and WooCommerce REST API wrapper
 *
 * @param {Object} opt
 */
function NorsaniAPI(opt) {
  if (!(this instanceof NorsaniAPI)) {
    return new NorsaniAPI(opt);
  }

  opt = opt || {};

  if (!(opt.url)) {
    throw new Error('url is required');
  }

  if (!(opt.consumerKey)) {
    throw new Error('consumerKey is required');
  }

  if (!(opt.consumerSecret)) {
    throw new Error('consumerSecret is required');
  }

  this.classVersion = '1.0.0';
  this._setDefaultsOptions(opt);
}

/**
 * Set default options
 *
 * @param {Object} opt
 */
NorsaniAPI.prototype._setDefaultsOptions = function (opt) {
  this.url = opt.url;
  this.wpAPI = opt.wpAPI || false;
  this.wpAPIPrefix = opt.wpAPIPrefix || 'wp-json';
  this.NorsaniVersion = opt.NorsaniVersion || 'v1';
  this.WCVersion = opt.WCVersion || 'v3';
  this.isSsl = opt.isSsl === false ? false : /^https/i.test(this.url);
  this.consumerKey = opt.consumerKey;
  this.consumerSecret = opt.consumerSecret;
  this.verifySsl = false === opt.verifySsl ? false : true;
  this.encoding = opt.encoding || 'utf8';
  this.queryStringAuth = opt.queryStringAuth || false;
  this.port = opt.port || '';
  this.timeout = opt.timeout;
};

/**
 * Normalize query string for oAuth
 *
 * @param  {string} url
 * @return {string}
 */
NorsaniAPI.prototype._normalizeQueryString = function (url) {
  // Exit if don't find query string
  if (-1 === url.indexOf('?')) {
    return url;
  }

  // var query       = _url.parse(url, true).query;
  var query = url;
  var params = [];
  var queryString = '';

  for (var p in query) {
    params.push(p);
  }
  params.sort();

  for (var i in params) {
    if (queryString.length) {
      queryString += '&';
    }

    queryString += encodeURIComponent(params[i]).replace('%5B', '[').replace('%5D', ']');
    queryString += '=';
    queryString += encodeURIComponent(query[params[i]]);
  }

  return url.split('?')[0] + '?' + queryString;
};

/**
 * Get URL
 *
 * @param  {String} endpoint
 * @param  {String} requestapi values could be either wc, norsani, wp
 *
 * @return {String}
 */
NorsaniAPI.prototype._getUrl = function (endpoint, requestapi) {
  var url = '/' === this.url.slice(-1) ? this.url : this.url + '/';
  var api = null;
  
  switch(requestapi) {
    case 'wp':
      api = '/wp/v2';
    case 'wc':
      api = 'wc/'+this.WCVersion;
    default:
      api = 'norsani/'+this.NorsaniVersion;
  }
  
  var apiprefix = this.wpAPIPrefix + '/';

  url = url + apiprefix + api + '/' + endpoint;

  // Include port.
  if ('' !== this.port) {
    var hostname = url; //_url.parse(url, true).hostname;
    url = url.replace(hostname, hostname + ':' + this.port);
  }

  if (!this.isSsl) {
    return this._normalizeQueryString(url);
  }

  return url;
};

/**
 * Get OAuth
 *
 * @return {Object}
 */
NorsaniAPI.prototype._getOAuth = function () {
  var data = {
    consumer: {
      key: this.consumerKey,
      secret: this.consumerSecret
    },
    signature_method: 'HMAC-SHA256',
    hash_function: function(base_string, key) {
      return CryptoJS.HmacSHA256(base_string, key).toString(CryptoJS.enc.Base64);
    }
  };

  if (-1 < ['v1', 'v2'].indexOf(this.WCVersion)) {
    data.last_ampersand = false;
  }
  return new OAuth(data);
};

/**
 * Join key object value to string by separator
 */
NorsaniAPI.prototype.join = function (obj, separator) {
  var arr = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      arr.push(key + '=' + obj[key]);
    }
  }
  ;
  return arr.join(separator);
}

/**
 * Do requests
 *
 * @param  {String}   method
 * @param  {String}   endpoint
 * @param  {String}   requestapi
 * @param  {Object}   data
 * @param  {Function} callback
 *
 * @return {Object}
 */
NorsaniAPI.prototype._request = function (method, endpoint, requestapi, data, callback) {
  var url = this._getUrl(endpoint,requestapi);

  var params = {
    url: url,
    method: method,
    encoding: this.encoding,
    timeout: this.timeout,
    headers: {
      'User-Agent': 'WooCommerce API React Native/' + this.classVersion,
      'Content-Type': 'application/json'
    }
  };

  if (this.isSsl) {
    if (this.queryStringAuth) {
      params.qs = {
        consumer_key: this.consumerKey,
        consumer_secret: this.consumerSecret
      };
    } else {
      params.auth = {
        user: this.consumerKey,
        pass: this.consumerSecret
      };
    }

    if (!this.verifySsl) {
      params.strictSSL = false;
    }
  }
  else {
    params.qs = this._getOAuth().authorize({
      url: url,
      method: method
    });
  }

  // encode the oauth_signature to make sure it not remove + charactor
  //params.qs.oauth_signature = encodeURIComponent(params.qs.oauth_signature);
  var requestUrl = params.url + '?' + this.join(params.qs, '&');
  // console.log(data)
  // extra data info for paging
  if(method == 'GET') {
      if (data) {
    requestUrl += '&' + this.join(data, '&');
    }

  // console.log('encode', params.qs.oauth_signature);
  //console.log(requestUrl);

  return fetch(requestUrl,
    {
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
    .then((response) => {
      return response.json()
    })
    .then((responseData) => {
      if (typeof callback == 'function') {
        callback();
      }
      return responseData
    })
    .catch((error, data) => {
        // console.log('error network -', error, data);
      }
    );
  } else {
      return fetch(requestUrl,
    {
      method: method,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then((response) => {
      return response.json()
    })
    .then((responseData) => {
      if (typeof callback == 'function') {
        callback();
      }
      return responseData
    })
    .catch((error, data) => {
        // console.log('error network -', error, data);
      }
    );
  }

  }

/**
 * GET requests
 *
 * @param  {String}   endpoint
 * @param  {String}   requestapi
 * @param  {String}   data
 * @param  {Function} callback
 *
 * @return {Object}
 */
NorsaniAPI.prototype.get = function (endpoint, requestapi, data, callback) {
  return this._request('GET', endpoint, requestapi, data, callback);
};

/**
 * POST requests
 *
 * @param  {String}   endpoint
 * @param  {String}   requestapi
 * @param  {Object}   data
 * @param  {Function} callback
 *
 * @return {Object}
 */
NorsaniAPI.prototype.post = function (endpoint, requestapi, data, callback) {
  return this._request('POST', endpoint, requestapi, data, callback);
};

/**
 * PUT requests
 *
 * @param  {String}   endpoint
 * @param  {String}   requestapi
 * @param  {Object}   data
 * @param  {Function} callback
 *
 * @return {Object}
 */
NorsaniAPI.prototype.put = function (endpoint, requestapi, data, callback) {
  return this._request('PUT', endpoint, requestapi, data, callback);
};

/**
 * DELETE requests
 *
 * @param  {String}   endpoint
 * @param  {String}   requestapi
 * @param  {Function} callback
 *
 * @return {Object}
 */
NorsaniAPI.prototype.delete = function (endpoint, requestapi, callback) {
  return this._request('DELETE', endpoint, requestapi, null, callback);
};

/**
 * OPTIONS requests
 *
 * @param  {String}   endpoint
 * @param  {String}   requestapi
 * @param  {Function} callback
 *
 * @return {Object}
 */
NorsaniAPI.prototype.options = function (endpoint, requestapi, callback) {
  return this._request('OPTIONS', endpoint, requestapi, null, callback);
};
