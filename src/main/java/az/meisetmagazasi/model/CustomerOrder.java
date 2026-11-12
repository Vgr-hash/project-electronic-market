package az.meisetmagazasi.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class CustomerOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_name", nullable = false, length = 120)
    private String customerName;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(length = 500)
    private String note;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @Column(nullable = false, length = 30)
    private String status = "Yeni";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    protected CustomerOrder() {}

    public CustomerOrder(String name, String phone, String address, String note, BigDecimal total) {
        this.customerName = name;
        this.phone = phone;
        this.address = address;
        this.note = note;
        this.total = total;
    }

    public Long getId() { return id; }
    public String getStatus() { return status; }
    public BigDecimal getTotal() { return total; }
}
