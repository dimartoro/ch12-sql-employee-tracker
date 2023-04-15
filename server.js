const inquirer = require('inquirer');

const express = require('express');
const mysql = require('mysql2');
const cTable = require('console.table');
const PORT = process.env.PORT || 3001;
const app = express();

const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'diana123',
    database: 'hr_db'
  }
);

var q = '';

SelectAllElements = () =>{
  return new Promise((resolve, reject)=>{
      db.query(q,  (error, elements)=>{
          if(error){
              return reject(error);
          }
          return resolve(elements);
      });
  });
};

async function getRolePromptQuestions(){
  var departments = await getDepartmentAsArrayList("select name from department");
  var questions = [
    {
      type:'input',
      message:'What is the name of the role?',
      name:'role',
    },
    {
      type:'input',
      message:'What is the salary of the role?',
      name:'salary',
    },
    {
    type:'list',
    choices:departments,
    message:'Wich department does the role belongs to?',
    name:'department',
    }
  ];
  return questions;
}

async function getDepartmentAsArrayList(query){
    q = query;
    const results = await SelectAllElements();
    var arr = [];    
    for(var x = 0; x<results.length; x++){
      arr.push(results[x].name);
    }
    return arr;
}


async function getEmployeePromptQuestions(){
  var questions;
  var roleQuery = 'select title from role';
  var managersQuery = 'select * from employee';
  var roles = await getRolesToString(roleQuery);
  var managers = await getEmployeesToString(managersQuery);
    questions = [
      {
        type:'input',
        message:'What is the employee\'s first name?',
        name:'firstName',
      },
      {
        type:'input',
        message:'What is the employee\'s last name?',
        name:'lastName',
      },
      {
        type:'list',
        choices:roles,
        message:'What is the employee\'s role?',
        name:'role',
      },
      {
        type:'list',
        choices:managers,
        message:'What is the employee\'s manager?',
        name:'manager',
      }
    ];
  return questions;
}

async function getDepartmentAsArrayList(query){
    q = query;
    const results = await SelectAllElements();
    var arr = [];    
    for(var x = 0; x<results.length; x++){
      arr.push(results[x].name);
    }
    return arr;
}

async function getRolesToString(query){
  q = query;
  const results = await SelectAllElements();
  var arr = [];    
  for(var x = 0; x<results.length; x++){
    arr.push(results[x].title);
  }
  return arr;
}

async function getEmployeesToString(query){
  q = query;
  const results = await SelectAllElements();
  var arr = [];    
  for(var x = 0; x<results.length; x++){
    arr.push(results[x].first_name + ' ' + results[x].last_name);
  }
  return arr;
}

async function getUpdateEmployeePromptQuestions(){
  var questions;
  var roleQuery = 'select title from role';
  var employeesQuery = 'select * from employee';
  var roles = await getRolesToString(roleQuery);
  var employees = await getEmployeesToString(employeesQuery);
    questions = [
      {
        type:'list',
        choices:employees,
        message:'Which employee\'s role do you want to update?',
        name:'employee',
      },
      {
        type:'list',
        choices:roles,
        message:'Wich role do you want to assign to the selected employee?',
        name:'role',
      }
    ];
  return questions;
}


const initialQuestions = [
  {
    type:'list',
    choices:["View All Employees", "Add Employee", "Update Employee Role", "View All Roles", "Add Role", "View All Departments", "Add Department", "Quit"],
    message:'What would you like to do?',
    name:'selection',
}
];

app.use(express.urlencoded({ extended: false }));
app.use(express.json());


function init() {
  initialPrompt();  
}

async function getEmployeeIdByFullName(fullName){
  q = `select id from employee where concat(first_name,' ',last_name) = "${fullName}"`;
  const result = await SelectAllElements();
  if(result.length>0){
    return result[0].id;
  }
  else{
    console.log("Employee was not found");
  }
}

async function getRoleIdByTitle(title){
  q = `select id from role where title = "${title}"`;
  const result = await SelectAllElements();
  return result[0].id;
}

