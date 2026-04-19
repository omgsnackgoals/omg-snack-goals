import { useState, useEffect } from "react";

/* ─────────────────────────────────────────────────────────────
   🔧 SUPABASE CONFIG
   Replace these two values with your own from supabase.com
   → Project Settings → API → Project URL + anon public key
───────────────────────────────────────────────────────────── */
const SUPABASE_URL  = "https://ppzfcngxshhyfpxyfzyz.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwemZjbmd4c2hoeWZweHlmenl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTAxMDYsImV4cCI6MjA5MjAyNjEwNn0.owkU1QZCJ1lN_Y7UWi_Hp8P2x9dHCRrRmQzOqTD69YM";

/* ─── Simple Supabase client (no SDK needed) ─── */
const sb = {
  headers: { "apikey": SUPABASE_ANON, "Content-Type": "application/json" },
  authHeaders: (token) => ({ ...sb.headers, "Authorization": `Bearer ${token}` }),

  async signUp(email, password, name) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: sb.headers,
      body: JSON.stringify({ email, password, data: { name } }),
    });
    return r.json();
  },

  async signIn(email, password) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: sb.headers,
      body: JSON.stringify({ email, password }),
    });
    return r.json();
  },

  async signOut(token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: sb.authHeaders(token),
    });
  },

  async getSnacks(token, userId) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/snacks?user_id=eq.${userId}&order=date.desc`, {
      headers: sb.authHeaders(token),
    });
    return r.json();
  },

  async addSnack(token, snack) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/snacks`, {
      method: "POST",
      headers: { ...sb.authHeaders(token), "Prefer": "return=representation" },
      body: JSON.stringify(snack),
    });
    return r.json();
  },

  async updateSnack(token, id, snack) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/snacks?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...sb.authHeaders(token), "Prefer": "return=representation" },
      body: JSON.stringify(snack),
    });
    return r.json();
  },

  async deleteSnack(token, id) {
    await fetch(`${SUPABASE_URL}/rest/v1/snacks?id=eq.${id}`, {
      method: "DELETE",
      headers: sb.authHeaders(token),
    });
  },
};

/* ─── DEMO MODE (when Supabase not configured) ─── */
const IS_DEMO = SUPABASE_URL === "YOUR_SUPABASE_URL";

/* ─── Brand tokens ─── */
const B = {
  coral:"#F07B6B", yellow:"#F5C842", blue:"#5B9BD5",
  ink:"#2B2B2B", mid:"#666", muted:"#999",
  cream:"#FFFAF4", white:"#FFFFFF", border:"#EDE5DA",
  coralBg:"#FEF0ED", yellowBg:"#FFFCE8", blueBg:"#EEF4FB",
};

const FLAVOR_TAGS = [
  {e:"🧂",v:"Salty"},{e:"🍬",v:"Sweet"},{e:"🌶️",v:"Spicy"},
  {e:"🍋",v:"Sour"},{e:"💥",v:"Crunchy"},{e:"🍫",v:"Chocolatey"},
  {e:"🧀",v:"Cheesy"},{e:"🌿",v:"Herby"},{e:"🥛",v:"Creamy"},
  {e:"🔥",v:"Smoky"},{e:"🍞",v:"Doughy"},{e:"🍄",v:"Umami"},
];

const CATEGORIES = [
  "Chips & Crisps","Candy & Chocolate","Crackers","Nuts & Seeds","Jerky",
  "Fruit Snacks","Pickles & Fermented","Cookies & Bars","Popcorn",
  "Protein Snacks","Dips & Spreads","Ice Cream","Other",
];

