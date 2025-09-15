
const {useState, useEffect} = React;

// ---- API helpers (talk to PHP on same host) ----
const API_BASE = "/IYO_Smart_Pantry/api";  // 保持与 XAMPP 目录一致

async function postJSON(path, data){
  const res = await fetch(`${API_BASE}/${path}`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    credentials: "include",
    body: JSON.stringify(data || {})
  });
  return res.json();
}
async function getJSON(path){
  const res = await fetch(`${API_BASE}/${path}`, { credentials:"include" });
  return res.json();
}
function saveRegisterEmail(email){ localStorage.setItem("registerEmail", email); }
function getRegisterEmail(){ return localStorage.getItem("registerEmail") || ""; }
function saveUserID(id){ localStorage.setItem("userID", id); }
function getUserID(){ return localStorage.getItem("userID"); }
function clearAuth(){ localStorage.removeItem("userID"); }

// ---- shared UI bits ----
const Brand = ({right}) => (
  <div className="brand container">
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div className="logo">🥬</div>
      <div className="title">
        <div style={{letterSpacing:".3em",fontSize:12,color:"#44633c"}}>I  S m a r t</div>
        <div style={{letterSpacing:".2em",fontWeight:700}}>P a n t r y</div>
      </div>
    </div>
    <div>{right}</div>
  </div>
);
const Banner = ({b,onClose}) => b ? <div className={`banner ${b.kind==="ok"?"ok":"err"}`} onClick={onClose}>{b.msg}</div> : null;
const InputRow = ({label,type="text",value,setValue,invalid,right}) => (
  <label>
    <div className="label">{label}</div>
    <div className="row">
      <input type={type} value={value} onChange={e=>setValue(e.target.value)} />
      {invalid ? <span className="inline-icon">!</span> : right}
    </div>
  </label>
);
const Stepper = ({value,setValue}) => (
  <div className="actions">
    <button className="btn btn-secondary" onClick={()=>setValue(Math.max(1,value-1))}>-</button>
    <span>{value}</span>
    <button className="btn btn-secondary" onClick={()=>setValue(value+1)}>+</button>
  </div>
);

// ---- Pages ----
function Register({goLogin, goVerify, setBanner}){
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [pwd,setPwd]=useState("");
  const [hh,setHh]=useState(1);

  const invalid = {
    name: name.trim()==="",
    email: !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email),
    pwd: !/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};:'"\\|,.<>\/?]).{8,}$/.test(pwd)
  };

  async function submit(){
    if (invalid.name || invalid.email || invalid.pwd) {
      setBanner({kind:"err", msg:"请修正红色提示的字段"}); return;
    }
    const resp = await postJSON("register.php", { fullName:name, email, password:pwd, householdSize:hh });
    if (resp.ok){
      saveRegisterEmail(email);
      setBanner({kind:"ok", msg:"注册成功，请查收邮箱验证码"});
      setRoute("register-success");   // 👈 instead of goVerify
    }
    else{
      setBanner({kind:"err", msg:resp.error||"注册失败"});
    }
  }

  async function resend(){
    const resp = await postJSON("request_code.php", { email });
    setBanner(resp.ok ? {kind:"ok", msg:"验证码已重发"} : {kind:"err", msg:resp.error||"发送失败"});
  }

  return (
    <div className="container">
      <Brand right={<button className="btn btn-primary" onClick={goLogin}>Login</button>} />
      <div className="card grid grid-2">
        <div className="h-hero" style={{display:"none"}}>
          <img src="https://images.unsplash.com/photo-1625246333195-78f8b4aefcea?q=80&w=1400&auto=format&fit=crop" />
        </div>
        <div>
          <div className="hr"></div>
          <h1 className="h1" style={{textAlign:"center"}}>Register</h1>
          <InputRow label="User Full Name" value={name} setValue={setName} invalid={invalid.name} />
          <InputRow label="Email" value={email} setValue={setEmail} invalid={invalid.email} />
          <InputRow label="Password" type="password" value={pwd} setValue={setPwd} invalid={invalid.pwd} />
          <div>
            <div className="label">Household Size (Optional)</div>
            <Stepper value={hh} setValue={setHh} />
          </div>
          <div style={{marginTop:18}}>
            <button className="btn btn-primary" style={{width:"100%"}} onClick={submit}>Sign Up</button>
          </div>
          <div style={{marginTop:10,fontSize:14,opacity:.8,textAlign:"center"}}>
            没收到邮件？点击 <b style={{textDecoration:"underline",cursor:"pointer"}} onClick={resend}>重新发送</b>
          </div>
        </div>
      </div>
    </div>
  );
}

