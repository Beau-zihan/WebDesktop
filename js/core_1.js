//window.Core = window.$ = {};

var Core = {};
var _cache = {};

Core.config = {
    shortcutTop:20,		//快捷方式top初始位置
    shortcutLeft:20,		//快捷方式left初始位置
    createIndexid:1,		//z-index初始值
    windowMinWidth:150,		//窗口最小宽度
    windowMinHeight:56		//窗口最小高度
};
//var data = [[{}, {}, {}], [{}]];
//桌面右键菜单
Core.menu={
    bodymenudata:
    [ 
    [
    {
        text: "刷新",
        func: function() {
            location.reload();
        }
    }, {
        text:"显示桌面",
        func:function(){
            Core.showDesktop();
        }
    },
        {
            text:"显示侧边栏",
            func:function(){
                $("#menubar").animate({right:0}, 1500);
            }
        },
    {
        text: "更换背景",
        data: [[{
            text: "默认",
            func: function() {
                $(this).attr("style",'background:url(images/background.jpg) repeat right bottom transparent;');
            }
        }, {
            text: "梦幻绿",
            func: function() {
                $(this).attr("style",'background:url(images/background0.jpg) repeat right bottom transparent;');
            }       
        }]]
    }],[
        {
            text:"作者信息",
            func:function(){
                window.open("http://www.zi-han.net");
            }
        }
    ]
    ]
};
Core.init = function(){
    $(document.body).bind('click',function(){
        //隐藏所有右键列表
        $(".popup-menu").hide();
    });
    var _top = Core.config.shortcutTop;
    var _left = Core.config.shortcutLeft;
    var windowHeight = $("#desk").height();
    var ul = $("#desk").find('ul');
    //屏蔽桌面右键事件
    $("#desk").bind('contextmenu',function(){
        $(".popup-menu").hide();
        $("#desk").smartMenu(Core.menu.bodymenudata, {
            name: "body"    
        });
        $("#task-bar").smartMenu(Core.menu.icosmenudata, {
            name: "task_bar"    
        });
        return false;
    });
    /**/
    $(window).bind('load',function(){
        //循环输出每个图标
        for(var sc in shortcut){
            _cache.shortcutTemp = {
                "top":_top,
                "left":_left,
                "title":shortcut[sc][1],
                "shortcut":shortcut[sc][0],
                "imgsrc":shortcut[sc][2]
            };
            $(ul).append(FormatModel(shortcutTemp,_cache.shortcutTemp));
            //每循环一个图标后，给top的偏移量加90px
            _top += 90;
            //当下一个图标的top偏移量大于窗口高度时，top归零，left偏移量加90px
            if(_top+Core.config.shortcutTop+57 > windowHeight){
                _top = Core.config.shortcutTop;
                _left += 90;
            }
        }
    }).bind('resize',function(){
        if($(window).width()<800 || $(window).height()<400){
            ZENG.msgbox.show("浏览器当前窗口过小，可能会影响正常操作！", 1, 2000);
        }
        //由于图标不会太多，所以resize里的方法是对样式直接修改，当然也可以重建li
        _top = Core.config.shortcutTop;
        _left = Core.config.shortcutLeft;
        windowHeight = $("#desk").height();
        //循环ul，操作每一个li
        $(ul).find("li").each(function(){
            $(this).css({
                "left":_left,
                "top":_top
            });
            _top += 90;
            if(_top+Core.config.shortcutTop+57 > windowHeight){
                _top = Core.config.shortcutTop;
                _left += 90;
            }
        });
        //智能修改每个窗口的定位
        $("#desk div.window-container").each(function(){
            currentW = $(window).width() - $(this).width();
            currentH = $(window).height() - $(this).height();
            _l = $(this).data("info").left/$(this).data("info").emptyW*currentW >= currentW ? currentW : $(this).data("info").left/$(this).data("info").emptyW*currentW;
            _l = _l <= 0 ? 0 : _l;
            _t = $(this).data("info").top/$(this).data("info").emptyH*currentH >= currentH ? currentH : $(this).data("info").top/$(this).data("info").emptyH*currentH;
            _t = _t <= 0 ? 0 : _t;
            $(this).css({
                "left":_l+"px",
                "top":_t+"px"
            });
        });
    }).bind('load',function(){
        $('.bgloader').fadeOut('slow');
    });
    //绑定快捷方式点击事件
    ul.find('li').live('click',function(){
        Core.create($(this));
    });
    //绑定任务栏点击事件
    $('.task-window li').live('click',function(){
        Core.taskwindow($(this));
    }).live('contextmenu',function(){
        //展示自定义右键菜单
        Core.taskwindowrightmenu($(this));
        //屏蔽浏览器自带右键菜单
        return false;
    });
    //绑定窗口点击事件
    $('.window-container').live('click',function(){
        Core.container($(this));
    });
    
};

