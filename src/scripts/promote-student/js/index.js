import $ from 'jquery'
import '../css/template.scss'
import 'dragula_css'
import 'tingle_css'
import '/node_modules/milligram/dist/milligram.css'
import tingle from 'tingle.js'
import dragula from 'dragula'
import _ from 'lodash'

$(() => {
  // Required element variables
  let teachersElm = document.querySelector('#teachers')
  let studentElm = document.querySelector('#students')
  let btnGroup = document.querySelector('#btn-group')
  let tlistSql = document.querySelector('.tlist')
  const gradeLevel = [0, 1, 2, 3, 4, 5, 6, 7]

  // Data from PS
  let studentFetch = JSON.parse(tlistSql.innerHTML)

  // List of containers to watch.
  let containers = [
    document.querySelector('#students')
  ]

  // Dynamically set Students.
  // Takes PS Data pull and proccesses it into sessionStorage.
  const studentProcess = () => {
    let studentList = []
    Object.entries(studentFetch).forEach(([key, value]) => {
      let studentData = {
        'lastfirst': value.lastfirst,
        'dcid': value.dcid,
        'grade_level': parseInt(value.grade_level),
        'gender': value.gender
      }
      studentList.push(studentData)
    })
    // Update lists in session storage.
    sessionStorage.setItem('studentEntry', JSON.stringify(studentList))
  }

  // Build list from session storage or from memory
  const teacherBuildList = () => {
    if (!sessionStorage.getItem('teacherEntry')) {
      return []
    } else {
      return JSON.parse(sessionStorage.getItem('teacherEntry'))
    }
  }

  const studentBuildList = () => {
    if (!sessionStorage.getItem('studentEntry')) {
      studentProcess()
      return sessionStorage.getItem('studentEntry')
    } else {
      return sessionStorage.getItem('studentEntry')
    }
  }

  let teacherEntry = teacherBuildList()
  let studentEntry = studentBuildList()

  // Modal configuration and html injection
  let modal = new tingle.modal({
    footer: true,
    stickyFooter: false,
    closeMethods: ['overly', 'button', 'escape'],
    closeLabel: 'Close'
  })
  // Inject modal content with modal template.
  modal.setContent(`
    <h3>Add Teacher</h3>
    <form id="teacher-form" action="" method="POST">
      <div class="row">
        <div class="column">
            <label for="teacher-title">Title:</label> 
        </div>
        <div class="column">
            <select id="teacher-title">
              <option value="Mrs">Mrs.</option>
              <option value="Mr">Mr.</option>
              <option value="Miss">Miss</option>
              <option value="Ms">Ms.</option>
              <option value="Dr">Dr.</option>
            </select>
        </div>
      </div>
      <div class="row">
        <div class="column">
            <label for="teacher-name">Teacher Last Name:</label>
        </div>
        <div class="column">
            <input type="text" id="teacher-name">
        </div>
      </div>
      <div class="row">
        <div class="column">
            <label for="teacher-grade">Grade Level:</label> 
        </div>
        <div class="column">
            <select id="teacher-grade">
              <option value="0">K</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">Multi</option>
            </select>
        </div>
      </div>
    </form> 
  `)
  // Inject modal buttons into modal
  modal.setFooterContent(`
    <div class="row">
      <div class="column">
        <button id="btn-cancel" class="button button-cancel">Cancel</button>
        <button id="btn-confirm" class="button">Confirm</button>
      </div>
    </div>
  `)

  // Modal button controls
  // EventListener for Teacher Form add button.
  document.getElementById('modal').addEventListener('click', function () {
    modal.open()
  })
  // Event Listener for Teacher Form cancel button.
  document.getElementById('btn-cancel').addEventListener('click', function () {
    modal.close()
  })
  // Event Listener for Teacher Form comformation button.
  document.getElementById('btn-confirm').addEventListener('click', function () {
    let teacherTitle = document.getElementById('teacher-title').value
    let teacherName = document.getElementById('teacher-name').value
    let teacherGrade = document.getElementById('teacher-grade').value
    let teacher = `${teacherTitle}. ${teacherName}`
    modal.close()
    document.getElementById('teacher-form').reset()
    teacherProcess(teacher, teacherGrade)
  })

  // Generate grade selection btn-group and inject into DOM.
  gradeLevel.forEach((element) => {
    let grade = element
    if (parseInt(element) === 0) {
      grade = 'K'
    }
    if (parseInt(element) === 7) {
      grade = 'MULTI'
    }
    let btnGroupTemplate = `
      <div class="column">
        <button class="button button-black button-outline btn-group-item" id="button-${element}">${grade}</button>
      </div>
    `
    btnGroup.insertAdjacentHTML('beforeend', `${btnGroupTemplate}`)
  })

  // Clear the given elements innerHtml
  const clear = (elem, source) => {
    if (source === 'student') {
      while (elem.lastChild.id !== 'student-header') {
        elem.removeChild(studentElm.lastChild)
      }
    } else if (source === 'teacher') {
      while (elem.lastChild) {
        elem.removeChild(teachersElm.lastChild)
      }
    }
  }

  // Renders students into DOM
  const studentRender = (studentList) => {
    clear(studentElm, 'student')
    studentList.forEach(([key, value]) => {
      let gender
      // Determine gender color based on provided gender
      if (value.gender.toLowerCase() === 'male') {
        gender = 'blue'
      } else if (value.gender.toLowerCase() === 'female') {
        gender = 'pink'
      } else {
        gender = 'orange'
      }
      let studentTemplate = `
        <div id="${value.dcid}" class="student mix" data-grade="grade-${value.grade_level + 1}">
          <blockquote class="${gender}">
            ${value.lastfirst}<br>
            Gender: ${value.gender}
          </blockquote>
        </div>
      `
      studentElm.insertAdjacentHTML('beforeend', `${studentTemplate}`)
    })
  }

  // Dynamically set Teachers.
  // TeacherProcess builds and set Teacher data to store in memory and session
  const teacherProcess = (name, grade) => {
    let teacher = {
      'name': name,
      'grade_level': parseInt(grade),
      'students': []
    }
    teacherEntry.push(teacher)
    sessionStorage.setItem('teacherEntry', JSON.stringify(teacherEntry))
  }

  // TeacherRender injects teacher template into the DOM as well as any students associated
  const teacherRender = (teacherList) => {
    let count = 0
    let rowCount = 0
    clear(teachersElm, 'teacher')
    // Loop through each teacher and inject the teacher template.
    teacherList.forEach(([key, value]) => {
      // If there are more than 3 Teachers per row create and inject a new row
      if (count % 3 === 0) {
        rowCount++
        let rowTemplate = `
          <div class="row row-style" id="teacher-row-${rowCount}"></div>
        `
        teachersElm.insertAdjacentHTML('beforeend', `${rowTemplate}`)
      }
      let rowInsert = document.querySelector(`#teacher-row-${rowCount}`)
      let teacherNumber = `teacher-${key}`
      let teacherTemplate = `
        <div id="${teacherNumber}" class="column teacher drake-container mix" data-grade="grade-${value.grade_level}" data-title="teacher">
          <h4 class="no-drag">${value.name}<span class="count"></span>
        </div>
      `
      rowInsert.insertAdjacentHTML('beforeend', `${teacherTemplate}`)
      let rowStudents = document.querySelector(`#${teacherNumber}`)
      // If students exist inject students under teacher.
      if (value.students.length !== 0) {
        Object.entries(value.students).forEach(([key, value]) => {
          // Determine gender color based on provided gender
          let gender
          if (value.gender.toLowerCase() === 'male') {
            gender = 'blue'
          } else if (value.gender.toLowerCase() === 'female') {
            gender = 'pink'
          } else {
            gender = 'orange'
          }
          let studentTemplate = `
            <div id="${value.dcid}" class="student mix" data-grade="grade-${value.grade_level + 1}>
              <blockquote class="${gender}">
                ${value.lastfirst}<br>
                Gender: ${value.gender}
              </blockquote>
            </div>
          `
          rowStudents.insertAdjacentHTML('beforeend', `${studentTemplate}`)
        })
      }
      containers.push(document.querySelector(`#${teacherNumber}`))
      count++
    })
  }

  // StudentByGrade builds pulls Student data for render.
  const studentByGrade = (grade) => {
    let studentStore = JSON.parse(sessionStorage.getItem('studentEntry'))
    studentRender(Object.entries(_.filter(studentStore, { 'grade_level': grade })))
  }

  // TeacherByGrade builds pulls Teacher data for render.
  const teacherByGrade = (grade) => {
    let teacherStore = JSON.parse(sessionStorage.getItem('teacherEntry'))
    teacherRender(Object.entries(_.filter(teacherStore, { 'grade_level': grade })))
  }

  // Btn-group event listeners
  document.getElementById('button-0').addEventListener('click', function () {
    studentByGrade(-1)
    teacherByGrade(0)
  })
  document.getElementById('button-1').addEventListener('click', function () {
    studentByGrade(0)
    teacherByGrade(1)
  })
  document.getElementById('button-2').addEventListener('click', function () {
    studentByGrade(1)
    teacherByGrade(2)
  })
  document.getElementById('button-3').addEventListener('click', function () {
    studentByGrade(2)
    teacherByGrade(3)
  })
  document.getElementById('button-4').addEventListener('click', function () {
    studentByGrade(3)
    teacherByGrade(4)
  })
  document.getElementById('button-5').addEventListener('click', function () {
    studentByGrade(4)
    teacherByGrade(5)
  })
  document.getElementById('button-6').addEventListener('click', function () {
    studentByGrade(5)
    teacherByGrade(6)
  })
  document.getElementById('button-7').addEventListener('click', function () {
    studentRender(Object.entries(JSON.parse(sessionStorage.getItem('studentEntry'))))
    teacherByGrade(7)
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
    // Test 3 conditions for proper session storage
    let student = buildStudent(el)
    // If source Students list with target of Teacher
    if (source.getAttribute('id') === 'students' && target.getAttribute('data-title') === 'teacher') {
      let teacherTarget = buildTeacher(target)
      let teacherList = Object.entries(teacherEntry)
      // Find target teacher add student to teacher.student list
      teacherList.forEach(([key, value]) => {
        if (value.name === teacherTarget.name && value.grade_level === teacherTarget.grade_level) {
          value.students.push(student)
        }
      })
      // Remove student from the students list
      _.remove(studentEntry, function (item) {
        return parseInt(item.dcid) === parseInt(student.dcid)
      })
      // Update list changes to session storage
      sessionStorage.setItem('studentEntry', JSON.stringify(studentEntry))
      studentEntry = JSON.parse(sessionStorage.getItem('studentEntry'))
      sessionStorage.setItem('teacherEntry', JSON.stringify(teacherEntry))
    }
    // If source Teacher with target of Students List
    if (source.getAttribute('data-title') === 'teacher' && target.getAttribute('id') === 'students') {
      let teacherSource = buildTeacher(source)
      let teacherList = Object.entries(teacherEntry)
      // Find teacher and remove student from teacher.student
      teacherList.forEach(([key, value]) => {
        if (value.name === teacherSource.name && value.grade_level === teacherSource.grade_level) {
          let teacherStudents = value.students
          // Remove student from teacher.student
          _.remove(teacherStudents, function (item) {
            return item.dcid === student.dcid
          })
        }
      })
      // Update list changes to session storage
      studentEntry.push(student)
      sessionStorage.setItem('studentEntry', JSON.stringify(studentEntry))
      sessionStorage.setItem('teacherEntry', JSON.stringify(teacherEntry))
    }
    // If source Teacher with target of Teacher
    if (source.getAttribute('data-title') === 'teacher' && target.getAttribute('data-title') === 'teacher') {
      let teacherTarget = buildTeacher(target)
      let teacherSource = buildTeacher(source)
      let teacherList = Object.entries(teacherEntry)
      // Find teachers in teacher list and remove student from source and add to target
      teacherList.forEach(([key, value]) => {
        if (value.name === teacherSource.name && value.grade_level === teacherSource.grade_level) {
          let teacherStudents = value.students
          // Remove student from teacher.student
          _.remove(teacherStudents, function (item) {
            return item.dcid === student.dcid
          })
        }
        // Add student to teacher.student
        if (value.name === teacherTarget.name && value.grade_level === teacherTarget.grade_level) {
          value.students.push(student)
        }
      })
      // Update list changes to session storage
      sessionStorage.setItem('teacherEntry', JSON.stringify(teacherEntry))
    }
  })

  // Rebuild teacher JSON data from DOM element
  function buildTeacher (el) {
    // Clone element to prevent actual DOM manipulation
    let elem = el.cloneNode(true)
    // Strip all HTML tags to get pure text
    let elemContent = elem.innerHTML = elem.innerText || elem.textContent
    // Trim all the pure text reducing the list to a four index element list
    let innerContentArray = elemContent.replace(/(\r\n|\n|\r)/gm, ' ').trim().split(' ').filter(Boolean)
    // Build teacher data from DOM stripped array
    let teacher = {
      'name': `${innerContentArray[0]} ${innerContentArray[1]}`,
      'grade_level': elem.getAttribute('data-grade')
    }
    return teacher
  }
  // Rebuild student JSON data from DOM element
  function buildStudent (el) {
    // Clone element to prevent actual DOM manipulation
    let elem = el.cloneNode(true)
    let elemContent = elem.innerHTML = elem.innerText || elem.textContent
    // Strip all HTML tags to get pure text
    let innerContentArray = elemContent.replace(/(\r\n|\n|\r)/gm, ' ').trim().split(' ').filter(Boolean)
    // Trim all the pure text reducing the list to a four index element list
    let lastFirst = `${innerContentArray[0]} ${innerContentArray[1]}`
    let gender = `${innerContentArray[3]}`
    // Build student data from DOM stripped array
    let student = {
      'lastfirst': lastFirst,
      'gender': gender,
      'dcid': el.getAttribute('id')
    }
    return student
  }
  // Build/Rebuild Count of student elements when dragged to new target
  function refreshCounts () {
    containers.forEach(el => {
      // Get count of all student elements in a target element
      let count = el.querySelectorAll('.student').length
      let elHeader = el.querySelector('.count')
      // Inject count in target container
      elHeader.textContent = ` (${count})`
    })
  }
})