function Login({goRegister, onLoggedIn, setBanner}){
  const [email,setEmail]=useState("");
  const [pwd,setPwd]=useState("");
  const invalid={ email:!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email), pwd: pwd.length===0 };

  async function submit(){
    if (invalid.email || invalid.pwd) { setBanner({kind:"err", msg:"Invalid email or password"}); return; }
    const resp = await postJSON("login.php", { email, password: pwd });
    if (resp.ok){
      saveUserID(resp.userID);
      setBanner({kind:"ok", msg:"Login success"});
      onLoggedIn();
    }else{
      setBanner({kind:"err", msg: resp.error || "Login failed"});
    }
  }

  return (
    <div className="container">
      <Brand right={<button className="btn btn-primary" onClick={goRegister}>Register</button>} />
      <div className="card grid grid-2">
        <div>
          <div className="hr" style={{marginLeft:0}}></div>
          <h1 className="h1">Login</h1>
          <InputRow label="Email" value={email} setValue={setEmail} invalid={invalid.email} />
          <InputRow label="Password" type="password" value={pwd} setValue={setPwd} invalid={invalid.pwd} />
          <div className="actions">
            <button className="btn btn-primary" onClick={submit}>Login</button>
          </div>
        </div>
        <div className="h-hero" style={{display:"none"}}>
          <img src="https://images.unsplash.com/photo-1604908554027-4127fb021402?q=80&w=1400&auto=format&fit=crop" />
        </div>
      </div>
    </div>
  );
}

