function racingChart() {
  // set the dimensions and margins of the graph
  const margin = { top: 30, right: 0, bottom: 5, left: 40 },
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom

  // append the svg object to the body of the page
  let svg = d3
    .select('#racingBar')
    .append('svg')
    //   .attr("width", width + margin.left + margin.right)
    //   .attr("height", height + margin.top + margin.bottom)
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', '0 0 800 600')
    .classed('svg-content', true)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  //Read the data
  d3.csv('csv/netflix_v2.csv').then(function (raw_data) {
    // remove nan data and parse datetime string
    data = raw_data.filter((element, i) => element.date_added && element.type === 'Movie' && element.country)

    const parseTime = d3.timeParse('%B %d, %Y')
    data.forEach((element) => {
      element.date_added = parseTime(element.date_added)
      element.duration = +element.duration.split(' ')[0]
    })

    const genres = get_all_genres(data)
    //tranform data structure
    let gtime = d3.group(data, (d) => d.date_added)

    // sort by time
    gtime = new Map([...gtime].sort((a, b) => a[0] - b[0]))
    const keys = [...gtime.keys()]

    // we need a data structure like : Map( timestamp -> {}), remember to cumsum every genres
    for (let i = 0; i < keys.length; i++) {
      let obj = {}
      genres.map((d) => (obj[d] = 0))
      for (const d of gtime.get(keys[i])) {
        for (const g of d.listed_in.split(', ')) {
          if (g) {
            obj[g] += 1
          }
        }
      }
      // doing cunsum
      if (i - 1 > 0) {
        Object.keys(obj).forEach((d) => (obj[d] += gtime.get(keys[i - 1])[d]))
      }

      // reassign value to every timestamp
      gtime.set(keys[i], obj)
    }

    // add genre in info in object
    for (let i = 0; i < keys.length; i++) {
      let data_obj = gtime.get(keys[i])
      gtime.set(
        keys[i],
        Object.keys(data_obj)
          .map(function (k) {
            return { genre: k, value: data_obj[k] }
          })
          .sort((a, b) => b.value - a.value),
      )
    }

    let flag = true // if true -> keep racing, else -> stop
    const dateList = Array.from(gtime.keys()) // get all timestamp keys

    // create time slider
    const sliderRange = d3
      .sliderBottom()
      .min(d3.min(dateList))
      .max(d3.timeParse('%Y')('2021'))
      .step(1000 * 60 * 60 * 24 * 366) // not 365
      .width(800)
      .fill('#D4011D')
      .tickFormat(d3.timeFormat('%Y'))
      .default([d3.min(dateList), d3.timeParse('%Y')('2021')])
      .on('onchange', function (val) {
        d3.select('#slide_min').text(d3.timeFormat('%Y')(val[0]))
        d3.select('#slide_max').text(d3.timeFormat('%Y')(val[1]))
      })

    // draw time slider
    d3.select('#slider').append('svg').attr('class', 'mt-7').attr('preserveAspectRatio', 'xMinYMin meet').attr('viewBox', '0 0 875 600').classed('svg-content', true).append('g').attr('transform', 'translate(30,30)').call(sliderRange)
    // start playing racing bar chart
    d3.select('#play').on('click', function (event, d) {
      event.target.disabled = true
      if(event.target.disabled==true){
        event.target.classList.remove('bg-neutral-700',	 'hover:bg-black',  'text-white','duration-200' ,'hover:text-[#D4011D]')
        event.target.classList.add('bg-white','border-gray-200','cursor-not-allowed','border','duration-200','text-gray-100')
        const stop = document.getElementById('stop')
        stop.disabled =false
        stop.classList.remove('bg-white','border-gray-200','cursor-not-allowed','border','duration-200','text-gray-100')    
        stop.classList.add('bg-neutral-700',	 'hover:bg-black',  'text-white' ,'duration-200' ,'hover:text-[#D4011D]')
      }

      const [start, end] = sliderRange.value().map((d) => new Date(d))
      if (!flag) {
        // if the racing bar stoped
        flag = true // reset the flag

        // remove the stopped plot
        d3.select('#racingBar > svg').node().remove()

        // create a new one
        svg = d3.select('#racingBar').append('svg').attr('preserveAspectRatio', 'xMinYMin meet').attr('viewBox', '0 0 800 600').classed('svg-content', true).attr('transform', `translate(${margin.left},${margin.top})`)

        // activate racing bar
        plotChart(gtime, start, end)
      }
    })

    // click the stop button to stop racing bar chart
    d3.select('#stop').on('click', function (event, d) {
      event.target.disabled = true
      if(event.target.disabled==true){
        event.target.classList.remove('bg-neutral-700',	 'hover:bg-black',  'text-white','duration-200' ,'hover:text-[#D4011D]')
        event.target.classList.add('bg-white','border-gray-200','cursor-not-allowed','border','duration-200','text-gray-100')
        const play = document.getElementById('play')
        play.disabled =false
        play.classList.remove('bg-white','border-gray-200','cursor-not-allowed','border','duration-200','text-gray-100')    
        play.classList.add('bg-neutral-700',	 'hover:bg-black',  'text-white' ,'duration-200' ,'hover:text-[#D4011D]')
      }


      flag = false
    })

    // activate racing bar
    plotChart(gtime, d3.min(dateList), d3.max(dateList))

    async function plotChart(data, start, end) {
      const top_n = 10
      const tickDuration = 300

      const barPadding = (height - (margin.bottom + margin.top)) / (top_n * 5)
      const x = d3.scaleLinear()

      const xAxis = d3.axisTop().scale(x).ticks(5).tickSize(-height)
      //.tickFormat(d => d3.format(',')(d));

      const axistop = svg.append('g').classed('xaxis', true).style('transform', `translate(0px, ${margin.top})`).call(xAxis)

      const y = d3
        .scaleLinear()
        .domain([top_n, 0])
        .range([height - margin.bottom, margin.top])

      const color = d3
        .scaleOrdinal()
        .domain(genres)
        .range(genres.map((d) => d3.hsl(Math.random() * 360, 0.75, 0.75)))

      // show current timestamp
      svg
        .append('text')
        .attr('class', 'time')
        .attr('x', width - margin.right - 250)
        .attr('y', y(top_n))
        .style('font-size', '28px')
        .style('font-weight', 'bold')
        .style('background-color', 'white')
        .style('border', '2px solid gray')

      // update bar chart
      async function update(data, date) {
        data.forEach((d, i) => (d.rank = i)) // set rank

        x.domain([0, d3.max(data, (d) => d.value)]).range([margin.left, width - margin.right - 65])

        axistop.transition().duration(tickDuration).ease(d3.easeLinear).call(xAxis)

        // svg.selectAll("rect")
        // 	.data(data)
        // 	.join('rect')
        // 	.attr("x", x(0) + 1)
        // 	.attr("y", (d, i) => y(i) + 10)
        // 	.transition()
        // 	.duration(tickDuration)
        // 	.attr("width", d => x(d.value) - x(0))
        // 	.attr("height", y(1)-y(0)-barPadding)
        // 	.attr('fill', d => color(d.genre))

        let bars = svg.selectAll('rect').data(data, (d) => d.genre)

        bars
          .enter()
          .append('rect')
          .attr('x', x(0) + 1)
          .attr('width', (d) => x(d.value) - x(0))
          .attr('y', (d) => y(top_n + 1) + 10)
          .attr('height', y(1) - y(0) - barPadding)
          .attr('fill', (d) => color(d.genre))
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('y', (d, i) => y(d.rank) + 10)

        bars
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('width', (d) => x(d.value) - x(0))
          .attr('y', (d, i) => y(d.rank) + 10)

        bars
          .exit()
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('width', (d) => x(d.value) - x(0))
          .attr('y', (d) => y(top_n + 1) + 10)
          .remove()

        svg
          .selectAll('text.label')
          .data(data, (d) => d.genre)
          .join('text')
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('x', (d) => x(d.value) - 8)
          .attr('y', (d, i) => y(i) + (y(1) - y(0)) / 2 + 10)
          .attr('class', 'label')
          .text((d) => d.genre.replaceAll('_', ' ') + ' ' + d.value)
          .style('text-anchor', 'end')

        // show current year
        svg.select('text.time').datum(date).text(d3.timeFormat('%Y-%B')(date))
      }

      function findcloest(a, b) {
        return Math.abs(b - needle_time) < Math.abs(a - needle_time) ? b : a
      }

      // get the index of closest timestamp
      let needle_time = start
      const start_index = dateList.indexOf(dateList.reduce(findcloest))
      needle_time = end
      const end_index = dateList.indexOf(dateList.reduce(findcloest))

      for (let i = start_index; i < end_index; i++) {
        if (!flag) {
          // stop
          return
        }
        update(data.get(dateList[i]), dateList[i])
        await new Promise((done) => setTimeout(() => done(), 200))
      }
    }
  })
}