//创建窗体
Core.create = function(obj,opt){    

    if(typeof(obj)==='string'){
        var options = {
            num		:Date.parse(new Date()),
            imgsrc	:"images/shortcut/news.png",
            title	:opt.title,
            url		:opt.url,
            width	:opt.width,
            height	:opt.height,
            resize	:opt.resize
        };
    }else{
        var sc = obj.attr('shortcut');
        var options = {
            num		:shortcut[sc][0],
            title	:shortcut[sc][1],
            imgsrc	:shortcut[sc][2],
            url		:shortcut[sc][3],
            width	:shortcut[sc][4],
            height	:shortcut[sc][5],
            resize	:true
        };
    }
	
    var window_warp = 'window_'+options.num+'_warp';
    var window_inner = 'window_'+options.num+'_inner';
    //判断窗口是否已打开
    var iswindowopen = 0;
    $('.task-window li').each(function(){
        if($(this).attr('window')==options.num){
            iswindowopen = 1;
            //改变任务栏样式
            $('.task-window li b').removeClass('focus');
            $(this).children('b').addClass('focus');
            //改变窗口样式
            $('.window-container').removeClass('window-current');
            $('#'+window_warp).addClass('window-current').css({
                'z-index':Core.config.createIndexid
            }).show();
            //改变窗口遮罩层样式
            $('.window-frame').children('div').show();
            $('#'+window_inner+' .window-frame').children('div').hide();
            Core.config.createIndexid += 1;
        }
    });
    if(iswindowopen == 0){
        //增加并显示背景遮罩层
        _cache.MoveLayOut = GetLayOutBox();
        _cache.MoveLayOut.show();
        $('.window-frame').children('div').show();
        $('.task-window li b').removeClass('focus');
        $('.window-container').removeClass('window-current');
        //任务栏，窗口等数据
        _cache.taskTemp = {
            "num":options.num,
            "title":options.title,
            "imgsrc":options.imgsrc
        };
        var top = ($(window).height()-options.height-30)/2 <= 0 ? 0 : ($(window).height()-options.height-30)/2;
        var left = ($(window).width()-options.width)/2 <= 0 ? 0 : ($(window).width()-options.width)/2;
        _cache.windowTemp = {
            "width":options.width,
            "height":options.height,
            "top":top,
            "left":left,
            "emptyW":$(window).width()-options.width,
            "emptyH":$(window).height()-options.height,
            "zIndex":Core.config.createIndexid,
            "num":options.num,
            "title":options.title,
            "url":options.url
        };
        _cache.resizeTemp = {
            "t":"left:0;top:-3px;width:100%;height:5px;z-index:1;cursor:n-resize",
            "r":"right:-3px;top:0;width:5px;height:100%;z-index:1;cursor:e-resize",
            "b":"left:0;bottom:-3px;width:100%;height:5px;z-index:1;cursor:s-resize",
            "l":"left:-3px;top:0;width:5px;height:100%;z-index:1;cursor:w-resize",
            "rt":"right:-3px;top:-3px;width:10px;height:10px;z-index:2;cursor:ne-resize",
            "rb":"right:-3px;bottom:-3px;width:10px;height:10px;z-index:2;cursor:se-resize",
            "lt":"left:-3px;top:-3px;width:10px;height:10px;z-index:2;cursor:nw-resize",
            "lb":"left:-3px;bottom:-3px;width:10px;height:10px;z-index:2;cursor:sw-resize"
        };
        //新增任务栏
        $('.task-window').append(FormatModel(taskTemp,_cache.taskTemp));
        //新增窗口
        var win_warp = "";
        if(options.resize){
            //添加窗口缩放模板
            for(var k in _cache.resizeTemp){
                win_warp += FormatModel(resizeTemp,{
                    resize_type:k, 
                    css:_cache.resizeTemp[k]
                });
            }
        }
        win_warp = FormatModel(FormatModel(windowTemp,{
            resize:win_warp
        }),_cache.windowTemp);
        $('#desk').append(win_warp);
        $("#"+window_warp).data("info",_cache.windowTemp);
        Core.config.createIndexid += 1;
        //绑定窗口移动事件
        Core.bindWindowMove($('#'+window_warp));
        if(options.resize){
            //绑定窗口缩放事件
            Core.bindWindowResize($('#'+window_warp));
        }
        //绑定窗口功能按钮事件
        Core.handle($('#'+window_warp));
        //隐藏背景遮罩层
        _cache.MoveLayOut.hide();
    }
};

