/**
 * 订单确认页URL配置管理
 */
define(function() {
    var path = window.basePath, debug = window.debugMode;
    var url = {
        "dealDetail":path+"/cn/deal/detailWX.xhtml",
        "dealMakeOrder":path+"/cn/deal/makeOrder.xhtml",
        "confirmOrder":path+"/cn/deal/comfirmWX.xhtml",
        "payPage":path+"/cn/deal/pay.xhtml?showwxpaytitle=1",
        "detail4Saler":path+"/cn/deal/detail4Saler.xhtml",
        refundApply:path+"/cn/refund/apply.xhtml",
        logisticNum:path+"/cn/refund/markSend.xhtml",
        cancelRefund:path+"/cn/refund/bcancel.xhtml",
        "cancelOrder":path+"/cn/deal/cancel.xhtml",
        "drawback":path+"/cn/deal/applyRefund.xhtml",
        "addrListPage":path+"/wx/addr/addr-list.shtml?showwxpaytitle=1"+(debug ? "&debug=true" : ''),
        "addrEditPage":path+"/wx/addr/addr-edit.shtml?showwxpaytitle=1"+(debug ? "&debug=true" : ''),
        "dealDetailPage":path+"/wx/deal/dealDetail.shtml?showwxpaytitle=1"+(debug ? "&debug=true" : ''),
        "confirmOrderPage":path+"/wx/deal/dealConfirm.shtml?showwxpaytitle=1"+(debug ? "&debug=true" : ''),
        "refundApplyPage":path+"/wx/drawback/backgoods.shtml?showwxpaytitle=1"+(debug ? "&debug=true" : ''),
        "logisticFillPage":path+"/wx/drawback/writeNum.shtml?showwxpaytitle=1"+(debug ? "&debug=true" : ''),
        "dealDetailSalerPage":path+"/wx/deal/dealDetailSaler.shtml?showwxpaytitle=1"+(debug ? "&debug=true" : '')
    }
    return url;
})