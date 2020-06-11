(function () {
  var ourSwitch = document.getElementById('light-switch');
  var body = document.getElementsByTagName('body')[0];
  const DARK = 'dark';
  const LIGHT = 'light';

  if (!!ourSwitch) {
    initTheme();

    function initTheme() {
      var currentHour = (new Date()).getHours();
      var themeData = localStorage.getItem('theme');
      var isDarkModeEnabled = localStorage.getItem('theme') === DARK;
      if (!!themeData) {
        body.setAttribute('data-theme', themeData);
      } else {
        if (currentHour >= 18 && currentHour <= 5) {
          body.setAttribute('data-theme', DARK);
        } else {
          body.setAttribute('data-theme', LIGHT);
        }
      }
    }

    ourSwitch.addEventListener('click', function (e) {
      var currentTheme = body.getAttribute('data-theme');
      if (currentTheme === LIGHT) {
        body.setAttribute('data-theme', DARK);
        localStorage.setItem('theme', DARK);
      } else {
        body.setAttribute('data-theme', LIGHT);
        localStorage.setItem('theme', LIGHT);
      }
    });
  }
})();

