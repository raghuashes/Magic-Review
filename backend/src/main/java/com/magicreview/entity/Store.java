package com.magicreview.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "stores")
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url", length = 512)
    private String logoUrl;

    @Column(name = "poster_url", length = 512)
    private String posterUrl;

    @Column(name = "primary_color", length = 30)
    private String primaryColor = "#4F46E5";

    @Column(name = "secondary_color", length = 30)
    private String secondaryColor = "#06B6D4";

    @Column(name = "google_review_url", nullable = false, columnDefinition = "TEXT")
    private String googleReviewUrl;

    @Column(length = 50)
    private String phone;

    @Column(length = 50)
    private String whatsapp;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "instagram_url", length = 512)
    private String instagramUrl;

    @Column(name = "website_url", length = 512)
    private String websiteUrl;

    @Column(name = "facebook_url", length = 512)
    private String facebookUrl;

    @Column(name = "business_email", length = 255)
    private String businessEmail;

    @Column(name = "business_category", length = 100)
    private String businessCategory;

    @Column(columnDefinition = "TEXT")
    private String specialties;

    @Column(name = "target_customers", length = 255)
    private String targetCustomers;

    @Column(name = "welcome_message", columnDefinition = "TEXT")
    private String welcomeMessage;

    @Column(name = "thank_you_message", columnDefinition = "TEXT")
    private String thankYouMessage;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, createdAt ASC")
    private List<StoreCategory> categories = new ArrayList<>();

    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, createdAt ASC")
    private List<StoreAttribute> attributes = new ArrayList<>();

    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AnalyticsEvent> analyticsEvents = new ArrayList<>();

    public Store() {
    }

    public Store(User owner, String name, String slug, String description, String logoUrl,
                 String primaryColor, String secondaryColor, String googleReviewUrl, Boolean active) {
        this.owner = owner;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.logoUrl = logoUrl;
        this.primaryColor = primaryColor != null ? primaryColor : "#4F46E5";
        this.secondaryColor = secondaryColor != null ? secondaryColor : "#06B6D4";
        this.googleReviewUrl = googleReviewUrl;
        this.active = active != null ? active : true;
    }

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.primaryColor == null) this.primaryColor = "#4F46E5";
        if (this.secondaryColor == null) this.secondaryColor = "#06B6D4";
        if (this.active == null) this.active = true;
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

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
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

    public List<StoreCategory> getCategories() {
        return categories;
    }

    public void setCategories(List<StoreCategory> categories) {
        this.categories = categories;
    }

    public List<StoreAttribute> getAttributes() {
        return attributes;
    }

    public void setAttributes(List<StoreAttribute> attributes) {
        this.attributes = attributes;
    }

    public List<AnalyticsEvent> getAnalyticsEvents() {
        return analyticsEvents;
    }

    public void setAnalyticsEvents(List<AnalyticsEvent> analyticsEvents) {
        this.analyticsEvents = analyticsEvents;
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
