import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import methodOverride from 'method-override';
import routerDynamic from './tools/router';
import getModels from './tools/database';
import { setDecodedToken } from './tools/access';

const app = express();
const port = 3000;
const router = express.Router();
const models = getModels();
/* Get all route in folder routes */
routerDynamic(router);

app.use(methodOverride());
/* Body parsers */
app.use(bodyParser.urlencoded({
  limit: '25mb',
  extended: true
}));
app.use(bodyParser.json({ limit: '25mb' }));
app.use(setDecodedToken);
app.use(router);

models.sequelize.sync().then(function() {
  app.listen(port, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log(`app started on port ${port}`);
    }
  });
});

