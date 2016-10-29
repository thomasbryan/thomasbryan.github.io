/* Init */
var app = {"auth": readCookie('project'),"ajax":{},"branch":0,"trunk":0,"name":"","twigs":0,"state":0,"dom":"","mode":readCookie('mode')};
$(document).ready(function() {
  if($('body').css('color') != 'rgb(51, 51, 51)') {
    $localbootstrap = $('<link rel="stylesheet" href="fonts/bootstrap.min.css">');
    $("head").prepend($localbootstrap);
    $localbootstrap.on('load',function() { $("#a").remove(); });
  }else{ $("#a").remove(); }

  if($('.fa').css('display') != 'inline-block') $("head").prepend('<link rel="stylesheet" href="fonts/font-awesome.min.css">');
  if(app.mode==null) app.mode = "plan";
  if(app.auth!=null) init();
});
function login() {
  hide();
  $('#j, #k').val('');
  $('.b').removeClass('hidden');
  $('#j').focus();
}
$('#i').on('submit',function(e){
  var user = $('#j').val()
    , pass = $('#k').val()
    ;
  $('#j, #k').val('');
  e.preventDefault();
  action({"u":"https://home.thomasbryan.info/auth/","d":{"app":"project","user":user,"pass":pass},"f":"loggedin"});
});
function loggedin() {
  app.auth = app.ajax;
  updateCookie("project",app.auth,7);
  init();
}
$(document).on('click touchend','#b',function() {
  var a = '3'
    , b = '9'
    , d = '.col-sm-'
    ;
  if($(d+a).not(':visible')) {
    if($(d+a).hasClass('hidden-xs')) {
      $(d+a).removeClass('hidden-xs');
      $(d+b).addClass('hidden-xs');
    }else{
      $(d+a).addClass('hidden-xs');
      $(d+b).removeClass('hidden-xs');
    }
  }
});
$(document).on('click touchend','#c',function() {
  deleteCookie("project");
  login();
});
$(document).on('click touchend','#d',function() {
  app.mode = "plan";
  init();
});
$(document).on('click touchend','.col-sm-3 a',function() {
  $('.col-sm-3').addClass('hidden-xs');
  $('.col-sm-9').removeClass('hidden-xs');
//TODO optimize logic
  if(app.mode == "work" && app.state == 1) {
  }else{
    app.branch = $(this).parent().data('branch');
    app.name = $(this).parent().data('name');
    app.state = $(this).parent().data('state');
    app.trunk = $(this).parent().data('trunk');
    app.twigs = $(this).parent().data('twigs');
    action({"u":"https://home.thomasbryan.info/project/","d":{"req":"info","branch":app.branch},"f":"branch"});
  }
});
//TODO fix click bug
$(document).on('click touchend','.col-sm-3 .t-1 i.btn-success',function() {
  var branch = $(this).parent().data('branch')
    , cache = $('#'+app.dom+' .r-'+branch).length
    ;
  if(cache>0) {
    $('#'+app.dom+' .r-'+branch).removeClass('hidden');
    $('#b-'+branch+' > i').addClass('btn-danger').removeClass('btn-success');
  }else{
    app.twig=branch;
    action({"u":"https://home.thomasbryan.info/project/","d":{"req":"trunks","branch":branch},"f":"twigs"});
  }
});
function twigs() {
  var lvl = $('#b-'+app.twig+' a .fa-chevron-right').length + 1
    , pre = ''
    ;
  for(i=0;i<lvl;i++) {
    pre += '<i class="fa fa-chevron-right"></i>';
  }
  $('.r-'+app.twig).remove();
  $.each(app.ajax,function(k,v) {
    $('#b-'+app.twig).after('<li id="b-'+v.branch+'" class="r-'+v.trunk+' s-'+v.state+' t-'+v.twigs+'" data-branch="'+v.branch+'" data-name="'+v.name+'" data-state="'+v.state+'" data-trunk="'+v.trunk+'" data-twigs="'+v.twigs+'"><a href="#">'+pre+' <span>'+v.name+'</span></a><i class="btn btn-success fa fa-leaf">');
  });
  $('#b-'+app.twig+' > i').addClass('btn-danger').removeClass('btn-success');
  delete app.twig;
}
//TODO fix click bug.
$(document).on('click touchend','.col-sm-3 .t-1 i.btn-danger',function() {
  var branch = $(this).parent().data('branch');
  $('.r-'+branch+'.t-1 > i').click();
  $('.r-'+branch).addClass('hidden');
  $('#b-'+branch+' > i').removeClass('btn-danger').addClass('btn-success');
});
function branch() {
  $('#m').val(app.trunk);
  $('#n').val(app.branch);
  $('#o').val('');
  $('#p').focus();
  $('#p, #q').prop('disabled',false);
  if(app.mode == "plan") $('#r, #s').removeClass('hidden');
  $('#f, #t').addClass('hidden');
  if(app.branch > 0 && app.mode == "plan") $('#f').removeClass('hidden');
//TODO fix undefined bug
  if(app.trunk > 0) $('#o').val($('#b-'+app.trunk).data('name')); 
  if(app.state == 2) {
    $('#p, #q').prop('disabled',true);
    $('#f, #r, #s').addClass('hidden');
    $('#t').removeClass('hidden');
  }
  $('#p').val(app.name);
  $('#q').val(app.ajax.info);
}
function branches() {
  $('#h li').remove();
  $('#'+app.dom).removeClass('z');
  $.each(app.ajax,function(k,v) {
    $('#'+app.dom).append('<li id="b-'+v.branch+'" class="r-'+v.trunk+' s-'+v.state+' t-'+v.twigs+'" data-branch="'+v.branch+'" data-name="'+v.name+'" data-state="'+v.state+'" data-trunk="'+v.trunk+'" data-twigs="'+v.twigs+'"><a href="#"><span>'+v.name+'</span></a><i class="btn btn-success fa fa-leaf">');
  });
}
$('#l').on('submit',function(e) {
  var trunk = $('#m').val()
    , branch = $('#n').val()
    , name = $('#p').val()
    , info = $('#q').val()
    ;
  e.preventDefault();
  action({"u":"https://home.thomasbryan.info/project/","d":{"req":"update","trunk":trunk,"branch":branch,"name":name,"info":info},"f":"createupdate"});
});
function createupdate() {
  app.trunk = $('#m').val();
  app.branch = $('#n').val();
  app.name = $('#p').val();
  if(app.branch != app.ajax.branch) {
    $('#n').val(app.ajax.branch);
    if(app.trunk>0) {
      $('#b-'+app.trunk).data('twigs',1).removeClass('t-0').addClass('t-1');
      $('#b-'+app.trunk+' i').click();
    }else{
      //refresh page//
    }
  }else{
    $('#b-'+app.branch).data('name',app.name);
    $('#b-'+app.branch+' a span').html(app.name);
  }
}
$(document).on('click touchend','#e',function() {
  app.mode="work";
  init();
});
function progress() {
  if(app.ajax[0]!==undefined) {
    $('#u').addClass('hidden');
    $('#v, #w').removeClass('hidden');
    app.branch = app.ajax[0].branch;
    app.name = app.ajax[0].name;
    app.state = app.ajax[0].state;
    app.trunk = app.ajax[0].trunk;
    app.twigs = app.ajax[0].twigs;
    action({"u":"https://home.thomasbryan.info/project/","d":{"req":"info","branch":app.branch},"f":"branch"});
  }
}
$(document).on('click touchend','#f',function() {
  app.trunk = app.branch;
  app.branch = 0;
  app.name = '';
  app.state = 0;
  app.twigs = 0;
  app.ajax.info = '';
  branch();
});
$(document).on('click touchend','#s',function() {
  reset();
});
function reset() {
  app.branch = 0;
  app.name = '';
  app.state = 0;
  app.trunk = 0;
  app.twigs = 0;
  app.ajax.info = '';
  branch();
}
$(document).on('click touchend','#t',function() {
  action({"u":"https://home.thomasbryan.info/project/","d":{"req":"delete","branch":app.branch},"f":"burnt"});
});
function burnt() {
  reset();
  $.each(app.ajax,function(k,v) {
    $('#b-'+v).remove();
  });
}

