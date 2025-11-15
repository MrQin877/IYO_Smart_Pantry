import "./InventoryList.css";
import { Calendar, Clock } from "lucide-react";

export default function InventoryList({ inventory }) {

  function getExpiryStatus(expiryDate) {
    const today = new Date();
    const exp = new Date(expiryDate);

    const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    return diff;
  }

  // Function to check if an item is expiring soon (within 3 days)
  const isExpiringSoon = (expiryDate) => {
    const daysLeft = getExpiryStatus(expiryDate);
    return daysLeft <= 3 && daysLeft >= 0;
  };

  return (
    <div className="inventory-container">
      <h3 className="inventory-title">Current Inventory</h3>
      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Expiry date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(
              (inventory || [])
                .filter(item => Number(item.quantity ?? item.qty ?? item.availableQty ?? 0) > 0)
                .map((item, idx) => {
              const daysLeft = getExpiryStatus(item.expiryDate);
              const isPlanned = item.is_plan === 1;
              const isExpiring = isExpiringSoon(item.expiryDate);

              let rowClass = "";
              if (isPlanned) rowClass = "highlight-plan";
              if (isExpiring) rowClass += " expiring-row";

              return (
                <tr key={idx} className={rowClass}>
                  <td>{item.foodName}</td>
                  <td>{item.quantity} {item.unit}</td>
                  <td className="expiry-cell">
                    <div>{item.expiryDate}</div>
                  </td>
                  <td className="status-cell">
                    {isPlanned && (
                      <div className="status-badge planned">
                        <Calendar size={12} />
                        <span>Planned</span>
                      </div>
                    )}
                    {isExpiring && (
                      <div className="status-badge expiring">
                        <Clock size={12} />
                        <span>
                          {daysLeft === 0 ? "Expires today" : 
                           daysLeft === 1 ? "Expires tomorrow" : 
                           `Expires in ${daysLeft} days`}
                        </span>
                      </div>
                    )}
                    {!isPlanned && !isExpiring && (
                      <div className="status-badge available">
                        <span>Available</span>
                      </div>
                    )}
                  </td>
                </tr>
              );
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}