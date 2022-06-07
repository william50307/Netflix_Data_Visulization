// function time_slider(filter_id, min, update){

// 	// create time slider
// 	const sliderRange = d3.sliderBottom()
// 		//.min(d3.min(dateList))
// 		.min(min)
// 		.max(d3.timeParse("%Y")('2021'))
// 		//.step(1000 * 60 * 60 * 24 * 366) // not 365 
// 		.step(1)
// 		.width(800)
// 		.tickFormat(d3.timeFormat('%Y'))
// 		.default([min, d3.timeParse("%Y")('2021')])
// 		.displayValue(false)
// 		.fill('#2196f3')
// 		.on('onchange', function(val){
// 			d3.select(`#${filter_id} #time_min`).text(d3.timeFormat('%Y-%B')(val[0]));
// 			d3.select(`#${filter_id} #time_max`).text(d3.timeFormat('%Y-%B')(val[1]));
// 			update()
// 		});

// 	// draw time slider
// 	d3.select(`#${filter_id} #slider`)
// 	.append('svg')
// 	.attr('width', 1000)
// 	.attr('height', 100)
// 	.append('g')
// 	.attr('transform', 'translate(30,30)')
// 	.attr('class', 'time_slider')
// 	.call(sliderRange)

// 	return;
// }

class Time_Histogram_Slider{
	constructor(filter_id, min, data){
		this.filter_id = filter_id
		this.min = min
		this.max = '2021'
		this.data = data
		this.margin = { top : 10, right: 10, bottom: 45, left: 10 }
		this.width = 1000 - this.margin.left - this.margin.right
		this.height = 150 - this.margin.top - this.margin.bottom

	}

	create(update){
		//d3.select(`#${this.filter_id} #date_added svg`).remove()

		// bottom space for slider

		this.x = d3.scaleLinear()
			.domain([0, d3.max(this.data)]) 
			.range([0, this.width])

		this.distribustion_slider = d3
			.select(`#${this.filter_id} #date_added`)
			.append('svg')
				.attr('width', this.width + this.margin.left + this.margin.right)
				.attr('height', this.height + this.margin.top + this.margin.bottom)
			.append('g')
			.attr('transform', `translate(${this.margin.left},${this.margin.top})`)

		this.histogram = d3.histogram()
			.value( d => d)   // I need to give the vector of value
			.domain(this.x.domain())  // then the domain of the graphic
			.thresholds(this.x.ticks(100)); // then the numbers of bins
		this.bins = this.histogram(this.data);

		this.y = d3.scaleLinear()
			.range([this.height, 0])
			.domain([0, d3.max(this.bins, d => d.length )])
			
		// draw y axis
		this.yAxis = this.distribustion_slider.append('g').call(d3.axisRight(this.y).ticks(3));

		// draw histgram rects 
		this.distribustion_slider
			.selectAll('rect')
			.data(this.bins)
			.join('rect')
			.attr('x', d => this.x(d.x0) )
			.attr('y', d => this.y(d.length))
					.attr("width", d => this.x(d.x1) - this.x(d.x0))
					.attr("height", d => this.height - this.y(d.length) )
					.style("fill", "#69b3a2")
					.style('stroke', 'white')
					.style('stroke-width', '0.5px')

		// create time slider
		this.sliderRange = d3.sliderBottom()
			.min(this.min)
			.max(d3.timeParse("%Y")(this.max))
			//.step(1000 * 60 * 60 * 24 * 366) // not 365 
			.step(1)
			.width(this.width)
			.tickFormat(d3.timeFormat('%Y'))
			.default([this.min, d3.timeParse("%Y")(this.max)])
			.displayValue(false)
			.fill('#2196f3')
			.on('onchange', function(val){
				d3.select(`#${this.filter_id} #time_min`).text(d3.timeFormat('%Y-%B')(val[0]));
				d3.select(`#${this.filter_id} #time_max`).text(d3.timeFormat('%Y-%B')(val[1]));
				update()
		});

		// draw time slider
		this.distribustion_slider
			.append('g')
			.attr('transform', `translate(0,${this.height + 2})`)
			.attr('class', 'date_added_slider')
			.call(this.sliderRange)
	
		return;
	}

