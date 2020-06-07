/*

  PAC 160322
  1. Set Initial State of traceprop to Readonly.

  CLS 170823 - 2.2
  1. default the trace id to job number when FG Receipt IN

  PAC 171106 - 2.2.
  1. Added dwap.page.dimdiv(), dwap.page.dodim()
  2. Sorted PART_ID Combobox data.
  
  PAC 171108 - 2.2.963
  1. TRACE_ID onChange & onSelect() both ignore INBOUND checks.
  2. Added mask & delay after submitting transaction.
  3. Added code to load DIMs combo based on selected Trace ID
  4. Added code to check for expired trace

  PAC 171109 - 171110 - 2.2.9
  1. dwap.bhave.ALLOWED_MISC_TX not working.
  2. Added dwap.page.clear but not tested.
  3. enable visibility on out trans lwh fields.
  4. added timeout to nodclick() & fixed main.js function.
  5. re-formatted selection dims to exclude unused dims.
  6. added dwap.page.jobopt.onSelect() to JOB-IN to fix bug where traces not limited to selected job.
  7. added qbe part selection for JOB-ISSUE
  8. fixed OLD issue when adjust in & traces exists & msgbox, fields were disabled.

  PAC 171113 - 2.2.1190
  1. BUG FIX. Prevent recursion on Number Pieces spinner & only set default value onSelect of LWH combo.  

  PAC 171115/171116 = 2.2.1192
  1. Added new code to support modification of dimensions during JOB-IN
  2. Removed DIM_LWH Data from submitted data, use LENGTH, WIDTH, HEIGHT instead.
  3. Made DIM_LWH Combobox required for everytjing except Adjust In (not used)
  4. Added msgbox to check that Job return qty does not exceed issued qty. (warning only)
  5. Number Pieces spinner no max if JOB-IN and Dimension is edited. 
  
  CLS, 171117, 2.2.1227
  1, NOthing changed

  PAC 171117 - 2.2.1232
  1. Bug: Trace ID's not filtered correctly when selecting part. Cause was unique function was filtering by default 'value' key
     instead of WOREF. Changed function call to include WOREF filter key >> unique(data.jobs,'WOREF')

  PAC 171123 - 2.2.1233
  1. changed TRACE_ID Combo to filter LWH Combo by BOTH WOREF and TRACE_ID instead of just trace.

  PAC 171205 - 2.2.1234
  1. JOB-IN dwap.page.jobopt.onSelect()
    --  //var trc = dwap.page.arrFilter(unique(data.jobs,'WOREF'),'WOREF',rec.value); 
    ++  var trc = dwap.page.arrFilter(data.jobs,'WOREF',rec.value);
  
*/

dwap.page.arrFilter = function(arr,key,val){
  var odata = [];
  arr.map(function(e){if(e[key]==val) odata.push(e)})
  return odata;
}

/*
  // Multi-filter not tested.
dwap.page.arrFilter = function(arr,kv){
  var odata = [];
  arr.map(function(e){
    var ok = false;
    for(var k in kv){ok = e[k]==kv[k]} 
    if(ok) odata.push(e)
  })
  return odata;
}
*/

// LWH field dimensional visibility
dwap.page.dimvis = function(part){
  $.each($('.dimin'),function(){
    var me = $(this);
    var id = me.attr('id').replace('DIM_','');
    var req=true, sh='show';
    if(part[id]!='Y') {req=false; sh='hide';}
    me.numberbox('required',req);
    $('#_'+id)[sh]();
  });
}

// Dimension Calculations.
dwap.page.dimcalc = function(){
  var total = 1, qb = $('#QTY');
  $.each($('.dimin'),function(){
    var me = $(this);
    total *= me.numberbox('getValue')||1; 
  });
  total *= $('#DIM_PC_QTY').numberspinner('getValue');
  qb.numberbox('setValue',total);
  
  // 171115 - Returned cannot exceed issued
  if(dwap.page.stat=='JOB-IN'){
    var rec = $('#DIM_LWH').combobox('getRec');
    var iss = (rec.HEIGHT||1) * (rec.LENGTH||1) * (rec.WIDTH||1) * rec.PC_QTY;
    var rtn = qb.numberbox('getValue');
    if(rtn > iss) {
      msgbox('Returned exceeds issued qty.');
      qb.numberbox('setValue',0);
    }
    //console.log('issued:'+iss,'return:'+rtn);
  }

}

