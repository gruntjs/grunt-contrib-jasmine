var template = __dirname + '/template.tmpl';

exports.process = function(grunt, task, context) {
  var source = grunt.file.read(template);
  task.eventDispatcher.on('template.notify', function (message) {
    console.log(message);
  });
  return grunt.util._.template(source)(context);
};
