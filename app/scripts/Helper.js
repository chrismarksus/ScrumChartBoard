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
  calcPercentage(completed, commited){
    if(commited === 0){
      return Math.round(completed * 100);
    }
    return Math.round((completed / commited) * 100);
  }
}
export default Helper;
