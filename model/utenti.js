const mongoose =require('mongoose');
const Schema = mongoose.Schema;

const modeluserschema=new Schema({
    nome:{
        type:String,
        required:true
    },
    cognome:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

mongoose.model('utenti',modeluserschema);