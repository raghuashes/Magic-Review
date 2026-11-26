package com.magicreview.service;

import com.magicreview.dto.AttributeRequest;
import com.magicreview.dto.AttributeResponse;
import com.magicreview.dto.SuggestAttributesResponse;
import com.magicreview.entity.Store;
import com.magicreview.entity.StoreAttribute;
import com.magicreview.exception.ResourceNotFoundException;
import com.magicreview.integration.GeminiApiClient;
import com.magicreview.repository.StoreAttributeRepository;
import com.magicreview.util.CategoryDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class StoreAttributeService {

    private final StoreAttributeRepository attributeRepository;
    private final StoreService storeService;
    private final GeminiApiClient geminiApiClient;

    public StoreAttributeService(StoreAttributeRepository attributeRepository,
                                 StoreService storeService,
                                 GeminiApiClient geminiApiClient) {
        this.attributeRepository = attributeRepository;
        this.storeService = storeService;
        this.geminiApiClient = geminiApiClient;
    }

    @Transactional(readOnly = true)
    public List<AttributeResponse> getAttributesForStore(UUID storeId, UUID userId) {
        storeService.findStoreAndValidateOwner(storeId, userId);
        return attributeRepository.findAllByStoreIdOrderByDisplayOrderAscCreatedAtAsc(storeId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttributeResponse createAttribute(UUID storeId, UUID userId, AttributeRequest request) {
        Store store = storeService.findStoreAndValidateOwner(storeId, userId);

        String source = request.getSource() != null && !request.getSource().isBlank()
                ? request.getSource()
                : "MERCHANT_CREATED";

        StoreAttribute attribute = new StoreAttribute(
                store,
                request.getLabel().trim(),
                request.getActive() != null ? request.getActive() : true,
                request.getDisplayOrder() != null ? request.getDisplayOrder() : 0,
                source
        );

        StoreAttribute saved = attributeRepository.save(attribute);
        return mapToResponse(saved);
    }

    @Transactional
    public AttributeResponse updateAttribute(UUID storeId, UUID attributeId, UUID userId, AttributeRequest request) {
        storeService.findStoreAndValidateOwner(storeId, userId);

        StoreAttribute attribute = attributeRepository.findByIdAndStoreId(attributeId, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Attribute not found with id: " + attributeId));

        attribute.setLabel(request.getLabel().trim());
        if (request.getActive() != null) attribute.setActive(request.getActive());
        if (request.getDisplayOrder() != null) attribute.setDisplayOrder(request.getDisplayOrder());
        if (request.getSource() != null && !request.getSource().isBlank()) {
            attribute.setSource(request.getSource());
        }

        StoreAttribute updated = attributeRepository.save(attribute);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteAttribute(UUID storeId, UUID attributeId, UUID userId) {
        storeService.findStoreAndValidateOwner(storeId, userId);

        StoreAttribute attribute = attributeRepository.findByIdAndStoreId(attributeId, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Attribute not found with id: " + attributeId));

        attributeRepository.delete(attribute);
    }

    /**
     * AI-Powered Attribute Suggestion using Gemini API with smart fallback.
     */
    @Transactional(readOnly = true)
    public SuggestAttributesResponse suggestAttributesWithAi(UUID storeId, UUID userId) {
        Store store = storeService.findStoreAndValidateOwner(storeId, userId);

        List<String> existingLabels = attributeRepository.findAllByStoreIdOrderByDisplayOrderAscCreatedAtAsc(storeId)
                .stream()
                .map(StoreAttribute::getLabel)
                .collect(Collectors.toList());

        String category = store.getBusinessCategory() != null && !store.getBusinessCategory().isBlank()
                ? store.getBusinessCategory()
                : "Other / Custom Business";

        List<String> suggestions = geminiApiClient.suggestAttributes(
                category,
                store.getName(),
                store.getDescription(),
                store.getSpecialties(),
                existingLabels
        );

        return new SuggestAttributesResponse(category, store.getName(), suggestions);
    }

    /**
     * Applies default attributes for a specific business category.
     * Preserves existing custom/AI attributes and only adds missing category defaults.
     */
    @Transactional
    public List<AttributeResponse> applyCategoryDefaults(UUID storeId, UUID userId, String category) {
        Store store = storeService.findStoreAndValidateOwner(storeId, userId);

        String targetCategory = category != null && !category.isBlank()
                ? category
                : store.getBusinessCategory();

        List<String> defaults = CategoryDefaults.getDefaultsForCategory(targetCategory);

        List<StoreAttribute> currentAttrs = attributeRepository.findAllByStoreIdOrderByDisplayOrderAscCreatedAtAsc(storeId);
        Set<String> existingLower = currentAttrs.stream()
                .map(a -> a.getLabel().toLowerCase().trim())
                .collect(Collectors.toSet());

        int nextOrder = currentAttrs.size();
        for (String def : defaults) {
            if (!existingLower.contains(def.toLowerCase().trim())) {
                StoreAttribute newAttr = new StoreAttribute(store, def, true, nextOrder++, "DEFAULT");
                attributeRepository.save(newAttr);
                existingLower.add(def.toLowerCase().trim());
            }
        }

        return attributeRepository.findAllByStoreIdOrderByDisplayOrderAscCreatedAtAsc(storeId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Batch creates / saves attributes for a store.
     */
    @Transactional
    public List<AttributeResponse> batchCreateAttributes(UUID storeId, UUID userId, List<AttributeRequest> requests) {
        Store store = storeService.findStoreAndValidateOwner(storeId, userId);

        List<StoreAttribute> currentAttrs = attributeRepository.findAllByStoreIdOrderByDisplayOrderAscCreatedAtAsc(storeId);
        Set<String> existingLower = currentAttrs.stream()
                .map(a -> a.getLabel().toLowerCase().trim())
                .collect(Collectors.toSet());

        int nextOrder = currentAttrs.size();
        List<AttributeResponse> created = new ArrayList<>();

        for (AttributeRequest req : requests) {
            if (req.getLabel() != null && !req.getLabel().isBlank()) {
                String cleanLabel = req.getLabel().trim();
                if (!existingLower.contains(cleanLabel.toLowerCase())) {
                    String src = req.getSource() != null && !req.getSource().isBlank()
                            ? req.getSource()
                            : "AI_SUGGESTED";
                    int order = req.getDisplayOrder() != null ? req.getDisplayOrder() : nextOrder++;
                    StoreAttribute attr = new StoreAttribute(store, cleanLabel, true, order, src);
                    StoreAttribute saved = attributeRepository.save(attr);
                    existingLower.add(cleanLabel.toLowerCase());
                    created.add(mapToResponse(saved));
                }
            }
        }

        return created;
    }

    /**
     * Reorders attributes for a store given an ordered list of IDs.
     */
    @Transactional
    public List<AttributeResponse> reorderAttributes(UUID storeId, UUID userId, List<UUID> attributeIdsInOrder) {
        storeService.findStoreAndValidateOwner(storeId, userId);

        if (attributeIdsInOrder == null || attributeIdsInOrder.isEmpty()) {
            return getAttributesForStore(storeId, userId);
        }

        for (int i = 0; i < attributeIdsInOrder.size(); i++) {
            UUID attrId = attributeIdsInOrder.get(i);
            Optional<StoreAttribute> opt = attributeRepository.findByIdAndStoreId(attrId, storeId);
            if (opt.isPresent()) {
                StoreAttribute attr = opt.get();
                attr.setDisplayOrder(i);
                attributeRepository.save(attr);
            }
        }

        return getAttributesForStore(storeId, userId);
    }

    private AttributeResponse mapToResponse(StoreAttribute a) {
        return new AttributeResponse(
                a.getId(),
                a.getStore().getId(),
                a.getLabel(),
                a.getActive(),
                a.getDisplayOrder(),
                a.getSource(),
                a.getCreatedAt()
        );
    }
}
