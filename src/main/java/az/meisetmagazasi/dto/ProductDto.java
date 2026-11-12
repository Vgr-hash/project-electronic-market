package az.meisetmagazasi.dto;

import java.math.BigDecimal;

public record ProductDto(
        Integer id,
        String name,
        String description,
        BigDecimal price,
        String imageUrl,
        String category
) {}
