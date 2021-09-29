/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'open-ethereum-pool',
    environment: environment,
    rootURL: '/',
    locationType: 'hash',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // API host and port
      ApiUrl: 'http://ethoclub.dkc.services/',

      // HTTP mining endpoint
      HttpHost: 'http://ethoclub.dkc.services',
      HttpPort: 8889,

      // Stratum mining endpoint
      StratumHost: 'ethoclub.mine2.live',
      StratumPort: 8009,

      // Fee and payout details
      PoolFee: '0.5%',
      PayoutThreshold: '1 ETHO',

      // For network hashrate (change for your favourite fork)
      BlockTime: 13,

      // Coin ticket
      Unit: 'ETHO',

      //Chart config
      highcharts: {
        main: {
          enabled: true,
          height: 300,
          type: 'areaspline',
          color: '#c3376c',
          title: '',
          ytitle: '',
          interval: 180000,
          chartInterval: 900000
        },
        account: {
          enabled: true,
          height: 300,
          type: 'spline',
          color: [ '', '' ],
          title: '',
          ytitle: '',
          interval: 180000,
          chartInterval: 900000,
          paymentInterval: 30000
        }
      }
    }
  };

  if (environment === 'development') {
    /* Override ApiUrl just for development, while you are customizing
      frontend markup and css theme on your workstation.
    */
    ENV.APP.ApiUrl = 'http://localhost:8090/'
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  return ENV;
};
