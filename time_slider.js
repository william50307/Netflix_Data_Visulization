function time_slider(min_time, update){

	// create time slider
	const sliderRange = d3.sliderBottom()
		//.min(d3.min(dateList))
		.min(min_time)
		.max(d3.timeParse("%Y")('2021'))
		//.step(1000 * 60 * 60 * 24 * 366) // not 365 
		.step(1)
		.width(800)
		.tickFormat(d3.timeFormat('%Y'))
		.default([min_time, d3.timeParse("%Y")('2021')])
		.displayValue(false)
		.fill('#2196f3')
		.on('onchange', function(val){
			d3.select('#time_min').text(d3.timeFormat('%Y-%B')(val[0]));
			d3.select('#time_max').text(d3.timeFormat('%Y-%B')(val[1]));
			update()
		});

	// draw time slider
	d3.select('#slider')
	.append('svg')
	.attr('width', 1000)
	.attr('height', 100)
	.append('g')
	.attr('transform', 'translate(30,30)')
	.attr('class', 'time_slider')
	.call(sliderRange)

	return;
}

function duration_slider(min_duration, max_duration, update){

	// create time slider
	const sliderRange = d3.sliderBottom()
		//.min(d3.min(dateList))
		.min(min_duration)
		.max(max_duration)
		//.step(1000 * 60 * 60 * 24 * 366) // not 365 
		.step(1)
		.width(800)
		//.tickFormat(d3.timeFormat('%Y'))
		.default([min_duration, max_duration])
		.displayValue(false)
		.fill('#2196f3')
		.on('onchange', function(val){
			d3.select('#duration_min').text(val[0]);
			d3.select('#duration_max').text(val[1]);
			update()
		});

	// draw time slider
	d3.select('#duration')
	.append('svg')
	.attr('width', 1000)
	.attr('height', 100)
	.append('g')
	.attr('transform', 'translate(30,30)')
	.attr('class', 'duration_slider')
	.call(sliderRange)

	return;
}

	