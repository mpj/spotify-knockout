/**
 * Knockout.js binding that wraps the Stitch image view.
 *
 * Usage:
 * <div data-bind="stitchImage: obj"></div>
 *
 * - obj: An Album, Collection, Disc or Playimage. Also allowed to be a falsy value
 *
 */
require([
  '$views/image#Image',
  '$api/models'
],
function(Image, models) {

  var stitchItemToLinkElement = function(item) {
    var link = document.createElement('a');
    link.href = item.uri.toSpotifyURL();
    link.innerHTML = item.name;
    return link;
  };

  ko.bindingHandlers.spotifyImage = {
    update: function(element, valueAccessor, allBindingsAccessor) {

      var obj = ko.utils.unwrapObservable(valueAccessor());
      var oldImage = element._image;
      if (oldImage) { oldImage.destroy(); }

      if (element.firstChild) { element.removeChild(element.firstChild); }

      if (!obj) { return; }

      var allBindings = allBindingsAccessor();

      var options = allBindings.stitchImageOptions;

      var image = new Image(obj, options);
      element.appendChild(image.node);
      element._image = image;

      // The lego team is working on letting the image view handle this, but until then:
      if (options.autoOverlay) {
        if (obj instanceof models.Album) {
          obj.load(['name', 'artists']).done(function() {
            obj.artists[0].load('name').done(function() {
              image.setOverlay(stitchItemToLinkElement(obj.artists[0]).outerHTML, stitchItemToLinkElement(obj).outerHTML);
            });
          });
        } else if (obj instanceof models.Artist) {
          obj.load(['name']).done(function() {
            image.setOverlay(stitchItemToLinkElement(obj).outerHTML);
          });
        } else if (obj instanceof models.Track) {
          obj.load(['name', 'artists']).done(function() {
            obj.artists[0].load('name').done(function() {
              image.setOverlay(stitchItemToLinkElement(obj.artists[0]).outerHTML, stitchItemToLinkElement(obj).outerHTML);
            });
          });
        }
      }
    }
  };

});
