package az.meisetmagazasi.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record OrderRequest(
        @NotBlank @Size(max = 120) String customer_name,
        @NotBlank @Size(max = 30)
        @Pattern(regexp = "^\\+?[0-9 ()\\-]{7,30}$", message = "Telefon nömrəsi düzgün deyil.")
        String phone,
        @NotBlank @Size(max = 500) String address,
        @Size(max = 500) String note,
        @NotEmpty @Size(max = 50) @Valid List<Item> items
) {
    public record Item(
            @NotNull Integer productId,
            @NotNull @Min(1) @Max(99) Integer quantity
    ) {}
}
