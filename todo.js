var express = require('express');
var todo = express();
var moment = require('moment');
var chalk = require('chalk');
var lowdb = require('lowdb');
var Fs = require('lowdb/adapters/FileSync');
var settings = [3000, 'TodoApp']
var todoDataFile = new Fs('data/todos.json');
var todoDb = lowdb(todoDataFile);
var flash = require('connect-flash');
var cookieparser = require('cookie-parser');
var session = require('express-session');

todo.set('view engine', 'ejs');
todo.use(express.json());
todo.use(express.urlencoded({extended: true}));
todo.use(express.static('public'));
todo.use(cookieparser('secret'));
todo.use(session({cookie: {maxAge: 60000}}));
todo.use(flash());
todo.use((req, res, next) => {
    res.locals.message = req.flash();
    next();
})

todo.get('/', async(req, res) => {
    todoDb.read();
    let json = JSON.parse(JSON.stringify(todoDb.get('todos').value()))
    res.render('index', {
        datas: json,
        title: settings[1]
    });
})
todo.post('/delete/:title', (req, res) => {

    todoDb.get('todos').remove({title: req.params.title}).write();
    req.flash('deleted', 'You have successfully deleted your todo.')
    return res.redirect('/');
})
todo.post('/newtodo', async(req, res) => {
    let receivedData = {
        type: req.body.type,
        title: req.body.title,
        todo: req.body.todo,
        date: moment().format('lll')
    }
    if((receivedData.title || receivedData.todo) <= 0){
        req.flash('error', 'Something was empty.');
        return res.redirect('/')
    }else{
        todoDb.get('todos').push(receivedData).write();
        req.flash('success', 'You successfully written your data to database');
        return res.redirect('/')
    }
})

var listen = todo.listen((3000 || settings[0]), () => {
    console.log(chalk.blue(`Server started on ${chalk.yellow('{port}')} ${chalk.bold(chalk.yellow('port'))}`).replace('{port}', listen.address().port));
})
