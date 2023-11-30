const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const subCategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    slug: {
        type: String,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }
});

module.exports = mongoose.model('SubCategory', subCategorySchema);