// Dimension Combo Select
dwap.page.lwhselect = function(){

  var callid = $(this).attr('id'); // Not required ?? Element that called (changed).
  var total = 1;
  var pq = $('#DIM_PC_QTY');
  var rec = $('#DIM_LWH').combobox('getRec');
  
  // set valueboxes with combo values
  $.each($('.dimin'),function(){
    var id = $(this).attr('id').replace('DIM_','');
    $(this).numberbox('setValue',rec[id]);
  });
  
  $('#DIM_PC_AVAIL').numberbox('setValue',rec.PC_QTY);
  pq.numberspinner('set',{'min':1,'max':rec.PC_QTY});
  
  // prevent recursion & only set on select of LWH
  if(callid=='DIM_LWH') pq.numberspinner('setValue',rec.PC_QTY);
  
  // set value on select of combo dimensions.
  var qty = pq.numberspinner('getValue');
  total *= (rec.HEIGHT||1) * (rec.LENGTH||1) * (rec.WIDTH||1) * qty;
  $('#QTY').numberbox('setValue',total);
}

// Show / Hide Dimension Sections.
dwap.page.dimdiv = function(data){
  
  var part = data.part;
  var qty=$('#QTY'), dimsdiv=$('#dimsdiv'), dimout=$('#dimout'), dimin=$('#dimin');
  var pcqty=$('#DIM_PC_QTY'), lwh=$('#DIM_LWH'); 
  
  if(part.DIM_TRACKED=='Y') {
    qty.numberspinner('readonly',true);
    dimsdiv.show();
    dwap.page.dimvis(part);

    // ### ALLWAYS DO ###
    $('.dimin')
      .numberbox({'onChange':dwap.page.dimcalc})
      .next('span.textbox').addClass('textbox-readonly');
    pcqty.numberspinner({'onChange':dwap.page.dimcalc});
    
    // ### ADJUST-IN ###
    if(dwap.page.stat=='ADJ-IN'){   
      dimout.hide();dimin.show();
      $('.dimin')
        .numberbox({editable:true})
        .next('span.textbox').removeClass('textbox-readonly');
      lwh.combobox({required: false});
    }
    
    // ### ADJUST-OUT, JOB-OUT, JOB-IN ###
    else {
      dimout.show();
      //pcqty.numberspinner({'onChange':dwap.page.lwhselect});
      
      /* 
        I WANT TO MOVE THIS ! 
        Requires:
        1. data.dims
        2. part
      */
      
      lwh.combobox({
        required: true,
        _init: null,
        _traceid: null,
        _woref: null,
        onSelect:dwap.page.lwhselect,
        data:data.dims,
        loadFilter:function(data){
          var lwha = ['LENGTH','WIDTH','HEIGHT'];
          var opt = $(this).combobox('options');

// 171123 - multiple filter
if(opt._traceid || opt._woref) {
  if(opt._traceid) fdata = dwap.page.arrFilter(data,'TRACE_ID',opt._traceid);
  if(opt._woref) fdata = dwap.page.arrFilter(fdata,'WOREF',opt._woref);
  opt._woref = null; opt._traceid = null;
  return multisort(fdata,lwha);
}
          else {  // Initial Loading before filters.
            data.map(function(e){
              var bits=[]; lwha.map(function(x){
                if(part[x]=='Y') bits.push(x[0]+':'+e[x]);
              });
              e.text = bits.join(' x ');
            })
          }
          return multisort(data,lwha);
           
        }
      }).combobox('readonly',false).removeAttr('readonly');
    }
    
  } 
  
  else {  // NOT piece-tracked
    qty.numberspinner('readonly',false);
    dimsdiv.hide();
  }

}

//JOB COST
// CLS, 2019-04-22
dwap.page.jobcost= function(){
 // console.log('jobcost::',dwap.page.stat);
  if (dwap.page.stat=='FG-IN'){

  
  var tmc=$('#TRACE_MATERIAL_COST');
  var qty=$('#QTY').numberspinner('getValue');
  var jc=$('#JOB_COST').textbox('getValue');

  if (qty>0 ) tmc.numberspinner('setValue',jc/qty);
  }

}
//
// ############## END-NEW ###################

dwap.page.tracediv = function(part){
  var tracediv = $('#tracediv'),trace = $('#TRACE_ID');
  if(part.TRACEABLE=='Y') {tracediv.show();trace.combobox('required');}   
  else {tracediv.hide(); trace.combobox('required',false)}    
}

