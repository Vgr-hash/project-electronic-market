package az.meisetmagazasi.controller;

import az.meisetmagazasi.dto.CategoryDto;
import az.meisetmagazasi.dto.ProductDto;
import az.meisetmagazasi.service.CatalogService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CatalogController {

    private final CatalogService service;

    public CatalogController(CatalogService service) {
        this.service = service;
    }

    @GetMapping("/products")
    public List<ProductDto> products() {
        return service.products();
    }

    @GetMapping("/categories")
    public List<CategoryDto> categories() {
        return service.categories();
    }
}
