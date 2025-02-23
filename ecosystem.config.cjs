module.exports = {
  apps: [{
    name: 'projects',
    script: 'dist/server.js',
    watch: 'dist',
    env: {
      PORT: '8000',
      http_proxy: 'repo.iitd.ac.in:9999',
      HTTP_PROXY: 'repo.iitd.ac.in:9999',
      https_proxy: 'repo.iitd.ac.in:9999',
      HTTPS_PROXY: 'repo.iitd.ac.in:9999',
    },
  }, {
    name: 'py-proxy',
    script: 'req_proxy.py',
    args: '5005',
    watch: ['req_proxy.py'],
    env: {
      http_proxy: 'repo.iitd.ac.in:9999',
      HTTP_PROXY: 'repo.iitd.ac.in:9999',
      https_proxy: 'repo.iitd.ac.in:9999',
      HTTPS_PROXY: 'repo.iitd.ac.in:9999',
    },
  }],
}
