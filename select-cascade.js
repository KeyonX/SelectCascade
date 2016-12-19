/**
 * select标签的级联查询功能。当选中某一select标签时，会根据配置查询下一级标签的数据，并触发其onchange事件。依次类推
 * @returns {{init: Function}}
 * @constructor
 */
var SelectCascade = function(){
    //按照指定路径，从jsonData中获取相应值。如jsonData={'id':'123','name':'json','value':{'addr':'XXX'}},path=value.addr时，返回XXX
    var _getJsonDataByPath = function(jsonData,jsonPath){
        if(jsonPath==''){
            return jsonData;
        }
        var array = jsonPath.split('.');
        var result = jsonData;
        for(i=0;i<array.length;i++){
            if(typeof(result) =='undefined'){
                return result;
            }
            result = result[array[i]];
        }
        return result;
    };
    return {
        /**
         * @param cascadeSettings {selectExpr:'',url:'',paramName:'',extendParam:'',jsonPath:'',optionValueName:''}
         *   selects 需要级联的select标签的jquery对象
         *   paramName 表示当前select标签的值对应的参数名称
         *   url 选中当前select某一项时访问的url，用于获取下一级元素的的绑定数据。最终请求为url+'&'+paramName=select.val()
         *   extendParam url需要额外添加参数，如：'idType',取当前select.attr('idType')作为键值对拼在url后面
         *            不传递，或值为空时，不使用
         *   jsonPath 返回数据中，需要处理的json数组(option标签的值)的路径。为空时，表示返回数据即为所需json数组
         *            例子：{'id':'12','values':[{'key':'1','value':'2'},{'key':'3','value':'4'}]}
         *            jsonPath=values
         *   optionValueName 如："v1,n1",则json数组中每个元素e，e[v1]为option标签的value值,e[n1]为option标签显示文本值。
         */
        initCascade:function(cascadeSettings){
            var options = $.extend({selects:$('a'),url:'',paramName:'id',extendParam:'',jsonPath:'',optionValueName:''},cascadeSettings);
            var selectArray = options.selects.filter('select');
            if(selectArray.length<2){
                throw new Error("select标签个数小于2，无法使用级联功能");
                return;
            }
            //前length-1个select对象进行绑定事件，进行级联查询
            for(i=0;i<selectArray.length-1;i++){
                var selectObj = selectArray.eq(i);
                //下一级select标签绑定到当前标签
                selectObj.data('nextSelect',selectArray.eq(i+1));
                selectObj.on('change',function(){
                    var currentSelect = $(this);
                    var nextSelect = currentSelect.data('nextSelect');
                    var curValue = currentSelect.val();
                    var requestUrl = options.url;
                    if(requestUrl.length!=requestUrl.lastIndexOf('?')+1){//请求地址不以?结尾
                        requestUrl += '?'+options.paramName+'='+curValue;
                    }else{
                        requestUrl += '&'+options.paramName+'='+curValue;
                    }
                    if(options.extendParam!=''){
                        requestUrl+=requestUrl+'&'+currentSelect.attr(options.extendParam);
                    }
                    var optionValue = options.optionValueName.split(',')[0];
                    var optionName = options.optionValueName.split(',')[1];
                    console.log('请求URL：'+requestUrl);
                    $.ajax({
                        async:false,
                        type:"post",
                        url:requestUrl,
                        cache:false,
                        dataType: "json",
                        success: function(data){
                            nextSelect.empty();
                            var jsonArray = _getJsonDataByPath(data,options.jsonPath);
                            if(typeof(jsonArray)=='undefined'){
                                return;
                            }
                            for(i=0;i<jsonArray.length;i++){
                                var value = jsonArray[i][optionValue];
                                var name = jsonArray[i][optionName];
                                nextSelect.append('<option value="'+value+'">'+name+'</option>');
                            }
                            //触发下一级select标签change事件
                            nextSelect.trigger('change');
                        }
                    });
                });
            }
        }
    }
};