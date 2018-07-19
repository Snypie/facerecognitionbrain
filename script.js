const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')
const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'Preston',
      password : '',
      database : 'smartbrain'
    }
  });

db.select('*').from('users').then(data => {
    console.log(data);
});

const app = express ();

const database = {
    users: [
        {
        id: '123',
        name: 'john',
        password: 'cookies',
        email: 'john@gmail.com',        
        entries: 0,
        joined: new Date()
        },
        {
        id: '124',
        name: 'sally',
        password: 'bananas',
        email: 'sally@gmail.com',
        entries: 0,
        joined: new Date()
        }
    ],
    login: [
        {
            id: '987',
            hash:'',
            email: 'john@gmail.com'
        }
    ]
}

app.use(cors())
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.send(database.users);
})

app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
        .then(data => {
            data[0]
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash)
            if (isValid) {
                return db.select('*').from('users')
                .where('email', '=', req.body.email)
                .then(user => {
                    res.json(user[0])
                })
                .catch(err => res.status(400).json('problem'))
            } else {
            res.status(400).json('wrong password')
            }
        })
        .catch(err => res.status(400).json('wrong credentials'))
//code for before the db was set up

    // if (req.body.email === database.users[0].email &&
    // req.body.password === database.users[0].password) {
    //     res.json(database.users[0]);
    // } else {
    //     res.status(400).json('error logging in');
    // }
    // res.json('signin');
})

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    // bcrypt.hash(password, null, null, function(err, hash) {
    
    // });

    var hash = bcrypt.hashSync(password);
    db.transaction(trs => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginemail => {
            return trx('users')
            .returning('*')
            .insert({
                email: loginemail[0],
                name: name,
                joined: new Date()
            }).then(user => {
                res.json(user[0]);
            })
        })
        .then(trx.comit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('unable to register'))
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
db.select('*').from('users').where({id})
    .then(user => {
        if (user.length) {
            res.json(user[0])
        } else {
            res.status(400).json('Not found')
        }
})
.catch(err => res.status(400).json('not fount'))
// if (!found) {
//     res.status(404).json('no such user');
// }
})

app.put('/image', (req, res) => {
        const { id } = req.body;
    db('users').where('id', '=', 2000)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        console.log(entries)
    })
    .catch(err => res.status(400).json('not fount'))
})

// bcrypt.hash(password, null, null, function(err, hash) {
//     // Store hash in your password DB.
// });

// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });

app.listen(3000, () => {
    console.log('app is running');
})


/*

/ --> res = this is working
/signin --> post = success/fail
/register --> post = user
/profile/:userId --> get = user
/image --> put --> user (count)

*/