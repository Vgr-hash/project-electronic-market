package az.meisetmagazasi.service;

import az.meisetmagazasi.dto.OrderRequest;
import az.meisetmagazasi.exception.AppException;
import az.meisetmagazasi.model.CustomerOrder;
import az.meisetmagazasi.model.OrderItem;
import az.meisetmagazasi.model.Product;
import az.meisetmagazasi.repository.OrderItemRepository;
import az.meisetmagazasi.repository.OrderRepository;
import az.meisetmagazasi.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    static final int MAX_QUANTITY_PER_PRODUCT = 99;

    private final ProductRepository products;
    private final OrderRepository orders;
    private final OrderItemRepository items;

    public OrderService(ProductRepository products, OrderRepository orders, OrderItemRepository items) {
        this.products = products;
        this.orders = orders;
        this.items = items;
    }

    @Transactional
    public Long create(OrderRequest request) {
        // Eyni məhsul bir neçə dəfə gəlibsə, miqdarları birləşdiririk.
        Map<Integer, Integer> merged = new LinkedHashMap<>();
        for (OrderRequest.Item item : request.items()) {
            merged.merge(item.productId(), item.quantity(), Integer::sum);
        }

        BigDecimal total = BigDecimal.ZERO;
        List<Map.Entry<Product, Integer>> resolved = new ArrayList<>();

        for (Map.Entry<Integer, Integer> entry : merged.entrySet()) {
            int qty = entry.getValue();
            if (qty < 1 || qty > MAX_QUANTITY_PER_PRODUCT) {
                throw new AppException(HttpStatus.BAD_REQUEST,
                        "Eyni məhsuldan sifariş sayı 1-99 aralığında olmalıdır.");
            }
            Product product = products.findById(entry.getKey())
                    .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST,
                            "Məhsul tapılmadı (id: " + entry.getKey() + ")."));
            resolved.add(Map.entry(product, qty));
            // Qiymət yalnız bazadan götürülür, brauzerdən gələn qiymətə etibar edilmir.
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(qty)));
        }

        CustomerOrder order = orders.save(new CustomerOrder(
                request.customer_name().trim(),
                request.phone().trim(),
                request.address().trim(),
                request.note() == null ? "" : request.note().trim(),
                total));

        List<OrderItem> rows = resolved.stream()
                .map(e -> new OrderItem(order.getId(), e.getKey(), e.getValue()))
                .toList();
        items.saveAll(rows);
        return order.getId();
    }
}
