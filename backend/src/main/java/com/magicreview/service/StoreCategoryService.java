package com.magicreview.service;

import com.magicreview.dto.CategoryRequest;
import com.magicreview.dto.CategoryResponse;
import com.magicreview.entity.Store;
import com.magicreview.entity.StoreCategory;
import com.magicreview.exception.ResourceNotFoundException;
import com.magicreview.repository.StoreCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StoreCategoryService {

    private final StoreCategoryRepository categoryRepository;
    private final StoreService storeService;

    public StoreCategoryService(StoreCategoryRepository categoryRepository, StoreService storeService) {
        this.categoryRepository = categoryRepository;
        this.storeService = storeService;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesForStore(UUID storeId, UUID userId) {
        storeService.findStoreAndValidateOwner(storeId, userId);
        return categoryRepository.findAllByStoreIdOrderByDisplayOrderAscCreatedAtAsc(storeId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse createCategory(UUID storeId, UUID userId, CategoryRequest request) {
        Store store = storeService.findStoreAndValidateOwner(storeId, userId);

        StoreCategory category = new StoreCategory(
                store,
                request.getName().trim(),
                request.getActive() != null ? request.getActive() : true,
                request.getDisplayOrder() != null ? request.getDisplayOrder() : 0
        );

        StoreCategory saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(UUID storeId, UUID categoryId, UUID userId, CategoryRequest request) {
        storeService.findStoreAndValidateOwner(storeId, userId);

        StoreCategory category = categoryRepository.findByIdAndStoreId(categoryId, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        category.setName(request.getName().trim());
        if (request.getActive() != null) category.setActive(request.getActive());
        if (request.getDisplayOrder() != null) category.setDisplayOrder(request.getDisplayOrder());

        StoreCategory updated = categoryRepository.save(category);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteCategory(UUID storeId, UUID categoryId, UUID userId) {
        storeService.findStoreAndValidateOwner(storeId, userId);

        StoreCategory category = categoryRepository.findByIdAndStoreId(categoryId, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(StoreCategory c) {
        return new CategoryResponse(
                c.getId(),
                c.getStore().getId(),
                c.getName(),
                c.getActive(),
                c.getDisplayOrder(),
                c.getCreatedAt()
        );
    }
}
