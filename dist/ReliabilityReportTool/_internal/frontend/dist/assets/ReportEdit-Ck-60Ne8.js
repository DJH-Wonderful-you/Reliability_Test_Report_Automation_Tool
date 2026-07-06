import{_ as nt,u as st,w as ut,r as $,c as H,o as N,a as i,b as e,d as a,e as y,F as ct,f as pt,g as at,h as it,t as mt,n as ft,i as _,j as h,k as vt,p as X,l as Q,m as tt,q as G,s as gt,v as yt,x as xt,E as p,y as S,z as Z}from"./index-Bm3r0u4s.js";import{D as et,a as lt,b as wt,n as bt,i as _t,c as ht,g as Rt}from"./textFormat-CkPnkL0z.js";const It={class:"format-toolbar"},Ct={class:"toolbar-group"},Tt={class:"toolbar-group"},Bt={class:"toolbar-group"},$t={class:"toolbar-group"},zt={class:"toolbar-group"},St={class:"toolbar-info"},kt={key:0,class:"selected-info"},ot="center",Dt={__name:"Toolbar",setup(rt){const d={template:'<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h18v2H3V3zm0 8h12v2H3v-2zm0 8h18v2H3v-2zm0-4h12v2H3v-2z"/></svg>'},x={template:'<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h18v2H3V3zm3 8h12v2H6v-2zm-3 8h18v2H3v-2zm3-4h12v2H6v-2z"/></svg>'},E={template:'<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h18v2H3V3zm6 8h12v2H9v-2zm-6 8h18v2H3v-2zm6-4h12v2H9v-2z"/></svg>'},C=st(),R=y("Microsoft YaHei"),I=y(11),z=y("#000000"),v=y(!1),g=y(!1),F=y(!1),D=y("left"),j=[8,9,10,11,12,14,16,18,20,22,24,28,32,36,48],P=it(()=>C.selectedFields.length),q=T=>{var B;const s=C.getReportFieldFormat?C.getReportFieldFormat(T):C.getFieldFormat(T),f=document.querySelector(`[data-field-id="${T}"]`);if(!f)return{fontFamily:(s==null?void 0:s.fontFamily)||wt,fontSize:(s==null?void 0:s.fontSize)||lt,fontColor:et,isBold:!1,isItalic:!1,isUnderline:!1,textAlign:(s==null?void 0:s.textAlign)||ot};const w=window.getComputedStyle(f),A=f.classList.contains("placeholder");return{fontFamily:(s==null?void 0:s.fontFamily)||Rt(w.fontFamily),fontSize:(s==null?void 0:s.fontSize)||parseInt(w.fontSize,10)||lt,fontColor:A?et:ht(w.color),isBold:!A&&_t(w.fontWeight),isItalic:!A&&w.fontStyle==="italic",isUnderline:!A&&((B=w.textDecoration)==null?void 0:B.includes("underline")),textAlign:bt(w.textAlign,(s==null?void 0:s.textAlign)||ot)}};ut(()=>C.selectedFields,T=>{T.length>0&&ft(()=>{const s=T[0],f=q(s);R.value=f.fontFamily,I.value=f.fontSize,z.value=f.fontColor,v.value=f.isBold,g.value=f.isItalic,F.value=f.isUnderline,D.value=f.textAlign})},{deep:!0});const k=()=>{window.dispatchEvent(new CustomEvent("format-change",{detail:{fontFamily:R.value,fontSize:I.value,color:z.value,fontWeight:v.value?"bold":"normal",fontStyle:g.value?"italic":"normal",textDecoration:F.value?"underline":"none",textAlign:D.value}}))},Y=()=>{v.value=!v.value,k()},K=()=>{g.value=!g.value,k()},W=()=>{F.value=!F.value,k()},L=T=>{D.value=T,k()};return(T,s)=>{const f=$("el-option"),w=$("el-select"),A=$("el-color-picker"),B=$("el-button"),O=$("el-button-group"),U=$("el-icon");return N(),H("div",It,[i("div",Ct,[s[6]||(s[6]=i("span",{class:"toolbar-label"},"字体：",-1)),e(w,{modelValue:R.value,"onUpdate:modelValue":s[0]||(s[0]=l=>R.value=l),size:"small",style:{width:"140px"},onChange:k},{default:a(()=>[e(f,{label:"微软雅黑",value:"Microsoft YaHei"}),e(f,{label:"宋体",value:"SimSun"}),e(f,{label:"黑体",value:"SimHei"}),e(f,{label:"楷体",value:"KaiTi"}),e(f,{label:"仿宋",value:"FangSong"}),e(f,{label:"Arial",value:"Arial"}),e(f,{label:"Times New Roman",value:"Times New Roman"})]),_:1},8,["modelValue"])]),i("div",Tt,[s[7]||(s[7]=i("span",{class:"toolbar-label"},"字号：",-1)),e(w,{modelValue:I.value,"onUpdate:modelValue":s[1]||(s[1]=l=>I.value=l),size:"small",style:{width:"80px"},onChange:k},{default:a(()=>[(N(),H(ct,null,pt(j,l=>e(f,{key:l,label:l,value:l},null,8,["label","value"])),64))]),_:1},8,["modelValue"])]),i("div",Bt,[s[8]||(s[8]=i("span",{class:"toolbar-label"},"颜色：",-1)),e(A,{modelValue:z.value,"onUpdate:modelValue":s[2]||(s[2]=l=>z.value=l),size:"small",onChange:k},null,8,["modelValue"])]),i("div",$t,[e(O,{size:"small"},{default:a(()=>[e(B,{type:v.value?"primary":"",onClick:Y},{default:a(()=>[...s[9]||(s[9]=[i("strong",null,"B",-1)])]),_:1},8,["type"]),e(B,{type:g.value?"primary":"",onClick:K},{default:a(()=>[...s[10]||(s[10]=[i("em",null,"I",-1)])]),_:1},8,["type"]),e(B,{type:F.value?"primary":"",onClick:W},{default:a(()=>[...s[11]||(s[11]=[i("u",null,"U",-1)])]),_:1},8,["type"])]),_:1})]),i("div",zt,[s[12]||(s[12]=i("span",{class:"toolbar-label"},"对齐：",-1)),e(O,{size:"small"},{default:a(()=>[e(B,{type:D.value==="left"?"primary":"",onClick:s[3]||(s[3]=l=>L("left"))},{default:a(()=>[e(U,null,{default:a(()=>[e(d)]),_:1})]),_:1},8,["type"]),e(B,{type:D.value==="center"?"primary":"",onClick:s[4]||(s[4]=l=>L("center"))},{default:a(()=>[e(U,null,{default:a(()=>[e(x)]),_:1})]),_:1},8,["type"]),e(B,{type:D.value==="right"?"primary":"",onClick:s[5]||(s[5]=l=>L("right"))},{default:a(()=>[e(U,null,{default:a(()=>[e(E)]),_:1})]),_:1},8,["type"])]),_:1})]),s[14]||(s[14]=i("div",{class:"toolbar-spacer"},null,-1)),i("div",St,[P.value>0?(N(),H("span",kt," 已选择 "+mt(P.value)+" 个字段 ",1)):at("",!0),s[13]||(s[13]=i("span",{class:"selection-hint"},"Ctrl+点击多选 | Shift+拖拽框选",-1))])])}}},At=nt(Dt,[["__scopeId","data-v-41ec518e"]]),Vt={class:"report-edit-layout"},Et={class:"report-sidebar"},Ft={class:"sidebar-section"},Mt={class:"action-buttons"},Lt={class:"sidebar-section"},Ut={class:"row-operations"},Ht={class:"operation-group"},Nt={class:"operation-row"},Pt={class:"operation-row"},Ot={class:"operation-row"},jt={class:"operation-row"},qt={class:"operation-group"},Yt={class:"operation-row"},Kt={class:"operation-row"},Wt={class:"operation-row"},Xt={class:"operation-row"},Gt={class:"sidebar-section"},Zt={class:"action-buttons"},Jt={class:"report-content"},Qt={__name:"ReportEdit",setup(rt){const d=st(),x=y(null),E=y(1),C=y(1),R=y(1),I=y(1),z=y(!1),v=y({x:0,y:0}),g=y({x:0,y:0}),F=it(()=>{const l=Math.min(v.value.x,g.value.x),t=Math.min(v.value.y,g.value.y),c=Math.abs(g.value.x-v.value.x),n=Math.abs(g.value.y-v.value.y);return{left:`${l}px`,top:`${t}px`,width:`${c}px`,height:`${n}px`}}),D=l=>{if(!l.shiftKey||l.target.closest(".editable-field")||l.target.closest(".format-toolbar")||l.target.closest(".row-controls")||l.target.closest(".el-button"))return;const t=x.value.getBoundingClientRect();v.value={x:l.clientX-t.left+x.value.scrollLeft,y:l.clientY-t.top+x.value.scrollTop},g.value={...v.value},z.value=!0,!l.ctrlKey&&!l.metaKey&&d.clearSelection()},j=l=>{if(!z.value)return;const t=x.value.getBoundingClientRect();g.value={x:l.clientX-t.left+x.value.scrollLeft,y:l.clientY-t.top+x.value.scrollTop}},P=()=>{if(!z.value)return;const l=Math.min(v.value.x,g.value.x),t=Math.min(v.value.y,g.value.y),c=Math.max(v.value.x,g.value.x),n=Math.max(v.value.y,g.value.y);if(c-l>10&&n-t>10){const u=x.value.getBoundingClientRect();x.value.querySelectorAll(".editable-field").forEach(r=>{const m=r.getBoundingClientRect(),M=m.left-u.left+x.value.scrollLeft,V=m.top-u.top+x.value.scrollTop,b=M+m.width,dt=V+m.height;if(M<c&&b>l&&V<n&&dt>t){const J=r.dataset.fieldId||r.getAttribute("field-id");J&&d.selectField(J,!0)}})}z.value=!1},q=()=>{d.exportPdf()},k=()=>{if(E.value<1){p.warning("请输入有效的行数");return}d.addTestResultRows(E.value),p.success(`已批量添加 ${E.value} 行测试结果`)},Y=()=>{if(C.value<1){p.warning("请输入有效的行数");return}d.addTestImageRows(C.value),p.success(`已批量添加 ${C.value} 行测试图片`)},K=async()=>{const l=d.testResultRows.length;if(l<=1){p.warning("至少保留一行");return}if(R.value>=l){p.warning("删除行数不能超过总行数减一");return}try{await S.confirm(`确定要从末尾删除 ${R.value} 行吗？此操作不可撤销！`,"确认删除",{confirmButtonText:"确定删除",cancelButtonText:"取消",type:"warning"});const t=l-R.value;d.testResultRows.splice(t,R.value),d.markDirty(),p.success(`已从末尾删除 ${R.value} 行`)}catch{}},W=async()=>{const l=d.testImageRows.length;if(l<=1){p.warning("至少保留一行");return}if(I.value>=l){p.warning("删除行数不能超过总行数减一");return}try{await S.confirm(`确定要从末尾删除 ${I.value} 行吗？此操作不可撤销！`,"确认删除",{confirmButtonText:"确定删除",cancelButtonText:"取消",type:"warning"});const t=l-I.value;d.testImageRows.splice(t,I.value),d.markDirty(),p.success(`已从末尾删除 ${I.value} 行`)}catch{}},L=async()=>{try{const l=d.testResultRows.length,t=`
      <div>
        <p>在指定位置插入行：</p>
        <div style="margin: 15px 0;">
          <label>在第 
            <input type="number" id="insertResultPosition" min="1" max="${l}" value="1" 
                   style="width: 60px; padding: 4px; border: 1px solid #dcdfe6; border-radius: 4px; margin: 0 5px;">
          行后插入
          </label>
        </div>
        <div style="margin: 15px 0;">
          <label>插入数量：
            <input type="number" id="insertResultCount" min="1" max="20" value="1" 
                   style="width: 60px; padding: 4px; border: 1px solid #dcdfe6; border-radius: 4px; margin-left: 5px;">
          </label>
        </div>
        <p style="color: #909399; font-size: 12px;">
          当前行数：${l} 行
        </p>
      </div>
    `,{value:c}=await S.confirm(t,"指定位置插入行",{dangerouslyUseHTMLString:!0,confirmButtonText:"插入",cancelButtonText:"取消",type:"info"}),n=document.getElementById("insertResultPosition"),u=document.getElementById("insertResultCount"),o=parseInt(n==null?void 0:n.value)||1,r=parseInt(u==null?void 0:u.value)||1;if(o<1||o>l){p.error("插入位置无效");return}if(r<1||r>20){p.error("插入数量无效");return}const m=o,M=d.testResultRows.length>0?Math.max(...d.testResultRows.map(b=>b.id)):0,V=[];for(let b=0;b<r;b++)V.push({id:M+b+1,appearance:"",function:"",other:"",conclusion:"",note:""});d.testResultRows.splice(m,0,...V),d.markDirty(),p.success(`已在第 ${o} 行后插入 ${r} 行`)}catch{}},T=async()=>{try{const l=d.testImageRows.length,t=`
      <div>
        <p>在指定位置插入行：</p>
        <div style="margin: 15px 0;">
          <label>在第 
            <input type="number" id="insertImagePosition" min="1" max="${l}" value="1" 
                   style="width: 60px; padding: 4px; border: 1px solid #dcdfe6; border-radius: 4px; margin: 0 5px;">
          行后插入
          </label>
        </div>
        <div style="margin: 15px 0;">
          <label>插入数量：
            <input type="number" id="insertImageCount" min="1" max="10" value="1" 
                   style="width: 60px; padding: 4px; border: 1px solid #dcdfe6; border-radius: 4px; margin-left: 5px;">
          </label>
        </div>
        <p style="color: #909399; font-size: 12px;">
          当前行数：${l} 行
        </p>
      </div>
    `,{value:c}=await S.confirm(t,"指定位置插入行",{dangerouslyUseHTMLString:!0,confirmButtonText:"插入",cancelButtonText:"取消",type:"info"}),n=document.getElementById("insertImagePosition"),u=document.getElementById("insertImageCount"),o=parseInt(n==null?void 0:n.value)||1,r=parseInt(u==null?void 0:u.value)||1;if(o<1||o>l){p.error("插入位置无效");return}if(r<1||r>10){p.error("插入数量无效");return}const m=o,M=d.testImageRows.length>0?Math.max(...d.testImageRows.map(b=>b.id)):0,V=[];for(let b=0;b<r;b++)V.push({id:M+b+1,before:Z(),during:Z(),after:Z()});d.testImageRows.splice(m,0,...V),d.markDirty(),p.success(`已在第 ${o} 行后插入 ${r} 行`)}catch{}},s=async()=>{try{const l=d.testResultRows.length;if(l<=1){p.warning("至少保留一行");return}const t=`
      <div>
        <p>选择删除方式（至少保留一行）：</p>
        
        <div style="margin: 15px 0;">
          <strong>方式一：复选框选择</strong>
          <div style="max-height: 150px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin-top: 5px;">
            ${Array.from({length:l},(o,r)=>`
              <label style="display: block; margin: 3px 0;">
                <input type="checkbox" name="deleteRows" value="${r}" style="margin-right: 8px;">
                第 ${r+1} 行
              </label>
            `).join("")}
          </div>
        </div>
        
        <div style="margin: 15px 0;">
          <strong>方式二：输入行号范围</strong>
          <div style="margin-top: 5px;">
            <input type="text" id="rangeInput" placeholder="例如：3-7 或 2,5,8" 
                   style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px;">
            <div style="font-size: 12px; color: #909399; margin-top: 5px;">
              支持格式：单个数字(5)、范围(3-7)、逗号分隔(2,5,8)、混合(1,3-5,8)
            </div>
          </div>
        </div>
        
        <p style="margin-top: 15px; color: #f56c6c; font-size: 12px;">
          ⚠️ 警告：此操作不可撤销！
        </p>
      </div>
    `,{value:c}=await S.confirm(t,"批量删除测试结果行",{dangerouslyUseHTMLString:!0,confirmButtonText:"删除选中行",cancelButtonText:"取消",type:"warning"});let n=[];const u=document.querySelectorAll('input[name="deleteRows"]:checked');if(n=Array.from(u).map(o=>parseInt(o.value)),n.length===0){const o=document.getElementById("rangeInput"),r=o==null?void 0:o.value.trim();if(r&&(n=w(r,l),n.length===0)){p.error("输入的行号格式不正确或超出范围");return}}if(n.length===0){p.info("未选择任何行");return}if(n.length>=l){p.warning("不能删除所有行，至少保留一行");return}n.sort((o,r)=>r-o);for(const o of n)d.testResultRows.splice(o,1);d.markDirty(),p.success(`已删除 ${n.length} 行`)}catch{}},f=async()=>{try{const l=d.testImageRows.length;if(l<=1){p.warning("至少保留一行");return}const t=`
      <div>
        <p>选择删除方式（至少保留一行）：</p>
        
        <div style="margin: 15px 0;">
          <strong>方式一：复选框选择</strong>
          <div style="max-height: 150px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin-top: 5px;">
            ${Array.from({length:l},(o,r)=>`
              <label style="display: block; margin: 3px 0;">
                <input type="checkbox" name="deleteImageRows" value="${r}" style="margin-right: 8px;">
                第 ${r+1} 行
              </label>
            `).join("")}
          </div>
        </div>
        
        <div style="margin: 15px 0;">
          <strong>方式二：输入行号范围</strong>
          <div style="margin-top: 5px;">
            <input type="text" id="imageRangeInput" placeholder="例如：3-7 或 2,5,8" 
                   style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px;">
            <div style="font-size: 12px; color: #909399; margin-top: 5px;">
              支持格式：单个数字(5)、范围(3-7)、逗号分隔(2,5,8)、混合(1,3-5,8)
            </div>
          </div>
        </div>
        
        <p style="margin-top: 15px; color: #f56c6c; font-size: 12px;">
          ⚠️ 警告：此操作不可撤销！
        </p>
      </div>
    `,{value:c}=await S.confirm(t,"批量删除测试图片行",{dangerouslyUseHTMLString:!0,confirmButtonText:"删除选中行",cancelButtonText:"取消",type:"warning"});let n=[];const u=document.querySelectorAll('input[name="deleteImageRows"]:checked');if(n=Array.from(u).map(o=>parseInt(o.value)),n.length===0){const o=document.getElementById("imageRangeInput"),r=o==null?void 0:o.value.trim();if(r&&(n=w(r,l),n.length===0)){p.error("输入的行号格式不正确或超出范围");return}}if(n.length===0){p.info("未选择任何行");return}if(n.length>=l){p.warning("不能删除所有行，至少保留一行");return}n.sort((o,r)=>r-o);for(const o of n)d.testImageRows.splice(o,1);d.markDirty(),p.success(`已删除 ${n.length} 行`)}catch{}},w=(l,t)=>{const c=new Set,n=l.split(",").map(u=>u.trim()).filter(u=>u);for(const u of n)if(u.includes("-")){const[o,r]=u.split("-").map(m=>parseInt(m.trim()));if(!isNaN(o)&&!isNaN(r)&&o<=r)for(let m=o;m<=r;m++)m>=1&&m<=t&&c.add(m-1)}else{const o=parseInt(u);!isNaN(o)&&o>=1&&o<=t&&c.add(o-1)}return Array.from(c).sort((u,o)=>u-o)},A=async()=>{await d.newReport()},B=async()=>{try{const{value:l}=await S.prompt("请输入草稿名称：","保存草稿",{confirmButtonText:"保存",cancelButtonText:"取消",inputPlaceholder:"草稿名称"});l&&await d.saveDraft(l)}catch{}},O=async()=>{try{const l=await d.listDrafts();if(l.length===0){p.info("暂无保存的草稿");return}const t=l.map(o=>({label:`${o.title} (${new Date(o.updatedAt).toLocaleString()})`,value:o.id})),{value:c}=await S.confirm(`<div>
        <p>选择要打开的草稿：</p>
        <select id="draft-selector" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; margin-top: 10px;">
          ${t.map(o=>`<option value="${o.value}">${o.label}</option>`).join("")}
        </select>
        <p style="margin-top: 15px; color: #f56c6c; font-size: 12px;">
          ⚠️ 警告：此操作将覆盖当前未保存的内容！
        </p>
      </div>`,"打开草稿",{dangerouslyUseHTMLString:!0,confirmButtonText:"打开",cancelButtonText:"取消",type:"warning"}),n=document.getElementById("draft-selector"),u=n==null?void 0:n.value;u&&await d.loadDraft(u)}catch{}},U=async()=>{try{const l=await d.listDrafts();if(l.length===0){p.info("暂无保存的草稿");return}const t=l.map(o=>({label:`${o.title} (${new Date(o.updatedAt).toLocaleString()})`,value:o.id})),{value:c}=await S.confirm(`<div>
        <p>选择要删除的草稿：</p>
        <select id="delete-draft-selector" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; margin-top: 10px;">
          ${t.map(o=>`<option value="${o.value}">${o.label}</option>`).join("")}
        </select>
        <p style="margin-top: 15px; color: #f56c6c; font-size: 12px;">
          ⚠️ 警告：此操作不可撤销！
        </p>
      </div>`,"删除草稿",{dangerouslyUseHTMLString:!0,confirmButtonText:"删除",cancelButtonText:"取消",type:"warning"}),n=document.getElementById("delete-draft-selector"),u=n==null?void 0:n.value;if(u){const o=l.find(m=>m.id===u),r=(o==null?void 0:o.title)||"未知草稿";await S.confirm(`确定要删除草稿 "${r}" 吗？此操作不可撤销！`,"确认删除",{confirmButtonText:"确定删除",cancelButtonText:"取消",type:"error"}),await d.deleteDraft(u,r)}}catch{}};return(l,t)=>{const c=$("el-icon"),n=$("el-button"),u=$("el-divider"),o=$("el-input-number"),r=$("router-view");return N(),H("div",{class:"report-edit-container",onMousedown:D,onMousemove:j,onMouseup:P,ref_key:"containerRef",ref:x},[e(At),i("div",Vt,[i("aside",Et,[i("div",Ft,[t[6]||(t[6]=i("h3",{class:"section-title"},"报告操作",-1)),i("div",Mt,[e(n,{type:"primary",onClick:q},{default:a(()=>[e(c,null,{default:a(()=>[e(h(vt))]),_:1}),t[4]||(t[4]=_(" 导出PDF ",-1))]),_:1}),e(n,{onClick:A},{default:a(()=>[e(c,null,{default:a(()=>[e(h(X))]),_:1}),t[5]||(t[5]=_(" 新建报告 ",-1))]),_:1})])]),e(u),i("div",Lt,[t[17]||(t[17]=i("h3",{class:"section-title"},"行操作",-1)),i("div",Ut,[i("div",Ht,[t[11]||(t[11]=i("h4",{class:"group-title"},"测试结果信息",-1)),i("div",Nt,[e(n,{size:"small",type:"success",onClick:k},{default:a(()=>[e(c,null,{default:a(()=>[e(h(X))]),_:1}),t[7]||(t[7]=_(" 末尾添加行 ",-1))]),_:1}),e(o,{modelValue:E.value,"onUpdate:modelValue":t[0]||(t[0]=m=>E.value=m),min:1,max:20,size:"small",class:"row-count-input"},null,8,["modelValue"])]),i("div",Pt,[e(n,{size:"small",type:"primary",onClick:L},{default:a(()=>[e(c,null,{default:a(()=>[e(h(Q))]),_:1}),t[8]||(t[8]=_(" 指定位置插入行 ",-1))]),_:1})]),i("div",Ot,[e(n,{size:"small",type:"warning",onClick:K},{default:a(()=>[e(c,null,{default:a(()=>[e(h(tt))]),_:1}),t[9]||(t[9]=_(" 末尾删除行 ",-1))]),_:1}),e(o,{modelValue:R.value,"onUpdate:modelValue":t[1]||(t[1]=m=>R.value=m),min:1,max:20,size:"small",class:"row-count-input"},null,8,["modelValue"])]),i("div",jt,[e(n,{size:"small",type:"danger",onClick:s},{default:a(()=>[e(c,null,{default:a(()=>[e(h(G))]),_:1}),t[10]||(t[10]=_(" 指定位置删除行 ",-1))]),_:1})])]),e(u),i("div",qt,[t[16]||(t[16]=i("h4",{class:"group-title"},"测试图片",-1)),i("div",Yt,[e(n,{size:"small",type:"success",onClick:Y},{default:a(()=>[e(c,null,{default:a(()=>[e(h(X))]),_:1}),t[12]||(t[12]=_(" 末尾添加行 ",-1))]),_:1}),e(o,{modelValue:C.value,"onUpdate:modelValue":t[2]||(t[2]=m=>C.value=m),min:1,max:10,size:"small",class:"row-count-input"},null,8,["modelValue"])]),i("div",Kt,[e(n,{size:"small",type:"primary",onClick:T},{default:a(()=>[e(c,null,{default:a(()=>[e(h(Q))]),_:1}),t[13]||(t[13]=_(" 指定位置插入行 ",-1))]),_:1})]),i("div",Wt,[e(n,{size:"small",type:"warning",onClick:W},{default:a(()=>[e(c,null,{default:a(()=>[e(h(tt))]),_:1}),t[14]||(t[14]=_(" 末尾删除行 ",-1))]),_:1}),e(o,{modelValue:I.value,"onUpdate:modelValue":t[3]||(t[3]=m=>I.value=m),min:1,max:10,size:"small",class:"row-count-input"},null,8,["modelValue"])]),i("div",Xt,[e(n,{size:"small",type:"danger",onClick:f},{default:a(()=>[e(c,null,{default:a(()=>[e(h(G))]),_:1}),t[15]||(t[15]=_(" 指定位置删除行 ",-1))]),_:1})])])])]),e(u),i("div",Gt,[t[21]||(t[21]=i("h3",{class:"section-title"},"草稿管理",-1)),i("div",Zt,[e(n,{type:"success",onClick:B},{default:a(()=>[e(c,null,{default:a(()=>[e(h(gt))]),_:1}),t[18]||(t[18]=_(" 保存草稿 ",-1))]),_:1}),e(n,{onClick:O},{default:a(()=>[e(c,null,{default:a(()=>[e(h(yt))]),_:1}),t[19]||(t[19]=_(" 打开草稿 ",-1))]),_:1}),e(n,{type:"danger",onClick:U},{default:a(()=>[e(c,null,{default:a(()=>[e(h(G))]),_:1}),t[20]||(t[20]=_(" 删除草稿 ",-1))]),_:1})])])]),i("main",Jt,[e(r)])]),z.value?(N(),H("div",{key:0,class:"selection-box",style:xt(F.value)},null,4)):at("",!0)],544)}}},le=nt(Qt,[["__scopeId","data-v-d340e97b"]]);export{le as default};
