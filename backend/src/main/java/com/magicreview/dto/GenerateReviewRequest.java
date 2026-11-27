package com.magicreview.dto;

import com.magicreview.enums.LanguageStyle;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class GenerateReviewRequest {

    @NotBlank(message = "Category is required")
    private String category;

    private String businessCategory;

    private String businessName;

    private String businessDescription;

    private String specialties;

    private List<String> attributes = new ArrayList<>();

    private String customerNote;

    private String customerFeedback;

    @NotNull(message = "Language style is required and must be ENGLISH, TELUGU_ENGLISH_MIX, or HINGLISH")
    private LanguageStyle languageStyle = LanguageStyle.TELUGU_ENGLISH_MIX;

    private List<String> previousReviews = new ArrayList<>();

    private Integer starRating = 5;

    private String tone = "FRIENDLY";

    public GenerateReviewRequest() {
    }

    public GenerateReviewRequest(String category, List<String> attributes, String customerNote, LanguageStyle languageStyle) {
        this.category = category;
        this.attributes = attributes != null ? attributes : new ArrayList<>();
        this.customerNote = customerNote;
        this.customerFeedback = customerNote;
        this.languageStyle = languageStyle;
        this.previousReviews = new ArrayList<>();
    }

    public GenerateReviewRequest(String category, List<String> attributes, String customerNote,
                                 LanguageStyle languageStyle, List<String> previousReviews) {
        this.category = category;
        this.attributes = attributes != null ? attributes : new ArrayList<>();
        this.customerNote = customerNote;
        this.customerFeedback = customerNote;
        this.languageStyle = languageStyle;
        this.previousReviews = previousReviews != null ? previousReviews : new ArrayList<>();
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getBusinessCategory() {
        return businessCategory;
    }

    public void setBusinessCategory(String businessCategory) {
        this.businessCategory = businessCategory;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getBusinessDescription() {
        return businessDescription;
    }

    public void setBusinessDescription(String businessDescription) {
        this.businessDescription = businessDescription;
    }

    public String getSpecialties() {
        return specialties;
    }

    public void setSpecialties(String specialties) {
        this.specialties = specialties;
    }

    public List<String> getAttributes() {
        return attributes;
    }

    public void setAttributes(List<String> attributes) {
        this.attributes = attributes != null ? attributes : new ArrayList<>();
    }

    public String getCustomerNote() {
        return customerNote;
    }

    public void setCustomerNote(String customerNote) {
        this.customerNote = customerNote;
        if (this.customerFeedback == null || this.customerFeedback.isBlank()) {
            this.customerFeedback = customerNote;
        }
    }

    public String getCustomerFeedback() {
        return customerFeedback;
    }

    public void setCustomerFeedback(String customerFeedback) {
        this.customerFeedback = customerFeedback;
        if (this.customerNote == null || this.customerNote.isBlank()) {
            this.customerNote = customerFeedback;
        }
    }

    public String getEffectiveFeedback() {
        if (customerFeedback != null && !customerFeedback.isBlank()) {
            return customerFeedback.trim();
        }
        if (customerNote != null && !customerNote.isBlank()) {
            return customerNote.trim();
        }
        return "";
    }

    public LanguageStyle getLanguageStyle() {
        return languageStyle;
    }

    public void setLanguageStyle(LanguageStyle languageStyle) {
        this.languageStyle = languageStyle;
    }

    public List<String> getPreviousReviews() {
        return previousReviews;
    }

    public void setPreviousReviews(List<String> previousReviews) {
        this.previousReviews = previousReviews != null ? previousReviews : new ArrayList<>();
    }

    public Integer getStarRating() {
        return starRating != null ? starRating : 5;
    }

    public void setStarRating(Integer starRating) {
        this.starRating = starRating;
    }

    public String getTone() {
        return tone != null ? tone : "FRIENDLY";
    }

    public void setTone(String tone) {
        this.tone = tone;
    }
}
