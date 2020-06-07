dwap.page.valid = function(ok){
  var butgo=$('#butgo'), gid=$('#GEN_ID');
  if(ok) {
    butgo.linkbutton('enable');
    gid.addClass('test');
  } else {
    butgo.linkbutton('disable');
    gid.removeClass('test');
  }
}

dwap.page.genselect = function(gco,combos){
  
  var bh = {
    prefixSuffix: dwap.bhave.prefixSuffix || '',
    suffixPrefix: dwap.bhave.suffixPrefix || '',
    padsep: dwap.bhave.padsep || 'n',
    descnull: dwap.bhave.descnull || '---N/A---',
    idnull: dwap.bhave.idnull || '<>',
  }

  gco.gendata = {
    id: clone(gco.ids),
    desc: clone(gco.descs),
    uom:'EA',
    idset:[0],    /* CLASS-PREFIX=0 */
    descset:[0]   /* CLASS-PREFIX=0 */
  }

  $.each(combos,function(){
    var cbo = $(this); 
    var rec = cbo.combobox('getRec');
    var opt = cbo.combobox('options');
    if(!rec) nulls = true;
    else {
      
      // ID
      var idx = gco.ids.indexOf(opt.type_id);
      gco.gendata.idset.push(idx);
      if(rec.value == bh.idnull) gco.gendata.id[idx]='';
      else gco.gendata.id[idx] = rec.value;
      
      // UOM Generator
      //PAC 170731 - Temporary Fix for MATERIAL Class.
      if(gco.class_id=='MATERIAL') gco.gendata.uom = 'IN'; 
      else if(opt.type_id=='LENGTH'){
        if(rec.text.toLowerCase().indexOf('per')==0){
          var bits = rec.text.split(/^per */i);
          if(bits.length==2) gco.gendata.uom=bits[1].toUpperCase();
        }
      }
      
      // Description (Prefix & Suffix & Seperator Padding)
      var idx = gco.descs.indexOf(opt.type_id);
      gco.gendata.descset.push(idx);
      var text = rec.text.trim();
      if(text == bh.descnull) return gco.gendata.desc[idx]='';
      var ps = gco.types[opt.type_id];
      
      var pad = {n:{p:'',s:''},b:{p:' ',s:' '},l:{p:' ',s:''},r:{p:'',s:' '},}[bh.padsep];
      if(ps[0]=='PREFIX') text = [pad.p,ps[1],bh.prefixSuffix,rec.text,pad.s].join('');
      else if(ps[0]=='SUFFIX') text = [pad.p,rec.text,bh.suffixPrefix,ps[1],pad.s].join('');
      //cl('['+text+']')
      gco.gendata.desc[idx] = text;
      
    } 
    
  })
  
  // ONLY display bits that have been selected.
  var pid='',pdesc='';
  gco.gendata.id.map(function(e,i){if(gco.gendata.idset.indexOf(i)>-1) pid+=e.toUpperCase()})
  gco.gendata.desc.map(function(e,i){if(gco.gendata.descset.indexOf(i)>-1) pdesc+=e})
  
  $('#GEN_ID').textbox('setValue',pid); 
  $('#GEN_DESC').textbox('setValue',pdesc);
  $('#GEN_UOM').textbox('setValue',gco.gendata.uom);
  
  dwap.page.valid($('form#generator').form('validate'));

}

$( document ).ready(function() {
  
  $('#GEN_CLASS_ID').combobox({
  
    ids:[],
    descs:[],
  
    url:'/',
    queryParams:{
      _sqlid: 'inv^pn_partclass',
      _func: 'get'  
    },
    
    loadFilter:function(data){
      data.map(function(e){
        e.text = e.CLASS_ID;
        e.value = e.CLASS_ID;    
      }); return data;  
    },
    
    onSelect:function(rec){
      //console.log(rec);
      var cbo = $(this);
      var opt = cbo.combobox('options');
      opt.class_id = rec.value;
      
     
      
      // Initialise
      $('form#results').form('clear');
      $('#GEN_TRACEABLE').combobox('setValue',rec.TRACEABLE);
      dwap.page.valid(false);
      $('form#generator.hide').removeClass('hide');
  
      ajaxget('/',{
        _sqlid:'inv^pn_gendata',
        _func: 'get',
        CLASS_ID: rec.value
      },function(res){

        var form = $('form#generator'); 
        form.empty();
  
        // Don't continue if no params.
        if(res.param.length==0) return alert('No parameters for '+rec.value);
  
        opt.descs = res[rec.value].descs;
        opt.ids = res[rec.value].ids;  
        opt.types = res[rec.value].types; 
    
        var list=[], els=[];
        res.param.map(function(row){
          // create a new combobox.
          var idx = list.indexOf(row.TYPE_ID);
          if(idx<0) {
            list.push(row.TYPE_ID);
            idx = -1+ els.push({
              'label': row.TYPE_ID.toLowerCase(),
              'type': 'combobox',
              'data-options':{
                data:[],
                type_id:row.TYPE_ID,
                editable:false,
                required:true
              }
            })
          }
          
          // push values to combobox.
          els[idx]['data-options'].data.push({
            text: row.PARA_ID,
            value: row.CODE_STR  
          })
        });
  
        var win = $('#pngenwin');
        var cols = 1, width=410;
        if(els.length > 5) {cols=2;width=780;} 
        form.css('column-count',cols);
        dynadd(form,els);
        if(win.length > 0) win.window('resize',{width:width});

        var combos = form.find('input.combobox-f');
        $.each(combos,function(){$(this).combobox('options').onSelect=function(){dwap.page.genselect(opt,combos)}}) 
      })    
    }
  })
  
  $('#butgo').linkbutton({
    text: 'Apply',
    iconCls:"icon-tick",
    disabled:true,
    onClick: function(){ 
      var data = $('#GEN_CLASS_ID').combobox('options').gendata;
      var idc = $('#ID');
      if(idc.length > 0) {
        try {
          idc.textbox('readonly',true);        
          idc.textbox('setValue',data.id.join('').toUpperCase());
          $('#DESCRIPTION').textbox('setValue',data.desc.join(''));
          $('#UOM_ID').combobox('select',data.uom);

          var trc=$('#GEN_TRACEABLE').combobox('getValue');
          $('#TRACEABLE').combobox('setValue',trc);
          $('#TRACEABLE').combobox('readonly',true);
          $('#pngenwin').window('close');
        } catch(err){alert('Error adding part info.')}
      }
      else msgbox(data.id.join('')+'<br/><br/>'+data.desc.join(''));
    } 
  })

  $('#GEN_ID').textbox(); 
  $('#GEN_DESC').textbox();
  $('#GEN_UOM').textbox();
  $('#GEN_TRACEABLE').combobox();
  $('#butcancel').linkbutton({
    text: 'Cancel',
    iconCls:"icon-cancel",
    onClick: reload
  })

})
