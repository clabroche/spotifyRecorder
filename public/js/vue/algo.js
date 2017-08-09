/**
 * Function to add a Slave to the HTML Page
 */
function addSlave (slaveObject, state) {
  if (!$('.' + slaveObject.id).length) {
    let serverName = 'Server ' + slaveObject.ip + ':' + slaveObject.port
    let card = createHTMLCard(serverName, slaveObject)
    createHTMLHardware(serverName, slaveObject)
    $('#container1').append(card)
    toggleSlaves(state)
  }
}

function toggleSlaves (state) {
  if (!state) {
    $('.card').each(function (index, el) {
      $(this).append($('<div>').addClass('slave-disabled'))
    })
  } else {
    $('.card').each(function (index, el) {
      $(this).find('.slave-disabled').remove()
    })
  }
}

function createHTMLHardware (serverName, slaveObject) {
  let $slave = $('<div>').addClass('slave-' + slaveObject.id)
  let $icon = $('<i>').addClass('ui disk outline icon')
  let $title = $('<h3>').text(serverName).prepend($icon)
  setInterval(function () {
    $.getJSON('http://' + slaveObject.ip + ':' + slaveObject.port + '/hardware', (config, textStatus) => {
      let totalRAM = (config.totalmem / Math.pow(10, 9)).toFixed(2)
      let currentRAM = (config.freemem / Math.pow(10, 9)).toFixed(2)
      let percent = Math.round((currentRAM * 100) / totalRAM)
      if ($('.slave-' + slaveObject.id).length) {
        $slave = $('.slave-' + slaveObject.id)
        $slave.find('.cpu .bar').css('width', config.cpuUsage.toFixed(1) + '%')
        $slave.find('.cpu .bar .progress').text(config.cpuUsage.toFixed(1) + '%')
        $slave.find('.ram .bar').css('width', percent + '%')
        $slave.find('.ram .bar .progress').text(percent + '%')
      } else {
        let $cpu = $('<div>').addClass('ui green active progress cpu')
        $cpu.append($('<div>').attr('style', 'transition-duration: 300ms; width:' + config.cpuUsage.toFixed(1) + '%;')
              .addClass('bar')
              .append($('<div>').addClass('progress').text(config.cpuUsage.toFixed(0) + '%')))
        let $ram = $('<div>').addClass('ui orange active progress ram')
             .append($('<div>').attr('style', 'transition-duration: 300ms; width:' + percent + '%;')
                 .addClass('bar')
                 .append($('<div>').addClass('progress').text(percent + '%'))
             ).append($('<div>').addClass('label').text('Memory : ' + currentRAM + 'GB /' + totalRAM + 'GB'))

        $('#slaveContainer').append($slave.append())
        $('#slaveContainer').append(
          $slave.append(
            $title,
            $cpu.clone().append(
              $('<div>').addClass('label').text('CPU : ' + config.cpus[0].model + ' x' + config.cpus.length)
            ),
            $ram
          )
        )
      }
    })
  }, 2000)
}

function createHTMLCard (serverName, slave) {
  let slaveId = slave.ip + ':' + slave.port
  slaveId = slaveId.split('.').join('')
  slaveId = slaveId.split(':').join('')
  let $header = $('<div>').addClass('header')
  let $icon = $('<i>').addClass('disk green outline icon')
  let $title = $('<span>').text(slave.ip + ':' + slave.port)
  let $description = $('  <form action="#" class="ui form">' +
                            '<div class="field">' +
                              '<input type="number" required class="iteration" placeholder="Number of iterations">' +
                            '</div> ' +
                            '<input type="hidden" name="slaveId" value="' + slaveId + '">' +
                          '</form>' +
                          '<div class="output" id="output-' + slaveId + '"> $ > </div> <br/>')
  let $progressContainer = $('<div>').addClass('progressContainer-' + slaveId)
  let $body = $('<div>').append(changeStatus(slaveId, slave.status), $description)
  let stopButton = $('<div>').addClass('ui basic red button stop').prop('id', slaveId).text('Stop').append($('<i>').addClass('window stop right icon'))
  let pauseButton = $('<div>').addClass('ui basic yellow button paused').prop('id', slaveId).text('Pause').append($('<i>').addClass('window pause right icon'))
  let resumeButton = $('<div>').addClass('ui basic yellow button resume').prop('id', slaveId).text('Resume').append($('<i>').addClass('window caret right icon'))
  let runButton = '<div class="ui basic blue button launch" id="' + slaveId + '"> Run<i class="caret right icon"></i> </div>'
  let buttons = $('<div>').addClass('extra content center aligned grid').prop('id', 'action-' + slaveId).append(runButton, resumeButton, pauseButton, stopButton)
  stopButton.hide()
  pauseButton.hide()
  resumeButton.hide()
  $header.append($icon, $title)
  let $card = $('<div>').addClass('card ' + slave.id).append($('<div>').addClass('content').append($header, $body, $progressContainer)).append(buttons)
  return $card
}

