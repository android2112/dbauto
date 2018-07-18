const express=require('express');
const mongoose=require('mongoose');
const app=express();
const handlebarsxps=require('express-handlebars');
const bodyParser=require('body-parser');
const methodOverride=require('method-override');
const flash=require('connect-flash');
const session=require('express-session');
const bcrypt=require('bcryptjs');


//INTEGRAZIONE FILE CONFIG DATABASE
const db = require('./config/database');


//CONNESSIONE A MONGOOSE

    mongoose.Promise=global.Promise;
    mongoose.connect(db.mongoURI,{
        useMongoClient:true,
    })
    .then(()=>console.log('server connesso'))
    
    .catch(err=>console.log('non connect available'))
   

    const port =process.env.PORT ||  3000;


app.listen(port ,()=>{
    console.log('Connesso al database!!')
})



//SCHEMA E MODELLO PER UTENTE
require('./model/user');
const user=mongoose.model('user');

//SCHEMA E MODELLO PER LOGIN
require('./model/utenti');
const userlogin=mongoose.model('utenti');
 
// MIDDLEWARE PER HANDLEBARS
app.engine('handlebars', handlebarsxps({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


//MIDDLEWARE PER METODO OVERRIDE PER MODIFICA USER
app.use(methodOverride('_method'))


//MIDDLEWARE PER SESSIONE
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    
  }));


  //MIDDLEWARE PER MESSAGGI FLASH

  app.use(flash());


  //GESTIONE VARIABILI GLOBALI PER UTILIZZO MESSAGGI FLASH

  app.use((req,res,next)=>{
    res.locals.msg_successo = req.flash('msg_successo');
    res.locals.msg_errore = req.flash('msg_errore');
    res.locals.errore = req.flash('errore');
    next();
  });




//BODY PARSER MIDDLEWARE

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//ROUTE INDEX PAGE
app.get('/',(req , res )=>{
    const titolo="DATABASE";
    res.render('index',{titolo:titolo})
});

//ROUTE LOGIN PAGE
app.get('/login',(req,res)=>{
    res.render('login')
})

//ROUTE REGISTRATION PAGE
app.get('/registration',(req,res)=>{
    res.render('registration')
})

//ROUTE PAGE USER REGISTRATION
app.get('/aggiungi',(req , res)=>{
    res.render('aggiungi')
    
})

//ROUTE PER LISTA USERS
app.get('/lista_users' , (req , res)=>{
    user.find({})
    .sort({date:'desc'})
    .then(user=>{
        res.render('lista_users' ,{
            user:user
        });
    });

    });

//ROUTE PER MODIFICA USER
app.get('/modifica_user/:id',(req,res)=>{
    
    user.findOne({
        _id:req.params.id
    })
    .then(user=>{
        res.render('modifica_user',{
            user:user});
            console.log(user);
    });
    
});



//GESTIONE DEL FORM PER AGGIUNTA USER

app.post('/aggiungi',(req,res)=>{
    let errori=[];
    if(!req.body.nome){
        errori.push({text:'Devi riempire questo campo titolo'});
    }
    if(!req.body.cognome){
        errori.push({text:'Devi riempire questo campo testo'});
    }
    if(!req.body.email){
        errori.push({text:'Devi riempire questo campo testo'});
    }
    if(errori.length>0){
        res.render('aggiungi',{
            errori:errori,
            nome:req.body.nome,
            cognome:req.body.cognome,
            email:req.body.email
        
        });
        
    }else{
        //res.send("ok inserito");
        const nuovouser={
            nome:req.body.nome,
            cognome:req.body.cognome,
            email:req.body.email
           
        }
           
        new user(nuovouser)
        .save()
        .then(user =>{
            req.flash('msg_successo','User aggiunto correttamente'); //messaggio flash
           res.redirect('/lista_users');
            
        })
        

            

    }
})

//GESTIONE FORM PER ELIMINAZIONE USER

app.delete('/lista_users/:id',(req,res)=>{
    user.remove({
        _id:req.params.id
    })
    .then(user=>{

        req.flash('msg_errore','User cancellato correttamente');
        res.redirect('/lista_users');
    })
})

// app.post('/lista-whatever/:id',(req,res)=>{
//     console.log("lista-users ", req.params.id)
//     res.send("Hello!")
// })
//GESTIONE DEL FORM PER MODIFICA USER

app.post('/modifica_user/:id',(req,res)=>{
user.findOne({
    _id:req.params.id
})

.then(user=>{
user.nome=req.body.nome
user.cognome=req.body.cognome
user.email=req.body.email

user.save()
.then(user=>{
    req.flash('msg_successo','User modificato correttamente!');
    res.redirect('/lista_users')
});
});


});


//GESTIONE FORM REGISTRAZIONE

//GESTIONE FORM REGISTRAZIONE
app.post('/registration', (req, res) => {  
    let errori = [ ];
    if(req.body.password != req.body.conferma_psw){
        errori.push({text: 'password non corrispondenti'});
    }
    if(req.body.password.length < 6){
        errori.push({text: 'la password deve avere almeno 6 caratteri'});
    }
    if(errori.length > 0){
        res.render('registration' , {
    errori:errori,
    nome: req.body.nome,
    cognome: req.body.cognome,
    email: req.body.email,
    password: req.body.password,
    conferma_psw: req.body.conferma_psw
        });
    }else{
        userlogin.findOne({email: req.body.email})
        .then(utente =>{
            if(utente){
                req.flash('msg_errore' , 'questa mail è già registrata');
                res.redirect('/registration');
            }else{
                const nuovoUtente = new userlogin({
                    nome: req.body.nome,
                    cognome: req.body.cognome,
                    email: req.body.email,
                    password: req.body.password
                });
    
            bcrypt.genSalt(10, (err , salt)=>{
            bcrypt.hash(nuovoUtente.password,  salt, (err, hash)=>{
        if(err) throw err;
        nuovoUtente.password = hash;
        nuovoUtente.save()
        .then(utente =>{
        req.flash('msg_successo' , 'Bene, ti sei registrato');
        res.redirect('login');
        })
       .catch(err =>{
           console.log(err);
           return;
        });
    });
            });
            }
        });
    }
    });
    




    