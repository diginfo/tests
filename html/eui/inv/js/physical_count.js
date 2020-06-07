/*
CLS, 2019-2-12, PHYSICAL COUNT INIT
*/
dwap.page.opts = {

    editor: 'form',
    addData:{
        LINE_NO:'$autonum:1',
        PHYSICAL_COUNT_ID: '#PHYSICAL_COUNT_ID'
    },
    striped: true,
    url: '/',
    queryParams:{
      _sqlid:'inv^physical_count_lines',
      _func:'get',
      _dgrid:'y',
    },
    rownumbers: false,
    fitColumns: false,
    fit: true,
    pagePosition: 'bottom',
    pagination:true,
    pageList: [25,50,100,250],
    pageSize:25,
    columns: [[
      {field:'PHYSICAL_COUNT_ID',hidden:true},
      {field:'LINE_NO',title:'#',width:30,fixed:true,align:'center'},
      {field:'PART_ID',title:'Our Part ID',width:100,editor:{type:'qbe',options:{
        required:true,
          queryParams: {
            _sqlid:'inv^physical_count_parts',
            _qbe:'y',
          },
          onDemand: true,
          multiCol: true,
          valueField: 'PART_ID',
          fields:[

            {field:'value',title:'Part ID',editor:'textbox'},
            {field:'DESCRIPTION',title:'Description',editor:'textbox',formatter:function(val){
              if(!val) return '';
              else return val.substring(0,50);
            }},
            {field:'ALIAS_DESC',title:'Alias'},
            {field:'TRACE_ID',title:'Trace ID'},
            {field:'LENGTH',title:'Length'},
            {field:'WIDTH',title:'Width'},
            {field:'HEIGHT',title:'Height'},
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
            {field:'PART_LENGTH',title:'Length Enabled'},
            {field:'PART_WIDTH',title:'Width Enabled'},
            {field:'PART_HEIGHT',title:'Height Enabled'},

          ],
          onSelect: function(rw){
            //TRACEABLE
            if (rw.TRACEABLE=='Y') var ro=true;
            else var ro=false;
            var TID=$('#_dgform > form input[textboxname=TRACE_ID');
            TID.textbox('required',ro);
            TID.textbox('readonly',!ro);
            //DIM
            if (rw.DIM_TRACKED=='Y') var ro=true;
            else var ro=false;
            var dims=['LENGTH','WIDTH','HEIGHT'];
            dims.map(function(d){
              if (rw['PART_'+d]=='N') ro=false;
              else ro=true;
              var TID=$('#_dgform > form input[textboxname='+d);
              TID.textbox('required',ro);
              TID.textbox('readonly',!ro);
            })
          } 
      }}},
      {field:'DESCRIPTION',title:'Description',width:100,fixed:true,align:'left'},
      {field:'UOM_ID',title:'UOM',width:30,fixed:true,align:'left'},
      {field:'TRACE_ID',title:'Trace ID',width:100,fixed:true,align:'left',editor:{type:'textbox',options:{readonly:true}}},
      {field:'LENGTH',title:'Length',width:100,fixed:true,align:'right',
        editor:{type:'numberspinner',options:{
          precision:2,min:0,value:0,id:'length', readonly: true,
        }}
      },
       {field:'WIDTH',title:'Width',width:100,fixed:true,align:'right',
        editor:{type:'numberspinner',options:{
          precision:2,min:0,value:0,id:'width', readonly: true,
        }}
      },
      {field:'HEIGHT',title:'Height',width:100,fixed:true,align:'right',
        editor:{type:'numberspinner',options:{
          precision:2,min:0,value:0,id:'height', readonly: true,
        }}
      },
      {field:'COUNT',title:'Count Qty',width:100,fixed:true,align:'right',
        editor:{type:'numberspinner',options:{
          precision:2,min:0,value:0,id:'count', readonly: true,
        }}
      },
      {field:'RECOUNT',title:'RECount Qty',width:100,fixed:true,align:'right',
      editor:{type:'numberspinner',options:{
          precision:2, min:0,value:0,id:'recount',readonly: true,
        }}
      },
      {field:'NOTES',title:'Notes',width:250,fixed:true,editor:{type:'textbox',options:{readonly:false,multiline:true,height:150,}}},

      ]],
    onRowContextMenu: function(e){return e.preventDefault()},
    onBeforeLoad:function(qp){
      //console.log(qp);
        //if(!qp.PHYSICAL_COUNT_ID) return false; 
        },
    loadFilter: function(data){
    
    if(!data.rows) data = {
      total:data.length ,
      rows:data,
    }
    
        return data;
    },
    onEndEdit: function(idx,row,chg){
        var url = "/?_sqlid=inv^physical_count_line";
        var data = clone(row);
        if (data.PHYSICAL_COUNT_ID==undefined){}
        else {
          ajaxget(url,data,function(data){}) 
        }
    },
    onSelect:function(idx,row){
      if (row) {
        var endis="enable";
        if (row.PHYSICAL_COUNT_ID==undefined)	endis="disable";
        var enduser=$('#END_COUNT_USER').textbox('getValue');
        if (enduser=="") endis="enable";
        else endis="disable";
        $(this).datagrid('options').tbar.dgre_edit.linkbutton(endis);
        $(this).datagrid('options').tbar.dgre_edit.linkbutton(endis);
        $(this).datagrid('options').tbar.dgre_del.linkbutton(endis);


        dwap.page.count(row);

       if (endis=="enable") {
        if (row.COUNT =='' ) $(this).datagrid('options').tbar.dgre_del.linkbutton('enable');
        else $(this).datagrid('options').tbar.dgre_del.linkbutton('disable');
       }


      }
    }
  }

  dwap.page.saverows = function(id){
    var jsons={
      _sqlid:'inv^physical_count_lines',
      _func:'add', 
      'PHYSICAL_COUNT_ID':id,
      'TRACEABLE':$('#TRACEABLE').combobox('getValue'),
      'PART_CLASS_ID':$('#PART_CLASS_ID').combobox('getValue'),
      'DIM_TRACKED':$('#DIM_TRACKED').combobox('getValue'),
      'PART_ID':$('#PART_ID').textbox('getValue'),
      'INVENTORY_LOCK':$('#INVENTORY_LOCK').combobox('getValue'),
      'CYCLE_COUNT':$('#CYCLE_COUNT').combobox('getValue'),
      'PRODUCT_CODE':$('#PRODUCT_CODE').combobox('getValue'),
      
      }
      ajaxget('/',jsons,function(res){
          
    });
    
  }
  dwap.page.lines=function(pvar){
    var dg=$('#lines');
    dg.datagrid('options').queryParams._sqlid=pvar._sqlid;
    dg.datagrid('load',pvar);

  }
  dwap.page.count=function(row){
      var count=$('#_dgform > form input[textboxname=COUNT');
      var recount=$('#_dgform > form input[textboxname=RECOUNT');
      var ro=true;
      if(row.PART_ID) {
        if (row.COUNT !="") ro=false;
        else ro=true;  
        count.numberspinner('readonly',!ro);
        recount.numberspinner('readonly',ro);
      }
      else {
        count.numberspinner('readonly',true);
        recount.numberspinner('readonly',true);
      }
  }
  dwap.page.recount=function(){
    
    var pvar={_sqlid:'inv^physical_count_lines_recount',_func:'get','_dgrid':'y'};
    var sqlid='inv^physical_count_lines_recount';
    switch (recount) {
      case 0:
        sqlid='inv^physical_count_lines';
        recount=1;
        break;
      case 1:
        sqlid='inv^physical_count_lines_recount';
        recount=0;
        break;
      default:
        sqlid='inv^physical_count_lines_recount';
        recount=0;
    }
    pvar._sqlid=sqlid;
    pvar.PHYSICAL_COUNT_ID=$('#PHYSICAL_COUNT_ID').combobox('getValue');
    
    dwap.page.lines(pvar);

  }
  

  dwap.page.qbe=function(){
    var pid=$('#PHYSICAL_COUNT_ID').combobox('getValue');
    if (pid==""){
      var pvar ={_sqlid:'inv^physical_count_parts',_func:'get'};
      pvar.PART_CLASS_ID=$('#PART_CLASS_ID').combobox('getValue');
      pvar.TRACEABLE=$('#TRACEABLE').combobox('getValue');
      pvar.DIM_TRACKED=$('#DIM_TRACKED').combobox('getValue');
      pvar.PART_ID=$('#PART_ID').textbox('getValue');
      pvar.CYCLE_COUNT=$('#CYCLE_COUNT').combobox('getValue');
      pvar.PRODUCT_CODE=$('#PRODUCT_CODE').combobox('getValue');
    } 
    else {
      var pvar ={_sqlid:'inv^physical_count_lines',_func:'get'};
      pvar.PHYSICAL_COUNT_ID=pid;
    }
    dwap.page.lines(pvar);
  }
  
  dwap.page.endis=function(endis){
        $('#but_save').linkbutton(endis);
        $('#but_del').linkbutton(endis);
        $('#endcount').linkbutton(endis);

        $('#START_DATE').datebox(endis);
        $('#END_DATE').datebox(endis);
        
        $('#pwd').textbox(endis);
        
        $('#NOTES').textbox(endis);
        $('#lines').datagrid('options').tbar.dgre_add.linkbutton(endis);
        $('#lines').datagrid('options').tbar.dgre_edit.linkbutton(endis);
        $('#lines').datagrid('options').tbar.dgre_del.linkbutton(endis);
  }

  dwap.page.endis_qbe=function(endis){
    $('#START_DATE').datebox(endis);
    $('#TRACEABLE,#DIM_TRACKED,#PART_CLASS_ID,#INVENTORY_LOCK,#CYCLE_COUNT,#PRODUCT_CODE').combobox(endis);
    $('#PART_ID').textbox(endis);
  
    
  }
  $(document).ready(function() {
    
    var recount=1;
      toolbut([
    {
      id: 'recount',
      iconCls: 'icon-calc',
      text: 'RECount',
      disabled: true,
      noText: false,
      onClick:function(){
        dwap.page.recount()
      }
    },

  ])

    var dg = $('#lines'); 
    dg.datagrid('rowEditor',dwap.page.opts);  

    $('#but_add').on('done',function(){
      
        $('#endcount').linkbutton('disable');
        $('#recount').linkbutton('disable');
        
        dwap.page.endis('disable');
        dwap.page.endis_qbe('enable');
        $('#INVENTORY_LOCK,#CYCLE_COUNT').combobox('required',true);
        butEn('sdx');
        $('#lines').datagrid('loadData',{"total":0,"rows":[]});
    })

    $('form#physical_count').on('loadDone',function(jq,data){
  
      if (data.PHYSICAL_COUNT_ID){

            var pvar={_func:'get',_sqlid:'inv^physical_count_lines',_dgrid:'y',PHYSICAL_COUNT_ID:data.PHYSICAL_COUNT_ID};
            dwap.page.lines(pvar);

            var endis='enable';
            if (data.END_COUNT_USER.length>0) endis='disable';
            dwap.page.endis(endis);
            dwap.page.endis_qbe('disable');
        
            $('#recount').linkbutton(endis)      
      }

        
    }).on('success',function(jq,mr){
        // only save lines if head saved success & we have inventory count lines
        //problem: when save more than 1000 rows, system will pull the lines 1st before add lines.
        //fixed using async promise() as below. system will add lines 1st , follow by pull  the lies
    
        if(mr.res._next) {
            pcount(mr.res._next);
            function saverows(a){
              return new Promise(resolve => {
                dwap.page.saverows(a,resolve);
              })
            }
            function lines(b){
              return new Promise(resolve => {
                var pvar={_func:'get',_sqlid:'inv^physical_count_lines',_dgrid:'y',PHYSICAL_COUNT_ID:b};
                dwap.page.lines(pvar,resolve);
              }) 
            }
            async function pcount(p){
                const a=await saverows(p);
                const b=await lines(p);
                return cb(b);
            }
            /*
                var endis='enable';
                var endcount_user=$('#END_COUNT_USER').textbox('getValue');
                if (endcount_user.length>0) endis='disable';
                dwap.page.endis(endis);
                dwap.page.endis_qbe('disable');
                $('#recount').linkbutton(endis);
                $('#PHYSICAL_COUNT_ID').combobox('setValue',mr.res._next) ;
                setTimeout(function(){
                  $('#PHYSICAL_COUNT_ID').combobox('reselect') ;
                },200)
              */  
                

        }
        if (mr.mode=='del') {
            $('#lines').datagrid('loadData',{"total":0,"rows":[]});
        }
    })
    

    //reload the datagrid based on QBE selections
    $('#TRACEABLE,#DIM_TRACKED,#PART_CLASS_ID,#CYCLE_COUNT,#PRODUCT_CODE').combobox({
      onSelect:function(){
        dwap.page.qbe()
      }
    })
    $('#PART_ID').textbox({
      onChange:function(){
        dwap.page.qbe()
      }
    })
    

     $('#endcount').linkbutton({
      onClick:function(){
        var id=$('#PHYSICAL_COUNT_ID').combobox('getValue'); 
        var pwd=$('#pwd').textbox('getValue');
        $('#END_DATE').datebox('clear');
        ajaxget('/',{_sqlid:'user^passwd',_func:'get', pwd:pwd,_uid:dwap.udata.userid},function(res){
          if (res.error) return ;
            confirm(function(yn){
              if (yn){
                //$('.dialog-button.messager-button:visible a').linkbutton('disable');
                $('#END_DATE').datebox('setValue',new Date());
                $('#END_COUNT_USER').textbox('setValue',dwap.udata.userid);
                ajaxget('/',{_sqlid:'inv^physical_count',_func:'upd', PHYSICAL_COUNT_ID:id,END_DATE:new Date(),END_COUNT_USER:dwap.udata.userid},function(res){
                    $('#endcount').linkbutton('disable');
                    $('#pwd').textbox('clear');
                    $('#PHYSICAL_COUNT_ID').combobox('reload');
                });
              }
            },'End Count :'+id+' ?')

        })

      }
    })

       $('#_dgform').dialog({
      buttons: [
        {id:'prev', iconCls:'pagination-prev', 
          handler:function(){
              var dg=$('#lines');
              var selected=dg.datagrid('getSelected');
              if (!selected) {$('#_dgform > form').form('clear');}
              else { 
                if (selected.PHYSICAL_COUNT_ID){
                    var index=dg.datagrid('getRowIndex',selected);          
                    var url = "/";
                    var data = {PHYSICAL_COUNT_ID:selected.PHYSICAL_COUNT_ID,LINE_NO:selected.LINE_NO,_func:'upd',_sqlid:'inv^physical_count_line'}
                    data.COUNT=$('#_dgform > form input[textboxname=COUNT').numberspinner('getValue');
                    data.RECOUNT=$('#_dgform > form input[textboxname=RECOUNT').numberspinner('getValue');
                    data.NOTES=$('#_dgform > form input[textboxname=NOTES').textbox('getValue');
                    ajaxget(url,data,function(e){
                      dg.datagrid('updateRow',{index:index,row:data});
                    }) 
                    var pageSize=dg.datagrid('options').pageSize;
                    var pager=dg.datagrid('options').pageNumber;

                    if (index==0){
                      dg.datagrid('gotoPage',parseInt(pager)-1);

                      setTimeout(function(){
                        dg.datagrid('selectRow',parseInt(pageSize)-1);
                        var selected1=dg.datagrid('getSelected');
                        $('#_dgform').form('load',selected1);
                      },500)

                    }
                    else {
                      if (index<0)dg.datagrid('selectRow',0);
                      else  dg.datagrid('selectRow',parseInt(index)-1);

                      var selected1=dg.datagrid('getSelected');
                      $('#_dgform').form('load',selected1);                  
                    }
                }
              }
          }
        },
        {id:'next', iconCls:'pagination-next',
            handler:function(){
              var dg=$('#lines');
              var selected=dg.datagrid('getSelected');

              if (!selected){$('#_dgform > form').form('clear');}
              else {
                  if (selected.PHYSICAL_COUNT_ID){
                      var index=dg.datagrid('getRowIndex',selected);
                      var url = "/";
                      var data = {PHYSICAL_COUNT_ID:selected.PHYSICAL_COUNT_ID,LINE_NO:selected.LINE_NO,_func:'upd',_sqlid:'inv^physical_count_line'}
                      data.COUNT=$('#_dgform > form input[textboxname=COUNT').numberspinner('getValue');
                      data.RECOUNT=$('#_dgform > form input[textboxname=RECOUNT').numberspinner('getValue');
                      data.NOTES=$('#_dgform > form input[textboxname=NOTES').textbox('getValue');
                      ajaxget(url,data,function(e){
                          dg.datagrid('updateRow',{index:index,row:data});
                      }) 
                      var pageSize=dg.datagrid('options').pageSize;
                      var pager=dg.datagrid('options').pageNumber;

                      if (pageSize==(parseInt(index)+1)) {
                        dg.datagrid('gotoPage',parseInt(pager)+1);
                        setTimeout(function(){
                          dg.datagrid('selectRow',0);
                          var selected1=dg.datagrid('getSelected');
                          $('#_dgform').form('load',selected1);                  
                        },500)
                      }
                      else {
                        dg.datagrid('selectRow',parseInt(index)+1);
                        var selected1=dg.datagrid('getSelected');
                        $('#_dgform').form('load',selected1);                
                      }
                  }
              }
            }
         },
        {
        text:'Save',
        iconCls:'icon-save',
        handler:function(){
        var frm = $('#_dgform > form');
        if(!frm.form('validate')) return;
        var fdat = frm.form('getData');
        fdat._sqlid='inv^physical_count_line'

  		  ajaxget('/',fdat,function(){
    		  $('#_dgform').dialog('close');  
          $('#lines').datagrid('reload');
  		  });
  		}
      },{
        text:'Cancel',
        iconCls:'icon-cancel',
        handler:function(){$('#_dgform').dialog('close')}
      }]
    });
  })
  