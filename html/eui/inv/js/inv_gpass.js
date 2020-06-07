//load Data
dwap.page.loadData=function(data){
$('#gplines').datagrid('load',{_func:'get', _sqlid:'inv^gplines',_dgrid:'y',GP_ID:data.GP_ID});
$('#GP_TYPE').textbox('readonly');
$('#GP_TYPE_ID').textbox('readonly');
$('#GP_DATE').datebox('readonly');
$('#TX_TYPE').combobox('readonly');

butEn('adx');

//if GP_ID was selected, enabeld the datagrid add button
$('#gplines').datagrid('options').tbar.dgre_add.linkbutton('enable'); 

//based on selected GP_TYPE to populate correct DOC_TYPE
var gptype=$('#GP_TYPE').combobox('getValue');
var doctype={'C':'SO','V':'WO'}[gptype];    
var doc=[{value:doctype,text:doctype},{value:'NIL',text:'NIL'}];
    //prevent user click on DocID if DocType not selected
    

var dgDocType=$('#_dgform > form input[textboxname=DOC_TYPE');
var qbeDocId=$('#_dgform > form input[textboxname=DOC_ID');
qbeDocId.textbox('readonly',true);
dgDocType.combobox('loadData',doc);
dgDocType.combobox({
    onSelect:function(rec){
    if (rec.value=='NIL') {
        qbeDocId.textbox('readonly');
        qbeDocId.textbox('required',false);
    }
    else {
        qbeDocId.textbox('readonly',false);
        qbeDocId.textbox('required',true);
        if (rec.value=='SO') {
        qbeDocId.qbe('options').queryParams._sqlid='sales^sor_qbe';
        qbeDocId.qbe('options').queryParams.CUST_ID=$('#GP_TYPE_ID').combobox('getValue');
        }
        else {
        qbeDocId.qbe('options').queryParams._sqlid='inv^gp_opnrefs_qbe';
        if (qbeDocId.qbe('options').queryParams.CUST_ID) delete qbeDocId.qbe('options').queryParams.CUST_ID
        }
        qbeDocId.qbe('options').dlog.dg.datagrid('reload');
    }
                
    }
})
}
dwap.page.opts = {
twoColumns: true,
editor: 'form',
rownumbers: false,
fitColumns: true,
fit: true,
url: '/',
queryParams:{
    _sqlid:'inv^gplines',
    _func:'get',
    _dgrid:'y'
},
addData:{
    LINE_NO: '$autonum:1',
    GP_ID: '#GP_ID'
},
columns:[[
    {field:'GP_ID',hidden:true},
    {field:'LINE_NO',title:'#',width:40,fixed:true,align:'center'},
    {field:'DOC_TYPE',title:'Doc Type',width:70,fixed:true,editor:{
        type:'combobox',
        options:{
        panelHeight:'auto',
        editable:false,
        required:true
        },
    }},

    {field:'DOC_ID',title:'Doc ID',width:120,fixed:true,editor:{
        type:'qbe',options:{
            queryParams:{
                _sqlid:''
            },
            readonly:true,
            onDemand: true,
            multiCol: true,

            fields:[
            {field:'value',title:'Doc ID',width:80,fixed:true},
            {field:'STATUS',title:'Status',editor:{type:'combobox',options:{
                panelHeight: 'auto',
                editable:false,
                data:[
                {value:'H',text:'On Hold'},
                {value:'R',text:'Released', selected:true},
                {value:'C',text:'Closed'},
            ]}}},
            {field:'QTY',title:'Qty',width:50,fixed:true},
            {field:'GATEPASS_QTY',title:'Gatepass Qty',width:50,fixed:true},
            {field:'PART_ID',title:'Part ID',width:100,fixed:true},
            {field:'PART_DESCRIPTION',title:'Part Desc',width:150,fixed:true},
            {field:'CUST_PART_ID',title:'Cust Part Ref',width:100,fixed:true},
            {field:'USER_1',title:'Cust Prod Order #',width:150,fixed:true},
            ],
            onSelect:function(rec){
            $('#_dgform > form input[textboxname=PART_ID').textbox('setValue',rec.PART_ID);
            $('#_dgform > form input[textboxname=PART_DESCRIPTION').textbox('setValue',rec.PART_DESCRIPTION);

            var dgDocType=$('#_dgform > form input[textboxname=DOC_TYPE');
            switch (dgDocType.combobox('getValue')){
                case 'SO':
                    var txType=$('#TX_TYPE').combobox('getValue');
                    var docId=rec.text;
                    if (txType=='S')var docQty=rec.QTY-rec.GATEPASS_QTY;
                    else var docQty=rec.GATEPASS_QTY;

                    $('#_dgform > form input[textboxname=DOC_ID').textbox('setValue',docId);
                    $('#_dgform > form input[textboxname=QTY').numberspinner('set',{'min':0,'max':docQty});
                    $('#_dgform > form input[textboxname=BAL_QTY').numberbox('setValue',docQty);

                    $('#_dgform > form input[textboxname=BAL_QTY').numberbox('setValue',docQty);
                    $('#_dgform > form input[textboxname=CUST_PROD_ORDER_NO').textbox('setValue',rec.USER_1);
                    $('#_dgform > form input[textboxname=CUST_PART_ID').textbox('setValue',rec.CUST_PART_ID);
                    
                    
                    break;
                case 'WO':
                    var docId=rec.text;
                    var JobId=docId.split('^');
                    var docId1=JobId.join('.');
                    ajaxget('/',{_func:'get',_sqlid:'vwltsa^sub', WOREF:JobId[0]+'^'+JobId[1]},function(rs){
                    var txType=$('#TX_TYPE').combobox('getValue');
                    if (txType=='S')var docQty=rs.DESIRED_QTY-rs.GATEPASS_QTY;
                    else var docQty=rs.GATEPASS_QTY;

                    $('#_dgform > form input[textboxname=DOC_ID').textbox('setValue',docId1);
                    $('#_dgform > form input[textboxname=QTY').numberspinner('set',{'min':0,'max':docQty});
                    $('#_dgform > form input[textboxname=BAL_QTY').numberbox('setValue',docQty);
                    });
                    break;
                case 'NIL':
                    break;

            }


            }
        }

    }},
    {field:'PART_ID',title:'Our Part ID',width:160,fixed:true,editor:{type:'qbe',options:{
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
            {field:'UOM_ID',title:'UOM'},
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

            $('#_dgform > form input[textboxname=PART_DESCRIPTION').textbox('setValue',rw.DESCRIPTION);  
            $('#_dgform > form input[textboxname=PART_UOM').textbox('setValue',rw.UOM_ID);    
        }  
        }}
    },

    {field:'PART_UOM',title:'Part UOM',width:30,editor:{type:'textbox',options:{readonly:true}},coloff:true},
    {field:'CUST_PART_ID',title:'Cust Part Ref',width:100,editor:'text',coloff:true},
    {field:'CUST_PROD_ORDER_NO',title:'Cust Prod Order #',width:100,editor:'text',coloff:true},
    {field:'QTY',title:'Qty Reqd',width:60,fixed:true,align:'center',editor:{type:'numberspinner',options:{
    precision:2,
    min:0,
    required:true
    }}},
    {field:'BAL_QTY',title:'Bal Qty',width:60,fixed:true,align:'center',editor:{type:'numberbox',options:{ precision:2,readonly:true}}},
    {field:'PART_DESCRIPTION',title:'Our Part Description',width:250,fixed:true,editor:{type:'textbox',options:{readonly:false,multiline:true,height:150,}},coloff:true},

    ]],