	update_histogram(data){
		
		const histogram = d3.histogram()
			.value( d => d)   // I need to give the vector of value
			.domain(this.x.domain())  // then the domain of the graphic
			.thresholds(this.x.ticks(100)); // then the numbers of bins
		const bins = histogram(data);

		// we have to ignore condition when data is empty, due to some misery bug :(  
		if(data.length !== 0){
			this.y.domain([0, d3.max(bins, d => d.length)])
			this.yAxis.call(d3.axisRight(this.y).ticks(2));
		}

		// redraw histgram rects 
		this.distribustion_slider
		.selectAll('rect') 
		.data(bins)
		.join('rect')
		.attr('x', d => this.x(d.x0) )
		.attr('y', d => this.y(d.length))
				.attr("width", d => this.x(d.x1) - this.x(d.x0))
				.attr("height", d => this.height - this.y(d.length) )
				.style("fill", "#69b3a2")
				.style('stroke', 'white')
				.style('stroke-width', '0.5px')

			
		// draw time slider
		//d3.select(`#${this.filter_id} g.duration_slider`).remove()
		// this.distribustion_slider
		// .append('g')
		// .attr('transform', `translate(0,${this.height + 2})`)
		// .attr('class', 'duration_slider')
		// .call(this.sliderRange)
	}
}



class Duration_Histogram_Slider{
	constructor(filter_id, min, max, data){
		this.filter_id =filter_id
		this.min = min
		this.max = max
		this.data = data
		this.margin = { top : 10, right: 10, bottom: 45, left: 10 }
		this.width = 1000 - this.margin.left - this.margin.right
		this.height = 150 - this.margin.top - this.margin.bottom

	}

	create(update){
		//d3.select(`#${this.filter_id} #duration svg`).remove()

		// bottom space for slider
		this.x = d3.scaleLinear()
			.domain([0, d3.max(this.data)]) 
			.range([0, this.width])

		this.distribustion_slider = d3
			.select(`#${this.filter_id} #duration`)
			.append('svg')
				.attr('width', this.width + this.margin.left + this.margin.right)
				.attr('height', this.height + this.margin.top + this.margin.bottom)
			.append('g')
			.attr('transform', `translate(${this.margin.left},${this.margin.top})`)

		this.histogram = d3.histogram()
			.value( d => d)   // I need to give the vector of value
			.domain(this.x.domain())  // then the domain of the graphic
			.thresholds(this.x.ticks(100)); // then the numbers of bins
		this.bins = this.histogram(this.data);

		this.y = d3.scaleLinear()
			.range([this.height, 0])
			.domain([0, d3.max(this.bins, d => d.length )])
			
		// draw y axis
		this.yAxis = this.distribustion_slider.append('g').call(d3.axisRight(this.y).ticks(3));

		// draw histgram rects 
		this.distribustion_slider
			.selectAll('rect')
			.data(this.bins)
			.join('rect')
			.attr('x', d => this.x(d.x0) )
			.attr('y', d => this.y(d.length))
					.attr("width", d => this.x(d.x1) - this.x(d.x0))
					.attr("height", d => this.height - this.y(d.length) )
					.style("fill", "#69b3a2")
					.style('stroke', 'white')
					.style('stroke-width', '0.5px')

		// create time slider
		this.sliderRange = d3.sliderBottom()
			.min(this.min)
			.max(this.max)
			.step(1)
			.width(this.width)
			.default([this.min, this.max])
			.displayValue(false)
			.fill('#2196f3')
			.on('onchange', function(val){
				d3.select(`#${this.filter_id} #duration_min`).text(val[0]);
				d3.select(`#${this.filter_id} #duration_max`).text(val[1]);
				update()
			});

		// draw time slider
		this.distribustion_slider
			.append('g')
			.attr('transform', `translate(0,${this.height + 2})`)
			.attr('class', 'duration_slider')
			.call(this.sliderRange)
	
		return;
	}

