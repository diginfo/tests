dwap.page.unique = function(idata){
  var list=[],odata=[];
  idata.map(function(row){
    if(list.indexOf(row.value)<0){
      list.push(row.value);
      odata.push(row);
    }  
  });
  return odata;
}

dwap.page.param_combos = function(){
  return { 
    CLASS_ID: $('#PARAM_CLASS_ID').combobox('getValue'),
    TYPE_ID: $('#PARAM_TYPE_ID').combobox('getValue')
  }
}

dwap.page.addbut = function(dg,endis){
  setTimeout(function(){
    var opt = dg.datagrid('options');
    opt.tbar.dgre_add.linkbutton(endis);
  })  
}

dwap.page.status = function(dgid){
  var opt = $('#o'+dgid).datagrid('options');
  opt.tbar.dgre_add.hide();
  opt.tbar.dgre_del.hide();
  opt.tbar.dgre_edit.hide();
  //$('input[comboname=OTD_CODE]').addClass('ronly-on');
  //opt.tbar.dgre_edit.linkbutton('enable');
  //if(dwap.udata.groups.indexOf('OTD-EDITOR')==-1) $('#otdopen').linkbutton('disable');
  //else $('#otdopen').linkbutton('enable'); 
}


/*## CLASS_IDS ##*/
// Set class and reload datagrid.
dwap.page.dgload = function(dg,rec){
  dg.datagrid('options').queryParams.CLASS_ID = rec.value;
  dg.datagrid('reload');  
}

// Selection of both Class & Types.
dwap.page.param_select = function(){
  var dg = $('#dgparams');
  var qp = dwap.page.param_combos(); 
  dg.datagrid('options').queryParams.TYPE_ID = qp.TYPE_ID;
  dg.datagrid('options').queryParams.CLASS_ID = qp.CLASS_ID;
  dg.datagrid('reload'); 
}

