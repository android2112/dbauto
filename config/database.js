if(process.env.NODE_ENV === 'production'){
    module.exports = {mongoURI: 'mongodb://auto:autoauto1@ds141221.mlab.com:41221/database-prod'}
}else{
    module.exports = {mongoURI: 'mongodb://localhost/user'}
}