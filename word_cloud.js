function wordCloud(id) {


  const fill = d3.schemeCategory10

  const tokenize = function (words) {

    const countList = words.map(x => x.size)
    const max = Math.max(...countList)
    const min = Math.min(...countList)

    return words.map(x => {
      return {
        text: x.text,
        size: selectSizeFactor(min, max, x.size)
      }
    })
  }

  const selectSizeFactor = function (min, max, value) {
    const a = (max - min) / (10 - 1)
    const b = max - a * 10
    return (value - b) / a
  }
  // myWords = tokenize(test)

  const margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = 600 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom

  const svg = d3
    .select('#wordCloud')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('id','wordCloudSvg')

    .attr('class', 'mx-auto')
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  // const id = ""
  d3.csv('https://raw.githubusercontent.com/zihong518/data_visualization/master/count_result.csv').then((data) => {
    const dataSelect = data.filter(x => {
      return x.tconst == id
    })
    let test = dataSelect[0].token_count.replace(/[{"'}()!\.;*\?]/g, "").split(",")
    let myWords = []
    test.map(x => {
      const pair = x.split(":")
      const word = pair[0].replace(/[()!\.,:;*\?-]/g, '')
        .replace(/\s+/g, '')
        .replace(/\d+/g, '')
      if (word) {
        if (word.length > 1) {
          myWords.push({
            text: word,
            size: parseInt(pair[1])
          })
        }

      }
    })
    myWords = tokenize(myWords)

    const layout = d3.layout
      .cloud()
      .size([width, height])
      .words(
        myWords.map(function (d) {
          return { text: d.text, size: d.size }
        }),
      )
      .font('Impact')
      .padding(5) //space between words
      .rotate(function () {
        return 0
      })

      .fontSize(function (d) {
        return d.size * 14
      })
      .on('end', draw)

    layout.start()

    function draw(words) {
      svg
        .append('g')
        .attr('transform', 'translate(' + layout.size()[0] / 2 + ',' + layout.size()[1] / 2 + ')')
        .selectAll('text')
        .data(words)
        .enter()
        .append('text')
        .style('font-size', function (d) {
          return d.size
        })
        .style('fill', (d, i) => fill[i % 10])
        .attr('text-anchor', 'middle')
        .style('font-family', 'Impact')
        .attr('transform', function (d) {
          return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')'
        })
        .text(function (d) {
          return d.text
        })
    }
  })
}
