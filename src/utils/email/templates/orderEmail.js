export const customerOrderTemplate = (order) => {
  const itemsHtml = order.orderItems
    .map(
      (item) => `
        <tr>
            <td>${item.title}</td>
            <td>${item.quantity}</td>
            <td>${item.price}</td>
        </tr>
        `,
    )
    .join("");

  return `
        <h2>Order confirmation</h2>
        <p>Thank you for your order.</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <table border="1" cellpadding="8" cellspacing="0">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>

    <p>
      <strong>Total:</strong> $${order.totalPrice}
    </p>

     <p>
      Status: ${order.orderStatus}
    </p>
    `;
};
