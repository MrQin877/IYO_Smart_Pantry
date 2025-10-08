export function saveRegisterEmail(email){ 
  localStorage.setItem("registerEmail", email); 
}
export function getRegisterEmail(){ 
  return localStorage.getItem("registerEmail") || ""; 
}
export function saveUserID(id){ 
  localStorage.setItem("userID", id); 
}
export function getUserID(){ 
  return localStorage.getItem("userID"); 
}
export function clearAuth(){ 
  localStorage.removeItem("userID"); 
}