const {
  map, compose, objOf, merge, zip, head, pipe, filter, propOr, last, all, identity,
} = require('ramda');
const gitolite = require('../gitolite');
const git = require('../git');
const types = require('./types');
const { Cred } = require('nodegit');

const { getConfig } = require('../../config');

const username = propOr('@all', 'username');

const entryFromName = compose(merge({ provider: 'local' }), objOf('name'));

const listRepos = usr => gitolite.listRepos(usr)
  .then(repos => Promise.all(repos.map(repo => gitolite.access(repo, username(usr), 'R')))
    .then(zip(repos))
    .then(pipe(
      filter(last),
      map(head),
      map(entryFromName),
    )));
const getLocalRepoWd = repoPath => `/tmp/gitwiki/local/${repoPath}`;

const getCredentialCallback = () => (url, userName) => Cred.sshKeyFromAgent(userName);

async function getRepository(user, repoPath) {
  const allow = await gitolite.access(repoPath, user.username, 'R');
  if (allow) {
    const sshUser = getConfig('gitolite.user');
    const uri = `${sshUser}@localhost:${repoPath}`;
    const dest = getLocalRepoWd(repoPath);
    return git.getRepo(uri, dest, getCredentialCallback());
  }
};

async function commitAndPush(...args) {
  const [repo, user, changes] = args;
  const allow = await Promise.all(changes.map(({ path }) =>
    gitolite.access(repo, user.username, 'W', path))).then(all(identity));
  if (allow) {
    return git.commitAndPush(args);
  }
};

const provider = types.LOCAL;

module.exports = {
  listRepos, getRepository, provider, getCredentialCallback, commitAndPush,
};
