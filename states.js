$(function() {
	d3.csv("cauti_states.csv", function(data) {
		drawBarChart(_.sortBy(data, function(d){return parseFloat(d.score)}),
			           '#cauti-state',
			           'Catheter Associated Urinary Tract Infections');
	});
	d3.csv("clabsi_states.csv", function(data) {
		drawBarChart(_.sortBy(data, function(d){return parseFloat(d.score)}),
			          '#clabsi-state',
			          'Central-Line-Associated Blood Stream Infections');
	});
	d3.csv("ssicolon_states.csv", function(data) {
		drawBarChart(_.sortBy(data, function(d){return parseFloat(d.score)}),
			           '#ssicolon-state',
			           'Surgical Site Infection from colon surgery');
	});

	function drawBarChart(dataset, tag, headline) {
		var w = 850, h = 175, barpad = 3, toppad = 10;
		var max = 2.5,
		    min = 0;
		var scale = d3.scale.linear()
			.domain([0,max])
			.range([0,h]);
		var svg = d3.select(tag)
			.append('svg')
				.attr('width', w)
				.attr('height', h);

		svg.selectAll('rect')
			.data(dataset)
			.enter()
			.append('rect')
				.attr('x', function(d,i){return i*(w/dataset.length);})
				.attr('y', function(d){
					return h - scale(parseFloat(d.score)) + toppad;
				})
				.attr('width', (w/dataset.length) - barpad)
				.attr('height', function(d){
					return scale(parseFloat(d.score)) - toppad;
				})
				.attr('class', 'bar')
				.attr('fill', function(d){return d.state === 'GA' ? 'darkblue' : 'lightgrey'})
			.append('title')
				.text( function(d, i) {
					return "State: " + d.state + "; Score: " + d.score + "; Rank: " + (i+1) ;
				});

		svg.selectAll('text')
			.data(dataset)
			.enter()
			.append('text')
			.text(function(d){return d.state;})
				.attr('x', function(d,i){
					return i*(w/dataset.length) + (w/dataset.length - barpad) / 2;
				})
				.attr('y', h - 2)
				.attr('font-size', '8px')
				.attr('fill', function(d){return d.state == 'GA' ? 'white' : 'black';})
				.attr('text-anchor', 'middle');

		svg.append('text')
			.text(headline)
			.attr('x', 5)
			.attr('y', 30)
			.attr('fill','black')
			.attr('font-size', '20px');
	}
});
