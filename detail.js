$(function() {
	var config = {
		w: 750,
    h: 100,
    leftMargin: 50,
    rightMargin: 50,
    topMargin: 50,
    id: /\?id=(\d+)$/.exec(window.location.href)[1]
	 };

	d3.csv("detail.csv", function(data) {
		window.data = data;
		drawDetailChart(data, 'CLABSI',   config);
		drawDetailChart(data, 'CAUTI',    config);
		drawDetailChart(data, 'SSIcolon', config);
	});

	function drawDetailChart(data, source, config) {
		console.log(config);
		window.config = config;
		var provider = _.findWhere(data, {provider_id: config.id});

		var observed  = provider[source + '_observed'],
		    predicted = provider[source + '_predicted']
		    ratio     = provider[source + '_ratio'];

		var max = d3.max( data, function(d){return parseInt(d[source + '_observed'])})
		var scale = d3.scale.linear()
			.domain([0,max])
			.range([config.leftMargin, config.w - config.rightMargin]);
		window.scale = scale;

		var svg = d3.select('#' + source.toLowerCase() )
			.append('svg')
				.attr('width', config.w)
				.attr('height', config.h);

		svg.append('text')
			.text(source + ' (ratio: ' + ratio + ')')
			.attr('x', config.leftMargin)
			.attr('y', 30);

		var chart = svg.append('g')
		chart.append('circle')
				.attr('cx', function(){ return scale(observed) })
				.attr('cy', 10 + config.topMargin)
				.attr('r', 5)
				.attr('fill', function(){ return parseFloat(observed) > parseFloat(predicted) ? 'red' : 'green'})
		chart.append('text').text( observed )
			.attr('x', function(){ return scale(observed) } )
			.attr('y', config.topMargin);

		chart.append('circle')
				.attr('cx', function(){ return scale(predicted) })
				.attr('cy', 10 + config.topMargin)
				.attr('r', 5)
				.attr('fill', 'lightgrey');
		chart.append('text').text( predicted )
			.attr('x', function(){ return scale(predicted) } )
			.attr('y', config.topMargin);

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
