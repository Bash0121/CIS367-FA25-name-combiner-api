const { randomInt } = require('crypto')
const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const PORT = 3000
const sqlite3 = require('sqlite3').verbose()

// --------------------
const dbpath = path.join(__dirname, 'name-api-database.db')
const db = new sqlite3.Database(dbpath, (err) => {
    if (err) {
        console.log('Couldnt connect to the database ' + err.message)
        process.exit(1)
    }

    console.log('Connected to the database ' + dbpath)
})

db.serialize( () => {
    db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
    db.run(`
    CREATE TABLE IF NOT EXISTS combo_names (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name1 TEXT NOT NULL,
      name2 TEXT NOT NULL,
      names TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
})

app.get("/api/names", (req, res) => {

    db.all("SELECT * FROM combo_names ORDER BY created_at DESC", [], (err, rows) => {
        if (err) res.statusCode(500).json({error: err.message})

        res.json(rows)
    })

})

app.post("/api/names", (req, res) =>{

    const name1 = 'john'
    const name2 = 'bob'
    const names = "['jonbob' ,'bobjohn' ,'bohn']" 

    db.run(`
    INSERT INTO combo_names (name1, name2, names) VALUES (?, ?, ?)`,
        [name1, name2, names],
        (err)=> {
            if (err) res.statusCode(500).json({error: err.message})
        }
    )
    res.status(201)    
})

/* 
GET: /api/combine?name1=James&name2=Alvin 
*/
app.get("/api/combine", (req, res)=> {

    let result = {
        name1:"",
        name2:"",
        results: []
    }

    // extract the query string params 
    let { name1, name2 } = req.query
    result.name1 = name1
    result.name2 = name2

    // compute combinations
    
    const comboName1 = name1.split("").slice(0, 1).join("") + name2
    const comboName2 = name2.split("").slice(0, 5).join("") + name1
    const comboName3 = name1.split("").slice(0, 3).join("") + name2

    const goodness1 = (Math.random()*6).toFixed(2) 
    const goodness2 = (Math.random()*6).toFixed(2)
    const goodness3 = (Math.random()*6).toFixed(2)
    
    result.results.push({id: 1, name: comboName1, goodness: goodness1})
    result.results.push({id: 2, name: comboName2, goodness: goodness2})
    result.results.push({id: 3, name: comboName3, goodness: goodness3})

    // create array of results


    // write the results to a file
    const filePath = path.join(__dirname, "/logs/output.log")
    //console.log(filePath)
    fs.appendFile(filePath, `${new Date().toISOString()} | ${JSON.stringify(result)}\n`, (err)=> {
        console.log(err)
    })

    //send back the response with the data
    res.json(result)
})

/*
{   
    "name1":"John", 
    "name2":"Bob", 
    "results": [{"id":1, "name":"JohnBob", "goodness":4.0},
                {"id":2, "name":"Bohn",    "goodness":1.0}
                {"id":3, "name":"Johob",   "goodness":3.5}] 
}
*/





app.listen(PORT, ()=> {
    console.log(`Server started on http://localhost:${PORT}`)
})