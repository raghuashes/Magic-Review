package com.magicreview.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class CategoryResponse {
    private UUID id;
    private UUID storeId;
    private String name;
    private Boolean active;
    private Integer displayOrder;
    private OffsetDateTime createdAt;

    public CategoryResponse() {
    }

    public CategoryResponse(UUID id, UUID storeId, String name, Boolean active, Integer displayOrder, OffsetDateTime createdAt) {
        this.id = id;
        this.storeId = storeId;
        this.name = name;
        this.active = active;
        this.displayOrder = displayOrder;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getStoreId() {
        return storeId;
    }

    public void setStoreId(UUID storeId) {
        this.storeId = storeId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
