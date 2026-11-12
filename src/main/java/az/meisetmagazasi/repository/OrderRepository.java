package az.meisetmagazasi.repository;
import az.meisetmagazasi.model.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
public interface OrderRepository extends JpaRepository<CustomerOrder,Long> {}