/* ─── Miraya's community reviews ─── */
const COMMUNITY_SNACKS = [
  {id:"c1",reviewer:"Miraya",avatarEmoji:"🥨",name:"Sockerbit Sour Gummy Mix",brand:"Sockerbit",category:"Candy & Chocolate",rating:10,flavors:["Sour","Sweet","Crunchy","Chewy"],notes:"NOW THIS IS SOUR. Every handful is different — cola, apple, classic fruit. It's a curated bulk candy experience in a bag. Vegan, no HFCS. No notes, just eat it.",date:"2026-02-27",wba:true,newsletter:"Do you consider candy a snack? 🍬"},
  {id:"c2",reviewer:"Miraya",avatarEmoji:"🥨",name:"Magic Spoon Protein Treats Minis",brand:"Magic Spoon",category:"Protein Snacks",rating:10,flavors:["Sweet","Chewy"],notes:"Tiny marshmallow treats, 5g protein, 60 calories EACH. No weird aftertaste, great texture, genuinely delightful. My toddler loved them. Grab the big box at Costco.",date:"2026-03-18",wba:true,newsletter:"Protein Snacks: A Roundup 💪"},
  {id:"c3",reviewer:"Miraya",avatarEmoji:"🥨",name:"Dally Mango Konjac Jelly Pouch",brand:"Dally",category:"Fruit Snacks",rating:10,flavors:["Sweet","Creamy"],notes:"Big-kid fruit pouch energy. Soft jello, super refreshing from the fridge. 10 calories, Vitamin C, prebiotics. Mango flavor wins. Pure small joy. $2.79 at Target.",date:"2026-03-11",wba:true,newsletter:"Jiggly fruit snack, big joy 🍓"},
  {id:"c4",reviewer:"Miraya",avatarEmoji:"🥨",name:"Good Girl Snacks Original Dill",brand:"Good Girl Snacks",category:"Pickles & Fermented",rating:9,flavors:["Salty","Sour","Crunchy","Herby"],notes:"Crunchy, super flavorful, very snackable. The turmeric twist is spot on. Premium price but genuinely worth it. My toddler specifically requests these by name.",date:"2026-04-01",wba:true,newsletter:"Pickles! Pickles! Pickles! 🥒"},
  {id:"c5",reviewer:"Miraya",avatarEmoji:"🥨",name:"Khloud Protein Popcorn (Olive Oil & Sea Salt)",brand:"Khloud",category:"Popcorn",rating:8,flavors:["Salty","Crunchy"],notes:"Zero weird protein aftertaste. Tastes like flavored popcorn first, protein snack second. I ate half the bag during school pickup. No regrets.",date:"2026-03-04",wba:true,newsletter:"This Week's Driving Snack 🍿"},
  {id:"c6",reviewer:"Miraya",avatarEmoji:"🥨",name:"David Protein Bar (Brownie + Cinnamon Roll)",brand:"David",category:"Protein Snacks",rating:8,flavors:["Sweet","Chocolatey","Chewy"],notes:"28g protein, 150 calories, zero sugar. Chewy nugget style that I usually don't love but these actually work. Both flavors were tasty.",date:"2026-03-18",wba:true,newsletter:"Protein Snacks: A Roundup 💪"},
  {id:"c7",reviewer:"Miraya",avatarEmoji:"🥨",name:"Bubbies Dill Pickles",brand:"Bubbies",category:"Pickles & Fermented",rating:8,flavors:["Salty","Sour","Crunchy"],notes:"True deli pickles. Seriously sour, garlicky, crunchy. Jewish holiday nostalgia. Better as a sandwich pickle than straight from the jar.",date:"2026-04-01",wba:true,newsletter:"Pickles! Pickles! Pickles! 🥒"},
  {id:"c8",reviewer:"Miraya",avatarEmoji:"🥨",name:"Percy Pig Gummy Candy",brand:"Percy Pig (M&S)",category:"Candy & Chocolate",rating:6,flavors:["Sweet","Chewy"],notes:"Two textures in one — soft and pillowy but still chewy. Sweet but not overwhelming. London nostalgia in every tiny pig-shaped bite.",date:"2026-02-27",wba:true,newsletter:"Do you consider candy a snack? 🍬"},
  {id:"c9",reviewer:"Miraya",avatarEmoji:"🥨",name:"BEHAVE Watermelon Mango Lychee Gummies",brand:"BEHAVE",category:"Candy & Chocolate",rating:6,flavors:["Sweet","Chewy","Sour"],notes:"Low-sugar done right. Only 70-80 cal for the whole bag. Perfect for when I want to eat an entire bag without the sugar spiral.",date:"2026-02-27",wba:true,newsletter:"Do you consider candy a snack? 🍬"},
  {id:"c10",reviewer:"Miraya",avatarEmoji:"🥨",name:"Shameless Snacks Gummies (Peach)",brand:"Shameless Snacks",category:"Candy & Chocolate",rating:6,flavors:["Sweet","Chewy","Crunchy"],notes:"Peach hearts = winner. Classic gummy ring flavor. Sugar coating has a satisfying crunch. 70 cal + 26g fiber for a whole bag is genuinely wild.",date:"2026-03-25",wba:true,newsletter:"Candy with 26g of fiber 🍬"},
  {id:"c11",reviewer:"Miraya",avatarEmoji:"🥨",name:"Oddball Double Berry Jelly",brand:"Oddball",category:"Fruit Snacks",rating:6,flavors:["Sweet"],notes:"Jello glowup. Light, refreshing. 100% fruit, 45 calories, $1.50 each. More of a lunchbox snack than adult treat — Dally wins for me personally.",date:"2026-03-11",wba:false,newsletter:"Jiggly fruit snack, big joy 🍓"},
  {id:"c12",reviewer:"Miraya",avatarEmoji:"🥨",name:"Kind Protein Max Bar",brand:"Kind",category:"Protein Snacks",rating:8,flavors:["Salty","Crunchy","Sweet"],notes:"Substantial and filling. Lots of nutty crunch. At 250 cal it's more mini meal than snack. I have one weekly post-workout — prevents panic grocery shopping.",date:"2026-03-18",wba:true,newsletter:"Protein Snacks: A Roundup 💪"},
  {id:"c13",reviewer:"Miraya",avatarEmoji:"🥨",name:"BUBS Sour Strawberry Vanilla",brand:"BUBS",category:"Candy & Chocolate",rating:4,flavors:["Sweet","Chewy"],notes:"Good bounce on the chew but the sour is a letdown — leans 'sweet tart' not truly sour. Cheap at $3.29 but I'd take Percy Pigs every time.",date:"2026-02-27",wba:false,newsletter:"Do you consider candy a snack? 🍬"},
  {id:"c14",reviewer:"Miraya",avatarEmoji:"🥨",name:"Mt. Olive Dill Pickles",brand:"Mt. Olive",category:"Pickles & Fermented",rating:5,flavors:["Salty"],notes:"Mid pickles. $5 for 128oz at Costco is wild value. But after the fancy ones, these taste bland. My toddler was NOT fooled.",date:"2026-04-01",wba:false,newsletter:"Pickles! Pickles! Pickles! 🥒"},
  {id:"c15",reviewer:"Miraya",avatarEmoji:"🥨",name:"Legendary Protein Pastry",brand:"Legendary Foods",category:"Protein Snacks",rating:2,flavors:["Sweet","Doughy"],notes:"Looks like a Pop-Tart, eats like chalk. The frosting is aggressively fake-sweet. Couldn't finish it. Love the concept, hate the execution.",date:"2026-03-18",wba:false,newsletter:"Protein Snacks: A Roundup 💪"},
];