$(document).ready(function(){

  ajaxget('/',{_sqlid:'admin^bhave',_func:'get',appid:'inv^sa_parts'},function(bh){dwap.bhave = bh;})
  
  $('#CLASS_ID').combobox({
  
    onLoadSuccess: function(data){
      $('#PARAM_CLASS_ID').combobox('loadData',data);
      $('#TYPE_CLASS_ID').combobox('loadData',data);
      $('#PART_CLASS_ID').combobox('loadData',data);
      $('#DESC_CLASS_ID').combobox('loadData',data);
    }
  })
  
  $('#PARAM_CLASS_ID').combobox({
    loadFilter: dwap.page.unique,
    onSelect: dwap.page.param_select
  })
  
  $('#TYPE_CLASS_ID').combobox({
    loadFilter: dwap.page.unique,
    onSelect:function(rec){
      dwap.page.dgload($('#dgtypes'),rec);
    }
  })
  
  $('#PART_CLASS_ID').combobox({
    loadFilter: dwap.page.unique,
    onSelect:function(rec){
      dwap.page.dgload($('#dgpart'),rec);
    }
  })
  
  $('#DESC_CLASS_ID').combobox({
    loadFilter: dwap.page.unique,
    onSelect:function(rec){
      dwap.page.dgload($('#dgdesc'),rec);
    }
  })
  
  $('#PARAM_TYPE_ID').combobox({
    loadFilter: dwap.page.unique,
    onSelect: dwap.page.param_select
  })
  
  $('#dgparams').datagrid({
    striped: true,
    rownumbers: true,
    url:'/',
    queryParams: {
      _func:'get',
      _sqlid:'inv^pn_classparam',
      _dgrid: true,
      TYPE_ID: '',
      CLASS_ID: ''
    },
    
    onBeforeLoad: function(qp){
      dwap.page.addbut($(this),'disable');
      if(qp.TYPE_ID=='' || qp.CLASS_ID=='') return false;
      else return true;  
    },
    
    onLoadSuccess: function(){
      dwap.page.addbut($(this),'enable');
      /*
      var opt = $(this).datagrid('options');
      setTimeout(function(){
        cl(opt.dlg)
        opt.dlg.dialog({
          onOpen: function(){
            // if mode== edit, no-ro, else ro.
            cl('form-opened'); 
          }  
        })          
      })
      */
    },
    
    columns:[[
      {field:'CLASS_ID',title:'Class'},
      {field:'TYPE_ID',title:'Type'},
      {field:'PARA_ID',title:'Param ID',editor:{type:'textbox',options:{required:true}}},
      {field:'CODE_STR',title:'Code',editor:{type:'textbox',options:{required:true}}},
      /*{field:'UOM_ID',title:'UOM_ID'},*/
    ]]  
    
  }).datagrid('rowEditor',{
    twoColumns: false,
    editor: 'form',
    
    addData: dwap.page.param_combos,
  
    onEndEdit: function(idx,row,chg){
      var me = $(this);
      var qp = me.datagrid('options').queryParams;
      row._sqlid = 'inv^pn_classparam';
      cl(row);
      ajaxget('/',row,function(res){
        me.datagrid('reload'); 
      })
      
    },
    
  });
  
  $('#dgtypes').datagrid({
    
    url:'/',
    queryParams: {
      _func:'get',
      _sqlid:'inv^pn_classtype',
      _dgrid: true,
      CLASS_ID: '',
    },
    
    onBeforeLoad: function(qp){
      dwap.page.addbut($(this),'disable');
      if(qp.CLASS_ID=='') return false;
      else return true;  
    },
  
    onLoadSuccess: function(){
      dwap.page.addbut($(this),'enable');
    },
    
    columns:[[
      {field:'CLASS_ID',title:'Class'},
      {field:'TYPE_ID',title:'Type ID',editor:'text'},
      {field:'DESCRIPTION',title:'Description',editor:'text'},
      {field:'DESC_RULE',title:'Position',editor:{type:'combobox',options:{panelHeight:'auto',data:[{value:'NONE',text:'NONE'},{value:'PREFIX',text:'PREFIX'},{value:'SUFFIX',text:'SUFFIX'}]}}}
    ]]  
    
  }).datagrid('rowEditor',{
    
    twoColumns: false,
    editor: 'form',
    addData: function(){
      var cls = $('#TYPE_CLASS_ID').combobox('getValue'); 
      return ({CLASS_ID: cls});
    },
    
    onEndEdit: function(idx,row,chg){
      row.TYPE_ID = row.TYPE_ID.toUpperCase(); 
      row._sqlid = 'inv^pn_classtype';
      cl(row);
      ajaxget('/',row,function(res){
        cl(res);  
      })
      
    },
    
  });
  
  $('#dgpart').datagrid({
    
    url:'/',
    queryParams: {
      _func:'get',
      _sqlid:'inv^pn_idformula',
      _dgrid: true,
      CLASS_ID: '',
    },
    
    onBeforeLoad: function(qp){
      dwap.page.addbut($(this),'disable');
      if(qp.CLASS_ID=='') return false;
      else return true;  
    },
    
    onLoadSuccess: function(data){
      var bits=[]; data.rows.map(function(bit){bits.push(bit.DATA_STR)})
      $('#ID_GEN').textbox('setValue',bits.join(''))
      dwap.page.addbut($(this),'enable');
      
      /*
      var opt = $(this).datagrid('options');
      setTimeout(function(){
        cl(opt.dlg)
        opt.dlg.dialog({
          onOpen: function(){
            // if mode== edit, no-ro, else ro.
            cl('form-opened'); 
          }  
        })          
      })
      */

    },
    
    columns:[[
      {field:'SEQ_NO',title:'SEQ',width:60,align:'center',editor:{type:'numberbox',options:{readonly:true}}},
      {field:'CLASS_ID',title:'Class',width:100},
      {field:'FIELD_TYPE',title:'Field Type',width:150, editor:{type:'combobox',options:{panelHeight:'auto',data:[{value:'FIXED',text:'FIXED'},{value:'DATA',text:'DATA'}]}}},
      {field:'DATA_STR',title:'Field Data',editor:{type:'textbox',options:{cls:'upper',validType:['length[1,25]']}},width:150,required:true},
    ]]  
    
  }).datagrid('rowEditor',{
    
    twoColumns: false,
    editor: 'form',
    addData: function(){
      var len = $('#dgpart').datagrid('getRows').length;
      var seq = (len+1)*10;
      var cls = $('#PART_CLASS_ID').combobox('getValue'); 
      return ({'CLASS_ID': cls,'SEQ_NO':seq});
    },
    
    onEndEdit: function(idx,row,chg){
      row._sqlid = 'inv^pn_idformula';
      ajaxget('/',row,function(res){
        cl(res);  
      })
    },
    
  });
  
  
  $('#dgdesc').datagrid({
    
    url:'/',
    queryParams: {
      _func:'get',
      _sqlid:'inv^pn_descformula',
      _dgrid: true,
      CLASS_ID: '',
    },
    
    onBeforeLoad: function(qp){
      dwap.page.addbut($(this),'disable');
      if(qp.CLASS_ID=='') return false;
      else return true;  
    },
    
    onLoadSuccess: function(data){
      dwap.page.addbut($(this),'enable');
      var bits=[]; data.rows.map(function(bit){bits.push(bit.DATA_STR)})
      $('#DESC_GEN').textbox('setValue',bits.join(''))
      dwap.page.addbut($(this),'enable');
    },
    
    columns:[[
      {field:'SEQ_NO',title:'SEQ',width:60,align:'center',editor:{type:'numberbox',options:{readonly:true}}},
      {field:'CLASS_ID',title:'Class',width:100},
      {field:'FIELD_TYPE',title:'Field Type',width:150, editor:{type:'combobox',options:{panelHeight:'auto',data:[{value:'FIXED',text:'FIXED'},{value:'DATA',text:'DATA'}]}}},
      {field:'DATA_STR',title:'Field Data',editor:{type:'textbox',options:{cls:'upper',validType:['length[1,25]']}},width:150},
    ]]  
    
  }).datagrid('rowEditor',{
    
    twoColumns: false,
    editor: 'form',
    addData: function(){
      var len = $('#dgdesc').datagrid('getRows').length;
      var seq = (len+1)*10;
      var cls = $('#DESC_CLASS_ID').combobox('getValue'); 
      return ({'CLASS_ID': cls,'SEQ_NO':seq});
    },
    
    onEndEdit: function(idx,row,chg){
      row._sqlid = 'inv^pn_descformula';
      cl(row);
      ajaxget('/',row,function(res){
        cl(res);  
      })
      
    },
    
  });
  
});
