/**
 * Knockout.js binding that wraps the Stitch list view.
 *
 * Usage:
 * <div data-bind="stitchList: obj"></div>
 *
 * - obj: An Album, Collection, Disc or Playlist. Also allowed to be a falsy value
 *
 */
require([
  '$views/list#List'
],
function(List) {

  ko.bindingHandlers.stitchList = {
    update: function(element, valueAccessor, allBindingsAccessor) {

      var obj = ko.utils.unwrapObservable(valueAccessor());
      var oldList = element._list;
      if (oldList) { oldList.destroy(); }

      if (element.firstChild) { element.removeChild(element.firstChild); }

      if (!obj) { return; }

      var allBindings = allBindingsAccessor();

      var list = new List(obj, allBindings.stitchListOptions);
      element.appendChild(list.node);
      list.init();
      parent._list = list;
    }
  };

});
