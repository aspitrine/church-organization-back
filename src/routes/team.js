import _ from 'lodash';
import {checkLogged, filterOnChurch, addChurchInBody} from '../tools/access';
import ensureArray from 'ensure-array';
import restify from '../restify';

module.exports = (router, models) => {
  restify(router, models, 'Team', '/api/teams', {
    preRead: [filterOnChurch],
    preCreate: [addChurchInBody],
    preUpdate: [filterOnChurch, addChurchInBody],
    preDelete: [filterOnChurch],
    preMiddleware: [checkLogged]
  });

  router.post('/api/teams/addUsersToTeam/:teamId', async (req, res) => {
    try {
      const churchId = _.get(req, 'decoded.payload.churchId');
      const request = {
        id: req.params.teamId,
        churchId: churchId
      };
      const team = await models.Team.findOne({where: request});

      if (!team) {
        res.status(401).send({result: 'Unauthorized', status: 'error'});
      } else {
        const usersToRemove = ensureArray(_.get(req, 'body.usersIdToRemove'));
        const usersToAdd = ensureArray(_.get(req, 'body.usersIdToAdd'));

        await team.removeUsers(usersToRemove);
        await team.addUsers(usersToAdd);

        const result = await models.Team.findOne({
          where: request, include: [{
            association: models.Team.User
          }]
        });

        res.send({result: result, status: 'success'});
      }
    } catch (e) {
      console.log(e);
      res.status(500).send({result: e, status: 'error'});
    }
  });
};