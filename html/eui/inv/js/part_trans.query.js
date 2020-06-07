/*
  171108 - PAC
  1. Removed excel button from toolbar.  
  
  180221 - CLS,2.2.235
  1, front-end calculate the accumulated bal qty instead of backend-end sql causing the excessive runtime

*/


dwap.page.dgrid = function(data){
  var me = $('#tracedg'); 
  
  data = data || {trace:[], part:[{}]};
  //console.log(data);
  var pt=data.trace;
  var ttl=0;
  pt.map(function(p){
    ttl+=p.QTY;
    p.RUNNING_TOTAL=ttl;
  })
  data.trace=pt;
  function colget(me){
 
    function dec4(val){
      if(!val) return '0.0000';
      return val.toFixed(4);
    }

    function dec2(val){
      if(!val) return '0.00';
      return val.toFixed(2);
    }
    
    var cols = [
      {field:'TRANSACTION_DATE', title:'Date', width:80, fixed:true, formatter:tz2date},
      {field:'TRANS_TYPE',title:'Type', width:70,fixed:true },
      {field:'TRACE_ID',title:'Trace ID', width:150,fixed:true, styler:function(){return {class:'click'}}},
      {field:'QTY',title:'Txn Qty', width:60, fixed:true, align:'right',formatter:dec4},
      {field:'TRANS_UNIT_MATERIAL_COST',title:'Unit $', width:60, fixed:true, align:'right',formatter:dec4},
      {field:'RUNNING_TOTAL',title:'Bal Qty', width:60, fixed:true, align:'right',formatter:dec4},
      {field:'WOREF',title:'Job Ref', width:120, fixed:true, formatter:function(val){return woref2text(val);},styler:function(){return {class:'click'}}},
      {field:'DOCUMENT_ID',title:'Document ID', width:100,fixed:false},
    ];
    
    for (i=1; i<11; i++) { 
      //console.log(data);
      if(data.part[0].TRACEABLE == 'N') {
        title = data.part[0]['UDF_'+i] || null;
        if(title) cols.push({field:'USER_'+i,title:title.replace('*',''), width:100})  ;
        } 
      else {
        var title = data.part[0]['TRACE_USER_'+i+'_LBL'] || null;
        if(title) cols.push({field:'TRACE_USER_'+i,title:title.replace('*',''), width:100}) ;  
      }
    }
    return [cols];
  }
  
  me.datagrid({
  	editor: 'inline',
    rownumbers: true,
    singleSelect:true,
    striped:false,
    fit:true,
    fitColumns: true,
    loadFilter: function(data){
      if(data.trace.length > 0) var endis='disable'; else var endis='enable';
      try{
        //$('#TRACEABLE').combobox(endis);
        if (endis =="enable") $('#TRACEABLE').combobox('readonly',false);
        else  $('#TRACEABLE').combobox('readonly',true);
        $('#LENGTH').combobox(endis);
        $('#WIDTH').combobox(endis);
        $('#HEIGHT').combobox(endis);
      } catch(err){};
      return {rows: data.trace,total: data.trace.length}
    },
    columns:colget(),
    data: data,
    onRowContextMenu: function(e){e.preventDefault();},
    _rowStyler: function(idx,row){
  		var nxt = $(this).datagrid('getRows')[idx+1];
  		if(!nxt || nxt.TRACE_ID != row.TRACE_ID) return ({class:'last bg-ora'});

	  },
	  onSelect: function(){$(this).datagrid('unselectAll')},
	  onDblClickCell: function(idx,fld,val){
  	  var cbo = $('#'+fld);
  	  if(cbo.length) setTimeout(function(){cbo.combobox('select',val)},100);
	  }
  })
}

dwap.page.getdata = function(){
  var cbo = $(this), id = cbo.attr('id');
  var fdat = formdata('form#partquery',{_sqlid:'inv^trace_trans',_func:'get'});
  
  ajaxget('/',fdat,function(data){
    
    // ALWAYS load the datagrid.
    dwap.page.dgrid(data);
    
    // ONLY if part id has changed.
    if(id == 'QRY_PART_ID'){
      
      var wdat=[{'value':'','text':'SHOW ALL',selected:true}], wdx=[],
      cdat=[{'value':'','text':'SHOW ALL',selected:true}], idx=[], 
      part = cbo.combobox('getRec'),
      woref = $('form#partquery #WOREF'), 
      balqty = $('form#partquery #BALQTY'), 
      trace=$('form#partquery #TRACE_ID'), 
      dates = $('form#partquery input.easyui-datebox'); 

      data.trace.map(function(e){
        if(idx.indexOf(e.TRACE_ID)==-1) {
          idx.push(e.TRACE_ID);
          cdat.push({'value':e.TRACE_ID,'text':e.TRACE_ID});
        }  
        
        if(e.WOREF && wdx.indexOf(e.WOREF)==-1) {
          wdx.push(e.WOREF);
          wdat.push({BASE_ID:e.WOREF.split('^')[0],'value':e.WOREF,'text':woref2text(e.WOREF)});
        } 
      });
      
      // load the combos & text boxes.
      woref.combobox('enable').combobox('loadData',keysort(wdat,'value'));
      var txt = 'Qty '+part.BAL_QTY;
      if(part.TRACEABLE == 'Y') txt += ' ( in '+idx.length+' traces )' 
      
      balqty.textbox('setValue',txt);
      
      trace.combobox('loadData',keysort(cdat,'value'));
      if(part.TRACEABLE == 'Y') trace.combobox('enable'); else trace.combobox('disable'); 
      dates.datebox('enable');
    }     
  })     
}

$('form#partquery input.easyui-combobox').combobox({onSelect:dwap.page.getdata});

$('form#partquery input.easyui-datebox').datebox({
  disabled: true,
  onChange: dwap.page.getdata,
  icons: [{
		iconCls:'icon-clear',
		handler: function(e){
		  $(e.data.target).datebox('clear');
		  dwap.page.getdata();	
		}
	}]
});

dwap.page.dgrid();