dwap.page.traceadd = function(on){
  var trace = $('#TRACE_ID'), expire=$('#EXPIRY_DATE');
  var div = $('#tracebal');
  if(on) {trace.combobox('toText'); expire.datebox('readonly',false).removeAttr('readonly');div.hide();}
  else {trace.combobox('toCombo'); div.show();expire.datebox('readonly',true)} 
}

dwap.page.switch = function(){
  
  var part = $('#PART_ID'), partopt = part.combobox('options');
  var job = $('#WOREF'), jobopt = job.combobox('options');
  var trace = $('#TRACE_ID'), traceopt = trace.combobox('options');
  var tracemcost= $('#TRACE_MATERIAL_COST');

  function cbodata(){
  	part.combobox('loadData',dwap.page.part.data);
  	job.combobox('loadData',dwap.page.jobopt.data);    
  }

  function jobdiv(on){
    var jobdiv = $('#jobdiv'); 
    if(on) {jobdiv.show();job.textbox('required',true)}
    else {jobdiv.hide();job.textbox('required',false);} 
  }

  function partfilt(cls,bals,rows){
    if(typeof(cls)=='string') cls=[cls];
    if(!rows) return [];
    var parts = []; rows.map(function(e){
      if(cls.indexOf(e.PART_CLASS_ID)>-1) {
        if(bals && e.BAL_QTY > 0) parts.push(e);
        else if(!bals) parts.push(e);
      }
    });
    return parts; 
  }

  function unique(arr,key){
    key=key||'value'; var rows=[], idx=[];
    arr.map(function(e){
      if(idx.indexOf(e[key])==-1){
        idx.push(e[key]);
        rows.push(e);
      }
    });
    return rows;  
  }
  
  function dotrace(data,cbodat){
    //console.log(cbodat);
    if(data.part.TRACEABLE=='Y') {

      var max=data.part.LOT_SIZE;
      dwap.page.props(data);
      trace.combobox('loadData',cbodat); 
   
      tracemcost.numberbox('setValue',cbodat.TRACE_MATERIAL_COST);
      tracemcost.numberbox('readonly',true); 

    }
    else {
      
      var max = data.part.BAL_QTY;
    }
    dwap.page.minmax(1,max);     
  }
  
  // Common defaults
  dwap.page.part = {data:[],bals:[]}; 
  dwap.page.jobopt = {data:[]}; 
  dwap.page.traceopt = {data:[]};
  
  switch (dwap.page.stat){
  	
  	case 'ADJ-IN':
      dwap.page.part.onLoad = function(data){
        dwap.page.dimdiv(data); // PAC 171106
        if(data.part.TRACEABLE=='Y') {
          dwap.page.traceadd(true);
          dwap.page.tracediv(data.part);
          trace.combobox('loadData',data.trace);       
          dwap.page.props(data);
          if(data.part.TRACEABLE=='Y') var max = data.part.LOT_SIZE;
        } else {
          var max;
          // PAC 171108
          dwap.page.tracediv(data.part);
          dwap.page.traceadd(false);
          // PAC 171108 END
        }
        
        dwap.page.minmax(1,max);

      }

      dwap.page.traceopt.onSelect = function(rec){
        var avail = rec.LOT_SIZE - rec.BAL_QTY;

        $('#BAL_QTY').numberbox('setValue',avail);
        dwap.page.minmax(1,avail); 
        $('#TRACE_MATERIAL_COST').numberbox('readonly',false);     
      }
      
      part.combobox('loadData',partfilt(['COMP','FG','CONSUMABLE'],false,partopt.allRows));
      break;

  	case 'ADJ-OUT':
      dwap.page.part.onLoad = function(data){
        dwap.page.tracediv(data.part);
        dwap.page.dimdiv(data); // PAC 171106
        dotrace(data,data.trace);
      }
      
      part.combobox('loadData',partfilt(['COMP','FG','CONSUMABLE'],true,partopt.allRows));
      break;
 
  	case 'JOB-OUT':
      if(dwap.page.shift) $('.textbox-icon.icon-search').click();
      
      dwap.page.part.onLoad = function(data){
        dwap.page.dimdiv(data); // PAC 171106
        dotrace(data,data.trace);
        jobdiv(true);
        dwap.page.tracediv(data.part);
// NEW - but confused about what is jobopt.seqRows !!
job.combobox('loadData',data.jobs);  

      } 

      part.combobox('loadData',partfilt(['COMP','FG','CONSUMABLE'],true,partopt.allRows));
//job.combobox('loadData',jobopt.seqRows);      
      
      break; 

  	case 'JOB-IN':
      if(dwap.page.shift) $('.textbox-icon.icon-search').click();
      var data;
      dwap.page.part.onLoad = function(idata){
        data = idata;
        dwap.page.dimdiv(data); // PAC 171106
        var rows = []; data.jobs.map(function(job){rows.push({'text':woref2text(job.WOREF),'value':job.WOREF})})
        job.combobox('loadData',unique(rows));
        //dotrace(data,unique(data.jobs));
        jobdiv(true);
      }
     //CLS, 2018/3/7 , included COMSUMABLE part class
      part.combobox('loadData',partfilt(['COMP','FG','COMSUMABLE'],false,partopt.allRows));
      
      // 171110 WLH Bug - load traces based on selected WOREF
      dwap.page.jobopt.onSelect = function(rec){
        //console.log('CLS');
       // console.log(rec);
        dwap.page.tracediv(data.part); // show Trace Div.
        //var trc = dwap.page.arrFilter(unique(data.jobs,'WOREF'),'WOREF',rec.value); 
        var trc = dwap.page.arrFilter(data.jobs,'WOREF',rec.value); 
        //console.log(trc)
        dotrace(data,trc);
        dwap.page.minmax(1,trc[0].BAL_QTY);
      }
      break; 

  	case 'FG-IN':
      dwap.page.part.onLoad = function(data){
        
        var rec = job.combobox('getRec');    
        var maxpct = dwap.bhave.FG_MAXRECV || 100;
        var rcvqty = rec.RECEIVED_QTY || 0; 
        var maxrcv = ((parseInt(maxpct)/100) * rec.qreq) - rcvqty;
        
        if(data.part.TRACEABLE=='Y') {
          dwap.page.props(data);
          dwap.page.traceadd(true);
          dwap.page.tracediv(data.part);
          trace.combobox('loadData',data.trace);
          if(data.part.LOT_SIZE > maxrcv) var max=maxrcv
          else var max = data.part.LOT_SIZE;
          if (dwap.bhave.FG_IN_DEF_JOB_AS_TRACE=='y') trace.combobox('setValue',$('#BASE_ID').textbox('getValue'));

          if (dwap.bhave.FG_IN_UNIT_TRACE_COST=='P') {
            //use PART TRACE UNIT MATERIAL COST
            tracemcost.numberspinner('setValue',$('#UNIT_MATERIAL_COST').numberspinner('getValue'));
          }

        }
        else {
          var max=maxrcv;
        }
        dwap.page.tracediv(data.part);
        
        dwap.page.minmax(1,max);
      }
      
      dwap.page.jobopt.onSelect = function(rec){
        part.combobox('select',rec.PART_ID);
      }

      var rows = []; jobopt.basRows.map(function(e){if(e.WO_TYPE=='FG') rows.push(e)})
      job.combobox('loadData',rows);
      jobdiv(true);
      
      part.combobox('loadData',partfilt('FG',false,partopt.allRows));
      part.combobox('readonly',true);

      break;

  	case 'FG-OUT':
      dwap.page.part.onLoad = function(data){
        jobdiv(true);
        var rows = []; jobopt.basRows.map(function(e){if(e.WO_TYPE=='FG' && e.PART_ID == data.part.ID) rows.push(e)})
        job.combobox('loadData',rows);
        dwap.page.tracediv(data.part);
        dotrace(data,data.trace);
      }
      //fgbals();
      part.combobox('loadData',partfilt('FG',true,partopt.allRows));
      break;

  	case 'SHP-OUT':
      dwap.page.part.onLoad = function(data){
        dwap.page.tracediv(data.part);
        dotrace(data,data.trace);
      }

      dwap.page.traceadd(false);
      job.combobox('loadData',[]);      
      part.combobox('loadData',partfilt(['COMP','FG'],true,partopt.allRows));
      break;

  	case 'SHP-IN':
      dwap.page.part.onLoad = function(data){
        dwap.page.tracediv(data.part);
        dotrace(data,data.ship);
      }
      
      var idx=[], rows=[]; partopt.shipRows.map(function(e){if(idx.indexOf(e.value)==-1) {idx.push(e.value); rows.push(e);}})
      part.combobox('loadData',rows);
      break; 
  }
  
}

