$(function(){
    /**
     * 查询当前店铺微信公众号详情
     * auther:antony
     * date:20161122
     *
     */
    var userId ;
    var shop_sid;
    var shopIdAndUserId=store.get("shopIdAndUserId");
    var accessToken = globalUtil.getUrlParam("accessToken") || globalUtil.getUrlParam("access_token") || store.get("wx_access_token");
    var isBuy = false ;//购买套餐专属公众号
    var isBind =false;
    var other_name ="";
    var isBuyShop =false;//是否购买商家公众号
    var shopName ="";//店铺名称
    var beautifyMoney="";//美丽币
    var isverify ="";//认证类型和服务类型
    var bindPubSuccess={

        init:function(){

            document.title="微信公众号";
            $('#home').attr('href',wxGLOBAL.homeUrl +'/menu/index?route=app&view=menu_index');
            //清空授权码
            store.remove("wxAuthCode");

            //wx_access_token
            store.remove("wx_access_token");
            store.set("wx_access_token",accessToken);

            globalUtil.getWXAuthCode(accessToken);
            if(!shopIdAndUserId){
                this.getUserInfo();
            }else{
                userId=shopIdAndUserId.user_id;
                shop_sid=shopIdAndUserId.shop_sid;
                wxGLOBAL.shopSid=shop_sid;
                other_name =shopIdAndUserId.auth_info.user.otherName;
            }

            this.checkisBuySec();//查询是否开通

           // this.getPubInfo(userId,accessToken);
        },
      /*  selectShopInfo:function(){
            var _this =this;
            $.ajax({
                url:requestUrl.user.fetchWXshopInfo,
                data:{shop_sid:wxGLOBAL.shopSid},
                type:"post",
                dataType: "json",
                success :function(data){
                    if(data.status == "200" ){
                        var result = JSON.parse(data.content); ;
                        shopName =result.shopName ;//店铺名称
                        $('#shopName').html(shopName);
                    }
                },
                error :function(){
                    alert("网络开了小差，重新试试吧~");
                }
            });
        },*/
        /*
         *用户登陆信息
         */

        getUserInfo:function(){
            $.ajax({
                url:requestUrl.user.getUserInfo,
                data:{
                    access_token: accessToken
                },
                type:'post',
                async:false,
                dataType:'json',
                success:function(data){
                    if(data.status===200){
                        var content=data.content;
                        if(data.content){
                            content = JSON.parse($.base64.decode(content, "utf-8"));
                           // console.log("shopIdAndUserId:",content);
                            userId= content.user_id;
                            shop_sid =content.shop_sid;
                            other_name =content.auth_info.user.otherName;
                            wxGLOBAL.shopSid=shop_sid;//存储
                            store.remove("shopIdAndUserId");
                            store.set("shopIdAndUserId",content);
                        }else{
                            layer.msg('获取用户信息失败，请重新登陆')
                        }


                    }else{
                        layer.msg('更新失败，请稍后重试')
                    }
                }
            });
        },
        //查询商家公众是否开通
        checkisBuySec:function(){
            //判断是否购买套餐
            var _this =this;
            $.ajax({
                url:requestUrl.Payment.selectIsPayTc,
                data:{shop_sid:wxGLOBAL.shopSid,type:'shop_mp'},
                type:"get",
                dataType: "json",
                global:false,
                success :function(resultVo){
                    if(resultVo.status==200 ){

                        var resultList =resultVo.data;
                        if(resultList!=null && resultList.length>0) {
                            var  indate= resultList[0].indate;//有效期
                            if(parseInt(indate) >=32503564800000){
                                $('#indate').html("");
                                $('#zsdateP').hide();
                            }else{
                                var newTime = new Date(indate);
                                var newDateFat =newTime.format('yyyy-MM-dd');
                                $('#indate').html(newDateFat);
                                $('#zsdateP').show();
                            }

                            isBuyShop = true;//已购买
                        }else{
                            isBuyShop = false;//没有购买
                        }

                        _this.getPubInfo(userId,accessToken);//查询是否绑定

                    }else{
                       // alert("发生错误，请重试");
                    }
                },
                error :function(){
                  //  alert("网络开了小差，重新试试吧~");
                }
            });
        },
        //查询是否绑定
        getPubInfo:function(userId,accessToken){
            var _this = this;
            $.ajax({
                url:requestUrl.user.appInfo,
                data:{
                    "user_id":userId,
                    access_token:accessToken
                },
                type:"get",
                dataType:"json",
                success:function(data){
                    if(isBuyShop){

                        if(data.status==200){
                            //  buy yes   bing yes
                             // console.log("data:",data);
                                var content = JSON.parse( $.base64.decode(data.content,"utf-8"));
                                console.log("content:",content);
                                _this.insertHtml(content,userId);
                                $('#payBind').show();
                                $('#payNoBind').hide();
                                $('#noPayNoBind').hide();
                        }else if(data.status==25){
                            // 有公众号 buy yes  bind no
                                // buy yes  bind  no
                                $('#payBind').hide();
                                $('#payNoBind').show();
                                $('#noPayNoBind').hide();
                        }else{
                            layer.msg(data.error_message,1, 3);
                        }
                    }else{
                        //bind no buy no
                        $('#payBind').hide();
                        $('#payNoBind').hide();
                        $('#payNoBind').css('display',"none");
                        $('#noPayNoBind').show();
                    }

                   /* else{
                        layer.msg(data.error_message,1, 3);
                    }*/
                },
                fail:function(){
                    console.log("fail");
                }


            });
        },
        //填充html 绑定
        insertHtml :function(content){
            if(content.alias){
                $('#weixinName').html(content.alias);//微信名
            }else{
                $('#weixinName').html('未设置');//微信名
            }

            $('#qrcodeName').html(content.nick_name);
            $('#downImg').attr("href",wxGLOBAL.download_url+content.qr_file_image);
            $('#qrcodeImg').attr('src',wxGLOBAL.download_url+"/"+content.qr_file_image);
            var qcodeTypeHtml="";
            if(content.service_type_info==0 || content.service_type_info==1){
                qcodeTypeHtml= "订阅号";
            }
            else{
                qcodeTypeHtml=  "服务号";
            }
            var  iserver ="";
            if(-1 == content.verify_type_info){
                iserver= "未认证"
                //serviceTypeInfo=serviceTypeInfo+"(未认证)";
            }else{
                iserver= "已认证"
                //serviceTypeInfo=serviceTypeInfo+"(已认证)";
            }

            if(qcodeTypeHtml){
                $('#qrcodeType').html(iserver+qcodeTypeHtml);
            }else{
                $('#qrcodeType').hide();
            }

        }





    };
    /****************************绑定方法 start*****************************/
    //关闭遮罩：
    $(".closeBtn").on("click",function(){
        $('#sjTaoCan').hide();//弹窗隐藏
        $('#orderContent').hide();//弹窗隐藏
        $('#shawn_show').hide();//遮罩隐藏
        $("#sjsure").attr('data-commodity_id',"");
        $("#sjsure").attr('data-price','');
        $("#sjsure").attr('data-type','');
        $('.payNow').attr('data-order_id','');
        $('.payNow').attr('data-type','');
        $('.payNow').attr('data-price','');
        $('.payNow').attr('data-agreement','');
        $('#payAagin').attr('data-ready','');
        $('.allprice').html("");
        var value =$(this).attr('value');
        if(value == 1){
            //重新刷新页面
            window.location.reload();
        }
    });

    //商家公众号：
    $( "#sjkaitong").on("click",function(){
            selectTcList('shop_mp');//查询  shop_mp_y有专属公众号 shop_mp_n有专属公众号
    });

    //选择支付方式
    $('input[name="strong_edition"]').on("click",function(){
        var value = $(this).attr('value');
        $('.payNow').attr('data-pay_way',value);
    });
    //商家公众号购买
    $(".wxOpLead_box").on("click",function(){
            selectTcList('shop_mp');//查询  shop_mp_y有专属公众号 shop_mp_n有专属公众号
    });

    //商家公众号 选择产品
    $( '#sjTaoCan #sjTcResults').delegate('a.open_time_img','click',function(){
        $(this).siblings().children('i').remove();
        $(this).addClass('bor_blue').siblings().removeClass('bor_blue');
        $(this).prepend('<i class="icon_gou"></i>');
        var commodity_id = $(this).data('commodity_id');
        var price = $(this).data('price');
        $('#sjPrice').html(price);
        $('#sjsure').attr('data-price',price);
        $('#sjsure').attr('data-commodity_id',commodity_id);
    });


    // 提交订单 获取订单索引
    $('#sjsure').on("click",function(){
        //获取订单id序列
        var commodity_id =$(this).attr('data-commodity_id');
        var price =$(this).attr('data-price');
        var taoCanType =$(this).attr('data-type');
        getOrderIdIndex(taoCanType,commodity_id,price);

    });


    //同意请求
    $("#checkboxOneInput5").on("click",function(){
        var value = $(this).attr('value');
        if(value==0){
            $(this).attr('value',1);
            $('.payNow').attr('data-agreement',1);
        }else{
            $(this).attr('value',0);
            $('.payNow').attr('data-agreement',0);
        }

    });


    //立即支付
    $(".payNow").on("click",function(){
        var pay_way="";
        var agreement =$(this).attr('data-agreement');
        var order_id = $(this).attr('data-order_id');
        var price = $(this).attr('data-price');
        var commodity_id = $(this).attr('data-commodity_id');
        var readyOrder = $(this).attr('data-ready'); //是否已有订单
        $('input[name="strong_edition"]:checked').each(function() {
            pay_way = $(this).attr('value');
        });
        if(!commodity_id ||!order_id || !price){
            layer.msg('请关闭重试');
            return;
        }
        if(!pay_way ||pay_way=='undefined'){
            layer.msg('请选择支付方式');
            return;
        }if(pay_way==3){

            if(parseFloat(beautifyMoney)< parseFloat(price)){
                layer.msg('美丽币余额不足，请选择其他方式支付');
                return;
            }

        }
        if(agreement !=1){
            layer.msg('您未勾选美丽加收费协议');
            return;
        }
        //下单

        if(readyOrder==1){
            getReadlyOrder(order_id,price,pay_way);
        }else{
            //新建订单
            orderSubmit(order_id,commodity_id,price,pay_way);
        }
    });

   // 更新
    $('#refresh').on("click",function(){
        refreshEvent();
    });


    // 立即绑定
    $('#bindNow').on("click",function(){
        location.href="/o2o/bind/"+userId +"?shopSid="+wxGLOBAL.shopSid;
    });

    /****************************绑定方法   start*****************************/


    /****************************自定义方法  start*****************************/
    function refreshEvent(){
        var self = this;
        //点击刷新
        $.ajax({
            url:requestUrl.material.wxRefresh,
            type:'post',
            data:{user_id :wxGLOBAL.shopSid},
            dataType:'json',
            //async:false,
            success:function(data){
                if(data.status===200){
                    var htm='<div class="wxzdhf_optise wxzdhf_optise_box1">'+
                        '<p><i class="icon-optise02"></i></p>'+
                        '<p class="txt01">更新信息成功~</p></div>';

                    $.layer({
                        type: 1,
                        time: 2,
                        title: false,
                        shadeClose: false,
                        area: ['auto', 'auto'],
                        bgcolor: '',
                        border: [0], //去掉默认边框
                        closeBtn: [1, false], //去掉默认关闭按钮
                        shift: 'top',
                        page: {
                            html:htm
                        },
                        end:function(){
                            window.location.reload(true);
                        }
                    });


                }else{
                    var htm='<div class="wxzdhf_optise wxzdhf_optise_box1">'+
                        '<p class="txt01">&nbsp;&nbsp;&nbsp;更新失败，请稍后重试</p></div>';

                    $.layer({
                        type: 1,
                        time: 2,
                        title: false,
                        shadeClose: false,
                        area: ['auto', 'auto'],
                        bgcolor: '',
                        border: [0], //去掉默认边框
                        closeBtn: [1, false], //去掉默认关闭按钮
                        shift: 'top',
                        page: {
                            html:htm
                        }
                    });
                }
            }
        });
    }

    /* //查询套餐列表  beautify_mp专属公众号   sj商家公众号*/
    function selectTcList(type) {
        var  url = requestUrl.Payment.selectTcList;
        $.ajax({
            /*// url:requestUrl.Payment.selectTcList.replace("{{userid}}",wxGLOBAL.shopSid),*/
            url:url,
            data:{p_type:type},
            type:"get",
            dataType: "json",
            global:false,
            beforeSend:function(xhr){
                xhr.setRequestHeader('Authorization',accessToken);
            },
            success :function(data){
                if(data.status==200){
                    var resultVo= JSON.parse($.base64.decode(data.content,"utf8mb4"));
                   // console.log(JSON.stringify(resultVo));
                    if(resultVo &&resultVo.length>0) {
                            insertHtmlZSj(resultVo);
                    }else{
                      //  layer.msg('没有查询到套餐，请重试');
                        console.log('发生错误：'+data.errorMessage);

                    }
                }else{
                    console.log('发生错误：'+data.errorMessage);
                }
            },
            error :function(e){
                console.log(e);
            }
        });
    }


    //填充商家公众号html
    function insertHtmlZSj(result) {
        var html="";
        result.forEach(function(item,index){
            if(item.price && !isNaN(item.price)){
                item.price=item.price.toFixed(2);
            }
            var expire;
            if(item.expire){
                expire=item.expire/365;
            }
            html +=' <a href="javascript:;" data-commodity_id="'+item.id+'" data-price="'+item.price+'" class="open_time_img   tancanLeng ">'+expire+'年</a>';

        });
        $('#sjTcResults').html(html);//填充商品列表
        $('#sjTcResults >:first').prepend('<i class="icon_gou"></i>');
        $('#sjTcResults >:first').addClass('bor_blue');
        $('#sjPrice').html(result[0].price);
        var scrollHeight =$(document).scrollTop();
        $('#sjTaoCan').css('margin-top',scrollHeight);
        $('#sjTaoCan').show();//显示
        var heights =$(document.body).height()　 ;//全文高度
        $("#shawn_show").height(heights+"px");
        $("#shawn_show").show();//遮罩

        //给确定按钮赋值 很重要

        $("#sjsure").attr('data-commodity_id',result[0].id);
        $("#sjsure").attr('data-price',result[0].price);
        $("#sjsure").attr('data-type','shop_mp');

    }


    //获取订单索引，
    function getOrderIdIndex(type,commodityId,price) {
        var url = requestUrl.Payment.getOrderIndex.replace("{{shop_id}}",wxGLOBAL.shopSid);
        $.ajax({
            url:url,
            data:{},
            type:"get",
            dataType: "json",
            global:false,
            beforeSend:function(xhr){
                xhr.setRequestHeader('Authorization',accessToken);
            },
            success :function(data){
                if(data.status==200){
                    var resultVo= JSON.parse($.base64.decode(data.content,"utf8mb4"));
                   // console.log(JSON.stringify(resultVo));
                    if(resultVo) {
                        var order_id =resultVo.id;//获取订单索引
                        var scrollHeight =$(document).scrollTop();
                        $('#orderContent').css('margin-top',scrollHeight);
                        $('#orderContent').show();

                        $("#sjTaoCan").hide();
                        var heights =$(document.body).height()　 ;//全文高度
                        $("#shawn_show").height(heights+"px");
                        $("#shawn_show").show();
                        selectBeautBalance();
                        $('#tctype').html('商家公众号接入服务');
                        $('#userName').html(other_name);
                        $('.allprice').html(price+"元");
                        $('.payNow').attr('data-order_id',order_id);
                        $('.payNow').attr('data-type',type);
                        $('.payNow').attr('data-price',price);
                        $('.payNow').attr('data-commodity_id',commodityId);

                    }else{
                        layer.msg('发生错误，请重试');
                        console.log('发生错误：'+data.errorMessage);
                    }
                }else{
                    layer.msg('发生错误，请重试');
                    console.log('发生错误：'+data.errorMessage);
                }
            },
            error :function(e){
                console.log(e);
            }
        });

    }


    //下单接口
    function orderSubmit(orderId,commodityId,price,payWay) {
        var other_name =other_name || store.get('shopIdAndUserId').auth_info.user.otherName;
        var userFlag =store.get('shopIdAndUserId').auth_info.user.userFlag ||2 ;
        if(!other_name){
            console.log('没有获取到当前登录人');
        }
        var param ={
            id:orderId,
            shop_sid:wxGLOBAL.shopSid,
            price:price,
            commodity_id:commodityId,
            payer:other_name,//当前登录人
            num:1,
            pay_way:payWay,
            flag :userFlag,
            user_id:userId

        }
        var data =JSON.stringify(param);
        var url = requestUrl.Payment.placeOrder.replace("{{shop_id}}",wxGLOBAL.shopSid);
        $.ajax({
            /*url:requestUrl.user.fetchWXshopInfo,*/
            url:url,
            data:data,
            async:false,
            global:false,
            contentType:'application/json',
            global:false,
            beforeSend:function(xhr){
                xhr.setRequestHeader('Authorization',accessToken);
            },

            type:"post",
            dataType: "json",
            success :function(data){
                if(data.status==200 ) {
                    //下单成功，返回的签名，调用支付
                    var resultVo= JSON.parse($.base64.decode(data.content,"utf8mb4"));
                    //console.log(JSON.stringify(resultVo));
                    uniformPayment(resultVo,price,payWay);//正式下单 请求支付


                }else{
                    layer.msg('发生错误:'+data.error_message);
                    console.log(data.error_message);
                }
            },
            error :function(e){
                //失败
                layer.msg('发生错误，请重试');
                console.log(e);
            }
        });
    }

    //付款支付pay_way= (0：支付宝，1：微信，3：美丽付）
    function uniformPayment(contents,price,payWay){
        $.ajax({
            url:requestUrl.Payment.orderPay,
            data:contents,
            type:"post",
            async:false,
            global:false,
            dataType: "json",
            success :function(data){
                if(data.status==200 ) {
                    if(payWay==3){
                        layer.load('开通中，请您稍候！', 5);
                        setTimeout(function(){
                            window.location.reload();
                        },5000)

                    }else{
                        //微信或者支付宝
                        var beforeUrl =window.location.href;
                        window.open(wxGLOBAL.homeUrl +'/'+wxGLOBAL.shopSid +'/shop?route=marketing-shortMessage&view=shop_sms_pay&qrcode='+data.content+'&money='+price+'&type='+payWay+'&beforeUrl='+beforeUrl,'_blank');
                        $('#shawn_show').hide();
                        $.layer({
                            area: ['auto','auto'],
                            dialog: {
                                msg: '是否已经完成订单支付？',
                                btns: 2,
                                type: 4,
                                btn: ['已支付', '遇到问题'],
                                yes: function () {
                                    window.location.reload();
                                },
                                no: function () {
                                    $('#checkboxOneInput6').attr("checked", true);
                                    $('#checkboxOneInput6').attr("value",1);
                                    $('#payAagin').attr('data-ready','1');//已有订单标示
                                    $('#orderContent').hide();
                                    var scrollHeight =$(document).scrollTop();
                                    $('#payPro').css('margin-top',scrollHeight);
                                    $('#payPro').show();//显示订单问题
                                    var heights =$(document.body).height()　 ;//全文高度
                                    $("#shawn_show").height(heights+"px");
                                    $("#shawn_show").show();//遮罩

                                },
                                close: function(index){
                                    window.location.reload();
                                }
                            }
                        });
                    }



                }else{
                    layer.msg('发生错误，请重试');
                    console.log(data.error_message);
                }
            },
            error :function(e){
                //失败
                layer.msg('发生错误，请重试');
                console.log(e);
            }
        });
    }




    //查询美丽币余额
    function selectBeautBalance(){
        var userId =store.get('shopIdAndUserId').auth_info.user.id;//获取用户id
        $.ajax({
            url:requestUrl.Payment.selectBeautMoney,
            data:{user_id:userId,access_token:accessToken},
            type:"get",
            async:false,
            global:false,
            success :function(data){
                if(data.status==200 ) {
                    beautifyMoney=data.content;
                    $('.beautBalance').html('余额'+beautifyMoney+'元');
                    $('.beautBalance').show();
                }else{
                    beautifyMoney=0;
                    $('.beautBalance').html();
                    $('.beautBalance').hide();
                }
            },
            error :function(e){
                //失败
                layer.msg('发生错误，请重试');
                console.log(e);
            }
        });
    }

    //已有订单 获取签名
    function  getReadlyOrder(order_id,price,pay_way) {
        var userFlag =store.get('shopIdAndUserId').auth_info.user.userFlag ||2 ;
        // (0：支付宝，1：微信，3：美丽付）
        $.ajax({
            url:requestUrl.Payment.aleryOrder.replace('{shop_sid}',wxGLOBAL.shopSid).replace('{oder_id}',order_id).replace('{pay_way}',pay_way),
            dataType: 'json',
            data:{
                flag :userFlag,
                user_id:userId
            },
            global:false,
            beforeSend:function(xhr){
                xhr.setRequestHeader('Authorization',accessToken);
            },
            success: function(data){
                if(data.status==200){
                    var content = globalUtil.decryptData(data.content);
                    uniformPayment(content,price,pay_way);//支付
                }else{
                    console.log("状态不对"+data.errorMessage);
                }
            }
        });

    }

    /**************************自定义事件end*************************************/


    bindPubSuccess.init();


});



