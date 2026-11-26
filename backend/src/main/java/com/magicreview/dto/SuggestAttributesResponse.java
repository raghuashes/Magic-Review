package com.magicreview.dto;

import java.util.ArrayList;
import java.util.List;

public class SuggestAttributesResponse {
    private String category;
    private String storeName;
    private List<String> suggestedAttributes = new ArrayList<>();

    public SuggestAttributesResponse() {
    }

    public SuggestAttributesResponse(String category, String storeName, List<String> suggestedAttributes) {
        this.category = category;
        this.storeName = storeName;
        this.suggestedAttributes = suggestedAttributes != null ? suggestedAttributes : new ArrayList<>();
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public List<String> getSuggestedAttributes() {
        return suggestedAttributes;
    }

    public void setSuggestedAttributes(List<String> suggestedAttributes) {
        this.suggestedAttributes = suggestedAttributes;
    }
}
