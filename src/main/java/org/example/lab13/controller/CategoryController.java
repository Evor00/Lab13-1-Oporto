package org.example.lab13.controller;

import org.example.lab13.model.Category;
import org.example.lab13.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    // 1. LEER (Read)
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // 2. CREAR (Create)
    @PostMapping
    public Category createCategory(@RequestBody Category category) {
        return categoryRepository.save(category);
    }

    // 3. ACTUALIZAR (Update) - NUEVO
    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category categoryDetails) {
        Optional<Category> category = categoryRepository.findById(id);
        if (category.isPresent()) {
            Category updatedCategory = category.get();
            updatedCategory.setName(categoryDetails.getName());
            return ResponseEntity.ok(categoryRepository.save(updatedCategory));
        }
        return ResponseEntity.notFound().build();
    }

    // 4. ELIMINAR (Delete) - NUEVO
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        if (categoryRepository.existsById(id)) {
            // OJO: Si la categoría está siendo usada por productos, la base de datos
            // podría lanzar un error de integridad referencial dependiendo de la configuración.
            // Para este laboratorio lo haremos simple.
            categoryRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}