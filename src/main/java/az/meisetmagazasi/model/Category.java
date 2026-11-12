package az.meisetmagazasi.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 120)
    private String name;

    protected Category() {}

    public Category(String name) {
        this.name = name;
    }

    public Integer getId() { return id; }
    public String getName() { return name; }
}
