/**
 * author: superl(小六)
 * email：86717375@qq.com
 * github: https://github.com/super-l/x6cache
 * 
 * demo:
 * SuperlCache.setData({'token':'xxxxxxxx'});  
 * SuperlCache.getDataItem('token')
 * SuperlCache.getData()
 * SuperlCache.removeData();
 * 
 */
var SuperlCache = (function () {
    const _const = {
        // 缓存存储方式 localStorage || sessionStorage || cookie
        cache_type: 'localStorage',

        // 字段值
        cache_key: 'cacheData',

        // 如果存储方式为cookie,则需要配置此项.设置cookie的有效期
        cache_expires_hour: 24,

        // 如果存储方式为cookie,则需要配置此项
        cookie_domain_path: ";path=/;domain=xiao6.net;"
    };


    // 设置方法 -----
    var setCacheData = function(value){
        if ( _const['cache_type'] === 'cookie') {
            _method.setCacheByCookie(value);
        } else if ( _const['cache_type'] === 'localStorage') {
            _method.setCacheByLocalStorage(value);
        } else if ( _const['cache_type'] === 'sessionStorage') {
            sessionStorage.setItem(_const['cache_key'], JSON.stringify(value));
        }
    };

    // 获取方法 -----
    var getCacheData = function() {
        if ( _const['cache_type'] === 'cookie') {
            return _method.getCacheByCookie();
        } else if ( _const['cache_type'] === 'localStorage') {
            return _method.getCacheByLocalStorage();
        } else if ( _const['cache_type'] === 'sessionStorage') {
            return JSON.parse(sessionStorage.getItem(_const['cache_key']));
        }
    };

    // 获取方法 单个
    var getCacheDataItem = function(key) {
        let cacheData = getCacheData()
        if (!cacheData) {
            return null;
        }
        if (cacheData.hasOwnProperty(key)) {
            return cacheData[key]
        }
        return null;
    };


    // 删除方法
    var removeCacheData = function() {
        if ( _const['cache_type'] === 'cookie') {
            var date = new Date();
            date.setTime(date.getTime() - 1);
            var delValue = getCacheByCookie();
            if (!!delValue) {
                document.cookie = _const['cache_key'] +'='+delValue+';expires='+date.toGMTString();
            }
        } else if ( _const['cache_type'] === 'localStorage') {
            localStorage.removeItem(_const['cache_key']);
        } else if ( _const['cache_type'] === 'sessionStorage') {
            sessionStorage.removeItem(_const['cache_key']);
        }
    };

    var _method = {
        setCacheByCookie(value){
            var d = new Date();
            d.setTime(d.getTime() + ( _const['cache_expires_hour'] * 60 * 60 * 1000));
            var expires = "expires="+d.toGMTString();
            document.cookie = _const['cache_key'] + "=" + value + "; " + expires + _const['cookie_domain_path'];
        },

        getCacheByCookie() {
            var name = _const['cache_key'] + "=";
            var ca = document.cookie.split(';');
            for(var i=0; i < ca.length; i++) {
                var c = ca[i].trim();
                if (c.indexOf(name)==0) return c.substring(name.length,c.length);
            }
            return "";
        },


        setCacheByLocalStorage(value) {
            var curtime = new Date().getTime(); // 获取当前时间 ，转换成JSON字符串序列
            var valueDate = JSON.stringify({
                val: value,
                saveAt: curtime
            });
            try {
                localStorage.setItem(_const['cache_key'], valueDate)
            } catch(e) {
                /*if(e.name === 'QUOTA_EXCEEDED_ERR' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    console.log("Error: 本地存储超过限制");
                    localStorage.clear();
                } else {
                    console.log("Error: 保存到本地存储失败");
                }*/
                // 兼容性写法
                if(isQuotaExceededOfLocalStorage(e)) {
                    console.log("Error: 本地存储超过限制");
                    localStorage.clear();
                } else {
                    console.log("Error: 保存到本地存储失败");
                }
            }
        },

        getCacheByLocalStorage() {
            var exp = _const['cache_expires_hour'] * 60 * 60 * 1000  ; // 毫秒数
            if(localStorage.getItem(_const['cache_key'])) {
                var vals = localStorage.getItem(_const['cache_key']); // 获取本地存储的值
                var dataObj = JSON.parse(vals); // 将字符串转换成JSON对象

                if(!dataObj.hasOwnProperty("saveAt")){
                    console.log("无时间数据,存储已过期");
                    localStorage.removeItem(_const['cache_key']);
                }

                // 如果(当前时间 - 存储的元素在创建时候设置的时间) > 过期时间
                var isTimed = (new Date().getTime() - dataObj.saveAt) > exp;
                if(isTimed) {
                    console.log("存储已过期");
                    localStorage.removeItem(_const['cache_key']);
                    return null;
                } else {
                    var value = dataObj.val;
                }
                return value;
            } else {
                return null;
            }
        },

        isQuotaExceededOfLocalStorage(e) {
            var quotaExceeded = false;
            if(e) {
                if(e.code) {
                    switch(e.code) {
                        case 22:
                            quotaExceeded = true;
                            break;
                        case 1014: // Firefox
                            if(e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                                quotaExceeded = true;
                            }
                            break;
                    }
                } else if(e.number === -2147024882) { // IE8
                    quotaExceeded = true;
                }
            }
            return quotaExceeded;
        }
    };


    return {
        setKey: function(key){
            _const['cache_key'] = key;
        },
        setType: function(typeValue){
            _const['cache_type'] = typeValue;
        },
        setExpires: function(expires){
            _const['cache_expires_hour'] = expires;
        },
        setCookieDomainPath: function(value) {
            _const['cookie_domain_path'] = value
        }
        setData: function(value){
            setCacheData(value);
        },
        getData: function(){
            return getCacheData();
        },
        getDataItem: function(key){
            return getCacheDataItem(key);
        },
        removeData: function(){
            removeCacheData()
        }
    }
} ());
