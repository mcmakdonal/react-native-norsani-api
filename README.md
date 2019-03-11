![GitHub package.json version](https://img.shields.io/github/package-json/v/MahmudHamid/react-native-norsani-api.svg)
# react-native-norsani-api
A wrappper that connects react Native to the Norsani and WooCommerce APIs. This package comes built-in with the Norsani React Native App, so if you are using it you should only consider editing the APIConfig.js file to start connecting to your Norsani Website.

## Installation

To install the module using yarn:

```
yarn add react-native-norsani-api
```

To install the module using NPM:

```
npm install react-native-norsani-api --save
```

## Setup

Using this package to connect to your Norsani and WooCommerce APIs website will require WooCommerce API keys (a consumer key and consumer secret). You can find instructions [here](https://docs.woocommerce.com/document/woocommerce-rest-api/)

Include the 'react-native-norsani-api' module within your script and instantiate it with a config:

```javascript
import NorsaniAPI from 'react-native-norsani-api';

const Norsani = new NorsaniAPI({
  url: 'https://yourstore.com', // Your Norsani Website URL
  isSsl: true,
  verifySsl: true,
  consumerKey: 'ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Your WooCommerce consumer secret
  consumerSecret: 'cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Your WooCommerce consumer secret
  wpAPI: true, // Enable the WP REST API integration
  NorsaniVersion: 'v1', // Norsani REST API version
  WCVersion: 'v3', // WooCommerce REST API version
  queryStringAuth: true
});
```

**Instantiating a NorsaniAPI instance without a url, consumerKey or secret will result in an error being thrown**

## Usage

### GET

```javascript
Norsani.get('vendors', 'norsani',{
  })
  .then(data => {
    // data will contain the body content from the request
  })
  .catch(error => {
    // error will return any errors that occur
  });
```

### POST

For this example you have a [Order object](http://woocommerce.github.io/woocommerce-rest-api-docs/#create-an-order).

```javascript
Norsani.post('orders', 'wc', orderObject, {
  })
  .then(data => {
    // data will contain the body content from the request
  })
  .catch(error => {
    // error will return any errors that occur
  });
```

### PUT

```javascript

 Norsani.put('/orders/1', 'wc', orderUpdate, {
  })
  .then(data => {
    // data will contain the body content from the request
  })
  .catch(error => {
    // error will return any errors that occur
  });
```

### DELETE

```javascript
Norsani.delete('orders/1234', 'wc', {
  })
  .then(data => {
    // data will contain the body content from the request
  })
  .catch(error => {
    // error will return any errors that occur
  });
```

## Testing

```
npm test
```
