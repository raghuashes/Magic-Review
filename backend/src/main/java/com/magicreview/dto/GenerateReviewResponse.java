package com.magicreview.dto;

import com.magicreview.enums.LanguageStyle;
import java.time.OffsetDateTime;

public class GenerateReviewResponse {
    private String reviewText;
    private LanguageStyle languageStyle;
    private String mode; // "ai" or "demo"
    private OffsetDateTime generatedAt;

    public GenerateReviewResponse() {
    }

    public GenerateReviewResponse(String reviewText, LanguageStyle languageStyle, String mode, OffsetDateTime generatedAt) {
        this.reviewText = reviewText;
        this.languageStyle = languageStyle;
        this.mode = mode;
        this.generatedAt = generatedAt;
    }

    public String getReviewText() {
        return reviewText;
    }

    public void setReviewText(String reviewText) {
        this.reviewText = reviewText;
    }

    public LanguageStyle getLanguageStyle() {
        return languageStyle;
    }

    public void setLanguageStyle(LanguageStyle languageStyle) {
        this.languageStyle = languageStyle;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public OffsetDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(OffsetDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }
}