/* ─── Inject fonts + CSS (browser only) ─── */
if (typeof document !== "undefined") {
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Nunito+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap";
  document.head.appendChild(l);
  const s = document.createElement("style");
  s.textContent = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:${B.cream}}
    @keyframes pop{0%{opacity:0;transform:scale(.84) translateY(10px)}100%{opacity:1;transform:scale(1) translateY(0)}}
    @keyframes up{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes shimmer{0%{opacity:.6}50%{opacity:1}100%{opacity:.6}}
    .pop{animation:pop .3s cubic-bezier(.34,1.56,.64,1) both}
    .up{animation:up .3s ease both}
    .lift{transition:transform .18s ease,box-shadow .18s ease}
    .lift:hover{transform:translateY(-4px) rotate(-.3deg);box-shadow:0 14px 36px rgba(0,0,0,.11)!important}
    .press:active{transform:scale(.92)!important}
    .shimmer{animation:shimmer 2s ease-in-out infinite}
    input:focus,textarea:focus,select:focus{outline:none!important;border-color:${B.blue}!important;box-shadow:0 0 0 3px ${B.blueBg}}
    ::-webkit-scrollbar{width:5px}
    ::-webkit-scrollbar-thumb{background:${B.border};border-radius:99px}
  `;
  document.head.appendChild(s);
}

const rc = r => r>=8?B.coral:r>=6?B.yellow:B.blue;
const rb = r => r>=8?B.coralBg:r>=6?B.yellowBg:B.blueBg;
const re = r => r>=9?"🤩":r>=7?"😋":r>=5?"😐":"😬";
const F  = "'Nunito',sans-serif";
const FS = "'Nunito Sans',sans-serif";

/* ─── Squiggle ─── */
function Squiggle({color=B.yellow,h=24}) {
  return (
    <div style={{lineHeight:0}}>
      <svg viewBox="0 0 900 40" width="100%" height={h} preserveAspectRatio="none">
        <path d="M0,20 C75,0 150,40 225,20 S375,0 450,20 S600,40 675,20 S825,0 900,20 L900,40 L0,40 Z" fill={color}/>
      </svg>
    </div>
  );
}

/* ─── Checkerboard ─── */
function Checker({children,style={}}) {
  return (
    <div style={{
      backgroundImage:`linear-gradient(45deg,${B.yellow} 25%,transparent 25%),linear-gradient(-45deg,${B.yellow} 25%,transparent 25%),linear-gradient(45deg,transparent 75%,${B.yellow} 75%),linear-gradient(-45deg,transparent 75%,${B.yellow} 75%)`,
      backgroundSize:"32px 32px",backgroundPosition:"0 0,0 16px,16px -16px,-16px 0",
      backgroundColor:B.coral,...style,
    }}>{children}</div>
  );
}

/* ─── Logo ─── */
function Logo({sm}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:sm?8:14,userSelect:"none"}}>
      <span style={{fontSize:sm?27:46}}>🥨</span>
      <div style={{fontFamily:F,fontWeight:900,lineHeight:1.05}}>
        <div><span style={{color:B.coral,fontSize:sm?18:33}}>OMG</span><span style={{fontSize:sm?14:20,marginLeft:2}}>✨</span></div>
        <div><span style={{color:B.yellow,fontSize:sm?18:33}}>SNACK </span><span style={{color:B.blue,fontSize:sm?18:33}}>GOALS</span><span style={{fontSize:sm?14:20,marginLeft:2}}>🍫</span></div>
        {!sm&&<div style={{fontFamily:FS,fontWeight:600,fontSize:13,color:B.muted,marginTop:3}}>your personal snack diary</div>}
      </div>
    </div>
  );
}

/* ─── Spinner ─── */
function Spinner() {
  return <div style={{width:22,height:22,border:`3px solid ${B.coralBg}`,borderTopColor:B.coral,borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto"}}/>;
}

/* ═══════════════════════════════════════════════════
   AUTH SCREEN
═══════════════════════════════════════════════════ */
function AuthScreen({onAuth}) {
  const [mode,setMode]   = useState("login"); // login | signup
  const [name,setName]   = useState("");
  const [email,setEmail] = useState("");
  const [pass,setPass]   = useState("");
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState(null);
  const [success,setSuccess] = useState(null);

  const inp = {
    width:"100%",padding:"12px 16px",borderRadius:14,
    border:`2px solid ${B.border}`,fontSize:15,
    fontFamily:FS,background:B.white,color:B.ink,
    transition:"border-color .15s",
  };

  const submit = async () => {
    if(!email||!pass||(mode==="signup"&&!name)) { setError("Please fill in all fields."); return; }
    setLoading(true); setError(null); setSuccess(null);

    if(IS_DEMO) {
      // Demo mode — simulate auth
      await new Promise(r=>setTimeout(r,900));
      onAuth({ id:"demo-user", email, user_metadata:{ name: name||email.split("@")[0] } }, "demo-token");
      return;
    }

    if(mode==="signup") {
      const res = await sb.signUp(email, pass, name);
      if(res.error) { setError(res.error.message); setLoading(false); return; }
      const loginRes = await sb.signIn(email, pass);
if(loginRes.access_token) {
  onAuth(loginRes.user, loginRes.access_token);
} else {
  setMode("login");
}; setLoading(false);
    } else {
      const res = await sb.signIn(email, pass);
      if(res.error) { setError(res.error.message); setLoading(false); return; }
      onAuth(res.user, res.access_token);
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      {/* Top checker hero */}
      <Checker style={{padding:"40px 20px 0",flexShrink:0}}>
        <div style={{maxWidth:420,margin:"0 auto",background:"rgba(255,255,255,.93)",borderRadius:"20px 20px 0 0",padding:"32px 32px 24px",textAlign:"center"}}>
          <Logo/>
          <p style={{fontFamily:FS,fontSize:15,color:B.mid,marginTop:14,lineHeight:1.65}}>
            Log every chip, pickle, and chocolate bar.<br/>
            Build your flavor profile. Get recs made for you.
          </p>
        </div>
      </Checker>
      <Squiggle color="rgba(255,255,255,.93)" h={22}/>

      {/* Auth card */}
      <div style={{flex:1,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"0 20px 60px"}}>
        <div className="pop" style={{background:B.white,borderRadius:24,width:"100%",maxWidth:420,padding:"28px 28px 32px",boxShadow:"0 8px 40px rgba(0,0,0,.1)",marginTop:8}}>

          {/* Tab toggle */}
          <div style={{display:"flex",background:B.cream,borderRadius:14,padding:4,marginBottom:24,gap:4}}>
            {["login","signup"].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setError(null);setSuccess(null);}} style={{
                flex:1,padding:"10px",borderRadius:11,border:"none",cursor:"pointer",
                fontFamily:F,fontWeight:800,fontSize:14,transition:"all .18s",
                background:mode===m?B.white:"transparent",
                color:mode===m?B.ink:B.muted,
                boxShadow:mode===m?"0 2px 8px rgba(0,0,0,.08)":"none",
              }}>{m==="login"?"Log In":"Sign Up"}</button>
            ))}
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {mode==="signup"&&(
              <div>
                <label style={{display:"block",fontFamily:F,fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:1,color:B.muted,marginBottom:6}}>Your Name</label>
                <input style={inp} placeholder="e.g. Miraya" value={name} onChange={e=>setName(e.target.value)}/>
              </div>
            )}
            <div>
              <label style={{display:"block",fontFamily:F,fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:1,color:B.muted,marginBottom:6}}>Email</label>
              <input style={inp} type="email" placeholder="snack@lover.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
            </div>
            <div>
              <label style={{display:"block",fontFamily:F,fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:1,color:B.muted,marginBottom:6}}>Password</label>
              <input style={inp} type="password" placeholder={mode==="signup"?"Min 6 characters":"••••••••"} value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
            </div>
          </div>

          {error&&(
            <div style={{marginTop:14,background:"#FFF0F0",border:"1.5px solid #ffd5d5",borderRadius:10,padding:"10px 14px",fontFamily:FS,fontSize:13,color:"#c0392b"}}>
              ⚠️ {error}
            </div>
          )}
          {success&&(
            <div style={{marginTop:14,background:B.yellowBg,border:`1.5px solid ${B.yellow}`,borderRadius:10,padding:"10px 14px",fontFamily:FS,fontSize:13,color:B.ink}}>
              ✅ {success}
            </div>
          )}

          <button onClick={submit} disabled={loading} className="press" style={{
            width:"100%",marginTop:20,padding:"14px",borderRadius:14,border:"none",
            background:loading?B.border:B.coral,color:loading?B.mid:B.white,
            cursor:loading?"default":"pointer",
            fontFamily:F,fontWeight:900,fontSize:16,
            boxShadow:loading?"none":"0 4px 20px rgba(240,123,107,.45)",
            transition:"all .2s",
          }}>
            {loading ? <Spinner/> : mode==="login"?"Log In 🍿":"Create Account 🎉"}
          </button>

          {IS_DEMO&&(
            <div style={{marginTop:16,padding:"12px 14px",background:B.yellowBg,border:`1.5px dashed ${B.yellow}`,borderRadius:12,fontFamily:FS,fontSize:12,color:B.mid,textAlign:"center",lineHeight:1.5}}>
              <strong>Demo mode</strong> — Supabase not connected yet.<br/>
              Hit {mode==="login"?"Log In":"Create Account"} to preview the full app!
            </div>
          )}

          <div style={{marginTop:20,textAlign:"center",fontFamily:FS,fontSize:13,color:B.muted}}>
            {mode==="login"?"Don't have an account? ":"Already have an account? "}
            <button onClick={()=>{setMode(mode==="login"?"signup":"login");setError(null);setSuccess(null);}} style={{background:"none",border:"none",color:B.coral,fontFamily:F,fontWeight:800,fontSize:13,cursor:"pointer",textDecoration:"underline"}}>
              {mode==="login"?"Sign Up":"Log In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Rating Picker ─── */
function RatingPicker({value,onChange}) {
  return (
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      {[1,2,3,4,5,6,7,8,9,10].map(n=>{
        const sel=value===n;
        return <button key={n} className="press" onClick={()=>onChange(n)} style={{
          width:38,height:38,borderRadius:10,cursor:"pointer",
          border:`2.5px solid ${sel?rc(n):B.border}`,
          background:sel?rc(n):B.white,color:sel?B.white:B.mid,
          fontFamily:F,fontWeight:900,fontSize:14,transition:"all .14s",
        }}>{n}</button>;
      })}
    </div>
  );
}

/* ─── Flavor Picker ─── */
function FlavorPicker({selected,onChange}) {
  const tog=v=>onChange(selected.includes(v)?selected.filter(x=>x!==v):[...selected,v]);
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
      {FLAVOR_TAGS.map(({e,v})=>{
        const on=selected.includes(v);
        return <button key={v} className="press" onClick={()=>tog(v)} style={{
          padding:"6px 12px",borderRadius:20,cursor:"pointer",
          border:`2px solid ${on?B.coral:B.border}`,
          background:on?B.coralBg:B.white,color:on?B.coral:B.mid,
          fontFamily:F,fontWeight:700,fontSize:12,transition:"all .14s",
        }}>{e} {v}</button>;
      })}
    </div>
  );
}

/* ─── Snack Card ─── */
function SnackCard({snack,onClick,showReviewer=false}) {
  return (
    <div className="lift pop" onClick={()=>onClick&&onClick(snack)} style={{
      background:B.white,borderRadius:18,cursor:onClick?"pointer":"default",
      border:`2px solid ${B.border}`,boxShadow:"0 2px 8px rgba(0,0,0,.05)",overflow:"hidden",
    }}>
      <div style={{height:5,background:`linear-gradient(90deg,${rc(snack.rating)},${rc(snack.rating)}88)`}}/>
      <div style={{padding:"15px 16px 13px"}}>
        {showReviewer&&(
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:B.coralBg,border:`2px solid ${B.coral}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>{snack.avatarEmoji||"🥨"}</div>
            <div>
              <span style={{fontFamily:F,fontWeight:800,fontSize:12,color:B.coral}}>{snack.reviewer}</span>
              {snack.newsletter&&<span style={{fontFamily:FS,fontSize:11,color:B.muted,marginLeft:5}}>· {snack.newsletter}</span>}
            </div>
          </div>
        )}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
          <div style={{flex:1,marginRight:9}}>
            <div style={{fontFamily:F,fontWeight:900,fontSize:15,color:B.ink,lineHeight:1.25}}>{snack.name}</div>
            <div style={{fontFamily:FS,fontSize:12,color:B.muted,marginTop:2}}>{snack.brand} · {snack.category}</div>
          </div>
          <div style={{background:rb(snack.rating),color:rc(snack.rating),borderRadius:10,padding:"4px 10px",flexShrink:0,fontFamily:F,fontWeight:900,fontSize:17}}>{snack.rating}<span style={{fontSize:11}}>/10</span></div>
        </div>
        {snack.flavors?.length>0&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:7}}>
            {snack.flavors.map(f=><span key={f} style={{background:B.coralBg,color:B.coral,borderRadius:20,padding:"2px 9px",fontFamily:F,fontWeight:700,fontSize:11}}>{f}</span>)}
          </div>
        )}
        {snack.notes&&(
          <div style={{fontFamily:FS,fontStyle:"italic",fontSize:13,color:B.mid,lineHeight:1.5,marginBottom:7,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>"{snack.notes}"</div>
        )}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
          <span style={{fontFamily:FS,fontSize:11,color:B.muted}}>{snack.date}</span>
          {snack.wba&&<span style={{fontFamily:F,fontWeight:700,fontSize:11,color:B.blue}}>✓ buy again</span>}
        </div>
      </div>
    </div>
  );
}

