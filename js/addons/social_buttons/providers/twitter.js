(function (_, $) {
  const $twitter = $('[data-ca-social-buttons="twitter"]');
  if (!$twitter.length || typeof $twitter.data() === 'undefined' || !$twitter.data('caSocialButtonsSrc')) {
    return;
  }
  $.ceLazyLoader({
    src: $twitter.data('caSocialButtonsSrc'),
    event_suffix: 'twitter',
    callback: function () {
      if (!$('.twitter-share-button').length || typeof twttr === 'undefined') {
        return;
      }
      twttr.widgets.load();
    }
  });
})(Tygh, Tygh.$);