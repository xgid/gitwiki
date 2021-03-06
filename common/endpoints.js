const endpoints = {
  api: {
    tree: '/api/v1/repo/:provider/:name/tree/:ref/:path([\\S\\s]*)?',
    refs: '/api/v1/repo/:provider/:name/refs',
    index: '/api/v1/repo',
    user: '/api/v1/user',
    authGithub: '/api/v1/auth/github',
    authGithubPersonalToken: '/api/v1/auth/github/personal-access-token',
    authGithubCb: '/api/v1/auth/github/cb',
  },
  front: {
    tree: '/repo/:provider/:name/tree/:ref/:path([\\S\\s]*)?',
    edit: '/repo/:provider/:name/edit/:ref/:path([\\S\\s]*)?',
    index: '/repo',
  },
};

module.exports = endpoints;
