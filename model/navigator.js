require([
  '$api/models'
],
function(models) {

  /**
   * Reactive wrapper around the Stitch URI navigation.
   * Has only one member, args. Let all navigation pass
   * through it, and url navigation and back/forward buttons
   * of browsers will work.
   *
   * @constructor
   * @param {string} appName The name of your app. Stitch
   *                         will need this to know which app
   *                         to pass the request to.
   */
  exports.Navigator = function(appName) {


    // Private observable that holds the
    // current args of the application.
    var _args = ko.observable([]);

    bindToApplicationArguments(_args);

    this.args = ko.computed({
      read: function() {
        return _args();
      },
      write: function(value, replace) {
        var uri;
        if (typeof value === 'string') {
          uri = value;
        } else {
          uri = 'spotify:app:' + appName;
          value.forEach(function(a) {
            uri += ':' + a;
          });
        }
        models.application.openURI(uri, replace);
      }
    });

  };

  /**
   * Keeps a Knockout Observable in sync with the application
   * arguments.
   *
   * @param  {Knockout.Observable} observable The observable to keep in sync.
   */
  function bindToApplicationArguments(observable) {
    var onChange = function() {
      observable(models.application['arguments']);
    }
    models.application.addEventListener('arguments', onChange);
    models.application.load('arguments').done(onChange);
  }

});
