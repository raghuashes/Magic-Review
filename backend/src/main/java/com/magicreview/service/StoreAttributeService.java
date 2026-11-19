package com.magicreview.service;

import com.magicreview.dto.AttributeRequest;
import com.magicreview.dto.AttributeResponse;
import com.magicreview.entity.Store;
import com.magicreview.entity.StoreAttribute;
import com.magicreview.exception.ResourceNotFoundException;
import com.magicreview.repository.StoreAttributeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StoreAttributeService {

    private final StoreAttributeRepository attributeRepository;
    private final StoreService storeService;

    public StoreAttributeService(StoreAttributeRepository attributeRepository, StoreService storeService) {
        this.attributeRepository = attributeRepository;
        this.storeService = storeService;
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

        StoreAttribute attribute = new StoreAttribute(
                store,
                request.getLabel().trim(),
                request.getActive() != null ? request.getActive() : true,
                request.getDisplayOrder() != null ? request.getDisplayOrder() : 0
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

    private AttributeResponse mapToResponse(StoreAttribute a) {
        return new AttributeResponse(
                a.getId(),
                a.getStore().getId(),
                a.getLabel(),
                a.getActive(),
                a.getDisplayOrder(),
                a.getCreatedAt()
        );
    }
}
