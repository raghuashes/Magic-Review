package com.magicreview.dto;

import java.util.List;
import java.util.UUID;

public class PublicStoreResponse {
    private UUID id;
    private String name;
    private String slug;
    private String description;
    private String logoUrl;
    private String posterUrl;
    private String primaryColor;
    private String secondaryColor;
    private String googleReviewUrl;
    private String phone;
    private String whatsapp;
    private String address;
    private String instagramUrl;
    private String websiteUrl;
    private String facebookUrl;
    private String businessEmail;
    private String businessCategory;
    private String specialties;
    private String targetCustomers;
    private String welcomeMessage;
    private String thankYouMessage;
    private List<CategoryResponse> categories;
    private List<AttributeResponse> attributes;

    public PublicStoreResponse() {
    }

    public PublicStoreResponse(UUID id, String name, String slug, String description, String logoUrl,
                               String posterUrl, String primaryColor, String secondaryColor, String googleReviewUrl,
                               List<CategoryResponse> categories, List<AttributeResponse> attributes) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.logoUrl = logoUrl;
        this.posterUrl = posterUrl;
        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;
        this.googleReviewUrl = googleReviewUrl;
        this.categories = categories;
        this.attributes = attributes;
    }

    public PublicStoreResponse(UUID id, String name, String slug, String description, String logoUrl,
                               String posterUrl, String primaryColor, String secondaryColor, String googleReviewUrl,
                               String phone, String whatsapp, String address,
                               String instagramUrl, String websiteUrl, String facebookUrl,
                               List<CategoryResponse> categories, List<AttributeResponse> attributes) {
        this(id, name, slug, description, logoUrl, posterUrl, primaryColor, secondaryColor, googleReviewUrl, categories, attributes);
        this.phone = phone;
        this.whatsapp = whatsapp;
        this.address = address;
        this.instagramUrl = instagramUrl;
        this.websiteUrl = websiteUrl;
        this.facebookUrl = facebookUrl;
    }

    public PublicStoreResponse(UUID id, String name, String slug, String description, String logoUrl,
                               String posterUrl, String primaryColor, String secondaryColor, String googleReviewUrl,
                               String phone, String whatsapp, String address,
                               String instagramUrl, String websiteUrl, String facebookUrl,
                               String businessEmail, String businessCategory,
                               String welcomeMessage, String thankYouMessage,
                               List<CategoryResponse> categories, List<AttributeResponse> attributes) {
        this(id, name, slug, description, logoUrl, posterUrl, primaryColor, secondaryColor, googleReviewUrl,
             phone, whatsapp, address, instagramUrl, websiteUrl, facebookUrl, categories, attributes);
        this.businessEmail = businessEmail;
        this.businessCategory = businessCategory;
        this.welcomeMessage = welcomeMessage;
        this.thankYouMessage = thankYouMessage;
    }

    public PublicStoreResponse(UUID id, String name, String slug, String description, String logoUrl,
                               String posterUrl, String primaryColor, String secondaryColor, String googleReviewUrl,
                               String phone, String whatsapp, String address,
                               String instagramUrl, String websiteUrl, String facebookUrl,
                               String businessEmail, String businessCategory,
                               String welcomeMessage, String thankYouMessage,
                               String specialties, String targetCustomers,
                               List<CategoryResponse> categories, List<AttributeResponse> attributes) {
        this(id, name, slug, description, logoUrl, posterUrl, primaryColor, secondaryColor, googleReviewUrl,
             phone, whatsapp, address, instagramUrl, websiteUrl, facebookUrl, businessEmail, businessCategory,
             welcomeMessage, thankYouMessage, categories, attributes);
        this.specialties = specialties;
        this.targetCustomers = targetCustomers;
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

    public List<CategoryResponse> getCategories() {
        return categories;
    }

    public void setCategories(List<CategoryResponse> categories) {
        this.categories = categories;
    }

    public List<AttributeResponse> getAttributes() {
        return attributes;
    }

    public void setAttributes(List<AttributeResponse> attributes) {
        this.attributes = attributes;
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

    public String getBusinessEmail() {
        return businessEmail;
    }

    public void setBusinessEmail(String businessEmail) {
        this.businessEmail = businessEmail;
    }

    public String getBusinessCategory() {
        return businessCategory;
    }

    public void setBusinessCategory(String businessCategory) {
        this.businessCategory = businessCategory;
    }

    public String getWelcomeMessage() {
        return welcomeMessage;
    }

    public void setWelcomeMessage(String welcomeMessage) {
        this.welcomeMessage = welcomeMessage;
    }

    public String getThankYouMessage() {
        return thankYouMessage;
    }

    public void setThankYouMessage(String thankYouMessage) {
        this.thankYouMessage = thankYouMessage;
    }

    public String getSpecialties() {
        return specialties;
    }

    public void setSpecialties(String specialties) {
        this.specialties = specialties;
    }

    public String getTargetCustomers() {
        return targetCustomers;
    }

    public void setTargetCustomers(String targetCustomers) {
        this.targetCustomers = targetCustomers;
    }
}
