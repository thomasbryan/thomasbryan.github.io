/* Init */
var app = {"auth": readCookie('project'),"cache":{}};
if(typeof($.fn.modal) === 'undefined') {document.write('<script src="fonts/bootstrap.min.js"><\/script>')}
$(document).ready(function() {
  if($('body').css('color') != 'rgb(51, 51, 51)') {
    $localbootstrap = $('<link rel="stylesheet" href="fonts/bootstrap.min.css">');
    $("head").prepend($localbootstrap);
    $localbootstrap.on('load',function() { $('#init').remove(); });
  }
  if($('.fa').css('display') != 'inline-block') 
    $("head").prepend('<link rel="stylesheet" href="fonts/font-awesome.min.css">');
  if(app.auth!=null) 
    plan();
});
/* Planning */
$(document).on('click touchstart','.navbar-brand',function() {
  plandata([{"trunk":0,"branch":0,"name":"","info":""}]);
  if($('#name').is(':visible')) $('#name').focus();
  $('#twig').addClass('hidden');
});
$(document).on('click touchstart','.branch',function() {
  var branch = $(this).data('branch');
  action({"u":"https://home.thomasbryan.info/project/","d":{"req":"read","branch":branch},"f":"read"});
});
$(document).on('click touchstart','#twig',function() {
  plandata([{"trunk":parseInt($('#branch').val()),"branch":0,"name":"","info":""}]);
  $('#twig').addClass('hidden');
});
function read(req) {
  plandata({"trunk":req[0].trunk,"branch":req[0].branch,"name":req[0].name,"info":req[0].info});
  $('#twig').removeClass('hidden');
}
function plandata(req) {
  $('#trunk').val(req.trunk);
  $('#branch').val(req.branch);
  $('#name').val(req.name);
  $('#info').val(req.info);
}
$('#plan form').on('submit',function(e) {
  var trunk = $('#trunk').val()
    , branch = $('#branch').val()
    , name = $('#name').val()
    , info = $('#info').val()
    ;
  e.preventDefault();
  action({"u":"https://home.thomasbryan.info/project/","d":{"req":"update","trunk":trunk,"branch":branch,"name":name,"info":info},"f":"createupdate"});
});
function createupdate(req) {
  var branch = parseInt(req.branch)
    , id = '#branch-'+branch
    , name = $('#name').val()
    ;
  if($(id)) {
    $(id+' a').html($('#name').val());
  }else{
    $('#content .nav').append('<li id="branch-'+branch+'" class="branch" data-branch="'+branch+'"><a href="#">'+name);
  }
}
function plan() {
  hide();
  $('#plan, #search, #nav .plan').removeClass('hidden');
  $('#name').focus();
  action({"u":"https://home.thomasbryan.info/project/","d":{"req":"projects"},"f":"projectlist"});
}
function projectlist(req) {
  $.each(req,function(k,v) {
    $('#content .nav').append('<li id="branch-'+v.branch+'" class="branch" data-branch="'+v.branch+'"><a href="#">'+v.name+'<i class="twig t'+v.twigs+' btn btn-success pull-right fa fa-leaf">');
  });
}
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
  hide();
  $('#user,#pass').val('');
  $('#login').removeClass('hidden');
  $('#user').focus();
}
function loggedin(req) {
  app.auth=req;
  updateCookie("project",app.auth);
  plan();
}
$(document).on('click touchstart','#logout',function(e) {
  deleteCookie('project');
  login();
});
/* Utilities */
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
  document.cookie = encodeURIComponent(n)+"="+encodeURIComponent(v)+e+"; path=/";
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
function hide() {
  $('#content > .col-sm-9 > div, #search, #nav li').addClass('hidden');
  $('#content > .col-sm-3 li').remove();
}
