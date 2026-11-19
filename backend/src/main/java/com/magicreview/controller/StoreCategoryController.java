package com.magicreview.controller;

import com.magicreview.dto.CategoryRequest;
import com.magicreview.dto.CategoryResponse;
import com.magicreview.security.UserDetailsImpl;
import com.magicreview.service.StoreCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/stores/{storeId}/categories")
@Tag(name = "Store Categories", description = "CRUD operations for store service categories")
public class StoreCategoryController {

    private final StoreCategoryService categoryService;

    public StoreCategoryController(StoreCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    @Operation(summary = "List all categories for a specific store")
    public ResponseEntity<List<CategoryResponse>> listCategories(@AuthenticationPrincipal UserDetailsImpl userPrincipal,
                                                                 @PathVariable UUID storeId) {
        List<CategoryResponse> categories = categoryService.getCategoriesForStore(storeId, userPrincipal.getId());
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    @Operation(summary = "Create a category for a store")
    public ResponseEntity<CategoryResponse> createCategory(@AuthenticationPrincipal UserDetailsImpl userPrincipal,
                                                           @PathVariable UUID storeId,
                                                           @Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(storeId, userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{categoryId}")
    @Operation(summary = "Update an existing category")
    public ResponseEntity<CategoryResponse> updateCategory(@AuthenticationPrincipal UserDetailsImpl userPrincipal,
                                                           @PathVariable UUID storeId,
                                                           @PathVariable UUID categoryId,
                                                           @Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.updateCategory(storeId, categoryId, userPrincipal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{categoryId}")
    @Operation(summary = "Delete a category")
    public ResponseEntity<Void> deleteCategory(@AuthenticationPrincipal UserDetailsImpl userPrincipal,
                                               @PathVariable UUID storeId,
                                               @PathVariable UUID categoryId) {
        categoryService.deleteCategory(storeId, categoryId, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }
}
