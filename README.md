# SelectCascade
简单的基于jQuery的select标签组的级联查询功能  
### 使用场景
当数据本身具有层级性，如省|市|区|商圈信息。每一select的取值范围取决于上一级select的某一选项。且每次查询url和参数名称相同 

    SelectCascade.initCascade(selectExpr,url,paramName,extendParam,jsonPath,optionValueName)
