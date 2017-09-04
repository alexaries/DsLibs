/**
 * @class Ds.createjs 快速访问是ccjs
 * @classdesc:这是对createjs开发常用功能快速实现工具类集合
 * ccjs.MovieTo                 快速控制动画MovieClip 播放 [常用]
 * ccjs.RemoveMovie             删除快速控制动画MovieClip 播放
 * ccjs.SetButton               快速把一个动画转化成按钮
 * ccjs.LoadJS                  加载一个脚本
 * ccjs.LoadCJSAssets           加载createjs项目资源 [常用]
 * ccjs.CJSModel               轻量createjs框架模型
 * ccjs.CJSModel.Create        轻量createjs框架模型快速创建方法 [常用]
 * @extends
 * @example:
 * @author: maksim email:maksim.lin@foxmail.com
 * @copyright: Ds是累积平时项目工作的经验代码库，不属于职位任务与项目的内容。里面代码大部分理念来至曾经flash 前端时代，尽力减小类之间耦合，通过webpack按需request使用。Ds库里内容多来至网络与参考其他开源代码库。Ds库也开源开放，随意使用在所属的职位任务与项目中。
 * @constructor
 **/
(function (factory) {
    var root = (typeof self == 'object' && self.self == self && self) ||
        (typeof global == 'object' && global.global == global && global);

    if (typeof define === 'function' && define.amd) {
        define(['exports'], function (exports) {
            module.exports= factory(root, exports);
        });
    } else if (typeof exports !== 'undefined') {
        module.exports=factory(root, exports);
    } else {
         factory(root, {});
    }

}(function (root, modelObj) {
  root.Ds = root.Ds || {};
  root.Ds.createjs=createjs|| {};
  root.Ds.createjs.Version = 'v1.5';
  root.ccjs=Ds.createjs;

  /**
   * 获取一个显示对象的BitmapData
   * 注意需要有createjs.BitmapData
   * @param  {[DisplayObject]} display [description]
   * @param  {[Rectangle]} rect    [description]
   * @return {[type]}         [description]
   */
  ccjs.GetDisplayObjectBitmapData = function(display, rect) {
    if (!createjs.BitmapData) {
      console.warn('no has createjs.BitmapData');
      return null;
    }
    rect = rect || display.getBounds();
    var _bitmapData = new createjs.BitmapData(null, rect.width, rect.height, "rgba(0,0,0,0)");
    _bitmapData.draw(display);
    display.uncache();
    return _bitmapData;
  };

  /**
   * 判断2个图形是否碰撞
   * 注意需要有createjs.BitmapData
   * 判碰撞会以源文件的大小去与目标文件进行对比（目前没做取做场景的位置偏移判断，所以2个图形最好坐标是统一的）;
   * @param  {[DisplayObject]} source [对比源文件]
   * @param  {[DisplayObject]} target [对比目标文件]
   * @return {[type]}        [description]
   */
  ccjs.HitTestByDisplayObject = function(source, target) {
    var _bitmapData = ccjs.GetDisplayObjectBitmapData(source);
    if (_bitmapData) {
      target.cache(0, 0, _bitmapData.width, _bitmapData.height);
      var _hitTest = _ObstacleBMP.hitTest({
        x: 0,
        y: 0
      }, 0xFF, target2, {
        x: 0,
        y: 0
      }, 0xff);
      target2.uncache();
      return _hitTest;
    } else {
      console.warn('no has createjs.BitmapData');
      return null;
    }
  };
  /**
   * 对文本进行换行处理
   * @param {[create.Text]} label [文本框对象]
   * @param {[String]} info  [内容]
   * @param {[Number]} width [最大长度]
   * @param {[Boolean]} crop [是否裁切，如果裁切就不做换行]
   */
  ccjs.Wrap = function(label, info, width,crop) {
    crop=crop||false;
    if(info.length<=0){
      label.text ='';
      return;
    }
    var _info = '',
      _oinfo;
    for (var i = 0; i < info.length; i++) {
      _oinfo = _info;
      _info = _oinfo + info[i];
      label.text = _info;
      var _w = label.getMetrics().width;
      if(crop&&_w > width){
        label.text = _oinfo;
        return;
      }
      if (_w > width) {
        label.text = _oinfo + '\n' + info[i];
        _w = label.getMetrics().width;
      }
      _info = label.text;
    }
  };
  /**
   * 快速创建dom输入框
   * @param  {[createjs.Container]} inputBox [输入框的容器]
   * @param  {[Object]} opts    [设置]
   * opts.type
   * opts.width
   * opts.color
   * opts.size
   * opts.max
   * @param {[String]}  defaultText   [默认输入文本]
   * @return {[$DOM]}                 [输入框的DOM对象]
   */
  ccjs.CreateInputMc=function(inputBox,opts,defaultText){
    opts=opts||{};
    var _inputDom;
    if(opts.type=='tel')_inputDom=$('<input type="tel" value="" />');
    else if(opts.type=='number')_inputDom=$('<input  type="number" value="" />');
    else if(opts.type=='textarea')_inputDom=$('<textarea name="" type="text" value="" rows ="3"/>');
    else _inputDom=$('<input  type="text" value="" />');
    if(opts.max!==undefined){_inputDom[0].maxlength=opts.max;}

    _inputDom.css({
      position:'absolute',
      top:0,
      left:0,
      'border-style':' none',
      'outline': 'none',
      '-webkit-outline': 'none',
      'transform': 'translate(-1000px,-1000px)',
      '-webkit-transform': 'translate(-1000px,-1000px)',
      'background-color': 'transparent',
      width:opts.width||100,
      color:opts.color||'#000',
      resize:'none',
      'font-size':opts.size||25,
      'line-height':opts.size?opts.size+'px':25+'px',
    });

    var _domElement = new createjs.DOMElement(_inputDom[0]);

    if(opts.domBox)_domBox=$(opts.domBox);
    else _domBox=$('#cjsBox');

    var _DefaultText=defaultText||'';
    _inputDom[0].value=_DefaultText;
    _inputDom.on('input',function(e){
      if(opts.max!==undefined){
        if(_inputDom[0].value.length>opts.max){
          _inputDom[0].value=_inputDom[0].value.substring(0,opts.max);
        }
      }
    });
    _inputDom.on('blur',function(e){
      if(_inputDom[0].value===''&&_DefaultText!==''){
        _inputDom[0].value=_DefaultText;
      }
    });

    _inputDom.on('focus',function(e){
      if(_inputDom[0].value===_DefaultText&&_DefaultText!==''){
        _inputDom[0].value='';
      }
    });
    //判断是否输入
    _inputDom.IsInput=function () {
      if(_inputDom[0].value===_DefaultText)return false;
      if(_inputDom[0].value==='')return false;
      if(_inputDom[0].value.length<=0)return false;
      return true;
    };

    $('body').on('touchstart',function (e) {
      if(_inputDom[0]!==e.target){
         _inputDom[0].blur();
      }
    });

    _domBox.append(_inputDom);
    inputBox.addChild(_domElement);
    return _inputDom;
  };

  /**
   * 格式化数字显示
   * @param  {[Number]} value  [数字]
   * @param  {[Array]} mcList [格式化显示用的影片剪辑列表]
   * @param  {[Boolean]} hitZero [是否隐藏前面的零]
   * @return {[type]}        [description]
   */
  ccjs.ShowFormatNumber =function(value,mcList,hitZero){
    hitZero=hitZero!==undefined?hitZero:false;
    var _info=value+'';
    var i;
    if(_info.length<mcList.length){
      var _l=mcList.length-_info.length;
      for ( i = 0; i < _l; i++) {
        _info='0'+_info;
      }
    }
    var _arr=_info.split('');
    var _starNoZero=false;
    for ( i = 0; i < _arr.length; i++) {
      var _mc=mcList[i];
      var _num=Number(_arr[i]);
      _mc.gotoAndStop(_num);
      _mc.visible=true;
      if(hitZero){
        if(_num!==0)_starNoZero=true;
        if(!_starNoZero&&_num===0){
          _mc.visible=false;
        }
      }
    }
  };
  var _SetInputTextContainer=$("<div id='CCJSSetInputTextContainer'><div/>");
  _SetInputTextContainer.css({position: 'absolute',left:-10000, top:0});
  /**
   * 判断是否是默认输入字
   * @param  {[type]} inputMc [description]
   * @return {[type]}         [description]
   */
  ccjs.IsDefaultText=function(inputMc) {
    var _label;
    if(inputMc instanceof createjs.Text) _label=inputMc;
    else _label=inputMc.label;
    if(_label&&(_label.defaultText===_label.text||_label.text===''))return true;
    return false;
  };
  /**
   * 进行设置一个输入框
   * @param  {[MovieChilp]} inputMc     [一个MovieChilp对象，内部一个label的text文本]
   * @param  {[String]} defaultText [默认字体]
   * @param  {[object]} opts [配置]
   * max  输入最大字符
   * type  类型  tel  number text
   *
   * @return {[type]}             [description]
   * inputMc.blur();  可以直接移除焦点
   *
   */
  ccjs.SetInputText = function(inputMc,defaultText,opts){
      if(!inputMc.label){
        console.warn('ccjs.SetInputText inputMc格式错误');
        return;
      }
      opts=opts||{};

      var _inputDom=$("<input type='text'/>");
      _inputDom.css({position: 'absolute',left:0, top:0,width:1});
      if(opts.max)_inputDom[0].maxLength=opts.max;
      if(opts.type)_inputDom[0].type=opts.type;
      if(_SetInputTextContainer.parent().length<=0)$('body').append(_SetInputTextContainer);
      _SetInputTextContainer.append(_inputDom);
      var _domElement = new createjs.DOMElement(_inputDom[0]);
      inputMc.addChild(_domElement);

      defaultText=defaultText||'';

      inputMc.defaultText=defaultText;
      inputMc.label.defaultText=defaultText;
      inputMc.dom=_inputDom[0];
      inputMc.label.dom=_inputDom[0];
      inputMc.clearBlur=function () {
        inputMc.dom.value='';
        inputMc.label.text=inputMc.label.defaultText;
        inputMc.dom.blur();
        inputMc.dispatchEvent('blur');
      };

      _inputDom.on('change',function(e){
        upUserLabel();
        _inputDom[0].blur();
        inputMc.dispatchEvent('change');
      });
      _inputDom.on('blur',function(e){
        inputMc.gotoAndStop(0);
        var _info=_inputDom[0].value;
        // console.log('_inputDom blur',_info,defaultText);
        if(_info===''&&defaultText!==''){
          inputMc.label.text=defaultText;
          inputMc.dispatchEvent('update');
        }else{
          upUserLabel();
        }
        inputMc.dispatchEvent('blur');
      });
      _inputDom.on('focus',function(e){
        // console.log('_inputDom focus');
        if(defaultText==inputMc.label.text){
          _inputDom[0].value='';
          inputMc.label.text='';
          inputMc.dispatchEvent('update');
        }else{
          _inputDom[0].value=inputMc.label.text;
          inputMc.dispatchEvent('update');
        }
        if(inputMc instanceof createjs.MovieClip)inputMc.gotoAndStop(inputMc.totalFrames-1);
        inputMc.dispatchEvent('focus');
      });
      _inputDom.on('input',function(e){
        upUserLabel();
        inputMc.dispatchEvent('input');
      });
      function upUserLabel(){
        if(opts.max)if(_inputDom[0].value.length>=opts.max)_inputDom[0].value=_inputDom[0].value.slice(0,opts.max);
        var _info=_inputDom[0].value;
        inputMc.label.text=_info;
        inputMc.dispatchEvent('update');
      }
      inputMc.mouseChildren = false;
      inputMc.on('mousedown',inputMcMouseDonw);
      function inputMcMouseDonw(e){
        var mc = e.target;
        var stage = mc.getStage();
        stage.addEventListener('stagemousedown', stagemousedown);
        _inputDom[0].focus();
      }
      function stagemousedown(e) {
        var _temp = e.target;
        if(!inputMc.contains(_temp)){
          inputMc.gotoAndStop(0);
          _inputDom[0].blur();
        }
      }
  };
  /**
   * 控制动画MovieClip播放
   * @param  {[MovieClip]} mc     [需要控制的MovieClip]
   * @param  {[String Number]} value  [需要跳转到的祯]
   * @param  {[Function]} endFun [播放完成后需要执行的方法,默认可以为空]
   * @return {[Object]}        [这个影片控制的数据]
   */
  ccjs.MovieTo = function(mc, value, endFun) {
    //如果是标签的话 转换成帧
    if (typeof value == 'string') {
      value = mc.timeline._labels[value];
    }
    if(value<0)value=mc.totalFrames;
    mc.__mcMovieToData = undefined;
    var mcObj = {};
    mcObj.mc = mc;
    mcObj.time = 1000 / createjs.Ticker.getFPS();
    mcObj.timer = 0;
    mcObj.start = mc.currentFrame;
    mcObj.end = value;
    //log(mcObj,mccurrentFrame,mc.totalFrames);
    if (mcObj.end < 0) mcObj.end = 0;
    if (mcObj.end >= mc.totalFrames) mcObj.end = mc.totalFrames - 1;
    if (mcObj.end >= mcObj.start) mcObj.bool = true;
    if (mcObj.end < mcObj.start) mcObj.bool = false;
    mcObj.endFun = endFun;
    createjs.Tween.removeTweens(mc);
    mc.__mcMovieToData = mcObj;
    if (mcObj.end == mcObj.start) {
      createjs.Tween.removeTweens(mc);
      mc.__mcMovieToData = undefined;
      if (mcObj.endFun !== undefined && mcObj.endFun !== null) mcObj.endFun();
    } else {
      createjs.Tween.get(mc).wait(mcObj.time).call(movieToUpFrame);
    }
    return mcObj;
  };
  /**
   * 控制动画剪辑播放帧触发
   * @return {[type]} [description]
   */
  function movieToUpFrame() {
    var mc = this;
    var mcObj = mc.__mcMovieToData;
    if (mcObj === undefined) return;
    if (mc.currentFrame == mcObj.end) {
      //log('clear 1',mc,mcObj.endFun);
      createjs.Tween.removeTweens(mc);
      mc.__mcMovieToData = undefined;
      if (mcObj.endFun !== undefined && mcObj.endFun !== null) mcObj.endFun();
      return;
    }
    var num = 0;
    if (mcObj.bool) {
      num = mc.currentFrame + 1;
      mc.gotoAndStop(num);
      //log(mc.currentFrame,num);
    } else {
      //log('test 2',mc.currentFrame,mc.currentFrame-1);
      num = mc.currentFrame - 1;
      mc.gotoAndStop(num);
    }

    if ((mcObj.bool && mc.currentFrame >= mcObj.end) && (!mcObj.bool && mc.currentFrame <= mcObj.end)) {
      createjs.Tween.removeTweens(mc);
      mc.__mcMovieToData = undefined;
      if (mcObj.endFun !== undefined && mcObj.endFun !== null) mcObj.endFun();
      mc.gotoAndStop(mcObj.end);
    } else {
      //log('进行',mc,mcObj.time);
      //mcObj.timer=setTimeout("this.movieToUpFrame("+mcObj.mc+")",mcObj.time);
      createjs.Tween.get(mc).wait(mcObj.time).call(movieToUpFrame);
    }
  }
  /**
   * 删除影片播放控制
   * @param  {[MovieClip]} mc [需要删除的MovieClip]
   * @return {[MovieClip]}    [description]
   */
  ccjs.RemoveMovie = function(mc) {
    createjs.Tween.removeTweens(mc);
    mc.__mcMovieToData = undefined;
    return mc;
  };
  /**
   * 设置按钮 普遍做法是把一个MovieClip转换成一个按钮(pc常用)
   * 鼠标移动上去从0祯播放到最后一个祯,点击会会播放
   * @param {[MovieClip]} mc    [要转成按钮的影片剪辑]
   * @param {[DisplayObject]} hitMc [作为这按钮响应区域的显示对象]
   */
  ccjs.SetButton = function(mc, hitMc) {
    if (hitMc) {
      SetButtonByHitMc(mc, hitMc);
      return;
    }
    if (mc instanceof createjs.MovieClip) ccjs.MovieTo(mc, 0);
    mc.cursor = 'pointer';
    mc.mouseChildren = false;
    mc.addEventListener('mouseover', function(e) {
      var mc = e.target;
      //log('mouseover',mc)
      var stage = mc.getStage();
      if (stage) {
        stage.canvas.style.cursor = 'pointer';
      }
      if (mc instanceof createjs.MovieClip) ccjs.MovieTo(mc, mc.totalFrames - 1);
    });
    mc.addEventListener('mouseout', function(e) {
      var mc = e.target;
      //log('mouseout',mc)
      var stage = mc.getStage();
      if (stage) {
        stage.canvas.style.cursor = 'default';
      }
      if (mc instanceof createjs.MovieClip) ccjs.MovieTo(mc, 0);
    });
    //手机版本按钮方式判断 通过点击下后判断
    mc.addEventListener('mousedown', function(event) {
      //log('setPhoneButton mousedown',event);
      var mc = event.target;
      var stage = mc.getStage();
      //进行精准判断是否移动出去后再移动进来的点击，当mc.MCSetButtonMouseOut=true 其实click事件可以不执行
      mc.MCSetButtonMouseOut = false;
      if (mc instanceof createjs.MovieClip) ccjs.MovieTo(mc, mc.totalFrames - 1);
      var stagemousemove = function(e) {
        var pt = mc.getStage().localToLocal(e.stageX, e.stageY, mc);
        if (!mc.hitTest(pt.x, pt.y)) {
          //log('mouse out');
          mc.MCSetButtonMouseOut = true;
          if (mc instanceof MovieClip) ccjs.MovieTo(mc, 0);
          stage.removeEventListener('stagemousemove', stagemousemove);
          stage.removeEventListener('stagemouseup', stagemouseup);
        }
      };
      var stagemouseup = function(e) {
        //log('mouse up');
        if (mc instanceof createjs.MovieClip) ccjs.MovieTo(mc, 0);
        stage.removeEventListener('stagemousemove', stagemousemove);
        stage.removeEventListener('stagemouseup', stagemouseup);
      };
      stage.addEventListener('stagemousemove', stagemousemove);
      stage.addEventListener('stagemouseup', stagemouseup);
    });
  };
  //需要设置其他响应区域的按钮算法
  function SetButtonByHitMc(mc, hitMc) {
    if (mc instanceof createjs.MovieClip) mc.gotoAndStop(0);
    mc.hitMc = hitMc;
    hitMc.mc = mc;
    hitMc.cursor = 'pointer';
    if (hitMc.mouseChildren !== null) hitMc.mouseChildren = false;
    hitMc.addEventListener('mouseover', function(e) {
      var hitMc = e.target;
      var mc = hitMc.mc;
      //log(hitMc);
      var stage = hitMc.getStage();
      if (stage) {
        stage.canvas.style.cursor = 'pointer';
      }
      if (mc instanceof MovieClip) ccjs.MovieTo(mc, mc.totalFrames - 1);
    });
    hitMc.addEventListener('mouseout', function(e) {
      var hitMc = e.target;
      var mc = hitMc.mc;
      //log('mouseout',mc)
      var stage = hitMc.getStage();
      if (stage) {
        stage.canvas.style.cursor = 'default';
      }
      if (mc instanceof createjs.MovieClip) ccjs.MovieTo(mc, 0);
    });

    //手机版本按钮方式判断 通过点击下后判断
    hitMc.addEventListener('mousedown', function(event) {
      //log('setPhoneButton mousedown',event);
      var hitMc = event.target;
      var mc = hitMc.mc;
      var stage = hitMc.getStage();
      //进行精准判断是否移动出去后再移动进来的点击，当mc.MCSetButtonMouseOut=true 其实click事件可以不执行
      hitMc.MCSetButtonMouseOut = false;
      if (mc instanceof createjs.MovieClip) ccjs.MovieTo(mc, mc.totalFrames - 1);
      var stagemousemove = function(e) {
        var pt = hitMc.getStage().localToLocal(e.stageX, e.stageY, hitMc);
        if (!hitMc.hitTest(pt.x, pt.y)) {
          //log('mouse out');
          hitMc.MCSetButtonMouseOut = true;
          if (mc instanceof createjs.MovieClip) ccjs.MovieTo(mc, 0);
          stage.removeEventListener('stagemousemove', stagemousemove);
          stage.removeEventListener('stagemouseup', stagemouseup);
        }
      };
      var stagemouseup = function(e) {
        //log('mouse up');
        if (mc instanceof createjs.MovieClip) ccjs.MovieTo(mc, 0);
        stage.removeEventListener('stagemousemove', stagemousemove);
        stage.removeEventListener('stagemouseup', stagemouseup);
      };
      stage.addEventListener('stagemousemove', stagemousemove);
      stage.addEventListener('stagemouseup', stagemouseup);
    });
  }
  /**
   * 加载插入JS资源
   * @param {[String]} jsUrl    [加载js资源]
   * @param {[Function]} complete [js加载完成后]
   * @param {[Function]} error    [js加载失败后]
   */
  ccjs.LoadJS = function(jsUrl, complete, error) {
    var jsloader = new createjs.JavaScriptLoader({
      src: jsUrl,
      id: jsUrl,
      type: "javascript"
    });
    jsloader.addEventListener('complete', jsComplete);
    jsloader.addEventListener('error', jsError);
    jsloader.load();

    function jsComplete(e) {
      if (complete) complete(e);
    }

    function jsError(e) {
      if (error) error(e);
    }
  };
  /**
   * 加载flash资源队列
   * @param {[Object]} param [加载参数对象]
   * param.jsUrl		加载js对象
   * param.judge		是否指定2017以后版本，如果不指定，会进行createjs.TextLoader加载后进行字符判断抽取。
   * param.id		     2017以后版本导出的库有指定id，可以指定id 并且不适用judge判断，这样就不需要多做一次createjs.TextLoader加载后获取 库的id号
   * param.otherList	顺带加载一些其他资源
   *
   * param.jsNS		js命名空间
   * param.imgNS		图片命名空间
   *
   * param.progress 	加载过程回调
   * param.complete 	加载完成回调
   *
   * param.basePath 	添加相对路径 默认不输入basePath 为null,直接使用默认路径，有设置会basePath+其他路径url
   *
   * param.loadType 	加载类型，默认不需要http服务的false
   *
   *
   */
  ccjs.LoadCJSAssets = function(param) {

    //这个方法就是为了加载flash导出的资源，怎么可以没有jsUrl参数?
    if (!param.jsUrl) {
      alert('参数jsUrl是必须!');
      return;
    }
    var basePath = param.basePath ? param.basePath : null;
    //是否需要进行判断是否是最新的AnimateCC2017导出的资源
    var _judgeAnimateCC2017=param.judge!==undefined?param.judge:true;
    //命名空间的id
    var _isCompositionID=param.id;
    //是否最新AdobeAnimateCC2017以后的版本 如果不进行判断，但有填写id那还默认为是最新的AnimateCC2017导出的资源
    var _isAdobeAnimateCC2017=(!_judgeAnimateCC2017&&_isCompositionID)?true:false;

    //获取导出库对象
    var _comp;
    //加载js对象
    var jsUrl = param.jsUrl;
    //加载spritesheet资源数组
    var ssList = param.ssList ? param.ssList : null;

    //顺带加载一些其他资源
    var otherList = param.otherList ? param.otherList : null;
    //js命名空间
    var jsNS = param.jsNS ? param.jsNS : 'lib';
    //图片命名空间
    var imgNS = param.imgNS ? param.imgNS : 'images';
    //加载完成回调s
    var complete = param.complete ? param.complete : null;
    //加载过程回调
    var progress = param.progress ? param.progress : null;
    //加载类型，默认不需要http服务的false
    var loadType = param.loadType ? true : false;
    //创建队列对象
    var queue = new createjs.LoadQueue(loadType);
    if (createjs.Sound) queue.installPlugin(createjs.Sound);
    queue.addEventListener("fileload", queueFileLoad);
    queue.addEventListener("progress", queueProgress);
    queue.addEventListener("error", queueError);
    queue.addEventListener("complete", queueComplete);
    //先开始加载导出的JS
    var _jsUrl = basePath ? basePath + jsUrl : jsUrl;

    var textloader = new createjs.TextLoader({
      src: _jsUrl,
      id: _jsUrl,
    });
    var jsloader = new createjs.JavaScriptLoader({
      src: _jsUrl,
      id: _jsUrl,
      type: "javascript"
    });
    textloader.addEventListener('complete', textComplete);
    jsloader.addEventListener('complete', jsComplete);
    //需要判断并且没指定库对象id的 必须进行判断加载
    if(_judgeAnimateCC2017)textloader.load();
    //不需要判断，有库的id号，说明是AdobeAnimateCC2017以后的版本
    else if(!_judgeAnimateCC2017&&_isCompositionID){
      console.log('no Judge is AnimateCC 2017');
      jsloader.load();
    }
    //老版本导出
    else{
      jsloader.load();
    }
    //进行判断后执行重新加载js
    function textComplete(e) {
      var jsText=textloader.getResult();
      //判断是否最新AdobeAnimateCC2017以后的版本
      if(jsText.indexOf("an.compositions['")>=0)_isAdobeAnimateCC2017=true;
      if(_isAdobeAnimateCC2017){
        var reg = /an\.compositions\['(\w*)'\]/;
        jsText.replace(reg, function() {
            _isCompositionID=arguments[1];
        });
      }
      jsloader.load();
    }
    function jsComplete(e) {
      queueStartLoad();
    }

    var queueArr,ssMetadata;
    function queueStartLoad() {
      //老版本
      if(!_isAdobeAnimateCC2017){
        queueArr = window[jsNS].properties.manifest;
        ssMetadata = window[jsNS].ssMetadata;
      }
      //新版本
      else{
        _comp=AdobeAn.getComposition(_isCompositionID);
        var lib=_comp.getLibrary();
        window[jsNS]=lib;
        window[imgNS]=_comp.getImages();
        queueArr = lib.properties.manifest;
        ssMetadata = lib.ssMetadata;
      }


      var i;
      //如果存在basePath设置选择对window[jsNS].properties.manifest进行设置
      if (basePath) {
        for (i = 0; i < queueArr.length; i++) {
          queueArr[i].src = basePath + queueArr[i].src;
        }
      }
      //其他资源的加载
      if (otherList !== null) {
        for (i = 0; i < otherList.length; i++) {
          var _otherurl = otherList[i];
          // _otherurl=basePath?basePath+_otherurl:_otherurl
          queueArr.push(_otherurl);
        }
      }
      if (queueArr.length <= 0) {
        complete();
        return;
      }
      queue.loadManifest(queueArr);
    }
    //文件加载错误
    function queueError(e) {}
    //队列加载进度
    function queueProgress(e) {
      // log(e.target.progress);
      if (progress !== null) progress(e);
    }
    //当个文件加载完成
    function queueFileLoad(e) {
      //获取图片命名空间 图片索引字典
      var images = window[imgNS];
      if (images === undefined) window[imgNS] = {};
      images = window[imgNS];
      //加载的图片对象放进图片字典中
      if (e.item.type == createjs.LoadQueue.IMAGE) images[e.item.id] = e.result;
    }
    //队列加载完成
    function queueComplete(e) {
      var ss;
      if(!_isAdobeAnimateCC2017){
        ss= window.ss = window.ss || {};
      }else{
        ss=_comp.getSpriteSheet();
      }

      var i;
      if (ssMetadata) {
        for (i = 0; i < ssMetadata.length; i++) {
          ss[ssMetadata[i].name] = new createjs.SpriteSheet({"images": [queue.getResult(ssMetadata[i].name)],"frames": ssMetadata[i].frames});
        }
      }
      if (complete !== null) complete(e);
    }
    //队列对象
    return queue;
  };
  /**
   * 轻量createjs框架模型 [CCJSModel]
   * 拥有属性
   * 	Stage 舞台 默认舞台不放物件
   *  Root  主容器 默认把显示对象放这个里面
   *  Canvas 这个模块用的Canvas对象
   * 以上属性CjsModel指向这个模块本身
   *  SetFPS 幀设置
   *  SetSize 进行设置宽高
   * @param {[Canvas]} canvas [一个canvas对象或者空  空会自动创建一个canvas]
   */
  var CJSModel = function(canvas) {
    var _Self = this;
    canvas = canvas ? canvas : document.createElement("canvas");

    this.Stage = new createjs.Stage(canvas);
    this.Stage.CjsModel = this;
    this.Stage.update();
    //Canvas
    this.Canvas = this.Stage.canvas;
    this.Canvas.CjsModel = this;
    //设置Root
    this.Root = new createjs.Container();
    this.Root.name = 'root';
    this.Root.CjsModel = this;
    // this.Root.stage=this.stage;
    this.Stage.Root = this.Root;
    this.Stage.addChild(this.Root);
    //设置鼠标移动上去响应帧数 这里修改成30 手机性能都提高了可以刷新快点
    this.Stage.enableMouseOver(30);
    createjs.Touch.enable(this.Stage);
    //经常做手绘画字时候 会没有stagemousemove事件mouseMoveOutside与mouseInBounds需要做开启
    this.Stage.mouseMoveOutside = true;
    this.Stage.mouseInBounds = true;
    this.Pause = false;
    createjs.MotionGuidePlugin.install();

    /**
     * 幀设置
     * @param {[type]} value [默认30帧]
     */
    this.SetFPS = function(value) {
      createjs.Ticker.setFPS(value);
    };
    /**
     * 帧触发
     */
    createjs.Ticker.addEventListener("tick", HandleTick);

    function HandleTick() {
      _Self.Update();
    }
    /**
     * 进行刷新
     */
    this.Update = function() {
      if (_Self.Pause) return;
      var _stage = _Self.Stage;
      _stage.update();
    };
    /**
     * 设置canvas尺寸
     * @param {[type]} _w [description]
     * @param {[type]} _h [description]
     */
    this.SetSize = function(_w, _h) {
      _Self.Canvas.setAttribute('width', _w);
      _Self.Canvas.setAttribute('height', _h);
    };
  };
  /**
   * 快速创建一个canvas对象的CJSModel控制模块
   * @param  {[Object]} param [参数]
   * param.canvas 	设置一个canvas对象 可以是canvas对象\jQuery对象\字符串通过jQuery检索\空(创建一个canvas对象)
   * param.width  	设置canvas宽 数值或者为空（默认设定640 param.canvas不为空，不会进行附值）；  如果是param.canvas与param.width都为空 一定会设置width。
   * param.height 	设置canvas高 数值或者为空（默认设定1030 param.canvas不为空，不会进行附值）；  如果是param.canvas与param.height都为空 一定会设置height。
   * param.fps    	设置fps高    数值或者为空（默认设定30)
   * param.css 		设置canvas的css样式 Object（空值null设定{position:'absolute',left:0,top:0}  空值undefined不做css变化);
   * param.appendTo 	设置canvas的被添加什么容器内 String（默认不做添加);
   * @return {[CJSModel]}       [CJSModel控制模块]
   */
  CJSModel.Create = function(param) {
    var width = param.width ? param.width : 640;
    var height = param.height ? param.height : 1030;
    var fps = param.fps ? param.fps : 30;
    var appendTo = param.appendTo ? param.appendTo : '';
    var _canvas = param.canvas ? param.canvas : document.createElement("canvas");
    // log( typeof canvas === 'string')
    if (typeof _canvas === 'string') {
      // _canvas = $(_canvas)[0];
      _canvas = document.getElementById(_canvas);
    }
    if (_canvas instanceof HTMLElement) _canvas = _canvas;
    else if (_canvas[0] instanceof HTMLElement) _canvas = _canvas[0];
    else {
      console.log('Error param.canvas:', param.canvas);
      return;
    }
    var _cjsModel = new CJSModel(_canvas);
    _cjsModel.SetFPS(fps);
    var _Stage = _cjsModel.Stage;
    var _Root = _cjsModel.Root;
    var _Canvas = _cjsModel.Canvas;
    //默认 {position:'absolute',left:0,top:0}
    if (param.css !== undefined){$(_Canvas).css(param.css);}
    //appendTo不是空就进行appendTo
    if (appendTo !== '') {
      if (typeof appendTo === 'string') {
        document.getElementById(appendTo).appendChild(_Canvas);
      } else if (appendTo instanceof HTMLElement) {
        appendTo.appendChild(_Canvas);
      } else if (appendTo[0] instanceof HTMLElement) {
        appendTo[0].appendChild(_Canvas);
      } else {
        console.warn('param.appendTo 参数非法');
      }
    }
    //设置尺寸
    if (param.width) _Canvas.setAttribute('width', width);
    if (param.height) _Canvas.setAttribute('height', height);
    return _cjsModel;
  };

  ccjs.CJSModel = CJSModel;

  return root.Ds.createjs;
}));
