$(function() {
	"use strict";
	if (Modernizr.svg) {

		var margin = {top: 20, right: 20, bottom: 20, left: 10};
		var config = {
			width: $("div#hospitals").width() - margin.left - margin.right,
	    lightred: '#F8E0E0',
	    lightgreen: '#CEF6CE',
	    grey: '#A4A4A4'
		};
		var ga_avg = {
			clabsi   : 0.79,
			cauti    : 0.80,
			ssicolon : 0.90
		};

		//  pulls text for tooltip on link id x-link from  div id x-text
		$(document).tooltip({
			items: '.moreinfo',
			content: function() {
				var re = /(.+)-link/;
				var idPrefix = $(this).attr('id').match(re)[1];
				return $('#' + idPrefix + '-text').html();
			},
			hide: 2000
		});

		///////////////////////////////////////////////////////////////////
		// detail legend
		var legendSvg = d3.select('#legend')
			.append('svg')
				.attr('width', config.width)
				.attr('height', 50)
			.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

		var legend = legendSvg.append('g');

		legend.append('rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', config.width)
			.attr('height', 50)
			.attr('fill', '#F0F0F0');

		legend.append('text').text('Expected cases and margin of error:')
			.attr('x', 0)
			.attr('y', 20);
		legend.append('rect')
			.attr('x', 218)
			.attr('y', 0)
			.attr('width', 40)
			.attr('height', 20)
			.attr('fill', config.lightgreen);
		legend.append('line')
			.attr('x1', 238)
			.attr('y1', 0)
			.attr('x2', 238)
			.attr('y2', 20)
			.attr('stroke', config.grey)
			.attr('stroke-width', 5);

		legend.append('text').text('Actual cases:')
				.attr('x', 270)
				.attr('y', 20);
		legend.append('line')
			.attr('x1', 360)
			.attr('y1', 0)
			.attr('x2', 360)
			.attr('y2', 20)
			.attr('stroke', 'black')
			.attr('stroke-width', 5);

		///////////////////////////////////////////////////////////////////
		// read data and draw graphics
		var statements, sourceText;

		d3.csv("data/statements.csv", function(data) {
			statements = data;
			d3.csv("data/infections.csv", function(data) {
				sourceText = data;
				d3.csv("data/detail.csv", function(data) {
					data = _.sortBy(data, function(d){ return -1 * (d.clabsi_ratio - d.clabsi_na); });
					drawDotChart(data);
					detail(data);
				});
			});
		});

		///////////////////////////////////////////////////////////////////
		// Draw dot chart
		function drawDotChart(dataset) {
			var height = (20 * dataset.length) - margin.top - margin.bottom,
			left_pad = 235;
			var max = Math.max(
				Math.ceil(d3.max(dataset, function(d) {return parseFloat(d.clabsi_ratio);})),
				Math.ceil(d3.max(dataset, function(d) {return parseFloat(d.cauti_ratio);})),
				Math.ceil(d3.max(dataset, function(d) {return parseFloat(d.ssicolon_ratio);}))
			);
			var xScale = d3.scale.linear()
				.domain([0,Math.ceil(max)])
				.range([left_pad, config.width]),

				yScale = d3.scale.ordinal()
					.domain(d3.range(dataset.length))
					.rangeRoundBands([0,height], 0.2);

			var svg = d3.select('#hospitals')
				.append('svg')
					.attr('width', config.width + margin.left + margin.right)
					.attr('height', height + margin.top + margin.bottom)
				.append('g')
					.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

			// Horizontal grib bars
			svg.selectAll('rect')
				.data(dataset)
				.enter().append('rect')
				.attr('x', left_pad - 5)
				.attr('y', function(d,i){
						return yScale(i);
					})
				.attr('fill', config.lightgreen)
				.attr('width', xScale(1) - left_pad + 3)
				.attr('height', yScale.rangeBand());

			var hgrid_red = svg.selectAll('g')
				.data(dataset)
				.enter().append('g');
			hgrid_red.append('svg:rect')
				.attr('x', xScale(1) + 2)
				.attr('y', function(d,i){
						return yScale(i);
					})
				.attr('fill', config.lightred)
				.attr('width', xScale(5) - xScale(1))
				.attr('height', yScale.rangeBand());

			// CLABSI circles
			svg.selectAll('.clabsi')
				.data(dataset)
				.enter().append('circle')
					.attr('class', 'clabsi')
					.attr('cx', function(d){ return xScale(d.clabsi_ratio); })
					.attr('cy', function(d,i){ return yScale(i) + (yScale.rangeBand() / 2); })
					.attr('r',  function(d) { return d.clabsi_na === "1" ? 0 : 4; })
					.attr('fill','black')
					.attr('opacity', 1)
				.on('mouseover', function(d) {
					var x = parseFloat(d3.event.clientX),
							y = parseFloat(d3.event.clientY);

					var tt = d3.select('#tooltip')
						.style('left', x + 'px')
						.style('top', y + 'px');

					tt.select('#score').text('ratio: ' + d.clabsi_ratio);
					tt.select('#predicted').text('predicted cases: ' + d.clabsi_predicted);
					tt.select('#actual').text('actual cases: ' + d.clabsi_observed);
					d3.select('#tooltip').classed('hidden', false);
				})
				.on('mouseout', function(){
					d3.select('#tooltip').classed('hidden', true);
				});


			// CAUTI symbols
			svg.selectAll('.cauti')
				.data(dataset)
				.enter()
				.append('circle')
					.attr('class', 'cauti')
					.attr('cx', function(d){ return xScale(d.cauti_ratio); })
					.attr('cy', function(d,i){ return yScale(i) + (yScale.rangeBand() / 2); })
					.attr('r',  function(d) { return d.cauti_na === "1" ? 0 : 4; })
					.attr('fill','black')
					.attr('opacity', 0)
				.on('mouseover', function(d) {
					var x = parseFloat(d3.event.clientX),
							y = parseFloat(d3.event.clientY);
					x = x > 1000 ? x/100 : x; // why are x's near border 100x larger?

					var tt = d3.select('#tooltip')
						.style('left', x + 'px')
						.style('top', y + 'px');

					tt.select('#score').text('ratio: ' + d.cauti_ratio);
					tt.select('#predicted').text('predicted cases: ' + d.cauti_predicted);
					tt.select('#actual').text('actual cases: ' + d.cauti_observed);
					d3.select('#tooltip').classed('hidden', false);
				})
				.on('mouseout', function(){
					d3.select('#tooltip').classed('hidden', true);
				});

			// SSI:Colon symbols
			svg.selectAll('.ssicol')
				.data(dataset)
				.enter()
					.append('circle')
					.attr('class', 'ssicol')
					.attr('cx', function(d){ return xScale(d.ssicolon_ratio); })
					.attr('cy', function(d,i){ return yScale(i) + (yScale.rangeBand() / 2); })
					.attr('r',  function(d) { return d.ssicolon_na === "1" ? 0 : 4; })
					.attr('fill','black')
					.attr('opacity', 0)
				.on('mouseover', function(d) {
					var x = parseFloat(d3.event.clientX),
							y = parseFloat(d3.event.clientY);
					x = x > 1000 ? x/100 : x; // why are x's near border 100x larger?

					var tt = d3.select('#tooltip')
						.style('left', x + 'px')
						.style('top', y + 'px');

					tt.select('#score').text('ratio: ' + d.ssicolon_ratio);
					tt.select('#predicted').text('predicted cases: ' + d.ssicolon_predicted);
					tt.select('#actual').text('actual cases: ' + d.ssicolon_observed);
					d3.select('#tooltip').classed('hidden', false);
				})
				.on('mouseout', function(){
					d3.select('#tooltip').classed('hidden', true);
				});

			// Hospital name links
			svg.selectAll('a')
				.data(dataset)
				.enter()
				.append('a')
					.attr('xlink:href', '')
					.attr('class', 'hospital')
				.append('text')
					.attr('class', 'hospital')
					.attr('y', function(d,i){ return yScale(i) + yScale.rangeBand() - 2; })
					.attr('x', 5)
					.attr('text-anchor', 'right')
					.attr('font-size', '13px')
					.text(function(d){ return d.hospital_name;})
				.on('click', function(d) {
					d3.event.preventDefault();
					updateDetail(d.providerid);
					return false;
				})
				.on('mouseover', function(){
					return d3.select(this)
										.attr('fill','grey')
										.attr('font-size', '14px');
				})
				.on('mouseout', function(){
					return d3.select(this)
						.attr('fill','black')
						.attr('font-size', '13px');
				});

			// state average line
			svg.append('line')
				.attr('x1', xScale(ga_avg.clabsi))
				.attr('x2', xScale(ga_avg.clabsi))
				.attr('y1', 3)
				.attr('y2', height)
				.attr('stroke', 'black')
				.attr('id', 'avg-marker');
			svg.append('text')
				.text('state average: ' + ga_avg.clabsi)
				.attr('x', xScale(ga_avg.clabsi))
				.attr('y', 0)
				.attr('text-anchor', 'middle')
				.attr('id', 'avg-text');

			// X axis
			var xAxis = d3.svg.axis()
				.scale(xScale)
				.orient('bottom')
				.ticks(5);
			svg.append('g')
				.attr('class', 'x-axis')
				.attr('transform', 'translate(0,' + (dataset.length * (yScale.rangeBand() * 1.3)) + ')')
				.call(xAxis);

			// sort by different infection sources
			d3.select('#sortby').on('change', function() {
					var infection = this.value,
	          warningText = (infection === 'clabsi') ? '' : ' (data for six months only)',
	          explainText = _.findWhere( sourceText, {source: infection});

					d3.select('#source-head').text(explainText.head);
					d3.select('#source-text').text(explainText.text);
					d3.select('#source-date').text(explainText.data_date);

					svg.selectAll('.clabsi')
						.sort(function(a,b){
							var aval = a[infection + '_ratio'] - a[infection + '_na'];
							var bval = b[infection + '_ratio'] - b[infection + '_na'];
							return bval - aval;
						})
						.transition()
						.duration(1000).ease('bounce')
						.attr('r', function(d) {
							if ( infection !== 'clabsi') {
								return 0;
							} else {
								return d.clabsi_na === '1' ? 0 : 4;
							}
						})
						.attr('opacity', function() {
							return infection === 'clabsi' ? 1 : 0;
						})
						.attr('cy', function(d,i){
							return yScale(i) + (yScale.rangeBand() / 2);
						});

					svg.selectAll('.cauti')
						.sort(function(a,b){
							var aval = a[infection + '_ratio'] - a[infection + '_na'];
							var bval = b[infection + '_ratio'] - b[infection + '_na'];
							return bval - aval;
						})
						.transition()
						.duration(1000).ease('bounce')
						.attr('r', function(d) {
							if ( infection !== 'cauti') {
								return 0;
							} else {
								return d.cauti_na === '1' ? 0 : 4;
							}
						})
						.attr('opacity', function() {
							return infection === 'cauti' ? 0.5 : 0;
						})
						.attr('cy', function(d,i){
							return yScale(i) + (yScale.rangeBand() / 2);
						});

					svg.selectAll('.ssicol')
						.sort(function(a,b){
							var aval = a[infection + '_ratio'] - a[infection + '_na'];
							var bval = b[infection + '_ratio'] - b[infection + '_na'];
							return bval - aval;
						})
						.transition()
						.duration(1000).ease('bounce')
						.attr('r', function(d) {
							if ( infection !== 'ssicolon') {
								return 0;
							} else {
								return d.ssicolon_na === '1' ? 0 : 4;
							}
						})
						.attr('opacity', function() {
							return infection === 'ssicolon' ? 0.5 : 0;
						})
						.attr('cy', function(d,i){
							return yScale(i) + (yScale.rangeBand() / 2);
						});

					svg.selectAll('text.hospital')
					.sort(function(a,b){
						var aval = a[infection + '_ratio'] - a[infection + '_na'];
						var bval = b[infection + '_ratio'] - b[infection + '_na'];
						return bval - aval;
					})
					.transition()
					.duration(500).ease('circular')
						.attr('y', function(d,i){ return yScale(i) + yScale.rangeBand() - 2; });

					svg.select('#avg-marker')
						.transition().duration(500).ease('circular')
						.attr('x1', xScale(ga_avg[infection]))
						.attr('x2', xScale(ga_avg[infection]));
					svg.select('#avg-text')
						.transition().duration(500).ease('circular')
						.text('state average: ' + ga_avg[infection] + warningText)
						.attr('x', xScale(ga_avg[infection]));
				});
			}

			///////////////////////////////////////////////////////////////////
			// Draw hospital detail graphic
			var detail = function(data, id) {
				id = id || data[0].providerid; //'110079';
				var height = 170 - margin.top - margin.bottom,
					provider  = _.findWhere(data, {providerid: id}),
					statement = _.findWhere(statements, {providerid: id}),
					ySpacing  = 10;

				d3.select('#hospital_name').text('Hospital Detail: ' + provider.hospital_name);
				d3.select('#statement').text(statement.text);

				// Loop through infection types to draw graphics
				_.each(['clabsi','cauti','ssicolon'], function(source) {
					var observed  = provider[source + '_observed'],
							predicted = Math.round(provider[source + '_predicted'] * 10) / 10,
							ratio     = provider[source + '_ratio'],
							upper     = provider[source + '_lower'] > 0 ? observed / provider[source + '_lower'] : 0,
							lower     = provider[source + '_upper'] > 0 ? observed / provider[source + '_upper'] : 0,
							na        = provider[source.toLowerCase() + '_na'] === '1',
							max = d3.max( data, function(d){return parseInt(d[source + '_observed'], 10);});

					var scale = d3.scale.linear()
						.domain([0,max + 1])
						.range([0, config.width - margin.right - margin.left]); // -5 keeps ssi:colon scale on svg

					var svg = d3.select('#' + source.toLowerCase() + '-detail' )
						.append('svg')
							.attr('width', config.width)
							.attr('height', height)
							.attr('class', 'svg-detail')
						.append('g')
							.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

					var ratioText = function() {
						if ( na ) {
							return 'No data available';
						}
						return ratio > 0 ? 'SRI: ' + ratio : 'Cannot calculate confidence interval if infections = 0';
					};

					svg.append('text')
						.text(ratioText)
						.attr('id', 'ratio-' + source)
						.attr('x', 0)
						.attr('y', 0);

					var chart = svg.append('g')
							.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

					chart.append('rect')
						.attr('id', 'range-' + source)
						.attr('x', function(){ return scale(lower); })
						.attr('y', ySpacing)
						.attr('width', function(){ return (lower > 0 && upper > 0) ? scale(upper - lower) : 0; })
						.attr('height', 17)
						.attr('fill', config.lightgreen);

					// predicted value marker
					chart.append('line')
						.attr('id', 'predicted-' + source)
						.attr('x1', function(){ return scale(predicted); })
						.attr('y1', ySpacing)
						.attr('x2', function(){ return scale(predicted); })
						.attr('y2', ySpacing + 17)
						.attr('stroke', config.grey)
						.attr('stroke-width', Math.abs(observed - predicted) >= (max/20) ? 5 : 7);
					chart.append('text').text( predicted )
						.attr('id', 'predicted-text-' + source)
						.attr('x', function(){ return scale(predicted); } )
						.attr('y', Math.abs(observed - predicted) >= (max/20) ? ySpacing - 2 : ySpacing - 14)
						.attr('text-anchor', 'middle');

					// observed value marker
					chart.append('line')
						.attr('id', 'observed-' + source)
						.attr('x1', function(){ return scale(observed); })
						.attr('y1', ySpacing)
						.attr('x2', function(){ return scale(observed); })
						.attr('y2', ySpacing + 17)
						.attr('stroke', 'black')
						.attr('stroke-width', 5);
					chart.append('text').text( observed )
						.attr('id', 'observed-text-' + source)
						.attr('x', function(){ return scale(observed); } )
						.attr('y', ySpacing - 2)
						.attr('text-anchor', 'middle');

					// Axis
					var axis = d3.svg.axis()
						.scale(scale)
						.orient('bottom')
						.ticks(5);

					svg.append('g')
						.attr('class', 'x-axis')
						.attr('transform', 'translate(' + (margin.left) + ',' + (ySpacing + 40) + ')' )
						.call(axis);
				});
			};

			// Updaye detail
			var updateDetail = function(id) {
				d3.csv("data/detail.csv", function(data) {
					var provider  = _.findWhere(data, {providerid: id}),
							statement = _.findWhere(statements, {providerid: id}),
							ySpacing = 10;

				d3.select('#hospital_name').text('Hospital Detail: ' + provider.hospital_name);
				d3.select('#statement').text(statement.text);

				_.each(['clabsi','cauti','ssicolon'], function(source) {
					var observed  = provider[source + '_observed'],
							predicted = Math.round(provider[source + '_predicted'] * 10) / 10,
							ratio     = provider[source + '_ratio'],
							upper     = provider[source + '_lower'] > 0 ? observed / provider[source + '_lower'] : 0,
							lower     = provider[source + '_upper'] > 0 ? observed / provider[source + '_upper'] : 0,
							na        = provider[source.toLowerCase() + '_na'] === '1',
							ySpacing  = 10;

					var max = d3.max( data, function(d){return parseInt(d[source + '_observed'], 10);}),
							scale = d3.scale.linear()
								.domain([0,max + 1])
								.range([0,config.width - margin.right - margin.left]);

					var ratioText = function() {
						if ( na ) {
							return 'No data available';
						}
						return ratio > 0 ? 'SRI: ' + ratio : 'Cannot calculate confidence interval if infections = 0';
					}();

					d3.select('#ratio-' + source).text(ratioText);
					d3.select('#range-' + source)
						.transition().duration(1000)
							.attr('x', function(){ return scale(lower); })
							.attr('width', function(){ return na ? 0 : scale(upper - lower); });

					d3.select('#predicted-' + source)
						.transition().duration(1000)
							.attr('x1', function(){ return scale(predicted); })
							.attr('y1', ySpacing)
							.attr('x2', function(){ return scale(predicted); })
							.attr('y2', ySpacing + 17)
							.attr('opacity', function() { return na ? 0 : 1; });
					d3.select('#predicted-text-' + source)
						.transition().duration(1000)
						.text( function() { return na ? '' : predicted; } )
							.attr('x', function(){ return scale(predicted); } )
							.attr('y', Math.abs(observed - predicted) >= (max/20) ? ySpacing - 2 : ySpacing - 14)
							.attr('text-anchor', 'middle');

					d3.select('#observed-' + source)
						.transition().duration(1000)
							.attr('x1', function(){ return scale(observed); })
							.attr('y1', ySpacing)
							.attr('x2', function(){ return scale(observed); })
							.attr('y2', ySpacing + 17)
							.attr('stroke', 'black')
							.attr('opacity', function() { return na ? 0 : 1; });
					d3.select('#observed-text-' + source)
						.transition().duration(1000)
						.text( function() { return na ? '' : observed; } )
							.attr('x', function(){ return scale(observed); } )
							.attr('y', ySpacing - 2)
							.attr('text-anchor', 'middle');
				});
			});
		};
	} else {
		$(div#graphics).replaceWith("<h2>Viewing interactive graphics requires a modern browser. Please update your browser</h2>")
	}
});