/* ─── Snack Modal ─── */
function SnackModal({onClose,onSave,edit}) {
  const [f,setF]=useState(edit||{name:"",brand:"",category:CATEGORIES[0],rating:7,flavors:[],notes:"",date:new Date().toISOString().slice(0,10),wba:false});
  const [saving,setSaving]=useState(false);
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const inp={width:"100%",padding:"10px 14px",borderRadius:12,border:`2px solid ${B.border}`,fontSize:14,fontFamily:FS,background:B.cream,color:B.ink,transition:"border-color .15s"};

  const save=async()=>{
    if(!f.name.trim())return;
    setSaving(true);
    await onSave(f);
    setSaving(false);
  };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,zIndex:500,background:"rgba(43,43,43,.6)",backdropFilter:"blur(5px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div className="pop" style={{background:B.white,borderRadius:24,width:"100%",maxWidth:520,maxHeight:"92vh",overflowY:"auto",position:"relative",boxShadow:"0 28px 72px rgba(0,0,0,.22)"}}>
        <div style={{background:B.coral,borderRadius:"22px 22px 0 0",padding:"20px 26px 0"}}>
          <button onClick={onClose} style={{position:"absolute",top:14,right:14,width:30,height:30,borderRadius:"50%",border:"none",background:"rgba(255,255,255,.25)",cursor:"pointer",color:B.white,fontFamily:F,fontWeight:900,fontSize:14}}>✕</button>
          <div style={{fontFamily:F,fontWeight:900,fontSize:22,color:B.white}}>{edit?"✏️ Edit Snack":"🍿 Log a Snack"}</div>
          <div style={{fontFamily:FS,fontSize:13,color:"rgba(255,255,255,.75)",marginTop:3,marginBottom:12}}>Tell us everything — the good, the mid, the absolute 🤌</div>
        </div>
        <Squiggle color={B.coral} h={20}/>
        <div style={{padding:"4px 26px 26px"}}>
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontFamily:F,fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:1,color:B.muted,marginBottom:6}}>Snack Name *</label>
            <input style={inp} value={f.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Good Girl Snacks Original Dill"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            <div>
              <label style={{display:"block",fontFamily:F,fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:1,color:B.muted,marginBottom:6}}>Brand</label>
              <input style={inp} value={f.brand} onChange={e=>set("brand",e.target.value)} placeholder="Brand name"/>
            </div>
            <div>
              <label style={{display:"block",fontFamily:F,fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:1,color:B.muted,marginBottom:6}}>Category</label>
              <select style={inp} value={f.category} onChange={e=>set("category",e.target.value)}>
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontFamily:F,fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:1,color:B.muted,marginBottom:6}}>Rating — <span style={{color:rc(f.rating)}}>{f.rating}/10 {re(f.rating)}</span></label>
            <RatingPicker value={f.rating} onChange={v=>set("rating",v)}/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontFamily:F,fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:1,color:B.muted,marginBottom:8}}>Flavor Profile</label>
            <FlavorPicker selected={f.flavors} onChange={v=>set("flavors",v)}/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontFamily:F,fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:1,color:B.muted,marginBottom:6}}>Tasting Notes</label>
            <textarea style={{...inp,minHeight:80,resize:"vertical"}} value={f.notes} onChange={e=>set("notes",e.target.value)} placeholder="The crunch, the aftertaste, the vibe. Future you will be grateful 💛"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:22}}>
            <div>
              <label style={{display:"block",fontFamily:F,fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:1,color:B.muted,marginBottom:6}}>Date Tried</label>
              <input type="date" style={inp} value={f.date} onChange={e=>set("date",e.target.value)}/>
            </div>
            <div style={{display:"flex",alignItems:"flex-end",paddingBottom:2}}>
              <label style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",fontFamily:F,fontWeight:700,fontSize:14,color:B.ink}}>
                <input type="checkbox" checked={f.wba} onChange={e=>set("wba",e.target.checked)} style={{width:20,height:20,accentColor:B.coral,cursor:"pointer"}}/>
                Would buy again 🛒
              </label>
            </div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button onClick={onClose} className="press" style={{padding:"10px 20px",borderRadius:12,border:`2px solid ${B.border}`,background:"transparent",color:B.mid,cursor:"pointer",fontFamily:F,fontWeight:700,fontSize:14}}>Cancel</button>
            <button onClick={save} disabled={saving} className="press" style={{padding:"10px 26px",borderRadius:12,border:"none",background:saving?B.border:B.coral,color:saving?B.mid:B.white,cursor:saving?"default":"pointer",fontFamily:F,fontWeight:900,fontSize:14,boxShadow:saving?"none":"0 4px 16px rgba(240,123,107,.4)",minWidth:120}}>
              {saving?<Spinner/>:(edit?"Save Changes ✓":"Log It! 🎉")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Detail Modal ─── */
function DetailModal({snack,onClose,onEdit,onDelete,readOnly=false}) {
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,zIndex:500,background:"rgba(43,43,43,.6)",backdropFilter:"blur(5px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div className="pop" style={{background:B.white,borderRadius:24,width:"100%",maxWidth:520,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 28px 72px rgba(0,0,0,.22)",overflow:"hidden"}}>
        <div style={{background:rc(snack.rating),padding:"26px 26px 0",position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:14,right:14,width:30,height:30,borderRadius:"50%",border:"none",background:"rgba(255,255,255,.25)",cursor:"pointer",color:B.white,fontFamily:F,fontWeight:900,fontSize:14}}>✕</button>
          {snack.reviewer&&(
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:"rgba(255,255,255,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>{snack.avatarEmoji||"🥨"}</div>
              <span style={{fontFamily:F,fontWeight:800,fontSize:13,color:"rgba(255,255,255,.9)"}}>Reviewed by {snack.reviewer}</span>
            </div>
          )}
          <div style={{fontFamily:FS,fontSize:12,color:"rgba(255,255,255,.7)",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{snack.category}</div>
          <div style={{fontFamily:F,fontWeight:900,fontSize:24,color:B.white,lineHeight:1.2,paddingRight:36,marginBottom:4}}>{snack.name}</div>
          <div style={{fontFamily:FS,fontSize:14,color:"rgba(255,255,255,.8)",marginBottom:18}}>{snack.brand}</div>
          <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center"}}>
            <div style={{background:"rgba(255,255,255,.2)",borderRadius:14,padding:"10px 20px",textAlign:"center"}}>
              <div style={{fontFamily:F,fontWeight:900,fontSize:38,color:B.white,lineHeight:1}}>{snack.rating}</div>
              <div style={{fontFamily:F,fontSize:11,color:"rgba(255,255,255,.65)",textTransform:"uppercase",letterSpacing:1}}>/ 10</div>
            </div>
            {snack.wba&&<div style={{background:"rgba(255,255,255,.2)",borderRadius:12,padding:"8px 14px",fontFamily:F,fontWeight:700,fontSize:13,color:B.white}}>✓ Would buy again</div>}
          </div>
        </div>
        <Squiggle color={rc(snack.rating)} h={20}/>
        <div style={{padding:"8px 24px 26px"}}>
          {snack.flavors?.length>0&&(
            <div style={{marginBottom:16}}>
              <div style={{fontFamily:F,fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:1,color:B.muted,marginBottom:8}}>Flavor Profile</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                {snack.flavors.map(f=><span key={f} style={{background:B.coralBg,color:B.coral,borderRadius:20,padding:"4px 12px",fontFamily:F,fontWeight:700,fontSize:12}}>{f}</span>)}
              </div>
            </div>
          )}
          {snack.notes&&(
            <div style={{marginBottom:16}}>
              <div style={{fontFamily:F,fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:1,color:B.muted,marginBottom:8}}>Tasting Notes</div>
              <div style={{fontFamily:FS,fontStyle:"italic",fontSize:15,color:B.mid,lineHeight:1.6,background:B.cream,borderRadius:12,padding:"14px 16px"}}>"{snack.notes}"</div>
            </div>
          )}
          {snack.newsletter&&(
            <div style={{marginBottom:16}}>
              <div style={{fontFamily:F,fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:1,color:B.muted,marginBottom:6}}>From the Newsletter</div>
              <div style={{fontFamily:FS,fontSize:13,color:B.blue,fontWeight:600}}>{snack.newsletter}</div>
            </div>
          )}
          <div style={{fontFamily:FS,fontSize:13,color:B.muted,marginBottom:20}}>Logged on {snack.date}</div>
          {!readOnly&&(
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>onEdit(snack)} className="press" style={{padding:"9px 18px",borderRadius:12,border:`2px solid ${B.border}`,background:"transparent",color:B.mid,cursor:"pointer",fontFamily:F,fontWeight:700,fontSize:13}}>✏️ Edit</button>
              <button onClick={()=>onDelete(snack.id)} className="press" style={{padding:"9px 18px",borderRadius:12,border:"2px solid #ffd5d5",background:"transparent",color:"#d94f4f",cursor:"pointer",fontFamily:F,fontWeight:700,fontSize:13}}>🗑 Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── LOG TAB ─── */
function LogTab({snacks,onCardClick,loading}) {
  const [filter,setFilter]=useState("All");
  const [sort,setSort]=useState("newest");
  const [q,setQ]=useState("");

  if(loading) return <div style={{textAlign:"center",padding:"60px 20px"}}><Spinner/><div style={{fontFamily:FS,fontSize:14,color:B.muted,marginTop:12}}>Loading your snacks…</div></div>;

  const cats=["All",...new Set(snacks.map(s=>s.category))];
  const shown=snacks.filter(s=>filter==="All"||s.category===filter).filter(s=>!q||s.name.toLowerCase().includes(q.toLowerCase())||s.brand.toLowerCase().includes(q.toLowerCase())).sort((a,z)=>sort==="newest"?new Date(z.date)-new Date(a.date):sort==="top"?z.rating-a.rating:sort==="low"?a.rating-z.rating:a.name.localeCompare(z.name));
  const avg=snacks.length?(snacks.reduce((s,x)=>s+x.rating,0)/snacks.length).toFixed(1):"—";

  if(snacks.length===0) return (
    <div style={{textAlign:"center",padding:"70px 20px"}}>
      <div style={{fontSize:52,marginBottom:14}}>🥨</div>
      <div style={{fontFamily:F,fontWeight:900,fontSize:22,color:B.mid,marginBottom:8}}>Your log is empty!</div>
      <div style={{fontFamily:FS,fontSize:15,color:B.muted,lineHeight:1.6}}>Hit the + button to log your first snack.<br/>Check Community Picks for inspiration 👇</div>
    </div>
  );

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:22}}>
        {[{e:"🍿",l:"Logged",v:snacks.length,c:B.coral},{e:"⭐",l:"Avg Rating",v:avg,c:B.yellow},{e:"🛒",l:"Buy Again",v:snacks.filter(s=>s.wba).length,c:B.blue}].map(({e,l,v,c})=>(
          <div key={l} className="up" style={{background:B.white,borderRadius:16,padding:"14px 12px",border:`2px solid ${B.border}`,textAlign:"center"}}>
            <div style={{fontSize:22,marginBottom:4}}>{e}</div>
            <div style={{fontFamily:F,fontWeight:900,fontSize:24,color:c}}>{v}</div>
            <div style={{fontFamily:FS,fontSize:11,color:B.muted,textTransform:"uppercase",letterSpacing:.5}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
        <input style={{flex:1,minWidth:160,padding:"9px 14px",borderRadius:12,border:`2px solid ${B.border}`,fontFamily:FS,fontSize:14,background:B.white,color:B.ink}} placeholder="🔍 Search snacks…" value={q} onChange={e=>setQ(e.target.value)}/>
        <select style={{padding:"9px 14px",borderRadius:12,border:`2px solid ${B.border}`,fontFamily:F,fontWeight:700,fontSize:13,background:B.white,color:B.mid,cursor:"pointer"}} value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="newest">Newest First</option><option value="top">Highest Rated</option><option value="low">Lowest Rated</option><option value="az">A → Z</option>
        </select>
      </div>
      <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:20}}>
        {cats.map(c=><button key={c} className="press" onClick={()=>setFilter(c)} style={{padding:"6px 14px",borderRadius:20,cursor:"pointer",border:`2px solid ${filter===c?B.blue:B.border}`,background:filter===c?B.blueBg:B.white,color:filter===c?B.blue:B.mid,fontFamily:F,fontWeight:700,fontSize:12,transition:"all .14s"}}>{c}</button>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:14}}>
        {shown.map(s=><SnackCard key={s.id} snack={s} onClick={onCardClick}/>)}
      </div>
    </div>
  );
}

/* ─── COMMUNITY TAB ─── */
function CommunityTab() {
  const [filter,setFilter]=useState("All");
  const [sort,setSort]=useState("top");
  const [q,setQ]=useState("");
  const [detail,setDetail]=useState(null);

  const cats=["All",...new Set(COMMUNITY_SNACKS.map(s=>s.category))];
  const shown=COMMUNITY_SNACKS.filter(s=>filter==="All"||s.category===filter).filter(s=>!q||s.name.toLowerCase().includes(q.toLowerCase())||s.brand.toLowerCase().includes(q.toLowerCase())).sort((a,z)=>sort==="top"?z.rating-a.rating:sort==="newest"?new Date(z.date)-new Date(a.date):a.name.localeCompare(z.name));
  const top3=[...COMMUNITY_SNACKS].sort((a,b)=>b.rating-a.rating).slice(0,3);

  return (
    <div>
      <div style={{borderRadius:18,overflow:"hidden",marginBottom:22,boxShadow:"0 4px 20px rgba(0,0,0,.08)"}}>
        <Checker style={{padding:"22px 24px 0"}}>
          <div style={{background:"rgba(255,255,255,.93)",borderRadius:"14px 14px 0 0",padding:"18px 20px"}}>
            <div style={{fontFamily:F,fontWeight:900,fontSize:20,color:B.ink,marginBottom:3}}>Community Picks 🏆</div>
            <div style={{fontFamily:FS,fontSize:14,color:B.mid,lineHeight:1.5,marginBottom:14}}>
              Real reviews from real snack obsessives. Right now that's just <strong style={{color:B.coral}}>Miraya</strong> — as more people join, the best community-rated snacks will surface here too. 🥨
            </div>
            <div style={{fontFamily:F,fontWeight:800,fontSize:12,textTransform:"uppercase",letterSpacing:1,color:B.muted,marginBottom:8}}>🔥 Top Rated Right Now</div>
            <div style={{display:"flex",flexDirection:"column",gap:7,paddingBottom:4}}>
              {top3.map((s,i)=>(
                <div key={s.id} onClick={()=>setDetail(s)} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"8px 10px",borderRadius:10,background:i===0?B.coralBg:B.white,border:`1.5px solid ${i===0?B.coral+"44":B.border}`,transition:"transform .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateX(3px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform=""}>
                  <div style={{fontSize:16,width:22,textAlign:"center"}}>{i===0?"🥇":i===1?"🥈":"🥉"}</div>
                  <div style={{flex:1}}><div style={{fontFamily:F,fontWeight:800,fontSize:13,color:B.ink}}>{s.name}</div><div style={{fontFamily:FS,fontSize:11,color:B.muted}}>{s.brand}</div></div>
                  <div style={{fontFamily:F,fontWeight:900,fontSize:15,color:rc(s.rating)}}>{s.rating}/10</div>
                </div>
              ))}
            </div>
          </div>
        </Checker>
        <Squiggle color="rgba(255,255,255,.93)" h={20}/>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
        <input style={{flex:1,minWidth:160,padding:"9px 14px",borderRadius:12,border:`2px solid ${B.border}`,fontFamily:FS,fontSize:14,background:B.white,color:B.ink}} placeholder="🔍 Search community picks…" value={q} onChange={e=>setQ(e.target.value)}/>
        <select style={{padding:"9px 14px",borderRadius:12,border:`2px solid ${B.border}`,fontFamily:F,fontWeight:700,fontSize:13,background:B.white,color:B.mid,cursor:"pointer"}} value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="top">Highest Rated</option><option value="newest">Newest First</option><option value="az">A → Z</option>
        </select>
      </div>
      <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:20}}>
        {cats.map(c=><button key={c} className="press" onClick={()=>setFilter(c)} style={{padding:"6px 14px",borderRadius:20,cursor:"pointer",border:`2px solid ${filter===c?B.blue:B.border}`,background:filter===c?B.blueBg:B.white,color:filter===c?B.blue:B.mid,fontFamily:F,fontWeight:700,fontSize:12,transition:"all .14s"}}>{c}</button>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:14}}>
        {shown.map(s=><SnackCard key={s.id} snack={s} onClick={setDetail} showReviewer/>)}
      </div>
      {detail&&<DetailModal snack={detail} onClose={()=>setDetail(null)} readOnly onEdit={()=>{}} onDelete={()=>{}}/>}
    </div>
  );
}

