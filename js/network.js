// set the dimensions and margins of the graph
function network(selectId) {
  document.getElementById('network').classList.add('border-4','border-gray-400')
  document.getElementById('networkTitle').classList.remove('hidden')
  const margin = { top: 10, right: 30, bottom: 30, left: 40 },
    width = 1500 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom

  // append the svg object to the body of the page
  const svg = d3
    .select('#network')
    .append('svg')
    .attr('width', '100%')
    .attr('height', height + margin.top + margin.bottom)
    .attr('class', 'mx-auto')
    .attr('id', 'networkSvg')
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
  // const selectId = 'tt9839146'
  d3.csv('https://raw.githubusercontent.com/zihong518/data_visualization/master/data.csv').then(async function (data) {
    // 將cast整理成array
    let dataFirst = data.filter(x=>x.cast!=="").map((d) => {
        let dict = {
          id: d.tconst,
          title: d.title,
          casts: d.cast.split(','),
          image: d.image,
        }
        return dict

    })
    // 做出名字的node
    let nodes = []
    let filmList = []
    let castSelected = []
    dataFirst
      .filter((x) => x.id === selectId)
      .map((x) => {
        let movieDict = {
          filmId: [x.id],
          name: x.title,
          type: 'movie',
          image: x.image,
        }
        nodes.push(movieDict)
        if (x.casts == ['']) {
          return false
        } else {
          x.casts.map((cast) => {
            let castDict = {
              filmId: [x.id],
              name: cast,
              type: 'character',
            }
            nodes.push(castDict)
            castSelected.push(cast)
          })
        }

        nodes.map((node) => {
          dataFirst.map((film) => {
            if (film.casts.includes(node.name)) {
              if (!film.id.includes(node.filmId)) {
                film.casts.map((cast) => {
                  nodes.map((node) => {
                    if (node.name === cast) {
                      node.filmId.push(film.id)
                    }
                  })
                })
              }
            }
          })
        })
        nodes.map((node) => {
          if (node.filmId.length > 1) {
            node.filmId.map((filmId) => {
              if (filmId != selectId) {
                let film = dataFirst.find((film) => film.id == filmId)
                let movieDict = {
                  filmId: [film.id],
                  name: film.title,
                  type: 'movie',
                  image: film.image,
                }
                nodes.push(movieDict)
              }
            })
          }
        })
      })
    if (nodes==false){
      document.getElementById('networkAlert').innerHTML="Sorry, we don't have the casts data of this movie"
      d3.select('#networkSvg').remove()
      return 
    }else{
      document.getElementById('networkAlert').innerHTML=""

    }
    let nodeLink = []

    nodes
      .filter((node) => node.type === 'movie')
      .map((movie) => {
        let id = movie.filmId[0]
        filmList.push(id)
        nodes
          .filter((node) => node.type === 'character')
          .map((actor) => {
            if (actor.filmId.includes(id)) {
              const relation = {
                source: movie.name,
                target: actor.name,
              }
              nodeLink.push(relation)
            }
          })
      })
    // console.log(filmList)
    // console.log(nodes);
    // console.log(nodeLink)
    let colorList = []
    for (let i = 0; i < filmList.length; i++) {
      colorList.push(d3.hsl((360 / filmList.length) * i, 0.75, 0.75))
    }
    let lineColor = d3.scaleOrdinal().domain(filmList).range(colorList)


    async function getImage(name) {
      let url = `https://en.wikipedia.org/w/api.php?action=query&titles=${name}&prop=pageimages&format=json&pithumbsize=300&origin=*`
      const image = await fetch(url, {
        method: 'GET',
      })
        .then((response) => {
          return response.json()
        })
        .then((data) => {
          return Object.values(data.query.pages)[0].thumbnail.source
        })
        .catch(() => {
          //return 'https://www.linustock.com/images/uploads/2018/08/1535076121.png'
          return 'https://william50307.github.io/Netflix_Data_Visulization/images/noImage.png'
        })
      return image
    }
    Promise.all(nodes.filter(node => node.type == "character").map(d => getImage(d.name))).then(function (images) {
      // console.log(images);
      // Let's list the force we wanna apply on the network
      const simulation = d3
        .forceSimulation(nodes) // Force algorithm is applied to data.nodes
        .force(
          'link',
          d3
            .forceLink() // This force provides links between nodes
            .id(function (d) {
              return d.name
            }) // This provide  the id of a node
            .links(nodeLink) // and this the list of links
            .distance(100)
        )
        .force('charge', d3.forceManyBody().strength(-200)) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
        .force('center', d3.forceCenter(window.screen.width / 4, height / 2)) // This force attracts nodes to the center of the svg area
        .on('tick', ticked)

      const link = svg
        .selectAll('line')
        .data(nodeLink)
        .join('line')
        .style('stroke', (d) => lineColor(d.source.filmId[0]))
        .style('stroke-width', 4)
      // .on('mouseover',showtitle)
      // .on('mouseleave',showtitle)
      // console.log(link);
      // Initialize the nodes


      const actor_nodes = svg
        .selectAll('image.actor')
        .data(nodes.filter((x) => x.type === 'character'))
        .join('g')
        .call(drag(simulation))


      actor_nodes
        .append('defs')
        .append('pattern')
        .attr('id', d => d.index)
        .attr('height', '100%')
        .attr('width', '100%')
        .append('image')
        .attr('width', 50)
        .attr('hegiht', 50)
        .attr('xlink:href', (d, i) => images[i])


      actor_nodes
        .append('text')
        .text(d => d.name)
        //.attr('href', (d, i) => images[i])
        .attr('class', 'actor')
        .attr('width', 80)
        .attr('height', 80)
        .style('text-anchor', 'middle')
        .style('transform', 'translate(0px, -30px)')


      actor_nodes
        .append('circle')
        .attr('r', 25)
        .attr('fill', d => `url(#${d.index})`)

      //console.log(node);

      const movieNode = svg
        .selectAll('image.movie')
        .data(nodes.filter((x) => x.type === 'movie'))
        .join('image')
        .attr('class', 'movie')
        .attr('href', (d) => d.image)
        .attr('width', 80)
        .attr('height', 80)
        .call(drag(simulation))
        .on('mouseover', hoverImg)
        .on('mouseleave', hoverImg)



      // node
      //   .append('text')
      //   .attr('x', 20)
      //   .attr('y', '0.31em')
      //   .text((d) => d.name)
      //   .clone(true)
      //   .lower()
      //   .attr('fill', 'black')
      //   .attr('stroke', 'white')
      //   .attr('stroke-width', 3)
      function hoverImg(event, d) {
        if (event.type == "mouseover") {
          document.getElementById('networkHoverImg').src = d.image
          document.getElementById('networkHoverTitle').innerHTML = d.name
        }
        else {
          document.getElementById('networkHoverTitle').innerHTML = ''
          document.getElementById('networkHoverImg').src = ''

        }
      }
      function drag(simulation) {
        function dragstarted(event, d) {
          if (!event.active) simulation.alphaTarget(0.8).restart()
          event.subject.fx = event.subject.x
          event.subject.fy = event.subject.y
        }

        function dragged(event, d) {
          event.subject.fx = event.x
          event.subject.fy = event.y
        }

        function dragended(event, d) {
          if (!event.active) simulation.alphaTarget(0)
          event.subject.x = null
          event.subject.y = null
        }

        return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended)
      }
      //This function is run at each iteration of the force algorithm, updating the nodes position.
      function ticked() {
        link
          .attr('x1', function (d) {
            return d.source.x
          })
          .attr('y1', function (d) {
            return d.source.y
          })
          .attr('x2', function (d) {
            return d.target.x
          })
          .attr('y2', function (d) {
            return d.target.y
          })

        actor_nodes
          .attr('transform', d => `translate(${d.x}, ${d.y})`)
        // .attr('x', function (d) {
        //   return d.x -20
        // })
        // .attr('y', function (d) {
        //   return d.y -20
        // })

        movieNode
          .attr('x', function (d) {
            return d.x - 40
          })
          .attr('y', function (d) {
            return d.y - 40
          })
      }
    })

  })
}