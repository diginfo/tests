dwap.page.dodgrid = function(){
  $('#txgrid').datagrid({
    toolbar:'#tbar',
    fit:true,
    fitColumns:true,
    queryParams: frm2dic($('form#gfilter')),
    url:'/?_func=get&_sqlid=inv^invtrans',

    checkOnSelect:false,
    singleSelect:true,
    method: 'get',
    striped:true,
    columns: [[
      {field:"EDIT",title:"Edit",checkbox:true},
      {field:"PART_ID",title:"Part ID",width:200,fixed:true},
      {field:"TRANSACTION_ID",title:"Tx ID",width:80,fixed:true},
      {field:"TRANSACTION_DATE",title:"Tx Date",formatter:iso2str,width:80,fixed:true},
      {field:"DOCUMENT_ID",title:"Doc ID",width:120,fixed:true},
      {field:"TRANS_TYPE",title:"Tx Type",width:120,fixed:true},
      {field:"QTY",title:"Tx Qty",width:120,fixed:true},
      

      ]],
      onBeforeLoad:function(qp){
        if(!qp.sdate) return false;  
      },
    onCheck:function(idx,dat){
      $(this).data('idx',idx);
      var frm = $('form#parttrans');
      frm.attr('mode','upd').form('load',dat);
      //console.log(dat);

      setTimeout(function(){
        butEn('sxd');
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
      //console.log(data)
      dg.datagrid('updateRow',{index:dg.data('idx'),row:data});
      frm.form('options').queryParams = {_func:"upd",_sqlid:'inv^invtrans',TRANSACTION_ID:data.TRANSACTION_ID};
      frm.form('submit');
      $('#txgrid').datagrid('reload',frm2dic($('form#gfilter')));  
    }
  })
  $('#but_del').linkbutton({
    onClick:function(){
      var frm = $('form#parttrans'); 
      var data = frm2dic(frm);
      var dg = $('#txgrid');
      //console.log(data)

      frm.form('options').queryParams = {_func:"del",_sqlid:'inv^invtrans',TRANSACTION_ID:data.TRANSACTION_ID};
      frm.form('submit');
      $('#txgrid').datagrid('reload',frm2dic($('form#gfilter')));  
    }
  })
  // on Submit-Success
  $('form#parttrans').on('done',function(me,data){
    but_clr(); 
});

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