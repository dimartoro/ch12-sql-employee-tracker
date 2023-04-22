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

// Async/await functions with promises to interact with MySQL database.

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

async function getUpdateEmployeeManagerPromptQuestions(){
  var questions;
  var employeesQuery = 'select * from employee';
  var employees = await getEmployeesToString(employeesQuery);
    questions = [
      {
        type:'list',
        choices:employees,
        message:'Which employee\'s manager do you want to update?',
        name:'employee',
      },
      {
        type:'list',
        choices:employees,
        message:'Wich manager do you want to assign to the selected employee?',
        name:'manager',
      }
    ];
  return questions;
}

async function getEmployeesByManagerPromptQuestions(){
  var questions;
  var employeesQuery = `select * from employee where id in (select manager_id from employee)`;
  var employees = await getEmployeesToString(employeesQuery);
    questions = [
      {
        type:'list',
        choices:employees,
        message:'Which manager\'s employees do you want to see?',
        name:'manager',
      }
    ];
  return questions;
}

async function getEmployeesByDepartmentPromptQuestions(){
  var questions;
  var departmentsQuery = `select * from department`;
  var departments = await getDepartmentAsArrayList(departmentsQuery);
    questions = [
      {
        type:'list',
        choices:departments,
        message:'Which department\'s employees do you want to see?',
        name:'department',
      }
    ];
  return questions;
}

async function deleteEmployeePromptQuestions(){
  var questions;
  var employeesQuery = `select * from employee`;
  var employees = await getEmployeesToString(employeesQuery);
    questions = [
      {
        type:'list',
        choices:employees,
        message:'Which employee do you want to delete?',
        name:'employee',
      }
    ];
  return questions;
}

async function deleteDepartmentPromptQuestions(){
  var questions;
  var departmentsQuery = `select * from department`;
  var departments = await getDepartmentAsArrayList(departmentsQuery);
    questions = [
      {
        type:'list',
        choices:departments,
        message:'Which department do you want to delete?',
        name:'department',
      }
    ];
  return questions;
}

async function deleteRolePromptQuestions(){
  var questions;
  var roleQuery = `select * from role`;
  var roles = await getRolesToString(roleQuery);
    questions = [
      {
        type:'list',
        choices:roles,
        message:'Which role do you want to delete?',
        name:'role',
      }
    ];
  return questions;
}

async function budgetPromptQuestions(){
  var questions;
  var departmentsQuery = `select * from department`;
  var departments = await getDepartmentAsArrayList(departmentsQuery);
    questions = [
      {
        type:'list',
        choices:departments,
        message:'Which department do you want to calculate the budget for?',
        name:'department',
      }
    ];
  return questions;
}

const initialQuestions = [
  {
    type:'list',
    choices:["View All Employees"
    , "View Employees by Manager"
    , "View Employees by Department"
    , "View All Roles"
    , "View All Departments"
    , "Add Employee"
    , "Add Role"
    , "Add Department"
    , "Update Employee Manager"
    , "Update Employee Role"
    , "Delete Employee" 
    , "Delete Role"
    , "Delete Department"
    , "Total Utilized Budget by Department"
    , "Total Utilized Budget for All Departments"
    ,"Quit"],
    message:'What would you like to do?',
    name:'selection',
}
];

app.use(express.urlencoded({ extended: false }));
app.use(express.json());


