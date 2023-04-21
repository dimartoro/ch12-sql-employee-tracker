
# SQL-Employee-Tracker

## Description
The SQL-Employee-Tracker command-line application manages a company's employee database, using Node.js, Inquirer, and MySQL.

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Table of Contents
- [Installation](#installation)
- [UserStory](#userstory)
- [Credits](#credits)
- [Tests](#tests)
- [Email](#email)
- [GitHub](#github)
- [License](#license)
- [VideoLink](#videolink)

## Installation
Clone to your local computer the SQL-Employee-Tracker command-line application located in my remote repository at https://github.com/dimartoro/ch12-sql-employee-tracker.git Open your Windows CMD in your local computer and write CD until your CMD displays the directory ch12-sql-employee-tracker. Inside this directory is the db (database) folder with the schema.sql and the seeds.sql of my hr_db (employee database), the server.js, node js packages and libraries among others. Start looking the video located at the bottom of my README.md with the detailed instructions to walk you through the command-line functionality of my SQL-Employee-Tracker.

## UserStory
AS A business owner  
I WANT to be able to view and manage the departments, roles, and employees in my company  
SO THAT I can organize and plan my business  

Acceptance Criteria  
GIVEN a command-line application that accepts user input    
WHEN I start the application  
THEN I am presented with the following options: view all departments, view all roles, view   all employees, add a department, add a role, add an employee, and update an employee role  
WHEN I choose to view all departments  
THEN I am presented with a formatted table showing department names and department ids  
WHEN I choose to view all roles  
THEN I am presented with the job title, role id, the department that role belongs to, and  the salary for that role  
WHEN I choose to view all employees  
THEN I am presented with a formatted table showing employee data, including employee ids,   first names, last names, job titles, departments, salaries, and managers that the employees   report to  
WHEN I choose to add a department  
THEN I am prompted to enter the name of the department and that department is added to the   database  
WHEN I choose to add a role  
THEN I am prompted to enter the name, salary, and department for the role and that role is   added to the database  
WHEN I choose to add an employee  
THEN I am prompted to enter the employee’s first name, last name, role, and manager, and   that employee is added to the database  
WHEN I choose to update an employee role  
THEN I am prompted to select an employee to update and their new role and this information   is updated in the database  

## Credits
https://darifnemma.medium.com/how-to-interact-with-mysql-database-using-async-await-promises-in-node-js-9e6c81b683da  
https://courses.bootcampspot.com/courses/3100/assignments/48730?module_item_id=890747

## Tests
Visualizing the tables resulting of the user's data queries and the successfully messages will test the right functionality of the program.

## Email
Contact me with additional questions at this email address:

dimartoro@gmail.com

## GitHub
https://github.com/dimartoro

## License
This app is licensed under [MIT](https://choosealicense.com/licenses/mit/) lincense

## VideoLink
https://drive.google.com/file/d/1Ic14KwgC7xy8tJC7A5SB_llg_hcsXhf1/view

