$(function() {
	d3.csv("hospitals.csv", function(data) {
		drawDotChart(data);
		window.dataset = data
	});

	function drawDotChart(dataset) {
		var w = 750,
		    h = 2000,
		    pad = 20
		    radius = 6;
		var max = Math.max( 
			d3.max(dataset, function(d) {return parseFloat(d.clabsi_ratio);}),
			d3.max(dataset, function(d) {return parseFloat(d.cauti_ratio);}),
			d3.max(dataset, function(d) {return parseFloat(d.ssicolon_ratio);})
		);
		var min = 0;
		var scale = d3.scale.linear()
			.domain([0,Math.ceil(max)])
			.range([310, w-10]);

		var svg = d3.select('#hospitals')
			.append('svg')
				.attr('width', w)
				.attr('height', h);

		// CLABSI dots
		var circle = svg.selectAll('circle')
			.data(dataset)
			.enter()
			.append('circle')
				.attr('cx', function(d){ return 5 + scale(d.clabsi_ratio)})
				.attr('cy', function(d,i){
					return i * 20 + pad;
				})
				.attr('r', radius)
				.attr('fill', 'blue')
			.append('title')
				.text(function(d) {
					return "CLABSI score: " + d.clabsi_ratio;
				});

		// CAUTI dots
		var cauti = svg.selectAll('g')
			.data(dataset)
			.enter()
			.append('g')
				.attr('class', 'cauti')
		cauti.append('circle')
			.attr('cx', function(d){ return 5 + scale(d.cauti_ratio)})
			.attr('cy', function(d,i){
					return i * 20 + pad;
			})
			.attr('r', radius)
			.attr('fill', 'lightgrey')
			.append('title')
				.text(function(d) {
					return "CAUTI score: " + d.cauti_ratio;
				});

		// SSI:Colon dots
		var ssicol = svg.selectAll('g.sicol')
			.data(dataset)
			.enter()
			.append('svg:g')
				.attr('class', 'ssicol');
		cauti.append('circle')
				.attr('cx', function(d){ return 5 + scale(d.ssicolon_ratio)})
				.attr('cy', function(d,i){
					return i * 20 + pad;
				})
				.attr('r', radius)
				.attr('fill', 'lightgrey')
			.append('title')
				.text(function(d) {
					return "SSI:Colon score: " + d.ssicolon_ratio;
				});

		// Hospital names
		svg.selectAll('text')
			.data(dataset)
			.enter()
			.append('text')
			.text(function(d){ return d.hospital_name})
			.attr('y', function(d,i){
					return i * 20 + pad + 5;
				})
			.attr('x', 5)

		// X axis
		var xAxis = d3.svg.axis()
			.scale(scale)
			.orient('bottom')
			.ticks(5);

		svg.append('g')
			.attr('class', 'x-axis')
			.attr('transform', 'translate(0,' + (dataset.length * 20 + 10) + ')')
			.call(xAxis);
	}
});
