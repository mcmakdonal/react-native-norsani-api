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

Norsani.get('vendors', 'norsani', {
  })
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.log(error)
  });