// return form data
dwap.page.fdat = function(key){
  var data = frm2dic($('form#trans'));
  if(key) {return data[key] || null;}
  else return data;
}

dwap.page.minmax = function(min,max){
  //console.log('max:'+max);

  max = max || 1000000;
  min = min || 1;
  if(max==1000000) var avail = ''; else var avail = max; 
  
  $('#AVAIL_BAL').numberbox('setValue',parseFloat(max).toFixed(2))
  $('#QTY').numberspinner('set',{'val':0, 'min':0,'max':max*1});
 // $('#QTY').numberspinner('set',{'val':0, 'min':0,'max':parseFloat(max).toFixed(2)});

}

dwap.page.minmax_CLS = function(min,max){
 // console.log('max:'+max);
  if (max<=0) var max1=0;
  else var max1=max;

  min = min || 1;
  if(max1==1000000) var avail = ''; else var avail = max1; 
 // console.log('max1:'+max1);
 // console.log('avail:'+avail);
  
  $('#AVAIL_BAL').numberbox('setValue',parseFloat(max1).toFixed(2))
  //$('#QTY').numberspinner('set',{'val':0, 'min':0,'max':parseFloat(max).toFixed(2)});
  $('#QTY').numberspinner('set',{'val':0, 'min':0,'max':max1*1});
  
}

