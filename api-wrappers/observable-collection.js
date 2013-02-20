require([
  'vendor/spotify-knockout/common/sp-computed#SPComputed'
], function(SPComputed) {

  var ko = window.ko;

  /**
   * Wraps a Stitch collection as a Knockout subscribable.
   *
   * @param  {models.Collection} stitchCollection The stitch collection to make subscribable.
   * @return {ko.subscribable} A subscribable version of the collection.
   *                           In addition the subscribable is patched with two
   *                           extra members, an isRefreshing subscribable,
   *                           and a moveCursor function.
   */
  function observableCollection(stitchCollection) {

    var self = SPComputed(function() {
      _issueRefreshIfNeeded();
      return _cache.items().slice(0);
    });

    /**
     * @type {ko.subscribable} A subscribable that returns a boolean
     *                         that indicates if the parent subscribable
     *                         is loading data from server.
     */
    self.isRefreshing = ko.observable(false);

    self.firstRefreshCompleted = ko.observable(false);
    var isRefreshingSubscription = self.isRefreshing.subscribe(function(value) {
      if (value === false) {
        self.firstRefreshCompleted(true);
        isRefreshingSubscription.dispose();
      }
    });

    /**
     * This is the reactive equivalent of the snapshot
     * function of the normal stitch collection.
     * Returns no promuse - subscribe to the parent
     * subscribable to respond to change.
     *
     * @param  {int} start  The index to start loading from.
     * @param  {int} length How many items to load from the index.
     */
    self.moveCursor = function(start, length) {
      if (typeof start !== 'number') {
        throw new Error('start must be a number. Was:' + start);
      }
      if (typeof length !== 'number') {
        throw new Error('length must be a number. Was:' + length);
      }
      _cursor(new Cursor(start, length));
    }

    var _issueRefreshIfNeeded = function() {
      if (!_isStale() || self.isRefreshing()) { return; }
      self.isRefreshing(true);

      var promise = stitchCollection.snapshot(_cursor().start, _cursor().length);

      promise.done(function(snapshot) {
        _cache.items(snapshot.toArray());
        _cache.cursor(_cursor());

        self.isRefreshing(false);
        _currentError(null);
      });

      promise.fail(function(res, err) { _currentError(err); });
    }

    var _isStale = SPComputed(function() {
      return _isValidCursor() && (!_cursorIsCached() || _changedSinceRefresh());
    });

    var _isValidCursor = SPComputed(function() {
      return _cursor().length !== null && _cursor().index !== null;
    });

    var _cursorIsCached = SPComputed(function() {
      return _cursor().equals(_cache.cursor());
    });

    var _cursor = ko.observable(new Cursor());
    var _cache = {
      cursor: ko.observable(new Cursor()),
      items: ko.observable([])
    };
    var _changedSinceRefresh = ko.observable(false);
    var _currentError = ko.observable(null);
    // TODO: We'll want to expose _currentError once we have some error
    // message to show on failure.

    stitchCollection.addEventListener('changed', function(e) {
      _changedSinceRefresh(true);
    });

    self.isRefreshing.subscribe(function(newValue) {
      if (newValue === false) { _changedSinceRefresh(false); }
    });

    return self;

  }

  function Cursor(start, length) {
    this.start = typeof start !== 'undefined' ? start : null;
    this.length = typeof length !== 'undefined' ? length : null;
    this.equals = function(cursor) {
      return (!!cursor && cursor.length === this.length && cursor.index === this.index);
    }
  }

  exports.observableCollection = observableCollection;

});
