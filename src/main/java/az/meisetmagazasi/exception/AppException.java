package az.meisetmagazasi.exception;

import org.springframework.http.HttpStatus;

/** İstifadəçiyə göstərilə bilən, biznes qaydası ilə bağlı xəta. */
public class AppException extends RuntimeException {
    private final HttpStatus status;

    public AppException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() { return status; }
}
