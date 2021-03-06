const NodeGit = require('nodegit');
const path = require('path');
const promisify = require('promisify-node');
const fse = promisify(require('fs-extra'));
const { findRef } = require('./refs');
const { pushOrigin } = require('./transport');

const ensureDir = promisify(fse.ensureDir);


const { curry } = require('ramda');

const createSignature = (name, email) => NodeGit.Signature.create(
  name,
  email, new Date().getTime() / 1000, -new Date().getTimezoneOffset(),
);

const applyChange = curry((repo, change) => {
  const absPath = path.join(repo.workdir(), change.path);
  return change.remove ? fse.remove(absPath) : ensureDir(path.dirname(absPath))
    .then(fse.writeFile(absPath, change.content));
});

async function writeTree(repo, changes) {
  await Promise.all(changes.map(applyChange(repo)));
  const index = await repo.refreshIndex();
  const process = change => (
    change.remove ? index.removeByPath : index.addByPath
  ).bind(index)(change.path.replace(/^\.\//, ''));
  await Promise.all(changes.map(process));
  await index.write();
  return index.writeTree();
}

async function getReferenceCommit(repo, ref) {
  const referenceNode = await NodeGit.Reference.nameToId(repo, ref);
  return repo.getCommit(referenceNode);
}

async function commit(repo, user, changes, message, refName = 'master') {
  const author = createSignature(user.name, user.email);
  const committer = author;
  const { ref } = await findRef(repo, refName);

  const [oid, parentCommit] = await Promise.all([
    writeTree(repo, changes),
    getReferenceCommit(repo, ref),
  ]);

  return repo.createCommit(ref, author, committer, message, oid, [parentCommit]);
}

const commitAndPush = (repo, user, changes, message, refName = 'master') => commit(repo, user, changes, message, refName)
  .then(() => pushOrigin(repo));

module.exports = {
  commit,
  commitAndPush,
};
