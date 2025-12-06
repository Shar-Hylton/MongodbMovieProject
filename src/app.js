const express = require('express');
const app = express();

const path = require('path');
const {check, ValidateResult} = require('express-validator')

require('dotenv').config();

const PORT = process.env.PORT || 8000;

const onServerStart = () => {
    console.log(`Server is now running at http://localhost:${PORT}`)
    console.log("Press CTRL+C to stop")

}

app.listen(PORT, onServerStart);