//点击任务栏
Core.taskwindow = function(obj){
    var window_warp = 'window_'+obj.attr('window')+'_warp';
    var window_inner = 'window_'+obj.attr('window')+'_inner';
    if(obj.children('b').hasClass('focus')){
        obj.children('b').removeClass('focus');
        $('#'+window_warp).hide();
    }else{
        //改变任务栏样式
        $('.task-window li b').removeClass('focus');
        obj.children('b').addClass('focus');
        //改变窗口样式
        $('.window-container').removeClass('window-current');
        $('#'+window_warp).addClass('window-current').css({
            'z-index':Core.config.createIndexid
        }).show();
        //改变窗口遮罩层样式
        $('.window-frame').children('div').show();
        $('#'+window_inner+' .window-frame').children('div').hide();
        Core.config.createIndexid += 1;
    }
};

//任务栏系统设置
Core.taskwindowsystemmenu = function(obj){
    _cache.TaskSystem = GetTaskSystem(obj);
    _cache.TaskSystem.css({
        right:'2px'
    }).show();
};

//点击窗口
Core.container = function(obj){
    //改变任务栏样式
    $('.task-window li b').removeClass('focus');
    $('.task-window li[window="'+obj.attr('window')+'"] b').addClass('focus');
    //改变窗口样式
    $('.window-container').removeClass('window-current');
    obj.addClass('window-current').css({
        'z-index':Core.config.createIndexid
    });
    //改变窗口遮罩层样式
    $('.window-frame').children('div').show();
    obj.find('.window-frame').children('div').hide();
    Core.config.createIndexid += 1;
};

//最小化，最大化，还原，双击，关闭，刷新
Core.handle = function(obj){
    //改变窗口样式
    $('.window-container').removeClass('window-current');
    obj.addClass('window-current').css({
        'z-index':Core.config.createIndexid
    });
    Core.config.createIndexid += 1;

    //最小化
    obj.find(".ha-min").bind("click",function(e){
        //阻止冒泡
        e.stopPropagation();
        obj.hide();
        //改变任务栏样式
        $('.task-window li[window="'+obj.attr('window')+'"] b').removeClass('focus');
    });
    //最大化
    obj.find(".ha-max").bind("click",function(e){
        obj.css({
            width:"100%",
            height:"100%",
            top:0,
            left:0
        });
        $(this).hide().next(".ha-revert").show();
        ie6iframeheight();
        ZENG.msgbox.show("按F11体验浏览器全屏模式！", 4, 2000);
    });
    //还原
    obj.find(".ha-revert").bind("click",function(e){
        obj.css({
            width:obj.data("info").width+"px",
            height:obj.data("info").height+"px",
            left:obj.data("info").left+"px",
            top:obj.data("info").top+"px"
        });
        $(this).hide().prev(".ha-max").show();
        ie6iframeheight();
    });
    //双击
    obj.find(".title-bar").bind("dblclick",function(e){
        //判断当前窗口是否已经是最大化
        if($(this).find(".ha-max").is(":visible")){
            $(this).find(".ha-max").click();
        }else{
            $(this).find(".ha-revert").click();
        }
    });
    //关闭
    obj.find(".ha-close").bind("click",function(e){
        $('.task-window li[window="'+obj.attr('window')+'"]').remove();
        obj.remove();
    });
    //刷新
    obj.find("#refresh").bind("click",function(e){
        $("#frame"+obj.attr('window')).attr("src",$("#frame"+obj.attr('window')).attr("src"));
    });
};

