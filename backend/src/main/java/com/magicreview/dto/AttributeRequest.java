package com.magicreview.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AttributeRequest {

    @NotBlank(message = "Attribute label is required")
    @Size(max = 100, message = "Attribute label cannot exceed 100 characters")
    private String label;

    private Boolean active = true;

    private Integer displayOrder = 0;

    public AttributeRequest() {
    }

    public AttributeRequest(String label, Boolean active, Integer displayOrder) {
        this.label = label;
        this.active = active;
        this.displayOrder = displayOrder;
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
}
