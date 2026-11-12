package az.meisetmagazasi.controller;

import az.meisetmagazasi.dto.OrderRequest;
import az.meisetmagazasi.service.OrderService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody OrderRequest request) {
        Long id = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.<String, Object>of("success", true, "order_id", id,
                        "message", "Sifariş uğurla qəbul edildi."));
    }
}