//显示桌面
Core.showDesktop = function(){
    $(".task-window li b").removeClass("focus");
    $("#desk ul").nextAll("div").hide();
};

//绑定窗口移动事件
Core.bindWindowMove = function(obj){
    obj.find(".title-bar").bind("mousedown",function(e){
        //改变窗口为选中样式
        $('.window-container').removeClass('window-current');
        obj.addClass('window-current').css({
            'z-index':Core.config.createIndexid
        });
        Core.config.createIndexid += 1;
        x = e.screenX;	//鼠标位于屏幕的left
        y = e.screenY;	//鼠标位于屏幕的top
        sT = obj.offset().top;
        sL = obj.offset().left;
        //增加背景遮罩层
        _cache.MoveLayOut = GetLayOutBox();
        var lay = ($.browser.msie)? _cache.MoveLayOut : $(window);	
        //绑定鼠标移动事件
        lay.unbind("mousemove").bind("mousemove",function(e){
            _cache.MoveLayOut.show();
            //强制把右上角还原按钮隐藏，最大化按钮显示
            obj.find(".ha-revert").hide().prev(".ha-max").show();
            eX = e.screenX;	//鼠标位于屏幕的left
            eY = e.screenY;	//鼠标位于屏幕的top
            lessX = eX - x;	//距初始位置的偏移量
            lessY = eY - y;	//距初始位置的偏移量
            _l = sL + lessX;
            _t = sT + lessY;
            _w = obj.data("info").width;
            _h = obj.data("info").height;
            /*
            //鼠标贴屏幕左侧20px内
            if(e.clientX <= 20){
                _w = (lay.width()/2)+"px";
                _h = "100%";
                _l = 0;
                _t = 0;
            }
            //鼠标贴屏幕右侧20px内
            if(e.clientX >= (lay.width()-21)){
                _w = (lay.width()/2)+"px";
                _h = "100%";
                _l = (lay.width()/2)+"px";
                _t = 0;
            }*/
            //窗口贴屏幕顶部10px内
            if(_t <= 10){
                _t = 0;
            }
            //窗口贴屏幕左边10px内
            if(_l <= 10){
                _l = 0;
            }
            //窗口贴屏幕右边10px内
            if(_l >= lay.width()-_w-10){
                _l = lay.width()-_w;
            }
            //窗口贴屏幕下边10px内 //30px 下方还有task-bar任务栏
            if(_t >= lay.height()-_h-30-10){
                _t = lay.height()-_h-30;  
            }
            /*
            ZENG.msgbox.show(lay.height()+" "+_win_h, 1, 2000);
            //窗口贴屏幕底部60px内
            if(_t >= (lay.height()-60)){
                _t = (lay.height()-60)+"px";
                if(e.clientX <= 20){
                    _w = (lay.width()/2)+"px";
                    _h = "100%";
                    _l = 0;
                    _t = 0;
                }
            }*/
            obj.css({
                width:_w,
                height:_h,
                left:_l,
                top:_t
            });
            obj.data("info",{
                width:obj.data("info").width,
                height:obj.data("info").height,
                left:obj.offset().left,
                top:obj.offset().top,
                emptyW:$(window).width()-obj.data("info").width,
                emptyH:$(window).height()-obj.data("info").height
            });
            ie6iframeheight();
        });
        //绑定鼠标抬起事件
        lay.unbind("mouseup").bind("mouseup",function(){
            _cache.MoveLayOut.hide();
            if($.browser.msie){
                _cache.MoveLayOut[0].releaseCapture();
            }
            $(this).unbind("mousemove");
        });
        if($.browser.msie){
            _cache.MoveLayOut[0].setCapture();
        }
    });
};

