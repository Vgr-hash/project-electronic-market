package az.meisetmagazasi.service;

import az.meisetmagazasi.dto.RegisterRequest;
import az.meisetmagazasi.exception.AppException;
import az.meisetmagazasi.model.AppUser;
import az.meisetmagazasi.repository.UserRepository;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository users;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository users) {
        this.users = users;
    }

    @Transactional
    public void register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmail(email)) {
            throw new AppException(HttpStatus.CONFLICT, "Bu e-poçt artıq qeydiyyatdan keçib.");
        }
        users.save(new AppUser(
                request.full_name().trim(),
                email,
                encoder.encode(request.password())));
    }
}