function Verify({goLogin, setBanner}){
  const [email,setEmail]=useState(getRegisterEmail());
  const [code,setCode]=useState("");
  const [pwd,setPwd]=useState("");
  const invalid={
    email: !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email),
    code: !/^\d{6}$/.test(code),
    pwd: !/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};:'"\\|,.<>\/?]).{8,}$/.test(pwd)
  };

  async function submit(){
  if (invalid.code || invalid.pwd) {
    setBanner({kind:"err", msg:"验证码/密码不正确"}); 
    return;
  }
  const resp = await postJSON("verify_complete.php", { 
    code, 
    newPassword: pwd 
  });
  if (resp.ok){ 
    setBanner({kind:"ok", msg:"账号已激活，请登录"}); 
    goLogin(); 
  }
  else { 
    setBanner({kind:"err", msg: resp.error || "激活失败"}); 
  }
}


  return (
    <div className="container">
      <Brand/>
      <div className="card">
        <h1 className="h1" style={{textAlign:"center"}}>Verification</h1>
        <div style={{maxWidth:520, margin:"0 auto"}}>
          <InputRow label="Email" value={email} setValue={setEmail} invalid={invalid.email} />
          <InputRow label="Verification Code" value={code} setValue={setCode} invalid={invalid.code} />
          <InputRow label="New Password" type="password" value={pwd} setValue={setPwd} invalid={invalid.pwd} />
          <div style={{textAlign:"center",marginTop:16}}>
            <button className="btn btn-primary" onClick={submit}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterSuccess({goLogin, setBanner}) {
  const [timer,setTimer]=React.useState(60);
  const [canResend,setCanResend]=React.useState(false);
  const email = getRegisterEmail();

  React.useEffect(()=>{
    if(timer>0){
      const t=setInterval(()=>setTimer(x=>x-1),1000);
      return ()=>clearInterval(t);
    } else {
      setCanResend(true);
    }
  },[timer]);

  async function resend(){
    const resp = await postJSON("request_code.php",{ email });
    setBanner(resp.ok ? {kind:"ok",msg:"验证码已重发"} : {kind:"err",msg:resp.error||"发送失败"});
    setTimer(60);
    setCanResend(false);
  }

  return (
    <div className="container">
      <Brand/>
      <div className="card">
        <h1 className="h1" style={{textAlign:"center"}}>Registration Successful 🎉</h1>
        <p style={{textAlign:"center"}}>We have sent a verification email to <b>{email}</b>.  
        Please click the link in the email to verify your account.</p>
        <p style={{textAlign:"center"}}>Resend available in {timer}s</p>
        {canResend && <div style={{textAlign:"center"}}><button className="btn btn-secondary" onClick={resend}>Resend Email</button></div>}
        <div style={{textAlign:"center", marginTop:20}}>
          <button className="btn btn-primary" onClick={goLogin}>Back to Login</button>
        </div>
      </div>
    </div>
  );
}


function Settings({setBanner}){
  const [twoFA,setTwoFA]=useState(true);
  const [visible,setVisible]=useState(false);
  const [notif,setNotif]=useState(true);

  useEffect(()=>{
    getJSON("settings.php").then(resp=>{
      if (resp.ok && resp.settings){
        setTwoFA(!!resp.settings.twoFA);
        setVisible(!!resp.settings.foodVisibility);
        setNotif(!!resp.settings.notification);
      }
    });
  },[]);

  async function save(){
    const resp = await postJSON("settings.php", { twoFA: twoFA?1:0, foodVisibility: visible?1:0, notification: notif?1:0 });
    setBanner(resp.ok ? {kind:"ok", msg:"Settings saved"} : {kind:"err", msg:resp.error||"Save failed"});
  }

  return (
    <div className="container">
      <Brand right={<div className="actions"><button className="btn btn-secondary" onClick={()=>{clearAuth();location.reload();}}>Logout</button></div>} />
      <div className="card grid" style={{gridTemplateColumns:"220px 1fr"}}>
        <div className="side">
          <button className="tab active">Setting</button>
        </div>
        <div>
          <h1 className="h1">Privacy & Security</h1>
          <div className="card" style={{padding:16}}>
            <div className="row" style={{justifyContent:"space-between",border:"none"}}>
              <div>Two-Factor Verification</div>
              <button className={`toggle ${twoFA?'on':''}`} onClick={()=>setTwoFA(!twoFA)}><span></span></button>
            </div>
            <div className="row" style={{justifyContent:"space-between",border:"none"}}>
              <div>Food Listing Visibility</div>
              <button className={`toggle ${visible?'on':''}`} onClick={()=>setVisible(!visible)}><span></span></button>
            </div>
            <div className="row" style={{justifyContent:"space-between",border:"none"}}>
              <div>Notification</div>
              <button className={`toggle ${notif?'on':''}`} onClick={()=>setNotif(!notif)}><span></span></button>
            </div>
          </div>
          <div className="actions" style={{marginTop:12}}>
            <button className="btn btn-secondary" onClick={()=>location.reload()}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Root app (no router,最简单方式) ----
function App(){
  // 获取初始路由
  const getInitialRoute = () => {
    const hash = window.location.hash.replace("#/","");
    if (["register","register-success","login","verify","settings"].includes(hash)) {
      return hash;
    }
    return "register"; // 默认
  };

  const [route,setRoute] = useState(getInitialRoute());
  const [banner,setBanner] = useState(null);

  function onLoggedIn(){ 
    setRoute("settings"); 
    window.location.hash = "#/settings"; // 同步到URL
  }

  // 监听 hash 变化
  useEffect(()=>{
    function onHashChange(){
      const hash = window.location.hash.replace("#/","");
      if (["register","register-success","login","verify","settings"].includes(hash)) {
        setRoute(hash);
      }
    }
    window.addEventListener("hashchange", onHashChange);
    return ()=>window.removeEventListener("hashchange", onHashChange);
  },[]);

  return (
    <>
      {route==="register" && 
        <Register 
          goLogin={()=>{setRoute("login");window.location.hash="#/login";}} 
          setBanner={setBanner} 
          setRoute={setRoute}
        />}
      {route==="register-success" && 
        <RegisterSuccess 
          goLogin={()=>{setRoute("login");window.location.hash="#/login";}} 
          setBanner={setBanner}
        />}
      {route==="login" && 
        <Login 
          goRegister={()=>{setRoute("register");window.location.hash="#/register";}} 
          onLoggedIn={onLoggedIn} 
          setBanner={setBanner}
        />}
      {route==="verify" && 
        <Verify 
          goLogin={()=>{setRoute("login");window.location.hash="#/login";}} 
          setBanner={setBanner}
        />}
      {route==="settings" && <Settings setBanner={setBanner}/>}
      <Banner b={banner} onClose={()=>setBanner(null)} />
    </>
  );
}



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
