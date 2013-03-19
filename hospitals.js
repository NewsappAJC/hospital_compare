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

		// CLABSI symbols
		svg.selectAll('path')
			.data(dataset)
			.enter().append('svg:path')
				.attr('transform', function(d,i){ return 'translate('
							+ (scale(d.clabsi_ratio)+5) + ','
						  + (i * 20 + pad) + ')';})
				.attr('d', d3.svg.symbol().type('circle'))
				.attr('fill','blue')
			.append('title')
				.text(function(d) {
					return "CLABSI score: " + d.clabsi_ratio;
				});


		// CAUTI symbols
		var cauti = svg.selectAll('g')
			.data(dataset)
			.enter()
			.append('g')
				.attr('class', 'cauti')
		cauti.append('svg:path')
			.attr('transform', function(d,i){ return 'translate('
						+ (scale(d.cauti_ratio)+5) + ','
					  + (i * 20 + pad) + ')';})
			.attr('d', d3.svg.symbol().type('square'))
			.attr('fill','lightgrey')
		.append('title')
			.text(function(d) {
				return "CAUTI score: " + d.cauti_ratio;
			});

		// SSI:Colon symbols
		var ssicol = svg.selectAll('g.sicol')
			.data(dataset)
			.enter()
			.append('svg:g')
				.attr('class', 'ssicol');
		ssicol.append('svg:path')
			.attr('transform', function(d,i){ return 'translate('
						+ (scale(d.ssicolon_ratio)+5) + ','
					  + (i * 20 + pad) + ')';})
			.attr('d', d3.svg.symbol().type('triangle-up'))
			.attr('fill','lightgrey')
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
