package com.magicreview.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "store_attributes")
public class StoreAttribute {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(nullable = false, length = 100)
    private String label;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "source", length = 30)
    private String source = "MERCHANT_CREATED";

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public StoreAttribute() {
    }

    public StoreAttribute(Store store, String label, Boolean active, Integer displayOrder) {
        this(store, label, active, displayOrder, "MERCHANT_CREATED");
    }

    public StoreAttribute(Store store, String label, Boolean active, Integer displayOrder, String source) {
        this.store = store;
        this.label = label;
        this.active = active != null ? active : true;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
        this.source = source != null && !source.isBlank() ? source : "MERCHANT_CREATED";
    }

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.active == null) this.active = true;
        if (this.displayOrder == null) this.displayOrder = 0;
        if (this.source == null) this.source = "MERCHANT_CREATED";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Store getStore() {
        return store;
    }

    public void setStore(Store store) {
        this.store = store;
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

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
