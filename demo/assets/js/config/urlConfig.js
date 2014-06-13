/**
 * @desc 全局URL配置，集中管理ajax请求以及URL跳转的地址
 */
define(function(require) {

    var path = window.basePath, debug = window.debugMode;
    var url = {
        "dealDetail":path+"/cn/deal/detailWX.xhtml",
        "drawback":path+"/cn/deal/applyRefund.xhtml",
        "confirmRecv":path+"/cn/deal/bconfirmRecv.xhtml",
        "cancelOrder":path+"/cn/deal/cancel.xhtml",
        "confirmOrder":path+"/cn/deal/comfirmWX.xhtml",
        "cartConfirmOrder":path+"/cn/cmdy/confirmOrderNew.xhtml",
        "dealMakeOrder":path+"/cn/deal/makeOrder.xhtml",
        "cartMakeOrder":path+"/cn/cmdy/makeOrder.xhtml",
        "editAddr":path + "/cn/recvaddr/editorAddrWx.xhtml",
        "getAddrById":path + "/cn/recvaddr/getAddrById.xhtml",
        "getCityList":path+"/cn/recvaddr/getCityList.xhtml",
        "getAreaList":path+"/cn/recvaddr/getAreaList.xhtml",
        "setLogin":path+"/cn/auth/login.xhtml",
        "getItemDetail":path + "/cn/item/imitateWxDetail.xhtml",
        "getMyIndex":path + "/cn/my/jsonIndex.xhtml",
        "getAddrList":path + "/cn/recvaddr/getAddrListWx.xhtml",
        "deleteAddr":path+"/cn/recvaddr/deleteJson.xhtml",
        "detail4Saler":path+"/cn/deal/detail4Saler.xhtml",
        "favorItem":path+"/cn/guide/collect.xhtml",
        "cancelFavor":path+"/cn/guide/deleteFavorite.xhtml",
        "itemAttr":path+"/cn/item/attr.xhtml",
        "importAddr":path+"/cn/recvaddr/imitateWxImportAddr.xhtml",
        "qrCode":path+"/cn/guide/genarateDimCode.xhtml",
        "qrScan":path+"/cn/guide/hasScand.xhtml",
        "freeItem":path+"/cn/find/sureExchangePrize.xhtml",
        "payPage":path+"/cn/deal/pay.xhtml?showwxpaytitle=1",
        "findQrCode":path+"/cn/find/generateFreeDC.xhtml",
        "findLoopScan":path+"/cn/find/hasScand.xhtml",
        "cart4Json":path+"/cn/cmdy/list4Json.xhtml",
        "report":path+"/cn/my/logMyInfo.xhtml",
        "addCart":path+"/cn/cmdy/add.xhtml",
        "delCart":path+"/cn/cmdy/removeNew.xhtml",
        shareGroup:path+"/cn/saler/suit.xhtml",
        refundApply:path+"/cn/refund/apply.xhtml",
        logisticNum:path+"/cn/refund/markSend.xhtml",
        cancelRefund:path+"/cn/refund/bcancel.xhtml",


        "dealDetailPage":path+"/wx/deal/dealDetail.shtml?showwxpaytitle=1"+(debug ? "&debug=true" : ''),
        "confirmOrderPage":path+"/wx/deal/dealConfirm.shtml?showwxpaytitle=1"+(debug ? "&debug=true" : ''),
        "addrListPage":path+"/wx/addr/addr-list.shtml?showwxpaytitle=1"+(debug ? "&debug=true" : ''),
        "addrEditPage":path+"/wx/addr/addr-edit.shtml?showwxpaytitle=1"+(debug ? "&debug=true" : ''),
        "itemDetailPage":path+"/wx/item/item-detail.shtml?showwxpaytitle=1",
        "myIndexPage":path+"/wx/my/index.shtml?showwxpaytitle=1"+(debug ? "&debug=true" : ''),
        "detail4SalerPage":path+"/wx/deal/dealDetailSaler.shtml?showwxpaytitle=1"+(debug ? "&debug=true" : ''),
        "findShre":path+"/wx/find/findShare.html#wechat_webview_type=1",
        "cartConfirmOrderPage":path+"/wx/cart/cartConfirm.shtml?showwxpaytitle=1"+(debug ? "&debug=true" : ''),
        "shareGroupPage":path+"/wx/saler/share-group.shtml?showwxpaytitle=1"+(debug ? "&debug=true" : ''),
        "refundApplyPage":path+"/wx/drawback/backgoods.shtml?showwxpaytitle=1"+(debug ? "&debug=true" : ''),
        "logisticFillPage":path+"/wx/drawback/writeNum.shtml?showwxpaytitle=1"+(debug ? "&debug=true" : '')
    }
    return url;
})