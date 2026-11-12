package az.meisetmagazasi.repository;

import az.meisetmagazasi.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<AppUser, Long> {
    boolean existsByEmail(String email);
}
