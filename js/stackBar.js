function stackBar() {

	// set the dimensions and margins of the graph
	const margin = { top: 10, right: 30, bottom: 20, left: 50 },
		width = ((window.screen.width - 500) / 5 * 3),
		height = 700 - margin.top - margin.bottom;

	// append the svg object to the body of the page
	const svg_bar = d3.select("#stackBar")
		.append("svg")
		.attr("width", "100%")
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);



	function show_radar(data, choosecolor) {

		// const color = d3.scaleOrdinal()
		// 		.range(["#EDC951","#CC333F","#00A0B0"]);
		const radarChartOptions = {
			margin: margin,
			maxValue: 0.5,
			levels: 5,
			roundStrokes: true,
		};
		//Call function to draw the Radar chart
		RadarChart("#radarChart", data, radarChartOptions,choosecolor);
	}

	//show_radar()
	// const svg_radar = d3.select('#my_dataviz')
	//   .append('svg')
	//     .attr("width", width + margin.left + margin.right)
	//     .attr("height", height + margin.top + margin.bottom)
	//   .append("g")
	//     .attr("transform", `translate(${width},${margin.top})`);


	// Parse the Data
	d3.csv("https://raw.githubusercontent.com/zihong518/data_visualization/master/data.csv").then(function (data) {

		data = data.filter(ele => ele.country && ele.listed_in && ele.type === 'Movie')

		data.forEach(function (element){
			element.listed_in = element.listed_in
        .split(', ')
        .map((d) => d.replaceAll(' ', '_').replaceAll('&', 'and'))
        .join(', ')
      element.country = element.country
        .split(', ')
        .map((d) => d.replaceAll(' ', '_'))
        .join(', ')
		});

		// List of subgroups = header of the csv files = soil condition here

		let countrys_all = [];
		let genres_all = [];

		for (const d of data) {

			// country
			for (const c of d.country.split(', ')) {
				if (!countrys_all.includes(c) && c) {
					countrys_all.push(c);
				}
			}

			// genre
			for (const g of d.listed_in.split(', ')) {
				if (!genres_all.includes(g) && g) {
					genres_all.push(g);
				}
			}
		}

		function prepare_data(countrys, genres) {
			let new_data = [];
			for (const g of genres) {
				// init
				let x = {}
				x.genre = g;
				for (const c of countrys) {
					x[c] = 0;
				}
				for (const d of data) {
					for (const gg of d.listed_in.split(', ')) {
						if (gg === g) {
							for (const cc of d.country.split(', ')) {
								x[cc] += 1
							}
						}
					}
				}
				new_data.push(x);
			}
			return [new_data, countrys, genres]
		}

		const color = d3.scaleOrdinal()
			.domain(countrys_all)
			.range(countrys_all.map((d,i) => d3.hsl(360/countrys_all.length * i, 0.75, 0.75)))
		// show country options
		d3.select('#select_countrys')
			.selectAll('option')
			.data(countrys_all)
			.join('option')
			.attr('class', 'genre_para')
			.text((d) => d)


		// show genre options
		d3.select('#select_genres')
			.selectAll('option')
			.data(genres_all)
			.join('option')
			.attr('class', 'genre_para')
			.text((d) => d)

		// show default genres
		const default_genres = ['Dramas', 'Documentaries', 'Comedies']
		const genre_selected_block = d3.select('#selected_genres')
			.selectAll('div')
			.data(default_genres)
			.join('div')
			.attr('class', d => d + ' relative')
			.attr('data-genre', d => d)

		genre_selected_block
			.append('p')
			.attr('class', 'py-1 px-2 rounded-lg border-2 border-gray-300 bg-gray-100 mx-2')
			.text(d => d)

		genre_selected_block
			.append('button')
			.attr('class', d => d + ' absolute top-[-7px] right-[-2px] rounded-full w-5 text-xs h-5 text-center text-white bg-red-300 hover:bg-red-500 hover:duration-150 transition border-2 border-white font-sans	')
			.text('X')
			.attr('id', d => d)
			.on('click', removeStackedBar)

		// show default countrys
		const default_countrys = ['Taiwan', 'South_Korea', 'Japan']
		let country_selected_block = d3.select('#stackBar_filter #selected_countrys')
			.selectAll('div')
			.data(default_countrys)
			.join('div')
			.attr('class', d => d + ' relative')
			.attr('data-country', d => d)


		country_selected_block
			.append('p')
			.style('background-color', d => color(d))
			.attr('class', 'py-1 px-2 rounded-lg border-2 border-gray-300 bg-gray-100 mx-2')
			.text(d => d)

		country_selected_block
			.append('button')
			.attr('class', d => d + ' absolute top-[-7px] right-[-2px] rounded-full w-5 text-xs h-5 text-center text-white bg-red-300 hover:bg-red-500 hover:duration-150 transition border-2 border-white font-sans	')
			.text('X')
			.attr('id', d => d)
			.on('click', removeStackedBar)


		// Add X axis
		let x = d3.scaleBand()
			//.domain(default_genres)
			.range([0, width])
			.padding([0.2])

		let xAxis = svg_bar.append("g")
			.attr("transform", `translate(0, ${height})`)
			.attr('class', 'bar_Xaxis')
			.call(d3.axisBottom(x).tickSizeOuter(0));


		// Add Y axis
		let y = d3.scaleLinear()
			//.domain([0, 150]) // 懶得找max，直接寫死，可能會根據default值改動而不同
			.range([height, 0]);

		let yAxis = svg_bar.append("g")
			.attr('class', 'bar_Yaxis')
			.call(d3.axisLeft(y));


		// color palette = one color per subgroup



		const rects = svg_bar.append("g") // space for all rects
		// Show the stadcked bars
		function draw(data) {
			rects
				.selectAll("g.stackBar")
				// Enter in the stack data = loop key per key = group per group
				.data(data)
				.join('g')
				.attr("fill", d => color(d.key))
				.attr("class", d => `stackBar ${d.key}`)
				.on('dblclick', function (event, data) { // double click to show the radar chart
					//console.log(event)

					const key = data.key
					let sum = data.map(d => d.data[key]).reduce((a, b) => a + b)
					data = data.map(d => ({ 'axis': d.data.genre, 'value': d.data[key] / sum }))
					show_radar([data], color(key))
				})
				//.on('dbclick', d => d.map( k => console.log(k)) )
				.selectAll("rect")
				// enter a second time = loop subgroup per subgroup to add all rectangles
				.data(d => d)
				.join("rect")
				.attr("x", d => x(d.data.genre))
				.attr('class', d => 'rect_' + d.data.genre) // 目前沒用到，可改
				.transition()
				.duration(1000)
				.attr("y", d => y(d[1]))
				.attr("height", d => y(d[0]) - y(d[1]))
				.attr("width", x.bandwidth())
		}


		////////////////////////////////
		///  initialize bar chart  ////
		//////////////////////////////
		const [new_data, keys] = prepare_data(default_countrys, default_genres)
		const stackedData = d3.stack().keys(keys)(new_data)

		x.domain(default_genres)
		svg_bar.selectAll("g.bar_Xaxis")
			.transition()
			.duration(1000)
			.call(d3.axisBottom(x));


		// find the max value, ref: http://using-d3js.com/05_06_stacks.html
		y.domain([0, d3.max(stackedData[stackedData.length - 1].map(d => d[1]))])
		//console.log(y.domain())
		svg_bar.selectAll("g.bar_Yaxis")
			.transition()
			.duration(1000)
			.call(d3.axisLeft(y));

		// draw bars
		draw(stackedData)


		// when user modifies country and genre, update the bar
		const update = function (event, d) {
			// true -> country, false -> genre
			const iscountry = d3.select(this).attr('id').includes('country') ? true : false
			const value = d3.select(this).property('value')



			if (iscountry) {
				// show selected country
				let country_selected_block = d3.select('#stackBar_filter #selected_countrys')
					.append('div')
					.attr('class', value + ' relative')
					.attr('data-country', value)

				country_selected_block
					.append('p')
					.style('background-color', color(value))

					.attr('class', 'py-1 px-2 rounded-lg border-2 border-gray-300 bg-gray-100 mx-2')
					.text(value)
				//.on("mouseover", highlight)
				//.on("mouseleave", noHighlight)

				country_selected_block
					.append('button')
					.attr('class', value + ' absolute top-[-7px] right-[-2px] rounded-full w-5 text-xs h-5 text-center text-white bg-red-300 hover:bg-red-500 hover:duration-150 transition border-2 border-white font-sans	')
					.text('X')
					.attr('id', value)
					.on('click', removeStackedBar)
			}

			else {
				// show selected genre
				let genre_selected_block = d3.select('#stackBar_filter #selected_genres')
					.append('div')
					.attr('class', value + ' relative')
					.attr('data-genre', value)


				genre_selected_block
					.append('p')
					.text(value)
					.attr('class', 'py-1 px-2 rounded-lg border-2 border-gray-300 bg-gray-100 mx-2')
				//.on("mouseover", highlight)
				//.on("mouseleave", noHighlight)

				genre_selected_block
					.append('button')
					.attr('class', value + ' absolute top-[-7px] right-[-2px] rounded-full w-5 text-xs h-5 text-center text-white bg-red-300 hover:bg-red-500 hover:duration-150 transition border-2 border-white font-sans	')
					.text('X')
					.attr('id', value)
					.on('click', removeStackedBar)
			}


			// get all currently selected country and genres
			let countrys = [];
			let genres = []
			d3.selectAll('#stackBar_filter div#selected_countrys div').each(function () { countrys.push(d3.select(this).attr('data-country')) })
			d3.selectAll('#stackBar_filter div#selected_genres div').each(function () { genres.push(d3.select(this).attr('data-genre')) })

			// get new data according countrys and genres
			const [new_data, keys] = prepare_data(countrys, genres)

			const stackedData = d3.stack()
				.keys(keys)
				(new_data)


			x.domain(genres)
			xAxis//.selectAll("g.bar_Xaxis")
				.transition()
				.duration(1000)
				.call(d3.axisBottom(x));


			// find the max value, ref: http://using-d3js.com/05_06_stacks.html
			y.domain([0, d3.max(stackedData[stackedData.length - 1].map(d => d[1]))])
			yAxis
				.transition()
				.duration(1000)
				.call(d3.axisLeft(y));

			// draw stacked bars
			draw(stackedData)
		}

		// binding event => when user choose a country
		d3.select('#select_countrys').on('change', update)
		d3.select('#select_genres').on('change', update)

		// remove the bars of deleted country
		function removeStackedBar(event, d) {
			// remove selected para
			const country = d3.select(this).attr('id')

			d3.select('#stackBar_filter div.' + country).remove()

			// get all currently selected country
			let countrys = [];
			let genres = [];
			d3.selectAll('#stackBar_filter div#selected_countrys div').each(function () { countrys.push(d3.select(this).attr('data-country')) })
			d3.selectAll('#stackBar_filter div#selected_genres div').each(function () { genres.push(d3.select(this).attr('data-genre')) })


			const [new_data, keys] = prepare_data(countrys, genres)
			const stackedData = d3.stack()
				.keys(countrys)
				(new_data)

			x.domain(genres)
			xAxis//.selectAll("g.bar_Xaxis")
				.transition()
				.duration(1000)
				.call(d3.axisBottom(x));


			// find the max value, ref: http://using-d3js.com/05_06_stacks.html
			y.domain([0, d3.max(stackedData[stackedData.length - 1].map(d => d[1]))])
			yAxis
				.transition()
				.duration(1000)
				.call(d3.axisLeft(y));

			draw(stackedData)

		}

	})

}