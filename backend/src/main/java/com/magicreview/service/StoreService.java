package com.magicreview.service;

import com.magicreview.dto.AttributeResponse;
import com.magicreview.dto.CategoryResponse;
import com.magicreview.dto.PublicStoreResponse;
import com.magicreview.dto.StoreRequest;
import com.magicreview.dto.StoreResponse;
import com.magicreview.entity.Store;
import com.magicreview.entity.StoreAttribute;
import com.magicreview.entity.StoreCategory;
import com.magicreview.entity.User;
import com.magicreview.exception.BadRequestException;
import com.magicreview.exception.ResourceNotFoundException;
import com.magicreview.exception.UnauthorizedException;
import com.magicreview.repository.StoreAttributeRepository;
import com.magicreview.repository.StoreCategoryRepository;
import com.magicreview.repository.StoreRepository;
import com.magicreview.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class StoreService {

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final StoreCategoryRepository categoryRepository;
    private final StoreAttributeRepository attributeRepository;

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    public StoreService(StoreRepository storeRepository,
                        UserRepository userRepository,
                        StoreCategoryRepository categoryRepository,
                        StoreAttributeRepository attributeRepository) {
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.attributeRepository = attributeRepository;
    }

    @Transactional(readOnly = true)
    public List<StoreResponse> getStoresForUser(UUID userId) {
        return storeRepository.findAllByOwnerIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToStoreResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StoreResponse getStoreById(UUID storeId, UUID userId) {
        Store store = findStoreAndValidateOwner(storeId, userId);
        return mapToStoreResponse(store);
    }

    @Transactional
    public StoreResponse createStore(UUID userId, StoreRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String slug = request.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = slugify(request.getName());
        } else {
            slug = slugify(slug);
        }

        // Ensure unique slug
        String candidateSlug = slug;
        int counter = 1;
        while (storeRepository.existsBySlug(candidateSlug)) {
            candidateSlug = slug + "-" + counter;
            counter++;
        }
        slug = candidateSlug;

        Store store = new Store(
                user,
                request.getName().trim(),
                slug,
                request.getDescription(),
                request.getLogoUrl(),
                request.getPrimaryColor(),
                request.getSecondaryColor(),
                request.getGoogleReviewUrl().trim(),
                request.getActive() != null ? request.getActive() : true
        );
        store.setPosterUrl(request.getPosterUrl());

        Store savedStore = storeRepository.save(store);

        // Seed default starter categories
        List<String> defaultCats = List.of("General Experience", "Customer Service", "Product Quality", "Store Ambience");
        for (int i = 0; i < defaultCats.size(); i++) {
            StoreCategory cat = new StoreCategory(savedStore, defaultCats.get(i), true, i);
            categoryRepository.save(cat);
        }

        // Seed default starter attributes
        List<String> defaultAttrs = List.of("Helpful Staff", "Fair Pricing", "Quick Service", "Hygienic & Clean", "Wide Variety");
        for (int i = 0; i < defaultAttrs.size(); i++) {
            StoreAttribute attr = new StoreAttribute(savedStore, defaultAttrs.get(i), true, i);
            attributeRepository.save(attr);
        }

        return mapToStoreResponse(savedStore);
    }

    @Transactional
    public StoreResponse updateStore(UUID storeId, UUID userId, StoreRequest request) {
        Store store = findStoreAndValidateOwner(storeId, userId);

        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            String newSlug = slugify(request.getSlug());
            if (!newSlug.equalsIgnoreCase(store.getSlug())) {
                if (storeRepository.existsBySlug(newSlug)) {
                    throw new BadRequestException("Slug '" + newSlug + "' is already in use by another store");
                }
                store.setSlug(newSlug);
            }
        }

        store.setName(request.getName().trim());
        store.setDescription(request.getDescription());
        store.setLogoUrl(request.getLogoUrl());
        store.setPosterUrl(request.getPosterUrl());
        if (request.getPrimaryColor() != null) store.setPrimaryColor(request.getPrimaryColor());
        if (request.getSecondaryColor() != null) store.setSecondaryColor(request.getSecondaryColor());
        store.setGoogleReviewUrl(request.getGoogleReviewUrl().trim());
        if (request.getActive() != null) store.setActive(request.getActive());

        Store updatedStore = storeRepository.save(store);
        return mapToStoreResponse(updatedStore);
    }

    @Transactional
    public void deleteStore(UUID storeId, UUID userId) {
        Store store = findStoreAndValidateOwner(storeId, userId);
        storeRepository.delete(store);
    }

    @Transactional(readOnly = true)
    public PublicStoreResponse getPublicStoreBySlug(String slug) {
        Store store = storeRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found or inactive: " + slug));

        List<CategoryResponse> categories = categoryRepository
                .findAllByStoreIdAndActiveTrueOrderByDisplayOrderAscCreatedAtAsc(store.getId())
                .stream()
                .map(c -> new CategoryResponse(c.getId(), store.getId(), c.getName(), c.getActive(), c.getDisplayOrder(), c.getCreatedAt()))
                .collect(Collectors.toList());

        List<AttributeResponse> attributes = attributeRepository
                .findAllByStoreIdAndActiveTrueOrderByDisplayOrderAscCreatedAtAsc(store.getId())
                .stream()
                .map(a -> new AttributeResponse(a.getId(), store.getId(), a.getLabel(), a.getActive(), a.getDisplayOrder(), a.getCreatedAt()))
                .collect(Collectors.toList());

        return new PublicStoreResponse(
                store.getId(),
                store.getName(),
                store.getSlug(),
                store.getDescription(),
                store.getLogoUrl(),
                store.getPosterUrl(),
                store.getPrimaryColor(),
                store.getSecondaryColor(),
                store.getGoogleReviewUrl(),
                categories,
                attributes
        );
    }

    public Store findStoreAndValidateOwner(UUID storeId, UUID userId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + storeId));
        if (!store.getOwner().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to access or modify this store");
        }
        return store;
    }

    public StoreResponse mapToStoreResponse(Store store) {
        String publicUrl = frontendBaseUrl + "/s/" + store.getSlug();
        String qrCodeUrl = "/api/stores/" + store.getId() + "/qr";

        return new StoreResponse(
                store.getId(),
                store.getName(),
                store.getSlug(),
                store.getDescription(),
                store.getLogoUrl(),
                store.getPosterUrl(),
                store.getPrimaryColor(),
                store.getSecondaryColor(),
                store.getGoogleReviewUrl(),
                store.getActive(),
                qrCodeUrl,
                publicUrl,
                store.getCreatedAt(),
                store.getUpdatedAt()
        );
    }

    private String slugify(String input) {
        if (input == null || input.isBlank()) return "store-" + UUID.randomUUID().toString().substring(0, 8);
        String nowhitespace = WHITESPACE.matcher(input.trim().toLowerCase(Locale.ROOT)).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        slug = slug.replaceAll("-+", "-").replaceAll("^-|-$", "");
        return slug.isEmpty() ? "store-" + UUID.randomUUID().toString().substring(0, 8) : slug;
    }
}