$(document).on('click','.btn-group-justified button',function() {
  var state = $(this).data('state');
  action({"u":"https://home.thomasbryan.info/project/","d":{"req":"state","branch":app.branch,"state":state},"f":"state"});
});
//bug switch from work does not show #f new leaf
function plan() {
  hide();
  $('.c').removeClass('hidden');
  $('#p').focus();
  app.dom = 'g';
  if($('#g').hasClass('z')) action({"u":"https://home.thomasbryan.info/project/","d":{"req":"trunks","branch":0},"f":"branches"});
}
function work() {
  hide();
  $('.d, #u').removeClass('hidden');
  app.dom = 'h';
  action({"u":"https://home.thomasbryan.info/project/","d":{"req":"twigs","state":0},"f":"branches"});
  action({"u":"https://home.thomasbryan.info/project/","d":{"req":"twigs","state":1},"f":"progress"});
}
function state() {
  app.state=app.ajax.state;
  switch(app.ajax.state) {
    case 2: 
      $('#h #b-'+app.branch).remove();
      $('#g #b-'+app.branch).addClass('s-2').removeClass('s-1').data('state',2);
      //reset
      app.trunk = 0;
      app.branch = 0;
      app.name = '';
      app.state = 0;
      app.twigs = 0;
      app.ajax.info = '';
      branch();
    case 0:$('#v, #w').addClass('hidden');$('#u').removeClass('hidden'); break;
    case 1:$('#u').addClass('hidden');$('#v, #w').removeClass('hidden'); break;
  }
}
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
    app.ajax = res;
    window[r.f]();
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
$(document).on('click touchstart','a',function(e) { e.preventDefault(); });
function hide() { $('.a').addClass('hidden'); }
