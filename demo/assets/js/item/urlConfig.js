/**
 * @desc 商品详情页URL配置
 */
define(function() {
    var path = window.basePath, debug = window.debugMode;
    return {
        "getItemDetail":path + "/cn/item/imitateWxDetail.xhtml",
        "favorItem":path+"/cn/guide/collect.xhtml",
        "cancelFavor":path+"/cn/guide/deleteFavorite.xhtml",
        "itemAttr":path+"/cn/item/attr.xhtml",
        "qrCode":path+"/cn/guide/genarateDimCode.xhtml",
        "qrScan":path+"/cn/guide/hasScand.xhtml",
        "report":path+"/cn/my/logMyInfo.xhtml",

        "oldGuide":path+"/cn/guide/viewMatch.xhtml/guideInfo/",
        "guideInfoPage":path+"/wx/guide/guide-info.shtml?showwxpaytitle=1"+(debug ? "&debug=true" : ''),
        "favorListPage":path+"/wx/favor/favor-list.shtml?showwxpaytitle=1"+(debug ? "&debug=true" : ''),
        "confirmOrderPage":path+"/wx/deal/dealConfirm.shtml?showwxpaytitle=1"+(debug ? "&debug=true" : ''),
        "itemDetailPage":path+"/wx/item/item-detail.shtml?showwxpaytitle=1"
    }
})