// load the Traceable Properties
dwap.page.props = function(data){
  for(var key in data.part){
    if(key.indexOf('TRACE_USER_')==0){
      var fitem = $('div#traceprop div.fitem#'+key); 
      var label = fitem.find('label.trace');
      var inp = fitem.find('input.textbox-f'); 
      if(data.part[key] != '') {
        label.text(data.part[key].replace('*',''));
        fitem.show();
        if(dwap.page.stat == 'ADJ-IN' && data.part[key].indexOf('*')===0) inp.textbox('required');
      } 
      else {
        fitem.hide();
      } 
    }  
  }
}

// prevent changes to div & contents
dwap.page.lock = function(rem){  
  if(rem) $('form#trans').removeClass('lock');
  else $('form#trans').addClass('lock');

  var tdate=$('#TRANSACTION_DATE');
  var editTdate=dwap.bhave.ALLOWED_EDIT_TXDATE || 'n';
  if (editTdate=='y') tdate.datebox('readonly',false).removeAttr('readonly');
  else tdate.datebox('readonly',true).removeAttr('readonly');
}

  //2019-01-24
  //CLS, check the PART.LOCKED
  //if Y, not allowed to create part trans
dwap.page.part_locked=function(){
    var locked=$('#LOCKED').textbox('getValue');   
    var pid= $('#PART_ID').combobox('getValue');
    if (locked=='Y') {
        msgbox('Part '+pid+' LOCKED. '+'<br><b>Part Trans NOT allowed!</b>');
        $('#SAVE').linkbutton('disable');
      }
      else $('#SAVE').linkbutton('enable');
}


$(document)
  .keydown(function (e) {if(e.keyCode == 81) dwap.page.shift = true})
  .keyup(function (e) {if(e.keyCode == 81) dwap.page.shift = false});

