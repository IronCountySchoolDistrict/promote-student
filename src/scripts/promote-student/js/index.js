import $ from 'jquery'
import 'dragula_css'
import 'milligram'
import 'whatwg-fetch'
import { studentPut, psData } from './fetchSchema'
import dragula from 'dragula'
import template from '../html/index.html'
import sass from '../sass/index.scss'

$(() => {
  // Get psData from fetchSchema. 
  // Prepare data to be used for DOM generation.
  let data = psData
  let studentFetch = data.students
  let teacherFetch = data.teachers
  
  // List of containers to watch.
  let containers = [
    document.querySelector('#students')
  ]
  // Dynamically set Teachers.
  let main = document.querySelector('#teachers')
  let teacherList = Object.entries(teacherFetch)
  let count = 0
  let rowCount = 0
  teacherList.forEach(([key, value]) => {
    if (count % 3 === 0) {
      rowCount++
      let rowTemplate = `
      <div class="row row-style" id="teacher-row-${rowCount}"></div>
    `
      main.insertAdjacentHTML('beforeend', `${rowTemplate}`)
    }
    let rowInsert = document.querySelector(`#teacher-row-${rowCount}`)
    let teacherNumber = `teacher-${key}`
    let teacherTemplate = `
      <div id="${teacherNumber}" class="column drake-container">
        <h4 class="no-drag">${value.name}<span class="count"></span>
      </div>
    `
    rowInsert.insertAdjacentHTML('beforeend', `${teacherTemplate}`)
    containers.push(document.querySelector(`#${teacherNumber}`))
    count++
  })

  // Dynamically set Students.
  let studentColumn = document.querySelector('#students')
  let studentList = Object.entries(studentFetch)
  studentList.forEach(([key, value]) => {
    let gender
    if (value.gender === 'male') {
      gender = 'blue'
    } else if (value.gender === 'female') {
      gender = 'pink'
    } else {
      gender = 'orange'
    }
    let studentTemplate = `
      <div id="${value.dcid}" class="student">
        <blockquote class="${gender}">
          ${value.firstlast}<br>
          Gender: ${value.gender}
        </blockquote>
      </div>
    `
    studentColumn.insertAdjacentHTML('beforeend', `${studentTemplate}`)
  })

  // Drag and Drop functionallity
  let drake = dragula({
    // Feeds the list of containers to dragula.
    containers: containers,
    // If not slotted into proper container restore to current container.
    revertOnSpill: true,
    // Prevents the first element from being dragged.
    moves: function (el, source) {
      return !el.classList.contains('no-drag')
    }
  })

  // Counts total children in parent element and returns count.
  refreshCounts()
  drake.on('drop', (el, target, source, sibling) => {
    refreshCounts()
  })

  function refreshCounts () {
    containers.forEach(el => {
      let count = el.querySelectorAll('.student').length
      let elHeader = el.querySelector('.count')
      elHeader.textContent = ` (${count})`
    })
  }
})