onRowContextMenu: function(e){return e.preventDefault()},
onBeforeLoad:function(qp){
    if(!qp.GP_ID) return false; 
    },
loadFilter: function(data){
    if(!data || (!data.rows && data.length==0)) data = {rows:[],total:0}
    return data;
},
onEndEdit: function(idx,row,chg){
    
    var url = "/?_sqlid=inv^gpline";
    var data = clone(row);
    ajaxget(url,data,function(data){}) 
},
onSelect:function(idx,row){
    if (row.DOC_ID)	$(this).datagrid('options').tbar.dgre_edit.linkbutton('disable');
}
}


//$('#gplines').datagrid('editButs',{edit:'hide'})
$('#GP_ID').qbe({defid:'gatepass_ids' });

$('#GP_TYPE').combobox({
editable: false,
panelHeight: 'auto',
data:[
    {text:'CUSTOMER',value:'C'},
    {text:'VENDOR',value:'V'}
],

onSelect:function(rec){
    //console.log(rec);
    var cv = $('#GP_TYPE_ID');
    cv.combobox('clear');
    cv.combobox('options').queryParams._sqlid = {'C':'sales^custid','V':'inv^vendorid'}[rec.value];
    cv.combobox('reload');
}         

})

$('#GP_TYPE_ID').combobox({
url           : '/',
editable      : false,
panelHeight   : 200,
queryParams   : {
    _sqlid      : '',
    _func       : 'get',
    _combo      : 'y',
},

onBeforeLoad:function(qp){
    if(!qp._sqlid) return false;  
},

onSelect:function(rec){
    var cvall = $(this).combobox('options').queryParams._sqlid.replace(/id$/,'all');
    ajaxget('/',{
        _sqlid  : cvall,
        _func   : 'get',
        ID      : rec.value
    },function(fields){
        // console.log(fields);
        for(var id in fields) $('input[textboxname='+id+']').textbox('setValue',fields[id]);
    })  
}
})

// $('#gplines').datagrid('options').tbar.dgre_edit.linkbutton('disable'); 
$('#gplines').datagrid('rowEditor',dwap.page.opts).datagrid('columns',$('#dgre_tb'));
$('#gplines').datagrid('options').tbar.dgre_add.linkbutton('disable');
$('#gplines').datagrid('options').tbar.dgre_edit.linkbutton('disable');  


$('#but_add').on('done',function(){
//empty the datagrid
$('#gplines').datagrid('loadData',{"total":0,"rows":[]});
$('#GP_TYPE').textbox('readonly',false);
$('#GP_TYPE_ID').textbox('readonly',false);
$('#GP_DATE').datebox('readonly',false);
$('#TX_TYPE').combobox('readonly',false);

var gp=$('#GP_ID');
gp.textbox('required',false);
gp.textbox('readonly',true);

butEn('x');
$('#gplines').datagrid('options').tbar.dgre_add.linkbutton('disable'); 
})

//empty the datagrid when delete the GP head and GPL
$('#but_del').on('done',function(){
$('#gplines').datagrid('loadData',{"total":0,"rows":[]});
$('#gplines').datagrid('options').tbar.dgre_add.linkbutton('disable'); 
})
$('form#gphead').on('loadDone',function(jq,data){
if(!data.GP_ID) return;
dwap.page.loadData(data);
}).on('changed',function(jq,data){

    var opts = $(this).form('options');
    if(!opts.loading) {
    butEn('sadx');
    } 
}).on('success',function(data){

$('#gplines').datagrid('options').tbar.dgre_add.linkbutton('enable');  
}).on('done',function(data){
if(!data) data={GP_ID:$('#GP_ID').texbox('getValue')};
dwap.page.loadData(data);
})