function changeStatus (slaveId, status, progression) {
  let $status
  let $meta
  let $available = $('<span class="ui tiny header blue">Available</span><i class="sign in small blue icon"></i>')
  let $executing = $('<span class="ui tiny header orange">Executing</span><i class="notched orange circle loading small icon"></i>')
  let $stopped = $('<span>').addClass('ui tiny header red').text('Stopped').add($('<i>').addClass('red unlinkify small icon'))
  let $paused = $('<span>').addClass('ui tiny header yellow').text('Paused').add($('<i>').addClass('yellow pause small icon'))
  let $analytics = $('<span  class="statistics">').text('Check the statistics')
  switch (status) {
    case 'available':
      $status = changeMeta(slaveId, $available)
      break
    case 'executing':
      let $progressContainer = $('.progressContainer-' + slaveId)
      $status = changeMeta(slaveId, [$executing, $analytics])
      if ($('.progress.' + slaveId).length) {
        let $progress = $('.ui.active.progress.' + slaveId)
        $progress.children('.bar').css({
          'width': progression,
          'transition-duration': '300ms'
        })
        $progress.find('.progress').text(progression)
      } else {
        let $progress = $('<div>').addClass('ui active progress green ' + slaveId).attr('data-percent', progression)
        let $bar = $('<div>').addClass('bar')
        let $textProgress = $('<div>').addClass('progress').text('0%')
        let $label = $('<div>').addClass('label').text('Progression')

        $progressContainer.append($progress.append($bar.append($textProgress), $label))
      }
      $('.' + slaveId).find('.stop').fadeIn(400)
      $('.' + slaveId).find('.paused').fadeIn(400)
      $('.' + slaveId).find('.launch').fadeOut(400)
      $('.' + slaveId).find('.resume').fadeOut(400)
      break
    case 'finish':
      $meta = $('<span>').addClass('ui tiny header green').text('Finished').add($('<i>').addClass('green check small icon'))
      $('.progressContainer-' + slaveId).empty()
      $status = changeMeta(slaveId, [$meta, $analytics])
      $('.' + slaveId).find('.stop').fadeOut(400)
      $('.' + slaveId).find('.launch').fadeIn(400)
      $('.' + slaveId).find('.paused').fadeOut(400)
      $('.' + slaveId).find('.resume').fadeOut(400)
      break
    case 'stopped':
      $('.progressContainer-' + slaveId).empty()
      $status = changeMeta(slaveId, $stopped)
      $('.' + slaveId).find('.stop').fadeOut(400)
      $('.' + slaveId).find('.launch').fadeIn(400)
      $('.' + slaveId).find('.paused').fadeOut(400)
      $('.' + slaveId).find('.resume').fadeOut(400)
      break
    case 'paused':
      $status = changeMeta(slaveId, $paused)
      setTimeout(function () {
        $('.' + slaveId).find('.stop').fadeOut(400)
        $('.' + slaveId).find('.launch').fadeOut(400)
        $('.' + slaveId).find('.paused').fadeOut(400)
        $('.' + slaveId).find('.resume').fadeIn(400)
      }, 200)

      break
    default:

  }

  return $status
}

function changeMeta (slaveId, $elements) {
  let $status
  if ($('#meta-' + slaveId).length) {
    $('#meta-' + slaveId).empty().append($elements)
  } else {
    $status = $('<div>').addClass('meta').prop('id', 'meta-' + slaveId).append($elements)
  }
  return $status
}
