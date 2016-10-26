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
/***
click events:
  #brand: if view is small, then check mode and show work list or plan list.
  #twig: if branch > 0 then take name and set as parent, take branch and set as trunk, set trunk = 0, set name = '' and set info = ''
  #work: hide plan nav, show work nav, get list of twigs, get in progress, if in progress, then set form with information,else if current form data state is done then clear form; remove disabled:name,info ; hide .plan buttons at bottom, 
  #plan: hide work nav, show plan nav, get list of trunks(if hasclass .plan), hide .work buttons
  #logout: hide .work, hide .plan, delete auth cookie, login()
  #save: 
  #reset: set form data to 0's and "" empty 
  #delete: send branch request > on response remove refresh page???
  #inprogress: :w

  #todo: 
  #done: 
  .branch:
  .twig:

***/

/* Planning */
$(document).on('click touchend','#brand',function() {
  var dom = '#content .col-sm-3';
  if($(dom).not(':visible')) {
    if($(dom).hasClass('hidden-xs')) {
      $(dom).removeClass('hidden-xs');
    }else{
      $(dom).addClass('hidden-xs');
    }
  }
});
$(document).on('click','#reset',function() {
  plandata({"trunk":0,"branch":0,"name":"","info":""});
  $('#name').focus();
  $('#twig').addClass('hidden');
});
$(document).on('click','.branch',function() {
  //revise
  var branch = $(this).parent().data('branch')
    , todo = $('#work #td').is(':visible')
    ;
  app.cache.branch=branch;
  $('#content .col-sm-3').addClass('hidden-xs');
  if(!todo) action({"u":"https://home.thomasbryan.info/project/","d":{"req":"read","branch":branch},"f":"planread"});
});
$(document).on('click','.twig',function() {
  var branch = $(this).parent().data('branch')
    , expand = $(this).hasClass('btn-success')
    , cache = $('.trunk-'+branch).length
    ;
  if(expand) {
    if(cache>0) {
      $('.trunk-'+branch).removeClass('hidden');
      $('#branch-'+branch+' .twig').addClass('btn-danger').removeClass('btn-success');
    }else{
      app.cache.twig=branch;
      action({"u":"https://home.thomasbryan.info/project/","d":{"req":"trunks","branch":branch},"f":"twigs"});
    }
  }else{
    $('.trunk-'+branch+' .btn-danger').click();
    $('.trunk-'+branch).addClass('hidden');
    $('#branch-'+branch+' .twig').removeClass('btn-danger').addClass('btn-success');
  }
});
$(document).on('click','#twig',function() {
  plandata({"trunk":parseInt($('#branch').val(),10),"branch":0,"name":"","info":""});
  $('#twig').addClass('hidden');
  $('#content .col-sm-3').addClass('hidden-xs');
});
function planread(req) {
  console.log(req);
  console.log(app.cache.branch);
  $('#twig').removeClass('hidden');
  //most of this data exists on the dom.
  plandata({"trunk":req[0].trunk,"branch":req[0].branch,"name":req[0].name,"info":req[0].info,"state":req[0].state});
}
function workread(req) {
  if(req[0]!==undefined) {
    var show = '#progress'
      , hide = '#todo,#done'
      ;
    if(req[0].state == 1) {
      show = '#todo,#done';
      hide = '#progress';
    }
//most of this data exists on the dom.
    //plandata({"trunk":req[0].trunk,"branch":req[0].branch,"name":req[0].name,"info":req[0].info,"state":req[0].state});
    $(show).removeClass('hidden');
    $(hide).addClass('hidden');
  }else{
    //if($('#work .jumbotron h2').text().length > 0) $('#ip').removeClass('hidden');
  }
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
    if(v.state == 2) v.name = '<strike>'+v.name+'</strike>';
    $('#branch-'+app.cache.twig).after('<li id="branch-'+v.branch+'" class="trunk-'+app.cache.twig+'" data-branch="'+v.branch+'"><a href="#" class="branch">'+pre+' <span>'+v.name+'</span></a><i class="twig t'+v.twigs+' btn btn-success fa fa-leaf">');
  });
  $('#branch-'+app.cache.twig+' .twig').addClass('btn-danger').removeClass('btn-success');
  delete app.cache.twig;
}
function plandata(req) {
  $('#trunk').val(req.trunk);
  $('#branch').val(req.branch);
  $('#name').val(req.name);
  $('#info').val(req.info);
  if(req.state==2) {
    $('#name').prop('disabled',true);
    $('#info').prop('disabled',true);
    $('#twig, #save, #reset').addClass('hidden');
    $('#delete').removeClass('hidden');
  }else{
    $('#name').prop('disabled',false);
    $('#info').prop('disabled',false);
    $('#twig, #save, #reset').removeClass('hidden');
    $('#delete').addClass('hidden');
  }
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
      if($('#branch-'+req.trunk+' .twig').hasClass('t0')) $('#branch-'+req.trunk+' .twig').removeClass('t0').addClass('t1');
      if($('#branch-'+req.trunk+' .twig').hasClass('btn-danger')) {
        $('#branch-'+req.trunk+' .twig').removeClass('btn-danger').addClass('btn-success');
        $('.trunk-'+req.trunk).remove();
      }
      $('#branch-'+req.trunk+' .twig').click();
    }else{
      $('#trunks').append('<li id="branch-'+branch+'" class="trunk-0" data-branch="'+branch+'"><a href="#" class="branch"><span>'+name+'</span></a><i class="twig t'+twigs+' btn btn-success fa fa-leaf">');
    }
  }
}
function plan() {
  hide();
  $('#form-app, #search, #nav .plan, #trunks').removeClass('hidden');
  $('#name').focus();
  if($('#trunks').hasClass('trunks')) action({"u":"https://home.thomasbryan.info/project/","d":{"req":"trunks","branch":0},"f":"trunklist"});
}
function trunklist(req) {
  $('#trunks').removeClass('trunks');
  $.each(req,function(k,v) {
    if(v.state == 2) v.name = '<strike>'+v.name+'</strike>';
    $('#trunks').append('<li id="branch-'+v.branch+'" class="trunk-0" data-branch="'+v.branch+'"><a href="#" class="branch"><span>'+v.name+'</span></a><i class="twig t'+v.twigs+' btn btn-success fa fa-leaf">');
  });
}
$(document).on('click touchend','#plan',function() {
  app.mode="plan";
  init();
});
/* Working */
$(document).on('click touchend','#work',function() {
  app.mode="work";
  init();
});
/* get the todo/inprogress/done data and submit to state.
$(document).on('click','#work button',function() {
  var branch = $('#work').data('branch')
    , state = $(this).data('state')
    ;
  action({"u":"https://home.thomasbryan.info/project/","d":{"req":"state","branch":branch,"state":state},"f":"state"});
});
*/
function work() {
  //#work: hide plan nav, show work nav, get list of twigs, get in progress, if in progress, then set form with information,else if current form data state is done then clear form; remove disabled:name,info ; hide .plan buttons at bottom, 
  hide();
  $('#form-app, #nav .work, #twigs').removeClass('hidden');
  action({"u":"https://home.thomasbryan.info/project/","d":{"req":"twigs","state":0},"f":"twiglist"});
  action({"u":"https://home.thomasbryan.info/project/","d":{"req":"twigs","state":1},"f":"workread"});
}
function twiglist(req) {
  $('#twigs li').remove();
  $.each(req,function(k,v) {
    $('#twigs').append('<li id="branch-'+v.branch+'" class="trunk-0" data-branch="'+v.branch+'"><a href="#" class="branch"><span>'+v.name+'</span></a>');
  });
}
function state(req) {
  switch(req.state) {
    case 0:$('#td').addClass('hidden');$('#ip').removeClass('hidden'); break;
    case 1:$('#ip').addClass('hidden');$('#td').removeClass('hidden'); break;
    case 2: 
      $('#twigs #branch-'+req.branch).remove();
      $('#trunks #branch-'+req.branch+' span').wrapInner('<strike></strike>');
      $('#work').data('branch',undefined);
      $('#work .jumbotron h2').html('');
      $('#work textarea').html('');
      $('#ip, #td').addClass('hidden');
    break;
  }
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
function hide() {
  $('#content > .col-sm-9 > div, #content .nav, #search, #nav li').addClass('hidden');
}
