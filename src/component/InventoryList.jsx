import "./InventoryList.css";

export default function InventoryList({ inventory }) {

  function getExpiryStatus(expiryDate) {
    const today = new Date();
    const exp = new Date(expiryDate);

    const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    return diff;
  }

  return (
    <div className="inventory-container">
      <h3 className="inventory-title">Current Inventory</h3>
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Quantity</th>
            <th>Expiry date</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item, idx) => {
            const daysLeft = getExpiryStatus(item.expiryDate);

            let rowClass = "";
            if (item.is_plan == 1) rowClass = "highlight-plan";
            if (daysLeft <= 3) rowClass = "highlight-expiring"; // red warning

            return (
              <tr key={idx} className={rowClass}>
                <td>{item.foodName}</td>
                <td>{item.quantity} {item.unit}</td>
                <td className="expiry-cell">
                  <div>{item.expiryDate}</div>

                  {daysLeft <= 7 && (
                    <div className="expiry-warning-row pulse">
                      ⚠ {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