	update_histogram(data){
		
		const histogram = d3.histogram()
			.value( d => d)   // I need to give the vector of value
			.domain(this.x.domain())  // then the domain of the graphic
			.thresholds(this.x.ticks(100)); // then the numbers of bins
		const bins = histogram(data);

		// we have to ignore condition when data is empty, due to some misery bug :(  
		if(data.length !== 0){
			this.y.domain([0, d3.max(bins, d => d.length)])
			this.yAxis.call(d3.axisRight(this.y).ticks(2));
		}

		// redraw histgram rects 
		this.distribustion_slider
		.selectAll('rect') 
		.data(bins)
		.join('rect')
		.attr('x', d => this.x(d.x0) )
		.attr('y', d => this.y(d.length))
				.attr("width", d => this.x(d.x1) - this.x(d.x0))
				.attr("height", d => this.height - this.y(d.length) )
				.style("fill", "#69b3a2")
				.style('stroke', 'white')
				.style('stroke-width', '0.5px')

			
		// draw time slider
		//d3.select(`#${this.filter_id} g.duration_slider`).remove()
		// this.distribustion_slider
		// .append('g')
		// .attr('transform', `translate(0,${this.height + 2})`)
		// .attr('class', 'duration_slider')
		// .call(this.sliderRange)
	}
}

// function duration_slider(filter_id, min, max, update, data){
// 	// clean the previous one
// 	d3.select(`#${filter_id} #duration svg`).remove()

// 	// bottom space for slider
//   const margin = { top : 10, right: 10, bottom: 45, left: 10 };
// 	const width = 1000 - margin.left - margin.right
//   const height = 150 - margin.top - margin.bottom

// 	const distribustion_slider = d3
// 		.select(`#${filter_id} #duration`)
// 		.append('svg')
// 			.attr('width', width + margin.left + margin.right)
// 			.attr('height', height + margin.top + margin.bottom)
// 		.append('g')
// 		.attr('transform', `translate(${margin.left},${margin.top})`)


// 	const x = d3.scaleLinear()
// 		.domain([0, d3.max(data)]) 
// 		.range([0, width])

// 	const histogram = d3.histogram()
// 		.value( d => d)   // I need to give the vector of value
// 		.domain(x.domain())  // then the domain of the graphic
// 		.thresholds(x.ticks(100)); // then the numbers of bins
// 	const bins = histogram(data);

// 	const y = d3.scaleLinear()
// 		.range([height, 0])
// 		.domain([0, d3.max(bins, d => d.length )])
		
// 	// draw y axis
// 	//distribustion_slider.call(d3.axisRight(y).ticks(3));

// 	// draw histgram rects 
// 	distribustion_slider
// 		.selectAll('rect')
// 		.data(bins)
// 		.join('rect')
// 		.attr('x', d => x(d.x0) )
// 		.attr('y', d => y(d.length))
//         .attr("width", d => x(d.x1) - x(d.x0))
//         .attr("height", d => height - y(d.length) )
// 				.style("fill", "#69b3a2")
// 				.style('stroke', 'white')
// 				.style('stroke-width', '0.5px')


// 	// create time slider
// 	const sliderRange = d3.sliderBottom()
// 		.min(min)
// 		.max(max)
// 		.step(1)
// 		.width(width)
// 		.default([min, max])
// 		.displayValue(false)
// 		.fill('#2196f3')
// 		.on('onchange', function(val){
// 			d3.select(`#${filter_id} #duration_min`).text(val[0]);
// 			d3.select(`#${filter_id} #duration_max`).text(val[1]);
// 			update()
// 		});

// 	// draw time slider
// 	distribustion_slider
// 		.append('g')
// 		.attr('transform', `translate(0,${height + 2})`)
// 		.attr('class', 'duration_slider')
// 		.call(sliderRange)

// 	return;
// }

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

