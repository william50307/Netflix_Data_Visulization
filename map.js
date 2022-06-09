function map() {
	const margin = { top: 40, right: 30, bottom: 60, left: 30 },
		width = 1500 - margin.left - margin.right,
		height = 700 - margin.top - margin.bottom;
	// The svg
	const svg = d3.select("#map_dataviz")
		.append("svg")
		.attr("width",'100%')
		.attr("height", height + margin.top + margin.bottom)
		.style('class','mx-auto')


	// Map and projection
	const path = d3.geoPath();
	const projection = d3.geoMercator()
		.scale(140)
		.translate([width / 2, height / 1.4]);
	// Data and color scale
	//const data = new Map();
	const g = svg.append("g");
	const colorScale = d3.scaleSequential().domain([0, 10]).interpolator(d3.interpolateReds);

	// Load external data and boot
	Promise.all([
		d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
		d3.csv("country_genre.csv")]).then(function (loadData) {

			//convert to numeric data
			loadData[1].forEach(d => {
				d.averageRating = +d.averageRating
				d.numVotes = + d.numVotes
			});
			const data = loadData[1];
			const dataMap = d3.group(loadData[1], d => d.genre, d => d.country)

			let topo = loadData[0]

			let genres = []
			data.map(function (d) {
				if (!genres.includes(d.genre)) {
					genres.push(d.genre)
				}
			})


			// show genre options, and binding event
			d3.select('#map_filter #map_select_genres')
				.on('change', add_genre)
				.selectAll('option')
				.data(genres)
				.join('option')
				.attr('class', 'genre_para')
				.text((d) => d)

			// binding event on radio
			d3.selectAll('div#map_filter div#variable input').on('change', update)

			//////// 根據html的設計修改 /////
			function add_genre(event, d) {
				// get genre 
				const genre = d3.select(this).property('value')

				// remove previous one
				d3.select('#map_filter #map_selected_genres p').remove()

				// append new element
				d3.select('#map_filter #map_selected_genres')
					.append('p')
					.text(genre)

				// update the map
				update()
			}

			// 滑動到該國家時顯示的資訊欄
			const tooltip = d3.select("#map_dataviz") //set tooltip
				.append("div")
				.style("opacity", 0)
				.attr("class", "tooltips")
				.style("background-color", "white")
				.style("border", "solid")
				.style("border-width", "1px")
				.style("border-radius", "5px")
				.style("padding", "10px")
				.style("position", "absolute")

			const showTooltip = function (event, d) {
				console.log(tooltip);
				d3.selectAll(".country") //show the tooltip
					.transition()
					.duration(200)
					.style("opacity", .5)
				d3.select(this)
					.transition()
					.duration(200)
					.style("opacity", 1)
					.style("stroke", "black")

				tooltip //display the remark 
					.transition()
					.duration(200)
				tooltip
					.style("opacity", 1)
					.html(`${d.properties.name}'s ${d.variable} number in ${d.genre} is ${d3.format('.2f')(d.temp)}`)
					.style("left", (event.x) / 2 + 100 + "px") //set the position tooltip will show
					.style("top", (event.y) / 2  + "px")
			}
			const moveTooltip = function (event, d) {
				tooltip
					.style("left", (event.x)- 100 + "px")
					.style("top", (event.y) - 50 + "px")
			}
			const hideTooltip = function (event, d) {
				d3.selectAll(".country")
					.transition()
					.duration(200)
					.style("opacity", .8)
				// d3.select(this)
				//   .transition()
				//   .duration(200)
				//   .style("stroke", "transparent")
				tooltip
					// .transition()
					// .duration(200)
					.style("opacity", 0)
			}

			function update() {
				// averageRating or numVotes
				const variable = d3.select("div#map_filter input[name='variable']:checked").property('value')
				// selected genre
				const genre = d3.select('#map_filter #map_selected_genres p').text()

				let objs = [...dataMap.get(genre).values()].map(d => d[0]) // 每個country, genre的配對只會有一筆資料，因此取[0]
				colorScale.domain([0, d3.max(objs.map(d => d[variable]))])

				//COLOR legend
				let a = Legend(d3.scaleSequential(colorScale.domain(), d3.interpolateReds))
				d3.select('div#colorScale svg').remove()
				d3.select('div#colorScale').node().appendChild(a)


				g.selectAll("path")
					.data(topo.features)
					.join('path')
					// draw each country
					.attr("d", d3.geoPath()
						.projection(projection)
					)
					// set the color of each country
					.attr("fill", function (d) {
						d.genre = genre
						d.variable = variable

						if (dataMap.get(genre).get(d.properties.name) !== undefined) {
							//新增一個key，之後show tooltip需要用到
							d.temp = dataMap.get(genre).get(d.properties.name)[0][variable]
							return colorScale(dataMap.get(genre).get(d.properties.name)[0][variable]);
						}
						// USA跟England另外處理
						else if (d.properties.name === 'USA') {
							d.temp = dataMap.get(genre).get('United States')[0][variable]
							return colorScale(dataMap.get(genre).get('United States')[0][variable]);
						} else if (d.properties.name === 'England') {
							d.temp = dataMap.get(genre).get('United Kingdom')[0][variable]
							return colorScale(dataMap.get(genre).get('United Kingdom')[0][variable]);
						}

						// 沒有分數的國家，或沒有match到
						else {
							return 'black';
						}
					})
					.style("stroke", "black")
					.attr("class", 'country')
					.style("opacity", 0.8)
					.on("mouseover", showTooltip)
					.on("mousemove", moveTooltip)
					.on("mouseleave", hideTooltip)

			}

			// Draw the map
			update()

			// set zooming
			const zoom = d3.zoom()
				.scaleExtent([1, 8])
				.on('zoom', function (event) {
					g.selectAll('path')
						.attr('transform', event.transform);
				})
			svg.call(zoom)



		})
}