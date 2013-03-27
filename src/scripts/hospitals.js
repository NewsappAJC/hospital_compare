$(function() {
	d3.csv("data/hospitals.csv", function(data) {
		drawDotChart(data);
		window.dataset = data
	});

	function drawDotChart(dataset) {
		var w = 750,
		    h = 400,
		    pad = 50,
		    left_pad = 225;

		var max = Math.max( 
			d3.max(dataset, function(d) {return parseFloat(d.clabsi_ratio);}),
			d3.max(dataset, function(d) {return parseFloat(d.cauti_ratio);}),
			d3.max(dataset, function(d) {return parseFloat(d.ssicolon_ratio);})
		);
		var min = 0;
		var scale = d3.scale.linear()
			.domain([0,Math.ceil(max)])
			.range([225, w-10]);

		var svg = d3.select('#hospitals')
			.append('svg')
				.attr('width', w)
				.attr('height', h);

		// Horizontal grib bars
		var hgrid_green = svg.selectAll('rect')
			.data(dataset)
			.enter().append('rect')
			.attr('x', left_pad)
			.attr('y', function(d,i){
					return i * 20 + pad - 8;
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
					return i * 20 + pad - 8;
				})
			.attr('fill', '#F8E0E0')
			.attr('width', scale(5) - scale(1) + left_pad + 2)
			.attr('height', 16);

		// CLABSI symbols
		svg.selectAll('path')
			.data(dataset)
			.enter().append('svg:path')
				.attr('transform', function(d,i){ return 'translate('
							+ (scale(d.clabsi_ratio)+5) + ','
						  + (i * 20 + pad) + ')';})
				.attr('d', d3.svg.symbol().type('circle'))
				.attr('fill','#0101DF')
			.append('title')
				.text(function(d) {
					return "CLABSI score: " + d.clabsi_ratio;
				});


		// CAUTI symbols
		var cauti = svg.selectAll('g.cauti')
			.data(dataset)
			.enter()
			.append('svg:g')
				.attr('class', 'cauti')
		cauti.append('svg:path')
			.attr('transform', function(d,i){ return 'translate('
						+ (scale(d.cauti_ratio)+5) + ','
					  + (i * 20 + pad) + ')';})
			.attr('d', d3.svg.symbol().type('square'))
			.attr('fill','#5882FA')
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
			.attr('fill','#5882FA')
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
			.attr('transform', 'translate(0,' + (dataset.length * 20 + pad) + ')')
			.call(xAxis);
	}
});
