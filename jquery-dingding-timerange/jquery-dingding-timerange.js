/**
 * Created by liyongleihf2006 on 2018.01.19
 * 模拟钉钉中的会议预定时间范围选择控件
 * options={
 *      interval:15*60*1000, //单位时间段的间隔时间
 *      startLimitTime:6*60*60*1000, //可选时间范围的起始
 *      startLimitFromCurrentTime:true,//若当前时间大于设置的startLimitTime时,时间范围是否从当前时间开始
 *      endLimitTime:24*60*60*1000, //可选时间范围的结束
 *      startTime:new Date().getHours()*60*60*1000+new Date().getMinutes()*60*1000, //开始时间
 *      endTime:new Date().getHours()*60*60*1000+new Date().getMinutes()*60*1000+interval, //结束时间
 *      maxIntervalCount:2, //结束时间和开始时间之间最多有几个单位的间隔
 *      excludeTimes:[[startTime,endTime],...],//要排除掉的时间段,这些时间段中的时间都会被排除在外
 *      controlFormatter:function(startTime,endTime),//必须配置,开始时间和结束时间在页面中的格式化
 *      onPanelOpen:function(){},//修改时间面板打开事件
 *      onPanelClose:function(){},//修改时间面板关闭事件
 * }
 * methods:
 *      openStartPanel //打开修改开始时间的弹窗
 *      openEndPanel //打开修改结束时间的弹窗
 *      setTime(startTime,endTime) //设置开始结束时间
 *      getTime //获取开始和结束时间
 *          return {startTime:startTime,endTime:endTime}
 */
