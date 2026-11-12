package az.meisetmagazasi.repository;

import az.meisetmagazasi.model.Product;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductRepository extends JpaRepository<Product, Integer> {

    @Query("select p from Product p join fetch p.category order by p.id")
    List<Product> findAllWithCategory();
}
