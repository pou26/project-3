const { default: mongoose } = require("mongoose");

const userSchema=new mongoose.Schema({ 
    title: {
        type:String, 
        require:true, 
        enum:["Mr", "Mrs", "Miss"]
    },
    name: {
        type:String,
        require:true
    },
    phone: {
        type:String, 
        require:true,
        unique:true
    },
    email: {
        type:String,
        require:true,
        unique:true
    }, 
    password: {
        type:String,
        required:true,
    },
    address: {
      street: {type:String},
      city: {type:String},
      pincode: {type:String}
    },

},
{timestamps:true});

  module.exports=mongoose.model("User",userSchema);