(function($){
    if($.fn.dingdingTimerange){
        return;
    }
    var setMethods={
        "openStartPanel":openStartPanel,
        "openEndPanel":openEndPanel,
        "setTime":setTime
    };
    var getMethods={
        "getTime":getTime
    };
    $.fn.dingdingTimerange=function( ){
        var args=arguments,params,method;
        if(!args.length|| typeof args[0] == 'object'){
            return this.each(function(idx){
                var $self=$(this);
                $self.data('dingdingTimerange',$.extend(true,{},$.fn.dingdingTimerange.default,args[0]));
                params=$self.data('dingdingTimerange');
                _init.call( $self,params);
                _render.call($self);
            });
        }else{
            if(!$(this).data('dingdingTimerange')){
                throw new Error('You has not init dingdingTimerange!');
            }
            params=Array.prototype.slice.call(args,1);
            if (setMethods.hasOwnProperty(args[0])){
                method=setMethods[args[0]];
                return this.each(function(idx){
                    var $self=$(this);
                    method.apply($self,params);
                    _render.call($self);
                });
            }else if(getMethods.hasOwnProperty(args[0])){
                method=getMethods[args[0]];
                return method.apply(this,params);
            }else{
                throw new Error('There is no such method');
            }
        }
    }
    $.fn.dingdingTimerange.default={
        startLimitTime:6*60*60*1000,
        startLimitFromCurrentTime:true,
        endLimitTime:24*60*60*1000,
        startTime:undefined,
        endTime:undefined,
        maxIntervalCount:undefined,
        interval:15*60*1000,
        excludeTimes:[],
        onPanelClose:function(){},
        controlFormatter:function(startTime,endTime){

        }
    }
    /* 将时间转化为interval倍数的时间 */
    function _prettyTime(time,interval){
        if(!time){return time};
        var hours = Math.floor(time/(60*60*1000))*(60*60*1000);
            var minutes = Math.floor(time%(60*60*1000)/(60*1000))*(60*1000);
            return hours + (minutes%interval?(Math.floor(minutes/interval)+1)*interval:minutes);
    }
    function _init(params){
        params.startLimitTime = _prettyTime(params.startLimitTime,params.interval);
        params.endLimitTime = _prettyTime(params.endLimitTime,params.interval);
        params.startTime = _prettyTime(params.startTime,params.interval);
        params.endTime = _prettyTime(params.endTime,params.interval);
        var interval = params.interval,
            startLimitTime = params.startLimitTime,
            startTime = params.startTime,
            nowTimes = _prettyTime(new Date().getHours()*60*60*1000+new Date().getMinutes()*60*1000,params.interval);
        if(!startTime){
            params.startTime = nowTimes;
        }
        if(startLimitTime<nowTimes&&params.startLimitFromCurrentTime){
            params.startLimitTime = nowTimes;
        }
        if(!params.endTime){
            params.endTime =params.startTime+interval;
        }
        return this;
    }
    function openStartPanel(){
        var $self=this,
        params=$self.data("dingdingTimerange"),
        onPanelOpen=params.onPanelOpen;
        params._openStartPanel=true;
        onPanelOpen.call($self);
    }
    function openEndPanel(){
        var $self=this,
        params=$self.data("dingdingTimerange"),
        onPanelOpen=params.onPanelOpen;
        params._openEndPanel=true;
        onPanelOpen.call($self);
    }
    function closePanel(){
        var $self=this,
        params=$self.data("dingdingTimerange"),
        onPanelClose=params.onPanelClose;
        params._openStartPanel=false;
        params._openEndPanel=false;
        onPanelClose.call($self);
        _render.call($self);
    }
    function setTime(startTime,endTime){
        var $self=this,
        params=$self.data("dingdingTimerange");
        params.startTime = _prettyTime(startTime,params.interval);
        params.endTime = _prettyTime(endTime,params.interval);
    }
    function getTime(){
        var $self=this,
        params=$self.data("dingdingTimerange");
        return {startTime:params.startTime,endTime:params.endTime};
    }
    function _render(){
        var $self=this,
        params=$self.data("dingdingTimerange"),
        startTime = params.startTime,
        endTime = params.endTime,
        controlFormatter=params.controlFormatter;
        $self.addClass("dingdingTimerange").html([
            $("<div/>",{
                "class":"dingdingTimerange-label-container"
            }).append(
                $("<div/>",{
                    "class":"dingdingTimerange-control"
                }).append(
                    controlFormatter.call($self,startTime,endTime),
                    _dialogRender.call($self)
                )
            )
        ])
    }
    function _dialogRender(){
        var $self=this,
        params=$self.data("dingdingTimerange"),
        startTime = params.startTime,
        endTime = params.endTime,
        startLimitTime = params.startLimitTime,
        endLimitTime = params.endLimitTime,
        interval = params.interval,
        maxIntervalCount = params.maxIntervalCount,
        excludeTimes = params.excludeTimes,
        _openStartPanel=params._openStartPanel,
        _openEndPanel=params._openEndPanel;
        if(!_openStartPanel&&!_openEndPanel){
            return ;
        }
        return $("<div/>",{
            "class":"dingdingTimerange-mask center-box"
        }).append(
            $("<div/>",{
                "class":"center-wrap"
            }).append(
                $("<div/>",{
                    "class":"dingdingTimerange-dialog center-content"
                }).append(
                    $("<div/>",{
                        "class":"dingdingTimerange-dialog-header"
                    }).append(
                        $("<span/>",{
                            "class":"dingdingTimerange-dialog-title",
                            "text":function(){
                                if(_openStartPanel){
                                    return "开始时间"
                                };
                                return "结束时间"
                            }
                        }),
                        $("<span/>",{
                            "class":"dingdingTimerange-dialog-close",
                            "text":"x",
                            "click":function(){
                                closePanel.call($self);
                            }
                        })
                    ),
                    $("<div/>",{
                        "class":"dingdingTimerange-dialog-content"
                    }).append(
                        function(){
                            var times=[];
                            for(var i=startLimitTime;i<=endLimitTime;i+=interval){
                                times.push(i);
                            }
                            if(_openStartPanel){
                                times.pop();
                                times = times.filter(function(time){
                                    return excludeTimes.every(function(excludeTime){
                                        return time<excludeTime[0]||time>=excludeTime[1];
                                    })
                                });
                            }else{
                                times.shift();
                                times = times.filter(function(time){
                                    var boundary = endLimitTime;
                                    var excludeBeginTimes=excludeTimes.map(function(excludeTime){
                                        return excludeTime[0];
                                    }).sort(function(a,b){
                                        return a>b;
                                    }).some(function(excludeBeginTime){
                                        if(excludeBeginTime>startTime){
                                            boundary = excludeBeginTime;
                                            return true;
                                        }
                                        return false;
                                    })
                                    if(!maxIntervalCount){
                                        return time>startTime&&time<=boundary;
                                    }else{
                                        return time>startTime&&time<=boundary&&time<=startTime+maxIntervalCount*interval;
                                    }
                                    
                                }).filter(function(time){
                                    return excludeTimes.every(function(excludeTime){
                                        return time<=excludeTime[0]||time>excludeTime[1];
                                    })
                                });
                            }
                            return times.map(function(time){
                                return $("<div/>",{
                                    "class":"dingdingTimerange-dialog-item",
                                    "text":function(){
                                        var hour = Math.floor(time/(60*60*1000));
                                        var minute = Math.floor(time%(60*60*1000)/(60*1000));
                                        hour = (100+hour+"").slice(1);
                                        minute = (100+minute+"").slice(1);
                                        return hour+":"+minute;
                                    },
                                    "click":function(){
                                        if(_openStartPanel){
                                            params.startTime = time;
                                            params.endTime = time+interval;
                                        }else{
                                            params.endTime = time;
                                        }
                                        closePanel.call($self);
                                    }
                                })
                            });
                        }()
                    ),
                    $("<div/>",{
                        "class":"dingdingTimerange-dialog-footer"
                    }).append(
                        $("<a/>",{
                            "class":"dingdingTimerange-dialog-cancel",
                            "text":"取消",
                            "click":closePanel.bind($self)
                        })
                    )
                )
            )
        )
    }
})(jQuery);