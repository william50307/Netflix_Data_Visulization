function time_slider(filter_id, min, update){

	// create time slider
	const sliderRange = d3.sliderBottom()
		//.min(d3.min(dateList))
		.min(min)
		.max(d3.timeParse("%Y")('2021'))
		//.step(1000 * 60 * 60 * 24 * 366) // not 365 
		.step(1)
		.width(800)
		.tickFormat(d3.timeFormat('%Y'))
		.default([min, d3.timeParse("%Y")('2021')])
		.displayValue(false)
		.fill('#2196f3')
		.on('onchange', function(val){
			d3.select(`#${filter_id} #time_min`).text(d3.timeFormat('%Y-%B')(val[0]));
			d3.select(`#${filter_id} #time_max`).text(d3.timeFormat('%Y-%B')(val[1]));
			update()
		});

	// draw time slider
	d3.select(`#${filter_id} #slider`)
	.append('svg')
	.attr('width', 1000)
	.attr('height', 100)
	.append('g')
	.attr('transform', 'translate(30,30)')
	.attr('class', 'time_slider')
	.call(sliderRange)

	return;
}

function duration_slider(filter_id, min, max, update){

	// create time slider
	const sliderRange = d3.sliderBottom()
		//.min(d3.min(dateList))
		.min(min)
		.max(max)
		//.step(1000 * 60 * 60 * 24 * 366) // not 365 
		.step(1)
		.width(800)
		//.tickFormat(d3.timeFormat('%Y'))
		.default([min, max])
		.displayValue(false)
		.fill('#2196f3')
		.on('onchange', function(val){
			d3.select(`#${filter_id} #duration_min`).text(val[0]);
			d3.select(`#${filter_id} #duration_max`).text(val[1]);
			update()
		});

	// draw time slider
	d3.select(`#${filter_id} #duration`)
	.append('svg')
	.attr('width', 1000)
	.attr('height', 100)
	.append('g')
	.attr('transform', 'translate(30,30)')
	.attr('class', 'duration_slider')
	.call(sliderRange)

	return;
}

function averageRating_slider(filter_id, update){
	// create time slider
	const sliderRange = d3.sliderBottom()
		//.min(d3.min(dateList))
		.min(0)
		.max(10)
		.step(0.1)
		.width(800)
		//.tickFormat(d3.timeFormat('%Y'))
		.default([0, 10])
		.displayValue(false)
		.fill('#2196f3')
		.on('onchange', function(val){
			d3.select(`${filter_id} #averageRating_min`).text(d3.format('.1f')(val[0]));
			d3.select(`${filter_id} #averageRating_max`).text(d3.format('.1f')(val[1]));
			update()
		});

	// slider
	d3.select(`#${filter_id} #averageRating`)
	.append('svg')
	.attr('width', 1000)
	.attr('height', 100)
	// .tickFormat()
	.append('g')
	.attr('transform', 'translate(30,30)')
	.attr('class', 'averageRating_slider')
	.call(sliderRange)

	return;
}


function numVotes_slider(filter_id, min, max, update){
	// create time slider
	const sliderRange = d3.sliderBottom()
		//.min(d3.min(dateList))
		.min(0)
		.max(max)
		.step(10000)
		.width(800)
		//.tickFormat(d3.timeFormat('%Y'))
		.default([0, max])
		//.displayValue(false)
		.fill('#2196f3')
		.on('onchange', function(val){
			let c = d3.format(',')
			d3.select(`#${filter_id} #numVotes_min`).text(c(val[0]));
			d3.select(`#${filter_id} #numVotes_max`).text(c(val[1]));
			update()
		});

	// slider
	d3.select(`#${filter_id} #numVotes`)
	.append('svg')
	.attr('width', 1000)
	.attr('height', 100)
	// .tickFormat()
	.append('g')
	.attr('transform', 'translate(30,30)')
	.attr('class', 'numVotes_slider')
	.call(sliderRange)

	return;
}
	