$(function() {
	"use strict";

	var margin = {top: 20, right: 10, bottom: 20, left: 10};
	var config = {
		width: 750 - margin.left - margin.right,
    red: '#FF0000',
    lightred: '#F8E0E0',
    green: '#088A08',
    lightgreen: '#CEF6CE',
    grey: '#A4A4A4'
	}
	var ga_avg = {
		clabsi   : 0.74,
		cauti    : 0.71,
		ssicolon : 0.98
	};

	d3.csv("data/hospitals.csv", function(data) {
		drawDotChart(data);
		detail();
	});

	function drawDotChart(dataset) {
		var height = (25 * dataset.length) - margin.top - margin.bottom,
    		left_pad = 235;

		var max = Math.max(
			d3.max(dataset, function(d) {return parseFloat(d.clabsi_ratio);}),
			d3.max(dataset, function(d) {return parseFloat(d.cauti_ratio);}),
			d3.max(dataset, function(d) {return parseFloat(d.ssicolon_ratio);})
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
			.attr('width', xScale(5) - xScale(1) + left_pad + 2)
			.attr('height', yScale.rangeBand());

		// CLABSI circles
		var clabsi = svg.selectAll('.clabsi')
			.data(dataset)
			.enter().append('circle')
				.attr('class', 'clabsi')
				.attr('cx', function(d){ return xScale(d.clabsi_ratio); })
				.attr('cy', function(d,i){ return yScale(i) + (yScale.rangeBand() / 2); })
				.attr('r', 5)
				.attr('fill','#0101DF')
			.on('mouseover', function(d) {
				var x = parseFloat(d3.select(this).attr('cx') + 10),
				    y = parseFloat(d3.select(this).attr('cy') - 18);
				var tt = d3.select('#tooltip')
					.style('left', x + 'px')
					.style('top', y + 'px');
				tt.select('#source').text('CLABSI');
				tt.select('#score').text('score: ' + d.clabsi_ratio);
				d3.select('#tooltip').classed('hidden', false);
			})
			.on('mouseout', function(){
				d3.select('#tooltip').classed('hidden', true);
			});


		// CAUTI symbols
		var cauti = svg.selectAll('.cauti')
			.data(dataset)
			.enter()
		  .append('rect')
		  	.attr('class', 'cauti')
				.attr('x', function(d){ return xScale(d.cauti_ratio)-4; })
				.attr('y', function(d,i){ return yScale(i) + (yScale.rangeBand() / 2) - 4; })
				.attr('width', 8)
				.attr('height', 8)
				.attr('fill','black')
				.attr('opacity', 0.3)
			.on('mouseover', function(d) {
				var x = parseFloat(d3.select(this).attr('x') + 10),
				    y = parseFloat(d3.select(this).attr('y') - 18);
				x = x > 1000 ? x/100 : x; // why are x's near border 100x larger?
				var tt = d3.select('#tooltip')
					.style('left', x + 'px')
					.style('top', y + 'px');
				tt.select('#source').text('CLAUTI');
				tt.select('#score').text('score: ' + d.cauti_ratio);
				d3.select('#tooltip').classed('hidden', false);
			})
			.on('mouseout', function(){
				d3.select('#tooltip').classed('hidden', true);
			});

		// SSI:Colon symbols
		var ssicol = svg.selectAll('.ssicol')
			.data(dataset)
			.enter()
		  .append('circle')
		  	.attr('class', 'ssicol')
				.attr('cx', function(d){ return xScale(d.ssicolon_ratio); })
				.attr('cy', function(d,i){ return yScale(i) + (yScale.rangeBand() / 2); })
				.attr('r', 4)
				.attr('fill','black')
				.attr('opacity', 0.3)
			.on('mouseover', function(d) {
				var x = parseFloat(d3.select(this).attr('cx') + 10),
				    y = parseFloat(d3.select(this).attr('cy') - 18);
				x = x > 1000 ? x/100 : x; // why are x's near border 100x larger?
				var tt = d3.select('#tooltip')
					.style('left', x + 'px')
					.style('top', y + 'px');
				tt.select('#source').text('SSI Colon');
				tt.select('#score').text('score: ' + d.ssicolon_ratio);
				d3.select('#tooltip').classed('hidden', false);
			})
			.on('mouseout', function(){
				d3.select('#tooltip').classed('hidden', true);
			});

		// Hospital names
		svg.selectAll('a')
			.data(dataset)
			.enter()
			.append('a')
				// .attr('xlink:href', function(d){ return 'detail.html?id=' + d.provider_id })
				.attr('xlink:href', '#')
				.attr('class', 'hospital')
			.append('text')
				.attr('class', 'hospital')
				.attr('y', function(d,i){ return yScale(i) + yScale.rangeBand() - 2; })
				.attr('x', 5)
				.attr('text-anchor', 'right')
				.attr('font-size', '13px')
				.text(function(d){ return d.hospital_name;})
			.on('click', function(d) {
					updateDetail(d.provider_id);
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
								 .attr('font-size', '13px');});

		svg.append('line')
			.attr('x1', xScale(ga_avg.clabsi))
			.attr('x2', xScale(ga_avg.clabsi))
			.attr('y1', 3)
			.attr('y2', height)
			.attr('stroke', 'black')
			.attr('id', 'avg-marker');
		svg.append('text')
			.text('CLABSI state average')
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
				var infection = this.value;

				svg.selectAll('.clabsi')
					.sort(function(a,b){
							return b[infection + '_ratio'] - a[infection + '_ratio'];
					})
					.transition()
					.duration(1000).ease('bounce')
					.attr('opacity', function() {
						return infection === 'clabsi' ? 1.0 : 0.4; 
					})
					.attr('cy', function(d,i){
						return yScale(i) + (yScale.rangeBand() / 2);
					});

				svg.selectAll('.cauti')
					.sort(function(a,b){
							return b[infection + '_ratio'] - a[infection + '_ratio'];
					})
					.transition()
					.duration(1000).ease('bounce')
					.attr('opacity', function() {
						return infection === 'cauti' ? 0.7 : 0.3; 
					})
					.attr('y', function(d,i){ return yScale(i) + (yScale.rangeBand() / 2) - 4; });

				svg.selectAll('.ssicol')
					.sort(function(a,b){
							return b[infection + '_ratio'] - a[infection + '_ratio'];
					})
					.transition()
					.duration(1000).ease('bounce')
					.attr('opacity', function() {
						return infection === 'ssicolon' ? 0.7 : 0.3; 
					})
					.attr('cy', function(d,i){
						return yScale(i) + (yScale.rangeBand() / 2);
					});

				svg.selectAll('text.hospital')
					.sort(function(a,b){
							return b[infection + '_ratio'] - a[infection + '_ratio'];
					})
					.transition()
					.duration(500).ease('circular')
					.attr('y', function(d,i){ return yScale(i) + yScale.rangeBand() - 2; })

				svg.select('#avg-marker')
					.transition().duration(500).ease('circular')
					.attr('x1', xScale(ga_avg[infection]))
					.attr('x2', xScale(ga_avg[infection]));
				svg.select('#avg-text')
					.transition().duration(500).ease('circular')
					.text(infection.toUpperCase() + ' state average')
					.attr('x', xScale(ga_avg[infection]));
			});

			var tooltip = function(d) {
				var x = parseFloat(d3.select(this).attr('cx') + 10),
				    y = parseFloat(d3.select(this).attr('cy') - 15);
				var tt = d3.select('#tooltip')
					.style('left', x + 'px')
					.style('top', y + 'px');
				tt.select('#source').text('CLABSI');
				tt.select('#score').text('score: ' + d.clabsi_ratio);
				d3.select('#tooltip').classed('hidden', false);
			}
	  }

	  function detail(id) {
	  	id = id || '110079';
	  	var height = 150 - margin.top - margin.bottom;

			var legendSvg = d3.select('#legend')
				.append('svg')
					.attr('width', config.width)
					.attr('height', 60)
				.append('g')
					.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

			var legend = legendSvg.append('g');

			legend.append('text').text('Expected cases:')
					.attr('x', 5)
					.attr('y', 25);
			legend.append('line')
				.attr('x1', 108)
				.attr('y1', 10)
				.attr('x2', 108)
				.attr('y2', 30)
				.attr('stroke', config.grey)
				.attr('stroke-width', 5);
			legend.append('text').text('Expected range:')
					.attr('x', 125)
					.attr('y', 25);
			legend.append('rect')
				.attr('x', 225)
				.attr('y', 10)
				.attr('width', 20)
				.attr('height', 20)
				.attr('fill', config.lightgreen);
			legend.append('text').text('Actual cases, fewer than expected:')
					.attr('x', 260)
					.attr('y', 25);
			legend.append('line')
				.attr('x1', 470)
				.attr('y1', 10)
				.attr('x2', 470)
				.attr('y2', 30)
				.attr('stroke', config.green)
				.attr('stroke-width', 5);
			legend.append('text').text('more than expected:')
					.attr('x', 485)
					.attr('y', 25);
			legend.append('line')
				.attr('x1', 608)
				.attr('y1', 10)
				.attr('x2', 608)
				.attr('y2', 30)
				.attr('stroke', config.red)
				.attr('stroke-width', 5);

			d3.csv("data/detail.csv", function(data) {
				window.data = data;
				drawDetailChart(data, 'CLABSI',   config);
				drawDetailChart(data, 'CAUTI',    config);
				drawDetailChart(data, 'SSIcolon', config);
			});

			function drawDetailChart(data, source, config) {
				var provider  = _.findWhere(data, {provider_id: id}),
				    observed  = provider[source + '_observed'],
				    predicted = provider[source + '_predicted'],
				    ratio     = provider[source + '_ratio'],
				    upper     = provider[source + '_lower'] > 0 ? observed / provider[source + '_lower'] : 0,
				    lower     = provider[source + '_upper'] > 0 ? observed / provider[source + '_upper'] : 0;

				var max = d3.max( data, function(d){return parseInt(d[source + '_observed']);}),
				    scale = d3.scale.linear()
					  	.domain([0,max + 1])
					  	.range([0, config.width - margin.right - margin.left]);

				d3.select('#hospital_name').text(provider.hospital_name);

				var svg = d3.select('#' + source.toLowerCase() + '-detail' )
					.append('svg')
						.attr('width', config.width)
						.attr('height', height)
						.attr('class', 'svg-detail')
					.append('g')
						.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

				// Headline
				svg.append('text')
					.text('(ratio: ' + (ratio > 0 ? ratio : 'NA') + ')')
					.attr('id', 'ratio-' + source)
					.attr('x', 0)
					.attr('y', 0);

				var chart = svg.append('g')
						.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

				chart.append('rect')
					.attr('id', 'range-' + source)
					.attr('x', function(){ return scale(lower); })
					.attr('y', 3 + margin.top )
					.attr('width', function(){ return (lower > 0 && upper > 0) ? scale(upper - lower) : 0; })
					.attr('height', 17)
					.attr('fill', config.lightgreen);

				// predicted value marker
				chart.append('line')
					.attr('id', 'predicted-' + source)
					.attr('x1', function(){ return scale(predicted); })
					.attr('y1', 3 + margin.top)
					.attr('x2', function(){ return scale(predicted); })
					.attr('y2', 20 + margin.top)
					.attr('stroke', config.grey)
					.attr('stroke-width', Math.abs(observed - predicted) >= (max/20) ? 5 : 7);
				chart.append('text').text( predicted )
					.attr('id', 'predicted-text-' + source)
					.attr('x', function(){ return scale(predicted); } )
					.attr('y', Math.abs(observed - predicted) >= (max/20) ? margin.top : margin.top - 13)
					.attr('text-anchor', 'middle');

				// observed value marker
				chart.append('line')
					.attr('id', 'observed-' + source)
					.attr('x1', function(){ return scale(observed); })
					.attr('y1', 3 + margin.top)
					.attr('x2', function(){ return scale(observed); })
					.attr('y2', 20 + margin.top)
					.attr('stroke', function(){ return parseFloat(observed) > parseFloat(upper) ? config.red : config.green; })
					.attr('stroke-width', 5);
				chart.append('text').text( observed )
					.attr('id', 'observed-text-' + source)
					.attr('x', function(){ return scale(observed); } )
					.attr('y', margin.top)
					.attr('text-anchor', 'middle');

				// Axis
				var axis = d3.svg.axis()
					.scale(scale)
					.orient('bottom')
					.ticks(7);

				svg.append('g')
					.attr('class', 'x-axis')
					.attr('transform', 'translate(' + margin.left + ',' + (margin.top + 45) + ')' )
					.call(axis);
			}
		}
	  var updateDetail = function(id) {
			d3.csv("data/detail.csv", function(data) {
	  		var provider  = _.findWhere(data, {provider_id: id});
	  		d3.select('#hospital_name')
	  			.transition().delay(700)
	  			.text(provider.hospital_name);

	  		['CLABSI','CAUTI','SSIcolon'].forEach( function(source) {
	  			// console.log(source);
			    var observed  = provider[source + '_observed'],
					    predicted = provider[source + '_predicted'],
					    ratio     = provider[source + '_ratio'],
					    upper     = provider[source + '_lower'] > 0 ? observed / provider[source + '_lower'] : 0,
					    lower     = provider[source + '_upper'] > 0 ? observed / provider[source + '_upper'] : 0;

					var max = d3.max( data, function(d){return parseInt(d[source + '_observed']);}),
					    scale = d3.scale.linear()
						  	.domain([0,max + 1])
						  	.range([0,config.width - margin.right - margin.left]);

	  			d3.select('#ratio-' + source).text('(ratio: ' + (ratio > 0 ? ratio : 'NA') + ')');

	  			d3.select('#range-' + source)
	  				.transition().duration(1000)
						.attr('x', function(){ return scale(lower); })
						.attr('y', 3 + margin.top )
						.attr('width', function(){ return (lower > 0 && upper > 0) ? scale(upper - lower) : 0; });

					d3.select('#predicted-' + source)
	  				.transition().duration(1000)
							.attr('x1', function(){ return scale(predicted); })
							.attr('y1', 3 + margin.top)
							.attr('x2', function(){ return scale(predicted); })
							.attr('y2', 20 + margin.top)
					d3.select('#predicted-text-' + source)
						.transition().duration(1000)
						.text( predicted )
							.attr('x', function(){ return scale(predicted); } )
							.attr('y', Math.abs(observed - predicted) >= (max/20) ? margin.top : margin.top - 13)
							.attr('text-anchor', 'middle');

					d3.select('#observed-' + source)
	  				.transition().duration(1000)
							.attr('x1', function(){ return scale(observed); })
							.attr('y1', 4 + margin.top)
							.attr('x2', function(){ return scale(observed); })
							.attr('y2', 20 + margin.top)
							.attr('stroke', function(){ return parseFloat(observed) > parseFloat(upper) ? config.red : config.green; })
					d3.select('#observed-text-' + source)
						.transition().duration(1000)
						.text( observed )
							.attr('x', function(){ return scale(observed); } )
							.attr('y', margin.top)
							.attr('text-anchor', 'middle');
		  	});
	  	});
	  }
});
