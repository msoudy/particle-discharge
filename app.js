const express = require('express');

const app = express();

app.use(express.static(__dirname + '/dist'))

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});