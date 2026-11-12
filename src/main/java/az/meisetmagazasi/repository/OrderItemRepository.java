package az.meisetmagazasi.repository;
import az.meisetmagazasi.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
public interface OrderItemRepository extends JpaRepository<OrderItem,Long> {}
