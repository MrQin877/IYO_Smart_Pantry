const { useState } = React;

// IYO Smart Pantry – UI Prototype (React + Tailwind, plain JS)
// Screens: Register, Login, Verify, Account Settings (Setting/My Details/Reset Password)
// This is pure JSX (no TypeScript). Works with Vite (React) or with Babel Standalone.

function SmartPantryUI() {
  const [route, setRoute] = useState("register"); // 'register' | 'login' | 'verify' | 'acct:setting' | 'acct:details' | 'acct:reset'
  const [banner, setBanner] = useState(null);

  const Frame = ({ children }) => (
    <div className="min-h-screen bg-[#f6f5ea] text-[#1f2a24]">
      <div className="mx-auto max-w-[1150px] px-5 py-5">{children}</div>
    </div>
  );

  return (
    <Frame>
      {route.startsWith("acct:") ? (
        <AccountShell route={route} setRoute={setRoute} setBanner={setBanner} />
      ) : route === "register" ? (
        <RegisterPage goLogin={() => setRoute("login")} goVerify={() => setRoute("verify")} setBanner={setBanner} />
      ) : route === "login" ? (
        <LoginPage goRegister={() => setRoute("register")} onLoggedIn={() => setRoute("acct:setting")} setBanner={setBanner} />
      ) : (
        <VerifyPage goLogin={() => setRoute("login")} setBanner={setBanner} />
      )}

      {banner && (
        <div
          className={`fixed left-0 right-0 top-3 z-50 mx-auto w-fit rounded-full border px-4 py-2 shadow ${
            banner.kind === "ok"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
          onClick={() => setBanner(null)}
        >
          {banner.msg}
        </div>
      )}
    </Frame>
  );
}

// ---------------------------------------------------------
// Brand Header
// ---------------------------------------------------------
const Brand = ({ right }) => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-[#7ea36b] text-white">
          <span className="text-xl">🥬</span>
        </div>
        <div className="leading-5">
          <div className="text-xs tracking-[0.3em] text-[#44633c]">I  S m a r t</div>
          <div className="-mt-0.5 text-lg font-semibold tracking-[0.2em] text-[#1f2a24]">P a n t r y</div>
        </div>
      </div>
      <div>{right}</div>
    </div>
  );
};

// ---------------------------------------------------------
// Reusable bits
// ---------------------------------------------------------
const Exclaim = () => (
  <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-red-100 text-[13px] font-bold text-red-600">!</span>
);

const InputRow = ({ label, type = "text", value, setValue, placeholder, invalid, rightSlot }) => (
  <label className="mb-5 block">
    <div className="mb-1 pl-1 text-sm tracking-wide text-[#1f2a24]">{label}</div>
    <div className="flex items-center gap-3 border-b border-[#1f2a24]/50 pb-2">
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none placeholder:text-[#1f2a24]/40"
      />
      {invalid ? <Exclaim /> : rightSlot}
    </div>
  </label>
);

const PrimaryBtn = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`rounded-xl bg-[#a9bf98] px-8 py-3 font-semibold tracking-wide text-[#243324] shadow hover:bg-[#9db58d] active:translate-y-[1px] ${className}`}
  >
    {children}
  </button>
);

const SecondaryBtn = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`rounded-xl bg-white px-6 py-2 font-semibold text-[#243324] shadow ring-1 ring-black/5 hover:bg-neutral-50 ${className}`}
  >
    {children}
  </button>
);

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative h-7 w-12 rounded-full transition-colors ${checked ? "bg-[#7ea36b]" : "bg-neutral-300"}`}
    aria-pressed={checked}
  >
    <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${checked ? "left-6" : "left-0.5"}`}></span>
  </button>
);

const Stepper = ({ value, setValue }) => (
  <div className="inline-flex items-center gap-2">
    <button className="grid h-8 w-8 place-items-center rounded bg-white shadow ring-1 ring-black/5" onClick={()=>setValue(Math.max(1, value-1))}>-</button>
    <span className="inline-block w-6 text-center">{value}</span>
    <button className="grid h-8 w-8 place-items-center rounded bg-white shadow ring-1 ring-black/5" onClick={()=>setValue(value+1)}>+</button>
  </div>
);

const CheckRow = ({ title, checked, setChecked, icon, helper }) => (
  <div className="flex items-center justify-between border-b py-5">
    <div className="flex items-center gap-3">
      <div className="text-xl opacity-70">{icon || "🧩"}</div>
      <div>
        <div className="font-medium">{title}</div>
        {helper && <div className="text-sm text-black/50">{helper}</div>}
      </div>
    </div>
    <Toggle checked={checked} onChange={setChecked} />
  </div>
);

// ---------------------------------------------------------
//  Register
// ---------------------------------------------------------
function RegisterPage({ goLogin, goVerify, setBanner }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [hh, setHh] = useState(1);
  const invalid = {
    name: name.trim()==="",
    email: !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email),
    pwd: !/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};:'"\\|,.<>\/?]).{8,}$/.test(pwd),
  };

  const heroImg = "https://images.unsplash.com/photo-1625246333195-78f8b4aefcea?q=80&w=1400&auto=format&fit=crop";

  const submit = () => {
    if (invalid.name || invalid.email || invalid.pwd) {
      setBanner({ kind: "err", msg: "Please fix highlighted fields." });
      return;
    }
    setBanner({ kind: "ok", msg: "Registered. Check email for 6-digit code." });
    goVerify();
  };

  return (
    <div>
      <Brand right={<PrimaryBtn onClick={goLogin}>Login</PrimaryBtn>} />

      <div className="grid grid-cols-1 gap-8 rounded-2xl border border-[#7ea36b] bg-[#f6f5ea] p-6 shadow md:grid-cols-2">
        {/* Left hero */}
        <div className="relative hidden overflow-hidden rounded-[48px] bg-[#e8efdE] md:block">
          <img src={heroImg} alt="garden" className="h-full w-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"/>
          <div className="absolute bottom-8 left-8 right-10 text-white">
            <h2 className="mb-3 text-4xl font-bold leading-tight">Your Journey to<br/>Fresh Begins<br/>Here.</h2>
          </div>
        </div>

        {/* Right form */}
        <div className="mx-auto w-full max-w-xl self-center">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-2 h-[1px] w-56 bg-black/50"/>
            <h1 className="text-3xl font-extrabold">Register</h1>
          </div>

          <InputRow label="User Full Name" value={name} setValue={setName} invalid={invalid.name} />
          <InputRow label="Email" value={email} setValue={setEmail} invalid={invalid.email} />
          <InputRow label="Password" type="password" value={pwd} setValue={setPwd} invalid={invalid.pwd} />

          <div className="mb-8">
            <div className="mb-2 pl-1 text-sm">Household Size (Optional)</div>
            <Stepper value={hh} setValue={setHh} />
          </div>

          <PrimaryBtn className="w-full" onClick={submit}>Sign Up</PrimaryBtn>

          <div className="mt-6 text-center text-sm text-black/70">
            Didn’t receive email? You can <b className="cursor-pointer underline" onClick={()=>setBanner({kind:"ok", msg:"New verification code sent."})}>request</b> new code
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
//  Login
// ---------------------------------------------------------
function LoginPage({ goRegister, onLoggedIn, setBanner }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const invalid = {
    email: !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email),
    pwd: pwd.length === 0
  };

  const heroImg = "https://images.unsplash.com/photo-1604908554027-4127fb021402?q=80&w=1400&auto=format&fit=crop";

  const submit = () => {
    if (invalid.email || invalid.pwd) {
      setBanner({ kind: "err", msg: "Invalid email or password" });
      return;
    }
    setBanner({ kind: "ok", msg: "Login success" });
    onLoggedIn();
  };

  return (
    <div>
      <Brand right={<PrimaryBtn onClick={goRegister}>Register</PrimaryBtn>} />

      <div className="grid grid-cols-1 gap-8 rounded-2xl border border-[#7ea36b] p-6 shadow md:grid-cols-2">
        {/* Left form */}
        <div className="mx-auto w-full max-w-xl self-center">
          <div className="mb-8 text-left">
            <div className="mb-2 h-[1px] w-56 bg-black/50"/>
            <h1 className="text-3xl font-extrabold">Login</h1>
          </div>

          <InputRow label="Email" value={email} setValue={setEmail} invalid={invalid.email} />
          <InputRow label="Password" type="password" value={pwd} setValue={setPwd} invalid={invalid.pwd} />

          <div className="flex items-center gap-3">
            <PrimaryBtn onClick={submit}>Login</PrimaryBtn>
            <span className="text-red-500">{invalid.email || invalid.pwd ? <Exclaim/> : null}</span>
          </div>
        </div>

        {/* Right image */}
        <div className="relative hidden overflow-hidden rounded-[48px] md:block">
          <img src={heroImg} alt="fridge" className="h-full w-full object-cover"/>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
//  Verify (Two-Factor during registration)
// ---------------------------------------------------------
function VerifyPage({ goLogin, setBanner }){
  const [code, setCode] = useState("");
  const [pwd, setPwd] = useState("");

  const invalid = {
    code: !/^\d{6}$/.test(code),
    pwd: !/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};:'"\\|,.<>\/?]).{8,}$/.test(pwd)
  };

  const submit=()=>{
    if (invalid.code || invalid.pwd) {
      setBanner({kind:"err", msg:"Invalid code or weak password"});
      return;
    }
    setBanner({kind:"ok", msg:"Account verified. You can login now."});
    goLogin();
  };

  return (
    <div>
      <Brand />
      <div className="rounded-2xl border border-[#7ea36b] bg-white/60 p-10 shadow">
        <h1 className="mb-10 text-center text-3xl font-extrabold tracking-wide text-[#234]">Verification Link</h1>
        <div className="mx-auto max-w-lg rounded-3xl bg-[#eaf0e3] p-8 shadow">
          <div className="mb-6 text-center text-2xl font-black">Two-Factor Verification</div>
          <InputRow label="Verification Code" value={code} setValue={setCode} placeholder="6 digits" invalid={invalid.code} />
          <InputRow label="New Password" type="password" value={pwd} setValue={setPwd} invalid={invalid.pwd} />
          <div className="mt-6 text-center">
            <PrimaryBtn onClick={submit}>Submit</PrimaryBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
//  Account Shell (top bar + tabs)
// ---------------------------------------------------------
function AccountShell({ route, setRoute, setBanner }){
  const [openEdit, setOpenEdit] = useState(false);

  return (
    <div>
      <Brand right={<TopIcons/>} />
      <div className="rounded-3xl border border-[#7ea36b] bg-white/60 p-6 shadow">
        <h1 className="mb-6 text-center text-3xl font-extrabold">Account Setting</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
          <div className="rounded-3xl bg-[#eaf0e3] p-4">
            <SideTab label="Setting" active={route==="acct:setting"} onClick={()=>setRoute("acct:setting")} />
            <SideTab label="My Details" active={route==="acct:details"} onClick={()=>setRoute("acct:details")} />
            <SideTab label="Reset Password" active={route==="acct:reset"} onClick={()=>setRoute("acct:reset")} />
          </div>

          {route === "acct:setting" && <SettingTab setBanner={setBanner} />}
          {route === "acct:details" && <DetailsTab onEdit={()=>setOpenEdit(true)} />}
          {route === "acct:reset" && <ResetTab setBanner={setBanner} />}
        </div>
      </div>

      {openEdit && <EditModal onClose={()=>setOpenEdit(false)} />}
    </div>
  );
}

const TopIcons = () => (
  <div className="flex items-center gap-4">
    <span className="grid h-9 w-9 place-items-center rounded-full bg-white shadow ring-1 ring-black/5">🔔</span>
    <span className="grid h-9 w-9 place-items-center rounded-full bg-white shadow ring-1 ring-black/5">🧑</span>
    <span className="grid h-9 w-9 place-items-center rounded-full bg-white shadow ring-1 ring-black/5">⚙️</span>
  </div>
);

const SideTab = ({ label, active, onClick })=>{
  return (
    <button
      onClick={onClick}
      className={`mb-3 w-full rounded-2xl px-5 py-3 text-left font-semibold transition ${
        active ? "bg-white shadow ring-1 ring-black/5" : "bg-[#eaf0e3] hover:bg-white/70"
      }`}
    >
      {label}
    </button>
  );
};

// ---- Setting Tab ----
function SettingTab({ setBanner }){
  const [twoFA, setTwoFA] = useState(true);
  const [visible, setVisible] = useState(false);
  const [notif, setNotif] = useState(true);

  const save=()=>{
    setBanner({kind:"ok", msg:"Settings saved"});
  };

  return (
    <div className="rounded-3xl bg-[#f3f6ef] p-6">
      <div className="mb-6 text-xl font-bold">Privacy and Security Setting</div>

      <div className="divide-y rounded-2xl bg-white p-4 shadow ring-1 ring-black/5">
        <CheckRow title="Two-Factor Verification" checked={twoFA} setChecked={setTwoFA} icon={<span>🪪</span>} />
        <CheckRow title="Food Listing Visibility" checked={visible} setChecked={setVisible} icon={<span>👁️</span>} />
        <CheckRow title="Notification" checked={notif} setChecked={setNotif} icon={<span>🔔</span>} />
      </div>

      <div className="mt-6 flex gap-3">
        <SecondaryBtn>Cancel</SecondaryBtn>
        <PrimaryBtn onClick={save}>Save</PrimaryBtn>
      </div>
    </div>
  );
}

// ---- Details Tab ----
function DetailsTab({ onEdit }){
  const [name, setName] = useState("Kuan Zhen Qing");
  const [hh, setHh] = useState(2);
  const [email, setEmail] = useState("kuanzhenqing@gmail.com");
  const [phone, setPhone] = useState("");
  const [label, setLabel] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");

  return (
    <div className="rounded-3xl bg-[#f3f6ef] p-6">
      <div className="mb-3 text-xl font-bold">My Details</div>
      <div className="grid grid-cols-1 gap-5 rounded-2xl bg-white p-6 shadow ring-1 ring-black/5 md:grid-cols-2">
        <InputRow label="Name" value={name} setValue={setName} />
        <div>
          <div className="mb-1 pl-1 text-sm">Household Size</div>
          <Stepper value={hh} setValue={setHh} />
        </div>
        <InputRow label="Email Address" value={email} setValue={setEmail} />
        <InputRow label="Phone Number" value={phone} setValue={setPhone} />

        <div className="md:col-span-2"/>

        <InputRow label="Label" value={label} setValue={setLabel} />
        <InputRow label="Line 1" value={line1} setValue={setLine1} />
        <InputRow label="Line 2" value={line2} setValue={setLine2} />
        <InputRow label="Postcode" value={postcode} setValue={setPostcode} />
        <InputRow label="City" value={city} setValue={setCity} />
        <InputRow label="State" value={state} setValue={setState} />
        <InputRow label="Country" value={country} setValue={setCountry} />
      </div>

      <div className="mt-6 text-right">
        <PrimaryBtn onClick={onEdit}>Edit</PrimaryBtn>
      </div>
    </div>
  );
}

// ---- Reset Password Tab ----
function ResetTab({ setBanner }){
  const [cur, setCur] = useState("");
  const [pwd, setPwd] = useState("");
  const [cfm, setCfm] = useState("");
  const [code, setCode] = useState("");

  const sendCode = ()=>{
    setBanner({kind:"ok", msg:"Verification code sent to your email"});
  };

  const submit = ()=>{
    if (pwd !== cfm) return setBanner({kind:"err", msg:"Passwords do not match"});
    if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};:'"\\|,.<>\/?]).{8,}$/.test(pwd)) return setBanner({kind:"err", msg:"Weak new password"});
    if (!/^\d{6}$/.test(code)) return setBanner({kind:"err", msg:"Invalid code"});
    setBanner({kind:"ok", msg:"Password updated"});
  };

  return (
    <div className="rounded-3xl bg-[#f3f6ef] p-6">
      <div className="mb-3 text-xl font-bold">Reset Password</div>
      <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-black/5">
        <InputRow label="Current Password" type="password" value={cur} setValue={setCur} />
        <InputRow label="New Password" type="password" value={pwd} setValue={setPwd} />
        <InputRow label="Confirm Password" type="password" value={cfm} setValue={setCfm} />
        <InputRow label="Verification Code" value={code} setValue={setCode} rightSlot={<button onClick={sendCode} className="text-sm underline">Get the verification code</button>} />

        <div className="mt-4 text-center">
          <PrimaryBtn onClick={submit}>Submit</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ---- Edit Modal ----
const EditModal = ({ onClose }) => {
  const [name, setName] = useState("Kuan Zhen Qing");
  const [hh, setHh] = useState(2);
  const [email, setEmail] = useState("kuanzhenqing@gmail.com");
  const [phone, setPhone] = useState("-");
  const [addr, setAddr] = useState("12, Jalan Ultraman 12/59 Taman Ultraman\n75000 Melaka\nMalaysia");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-semibold">Edit</div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-[#e8eee1] font-bold">×</button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputRow label="Name" value={name} setValue={setName} />
          <div>
            <div className="mb-1 pl-1 text-sm">Household Size</div>
            <Stepper value={hh} setValue={setHh} />
          </div>
          <InputRow label="Email Address" value={email} setValue={setEmail} />
          <InputRow label="Phone Number" value={phone} setValue={setPhone} />
          <label className="md:col-span-2">
            <div className="mb-1 pl-1 text-sm">Address</div>
            <textarea value={addr} onChange={e=>setAddr(e.target.value)} rows={5} className="w-full resize-none rounded-xl border border-black/10 bg-neutral-50 p-3 outline-none"/>
          </label>
        </div>

        <div className="mt-5 text-right">
          <PrimaryBtn onClick={onClose}>Save</PrimaryBtn>
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<SmartPantryUI />);

