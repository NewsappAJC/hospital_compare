$(function() {
	"use strict";

	d3.csv("data/hospitals.csv", function(data) {
		window.data = data;
		drawDotChart(data);
	});

	function drawDotChart(dataset) {
		var margin = {top: 20, right: 10, bottom: 20, left: 10},
		    w = 750 - margin.left - margin.right,
		    h = 400 - margin.top - margin.bottom,
		    pad = 8,
		    left_pad = 225;

		var max = Math.max(
			d3.max(dataset, function(d) {return parseFloat(d.clabsi_ratio);}),
			d3.max(dataset, function(d) {return parseFloat(d.cauti_ratio);}),
			d3.max(dataset, function(d) {return parseFloat(d.ssicolon_ratio);})
		);
		var scale = d3.scale.linear()
			.domain([0,Math.ceil(max)])
			.range([left_pad, w]);

		var svg = d3.select('#hospitals')
			.append('svg')
				.attr('width', w + margin.left + margin.right)
				.attr('height', h + margin.top + margin.bottom)
			.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

		// Horizontal grib bars
		svg.selectAll('rect')
			.data(dataset)
			.enter().append('rect')
			.attr('x', left_pad)
			.attr('y', function(d,i){
					return i * 20;
				})
			.attr('fill', '#E0F8E0')
			.attr('width', scale(1) - left_pad - 2)
			.attr('height', 16);

		var hgrid_red = svg.selectAll('g')
			.data(dataset)
			.enter().append('g');
		hgrid_red.append('svg:rect')
			.attr('x', scale(1) + 2)
			.attr('y', function(d,i){
					return i * 20;
				})
			.attr('fill', '#F8E0E0')
			.attr('width', scale(5) - scale(1) + left_pad + 2)
			.attr('height', 16);

		// CLABSI circles
		var clabsi = svg.selectAll('.clabsi')
			.data(dataset)
			.enter().append('circle')
				.attr('class', 'clabsi')
				.attr('cx', function(d){ return scale(d.clabsi_ratio)+5; })
				.attr('cy', function(d,i){ return i * 20 + pad; })
				.attr('r', 5)
				.attr('fill','#0101DF')
			.append('title')
				.text(function(d) {
					return "CLABSI score: " + d.clabsi_ratio;
				});


		// CAUTI symbols
		var cauti = svg.selectAll('.cauti')
			.data(dataset)
			.enter()
		  .append('rect')
		  	.attr('class', 'cauti')
				.attr('x', function(d){ return scale(d.cauti_ratio)+5-4; })
				.attr('y', function(d,i){ return i * 20 + pad-4; })
				.attr('width', 8)
				.attr('height', 8)
				.attr('fill','black')
				.attr('opacity', 0.3)
		.append('title')
			.text(function(d) {
				return "CAUTI score: " + d.cauti_ratio;
			});

		// SSI:Colon symbols
		var ssicol = svg.selectAll('.ssicol')
			.data(dataset)
			.enter()
		  .append('circle')
		  	.attr('class', 'ssicol')
				.attr('cx', function(d){ return scale(d.ssicolon_ratio)+5; })
				.attr('cy', function(d,i){ return i * 20 + pad; })
				.attr('r', 4)
				.attr('fill','black')
				.attr('opacity', 0.3)
		.append('title')
			.text(function(d) {
				return "SSI:Colon score: " + d.ssicolon_ratio;
			});

		// Hospital names
		svg.selectAll('a')
			.data(dataset)
			.enter()
			.append('a')
				.attr('xlink:href', function(d){ return 'detail.html?id=' + d.provider_id })
				.attr('class', 'hospital')
			.append('text')
				.attr('class', 'hospital')
				.attr('y', function(d,i){ return i * 20 + pad + 5; })
				.attr('x', 5)
				.attr('text-anchor', 'right')
				.text(function(d){ return d.hospital_name;})
			.on('mouseover', function(){ return d3.select(this).attr('fill','grey'); })
			.on('mouseout', function(){ return d3.select(this).attr('fill','black');});

		// X axis
		var xAxis = d3.svg.axis()
			.scale(scale)
			.orient('bottom')
			.ticks(5);

		svg.append('g')
			.attr('class', 'x-axis')
			.attr('transform', 'translate(0,' + (dataset.length * 20 + pad) + ')')
			.call(xAxis);

		// sort by different infection sources
		d3.select('#sortby').on('change', function() {
				var infection = this.value;

				var transition = svg.transition().duration(1000).ease('bounce');

				svg.selectAll('.clabsi')
					.sort(function(a,b){
							return b[infection + '_ratio'] - a[infection + '_ratio'];
					})
					.transition()
					.duration(1000).ease('bounce')
					.attr('opacity', function() {
						return infection === 'clabsi' ? 1.0 : 0.5; 
					})
					.attr('cy', function(d,i){
						return i * 20 + pad;
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
					.attr('y', function(d,i){ return i * 20 + pad-4; });

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
						return i * 20 + pad;
					});

				svg.selectAll('text.hospital')
					.sort(function(a,b){
							return b[infection + '_ratio'] - a[infection + '_ratio'];
					})
					.transition()
					.duration(1000).ease('bounce')
					.attr('y', function(d,i){ return i * 20 + pad + 5; })
			});
	  }
});
