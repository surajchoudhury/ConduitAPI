
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagSchema = new Schema({
    article: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Article'
    }],
    body: {
        type: String
    }
})

module.exports = mongoose.model("Tag",tagSchema);