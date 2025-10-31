// src/components/InventoryList.jsx
import "./InventoryList.css";

export default function InventoryList({ inventory }) {
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
          {inventory.map((item, idx) => (
            <tr key={idx}>
              <td>{item.name}</td>
              <td>{item.qty}</td>
              <td className="expiry-cell">{item.expiry}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
