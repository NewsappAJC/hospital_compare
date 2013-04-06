$(function() {
	'use strict';

	d3.csv("data/cauti_states.csv", function(data) {
		drawBarChart(_.sortBy(data,
								 function(d){return parseFloat(d.score);}),
			           '#cauti-state',
			           'Catheter Associated Urinary Tract Infections');
	});
	d3.csv("data/clabsi_states.csv", function(data) {
		drawBarChart(_.sortBy(data,
							  function(d){return parseFloat(d.score);}),
			          '#clabsi-state',
			          'Central-Line-Associated Blood Stream Infections');
	});
	d3.csv("data/ssicolon_states.csv", function(data) {
		drawBarChart(_.sortBy(data,
								 function(d){return parseFloat(d.score);}),
			           '#ssicolon-state',
			           'Surgical Site Infection from colon surgery');
	});

	function drawBarChart(dataset, tag, headline) {
		var margin = {top: 20, right: 10, bottom: 20, left: 10},
		    w = 850 - margin.left - margin.right,
		    h = 250 - margin.top - margin.bottom,
		    barpad = 3,
		    toppad = 10,
		    max = 2.5;

		var scale = d3.scale.linear()
			.domain([0,max])
			.range([0,h]);
		var svg = d3.select(tag)
			.append('svg')
				.attr('width', w + margin.left + margin.right)
				.attr('height', h + margin.top + margin.bottom)
			.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

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
				.attr('fill', function(d){return d.state === 'GA' ? 'darkblue' : 'lightgrey';})
			.on('mouseover', function(d,i) {
				var x = parseFloat(d3.select(this).attr('x')),
				    y = parseFloat(d3.select(this).attr('y') - 50),
				    tt = d3.select('#tooltip')
				    			 .style('left', x + 'px')
				    			 .style('top', y + 'px');

				// console.log(x + ', ', y);
				tt.select('#state').text('State: ' + d.state);
				tt.select('#score').text('Score: ' + d.score);
				tt.select('#rank').text('Rank: ' + (i+1));
				tt.classed('hidden', false);
			})
			.on('mouseout', function() {
				d3.select('#tooltip').classed('hidden', true);
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
				.attr('fill', function(d){return d.state === 'GA' ? 'white' : 'black';})
				.attr('text-anchor', 'middle');

		svg.append('text')
			.text(headline)
			.attr('x', 5)
			.attr('y', 120)
			.attr('fill','black')
			.attr('font-size', '20px');
	}
});
