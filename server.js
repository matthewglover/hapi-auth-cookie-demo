const Hapi = require('hapi');
const CookieAuth = require('hapi-auth-cookie');

const server = new Hapi.Server();
server.connection({ port: 4000 });

server.register(CookieAuth, (err) => {
  if (err) console.log(err);

  server.auth.strategy('session', 'cookie', {
    password: 'supersecretpasswordsupersecretpassword',
    cookie: 'app-cookie', // Cookie name
    isSecure: false,
    ttl: 24 * 60 * 60 * 1000 // Set session to 1 day
  });

  server.route({
    method: 'GET',
    path: '/login',
    handler(request, reply) {
      const { name, password } = request.query;
      if (name === 'matt' && password === 'secret') {
        request.cookieAuth.set({ name, password });
        console.log('here...');
      }
      reply.redirect('/test-auth');
    },
  });

  server.route({
    method: 'GET',
    path: '/private-route',
    config: {
      auth: 'session',
      handler(request, reply) {
        reply('Yeah! This message is only available for authenticated users!');
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/test-auth',
    config: {
      auth: {
        mode: 'try',
        strategy: 'session'
      },
      handler(request, reply) {
        reply(request.auth.isAuthenticated
          ? 'You\'re authenticated :)'
          : 'You\'re not authenticated :(');
      }
    }
  });



  server.start(function (err) {
    console.log('info', 'Server running at: ' + server.info.uri);
  });
});
