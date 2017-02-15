// 店铺二维码

$(function(){
	
	

	var accessToken = globalUtil.getUrlParam("accessToken") || globalUtil.getUrlParam("access_token") || store.get("wx_access_token") || $.cookie('access_token');
	
	//清空授权码
	store.remove("wxAuthCode");
	
	//wx_access_token 
	store.remove("wx_access_token");
	store.set("wx_access_token",accessToken);

	if(!accessToken){
		store.remove("shopIdAndUserId");
		window.location.href= wxGLOBAL.homeUrl+"/"+wxGLOBAL.shopSid;
	}
	
	//获取授权码
	globalUtil.getWXAuthCode(accessToken);//获取安全协议
    globalUtil.getUserInfo(accessToken);//获取用户信息
	var pageId = "#auto_page_main ";//指向当前页面page 注意留空格
	var isBuy = false ;//购买套餐专属公众号
	var isBuyShop =false;//是否购买商家公众号
    var shopName ="";
    var beautifyMoney="";//美丽币



	var userId = store.get('shopIdAndUserId').auth_info.user.id;//获取用户id
	var shopQRCodeApp={
			init:function(){

				document.title ="微信公众号";
                this.checkisBuySec('beautify_mp');//查询是否有专属公众号
                this.checkisBuySec('shop_mp');//查询是否有商家公众号
                this.selectShopInfo();//查询店铺信息
                this._end();
			},
			fetchQRCode:function(){
				$.ajax({
	 				url:requestUrl.user.fetchFocusQrcodeImg +wxGLOBAL.shopSid + "/attention/qrcode",
	 				data:{},
	 				type:"get",
	 				dataType: "json",
	 				success :function(data){
	 					if(data.returnCode == "success" ){
	 						
	 						var focusQrImg =data.code.imageUrl;
                            $("#focusImg").attr("src",focusQrImg);
							$("#downFocusImg").attr("href",focusQrImg);//下载二维码 号
	 					//	var showCardImgUrl= data.xxx;
	 						//$("#SampleCard").attr("src",showCardImgUrl);
	 					}
	 				},
	 				error :function(){
	 					alert("网络开了小差，重新试试吧~");
	 				}
	 			 });
				this._end()
			},
		    checkisBuySec:function(type){
			//判断是否购买套餐
			var _this =this;
			$.ajax({
				url:requestUrl.Payment.selectIsPayTc,
				data:{shop_sid:wxGLOBAL.shopSid,type:type},
				type:"get",
                global:false,
				dataType: "json",
				success :function(resultVo){
					if(resultVo.status==200 ){

                        if(type=='beautify_mp'){
                            //服务号
                                var resultList =resultVo.data;
                                if(resultList!=null && resultList.length>0) {
                                    var  indate= resultList[0].indate;//有效期
                                    if(parseInt(indate) >= 32503564800000){
                                        $('#zsdateP').hide();
                                    }else{
                                        var newTime = new Date(indate);
                                        var newDateFat =newTime.format('yyyy-MM-dd');
                                        $('#zsdate').html(newDateFat);
                                        $('#zsdateP').show();
                                    }
                                    _this.fetchPayQrCode();//二维码
                                    _this.fetchQRCode();//二维码
                                    isBuy = true;//已购买
                                    $('.piontOut').show();//显示指示
                                    $('#buyTrue').show();//显示开通内容

                                    $('#buyFalse').hide();//隐藏未开通内容
                                }else{
                                    //没有购买
                                    isBuy = false;//mei购买
                                    $('.piontOut').hide();//显示指示
                                    $('#buyTrue').hide();//显示开通内容
                                    $('#buyFalse').show();
                                }

                        }else{
                            //商家公众号
                            var resultList =resultVo.data;
                            if(resultList!=null && resultList.length>0) {
                                isBuyShop= true;
                                var  indate= resultList[0].indate;//有效期
                                $('#showShopLink').show();
                                $('.sjText').html('已开通');
                                $('.sjkaitong').html('进入');

                            }else{
                                isBuyShop= false;
                                $('#showShopLink').hide();
                                $('.sjText').html('未开通');
                                $('.sjkaitong').html('开通');

                            }
                        }
					}else{
                      //  alert("发生错误请重试");
                    }
				},
				error :function(){
					//alert("网络开了小差，重新试试吧~");
				}
			 });
		    },
			fetchPayQrCode:function(){
				
				$.ajax({
	 				url:requestUrl.user.fetchPayQrcodeImg +wxGLOBAL.shopSid + "/pay/qrcode",
	 				data:{},
	 				type:"get",
	 				dataType: "json",
	 				success :function(data){
	 					if(data.returnCode == "success" ){
	 						var payQrImg = data.payCode.imageUrl;
	 						$("#payImg").attr("src",payQrImg);
							$("#downPayImg").attr("href",payQrImg);//下载二维码 支付
	 					/*	var focusQrImg =data.code.imageUrl;
	 						$("#payImg").attr("src",focusQrImg).parent("span").parent("p").next("a").attr("href",focusQrImg);
	 						
	 						var showCardImgUrl= data.xxx;
	 						$("#SampleCard").attr("src",showCardImgUrl);*/
	 					}
	 				},
	 				error :function(){
	 					alert("网络开了小差，重新试试吧~");
	 				}
	 			 });
			},
        selectShopInfo:function(){
            var _this =this;

            $.ajax({
                url:requestUrl.Payment.selectShopInfo.replace("{{shop_id}}",wxGLOBAL.shopSid),
                data:{shop_sid:wxGLOBAL.shopSid},
                type:"get",
                dataType: "json",
                success :function(data){
                    if(data.status == "200" ){
                        var result= JSON.parse($.base64.decode(data.content,"utf8mb4"));
                            shopName =result.shop_name ;//店铺名称
                        $('#shopName').html(shopName);
                    }
                },
                error :function(){
                    alert("网络开了小差，重新试试吧~");
                }
            });
        },
		_end:function(){
				//var hre ="/o2o/route/"+wxGLOBAL.shopSid+"/auth-register_server_number";
				
				//$("#toBindLink").attr("href",hre).attr("target","_blank");
				//$("body").delegate("a.itemId","click",function(){})
				
				//导航设置
				var wifiRoute = "/o2o/route/"+wxGLOBAL.shopSid+"/tools-wifi-shop_wifi_snapshoot";
				var  fansUrl ="/o2o/route/"+wxGLOBAL.shopSid+"/tools-manage-weixin_custom_index";
				$("#navigation_set").attr("href",wifiRoute);
				$("#jumpSetWifiPage").attr("href",wifiRoute).attr("target","_blank");
				//粉丝管理
				$("#fansManager").attr("href",fansUrl);
			}
	};

	/********************antony 绑定事件 start***************************/
    //指示提醒：
    $(pageId + ".piontOut").hover(function(){
        $(this).children('.source_tise_box').show();
    },function () {
        $(this).children('.source_tise_box').hide();
    });



     //开通专属公众号：
	$(pageId + ".zsKaiTong").on("click",function(){
         selectTcList('beautify_mp');//查询专属公众号
	});

    //商家公众号：
    $(".changeSj").on("click",function(){
        if(isBuyShop){
            var url ="/o2o/route/"+ wxGLOBAL.shopSid+ "/thirdpartnar-send_public_message?access_token=" + store.get("wx_access_token");
            window.open(url,'_blank');
        }else{
            layer.alert('未开通商家公众号功能，请通知店主开通', 8);
        }

    });

	//商家公众号：
	$(pageId + ".sjkaitong").on("click",function(){
         if(isBuyShop){
			 //进入 微信平台
            var url ="/o2o/route/"+ wxGLOBAL.shopSid+ "/thirdpartnar-send_public_message?access_token=" + store.get("wx_access_token");
             window.open(url,'_blank');
         }else{
             selectTcList('shop_mp');//查询  shop_mp_y有专属公众号 shop_mp_n有专属公众号

		 }
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





    //专属公众号 选择产品
    $( '#zsTaoCan #zsCommodlist').delegate('a.open_time_img','click',function(){
        $(this).siblings().children('i').remove();
        $(this).addClass('bor_blue').siblings().removeClass('bor_blue');
        $(this).prepend('<i class="icon_gou"></i>');
        var commodity_id = $(this).data('commodity_id');
        var price = $(this).data('price');
        $('#zsPrice').html(price);
        $('#zssure').attr('data-price',price);
        $('#zssure').attr('data-commodity_id',commodity_id);
    });

    // 提交订单 获取订单索引
    $('#zssure').on("click",function(){
        //获取订单id序列
        var commodity_id =$(this).data('commodity_id');
        var price =$(this).attr('data-price');
        var taoCanType =$(this).attr('data-type');
        getOrderIdIndex(taoCanType,commodity_id,price);

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

    //同意请求
    $("#checkboxOneInput6").on("click",function(){
        var value = $(this).attr('value');
        if(value==0){
            $(this).attr('value',1);
            $('.payNow').attr('data-agreement',1);
        }else{
            $(this).attr('value',0);
            $('.payNow').attr('data-agreement',0);
        }

    });

    //选择支付方式
    $('input[name="strong_edition"]').on("click",function(){
        var value = $(this).attr('value');
            $('.payNow').attr('data-pay_way',value);
    });

    //立即支付
    $(".payNow").on("click",function(){

        var agreement =$(this).attr('data-agreement');
        var order_id = $(this).attr('data-order_id');
        var price = $(this).attr('data-price');
        var commodity_id = $(this).attr('data-commodity_id');
        var pay_way = $(this).attr('data-pay_way');
        var readyOrder = $(this).attr('data-ready'); //是否已有订单
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

    //关闭遮罩：
    $(".closeBtn").on("click",function(){
        $('.TaoCan').hide();//弹窗隐藏
        $('#shawn_show').hide();//遮罩隐藏
        //**************重新初始化**********************
        $("#zssure").attr('data-commodity_id',"");//遮罩
        $("#zssure").attr('data-price',"");//遮罩
        $("#zssure").attr('data-type',"");//遮罩
        $("#sjsure").attr('data-commodity_id',"");
        $("#sjsure").attr('data-price','');
        $("#sjsure").attr('data-type','');
        $('.payNow').attr('data-order_id','');
        $('.payNow').attr('data-type','');
        $('.payNow').attr('data-price','');
        $('.payNow').attr('data-agreement','');
        $('#payAagin').attr('data-ready','');
        $('.allprice').html("");
        var value = $(this).attr('value');
        if(value ==1){
            //重新刷新页面
            window.location.reload();
        }



    });




	/********************antony 绑定事件 end***************************/

	/*******************antony 单独方法 start**************************/
   /* //查询套餐列表  beautify_mp专属公众号   sj商家公众号*/
    function selectTcList(type) {
        var  url = requestUrl.Payment.selectTcList;
          /* //  url ="http://192.168.2.127:8080/sell.fee/commodity";*/
        $.ajax({
            url:url,
            data:{p_type:type,access_token:accessToken},
            type:"get",
            global:false,
            dataType: "json",
            success :function(data){
                if(data.status==200){
                    var resultVo= JSON.parse($.base64.decode(data.content,"utf8mb4"));
                   // console.log(JSON.stringify(resultVo));
                     if(resultVo &&resultVo.length>0) {
                         if (type == 'beautify_mp') {
                             insertHtmlZsT(resultVo);//专属公众号填充页面
                         } else {
                             insertHtmlZSj(resultVo);
                         }

                     }else{
                         layer.msg('抱歉，暂无套餐。');
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



    //获取订单索引，
    function getOrderIdIndex(type,commodityId,price) {
        var url = requestUrl.Payment.getOrderIndex.replace("{{shop_id}}",wxGLOBAL.shopSid);
           /* url ="http://192.168.2.127:8080/sell.fee/shop/"+wxGLOBAL.shopSid+"/order/id";*/
        $.ajax({
            url:url,
            data:{access_token:accessToken},
            type:"get",
            global:false,
            dataType: "json",
            success :function(data){
                if(data.status==200){
                    var resultVo= JSON.parse($.base64.decode(data.content,"utf8mb4"));
                   // console.log(JSON.stringify(resultVo));
                    if(resultVo) {
                        var order_id =resultVo.id;//获取订单索引
                        var scrollHeight =$(document).scrollTop();
                            $('#orderContent').css('margin-top',scrollHeight);
                            $('#orderContent').show();
                            $("#zsTaoCan").hide();
                            $("#sjTaoCan").hide();
                            var heights =$(document.body).height()　 ;//全文高度
                            $("#shawn_show").height(heights+"px");
                            $("#shawn_show").show();
                            selectBeautBalance();
                            if(type=='shop_mp'){
                                   $('#tctype').html('商家公众号接入服务');
                                   $('#shopNameCon').hide();
                            }else{
                                   $('#tctype').html('专属公众号接入服务');
                            }
                           var other_name = store.get('shopIdAndUserId').auth_info.user.otherName;
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

    //填充专属公众号html
    function insertHtmlZsT(result) {
        var html="";
        result.forEach(function(item,index){
            if(item.price && !isNaN(item.price)){
                item.price=item.price.toFixed(2);
            }
            html +=' <a href="javascript:;" data-commodity_id="'+item.id+'" data-price="'+item.price+'" class="open_time_img   tancanLeng ">'+item.name+'</a>';
        });
        $('#zsCommodlist').html(html);//填充商品列表
        $('#zsCommodlist >:first').prepend('<i class="icon_gou"></i>');
        $('#zsCommodlist >:first').addClass('bor_blue');
        $('#zsPrice').html(result[0].price);
        $('#zssure').attr('data-price',result[0].price);
        $('#zssure').attr('data-commodity_id',result[0].id);
        var scrollHeight =$(document).scrollTop();
        $('#zsTaoCan').css('margin-top',scrollHeight);
        $('#zsTaoCan').show();//显示
        var heights =$(document.body).height()　 ;//全文高度
        $("#shawn_show").height(heights+"px");
        $("#shawn_show").show();//遮罩

        //给确定按钮赋值 很重要
        $("#zssure").attr('data-commodity_id',result[0].id);//遮罩
        $("#zssure").attr('data-price',result[0].price);//遮罩
        $("#zssure").attr('data-type','beautify_mp');//遮罩
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




	//下单接口 新建订单
	function orderSubmit(orderId,commodityId,price,payWay) {
        var other_name = store.get('shopIdAndUserId').auth_info.user.otherName;
        var userFlag =store.get('shopIdAndUserId').auth_info.user.userFlag ||2 ;

        if(!other_name ||!userFlag || !userId){
            console.log('没有获取到：other_name:'+other_name+'//user_id:'+userId);
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
           /*  url ="http://192.168.2.127:8080/sell.fee/shop/"+wxGLOBAL.shopSid+"/order";*/
		$.ajax({
			/*url:requestUrl.user.fetchWXshopInfo,*/
			url:url,
			data:data,
            async:false,
            global:false,
            contentType:'application/json',
			type:"post",
			dataType: "json",
            beforeSend:function(xhr){
                xhr.setRequestHeader('Authorization',accessToken);
            },

            success :function(data){
				if(data.status==200 ) {
                    //下单成功，返回的签名，调用支付
                    var resultVo= JSON.parse($.base64.decode(data.content,"utf8mb4"));
                    //console.log(JSON.stringify(resultVo));
                    uniformPayment(resultVo,price,payWay);//正式下单 请求支付


				}else{
					layer.msg('错误提醒:'+data.error_message+",请关闭弹窗重新重试。");
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
                        /**********************************************/
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
                    layer.msg('发生错误：'+data.errorMessage+',请关闭请重新打开购买');
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
                    beautifyMoney=data.content;//钱
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





    /*******************antony 单独方法 end**************************/














	shopQRCodeApp.init()
});