package az.meisetmagazasi.dto;

import jakarta.validation.constraints.*;

public record RegisterRequest(
        @NotBlank @Size(max = 120) String full_name,
        @NotBlank @Email @Size(max = 190) String email,
        @NotBlank @Size(min = 6, max = 72) String password
) {}
