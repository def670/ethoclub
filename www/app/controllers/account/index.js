import Ember from 'ember';

export default Ember.Controller.extend({
  applicationController: Ember.inject.controller('application'),
  stat: Ember.computed.reads('applicationController'),
  config: Ember.computed.reads('applicationController.config'),
  netstats: Ember.computed.reads('applicationController'),
  stats: Ember.computed.reads('applicationController.model.stats'),
  chartOptions: Ember.computed("model.hashrate", {
        get() {
            var e = this,
                t = e.getWithDefault("model.minerCharts"),
                a = {
                    chart: {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        type: "column",
                        marginRight: 10,
                        height: 300,
                        events: {
                            load: function() {
                                var series = this.series[0];
                                setInterval(function() {
                                    var x = (new Date()).getTime(),
                                        y = e.getWithDefault("model.currentHashrate") / 1000000;
                                    series.addPoint([x, y], true, true);
                                }, 1090000000);
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
                            millisecond: "%H:%M:%S",
                            second: "%H:%M:%S",
                            minute: "%H:%M",
                            hour: "%H:%M",
                            day: "%e. %b",
                            week: "%e. %b",
                            month: "%b '%y",
                            year: "%Y"
                        }
                    },
                    yAxis: {
                        title: {
                            text: "HASHRATE"
                        },
                        //min: 0,
                        softMin: e.getWithDefault("model.currentHashrate") / 1.1,
                        softMax: e.getWithDefault("model.currentHashrate") * 1.2
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: "#ffffff"
                    }],
                    legend: {
                        enabled: true
                    },
                    tooltip: {
                        formatter: function() {
                            return this.y > 1000000000000 ? "<b>" + this.point.d + "<b><br>Hashrate&nbsp;" + (this.y / 1000000000000).toFixed(2) + "&nbsp;TH/s</b>" : this.y > 1000000000 ? "<b>" + this.point.d + "<b><br>Hashrate&nbsp;" + (this.y / 1000000000).toFixed(2) + "&nbsp;GH/s</b>" : this.y > 1000000 ? "<b>" + this.point.d + "<b><br>Hashrate&nbsp;" + (this.y / 1000000).toFixed(2) + "&nbsp;MH/s</b>" : "<b>" + this.point.d + "<b><br>Hashrate&nbsp;<b>" + this.y.toFixed(2) + "&nbsp;H/s</b>";
                        },
                        useHTML: true
                    },
                    exporting: {
                        enabled: false
                    },
                    navigation: {
                      enabled: true,
                    },
                    /*scrollbar: {
                      barBackgroundColor: 'gray',
                      barBorderRadius: 7,
                      barBorderWidth: 0,
                      buttonBackgroundColor: 'gray',
                      buttonBorderWidth: 0,
                      buttonBorderRadius: 7,
                      trackBackgroundColor: 'none',
                      trackBorderWidth: 1,
                      trackBorderRadius: 8,
                      trackBorderColor: '#CCC'
                    },*/
                    series: [{
                        color: "#c3376c",
                        name: "6 hours average hashrate",
                        type: 'spline',
                        tooltip: {
                          valueDecimals: 2
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
                                    n = t[e].minerLargeHash;
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
                        }, {
                        name: "Current hashrate",
                        type: 'spline',
                        tooltip: {
                          valueDecimals: 2
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
                                    n = t[e].minerHash;
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
              a.title.text = this.get('config.highcharts.account.title') || "";
              a.yAxis.title.text = this.get('config.highcharts.account.ytitle') || "Hashrate";
              a.chart.height = this.get('config.highcharts.account.height') || 300;
              a.chart.type = this.get('config.highcharts.account.type') || 'spline';
              var colors = this.get('config.highcharts.account.color');
              a.series[0].color = colors[0] || '#c3376c';
              a.series[1].color = colors[1] || '#1994b8';
            return a;
        }
    })
});