function init() {
  //console.log("8");
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

async function getEmployeesByRoleId(roleId){
  q = `select * from employee where role_id = "${roleId}"`;
  const result = await SelectAllElements();
  if(result.length>0){
    return result;
  }
  else{
    console.log("Employee was not found");
  }
}

async function getDepartmentIdByDepartmentName(department){
  q = `select id from department where name = "${department}"`;
  const result = await SelectAllElements();
  if(result.length>0){
    return result[0].id;
  }
  else{
    console.log("Department was not found");
  }
}

async function getRoleIdByTitle(title){
  q = `select id from role where title = "${title}"`;
  const result = await SelectAllElements();
  return result[0].id;
}

async function getRolesByDepartmentId(dptId){
  q = `select * from role where department_id = "${dptId}"`;
  const result = await SelectAllElements();
  return result;
}

function listEmployees(){
  var sql = `select e.id 'Id', e.first_name 'First Name', e.last_name 'Last Name'
  ,r.title 'Job Title' , d.name 'Department', r.salary 'Salary', 
  concat(m.first_name, ' ', m.last_name) 'Manager' 
  from employee e
  left join role r on 
  r.id = e.role_id
  left join department d on 
  d.id = r.department_id
  left join employee m on 
  m.id = e.manager_id`;
  executeScript(sql);
  setTimeout(() => {
    //console.log("1");
    initialPrompt();
  }, 2000); 
}

async function listEmployeesByManagerName(manager){
  var managerId = await getEmployeeIdByFullName(manager);
  var sql = `select e.id 'Id', e.first_name 'First Name', e.last_name 'Last Name'
  ,r.title 'Job Title' , d.name 'Department', r.salary 'Salary', 
  concat(m.first_name, ' ', m.last_name) 'Manager' 
  from employee e
  left join role r on 
  r.id = e.role_id
  left join department d on 
  d.id = r.department_id
  left join employee m on 
  m.id = e.manager_id
  where e.manager_id = ${managerId}`;
  executeScript(sql);
  setTimeout(() => {
    //console.log("2");
    initialPrompt();
  }, 2000); 
}

async function listEmployeesByDepartmentName(department){
  var departmentId = await getDepartmentIdByDepartmentName(department);
  var sql = `select e.id 'Id', e.first_name 'First Name', e.last_name 'Last Name'
  ,r.title 'Job Title' , d.name 'Department', r.salary 'Salary', 
  concat(m.first_name, ' ', m.last_name) 'Manager' 
  from employee e
  left join role r on 
  r.id = e.role_id
  left join department d on 
  d.id = r.department_id
  left join employee m on 
  m.id = e.manager_id
  where d.id = ${departmentId}`;
  executeScript(sql);
  setTimeout(() => {
    //console.log("3");
    initialPrompt();
  }, 2000); 
}

async function listBudgetByDepartmentName(department){
  var departmentId = await getDepartmentIdByDepartmentName(department);
  q = `select 
      d.name 'Department'
      , sum(r.salary) 'Total'
      from employee e
      left join role r on 
      r.id = e.role_id
      left join department d on 
      d.id = r.department_id
      left join employee m on 
      m.id = e.manager_id
      where d.id = ${departmentId}
      group by d.name` ;
      const result = await SelectAllElements();
      return result;
 }

 async function listBudgetAllDepartments(){
  var sql = `select 
      d.name 'Department'
      , sum(r.salary) 'Total'
      from employee e
      left join role r on 
      r.id = e.role_id
      left join department d on 
      d.id = r.department_id
      left join employee m on 
      m.id = e.manager_id
      group by d.name` ;
      executeScript(sql);
      setTimeout(() => {
        //console.log("4");
        initialPrompt();
      }, 2000); 
 }

function listRoles(){
  var sql = `SELECT r.id "Id", r.title "Job Title", d.name "Department", r.salary "Salary" FROM role r left join department d on d.id = r.department_id`;
  executeScript(sql);
  setTimeout(() => {
    //console.log("5");
    initialPrompt();
  }, 2000); 
}

function listDepartments(){
  var sql = `SELECT * FROM department`;
  var dpts = executeScript(sql);
  setTimeout(() => {
    //console.log("6");
    initialPrompt();
  }, 2000); 
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

async function deleteEmployeeByEmployeeName(name){
  var employeeId = await getEmployeeIdByFullName(name);
  var sql = `delete from employee where id = ${employeeId}`;
  executeScript(sql);
  listEmployees();
}

async function deleteRoleById(roleId){
  var sql = `delete from role where id = ${roleId}`;
  executeScript(sql);
}

async function deleteEmployeeByRoleId(roleId){
  var sql = `delete from employee where role_id = ${roleId}`;
  executeScript(sql);
}

async function deleteDepartmentByName(name,deleteDependencies){
  var departmentId = await getDepartmentIdByDepartmentName(name);
  var sql = `delete from department where id = ${departmentId}`;
  executeScript(sql);
  listDepartments();
}

async function deleteRoleByTitle(title){
  var roleId = await getRoleIdByTitle(title);
  await deleteRoleById(roleId);
  listRoles();
}

async function CalculateBudgetByDepartmentName(deptName){
  var result = await listBudgetByDepartmentName(deptName);
  console.log(`The Total Utilized Budget for the ${deptName} department is: ${result[0].Total}`);
}

async function CalculateBudgetAllDepartments(){
  var result = await listBudgetAllDepartments();
  console.log(`The Total Utilized Budget for the ${deptName} department is: ${result[0].Total}`);
}

async function updateEmployee(employeeName, role){
  var employeeId = await getEmployeeIdByFullName(employeeName);
  var roleId = await getRoleIdByTitle(role);
  var sql = `update employee set role_id = ${roleId} where id = ${employeeId}`;
  executeScript(sql);
  listEmployees();
}

async function updateEmployeeManager(employeeName, manager){
  var employeeId = await getEmployeeIdByFullName(employeeName);
  var managerId = await getEmployeeIdByFullName(manager);
  var sql = `update employee set manager_id = ${managerId} where id = ${employeeId}`;
  executeScript(sql);
  listEmployees();
}

async function getEmployeesByManager(manager){
  var managerId = await getEmployeeIdByFullName(manager);
  var sql = `select employee set manager_id = ${managerId} where id = ${employeeId}`;
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
            case 'View Employees by Manager':
              questionsEmployeesByManager();
              break;
            case 'View Employees by Department':
              questionsEmployeesByDepartment();
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
            case 'Update Employee Manager':
              questionUpdateEmployeeManager();
              break;
            case 'Delete Employee':
              questionDeleteEmployee();
              break;
            case 'Delete Department':
              questionDeleteDepartment();
              break;
            case 'Delete Role':
              questionDeleteRole();
              break;
            case 'Total Utilized Budget by Department':
              questionBudget();
              break;
            case 'Total Utilized Budget for All Departments':
              listBudgetAllDepartments();
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
        addMessage('Department', answers.department);
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
  return new Promise((resolve)=>{
    inquirer
    .prompt(addRoleQuestions)
    .then((answers) =>{
        saveRole(answers.role, answers.salary, answers.department);
        addMessage('Role', answers.role);
    })
    .catch((error) => {
        if (error.isTtyError) {
            console.log("Prompt couldn't be rendered in the current environment.");
        } else {
          console.log("error other than prompt");
        }
    });
  });
} 

async function questionAddEmployee(){
  const addEmployeeQuestions = await getEmployeePromptQuestions();
  inquirer
  .prompt(addEmployeeQuestions)
  .then((answers) =>{
      saveEmployee(answers.firstName, answers.lastName, answers.role, answers.manager);
      addMessage('Employee', `${answers.firstName} ${answers.lastName}`);
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
      updateMessage('Employee', answers.employee);
  })
  .catch((error) => {
      if (error.isTtyError) {
          console.log("Prompt couldn't be rendered in the current environment.")
      } else {
        console.log("error other than prompt")
      }
  });
} 

async function questionUpdateEmployeeManager(){
  const updateEmployeeManagerQuestions = await getUpdateEmployeeManagerPromptQuestions();
  inquirer
  .prompt(updateEmployeeManagerQuestions)
  .then((answers) =>{
      if(answers.employee != answers.manager){
       updateEmployeeManager(answers.employee, answers.manager);
       updateMessage('Employee', answers.employee);
      }else{
        console.log("Error: Employee and Manager cannot be the same person");
      }
  })
  .catch((error) => {
      if (error.isTtyError) {
          console.log("Prompt couldn't be rendered in the current environment.")
      } else {
        console.log("error other than prompt")
      }
  });
} 

async function questionsEmployeesByManager(){
  const getEmployeesByManagerQuestions = await getEmployeesByManagerPromptQuestions();
  inquirer
  .prompt(getEmployeesByManagerQuestions)
  .then((answers) =>{
    listEmployeesByManagerName(answers.manager);
  })
  .catch((error) => {
      if (error.isTtyError) {
          console.log("Prompt couldn't be rendered in the current environment.")
      } else {
        console.log("error other than prompt")
      }
  });
}

async function questionsEmployeesByDepartment(){
  const getEmployeesByDepartmentQuestions = await getEmployeesByDepartmentPromptQuestions();
  inquirer
  .prompt(getEmployeesByDepartmentQuestions)
  .then((answers) =>{
    listEmployeesByDepartmentName(answers.department);
  })
  .catch((error) => {
      if (error.isTtyError) {
          console.log("Prompt couldn't be rendered in the current environment.")
      } else {
        console.log("error other than prompt")
      }
  });
}

async function questionDeleteEmployee(){
  const deleteEmployeeQuestions = await deleteEmployeePromptQuestions();
  inquirer
  .prompt(deleteEmployeeQuestions)
  .then((answers) =>{
    deleteEmployeeByEmployeeName(answers.employee);
    deleteMessage('Employee', answers.employee);
  })
  .catch((error) => {
      if (error.isTtyError) {
          console.log("Prompt couldn't be rendered in the current environment.")
      } else {
        console.log("error other than prompt")
      }
  });
}

async function questionDeleteDepartment(){
  const deleteDepartmentQuestions = await deleteDepartmentPromptQuestions();
  inquirer
  .prompt(deleteDepartmentQuestions)
  .then((answers) =>{
    deleteDepartmentByName(answers.department);
    deleteMessage('Department', answers.department);
  })
  .catch((error) => {
      if (error.isTtyError) {
          console.log("Prompt couldn't be rendered in the current environment.")
      } else {
        console.log("error other than prompt")
      }
  });
}

async function questionDeleteRole(){
  const deleteRoleQuestions = await deleteRolePromptQuestions();
  inquirer
  .prompt(deleteRoleQuestions)
  .then((answers) =>{
    deleteRoleByTitle(answers.role);
    deleteMessage('Role', answers.role);
  })
  .catch((error) => {
      if (error.isTtyError) {
          console.log("Prompt couldn't be rendered in the current environment.")
      } else {
        console.log("error other than prompt")
      }
  });
}

async function questionBudget(){
  const budgetQuestions = await budgetPromptQuestions();
  inquirer
  .prompt(budgetQuestions)
  .then((answers) =>{
    CalculateBudgetByDepartmentName(answers.department);
    setTimeout(() => {
      //console.log("7");
      initialPrompt();
    }, 2000); 
  })
  .catch((error) => {
      if (error.isTtyError) {
          console.log("Prompt couldn't be rendered in the current environment.")
      } else {
        console.log("error other than prompt")
      }
  });
}

function addMessage(entity, name){
  console.log(`The ${entity} ${name} has been added succesfully.`);
}

function updateMessage(entity, name){
  console.log(`The ${entity} ${name} has been added succesfully.`);
}

function deleteMessage(entity, name){
  console.log(`The ${entity} ${name} has been added succesfully.`);
}

init();