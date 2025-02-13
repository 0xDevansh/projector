export default {
  apps: [{
    script: 'dist/server.js',
    args: '--dev',
    watch: 'dist',
    env: {
      PORT: '8000',
      no_proxy: 'localhost,127.0.0.0,127.0.0.1,127.0.1.1',
    },
  },
    // {
    // script: 'req_proxy.py',
    // args: '5005',
    // watch: ['req_proxy.py'],
    // env: {
    //   no_proxy: 'localhost,127.0.0.0,127.0.0.1,127.0.1.1',
    // },
  // }
  ],
}
