(function(){
  var L = window.LABELS || {};
  function gpu(){
    try{
      var c=document.createElement('canvas');
      var gl=c.getContext('webgl')||c.getContext('experimental-webgl');
      if(!gl) return '';
      var ext=gl.getExtension('WEBGL_debug_renderer_info');
      var r = ext? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      return r||'';
    }catch(e){ return ''; }
  }
  function clsGpu(r){
    if(!r) return -1;
    var s=r.toLowerCase();
    if(/(swiftshader|software|llvmpipe|microsoft basic)/.test(s)) return 0;
    if(/(geforce|gtx|rtx|radeon|nvidia|quadro|\brx |\barc\b)/.test(s)) return 2;
    if(/(intel|uhd|iris|hd graphics|vega|apple|adreno|mali)/.test(s)) return 1;
    return 1;
  }
  function esc(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function badge(score){
    var cls = score>=2?'ok':(score===1?'warn':(score===0?'low':'unk'));
    var txt = score>=2?L.st_ok:(score===1?L.st_warn:(score===0?L.st_low:L.unknown));
    return '<span class="bdg '+cls+'">'+esc(txt)+'</span>';
  }
  function row(label,val,need,score){
    return '<tr><td>'+esc(label)+'</td><td>'+esc(val)+'</td><td class="need">'+esc(need||'')+'</td><td>'+badge(score)+'</td></tr>';
  }
  function run(){
    var cores = navigator.hardwareConcurrency || 0;
    var mem = (typeof navigator.deviceMemory==='number')? navigator.deviceMemory : 0;
    var g = gpu(), gs = clsGpu(g);
    var w=screen.width, h=screen.height, dpr=window.devicePixelRatio||1;
    var sw=Math.round(w*dpr), sh=Math.round(h*dpr);
    var ua = navigator.userAgent||'';
    var cscore = cores>=4?2:(cores>=2?1:(cores>0?0:-1));
    var mscore = mem>=8?2:(mem>=4?1:(mem>0?0:-1));
    var sscore = w>=1280?2:(w>=1024?1:0);
    var scores=[cscore,mscore,gs].filter(function(x){return x>=0;});
    var minS = scores.length? Math.min.apply(null,scores):1;
    var sum=0,i; for(i=0;i<scores.length;i++) sum+=scores[i];
    var avg = scores.length? sum/scores.length : 1;
    var verdict,vcls,advice;
    if(minS<=0){ verdict=L.verdict_poor; vcls='low'; advice=L.advice_poor; }
    else if(avg>=1.8){ verdict=L.verdict_ready; vcls='ok'; advice=L.advice_ready; }
    else { verdict=L.verdict_marginal; vcls='warn'; advice=L.advice_marginal; }
    var memTxt = mem>0? ((mem>=8?'>= ':'')+mem+' GB') : L.unknown;
    var gpuTxt = g||L.unknown;
    var html='<div class="verdict '+vcls+'"><b>'+esc(verdict)+'</b><p>'+esc(advice)+'</p></div>';
    html+='<table class="dtbl"><tr><th>'+esc(L.metric)+'</th><th>'+esc(L.yours)+'</th><th>'+esc(L.need)+'</th><th></th></tr>';
    html+=row(L.m_cores, cores?String(cores):L.unknown, '4+', cscore);
    html+=row(L.m_mem, memTxt, '4-8 GB', mscore);
    html+=row(L.m_gpu, gpuTxt, 'GTX 950+', gs);
    html+=row(L.m_screen, sw+' x '+sh+' @'+dpr+'x', '1280+', sscore);
    html+=row(L.m_os, ua.length>64?ua.slice(0,64)+'...':ua, '-', -1);
    html+='</table><p class="vtnote">'+esc(L.vt_note)+'</p>';
    var el=document.getElementById('rk-out'); if(el) el.innerHTML=html;
  }
  if(document.readyState!=='loading') run(); else document.addEventListener('DOMContentLoaded',run);
})();