class AverageRating_Histogram_Slider{
	constructor(filter_id, data){
		this.filter_id = filter_id
		this.min = 0
		this.max = 10
		this.data = data
		this.margin = { top : 10, right: 10, bottom: 45, left: 10 }
		this.width = 1000 - this.margin.left - this.margin.right
		this.height = 150 - this.margin.top - this.margin.bottom
	}

	create(update){
		//d3.select(`#${this.filter_id} #duration svg`).remove()

		// bottom space for slider
		this.x = d3.scaleLinear()
			.domain([0, d3.max(this.data)]) 
			.range([0, this.width])

		this.slider_svg = d3
			.select(`#${this.filter_id} #averageRating`)
			.append('svg')
				.attr('width', this.width + this.margin.left + this.margin.right)
				.attr('height', this.height + this.margin.top + this.margin.bottom)
			.append('g')
			.attr('transform', `translate(${this.margin.left},${this.margin.top})`)

		this.histogram = d3.histogram()
			.value( d => d)   // I need to give the vector of value
			.domain(this.x.domain())  // then the domain of the graphic
			.thresholds(this.x.ticks(100)); // then the numbers of bins
		this.bins = this.histogram(this.data);

		this.y = d3.scaleLinear()
			.range([this.height, 0])
			.domain([0, d3.max(this.bins, d => d.length )])
			
		// draw y axis
		this.yAxis = this.slider_svg.append('g').call(d3.axisRight(this.y).ticks(3));

		// draw histgram rects 
		this.slider_svg
			.selectAll('rect')
			.data(this.bins)
			.join('rect')
			.attr('x', d => this.x(d.x0) )
			.attr('y', d => this.y(d.length))
					.attr("width", d => this.x(d.x1) - this.x(d.x0))
					.attr("height", d => this.height - this.y(d.length) )
					.style("fill", "#69b3a2")
					.style('stroke', 'white')
					.style('stroke-width', '0.5px')

		// create time slider
		this.sliderRange = d3.sliderBottom()
			//.min(d3.min(dateList))
			.min(0)
			.max(10)
			.step(0.1)
			.width(this.width)
			//.tickFormat(d3.timeFormat('%Y'))
			.default([0, 10])
			.displayValue(false)
			.fill('#2196f3')
			.on('onchange', function(val){
				d3.select(`${this.filter_id} #averageRating_min`).text(d3.format('.1f')(val[0]));
				d3.select(`${this.filter_id} #averageRating_max`).text(d3.format('.1f')(val[1]));
				update()
			});

		// draw time slider
		this.slider_svg
			.append('g')
			.attr('transform', `translate(0,${this.height + 2})`)
			.attr('class', 'averageRating_slider')
			.call(this.sliderRange)
	
		return;
	}

	update_histogram(data){
		
		const histogram = d3.histogram()
			.value( d => d)   // I need to give the vector of value
			.domain(this.x.domain())  // then the domain of the graphic
			.thresholds(this.x.ticks(100)); // then the numbers of bins
		const bins = histogram(data);

		// we have to ignore condition when data is empty, due to some misery bug :(  
		if(data.length !== 0){
			this.y.domain([0, d3.max(bins, d => d.length)])
			this.yAxis.call(d3.axisRight(this.y).ticks(2));
		}

		// redraw histgram rects 
		this.slider_svg
		.selectAll('rect') 
		.data(bins)
		.join('rect')
		.attr('x', d => this.x(d.x0) )
		.attr('y', d => this.y(d.length))
				.attr("width", d => this.x(d.x1) - this.x(d.x0))
				.attr("height", d => this.height - this.y(d.length) )
				.style("fill", "#69b3a2")
				.style('stroke', 'white')
				.style('stroke-width', '0.5px')

			
		// draw time slider
		//d3.select(`#${this.filter_id} g.duration_slider`).remove()
		// this.distribustion_slider
		// .append('g')
		// .attr('transform', `translate(0,${this.height + 2})`)
		// .attr('class', 'duration_slider')
		// .call(this.sliderRange)
	}
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


class numVotes_Histogram_Slider{
	constructor(filter_id, max, data){
		this.filter_id = filter_id
		this.min = 0
		this.max = max
		this.data = data
		this.margin = { top : 10, right: 10, bottom: 45, left: 10 }
		this.width = 1000 - this.margin.left - this.margin.right
		this.height = 150 - this.margin.top - this.margin.bottom
	}

