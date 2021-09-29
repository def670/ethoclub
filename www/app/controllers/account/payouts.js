import Ember from 'ember';

export default Ember.Controller.extend({
  applicationController: Ember.inject.controller('application'),
  config: Ember.computed.reads('applicationController.config'),
  stats: Ember.computed.reads('applicationController.model.stats'),
  intl: Ember.inject.service(),
  chartPaymentText: Ember.computed('model', {
   get() {
     var outText = this.get('model.paymentCharts');
     if (!outText) {
       return 0;
      }
      return outText;
    }
  }),
   chartPayment: Ember.computed('intl', 'model.paymentCharts', {
     get() {
         var e = this,
             t = e.getWithDefault("model.paymentCharts"),
             a = {
                 chart: {
                     backgroundColor: "rgba(255, 255, 255, 0.1)",
                     type: "column",
                     marginRight: 10,
                     height: 300,
                     events: {
                         load: function() {
                             var self = this;
                             setInterval(function() {
                                 if (!self.series) {
                                     return; //FIXME
                                 }
                                 t = e.getWithDefault("model.paymentCharts");
                                 var data = [];
                                 t.forEach(function(d) {
                                     var r = new Date(1000 * d.x);
                                     var l = r.toLocaleString();
                                     var n = e.amount / 1000000000;
                                     data.push({x: r, d: l, y: n});
                                 });
                                 self.series[0].setData(data, true, {}, true);
                             }, e.get('config.highcharts.account.paymentInterval') || 120000);
                         }
                     }
                   },
                 title: {
                     text: ""
                 },
                 xAxis: {
                     ordinal: false,
                     type: "datetime",
                     dateTimeLabelFormats: {
                         day: "%e. %b",
                         week: "%e. %b",
                         month: "%b '%y",
                         year: "%Y"
                     }
                 },
                 yAxis: {
                     title: {
                         text: "Payment by Account"
                     }
                 },
                 plotLines: [{
                     value: 0,
                     width: 1,
                     color: "#808080"
                 }],
                 legend: {
                     enabled: true
                 },
                 tooltip: {
                     formatter: function() {
                         return "<b>" + Highcharts.dateFormat('%Y-%m-%d', new Date(this.x)) + "<b><br>Payment&nbsp;<b>" + this.y.toFixed(4) + "&nbsp;" + e.get('config.Unit') + "</b>";
                     },
                     useHTML: true
                 },
                 exporting: {
                     enabled: false
                 },
                 series: [{
                     color: "#c3376c",
                     name: "Payments",
                     type: 'areaspline',
                     threshold: null,
                     tooltip: {
                       valueDecimals: 2
                     },
                     fillColor: {
                       linearGradient: {
                         x1: 0,
                         y1: 0,
                         x2: 0,
                         y2: 1
                       },
                       stops: [
                         [0, Highcharts.getOptions().colors[0]],
                         [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(50).get('rgba')]
                       ]
                     },
                     data: function() {
                         var e, a = [];
                         if (null != t) {
                             for (e = 0; e <= t.length - 1; e += 1) {
                                 var n = 0,
                                     r = 0,
                                     l = 0;
                                     r = new Date(1e3 * t[e].x);
                                     l = r.toLocaleString();
                                     n = t[e].amount / 1000000000;
                                     a.push({
                                       x: r,
                                       d: l,
                                       y: n
                                     });
                                }
                             } else { a.push({
                               x: 0,
                               d: 0,
                               y: 0
                              });
                            }
                         return a;
                     }()
                 }]
             };
         return a;
     }
})
});
