var ie6iframeheight=function(){if($.browser.msie&&$.browser.version==="6.0"){$('.window-frame').css("height",($('.window-frame').parent().height()-59)+"px");}}
function position_fixed(el,eltop,elleft){if(!window.XMLHttpRequest)
    window.onscroll=function(){el.style.top=(document.documentElement.scrollTop+eltop)+"px";el.style.left=(document.documentElement.scrollLeft+elleft)+"px";}
else el.style.position="fixed";}
position_fixed(document.getElementById("ie6-warning"),0,0);setTimeout(function(){$("#ie6-warning").animate({top:"-32px"},1000)},10000);