package com.magicreview.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class StoreResponse {
    private UUID id;
    private String name;
    private String slug;
    private String description;
    private String logoUrl;
    private String posterUrl;
    private String primaryColor;
    private String secondaryColor;
    private String googleReviewUrl;
    private Boolean active;
    private String qrCodeUrl;
    private String publicUrl;
    private String phone;
    private String whatsapp;
    private String address;
    private String instagramUrl;
    private String websiteUrl;
    private String facebookUrl;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public StoreResponse() {
    }

    public StoreResponse(UUID id, String name, String slug, String description, String logoUrl,
                         String posterUrl, String primaryColor, String secondaryColor, String googleReviewUrl,
                         Boolean active, String qrCodeUrl, String publicUrl,
                         OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.logoUrl = logoUrl;
        this.posterUrl = posterUrl;
        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;
        this.googleReviewUrl = googleReviewUrl;
        this.active = active;
        this.qrCodeUrl = qrCodeUrl;
        this.publicUrl = publicUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public StoreResponse(UUID id, String name, String slug, String description, String logoUrl,
                         String posterUrl, String primaryColor, String secondaryColor, String googleReviewUrl,
                         Boolean active, String qrCodeUrl, String publicUrl,
                         String phone, String whatsapp, String address,
                         String instagramUrl, String websiteUrl, String facebookUrl,
                         OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this(id, name, slug, description, logoUrl, posterUrl, primaryColor, secondaryColor, googleReviewUrl, active, qrCodeUrl, publicUrl, createdAt, updatedAt);
        this.phone = phone;
        this.whatsapp = whatsapp;
        this.address = address;
        this.instagramUrl = instagramUrl;
        this.websiteUrl = websiteUrl;
        this.facebookUrl = facebookUrl;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getPosterUrl() {
        return posterUrl;
    }

    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    public String getPrimaryColor() {
        return primaryColor;
    }

    public void setPrimaryColor(String primaryColor) {
        this.primaryColor = primaryColor;
    }

    public String getSecondaryColor() {
        return secondaryColor;
    }

    public void setSecondaryColor(String secondaryColor) {
        this.secondaryColor = secondaryColor;
    }

    public String getGoogleReviewUrl() {
        return googleReviewUrl;
    }

    public void setGoogleReviewUrl(String googleReviewUrl) {
        this.googleReviewUrl = googleReviewUrl;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getQrCodeUrl() {
        return qrCodeUrl;
    }

    public void setQrCodeUrl(String qrCodeUrl) {
        this.qrCodeUrl = qrCodeUrl;
    }

    public String getPublicUrl() {
        return publicUrl;
    }

    public void setPublicUrl(String publicUrl) {
        this.publicUrl = publicUrl;
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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getWhatsapp() {
        return whatsapp;
    }

    public void setWhatsapp(String whatsapp) {
        this.whatsapp = whatsapp;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getInstagramUrl() {
        return instagramUrl;
    }

    public void setInstagramUrl(String instagramUrl) {
        this.instagramUrl = instagramUrl;
    }

    public String getWebsiteUrl() {
        return websiteUrl;
    }

    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }

    public String getFacebookUrl() {
        return facebookUrl;
    }

    public void setFacebookUrl(String facebookUrl) {
        this.facebookUrl = facebookUrl;
    }
}
