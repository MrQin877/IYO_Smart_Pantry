const API = "http://localhost/IYO_Smart_Pantry/api/inventory";

export async function loadInventory(userID) {
  const res = await fetch(`${API}/list.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userID }),
  });

  return res.json();
}
