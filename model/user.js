const mongoose =require('mongoose');

const userschema=mongoose.Schema({
    cognome:{
        type:String,
        required:true
    },
    nome:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    }
})

mongoose.model('user',userschema);