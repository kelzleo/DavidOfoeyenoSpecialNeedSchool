const express = require('express');


const app = express();

app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
app.use(express.static('public'));



app.get('/about', (req, res) => {
    res.render('About', { title: 'About us' });
})



app.get('/Autism', (req, res) => {
    res.render('Autism', { title: 'Autism' })
});

app.get('/Academics', (req, res) => {
    res.render('Academics', { title: 'Academics' })
});




app.get('/', (req, res) => {
    res.render('home', { title: 'Home' })
})

app.get('/staffs', (req, res) => {
    res.render('staffs', { title: 'Staffs' })
})

app.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact' })
})