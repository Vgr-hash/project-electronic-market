package az.meisetmagazasi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import az.meisetmagazasi.dto.OrderRequest;
import az.meisetmagazasi.exception.AppException;
import az.meisetmagazasi.model.Category;
import az.meisetmagazasi.model.CustomerOrder;
import az.meisetmagazasi.model.Product;
import az.meisetmagazasi.repository.OrderItemRepository;
import az.meisetmagazasi.repository.OrderRepository;
import az.meisetmagazasi.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class OrderServiceTest {

    private final ProductRepository products = mock(ProductRepository.class);
    private final OrderRepository orders = mock(OrderRepository.class);
    private final OrderItemRepository items = mock(OrderItemRepository.class);
    private final OrderService service = new OrderService(products, orders, items);

    private Product product(int id, String price) {
        return new Product(id, new Category("Test"), "Məhsul " + id, null, new BigDecimal(price), null);
    }

    private OrderRequest request(OrderRequest.Item... items) {
        return new OrderRequest("Ali Əliyev", "+994501234567", "Bakı, Nizami küç. 1", "", List.of(items));
    }

    @Test
    void totalIsCalculatedFromDatabasePriceAndQuantitiesAreMerged() {
        when(products.findById(1)).thenReturn(Optional.of(product(1, "100.00")));
        when(orders.save(any(CustomerOrder.class))).thenAnswer(inv -> inv.getArgument(0));

        service.create(request(new OrderRequest.Item(1, 2), new OrderRequest.Item(1, 1)));

        ArgumentCaptor<CustomerOrder> captor = ArgumentCaptor.forClass(CustomerOrder.class);
        verify(orders).save(captor.capture());
        assertEquals(0, new BigDecimal("300.00").compareTo(captor.getValue().getTotal()));
    }

    @Test
    void unknownProductIsRejectedWithoutSavingOrder() {
        when(products.findById(99)).thenReturn(Optional.empty());

        assertThrows(AppException.class, () -> service.create(request(new OrderRequest.Item(99, 1))));
        verifyNoInteractions(orders);
    }

    @Test
    void mergedQuantityAboveLimitIsRejected() {
        assertThrows(AppException.class,
                () -> service.create(request(new OrderRequest.Item(1, 60), new OrderRequest.Item(1, 60))));
        verifyNoInteractions(orders);
    }
}