function listEmployees(){
  var sql = `select e.id 'Id', e.first_name 'First Name', e.last_name 'Last Name'
  ,r.title 'Role' , d.name 'Department', r.salary 'Salary', 
  concat(m.first_name, ' ', m.last_name) 'Manager' 
  from employee e
  left join role r on 
  r.id = e.role_id
  left join department d on 
  d.id = r.department_id
  left join employee m on 
  m.id = e.manager_id`;
  executeScript(sql);
}

function listRoles(){
  var sql = `SELECT * FROM role`;
  executeScript(sql);
}

function listDepartments(){
  var sql = `SELECT * FROM department`;
  var dpts = executeScript(sql);
}

function saveDepartment(deptName){
  var sql = `insert into department(name)values("${deptName}")`;
  executeScript(sql);
  listDepartments();
}

function saveRole(role, salary, department){
    var sql = `insert into role(title,salary,department_id) values("${role}", ${salary},(select id from department where name = "${department}"))`;
    executeScript(sql);
    listRoles();
}

async function saveEmployee(firstName, lastName, role, manager){
  var managerId = await getEmployeeIdByFullName(manager);
  var roleId = await getRoleIdByTitle(role);
  var sql = `insert into employee(first_name,last_name,role_id, manager_id) values("${firstName}", "${lastName}",${roleId}, "${managerId}")`;
  executeScript(sql);
  listEmployees();
}


async function updateEmployee(employeeName, role){
  var employeeId = await getEmployeeIdByFullName(employeeName);
  var roleId = await getRoleIdByTitle(role);
  var sql = `update employee set role_id = ${roleId} where id = ${employeeId}`;
  executeScript(sql);
  listEmployees();
}

function executeScript(sql){
  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
       return;
    }
    console.table(rows);
    return rows;
  });
}

function initialPrompt(){
  inquirer
    .prompt(initialQuestions)
    .then((answers) =>{
        switch(answers.selection){
            case 'View All Employees':
            listEmployees();
            break;
            case 'View All Roles':
            listRoles();
            break;
            case 'View All Departments':
            listDepartments();
            break;
            case 'Add Department':
              questionAddDepartment();
            break;
            case 'Add Role':
              questionAddRole();
              break;
            case 'Add Employee':
              questionAddEmployee();
              break;
            case 'Update Employee Role':
              questionUpdateEmployee();
              break;
            case 'Quit':
              process.exit(0);
              break;
          default:
              break;
        };

    })
    .catch((error) => {
        if (error.isTtyError) {
            console.log("Prompt couldn't be rendered in the current environment.")
        } else {
          console.log("error other than prompt")
        }
    });
}

function questionAddDepartment(){
  var insertQuestions=[
    {
      type:'input',
      message:'What is the name of the Department?',
      name:'department',
    }
  ]
  inquirer
    .prompt(insertQuestions)
    .then((answers) =>{
        saveDepartment(answers.department)
    })
    .catch((error) => {
        if (error.isTtyError) {
            console.log("Prompt couldn't be rendered in the current environment.")
        } else {
          console.log("error other than prompt")
        }
    });
}

async function questionAddRole(){
    const addRoleQuestions = await getRolePromptQuestions();
    inquirer
    .prompt(addRoleQuestions)
    .then((answers) =>{
        saveRole(answers.role, answers.salary, answers.department);
    })
    .catch((error) => {
        if (error.isTtyError) {
            console.log("Prompt couldn't be rendered in the current environment.")
        } else {
          console.log("error other than prompt")
        }
    });
} 

async function questionAddEmployee(){
  const addEmployeeQuestions = await getEmployeePromptQuestions();
  inquirer
  .prompt(addEmployeeQuestions)
  .then((answers) =>{
      saveEmployee(answers.firstName, answers.lastName, answers.role, answers.manager);
  })
  .catch((error) => {
      if (error.isTtyError) {
          console.log("Prompt couldn't be rendered in the current environment.")
      } else {
        console.log("error other than prompt")
      }
  });
} 

async function questionUpdateEmployee(){
  const updateEmployeeQuestions = await getUpdateEmployeePromptQuestions();
  inquirer
  .prompt(updateEmployeeQuestions)
  .then((answers) =>{
      updateEmployee(answers.employee, answers.role);
  })
  .catch((error) => {
      if (error.isTtyError) {
          console.log("Prompt couldn't be rendered in the current environment.")
      } else {
        console.log("error other than prompt")
      }
  });
} 

init();