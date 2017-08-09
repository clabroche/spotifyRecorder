let configChart = []
let dataAvg = {}
$.getJSON('/chart/result', {param1: 'value1'}, function (json, textStatus) {
  let data = {}
  let iterations = []
  // create array for output
  $.each(json.slaves, function (index, slave) {
    $.each(json.algo, function (index, output) {
      data[output] = []
      if (dataAvg[output] === undefined) {
        dataAvg[output] = {}
      }
    })
    if (slave.result) {
      slave.result = slave.result.filter(function (n) { return n !== null })
      slave.result = slave.result.sort(sortByIterations)
    }
    $.each(slave.result, function (index, result) {
      $.each(result, function (index, variable) {
        if (index === 'iterations') {
          iterations.push(result.iterations)
        } else {
          data[index].push(variable)
          if (dataAvg[index][result.iterations] === undefined) {
            dataAvg[index][result.iterations] = []
          }
          dataAvg[index][result.iterations].push(variable)
        }
      })
    })
    createChart(slave.id, data, iterations, slave.ip + ':' + slave.port)
    iterations = []
    data = {}
  })
  // moyenne:
  $.each(dataAvg, function (indexVariable, variable) {
    $.each(variable, function (index, iterationValues) {
      var sum = 0
      for (var i = 0; i < iterationValues.length; i++) {
        sum += iterationValues[i] // don't forget to add the base
      }
      var avg = sum / iterationValues.length
      dataAvg[indexVariable][index] = avg
    })
    createChartAvg(indexVariable, dataAvg[indexVariable], indexVariable, indexVariable)
  })
})

$('body').on('change', 'select', function () {
  let self = this
  let slaveId = this.id.split('-')[1]
  $.each(configChart, function (index, el) {
    if (el.slaveId === slaveId) {
      $('#chart-' + slaveId).find('iframe').remove()
      $('#chart-' + slaveId).find('canvas').replaceWith($('<canvas>').css({
        width: '400px',
        height: '120px'
      }))
      var ctx = $('#chart-' + slaveId).find('canvas')[0].getContext('2d')
      var myChart = new Chart(ctx, {
        type: self.value,
        data: el.data
      })
    }
  })
})

function createChart (slaveId, data, iterations, name) {
  let $chart = $('<div>').addClass('chart').prop('id', 'chart-' + slaveId)
  let $title = $('<h3>').text(name)
  let $canvas = $('<canvas>').css({
    width: '400px',
    height: '120px'
  })
  let $chooseGraph = $('<select>').prop('id', 'choose-' + slaveId).addClass('ui fluid selection dropdown chooser')
                      .append(
                        $('<option>').prop('value', 'line').text('line'),
                        $('<option>').prop('value', 'bar').text('bar'),
                        $('<option>').prop('value', 'radar').text('radar'),
                        $('<option>').prop('value', 'pie').text('pie'),
                        $('<option>').prop('value', 'bubble').text('bubble')
                      )
  $('.containerChartSlaves').append($chart.append($title, $canvas, $chooseGraph))
  let datasets = []
  $.each(data, function (index, el) {
    let x = []
    $.each(el, function (i, n) {
      x.push(n)
    })
    datasets.push({
      label: index,
      data: x,
      backgroundColor: getRandomColor()
    })
  })

  let dataChart = {
    labels: iterations,
    datasets: datasets
  }
  configChart.push({
    slaveId: slaveId,
    data: dataChart
  })
  var ctx = $('#chart-' + slaveId).find('canvas')[0].getContext('2d')
  var myChart = new Chart(ctx, {
    type: 'line',
    data: dataChart
  })
}
function createChartAvg (slaveId, data, variable, name) {
  let $chart = $('<div>').addClass('chart').prop('id', 'chart-' + slaveId)
  let $title = $('<h3>').text('Average: ' + name)
  let $canvas = $('<canvas>').css({
    width: '400px',
    height: '120px'
  })
  let $chooseGraph = $('<select>').prop('id', 'choose-' + slaveId).addClass('ui fluid selection dropdown chooser')
                      .append(
                        $('<option>').prop('value', 'line').text('line'),
                        $('<option>').prop('value', 'bar').text('bar'),
                        $('<option>').prop('value', 'radar').text('radar'),
                        $('<option>').prop('value', 'pie').text('pie'),
                        $('<option>').prop('value', 'bubble').text('bubble')
                      )
  $('.containerChartAverage').append($chart.append($title, $canvas, $chooseGraph))
  let datasets = []
  let iterations = []
  for (var i = 0; i < Object.keys(data).length; i++) {
    iterations.push(i)
  }
  let x = []
  $.each(data, function (i, n) {
    x.push(n)
  })
  datasets.push({
    label: name,
    data: x,
    backgroundColor: getRandomColor()
  })

  let dataChart = {
    labels: iterations,
    datasets: datasets
  }
  configChart.push({
    slaveId: slaveId,
    data: dataChart
  })
  var ctx = $('#chart-' + slaveId).find('canvas')[0].getContext('2d')
  var myChart = new Chart(ctx, {
    type: 'line',
    data: dataChart
  })
}

function getRandomColor () {
  var letters = '0123456789ABCDEF'
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }

  var c
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(color)) {
    c = color.substring(1).split('')
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]]
    }
    c = '0x' + c.join('')
    return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',0.4)'
  }
  throw new Error('Bad Hex')
}

function sortByIterations (key1, key2) {
  return key1.iterations > key2.iterations
}

$('body').on('click', '.anchor', function (event) {
  $('html, body').stop().animate({
    scrollTop: $($(this).attr('href')).offset().top - 70
  }, 400)
})