/* ─── RECS TAB ─── */
function RecsTab({snacks}) {
  const [mood,setMood]=useState("");
  const [load,setLoad]=useState(false);
  const [recs,setRecs]=useState(null);
  const [err,setErr]=useState(null);

  const go=async()=>{
    setLoad(true);setErr(null);setRecs(null);
    try{
      const myLog=snacks.length?snacks.map(s=>`"${s.name}" — ${s.rating}/10, flavors: ${s.flavors?.join(", ")||"unspecified"}`).join("\n"):"No personal snacks logged yet.";
      const top=COMMUNITY_SNACKS.filter(s=>s.rating>=8).map(s=>`"${s.name}" — ${s.rating}/10`).join("\n");
      const res=await fetch("/api/recs",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({myLog,communityTop:top,mood}),
      });
      const data=await res.json();
      if(data.error)throw new Error(data.error);
      setRecs(data.recs);
    }catch(e){setErr("Something went wrong: "+e.message);}
    setLoad(false);
  };

  return (
    <div>
      <div style={{background:B.yellowBg,border:`2px solid ${B.yellow}`,borderRadius:18,padding:"18px 22px",marginBottom:20,display:"flex",alignItems:"center",gap:14}}>
        <div style={{fontSize:32}}>🧬</div>
        <div>
          <div style={{fontFamily:F,fontWeight:900,fontSize:15,color:B.ink,marginBottom:2}}> Snack Recs ✨ </div>
          <div style={{fontFamily:FS,fontSize:13,color:B.mid,lineHeight:1.5}}>Tell us what your craving and we'll suggest snacks based on your flavor profile and community picks.</div>
        </div>
      </div>
      <div style={{marginBottom:20}}>
        <div style={{fontFamily:F,fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:1,color:B.muted,marginBottom:8}}>What are you feeling right now? (optional)</div>
        <div style={{display:"flex",gap:10}}>
          <input style={{flex:1,padding:"10px 14px",borderRadius:12,border:`2px solid ${B.border}`,fontFamily:FS,fontSize:14,background:B.white,color:B.ink}} placeholder="e.g. crunchy + salty, movie night, need chocolate stat…" value={mood} onChange={e=>setMood(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}/>
          <button onClick={go} disabled={load} className="press" style={{padding:"10px 22px",borderRadius:12,border:"none",background:load?B.border:B.coral,color:load?B.mid:B.white,cursor:load?"default":"pointer",fontFamily:F,fontWeight:900,fontSize:14,boxShadow:load?"none":"0 4px 16px rgba(240,123,107,.4)",whiteSpace:"nowrap"}}>{load?"…":"Get Recs ✨"}</button>
        </div>
      </div>
      {load&&<div style={{textAlign:"center",padding:"52px 20px"}}><Spinner/><div style={{fontFamily:F,fontWeight:700,fontSize:15,color:B.mid,marginTop:12}}>Analyzing your snack DNA… 🧬</div></div>}
      {err&&<div style={{background:"#FFF0F0",border:"2px solid #ffd5d5",borderRadius:12,padding:"14px 18px",marginBottom:16,fontFamily:FS,fontSize:14,color:"#c0392b"}}>{err}</div>}
      {recs&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14}}>
          {recs.map((r,i)=>(
            <div key={i} className="lift pop" style={{background:B.white,borderRadius:18,overflow:"hidden",border:`2px solid ${B.border}`,boxShadow:"0 2px 8px rgba(0,0,0,.05)",animationDelay:`${i*.07}s`}}>
              <div style={{height:5,background:`linear-gradient(90deg,${B.yellow},${B.coral})`}}/>
              <div style={{padding:"16px 17px"}}>
                <div style={{fontSize:30,marginBottom:8}}>{r.emoji||"🍿"}</div>
                <div style={{fontFamily:F,fontWeight:900,fontSize:16,color:B.ink,marginBottom:2}}>{r.name}</div>
                <div style={{fontFamily:FS,fontSize:12,color:B.muted,marginBottom:10}}>{r.brand}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>{(r.tags||[]).map(t=><span key={t} style={{background:B.blueBg,color:B.blue,borderRadius:20,padding:"2px 9px",fontFamily:F,fontWeight:700,fontSize:11}}>{t}</span>)}</div>
                <div style={{fontFamily:FS,fontStyle:"italic",fontSize:13,color:B.mid,lineHeight:1.55,marginBottom:10}}>{r.why}</div>
                <div style={{fontFamily:FS,fontSize:12,color:B.muted,borderTop:`1px solid ${B.border}`,paddingTop:9}}>📍 {r.where}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!recs&&!load&&<div style={{textAlign:"center",padding:"40px 20px"}}><div style={{fontSize:44,marginBottom:10}}>✨</div><div style={{fontFamily:F,fontWeight:700,fontSize:15,color:B.mid}}>Hit "Get Recs" for AI snack suggestions based on your taste!</div></div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════ */
export default function App() {
  const [session,setSession] = useState(null);   // { user, token }
  const [tab,setTab]         = useState("community");
  const [snacks,setSnacks]   = useState([]);
  const [loadingSnacks,setLoadingSnacks] = useState(false);
  const [showAdd,setShowAdd] = useState(false);
  const [detail,setDetail]   = useState(null);
  const [editing,setEditing] = useState(null);

  /* Restore session from localStorage */
  useEffect(()=>{
    try{
      const s=localStorage.getItem("osg_session");
      if(s)setSession(JSON.parse(s));
    }catch{}
  },[]);

  /* Load snacks when session changes */
  useEffect(()=>{
    if(!session)return;
    if(IS_DEMO){
      // Demo: use localStorage
      try{setSnacks(JSON.parse(localStorage.getItem("osg_snacks")||"[]"))}catch{setSnacks([])}
      return;
    }
    setLoadingSnacks(true);
    sb.getSnacks(session.token,session.user.id)
      .then(data=>setSnacks(Array.isArray(data)?data:[]))
      .finally(()=>setLoadingSnacks(false));
  },[session]);

  const onAuth=(user,token)=>{
    const s={user,token};
    setSession(s);
    try{localStorage.setItem("osg_session",JSON.stringify(s))}catch{}
  };

  const logout=async()=>{
    if(!IS_DEMO&&session)await sb.signOut(session.token);
    setSession(null);setSnacks([]);
    try{localStorage.removeItem("osg_session")}catch{}
  };

  const addSnack=async(f)=>{
    if(IS_DEMO){
      const ns={...f,id:Date.now().toString()};
      const next=[...snacks,ns];
      setSnacks(next);
      try{localStorage.setItem("osg_snacks",JSON.stringify(next))}catch{}
    }else{
      const [ns]=await sb.addSnack(session.token,{...f,user_id:session.user.id,flavors:f.flavors});
      if(ns)setSnacks(p=>[...p,ns]);
    }
    setShowAdd(false);
  };

  const updateSnack=async(f)=>{
    if(IS_DEMO){
      const next=snacks.map(s=>s.id===f.id?f:s);
      setSnacks(next);
      try{localStorage.setItem("osg_snacks",JSON.stringify(next))}catch{}
    }else{
      const [ns]=await sb.updateSnack(session.token,f.id,f);
      if(ns)setSnacks(p=>p.map(s=>s.id===f.id?ns:s));
    }
    setEditing(null);setDetail(null);
  };

  const deleteSnack=async(id)=>{
    if(!window.confirm("Delete this snack?"))return;
    if(IS_DEMO){
      const next=snacks.filter(s=>s.id!==id);
      setSnacks(next);
      try{localStorage.setItem("osg_snacks",JSON.stringify(next))}catch{}
    }else{
      await sb.deleteSnack(session.token,id);
      setSnacks(p=>p.filter(s=>s.id!==id));
    }
    setDetail(null);
  };

  const openEdit=s=>{setDetail(null);setTimeout(()=>setEditing(s),120)};

  if(!session) return <AuthScreen onAuth={onAuth}/>;

  const userName = session.user?.user_metadata?.name || session.user?.email?.split("@")[0] || "Snacker";
  const TABS=[{id:"community",l:"Community 🏆"},{id:"log",l:"My Log 🍿"},{id:"recs",l:"Get Recs ✨"}];

  return (
    <div style={{fontFamily:FS,background:B.cream,minHeight:"100vh"}}>
      <header style={{background:B.white,borderBottom:`3px solid ${B.border}`,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 16px rgba(0,0,0,.06)"}}>
        <div style={{maxWidth:880,margin:"0 auto",padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <Logo sm/>
          <nav style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} className="press" style={{padding:"8px 14px",borderRadius:20,border:"none",cursor:"pointer",fontFamily:F,fontWeight:900,fontSize:12,background:tab===t.id?B.coral:"transparent",color:tab===t.id?B.white:B.mid,transition:"all .18s",boxShadow:tab===t.id?"0 3px 12px rgba(240,123,107,.4)":"none"}}>{t.l}</button>
            ))}
          </nav>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:B.coralBg,border:`2px solid ${B.coral}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F,fontWeight:900,fontSize:14,color:B.coral}}>
                {userName[0].toUpperCase()}
              </div>
              <span style={{fontFamily:F,fontWeight:700,fontSize:13,color:B.mid}}>{userName}</span>
            </div>
            <button onClick={logout} style={{padding:"6px 12px",borderRadius:20,border:`1.5px solid ${B.border}`,background:"transparent",color:B.muted,cursor:"pointer",fontFamily:F,fontWeight:700,fontSize:12}}>Log out</button>
          </div>
        </div>
      </header>

      <main style={{maxWidth:880,margin:"0 auto",padding:"22px 20px 100px"}}>
        {tab==="community" && <CommunityTab/>}
        {tab==="log"       && <LogTab snacks={snacks} onCardClick={setDetail} loading={loadingSnacks}/>}
        {tab==="recs"      && <RecsTab snacks={snacks}/>}
      </main>

      <button onClick={()=>setShowAdd(true)} className="press" style={{position:"fixed",bottom:28,right:28,width:62,height:62,borderRadius:"50%",background:B.coral,color:B.white,border:"none",fontSize:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 6px 28px rgba(240,123,107,.55)",zIndex:200}}>＋</button>

      {showAdd  && <SnackModal onClose={()=>setShowAdd(false)} onSave={addSnack}/>}
      {editing  && <SnackModal onClose={()=>setEditing(null)}  onSave={updateSnack} edit={editing}/>}
      {detail   && <DetailModal snack={detail} onClose={()=>setDetail(null)} onEdit={openEdit} onDelete={deleteSnack}/>}
    </div>
  );
}

