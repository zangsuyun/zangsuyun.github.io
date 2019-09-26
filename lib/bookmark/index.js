(function (global) {
  &apos;use strict&apos;;

  var storage = global.localStorage;
  if (storage == null) {
    // if the localStorage is not exists
    storage = {
      // eslint-disable-next-line
      getItem: function () { return null },
      setItem: function () { },
      removeItem: function () { },
      clear: function () { },
    };
  }

  // get the saved bookmark object
  var getBookmark = function () {
    var mark = storage.getItem(&apos;bookmark&apos;);
    if (mark == null) {
      return null;
    }
    try {
      return JSON.parse(mark);
    } catch (e) {
      // invalid object saved in the storage
      // console.warn(&apos;Invalid bookmark object.&apos;);
      return null;
    }
  };

  var link;
  // register everything
  var init = function () {
    // bookmark-link style
    var style = global.document.createElement(&apos;style&apos;);
    style.type = &apos;text/css&apos;;
    var text = &apos;.book-mark-link{&apos;
      + &apos;border-bottom:none;&apos;
      + &apos;display:block;&apos;
      + &apos;position:fixed;&apos;
      + &apos;color:#222;&apos;
      + &apos;font-size:26px !important;&apos;
      + &apos;top:-10px;left:20px;&apos;
      + &apos;transition:.3s;&apos;
      + &apos;}&apos;
      + &apos;.book-mark-link:hover,.book-mark-link-fixed{top:-2px}&apos;
      // do not show when the width is not enough
      + &apos;@media(max-width:1090px){.book-mark-link{display:none}}&apos;;
    text = global.document.createTextNode(text);
    style.appendChild(text);
    global.document.head.appendChild(style);

    // create a link element
    // eslint-disable-next-line max-len
    link = $(&apos;<a class="book-mark-link book-mark-link-fixed fa fa-bookmark" href="#"></a>&apos;);
    $(global.document.body).append(link);

    var currentTop = 0;
    // scroll event
    $(global).on(&apos;scroll.bookmark&apos;, function () {
      var top = global.document.documentElement.scrollTop;
      if (top &gt; 0) {
        if (currentTop === 0) {
          link.removeClass(&apos;book-mark-link-fixed&apos;);
          currentTop = top;
        }
      } else {
        if (currentTop &gt; 0) {
          !link.hasClass(&apos;book-mark-link-fixed&apos;) &amp;&amp;
            link.addClass(&apos;book-mark-link-fixed&apos;);
          currentTop = 0;
        }
      }
    });
  };

  var loadBookmark = function () {
    var mark = getBookmark();
    if (mark == null) {
      return;
    }
    // found the bookmark
    $(function () {
      init();
      link.attr(&apos;href&apos;, mark.lastUri + &apos;#book:mark&apos;);
    });
  };

  var doScroll = function (top) {
    if (!isNaN(top)) {
      $(function () {
        // eslint-disable-next-line max-len
        $(global.document.documentElement).animate({ &apos;scrollTop&apos;: top }, &apos;fast&apos;);
      });
    }
  };

  var doSaveScroll = function (path, mark) {
    if (mark == null) {
      mark = {};
    }
    var top = global.document.documentElement.scrollTop;
    mark.lastUri = path;
    mark[path] = top;
    storage.setItem(&apos;bookmark&apos;, JSON.stringify(mark));
    link.animate({ top: -26 }, &apos;fast&apos;, function () {
      setTimeout(function () {
        link.css(&apos;top&apos;, &apos;&apos;);
      }, 400);
    });
    return mark;
  };

  var scrollToMark = function (trigger, hash) {
    var path = global.location.pathname;
    var mark = getBookmark();
    $(function () {
      init();
      // save the position by clicking the icon
      link.click(function () {
        mark = doSaveScroll(path, mark);
        return false;
      });

      // register beforeunload event when the trigger is auto
      if (trigger === &apos;auto&apos;) {
        // register beforeunload event
        global.addEventListener(&apos;beforeunload&apos;, function () {
          doSaveScroll(path, mark);
        });
      }
      // auto scroll to the position
      if (mark == null) {
        return;
      }
      // and if the page opens with a specific hash, just jump out
      var skips = [hash, &apos;#comments&apos;];
      // eslint-disable-next-line
      if (skips.filter(function (h) { return h === global.location.hash }).length &gt; 0) {
        return;
      }
      doScroll(mark[path]);
    });
  };

  global.bookmark = {
    loadBookmark: loadBookmark,
    scrollToMark: scrollToMark,
  };
})(window);
