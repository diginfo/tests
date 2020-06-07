/*
  TODO
  1. Possible create customer-based upload definitions.
  2. Or define the definition ID in the Part Master ?
  
*/

const cl = console.log

dynjs('/js/xlsx.core.js');

$('#bomval').linkbutton({
  size: 'small',
  onClick: function(){
    var dg=$('#boms');
    ajaxget('/',{
      _sqlid  : 'inv^partbom_vali',
      _func   : 'put',   
      PART_ID : $('#ID').textbox('getValue')
    },function(res){
      dg.datagrid('reload');
      var rows  = dg.datagrid('getRows');
      $.each(rows, function(i, e){
        if(e.EXIST=='Y'){
          //console.log(e);
          ajaxget("/",{_func:'get',_sqlid:'inv^partall','ID':e.ITEM_ID},(res)=>{
            if(res.BAL_QTY=="") e.QOH=0;
            else e.QOH=res.BAL_QTY;
            //console.log(i,e);
            dg.datagrid('updateRow',{ index:i, row:e})
          })
          
        }
        else e.QOH="-";
      });

      msgbox(res.msg);
    });
  }
})


$('#qoh').linkbutton({
  size: 'small',
  onClick: function(){
    var dg=$('#boms');
    
    var rows  = dg.datagrid('getRows');
    $.each(rows, function(i, e){
      if(e.EXIST=='Y'){
        //console.log(e);
        ajaxget("/",{_func:'get',_sqlid:'inv^partall','ID':e.ITEM_ID},(res)=>{
          if(res.BAL_QTY=="") e.QOH=0;
          else e.QOH=res.BAL_QTY;
          //console.log(i,e);
          dg.datagrid('updateRow',{ index:i, row:e})
        })
        
      }
      else e.QOH="-";
    });
  }
})

$('#xlbom').filebox({
  multiple: false,
  buttonText: 'Select',
  buttonAlign: 'right',
  buttonIcon: 'icon-xls',
  onChange: function(nv,ov){
    $(this).textbox('textbox')[0].value = nv.replace("C:\\fakepath\\", "");
    var f = $(this).data('filebox').filebox.children('input[type=file]')[0].files[0];

    var name = f.name;
    if((/\.xls|\.xlsx/).test(name)){
      var reader = new FileReader();
      reader.onload = dwap.page.xlbom;        
      reader.readAsArrayBuffer(f);
    }
    else msgbox('Excel Files Only.')
  } 
})

dwap.page.xlbom = function(evt){
  
  function clear(){
    try{$('#xlbom').filebox('clear')}
    catch(err){}
  }
  
  function getItems(ws,row){
    const cols = {
      'E'   : 'NO',
      'G'   : 'ID',
      'M'   : 'REV',
      'N'   : 'DESC',
      'AD'  : 'QTY',
      'AE'  : 'UOM'
    };
  
    // loop rows starting from (row)
    var done = false;
    do {
      
      // loop columns
      var rowdat = {}
      for(var col in cols){
        var cid = `${col}${row}`;
        var cell = ws[cid];
        if(cell && cell.v){
          if(cell.v == last) {done = true; break;}
          else rowdat[cols[col]] = cell.v;
        }
      }
      if(rowdat.ID) data.items.push(rowdat)
      row++;
    }
    while (!done); 
    
    clear();
    
    // Basic Validation
    var id = $('#ID').textbox('getValue');
    if(!data.ID || id != data.ID) return msgbox(`Selected file is not for this part.`)
    
    // Upload the Data
    ajaxget('/',Object.assign(data,{
      _sqlid  : 'inv^partbom',
      _func   : 'put',        
    }),function(res){
      $('#boms').datagrid('reload');
      if(!res.error) msgbox(`${data.ID} uploaded ${data.items.length} items.`);
      else msgbox(res.msg);
    });
    
  }
  
  function head(){
    var cells = {
      'M3'    : 'ID',
      'X3'    : 'REV',
      'AC3'   : 'REV_DATE',
      'A9'    : 'DESCRIPTION',
    }
    for(var cid in cells){
      var cell = ws[cid];
      var fid = cells[cid]; 
      if(cell) data[fid] = cell.v;
    }
    
  }
  
  // Find Start Row
  function items(){
    var row = 1;
    while (row < maxrow) {
      var srow = null;
      var cid = `A${row}`; 
      var cell = ws[cid];
      row++;
      if( row > maxrow || cell && cell.v == start){
        return getItems(ws,row+1)
      }
    }
  }

  // Main Code
  const maxrow = 200;
  const start = 'List Of Items';
  const last = 'END';
  var data = {items:[]};

  var wb = XLSX.read(evt.target.result, {type: 'binary'});
  var sht0 = wb.SheetNames[0];
  var ws = wb.Sheets[sht0];
  
  head();
  items();
  
}