function parallel(id,data,genres_all) {
  
  // const id = 'tt7767422'
  // set the dimensions and margins of the graph
  const margin = { top: 30, right: 10, bottom: 10, left: 0 },
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom
  // append the svg object to the body of the page
  const svg = d3
    .select('#parallel')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('class','mx-auto')
    .attr('id','parallelSvg')
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // Parse the Data
    // Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
    //  把genre設置list
    let genres = []
    data
      .map((x) => {
        x.matched_genres.map(genre=>{
          if(!genres.includes(genre)){
            genres.push(genre)
          }
        })
      })

    let tidyData = []


    // temp.map((x) => {
    //   if (!genre.includes(x)) {
    //     genre.push(x)
    //   }
    // })

    // 最後的data
    data
      .map((x) => {
        let temp = x.matched_genres
        temp.map((genre) => {
          let data = {
            title: x.title,
            genre: genre,
            release_year: x.release_year,
            duration: x.duration,
            averageRating: x.averageRating,
            numVotes: x.numVotes,
            id:x.tconst
          }
          tidyData.push(data)
        })
      })

    const color = d3
      .scaleOrdinal()
      .domain(['none'].concat(genres_all))
      .range(['#ffffff'].concat(genres_all.map((d, i) => d3.hsl((360 / 19) * i, 0.8, 0.6))))

    const dimensions = ['release_year', 'duration', 'averageRating', 'numVotes']
    // For each dimension, I build a linear scale. I store all in a y object
    const y = {}
    for (i in dimensions) {
      let name = dimensions[i]
      y[name] = d3
        .scaleLinear()
        .domain(
          d3.extent(tidyData, function (d) {
            return +d[name]
          }),
        )
        .range([height, 0])
    }

    // Build the X scale -> it find the best position for each Y axis
    x = d3.scalePoint().range([0, width]).padding(1).domain(dimensions)

    const highlight = function (event, d) {
      selected_specie = d.genre
      // first every group turns grey
      d3.selectAll('.line').transition().duration(200).style('stroke', 'lightgrey').style('opacity', '0.2')
      // Second the hovered specie takes its color
      d3.selectAll(`[data-genre="${selected_specie}"]`).transition().duration(200).style('stroke', color(selected_specie)).style('opacity', '1')
      drawSpecial()

    }

    const doNotHighlight = function (event, d) {
      d3.selectAll('.line')
        .transition()
        .duration(200)
        .delay(300)
        .style('stroke', function (d) {
          return color(d.genre)
        })
        .style('opacity', '0.3')

        drawSpecial()

      
    }

    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
      return d3.line()(
        dimensions.map(function (p) {
          return [x(p), y[p](d[p])]
        }),
      )
    }
    // Draw the lines
   
    function draw() {
      svg
        .selectAll('myPath')
        .data(
          tidyData.filter((d) => {
            return d
          }),
        )
        .join('path')
        .attr('data-genre', function (d) {
          return d.genre
        })
        .attr('data-id',d=>d.id)
        .style('opacity', 0)
        .attr('class', 'line')
        .attr('d', path)
        .style('fill', 'none')
        .style('stroke', (d) => color(d.genre))
        .on('mouseover', highlight)
        .on('mouseleave', doNotHighlight)
        .transition()
        .duration(300)
        .style('opacity', 0.3)
        
    
    }
    function drawSpecial() {
      svg
        .selectAll('myPath')
        .data(
          tidyData.filter((d) => {
            return d.id == id
          }),
        )
        .join('path')
        .attr('data-genre', function (d) {
          return d.genre
        })
        .attr('data-id',d=>d.id)
        .style('opacity', 0)
        .attr('class', 'line')
        .attr('d', path)
        .style('fill', 'none')
        .style('stroke', 'red')
        .style('stroke-width',2)
        .transition()
        .duration(300)
        .style('opacity', 1)
        
    
    }
    draw()
    drawSpecial()
    // Draw the axis:
    function drawAxis() {
      svg
        .selectAll('myAxis')
        // For each dimension of the dataset I add a 'g' element:
        .data(dimensions)
        .enter()
        .append('g')
        .attr('class', 'axis')
        // I translate this element to its right position on the x axis
        .attr('transform', function (d) {
          return 'translate(' + x(d) + ')'
        })
        // And I build the axis with the call function
        .each(function (d) {
          d3.select(this).call(d3.axisLeft().scale(y[d]))
        })
        // Add axis title
        .append('text')
        .style('text-anchor', 'middle')
        .attr('y', -9)
        .text(function (d) {
          return d
        })
        .style('fill', 'white')
    }
    drawAxis()

    d3.selectAll('.genre').on('change', (event) => {
      if (event.target.checked) {
        genreSelected.push(event.target.value)
        d3.selectAll('.line').remove()
        d3.selectAll('.axis').remove()
        draw()
        drawSpecial()
        drawAxis()
      } else {
        genreSelected = genreSelected.filter((x) => {
          return x != event.target.value
        })
        // d3.selectAll(".line").remove()
        d3.selectAll(`[data-genre="${event.target.value}"]`).transition().duration(300).style('opacity', '0')
        setTimeout(() => {
          d3.selectAll(`[data-genre="${event.target.value}"]`).remove()
        }, 300)
      }
    })

}
