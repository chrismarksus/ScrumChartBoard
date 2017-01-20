class Helper {

  constructor(){}

  mmddyyyy(val) {
    const date = new Date(val);
    const mm = date.getMonth() + 1;
    const dd = date.getDate();
    const yy = date.getFullYear();

    return `${mm}/${dd}/${yy}`;
  }
  queryString(str, win = window) {
    var v = win.location.search.match(new RegExp('(?:[\?\&]'+str+'=)([^&]+)'));
    return v ? v[1] : null;
  }
}
