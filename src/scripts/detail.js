$(function() {
	"use strict";

	var config = {
		w: 750,
    h: 120,
    leftMargin: 10,
    rightMargin: 50,
    topMargin: 45,
    red: '#FF0000',
    green: '#088A08',
    lightgreen: '#CEF6CE',
    grey: '#A4A4A4',
    id: /\?id=(\d+)$/.exec(window.location.href)[1]
	};

	var legendSvg = d3.select('#legend')
		.append('svg')
			.attr('width', config.w)
			.attr('height', 60);

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
		var provider  = _.findWhere(data, {provider_id: config.id}),
			observed  = provider[source + '_observed'],
			predicted = provider[source + '_predicted'],
			ratio     = provider[source + '_ratio'],
			upper     = provider[source + '_lower'] > 0 ? observed / provider[source + '_lower'] : 0,
			lower     = provider[source + '_upper'] > 0 ? observed / provider[source + '_upper'] : 0;

		var max = d3.max( data, function(d){return parseInt(d[source + '_observed'], 10);}),
			scale = d3.scale.linear()
				.domain([0,max + 1])
				.range([config.leftMargin, config.w - config.rightMargin]);

		var svg = d3.select('#' + source.toLowerCase() + '-graphic' )
			.append('svg')
				.attr('width', config.w)
				.attr('height', config.h);

		// Headline
		svg.append('text')
			.text('(ratio: ' + (ratio > 0 ? ratio : 'NA') + ')')
			.attr('x', 5)
			.attr('y', 15);

		var chart = svg.append('g');

		if (lower > 0 & upper > 0 ) {
			chart.append('rect')
				.attr('x', function(){ return scale(lower); })
				.attr('y', 3 + config.topMargin )
				.attr('width', function(){ return scale(upper - lower); })
				.attr('height', 17)
				.attr('fill', config.lightgreen);
		}

		// predicted value marker
		chart.append('line')
				.attr('x1', function(){ return scale(predicted); })
				.attr('y1', 3 + config.topMargin)
				.attr('x2', function(){ return scale(predicted); })
				.attr('y2', 20 + config.topMargin)
				.attr('stroke', config.grey)
				.attr('stroke-width', Math.abs(observed - predicted) >= (max/20) ? 5 : 7);
		chart.append('text').text( predicted )
			.attr('x', function(){ return scale(predicted); } )
			.attr('y', Math.abs(observed - predicted) >= (max/20) ? config.topMargin : config.topMargin - 13)
			.attr('text-anchor', 'middle');

		// observed value marker
		chart.append('line')
				.attr('x1', function(){ return scale(observed); })
				.attr('y1', 3 + config.topMargin)
				.attr('x2', function(){ return scale(observed); })
				.attr('y2', 20 + config.topMargin)
				.attr('stroke', function(){ return parseFloat(observed) > parseFloat(upper) ? config.red : config.green; })
				.attr('stroke-width', 5);
		chart.append('text').text( observed )
			.attr('x', function(){ return scale(observed); } )
			.attr('y', config.topMargin)
			.attr('text-anchor', 'middle');

		// Axis
		var axis = d3.svg.axis()
			.scale(scale)
			.orient('bottom')
			.ticks(7);

		svg.append('g')
			.attr('class', 'x-axis')
			.attr('transform', 'translate(0,' + (20 + config.topMargin) + ')' )
			.call(axis);
	}
});