//绑定窗口缩放事件
Core.bindWindowResize = function(obj){
    for(rs in _cache.resizeTemp){
        bindResize(rs);
    }
    function bindResize(r){
        obj.find("div[resize='"+r+"']").bind("mousedown",function(e){
            //增加背景遮罩层
            _cache.MoveLayOut = GetLayOutBox();
            var lay = ($.browser.msie)? _cache.MoveLayOut : $(window);	
            cy = e.clientY;
            cx = e.clientX;
            h = obj.height();
            w = obj.width();
            //增加背景遮罩层
            _cache.MoveLayOut = GetLayOutBox();		
            lay.unbind("mousemove").bind("mousemove",function(e){
                _cache.MoveLayOut.show();
                _t = e.clientY;
                _l = e.clientX;
                //窗口贴屏幕顶部10px内
                if(_t <= 10){
                    _t = 0;
                }
                //窗口贴屏幕底部60px内
                if(_t >= (lay.height()-60)){
                    _t = (lay.height()-60);
                }
				
                if(_l <= 1){
                    _l = 1;
                }
                if(_l >= (lay.width()-2)){
                    _l = (lay.width()-2);
                }
                $('.window-frame').children('div').hide();
                obj.find('.window-frame').children('div').show();
                switch(r){
                    case "t":
                        if(h+cy-_t > Core.config.windowMinHeight){
                            obj.css({
                                height:(h+cy-_t)+"px",
                                top:_t+"px"
                            });
                        }
                        break;
                    case "r":
                        if(w-cx+_l > Core.config.windowMinWidth){
                            obj.css({
                                width:(w-cx+_l)+"px"
                            });
                        }
                        break;
                    case "b":
                        if(h-cy+_t > Core.config.windowMinHeight){
                            obj.css({
                                height:(h-cy+_t)+"px"
                            });
                        }
                        break;
                    case "l":
                        if(w+cx-_l > Core.config.windowMinWidth){
                            obj.css({
                                width:(w+cx-_l)+"px",
                                left:_l+"px"
                            });
                        }
                        break;
                    case "rt":
                        if(h+cy-_t > Core.config.windowMinHeight){
                            obj.css({
                                height:(h+cy-_t)+"px",
                                top:_t+"px"
                            });
                        }
                        if(w-cx+_l > Core.config.windowMinWidth){
                            obj.css({
                                width:(w-cx+_l)+"px"
                            });
                        }
                        break;
                    case "rb":
                        if(w-cx+_l > Core.config.windowMinWidth){
                            obj.css({
                                width:(w-cx+_l)+"px"
                            });
                        }
                        if(h-cy+_t > Core.config.windowMinHeight){
                            obj.css({
                                height:(h-cy+_t)+"px"
                            });
                        }
                        break;
                    case "lt":
                        if(w+cx-_l > Core.config.windowMinWidth){
                            obj.css({
                                width:(w+cx-_l)+"px",
                                left:_l+"px"
                            });
                        }
                        if(h+cy-_t > Core.config.windowMinHeight){
                            obj.css({
                                height:(h+cy-_t)+"px",
                                top:_t+"px"
                            });
                        }
                        break;
                    case "lb":
                        if(w+cx-_l > Core.config.windowMinWidth){
                            obj.css({
                                width:(w+cx-_l)+"px",
                                left:_l+"px"
                            });
                        }
                        if(h-cy+_t > Core.config.windowMinHeight){
                            obj.css({
                                height:(h-cy+_t)+"px"
                            });
                        }
                        break;
                }
                ie6iframeheight();
                //更新窗口宽高缓存
                obj.data("info",{
                    width:obj.width(),
                    height:obj.height(),
                    left:obj.offset().left,
                    top:obj.offset().top,
                    emptyW:$(window).width()-obj.width(),
                    emptyH:$(window).height()-obj.height()
                });
            });
            //绑定鼠标抬起事件
            lay.unbind("mouseup").bind("mouseup",function(){
                _cache.MoveLayOut.hide();
                if($.browser.msie){
                    _cache.MoveLayOut[0].releaseCapture();
                }
                $(this).unbind("mousemove");
            });
            if($.browser.msie){
                _cache.MoveLayOut[0].setCapture();
            }
        });
    }
};

