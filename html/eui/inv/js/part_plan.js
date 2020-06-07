/*
  CLS, 180208, 2.2.169
  added Part ID qbe and Product Code combobox
  
*/
dwap.page.docref = function(val,row){

	if(val)var v = val.replace(/\^/g,'.');
	else return '';
  var docid=v.split('.');
  if(row.PLAN_TYPE=='Supply'){
    if (val==row.DD_REF) {
      var cls = 'demand';
      var url ="vwltsa^sa_sorder&ID="+docid[0];
    }
  
    if (val==row.SS_REF) {
      var cls = 'supply';
      if (row.DOC_TYPE=='Job') var url="vwltsa^sa_jobman&WOREF="+docid[0];
      if (row.DOC_TYPE=='PO') var url="inv^purchase_order_list";
    }
    
  } 
  
  if(row.PLAN_TYPE=='Demand') {
    var cls = 'demand';
    if (row.DOC_TYPE=='SO') var url ="sales^sa_sorder&ID="+docid[0];
    if (row.DOC_TYPE=='Opn'||row.DOC_TYPE=='Job') var url ="vwltsa^sa_jobman&WOREF="+docid[0];
  }  
  
  // ### use linkwin to open in a NEW tab ###
  return "<a href='javascript:newtab(\""+url+"\");'><span class='"+cls+"'>"+v+"</span></a>";
}

dwap.page.integer = function(val){
  var v = eui.integer(val);
  if(v<0) return '<span class="negative">'+v+'</span>'; 
  return v;    
}

dwap.page.ssdd = function(val,row){
  var v = eui.integer(val);
  if(v==='0.00') return '';
  if(row.PLAN_TYPE=='Supply') return '<span class="supply">'+v+'</span>'; 
  if(row.PLAN_TYPE=='Demand') return '<span class="demand">'+v+'</span>';  	
}

dwap.page.dd = function(val,row){
  var v = eui.integer(val);
  if(v==='0.00') return '';
  return '<span class="demand">'+v+'</span>';   
}

dwap.page.ss = function(val,row){
  var v = eui.integer(val);
  if(v==='0.00') return '';
  return '<span class="supply">'+v+'</span>';   
}

$('#partplan').datagrid({
  rowStyler:function(index,row){
    if (row.PART_ID){
      return {class:'partrow'}; 
    }
  },

  toolbar:'#tbar',
  fit:true,
  fitColumns:true,
  queryParams: frm2dic($('form#gFilter')),
  url:'/?_sqlid=inv^partplan&_func=get',
  
  checkOnSelect:false,
  singleSelect:true,
  columns: [[
      {field:"PART_ID", title:"Part ID"},
      {field:"PRODUCT_CODE", title:"Product Code"},
      {field:"UOM_ID", title:"UOM"},
      {field:"WANT_DATE", title:"Want Date", formatter:eui.date, width:80, fixed:true},
      {field:"DOC_TYPE", title:"Order Type",formatter: function(val){return val.toUpperCase();}},
      {field:"DEMAND_DOC", title:"Demand Order", formatter:dwap.page.docref, width:100, fixed:true},
      {field:"DEMAND_QTY", title:"Demand Qty", formatter:dwap.page.dd, width:80, fixed:true, align:'right'},
      {field:"PROJ_QTY", title:"Projected Bal", formatter:dwap.page.integer, width:80, fixed:true, align:'right'},
      {field:"SUPPLY_DOC", title:"Supply Order",formatter:dwap.page.docref, width:100, fixed:true},
      {field:"SUPPLY_QTY", title:"Supply Qty", formatter:dwap.page.ss, width:80, fixed:true, align:'right'},
      {field:"DESCRIPTION",title:"Description", width:200, fixed:false},
    ]]
  ,
  onLoadSuccess:function(data){
   // console.log(data)
  }  
}).datagrid('columns',$('#colsel'));

$(document).ready(function(){
    
  $('form#gfilter #PART_ID_').qbe({
    defid:'part',
   // onSelect:function(row){
     // console.log(row);
     // $('form#gfilter #PCODE_').combobox('setValue',row.PRODUCT_CODE)
   // }
  
  })
 
  $('form#gfilter').form({
    onChange:function(){
      $('#partplan').datagrid('reload',frm2dic($('form#gfilter')));  
    }
  })    

})