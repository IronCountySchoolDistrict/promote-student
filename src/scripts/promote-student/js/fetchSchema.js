import $ from 'jquery'
import 'jsonq'

// ForEach that uses async functionality
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}
// ForEach example use
// const start = async () => {
//     await asyncForEach([1, 2, 3], async (num) => {
//         await waitFor(50);
//         console.log(num);
//     });
//}

const curSchoolIdData = JSON.parse(document.getElementById('curschoolid-data').textContent);
const { curSchoolId } = curSchoolIdData;

// Access Students table through PS power-query
const studentFetch = fetch(`/ws/schema/table/STUDENTS/projection=*`, {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
        'Accept': 'application/json'
    }
}).then(resp => resp.json())

// Access CC table through PS power-query
const ccFetch = fetch(`/ws/schema/table/CC/?projection=*`, {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
        'Accept': 'application/json'
    }
}).then(resp => resp.json())

// Access Sections table through PS power-query
const sectionFetch = fetch(`/ws/schema/table/SECTIONS/?projection=*`, {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
        'Accept': 'application/json'
    }
}).then(resp => resp.json())

// Access Teachers table through PS power-query
const teacherFetch = fetch(`/ws/schema/table/TEACHERS/?projection=*`, {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
        'Accept': 'application/json'
    }
}).then(resp => resp.json())

// Access Student table through PS power-query
export const studentPut = (data) => fetch(`/ws/schema/table/STUDENTS`, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
})

// Access Student table through PS power-query
export const gradesPkg = () => {
    // Run power query fetch functions to recive Json like responce
    const [students, teachers, sections, cc] = await Promise.all ([
        studentFetch(), teacherFetch(), sectionFetch(), ccFetch()
    ])

    // Remove the outer most layer, "record", of the PS responce
    const studentsList = students.record
    const teachersList = teachers.record
    const sectionsList = sections.record
    const ccList = cc.record

    // Setup the resp Json
    resp = [
        {'students': studentsList}
    ]

    // Take PS power queries response and cast to JSON objects
    let ccRecords = Object.entries(ccList)
    let teacherRecords = Object.entries(teachersList)
    let sectionRecords = Object.entries(sectionsList)

    // Cast JSON Objects to jsonQ for enhanced filtering
    let teacher = jsonQ(teacherRecords)
    let section = jsonQ(sectionRecords)
    
    // Iterate over cc records to pull teacher and grade level
    // from teacherRecords and sectionRecords
    let teacherJson = []    
    ccRecords.forEach(([key, value]) => {
        // Find Teacher from CC record in Teacher record
        let teacherId = teacher.filter({
            'id': value.teacherid
        })
        // Find Section from CC record in Section record
        let sectionId = section.filter({
            'id': value.sectionid
        })
        // Check teacherJson list for duplicate entry.
        // If not found add entry to teacherJson list.
        if (!jsonQ.contains(teacherJson, {
                'lastfirst': teacherId.lastfirst,
                'grade_level': sectionId.grade_level
            })) {
            teacherJson.push({
                'lastfirst': teacherId.lastfirst,
                'grade_level': sectionId.grade_level
            })
        }
    })
    resp.push(teacherJson)
    return resp
}