//透明遮罩层
var GetLayOutBox = function(){
    if(!_cache.LayOutBox){
        _cache.LayOutBox = $('<div style="z-index:99999;display:none;cursor:default;background:none;height:100%;left:0;position:absolute;top:0;width:100%;filter:alpha(opacity=0);-moz-opacity:0;opacity:0"><div style="height:100%;width:100%"></div></div>');
        $(document.body).append(_cache.LayOutBox);
    }
    return _cache.LayOutBox;
}
//任务栏右键提示
var GetTaskRight = function(obj){
    if(!_cache.TaskRight){
        _cache.TaskRight = $('<div class="popup-menu task-menu" style="z-index:99999;bottom:30px;display:none"><ul><li><a menu="close" title="关闭" href="javascript:;">关闭</a></li></ul></div>');
        $(document.body).append(_cache.TaskRight);
        $('.task-menu').bind('contextmenu',function(){
            return false;
        });
    }
    //绑定关闭事件
    $('.task-menu a[menu="close"]').unbind("click").bind("click",function(){
        $('#window_'+obj.attr('window')+'_inner .title-handle .ha-close').click();
        $('.task-menu').hide();
    });
    return _cache.TaskRight;
}
//任务栏右键提示
var GetTaskSystem = function(obj){
    if(!_cache.TaskSystem){
        _cache.TaskSystem = $('<div class="popup-menu task-menu" style="z-index:99999;bottom:30px;display:none"><ul><li><a menu="close" href="javascript:;">用户登录</a></li><li><a menu="close" href="javascript:;">用户登录</a></li></ul></div>');
        $(document.body).append(_cache.TaskSystem);
        $('.task-menu').bind('contextmenu',function(){
            return false;
        });
    }
    //绑定关闭事件
    $('.task-menu a[menu="close"]').unbind("click").bind("click",function(){
        $('#window_'+obj.attr('window')+'_inner .title-handle .ha-close').click();
        $('.task-menu').hide();
    });
    return _cache.TaskSystem;
}
//模板格式化（正则替换）
var FormatModel = function(str,model){
    for(var k in model){
        var re = new RegExp("{"+k+"}","g");
        str = str.replace(re,model[k]);
    }
    return str;
}
//IE6实时更新iframe高度
var ie6iframeheight = function(){
    if($.browser.msie && $.browser.version==="6.0"){
        $('.window-frame').css("height",($('.window-frame').parent().height()-59)+"px");
    }
}

$().ready(function () {
    //IE下禁止选中
    document.body.onselectstart = document.body.ondrag = function () { return false; }
    //初始化
    Core.init();
});

//绑定开始菜单单击事件
$(".second-menu li").click(function () {
    //Core.create($("#desk li[shortcut = " + $(this).attr('menudata') + "]"));
    $("#start-menu").hide();
});
//开始菜单
$(".start-menu li").mouseover(function () {
    $(".start-menu li").removeClass("menuSelected");
    $(this).addClass("menuSelected");
});
$("#desk").click(function () { $("#start-menu").hide(); });
$("span.startMenuBtn").click(function () {
    $("#start-menu").toggle();
});
$(".start-menu li.sm1").click(function(){
    Core.showDesktop();
});
$(".start-menu li.sm2").click(function(){
    $("#menubar").animate({right:0}, 1500);
});
$(".start-menu li.sm4").click(
    function() {
        var ctrl = (navigator.userAgent.toLowerCase()).indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL';
        if (document.all){
            window.external.addFavorite('http://www.zi-han.net','子涵的博客');
        }else if (window.sidebar){
            window.sidebar.addPanel('子涵的博客','http://www.zi-han.net',"");
                }else {
            ZENG.msgbox.show("收藏失败，您可以尝试通过' + ctrl + ' + D 加入到收藏夹!",1, 5000);
            }
        }
);
$(".start-menu li.sm5").click(function(){
    ZENG.msgbox.show("部分浏览器可能失败，请使用‘右键另存为’下载",1, 3000);
});
//侧边栏
$(document).ready(function(){
    $("#menubar").animate({right:0}, 1500);
    $("#menubar span.mbot a").click(function(){
        $("#menubar").animate({right:"-73px"}, 1000);
        ZENG.msgbox.show("您可以在右键菜单或者开始菜单中重新打开侧边栏", 1, 3000);
    });
    $("#menubar ul li").removeClass("selected");
    $("#menubar ul li").eq(GetQueryString("menu")-1).addClass("selected");

});
$("#desk li:last").hide();
