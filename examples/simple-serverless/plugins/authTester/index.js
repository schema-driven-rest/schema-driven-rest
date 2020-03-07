module.exports.plugin = function(options, config) {
  let authResult = '';
  for (const controller of options.types.filter(a => a.directives.find(a => a.name === 'controller'))) {
    for (const method of controller.methods) {
      const auth = method.directives.find(a => a.name === 'auth');
      if (auth) {
        authResult += `const validate_${method.name}=true;`;
      }
    }
  }
  return authResult;
};

module.exports.config = {
  dependsOn: ['@sdr/controller'],
};
