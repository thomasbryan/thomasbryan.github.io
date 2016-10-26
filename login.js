/* Init */
var app = {"auth": readCookie('project'),"mode":readCookie('mode'),"cache":{}};
if(typeof($.fn.modal) === 'undefined') document.write('<script src="fonts/bootstrap.min.js"><\/script>')
$(document).ready(function() {
  if($('body').css('color') != 'rgb(51, 51, 51)') {
    $localbootstrap = $('<link rel="stylesheet" href="fonts/bootstrap.min.css">');
    $("head").prepend($localbootstrap);
    $localbootstrap.on('load',function() { $('#init').remove(); });
  }else{ $('#init').remove(); }
  if($('.fa').css('display') != 'inline-block') $("head").prepend('<link rel="stylesheet" href="fonts/font-awesome.min.css">');
  if(app.mode==null) app.mode = updateCookie("mode","plan",7);
  if(app.auth!=null) init();
});
/* Authentication */
$('#login form').on('submit',function(e){
  var user = $('#user').val()
    , pass = $('#pass').val()
    ;
  $('#user,#pass').val('');
  e.preventDefault();
  action({"u":"https://home.thomasbryan.info/auth/","d":{"app":"project","user":user,"pass":pass},"f":"loggedin"});
});
function login() {
  $('#user,#pass').val('');
  $('#login').removeClass('hidden');
  $('#user').focus();
}
function loggedin(req) {
  app.auth=req;
  updateCookie("project",app.auth,7);
  init();
}
$(document).on('click touchstart','#logout',function(e) {
  deleteCookie('project');
  login();
});
/* Utilities */
function init() {
  updateCookie("mode",app.mode,7);
  window.location.href = "v2.html";
}
function action(r) {
  $.ajax({
    beforeSend: function(e) { e.setRequestHeader('Authorization', app.auth); },
    statusCode: { 403: function() { login(); } },
    type: "POST",
    url: r.u,
    data: r.d
  }).done(function(res){
    window[r.f](res);
  });
}
function createCookie(n,v,d) {
  var e = ''
    , t = new Date()
    ;
  if(d) {
    t.setTime(t.getTime() + (d * 24 * 60 * 60 * 1000));
    e = "; expires=" + t.toGMTString();
  }
  document.cookie = encodeURIComponent(n)+"="+encodeURIComponent(v)+e+"; path=/;secure";
}
function readCookie(n) {
  var e = encodeURIComponent(n) + "="
    , d = document.cookie.split(';')
    ;
  for(var i = 0; i < d.length; i++) {
    var c = d[i];
    while(c.charAt(0) === ' ') c = c.substring(1, c.length);
    if(c.indexOf(e) === 0) return decodeURIComponent(c.substring(e.length,c.length));
  }
  return null;
}
function updateCookie(n,v,d) {
  deleteCookie(n);
  createCookie(n,v,d);
}
function deleteCookie(n) {
  createCookie(n,"",-1);
}
$(document).on('click touchstart','a',function(e) {
  e.preventDefault();
});
