/*

  
*/


 // Shipment Info.
 dwap.page.receiptinfo = function(){
  var me = $(this);
  var idx = me.data('idx');
  var row = $('#polines').datagrid('getRows')[idx];
  ajaxget('/',{
    _func:'get',
    _sqlid:'inv^receipt_info', 
    PO_ID: row.PO_ID, 
    LINE_NO: row.LINE_NO
  },function(res){
    me.tooltip({
      content:eui.table([
        {field: 'RECEIPT_ID', title:'Receipt ID'},
        {field: 'RECEIVED_DATE', title:'Rcvd Date', formatter: eui.date},
        {field: 'RECEIVED_QTY', title:'Qty', style:'text-align:right;'}
      ],res).appendTo('#content')
    }).tooltip('show');

  });
}

/*
  dwap.page.defudf=function(){
    var udf = $('#UDF_LAYOUT_ID');
    udf.combobox('setValue',dwap.bhave.UDF_LAYOUT_ID);
    udf.combobox('reselect');
  }
  

  
  // Shipment Info.
  dwap.page.shipinfo = function(){
    var me = $(this);
    var idx = me.data('idx');
    var row = $('#solines').datagrid('getRows')[idx];
    ajaxget('/',{
      _func:'get',
      _sqlid:'sales^shipinfo', 
      SALES_ORDER_ID: row.SALES_ORDER_ID, 
      LINE_NO: row.LINE_NO
    },function(res){
      me.tooltip({
        content:eui.table([
          {field: 'SHIPMENT_ID', title:'Ship ID'},
          {field: 'SHIPMENT_DATE', title:'Ship Date', formatter: eui.date},
          {field: 'SHIPPED_QTY', title:'Qty', style:'text-align:right;'}
        ],res).appendTo('#content')
      }).tooltip('show');
  
    });
  }
  
 
  
  dwap.page.udfdef=function(){
    if (dwap.bhave.UDF_LAYOUT_ID){
      ajaxget('/',{_sqlid:'sales^udfall',_func:'get',ID:dwap.bhave.UDF_LAYOUT_ID},function(udfid){
        //console.log(udfid);
        
        for(var k in udfid){
          var val = udfid[k];
  
          if(k.indexOf('UDF_')===0 && val !== '') {
            if(val.indexOf('*')===0) var req=true; else var req=false;
            var ud={field: k.replace('UDF_','USER_'),title: val.replace('*',''),editor: {type:'textbox', options:{required: req} }}
            dwap.page.opts.columns[0].push( ud );
           // console.log(ud);
           // console.log(dwap.page.opts.columns[0]);
          }
        }
      })
    }
  }
*/
  dwap.page.dbGrid= function(value){

    var dg = $('#polines');
    var opt = dg.datagrid('options');
    var row = dg.datagrid('getSelected')
    var idx = dg.datagrid('getRowIndex',row);
    //console.log(nv)

    var reqFlds={'P':['PART_ID','UNIT_PRICE'],'S':['LINE_DESCRIPTION','WOREF','UNIT_PRICE'],'J':['LINE_DESCRIPTION','WOREF','UNIT_PRICE'],'E':['LINE_DESCRIPTION','UNIT_PRICE']}
    var optFlds={'P':['LINE_DESCRIPTION','WOREF'],'S':['PART_ID'],'J':['PART_ID'],'E':['PART_ID','WOREF']}
    var roFlds={'P':['WOREF'],'S':['PART_ID'],'J':['PART_ID',],'E':['PART_ID','WOREF']}
    var reqs=reqFlds[value];
    var opts=optFlds[value];
    var ro =roFlds[value];
    if (reqs){
      reqs.map( r => {
        opt.tbar.form.find(`input[textboxname=${r}]`).textbox('readonly',false);  
        opt.tbar.form.find(`input[textboxname=${r}]`).textbox('required',true);   
      })
    }
    if (opts){
      opts.map( o => {
        opt.tbar.form.find(`input[textboxname=${o}]`).textbox('readonly',false);  
        opt.tbar.form.find(`input[textboxname=${o}]`).textbox('required',false);   
      })   
    }
    if (ro){
      ro.map( r => {
        opt.tbar.form.find(`input[textboxname=${r}]`).textbox('readonly',true);   
      })   
    }
    opt.tbar.form.find('input[textboxname="DELIVERY_DATE"]').datebox('required',false); 
    opt.tbar.form.find('input[textboxname="PART_DESCRIPTION"]').datebox('readonly',true); 
  }
  dwap.page.clearData= function(value){

    var dg = $('#polines');
    var opt = dg.datagrid('options');
   // var row = dg.datagrid('getSelected')
  //  var idx = dg.datagrid('getRowIndex',row);
    var flds=['PART_ID','UNIT_PRICE','LINE_DESCRIPTION','WOREF','PART_DESCRIPTION','PURCHASE_UOM'];
    flds.map(f => {
      opt.tbar.form.find(`input[textboxname=${f}]`).textbox('setValue',""); 
    })
    opt.tbar.form.find('input[textboxname="DELIVERY_DATE"]').datebox('setValue',""); 
  }

  dwap.page.opts = {
     
    twoColumns: true,
    editor: 'form',
  
    addData:{
  
      LINE_NO:'$autonum:10',
      LINE_STATUS:'OPEN',
      ORDER_QTY: 1,
      PO_ID: '#ID'
    },
    
    striped: true,
    url: '/?_sqlid=inv^polines&_func=get&_dgrid=y',
    rownumbers: false,
    fitColumns: true,
    fit: true,
    
    columns: [[

      {field:'PO_ID',hidden:true},
      {field:'LINE_NO',title:'#',width:30,fixed:true,align:'center'},  
      {field:'LINE_STATUS',title:'Ln Status',width:60, fixed:true,editor:{
          type:'combobox',
          options:{
            panelHeight:'auto',
            required:true,
            editable:false,
            data:[{text:'CLOSE',value:'CLOSE'},{text:'OPEN',value:'OPEN',selected:true}]
          }
        },coloff:true},
      {field:'ORDER_TYPE',title:'Order Type',width:100, fixed:true,editor:{
          type:'combobox',

          options:{
            panelHeight:'auto',
            required:true,
            editable:false,
            data:[{text:'PART ORDER',value:'P'},{text:'SUBCONTRACT',value:'S'},{text:'JOB RELATED',value:'J'},{text:'EXPENSE',value:'E'}],
            onSelect: function(nv){
              dwap.page.clearData(nv.value);
              dwap.page.dbGrid(nv.value);
              var woref=$('#_dgform > form input[textboxname=WOREF');
              if (nv.value=='S') woref.qbe('options').queryParams.SUBCON='Y';
              
              if (nv.value=='J'){
                delete woref.qbe('options').queryParams.SUBCON;
             }
             woref.qbe('options').dlog.dg.datagrid('reload');
            }
          }
        },coloff:true,
        formatter:function(val,row,idx){
          var ttype={'P':'PART ORDER','S':'SUBCONTRACT','J':'JOB RELATED','E':'EXPENSE'}
          return ttype[val];

        }  
      },
      {field:'ORDER_QTY',title:'Order Qty',width:60,fixed:true,align:'right',editor:{type:'numberspinner',options:{
        precision:2,
        min:0,
        required:true
      }}},
      {field:'TOTAL_RECEIVED_QTY',title:'Rcvd Qty',width:60,fixed:true,align:'right',formatter: function(val,row,idx){
        if(val < 1) return '-';
        else return '<span style="width:14px;" class="icon-ship icon-dg click" data-idx="'+idx+'"></span><span>'+val+'</span>';
      }},
     {field:'UNIT_PRICE', title:'Unit Price', align:'right', width:70, fixed:true, formatter:eui.currency,editor:{required:true,type:'numberbox',options:{value:0,precision:2,min:0,prefix:'$'}}},
      
      {field:'TOTAL_PRICE', align:'right', title:'Total Price', width:100, fixed:true, 
        formatter:function(val,row,idx){
         // if(!row.UNIT_PRICE) return null; // not a member of price group.
         // else return eui.currency(parseInt(row.QTY) * parseFloat(row.UNIT_PRICE));
          //else 
          return eui.currency(parseFloat(row.TOTAL_PRICE));
          
        }
      },
      
      {field:'DELIVERY_DATE',title:'Delivery Date',width:80,fixed:true,editor:{type:'datebox',options:{required:false}},formatter:eui.date}, 
      {field:'PART_ID',title:'Our Part ID',width:100,editor:{type:'qbe',options:{
        queryParams: {
          _sqlid:'inv^partid_qbe'  
        },

        onDemand: true,
        multiCol: true,
        valueField: 'ID',
        
        fields:[
          {field:'value',title:'Part ID',editor:'textbox'},
          {field:'DESCRIPTION',title:'Description',editor:'textbox',formatter:function(val){
            if(!val) return '';
            else return val.substring(0,50);
          }},
          {field:'ALIAS_DESC',title:'Alias',editor:'textbox'},
          {field:'TRACEABLE',title:'Traceable', editor:{type:'combobox',options:{panelHeight:'auto',data:[
            {value:'',text:'All', selected:true},
            {value:'Y',text:'Yes'},
            {value:'N',text:'No'},
          ]}}},
          
          {field:'DIM_TRACKED',title:'Dimensions', editor:{type:'combobox',options:{panelHeight:'auto',data:[
            {value:'',text:'All', selected:true},
            {value:'Y',text:'Yes'},
            {value:'N',text:'No'},
          ]}}},
          
  
          {field:'PART_CLASS_ID',title:'Part Class', editor:{type:'combobox',options:{panelHeight:'auto',data:[
            {value:'',text:'All', selected:true},
            {value:'FG',text:'Finished Goods'},
            {value:'COMP',text:'Component'},
            {value:'CONSUMABLE',text:'Consumable'},
            {value:'MAKE_STAGED',text:'Make Staged'},
            {value:'MAKE_NOSTAGE',text:'Make Unstaged'},
          ]}}},
          {field:'USER_1',title:'UDF 1',editor:'textbox'},
          {field:'USER_2',title:'UDF 2',editor:'textbox'},
          {field:'USER_3',title:'UDF 3',editor:'textbox'},
          {field:'USER_4',title:'UDF 4',editor:'textbox'},
          {field:'USER_5',title:'UDF 5',editor:'textbox'},
        ],
        
        onSelect: function(rw){
          var dg = $('#polines');
          var opt = dg.datagrid('options');
          var row = dg.datagrid('getSelected')
          var idx = dg.datagrid('getRowIndex',row);
          var edi = dg.datagrid('getEditors',idx);
          var cid = $('#CURRENCY_ID').combobox('getValue');         
          
          ajaxget('/',{_sqlid:'inv^partall',_func:'get',ID:rw.value},function(part){
            opt.tbar.form.find('input[textboxname="PART_DESCRIPTION"]').textbox('setValue',part.DESCRIPTION);   
            opt.tbar.form.find('input[textboxname="PURCHASE_UOM"]').textbox('setValue',part.UOM_ID);  
          })
  
  
          
        }  
      }}},
      
      {field:'PURCHASE_UOM',title:'UOM',width:50,editor:{type:'textbox',options:{readonly:false},coloff:true}},
      {field:'WOREF',title:'Job ID',width:120,editor:{type:'qbe',options:{
        queryParams: {
          _sqlid:'vwltsa^opnrefs_qbe',
          STATUS:'R'
        },
        onDemand: true,
        valueField: 'WOREF',
        fields:[
          {field:'WORKORDER_BASE_ID',title:'Job ID',editor:'textbox'},
          {field:'WORKORDER_LOT_ID',title:'Lot ID',editor:'textbox'},
          {field:'WORKORDER_SUB_ID',title:'Sub ID',editor:'textbox'},
          {field:'SEQUENCE_NO',title:'Seq No',editor:'textbox'},
          {field:'RESOURCE_ID',title:'Resource ID',editor:'textbox'},
          {field:'STATUS',title:'Status',editor:{type:'combobox',options:{
            panelHeight: 'auto',
            data:[
            {value:'R',text:'Released', selected:true},
            {value:'C',text:'Closed'},
            {value:'X',text:'Cancelled'},
          ]}}},
          
    
        ],
        onSelect: function(row){

          
        },  
        preload:true
      }
      }},
      {field:'PART_DESCRIPTION',title:'Our Part Description',width:150,editor:{type:'textbox',options:{readonly:false,multiline:true,height:100,}},coloff:true},
      {field:'LINE_DESCRIPTION',title:'Line Description',width:150,editor:{type:'textbox',options:{readonly:false,multiline:true,height:100,}},coloff:true}, 
    
      
    ]],
    
    onBeforeLoad: function(){
      var fdat = $('form#pohead').form('getData');
      if(!fdat.ID) return false;  
    },
    
    loadFilter: function(data){
      //console.log(data);
      if (data.length==0){}
      else {
        data.rows.map(function(row){
          row._JOB = []; row._NCR = []; for(var k in row._OPNDATA){
            row._JOB.push(row._OPNDATA[k]);
            if(row._OPNDATA[k]._NCRS) row._NCR = row._OPNDATA[k]._NCRS;
          } 
        });      
      }
  
      return data; 
    },
    onSelect:function(idx,row){
        var dg=$('#polines');
        var val = row.ORDER_TYPE;
        //console.log(val);
        dwap.page.dbGrid(val);
        /*
        if(row._JOB.length>0) dg.datagrid('options').tbar.dgre_del.linkbutton('disable');
        */
        if (row.TOTAL_RECEIVED_QTY>0){
            dg.datagrid('options').tbar.dgre_del.linkbutton('disable');
            dg.datagrid('options').tbar.dgre_edit.linkbutton('disable');
        }
        
    },
    onLoadSuccess: function(){
      $('tr td .icon-ship.icon-dg').off().on('click',dwap.page.receiptinfo);
     // $('tr td .icon-ncr').tooltip({onShow: dwap.page.ncrinfo});
     // $('tr td .icon-tools').tooltip({onShow: dwap.page.jobinfo});
     // $('tr td .icon-gate_pass.icon-dg').off().on('click',dwap.page.gpinfo);
    },
    
    onEndEdit: function(idx,row,chg){        
      var is_date = function(input) {
        if ( Object.prototype.toString.call(input) === "[object Date]" ) 
          return true;
        return false;   
          };

      var url = "/?_sqlid=inv^poline";
      //console.log(row.DELIVERY_DATE,is_date(row.DELIVERY_DATE))
      if (is_date(row.DELIVERY_DATE)==false) delete row.DELIVERY_DATE;
      var data = clone(row);
      var dels = ['PART_DESCRIPTION']; dels.map(function(e){delete data[e];})

         // console.log(data);
          var POID=data.PO_ID;
      ajaxget(url,data,function(data){
        
        $('#polines').datagrid('reload',{PO_ID:POID});

      })   
     // $('#ID').qbe('reload');

    }
  }
  
  $(document).ready(function(){
  
   // use the global def (see note below)
   $('#ID').qbe({defid:'po_ids'});
  
   //dwap.page.allcombos();
   
    $('#GST_ID').combobox({
      url:'/?_func=get&_sqlid=admin^gst&_combo=y'  ,
      onSelect:function(rec){
        $('#GST_RATE').numberbox('setValue',rec.percentage);
      }
    })
  
    $('#CURRENCY_ID').combobox({
      url:'/?_func=get&_sqlid=admin^curr&_combo=y'  ,
      onSelect:function(rec){
        $('#CURRENCY_RATE').numberbox('setValue',rec.rate);
      }
    })
  
   
    $('#STATUS').combobox({
      default:'R', 
      data:[
        {text:'On Hold',value:'H'},
        {text:'Released',value:'R'},
        {text:'Closed',value:'C'},
        {text:'Cancelled',value:'X'},
      ]
    })
    

    $('#VENDOR_ID').combobox({
      url:'/?_func=get&_sqlid=inv^vendorid&_combo=y'  ,
      onSelect: function(row){
        var rec=row.value;
        var frm = $('form#pohead'); 
  
        ajaxget('/',{_sqlid:'inv^vendorall',_func:'get',ID:rec},function(data){
          var curr = $('#CURRENCY_ID');
          var gst = $('#GST_ID')

          var flds=['NAME','CONTACT_PERSON','CONTACT_PHONE','CONTACT_fax','CONTACT_EMAIL'];

          flds.map( f => {
            $(`#${f.toUpperCase()}`).textbox('setValue',data[f])
          })

          var addr=['ADDR_1','ADDR_2','ADDR_3'];
          addr.map ( a => {
            $(`#REMIT_${a.toUpperCase()}`).textbox('setValue',data[a])
          })
          gst.combobox('setValue',data.GST_ID);
          curr.combobox('setValue',data.CURRENCY_ID);
          
          gst.combobox('reselect');
          curr.combobox('reselect');

        })
        
      }
    }) 
  
    $('#but_add').on('done',function(){
      $('#polines').datagrid('loadData',{"total":0,"rows":[]});
  
      $('#STATUS').combobox('select','R');
  
      $('#VENDOR_ID').textbox('readonly',false);
     
      butEn('sx');
    })
  
    $('form#pohead').on('loadDone',function(jq,data){
  //console.log(data)
     if(!data.ID) return;
      //not allowed to change VENDOR ID once order was added
      $('#VENDOR_ID').textbox('readonly');
      butEn('adx');
      
      $('#polines').datagrid('reload',{PO_ID:data.ID});
      $('#pofiles').datagrid('docFiles',data.ID);
      
      // Status Colour.
      if(data.STATUS=='H') var cls='bg-red'; else var cls='';       
      $('#STATUS').textbox('textbox').removeClass('bg-red').addClass(cls);
  
     //CLS, 171121, if SO was closed, disabled the datagrid Add button 
     var en_dis='disable';
      if (data.STATUS !='C') en_dis='enable'; 
     // console.log('@@@',en_dis,'###')
      $('#polines').datagrid('options').tbar.dgre_add.linkbutton(en_dis); 
  
      $('#GST_ID').combobox('reselect');
      $('#CURRENCY_ID').combobox('reselect');

    }).on('changed',function(jq,data){
     
        var opts = $(this).form('options');
        if(!opts.loading) {
          butEn('sadx');
        } 
    }).on('success',function(data){
      //console.log(data);
      var en_dis='disable';
       if (data.STATUS !='C') en_dis='enable'; 
       $('#polines').datagrid('options').tbar.dgre_add.linkbutton(en_dis); 
    })
  
  
    
  /*
    for(var k in dwap.pdata.udfid){
      var val = dwap.pdata.udfid[k];
      if(k.indexOf('UDF_')===0 && val !== '') {
        if(val.indexOf('*')===0) var req=true; else var req=false;
        dwap.page.opts.columns[0].push({
          field: k.replace('UDF_','USER_'),
          title: val.replace('*',''),
          editor: {
            type:'textbox',
            options:{
              required: req
            }
          },
          coloff:true
        })
      }
    }
  */
   // if(dwap.udata.groups.indexOf('SALES-PRICING')==-1) dwap.page.opts.columns[0].splice(9,2);
  
    var dg = $('#polines'); 
    dg.datagrid('rowEditor',dwap.page.opts);  
    dg.datagrid('options').tbar.dgre_add.linkbutton('disable');
    dg.datagrid('columns',$('#dgre_tb'));
  
  })