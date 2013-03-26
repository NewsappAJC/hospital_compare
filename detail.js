$(function() {
	var config = {
		w: 650,
    h: 85,
    leftMargin: 50,
    rightMargin: 50,
    topMargin: 45,
    red: '#FF0000',
    green: '#04B404',
    grey: '#A4A4A4',
    id: /\?id=(\d+)$/.exec(window.location.href)[1]
	};

	var legandSvg = d3.select('#legand')
		.append('svg')
			.attr('width', config.w)
			.attr('height', 30);

	legand = legandSvg.append('g');

	legand.append('text').text('Predicted cases:')
			.attr('x', 5)
			.attr('y', 25);
	legand.append('line')
		.attr('x1', 109)
		.attr('y1', 10)
		.attr('x2', 109)
		.attr('y2', 30)
		.attr('stroke', config.grey)
		.attr('stroke-width', 5);
	legand.append('text').text('Observed cases, less than predicted:')
			.attr('x', 125)
			.attr('y', 25);
	legand.append('line')
		.attr('x1', 350)
		.attr('y1', 10)
		.attr('x2', 350)
		.attr('y2', 30)
		.attr('stroke', config.green)
		.attr('stroke-width', 5);
	legand.append('text').text('Observed cases, greater than predicted:')
			.attr('x', 370)
			.attr('y', 25);
	legand.append('line')
		.attr('x1', 610)
		.attr('y1', 10)
		.attr('x2', 610)
		.attr('y2', 30)
		.attr('stroke', config.red)
		.attr('stroke-width', 5);

	d3.csv("detail.csv", function(data) {
		window.data = data;
		drawDetailChart(data, 'CLABSI',   config);
		drawDetailChart(data, 'CAUTI',    config);
		drawDetailChart(data, 'SSIcolon', config);
	});

	function drawDetailChart(data, source, config) {
		var provider = _.findWhere(data, {provider_id: config.id}),
		    observed  = provider[source + '_observed'],
		    predicted = provider[source + '_predicted']
		    ratio     = provider[source + '_ratio'];

		var max = d3.max( data, function(d){return parseInt(d[source + '_observed'])}),
		    scale = d3.scale.linear()
			  	.domain([0,max + 1])
			  	.range([config.leftMargin, config.w - config.rightMargin]);

		var svg = d3.select('#' + source.toLowerCase() )
			.append('svg')
				.attr('width', config.w)
				.attr('height', config.h);

		// Headline
		svg.append('text')
			.text(source + ' (ratio: ' + ratio + ')')
			.attr('x', config.leftMargin)
			.attr('y', 15);

		var chart = svg.append('g')

		// predicted value marker
		chart.append('line')
				.attr('x1', function(){ return scale(predicted) })
				.attr('y1', 3 + config.topMargin)
				.attr('x2', function(){ return scale(predicted) })
				.attr('y2', 20 + config.topMargin)
				.attr('stroke', config.grey)
				.attr('stroke-width', Math.abs(observed - predicted) >= (max/20) ? 5 : 7);
		chart.append('text').text( predicted )
			.attr('x', function(){ return scale(predicted) } )
			.attr('y', Math.abs(observed - predicted) >= (max/20) ? config.topMargin : config.topMargin - 13)
			.attr('text-anchor', 'middle');

		// observed value marker
		chart.append('line')
				.attr('x1', function(){ return scale(observed) })
				.attr('y1', 3 + config.topMargin)
				.attr('x2', function(){ return scale(observed) })
				.attr('y2', 20 + config.topMargin)
				.attr('stroke', function(){ return parseFloat(observed) > parseFloat(predicted) ? config.red : config.green})
				.attr('stroke-width', 5);
		chart.append('text').text( observed )
			.attr('x', function(){ return scale(observed) } )
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
