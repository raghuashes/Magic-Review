package com.magicreview.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class AttributeResponse {
    private UUID id;
    private UUID storeId;
    private String label;
    private Boolean active;
    private Integer displayOrder;
    private String source = "MERCHANT_CREATED";
    private OffsetDateTime createdAt;

    public AttributeResponse() {
    }

    public AttributeResponse(UUID id, UUID storeId, String label, Boolean active, Integer displayOrder, OffsetDateTime createdAt) {
        this(id, storeId, label, active, displayOrder, "MERCHANT_CREATED", createdAt);
    }

    public AttributeResponse(UUID id, UUID storeId, String label, Boolean active, Integer displayOrder, String source, OffsetDateTime createdAt) {
        this.id = id;
        this.storeId = storeId;
        this.label = label;
        this.active = active;
        this.displayOrder = displayOrder;
        this.source = source != null && !source.isBlank() ? source : "MERCHANT_CREATED";
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

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
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

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
