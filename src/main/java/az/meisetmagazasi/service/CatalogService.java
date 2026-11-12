package az.meisetmagazasi.service;

import az.meisetmagazasi.dto.CategoryDto;
import az.meisetmagazasi.dto.ProductDto;
import az.meisetmagazasi.repository.CategoryRepository;
import az.meisetmagazasi.repository.ProductRepository;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CatalogService {

    private final ProductRepository products;
    private final CategoryRepository categories;

    public CatalogService(ProductRepository products, CategoryRepository categories) {
        this.products = products;
        this.categories = categories;
    }

    public List<ProductDto> products() {
        return products.findAllWithCategory().stream()
                .map(p -> new ProductDto(
                        p.getId(),
                        p.getName(),
                        p.getDescription(),
                        p.getPrice(),
                        p.getImageUrl(),
                        p.getCategory().getName()))
                .toList();
    }

    public List<CategoryDto> categories() {
        return categories.findAll(Sort.by("id")).stream()
                .map(c -> new CategoryDto(c.getId(), c.getName()))
                .toList();
    }
}
