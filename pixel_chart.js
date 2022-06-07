function pixel_chart() {
  // set the dimensions and margins of the graph
  const margin = { top: 30, right: 30, bottom: 70, left: 60 },
    width = 800 - margin.left - margin.right,
    height = 680 - margin.top - margin.bottom

  // append the svg object to the body of the page
  const svg = d3
    .select('#pixel')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // Parse the Data

  d3.csv('https://raw.githubusercontent.com/zihong518/data_visualization/master/data.csv').then(async function (data) {
    // remove nan data and parse datetime string
    data = data.filter((element, i) => element.type === 'Movie' && element.date_added && element.listed_in && element.country)

    const parseTime = d3.timeParse('%B %d, %Y')
    data.forEach((element) => {
      // parse datetime data
      element.date_added = parseTime(element.date_added)
      element.duration = +element.duration.split(' ')[0]
      element.averageRating = +element.averageRating
      element.numVotes = +element.numVotes
      element.listed_in = element.listed_in
        .split(', ')
        .map((d) => d.replaceAll(' ', '_').replaceAll('&', 'and'))
        .join(', ')
      element.country = element.country
        .split(', ')
        .map((d) => d.replaceAll(' ', '_'))
        .join(', ')
    })

    //const filter_variables = ['countrys', 'genres']

    d3.select('#amount').text(data.length)

    // show country options and binding on change event
    let countrys_all = get_all_countrys(data)
    d3.select('#pixel_filter .select_countrys')
      .selectAll('option')
      .data(countrys_all)
      .join('option')
      .attr('class', 'country_para')
      .text((d) => d)


    d3.select('#pixel_filter .select_countrys').on('change', add_and_update)

    // show genres options and binding onchange event
    let genres_all = get_all_genres(data)
    d3.select('.select_genres')
      .selectAll('option')
      .data(genres_all)
      .join('option')
      .attr('class', 'genre_para')
      .text((d) => d)

    d3.select('#pixel_filter .select_genres').on('change', add_and_update)

    // calculat the lenght of square
    const r = calculate_r(data.length)
    const x_amount = Math.floor(width / r)
    const y_amount = Math.floor(height / r)

    // group axis
    const xGroup = d3.scaleBand().range([0, width]).padding(0.05)

    // X axis
    const x = d3.scaleBand().range([0, width]).domain(d3.range(x_amount)).padding(0)

    // Y axis
    const y = d3.scaleBand().range([0, height]).domain(d3.range(y_amount))

    const color = d3
      .scaleOrdinal()
      .domain(genres_all)
      .range(genres_all.map((d,i) => d3.hsl((360 / 19) * i, 0.8, 0.6)))

    add_selected_country('Japan')

    // add default genres
    add_selected_genre('Dramas')

    // create all sliders
    const duration_histogram_slider = new Duration_Histogram_Slider(
      'pixel_filter',
      ...d3.extent(data.map((d) => d.duration)),
      data.map((d) => d.duration),
    )
    duration_histogram_slider.create(update)

    const time_histogram_slider = new Time_Histogram_Slider(
      'pixel_filter',
      d3.min(data.map((d) => d.date_added)),
      data.map((d) => d.date_added),
    )
    time_histogram_slider.create(update)

    const averageRating_histogram_slider = new AverageRating_Histogram_Slider(
      'pixel_filter',
      data.map((d) => d.averageRating),
    )
    averageRating_histogram_slider.create(update)

    const numVotes_histogram_slider = new numVotes_Histogram_Slider(
      'pixel_filter',
      d3.max(data.map((d) => d.numVotes)),
      data.map((d) => d.numVotes),
    )
    numVotes_histogram_slider.create(update)

    // init chart
    update() // testing
    //draw_images(data, x_amount)

    // calculate the las
    function calculate_r(amount) {
      if (amount === 1) {
        return Math.min(width, height)
      } else {
        for (let i = 2; i <= amount; i++) {
          let guess_r = width / i
          if (guess_r * Math.ceil(amount / i) <= height) {
            return guess_r
          }
        }
      }
    }

    function get_all_condition_and_prepare_data() {
      const filters = d3.select('#pixel_filter')

      // get selected countrys
      let selected_countrys = []
      filters.selectAll('#pixel_filter div.selected_country div').each(function () {
        selected_countrys.push(d3.select(this).attr('data-country'))
      })
      //filters.select('selected_countrys')

      // get selected genres
      let selected_genres = []
      filters.selectAll('#pixel_filter div.selected_genre div').each(function () {
        selected_genres.push(d3.select(this).attr('data-genre'))
      })
      //filters.select('selected_genres')

      let min_max_duration = []
      filters.selectAll('#pixel_filter g.duration_slider g.parameter-value').each((d) => min_max_duration.push(d.value))

      let min_max_time = []
      filters.selectAll('#pixel_filter g.date_added_slider g.parameter-value').each((d) => min_max_time.push(d.value))

      let min_max_averageRating = []
      filters.selectAll('#pixel_filter g.averageRating_slider g.parameter-value').each((d) => min_max_averageRating.push(d.value))

      let min_max_numVotes = []
      filters.selectAll('#pixel_filter g.numVotes_slider g.parameter-value').each((d) => min_max_numVotes.push(d.value))

      let filtered_data = data.filter((d) => {
        // match counrtry
        let c_match = selected_countrys.length === 0 ? true : false
        for (let c of selected_countrys) {
          c_match = c_match || d.country.split(', ').includes(c)
        }

        // match genre
        let g_match = selected_genres.length === 0 ? true : false
        for (let g of selected_genres) {
          g_match = g_match || d.listed_in.split(', ').includes(g)
        }

        // match duration
        let d_match = d.duration > min_max_duration[0] && d.duration < min_max_duration[1] ? true : false
        // match time
        let t_match = d.date_added > min_max_time[0] && d.date_added < min_max_time[1] ? true : false
        // match averageRating
        let r_match = d.averageRating > min_max_averageRating[0] && d.averageRating < min_max_averageRating[1] ? true : false
        // match vote Amount
        let a_match = d.numVotes > min_max_numVotes[0] && d.numVotes < min_max_numVotes[1] ? true : false

        return c_match && g_match && d_match && t_match && r_match && a_match // && d.type === type
      })

      // update all sliders's yAxis
      duration_histogram_slider.update_histogram(filtered_data.map((d) => d.duration))
      time_histogram_slider.update_histogram(filtered_data.map((d) => d.date_added))
      averageRating_histogram_slider.update_histogram(filtered_data.map((d) => d.averageRating))
      numVotes_histogram_slider.update_histogram(filtered_data.map((d) => d.numVotes))
      const amount = filtered_data.length

      // sort by matched genres and genre name
      if (selected_genres.length !== 0) {
        filtered_data.forEach(function (d) {
          let matched_genres = []
          d.listed_in.split(', ').map(function (g) {
            if (selected_genres.includes(g)) matched_genres.push(g)
          })
          d.matched_genres = matched_genres
        })
        filtered_data.sort((a, b) => a.matched_genres.length - b.matched_genres.length || a.matched_genres[0].localeCompare(b.matched_genres[0]))
      }

      // Map( country -> array())
      const map_data = new Map()
      selected_countrys.map((c) =>
        map_data.set(
          c,
          filtered_data.filter(function (d) {
            return d.country.split(', ').includes(c)
          }),
        ),
      )

      return [map_data, selected_countrys, selected_genres, amount]
    }

    // higlight seleted genres
    function groupHighlight(event, d) {

      const genre = d3.select(this).text()
      d3.selectAll('g.image_gruop').style('opacity', 1)
      d3.selectAll(`g.${genre}`).style('opacity', 0.5)
    }

    // nohighlight
    function groupNoHighlight(event, d) {
      d3.selectAll('g.image_gruop').style('opacity', 0.8)
    }

    // hightlight only one image (mouseover and mouseleave use the same function)
    function highlight_over_or_leave(event, d) {
      if (event.type === 'mouseover') {
        const hoverImg = document.getElementById('hoverImg')
        hoverImg.src = d.image
        hoverImg.classList.add('opacity-100', 'transition', 'transition-all', 'duration-150', 'transition-opacity')
        d3.select(this)
          .attr('width', x.bandwidth() * 1.2)
          .attr('height', x.bandwidth() * 1.2)
          .style('opacity', 0.8)
      } else {
        document.getElementById('hoverImg').src = ''
        d3.select(this).attr('width', x.bandwidth()).attr('height', x.bandwidth()).style('opacity', 0.8)
      }
    }

    function draw_images(data, x_amount, countrys, genres) {
      d3.selectAll('#pixel g.view ').remove()
      xGroup.domain(d3.range(data.size))

      const image_group = svg
        .selectAll('g.view')
        .data(data.keys())
        .join('g')
        .attr('transform', (d, i) => `translate(${xGroup(i)}, 0)`)
        .attr('class', 'view')
        .attr('id', (d) => `view_${d}`)
        .selectAll('g.image_group')
        .data((d) => data.get(d))
        .join('g')
        .attr('class', (d) => 'image_group')

      // append rects according selected genres
      image_group.each(function (d, i) {
        const toAppend = d3.select(this)
        const genresToShow = d.listed_in.split(', ').filter((d) => genres.includes(d))
        const rect_X_Shift = x.bandwidth() / genresToShow.length
        for (let j = 0; j < genresToShow.length; j++) {
          toAppend
            .append('rect')
            .attr('x', x(i % x_amount) + rect_X_Shift * j)
            .attr('y', y(Math.floor(i / x_amount)))
            .attr('width', x.bandwidth() / genresToShow.length)
            .attr('height', x.bandwidth())
            .style('opacity', 1)
            .style('fill', color(genresToShow[j]))
        }
      })

      image_group
        .append('image')
        .attr('href', (d) => d.image.replace(/(?<=@\.)(.+)(?=\.jpg)/, `UX${x.bandwidth()}`))
        .attr('x', (d, i) => x(i % x_amount))
        .attr('y', (d, i) => y(Math.floor(i / x_amount)))
        .on('mouseover', highlight_over_or_leave) // we need to put event listener before transition
        .on('mouseleave', highlight_over_or_leave)
        .transition()
        .duration(1500)
        .style('opacity', 0.5)
        .attr('preserveAspectRatio', 'xMidYMid slice')
        .attr('width', x.bandwidth())
        .attr('height', x.bandwidth())
    }

    function remove_selection(even, d) {
      const id = d3.select(this).attr('class')
      d3.select(`div.${id}`).remove()
    }

    // get all conditions => redraw the chart
    function update() {
      const [filtered_data, countrys, genres, amount] = get_all_condition_and_prepare_data()
      // update the data amount

      d3.select('#amount').text(amount)

      // calculate the squre length
      const r = calculate_r(d3.max([...filtered_data.values()].map((d) => d.length)))
      const x_amount = Math.floor(width / r)
      const y_amount = Math.floor(height / r)

      // set view amount
      xGroup.domain(d3.range(filtered_data.size))

      // set new domain
      x.domain(d3.range(x_amount)).range([0, xGroup.bandwidth()])
      y.domain(d3.range(y_amount)).range([0, y_amount * x.bandwidth()])

      draw_images(filtered_data, x_amount, countrys, genres)
    }

    function add_selected_country(value) {
      let country_selected_block = d3.select('.selected_country').append('div').attr('data-country', value).attr('class','relative')

      country_selected_block.append('p').attr('class','px-3 py-1 mr-3 my-1 border-2 border-gray-200 bg-red-300 rounded-xl').text(value)

      country_selected_block.append('button').attr('data-country', value).attr('data-type','country').attr('class', ' absolute top-0 right-0 rounded-full w-5 text-xs h-5 text-center text-white bg-red-300 hover:bg-red-500 hover:duration-150 transition border-2 border-white font-sans	').text('X').on('click', remove)
    }

    function add_selected_genre(value) {
      let country_selected_block = d3
        .select('.selected_genre')
        .append('div')
        //.attr('class', value)
        .attr('data-genre', value)
		.attr('class','relative ')


    //   country_selected_block.append('div').style('border-radius', '100%').style('background-color', color(value)).style('width', '15px').style('height', '15px').text('   ')

      country_selected_block.append('p').attr('class','py-1 px-3 mr-3 my-1 rounded-xl my-1 mt-2 border-2 border-gray-300').style('background-color', color(value)).text(value).on('mouseover', groupHighlight).on('mouseleave', groupNoHighlight)

      country_selected_block.append('button').attr('data-genre', value).attr('data-type','genre').attr('class', 'absolute top-0 right-0 rounded-full w-5 text-xs h-5 text-white bg-red-300 hover:bg-red-500 hover:duration-150 transition border-2 border-white font-sans').text('X').on('click', remove)
    }

    // an event for countrys and genres
    function add_and_update(event, d) {
      // to know country genre
      const type = d3.select(this).attr('data-filter_type')
      // selectd content
      const value = d3.select(this).property('value')

      // add selected country
      if (type === 'country') {
        add_selected_country(value)
      }
      // add selected genre
      else {
        add_selected_genre(value)
      }

      update()
    }

    // remove selected genres
    function remove(event, d) {
      let type = d3.select(this).attr('data-type') === 'country' ? 'country' : 'genre'
      let value = d3.select(this).attr(`data-${type}`)
      d3.select(`div[data-${type}=${value}]`).remove()
      update()
    }
  })
}
