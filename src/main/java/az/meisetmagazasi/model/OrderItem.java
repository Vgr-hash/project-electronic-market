package az.meisetmagazasi.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "product_id", nullable = false)
    private Integer productId;

    @Column(name = "product_name", nullable = false, length = 180)
    private String productName;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "line_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal lineTotal;

    protected OrderItem() {}

    public OrderItem(Long orderId, Product p, int qty) {
        this.orderId = orderId;
        this.productId = p.getId();
        this.productName = p.getName();
        this.unitPrice = p.getPrice();
        this.quantity = qty;
        this.lineTotal = p.getPrice().multiply(BigDecimal.valueOf(qty));
    }
}
