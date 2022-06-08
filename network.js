// set the dimensions and margins of the graph
function network(selectId) {

  const margin = { top: 10, right: 30, bottom: 30, left: 40 },
    width = 1500 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom

  // append the svg object to the body of the page
  const svg = d3
    .select('#network')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('class', 'mx-auto')
    .attr('id', 'networkSvg')
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
  // const selectId = 'tt9839146'
  d3.csv('https://raw.githubusercontent.com/zihong518/data_visualization/master/data.csv').then(function (data) {
    // 將cast整理成array
    let dataFirst = data.map((d) => {
      let dict = {
        id: d.tconst,
        title: d.title,
        casts: d.cast.split(','),
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
        x.casts.map((cast) => {
          let castDict = {
            filmId: [x.id],
            name: cast,
          }
          nodes.push(castDict)
          castSelected.push(cast)
        })
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
              if (film.id !== selectId) {
                film.casts.map((cast) => {
                  if (!castSelected.includes(cast)) {
                    let castDict = {
                      filmId: [film.id],
                      name: cast,
                    }

                    nodes.push(castDict)
                    castSelected.push(cast)
                  }
                })
              }
              if (!filmList.includes(film.id)) {
                filmList.push(film.id)
              }
            }
          })
        })
      })
    // console.log(nodes)
    // console.log(filmList)
    // 做出link
    const filmCast = filmList.map((filmId) => {
      return nodes.filter((node) => node.filmId.includes(filmId))
    })
    let nodeLink = []
    filmCast.map((el) => {
      for (let i = 0; i < el.length; i++) {
        for (let j = i + 1; j < el.length; j++) {
          const relation = {
            source: el[i].name,
            target: el[j].name,
          }

          nodeLink.push(relation)
        }
      }
    })
    // filmCast.map((el) => {
    //   for (let i = 0; i < el.length; i++) {
    //     if (i == el.length - 1) {
    //       const relation = {
    //         source: el[i].name,
    //         target: el[0].name,
    //       }
    //       nodeLink.push(relation)
    //     } else {
    //       const relation = {
    //         source: el[i].name,
    //         target: el[i + 1].name,
    //       }
    //       nodeLink.push(relation)
    //     }
  

    //   }
    // })
    console.log(nodes);
    console.log(nodeLink);
    let colorList = []
    for (let i = 0; i < filmList.length; i++) {
      colorList.push(d3.hsl((360 / filmList.length) * i, 0.75, 0.75))
    }
    let lineColor = d3.scaleOrdinal().domain(filmList).range(colorList)


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
          .distance(5)
      )
      .force('charge', d3.forceManyBody().strength(-20)) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
      .force('center', d3.forceCenter(width / 2, height / 2)) // This force attracts nodes to the center of the svg area
      .on('tick', ticked)

    // async function getImageOut() {
    //   let castList = nodes.map((x) => {
    //     return x.name
    //   })
    //   async function getImage(name) {
    //     let url = `https://en.wikipedia.org/w/api.php?action=query&titles=${name}&prop=pageimages&format=json&pithumbsize=300&origin=*`
    //     const image = await fetch(url, {
    //       method: 'GET',
    //     })
    //       .then((response) => {
    //         return response.json()
    //       })
    //       .then((data) => {
    //         return Object.values(data.query.pages)[0].thumbnail.source
    //       })
    //       .catch(() => {
    //         return 'https://www.linustock.com/images/uploads/2018/08/1535076121.png'
    //       })
    //     return image
    //   }
    //   function test() {
    //     return castList.map((x) => getImage(x))
    //   }
    //   let imgList = test()
    //   return imgList
    // }
    // let test
    // let imgList = getImageOut()
    // console.log(imgList);
    // async function getPromiseImage() {
    //   let imgAfterPromise = []
    //   const returnValue = await imgList.then(function (x) {
    //     x.map(function (data) {
    //       data.then(function (y) {
    //         console.log(y);
    //       })
    //     })
    //   })
    //   console.log(returnValue)
    //   return returnValue
    // }
    // getPromiseImage()
    // console.log(getPromiseImage());
    // console.log(test);
    // nodes.map(async (x) => {

    //   let test =  getImage(x.name)
    //   console.log(test)
    //   imgList.push(test)
    //   //console.log(imgList)
    //   // getImage(x.name).then((data) => {
    //   //   test = {
    //   //     name: x.name,
    //   //     href: data,
    //   //   }

    //   //   imgList.push(test)
    //   //   console.log(imgList);
    //   // })
    // })

    // for(let x of nodes){
    //   let name = await getImage(x.name)
    //   imgList.push(name)
    // }
    // let a  = await getImage(x.name)
    // console.log(a)
    // function showTitle(event,d){
    //   if (event.type === 'mouseover') {
    //   }    
    // }

    // Initialize the links
    const link = svg
      .selectAll('line')
      .data(nodeLink)
      .join('line')
      .style('stroke', (d) => lineColor(d.target.filmId[0]))
      .style('stroke-width', 4)
    // .on('mouseover',showtitle)
    // .on('mouseleave',showtitle)
    // console.log(link);
    // Initialize the nodes
    const node = svg.selectAll('circle').data(nodes).join('image').attr('href', ' ').attr('width', 40).attr('height', 40).call(drag(simulation))

    node
      .append('text')
      .attr('x', 20)
      .attr('y', '0.31em')
      .text((d) => d.name)
      .clone(true)
      .lower()
      .attr('fill', 'black')
      .attr('stroke', 'white')
      .attr('stroke-width', 3)

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
    // This function is run at each iteration of the force algorithm, updating the nodes position.
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

      node
        .attr('x', function (d) {
          return d.x - 20
        })
        .attr('y', function (d) {
          return d.y - 20
        })
    }
  })


}