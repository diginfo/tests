dwap.page.dodgrid = function(){
  $('#txgrid').datagrid({
    toolbar:'#tbar',
    fit:true,
    fitColumns:true,
    queryParams: frm2dic($('form#gfilter')),
    url:'/?_func=get&_sqlid=inv^part_trace',
    //url:'/',
    //queryParams:{
    //  _sqlid:'vwltsa^part_trace',
    //  _func:'get',
    //  sdate:null,
    //  edate:null
    //},
    checkOnSelect:false,
    singleSelect:true,
    method: 'get',
    striped:true,
    columns: [[
      {field:"EDIT",title:"Edit",checkbox:true},
      {field:"PART_ID",title:"Part ID",width:200,fixed:true},
      {field:"TRACE_ID",title:"Trace ID",width:80,fixed:true},
      {field:"TRACE_DATE",title:"Trace Date",formatter:iso2str,width:80,fixed:true},
      {field:"EXPIRY_DATE",title:"Expiry Date",formatter:iso2str,width:80,fixed:true},
      {field:"UNIT_MATERIAL_COST",title:"Unit Material Cost",width:80,fixed:true},

      {field:"TRACE_USER_1",title:"Trace User 1",width:80,fixed:true},
      {field:"TRACE_USER_2",title:"Trace User 2",width:80,fixed:true},
      {field:"TRACE_USER_3",title:"Trace User 3",width:80,fixed:true},
      {field:"TRACE_USER_4",title:"Trace User 4",width:80,fixed:true},
      {field:"TRACE_USER_5",title:"Trace User 5",width:80,fixed:true},
      {field:"TRACE_USER_6",title:"Trace User 6",width:80,fixed:true},
      {field:"TRACE_USER_7",title:"Trace User 7",width:80,fixed:true},
      {field:"TRACE_USER_8",title:"Trace User 8",width:80,fixed:true},
      {field:"TRACE_USER_9",title:"Trace User 9",width:80,fixed:true},
      {field:"TRACE_USER_10",title:"Trace User 10",width:80,fixed:true}

      ]],
      onBeforeLoad:function(qp){
        if(!qp.sdate) return false;  
      },
    onCheck:function(idx,dat){
      $(this).data('idx',idx);
      var frm = $('form#parttrans');
      frm.attr('mode','upd').form('load',dat);
      //console.log(dat);

        for(var key in dat){
          if(key.indexOf('TRACE_USER_')==0){
            var fitem = $('div#traceprop div.fitem#'+key); 
            var label = fitem.find('label.trace');
            var inp = fitem.find('input.textbox-f'); 
            if(dat[key] != '') {
              label.text(dat[key].replace('*',''));
              fitem.show();
            } 
            else {
              fitem.hide();
            } 
          }  
      }

      setTimeout(function(){
        butEn('sx');
      },300);
    },
    
    onLoadSuccess:function(){
      $('form#parttrans').form('clear');
    }
  });
}

$(document).ready(function(){
  
  $('#but_save').linkbutton({
    onClick:function(){
      var frm = $('form#parttrans'); 
      var data = frm2dic(frm);
      var dg = $('#txgrid');
      dg.datagrid('updateRow',{index:dg.data('idx'),row:data});
      frm.form('options').queryParams = {_func:"upd",_sqlid:'inv^part_trace'};
      frm.form('submit');
    }
  })
  /*
  $('form#parttrans').attr('mode','upd').on('loadDone',function(){
    var data = frm2dic($(this));
  })
  */
  setTimeout(function(){
    dwap.page.dodgrid();
    
    $('form#gfilter').form({
      onChange:function(){
        $('#txgrid').datagrid('reload',frm2dic($('form#gfilter')));  
      }
    })      
      
  })
  
})