$(document).ready(function(){

  // 171116 - Editable Dimensions Boxes.
  $('#DIM_LENGTH, #DIM_WIDTH, #DIM_HEIGHT').numberbox({
    editable:false,
    icons: [{
		  enabled: true,
		  iconCls:'icon-edit',
      handler: function(e){
			  e.preventDefault();
			  if(!(/JOB-IN|ADJ-IN/).test(dwap.page.stat)) return;
			  $('#DIM_LWH').combobox('readonly',true);
			  $('#DIM_PC_QTY').numberspinner('set',{'max':null});
			  var me = $(e.data.target);
			  setTimeout(function(){
  			  me.textbox({editable:true});
  			  me.next('span.textbox').removeClass('textbox-readonly');
  			  euifocus(me);
        })
      }
		}]
  })

  $('#JOB_QBE').qbe({      
      queryParams: {_sqlid: 'vwltsa^seqpart_qbe'},
      onDemand: true,
      valueField: 'PART_ID',
      fit:true,
      fitColumns: true,
      fields:[
        {field:'WOREF',title:'Job ID',editor:'textbox',formatter:function(val){return val.split('^')[0]}},
        {field:'SEQ_NO',title:'Seq No',formatter:function(val,row,idx){return row.WOREF.split('^').slice(-1)[0]}},
        {field:'PART_ID',title:'Part ID',editor:'textbox'},
        {field:'DESCRIPTION',title:'Description',editor:'textbox'},
        {field:'REQUIRED_QTY',title:'Qty Reqd'},
        {field:'QTY_DUE_FROM_',title:'Qty Due',editor:'numberbox',},
        {field:'REQUIRED_QTY_FROM_',title:'Min Qty Reqd',editor:'numberbox',hidden:true},
        {field:'ISSUED_QTY_FROM_',title:'Min Qty Due',editor:'numberbox',hidden:true},
      ],

      fields:[
        {field:'WOREF',title:'Job ID',editor:'textbox',formatter:function(val){return val.split('^')[0]}},
        {field:'SEQ_NO',title:'Seq No',formatter:function(val,row,idx){return row.WOREF.split('^').slice(-1)[0]},editor:'textbox'},
        {field:'PART_ID',title:'Part ID',editor:'textbox'},

        {field:'WANT_DATE_FROM_',title:'Min Due Date',editor:'datebox',hidden:true},
        {field:'WANT_DATE',title:'Due Date',formatter:eui.date},
        
        {field:'REQUIRED_QTY_FROM_',title:'Min Qty Reqd',editor:{type:'numberbox',options:{value:1}},hidden:true},
        {field:'REQUIRED_QTY',title:'Qty Reqd'},
        
        {field:'QTY_DUE_FROM_',title:'Min Qty Due',editor:{type:'numberbox',options:{value:1}},hidden:true},
        {field:'QTY_DUE',title:'Qty Due'},
        
        {field:'DESCRIPTION',title:'Description',editor:'textbox'},
      ],
      
      onSelect: function(row){
        //console.log(row.WOREF);
        // _qbeworef is checked onLoadSuccess() and if set selected.
        $('#WOREF').combobox('options')._qbeworef = row.WOREF;
        $('#PART_ID').combobox('select',row.PART_ID);
      }
  });

  $('#LOT_SIZE').numberbox();

  $('#PART_ID').combobox({    
    qbeworef: null,
    rec:{},
    loadFilter:function(data){
      var opts = $(this).combobox('options')
      if(!opts.allRows) {
        opts.allRows = data.part;
        opts.traceRows = data.trace;
        opts.jobRows = data.jobs;
        opts.shipRows = data.ship;
        $('#modediv a').linkbutton('enable');
        return [];
      }
      
      return multisort(data,['PART_CLASS_ID','value']);

    },
    
    onSelect: function(rec){
      var opts = $(this).combobox('options')
      if(!rec) msgbox('This is not a stockable part');

      //$('#traceprop input.textbox-f').textbox('required',false);
      ajaxget('/',{
        '_sqlid':'inv^tracepart',
        '_func':'get',
        'ID':rec.value,
        'TRANS_TYPE':dwap.page.stat,
        'MISC_TRANS' :dwap.bhave.ALLOWED_MISC_TX||'n'
        },function(data){    
        if(data.error) return reload();
        
        //console.log(data);        
        
        // Always do these
        opts.rec = data;
        $('#PART_DESC').textbox('setValue',opts.rec.part.DESCRIPTION);
        $('#PART_UOM').textbox('setValue',opts.rec.part.UOM_ID);
        $('#TRACEABLE').textbox('setValue',{'Y':'Traceable','N':'Not Traceable',}[opts.rec.part.TRACEABLE]||'Not Traceable');
        $('#LOCKED').textbox('setValue',opts.rec.part.LOCKED);
        // 171106 - ADDED NEW DIMENSIONS
        $('#DIM_TRACKED')
          .textbox('setValue',opts.rec.part.DIM_TRACKED)
          .textbox('setText',{'Y':'Yes','N':'No',}[opts.rec.part.DIM_TRACKED]||'No');        
        
        $('#DIM_UOM').textbox('setValue',opts.rec.part.DIM_UOM);
        $('#LOT_SIZE').numberbox('setValue',opts.rec.part.LOT_SIZE);
        var mCost=$('#UNIT_MATERIAL_COST');
        mCost.numberbox('setValue',opts.rec.part.UNIT_MATERIAL_COST);
        mCost.numberbox('readonly',true);
        $('#SAVE').linkbutton('enable');
        
        // udf labels
        setudfs(data.udf,$('form#trans'));
        for(var u in opts.rec.part){
          if(u.indexOf('USER_')==0) $('input[textboxname="'+u+'"]').textbox('setValue',opts.rec.part[u]);
        }
        $('#udfs').show();

        dwap.page.part.onLoad(data);
        dwap.page.part_locked();
      }) 
      
    }
  })
  
  $('#WOREF').combobox({
    
    _qbeworef: null,
    groupField:'BASE_ID',
    
    /* job.combobox('loadData',jobopt.seqRows);  */
    loadFilter: function(data){
      var opts = $(this).combobox('options');
      if(!opts.basRows){
        data.bas.map(function(e){e.value+='^0'});
        opts.basRows = data.bas;
        opts.seqRows = data.seq;
        return {bas:[],seq:[]};
      }
      return data;
    },

    onLoadSuccess: function(data){
      var me = $(this);
      var opts = me.combobox('options');
      if(opts._qbeworef) setTimeout(function(){
        if(objidx(data,'value',opts._qbeworef) < 0) msgbox(opts._qbeworef+' job is not selectable.');
        else me.combobox('select',opts._qbeworef);
        opts._qbeworef = null;
      },200) 
    },

    onSelect:function(rec){

      if (dwap.bhave.WIP_COUNT_ALLOW_JOB_OUT=='n'){
    
        ajaxget('/',{
          '_sqlid':'inv^wip_count_job',
          '_func':'get',
          'WOREF':rec.value,

          },function(data){    
            if (data.length>0) {
              msgbox('**<b>Job, '+rec.value+' in ACTIVE WIP COUNT ,'+data[0].WIP_COUNT_ID+' **</b>\n Material issue not allowed!')
              $('#SAVE').linkbutton('disable');
            }
            else $('#SAVE').linkbutton('enable');
          })
      }
      var bits = rec.value.split('^');
      $('#BASE_ID').textbox('setValue',bits[0]);
      
      // Disabled as these values are not in rec !
      var txt_req=rec.qreq+' / ' + rec.RECEIVED_QTY;
      $('#QTY_REQ').textbox('setValue',txt_req);
      $('#JOB_COST').textbox('setValue',rec.ACT_TOTAL_COST );
      $('input#QTY_RCVD').val(rec.RECEIVED_QTY);

      //$('#QTY_REQ').textbox('setValue',(rec.qreq || 0 + ' / ' +(rec.RECEIVED_QTY || 0)));
      if(bits.length > 1){
        $('#SUB_ID').textbox('setValue',bits[1]);
        $('#SEQ_ID').textbox('setValue',bits[2]);
      }
      if(dwap.page.jobopt.onSelect) return dwap.page.jobopt.onSelect(rec);
      
      // if no override.
      var part = $('#PART_ID').combobox('options').rec.part;
      dwap.page.tracediv(part);  
    }
  })
  

  $('#TRACE_ID').combobox({
    editable: false,  
    loadFilter:function(data){
      var opts = $(this).combobox('options');
      if(!opts.allRows) opts.allRows=data;
      return data;
    },
    
    formatter: function(row){
      return row.value +' ( '+row.BAL_QTY+' )';  
    },
    
    onSelect:function(rec){
      
      // PAC 171108 - Dont Select if Piece Tracked & Inbound
      if( ['ADJ-IN','FG-IN'].indexOf(dwap.page.stat) > -1 && dwap.page.fdat('DIM_TRACKED')=='Y') return false;

      if(dwap.page.traceopt.onSelect) return dwap.page.traceopt.onSelect(rec);
      
      $('#BAL_QTY').numberbox('setValue',rec.BAL_QTY);
      $('#EXPIRY_DATE').datebox('setValue',rec.EXPIRY_DATE);    // PAC 171108
      dwap.page.minmax(1,rec.BAL_QTY);

      // PAC New Code
      if(dwap.page.fdat('DIM_TRACKED') == 'Y'){
        var lwh = $('#DIM_LWH');
        $('#dimin .textbox-f, #dimout .textbox-f').textbox('clear');
        lwh.combobox('options')._traceid = rec.TRACE_ID;

// 171123 NEW
lwh.combobox('options')._woref = rec.WOREF;        
        lwh.combobox('reload');
      }
      
      /*
      // CLS CODE
      dim_lwh.combobox('setValue','');
      $('#DIM_PC_AVAIL').numberbox('setValue','');
      $('#DIM_LENGTH').numberbox('setValue','');
      $('#DIM_WIDTH').numberbox('setValue','');
      $('#DIM_HEIGHT').numberbox('setValue','');
      var opts = dim_lwh.combobox('options').data;
      if (opts){
        var dimsdata = []; 
        opts.map(function(e){if( e.TRACE_ID==rec.value) dimsdata.push(e);});
      }
      $('#DIM_LWH').combobox('loadData',dimsdata);
      */

      function go(){
        var tracemcost= $('#TRACE_MATERIAL_COST');
        tracemcost.numberbox('setValue',rec.TRACE_MATERIAL_COST);
        tracemcost.numberbox('readonly',true);
        var data={}; for(var k in rec){if(k.indexOf('TRACE_USER_')==0) data[k]=rec[k]}
        $('form#trans').form('load',data);
      }
      
      if(rec.EXPIRY_DATE && new Date(rec.EXPIRY_DATE) < new Date()){
        if(dwap.page.stat=='JOB-OUT' && dwap.bhave.EXPIRED_ALLOW_JOB_OUT != 'y') {
          msgbox('Cannot issue expired material to Job');
          return $('#tracediv .textbox-f').textbox('reset');
        }
        
        confirm(function(yn){
          if(!yn) $('#tracediv .textbox-f').textbox('reset');
          else go();
        },'Trace has expired. Continue ?')
      } else go();
      
    },
    
    delay: 500,
    onChange: function(nv,ov){
      
      // ### ONLY check for IN Transactions & ignore if piece tracked.
      if(['ADJ-IN','FG-IN'].indexOf(dwap.page.stat)==-1 || dwap.page.fdat('DIM_TRACKED')=='Y') return;

      // PAC 160322 - Set Initial State to Readonly.
      //$('#traceprop input.textbox-f').textbox('readonly',true);      
      
      if(nv && $(this).combobox('find',{value:nv})){
        msgbox('Warning, Trace ID '+nv+' exists for this part.');
      } 
      $('#traceprop input.textbox-f').textbox('readonly',false);
    }


  })

  // this is 2 buttons.
  $('#typediv > a').linkbutton({
    disabled: false,
    iconAlign:'left',
    onClick:function(rec){
      var me = $(this);
      var name = me.attr('name');
      dwap.page.typediv = name; // PAC 171106
      putcook('vwltsa^matl^part_trans',name);
      var comp = $('#compdiv'), fg = $('#fgdiv');
      if(name=='FG'){comp.hide();fg.show();}
      else {comp.show();fg.hide();}    
    }
  })

  var cook = getcook('vwltsa^matl^part_trans');
  if(cook) $('a[name='+cook+']').click();

  
  $('#modediv a').linkbutton({
    disabled: true,
    size:'large',
    iconAlign:'top',
    onClick:function(rec){
      $('#typediv').addClass('lock');
      var me = $(this);
      dwap.page.stat = me.attr('name');
      $('#TRANS_TYPE').val(dwap.page.stat);
      $('#modediv a').not($(this)).linkbutton('disable').linkbutton('unselect');
      dwap.page.lock(true);
      dwap.page.switch();
    }
  })

  $('#SAVE').linkbutton({
    disabled: true,
    size:'large',
    iconAlign:'top',
    onClick: function(){
      var me = $(this);
      nodclick(me,2000);
      //me.linkbutton('disable');
      if(dwap.page.fdat('QTY') < 0) return msgbox('Quantity must be greater than 0.');


      var frm = $('form#trans');
      frm.form('options').queryParams._mode = dwap.page.mode;
      frm.form('submit');
    }
  });
  
  $('#CANCEL').linkbutton({
    disabled: false,
    size:'large',
    iconAlign:'top',
    onClick: function(){
      reload();  
    }
  });

  $('form#trans').form({
    url:'/',
    queryParams:{
      _sqlid:'inv^invtrans',
      _func:'add'
    },
    
    success: function(res){
      res = JSON.parse(res);
      if(res.error) return msgbox(res.msg);
      grnflash('#but_save');
      setTimeout(function(){
        reload(); // this causes js error.
      },500);
    }
  
  });


  $('#QTY').numberspinner({
    'onChange':function(nv,ov){
      //console.log('FG_IN_TRACE_COST_OVERWRITE',dwap.bhave.FG_IN_TRACE_COST_OVERWRITE);
      //console.log('FG_IN_UNIT_TRACE_COST:',dwap.bhave.FG_IN_UNIT_TRACE_COST);
      
      //if(dwap.bhave.FG_IN_TRACE_COST_OVERWRITE=='y'){
        if (dwap.page.stat=='FG-IN'){
          if (dwap.bhave.FG_IN_UNIT_TRACE_COST=='J'){
              
                var tmc=$('#TRACE_MATERIAL_COST');
                tmc.numberspinner('setValue',0);
                var jc=$('#JOB_COST').textbox('getValue');
        
                var qty_rcvd=$('input#QTY_RCVD').val();
        
                var nqty=(nv*1)+parseFloat(qty_rcvd);
               // console.log(nqty);
                if (nqty>0 ) tmc.numberspinner('setValue',jc/nqty);
          }
        }
            
      //}


    }
  })
})
