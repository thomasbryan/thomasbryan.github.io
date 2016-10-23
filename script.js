/* Init */
var app = {"auth": readCookie('project'),"mode":readCookie('mode'),"cache":{}};
if(typeof($.fn.modal) === 'undefined') {document.write('<script src="fonts/bootstrap.min.js"><\/script>')}
$(document).ready(function() {
  if($('body').css('color') != 'rgb(51, 51, 51)') {
    $localbootstrap = $('<link rel="stylesheet" href="fonts/bootstrap.min.css">');
    $("head").prepend($localbootstrap);
    $localbootstrap.on('load',function() { $('#init').remove(); });
  }
  if($('.fa').css('display') != 'inline-block') 
    $("head").prepend('<link rel="stylesheet" href="fonts/font-awesome.min.css">');
  startTime();
  if(app.mode==null) app.mode = updateCookie("mode","plan");
  if(app.auth!=null) init();
});
/* Planning */
$(document).on('touchend','.navbar-brand',function() {
  var dom = '#content .col-sm-3';
  if($(dom).hasClass('hidden-xs')) {
    $(dom).removeClass('hidden-xs');
  }else{
    $(dom).addClass('hidden-xs');
  }
});
$(document).on('click','.navbar-brand',function() {
  plandata({"trunk":0,"branch":0,"name":"","info":""});
  if($('#name').is(':visible')) $('#name').focus();
  $('#twig').addClass('hidden');
});
$(document).on('click touchend','.branch',function() {
  var branch = $(this).parent().data('branch');
  $('#content .col-sm-3').addClass('hidden-xs');
  action({"u":"https://home.thomasbryan.info/project/","d":{"req":"read","branch":branch},"f":"read"});
});
$(document).on('click','.twig',function() {
  var branch = $(this).parent().data('branch');
  app.cache.twig=branch;
  action({"u":"https://home.thomasbryan.info/project/","d":{"req":"trunks","branch":branch},"f":"twigs"});
});
$(document).on('click','#twig',function() {
  plandata({"trunk":parseInt($('#branch').val()),"branch":0,"name":"","info":""});
  $('#twig').addClass('hidden');
});
function read(req) {
  plandata({"trunk":req[0].trunk,"branch":req[0].branch,"name":req[0].name,"info":req[0].info});
  $('#twig').removeClass('hidden');
}
function twigs(req) {
  var lvl = $('#branch-'+app.cache.twig+' a .fa-chevron-right').length + 1
    , pre = ''
    ;
  for(i=0;i<lvl;i++) {
    pre += '<i class="fa fa-chevron-right"></i>';
  }
  $('.trunk-'+app.cache.twig).remove();
  $.each(req,function(k,v) {
    $('#branch-'+app.cache.twig).after('<li id="branch-'+v.branch+'" class="trunk-'+app.cache.twig+'" data-branch="'+v.branch+'"><a href="#" class="branch">'+pre+' <span>'+v.name+'</span></a><i class="twig t'+v.twigs+' btn btn-success fa fa-leaf">');
  });
  $('#branch-'+app.cache.twig+' .twig').addClass('t0').removeClass('t1');
  delete app.cache.twig;
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
  $('#twig').removeClass('hidden');
  if($(id).length != 0) {
    $(id+' a span').html($('#name').val());
  }else{
    if(req.trunk > 0) {
      $('#branch-'+req.trunk+' .twig').click();
    }else{
      $('#content .nav').append('<li id="branch-'+branch+'" class="trunk-0" data-branch="'+branch+'"><a href="#" class="branch"><span>'+name+'</span></a><i class="twig t'+twigs+' btn btn-success fa fa-leaf">');
    }
  }
}
function plan() {
  hide();
  $('#plan, #search, #nav .plan').removeClass('hidden');
  $('#name').focus();
  action({"u":"https://home.thomasbryan.info/project/","d":{"req":"trunks","branch":0},"f":"projectlist"});
}
function projectlist(req) {
  $.each(req,function(k,v) {
    $('#content .nav').append('<li id="branch-'+v.branch+'" class="trunk-0" data-branch="'+v.branch+'"><a href="#" class="branch"><span>'+v.name+'</span></a><i class="twig t'+v.twigs+' btn btn-success fa fa-leaf">');
  });
}
$(document).on('click','#planning',function() {
  app.mode="plan";
  init();
});
/* Working */
$(document).on('click touchend','#working',function() {
  app.mode="work";
  init();
});
function tasklist(req) {
  $.each(req,function(k,v) {
    $('#content .nav').append('<li id="branch-'+v.branch+'" class="trunk-0" data-branch="'+v.branch+'"><a href="#" class="task"><span>'+v.name+'</span></a>');
  });
}
function work() {
  hide();
  $('#work, #nav .work').removeClass('hidden');
  action({"u":"https://home.thomasbryan.info/project/","d":{"req":"twigs","twig":0},"f":"tasklist"});
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
function init() {
  updateCookie("mode",app.mode);
  window[app.mode]();
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
function startTime() {
  var t = new Date()
    , h = t.getHours()
    , m = t.getMinutes()
    , s = t.getSeconds()
    , a = (h < 12) ? "AM" : "PM"
    , m = (m < 10 ? "0" : "" ) + m
    , s = (s < 10 ? "0" : "" ) + s
    , h = (h > 12) ? h - 12 : h
    , h = (h == 0) ? 12 : h
    , d = setTimeout(startTime, 500);
    ;
  $("#work .jumbotron h1").html(h+":"+m+":"+s+" "+a);
}