	create(update){
		//d3.select(`#${this.filter_id} #duration svg`).remove()

		// bottom space for slider
		this.x = d3.scaleLinear()
			.domain([0, d3.max(this.data)]) 
			.range([0, this.width])

		this.slider_svg = d3
			.select(`#${this.filter_id} #numVotes`)
			.append('svg')
				.attr('width', this.width + this.margin.left + this.margin.right)
				.attr('height', this.height + this.margin.top + this.margin.bottom)
			.append('g')
			.attr('transform', `translate(${this.margin.left},${this.margin.top})`)

		this.histogram = d3.histogram()
			.value( d => d)   // I need to give the vector of value
			.domain(this.x.domain())  // then the domain of the graphic
			.thresholds(this.x.ticks(100)); // then the numbers of bins
		this.bins = this.histogram(this.data);

		this.y = d3.scaleLinear()
			.range([this.height, 0])
			.domain([0, d3.max(this.bins, d => d.length )])
			
		// draw y axis
		this.yAxis = this.slider_svg.append('g').call(d3.axisRight(this.y).ticks(3));

		// draw histgram rects 
		this.slider_svg
			.selectAll('rect')
			.data(this.bins)
			.join('rect')
			.attr('x', d => this.x(d.x0) )
			.attr('y', d => this.y(d.length))
					.attr("width", d => this.x(d.x1) - this.x(d.x0))
					.attr("height", d => this.height - this.y(d.length) )
					.style("fill", "#69b3a2")
					.style('stroke', 'white')
					.style('stroke-width', '0.5px')

		// create time slider
		this.sliderRange = d3.sliderBottom()
			//.min(d3.min(dateList))
			.min(0)
			.max(this.max)
			.step(0.1)
			.width(this.width)
			//.tickFormat(d3.timeFormat('%Y'))
			.default([0, this.max])
			.displayValue(false)
			.fill('#2196f3')
			.on('onchange', function(val){
				d3.select(`#${this.filter_id} #numVotes_min`).text(d3.format('.1f')(val[0]));
				d3.select(`#${this.filter_id} #numVotes_max`).text(d3.format('.1f')(val[1]));
				update()
			});

		// draw time slider
		this.slider_svg
			.append('g')
			.attr('transform', `translate(0,${this.height + 2})`)
			.attr('class', 'numVotes_slider')
			.call(this.sliderRange)
	
		return;
	}

	update_histogram(data){
		
		const histogram = d3.histogram()
			.value( d => d)   // I need to give the vector of value
			.domain(this.x.domain())  // then the domain of the graphic
			.thresholds(this.x.ticks(100)); // then the numbers of bins
		const bins = histogram(data);

		// we have to ignore condition when data is empty, due to some misery bug :(  
		if(data.length !== 0){
			this.y.domain([0, d3.max(bins, d => d.length)])
			this.yAxis.call(d3.axisRight(this.y).ticks(2));
		}

		// redraw histgram rects 
		this.slider_svg
		.selectAll('rect') 
		.data(bins)
		.join('rect')
		.attr('x', d => this.x(d.x0) )
		.attr('y', d => this.y(d.length))
				.attr("width", d => this.x(d.x1) - this.x(d.x0))
				.attr("height", d => this.height - this.y(d.length) )
				.style("fill", "#69b3a2")
				.style('stroke', 'white')
				.style('stroke-width', '0.5px')

			
		// draw time slider
		//d3.select(`#${this.filter_id} g.duration_slider`).remove()
		// this.distribustion_slider
		// .append('g')
		// .attr('transform', `translate(0,${this.height + 2})`)
		// .attr('class', 'duration_slider')
		// .call(this.sliderRange)
	}
}
