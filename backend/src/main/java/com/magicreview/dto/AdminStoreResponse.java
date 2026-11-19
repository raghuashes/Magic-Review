package com.magicreview.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class AdminStoreResponse {
    private UUID id;
    private UUID ownerId;
    private String ownerEmail;
    private String name;
    private String slug;
    private String posterUrl;
    private String googleReviewUrl;
    private boolean active;
    private long pageViews;
    private long draftsGenerated;
    private long googleClicks;
    private OffsetDateTime createdAt;

    public AdminStoreResponse() {
    }

    public AdminStoreResponse(UUID id, UUID ownerId, String ownerEmail, String name, String slug,
                              String posterUrl, String googleReviewUrl, boolean active,
                              long pageViews, long draftsGenerated, long googleClicks, OffsetDateTime createdAt) {
        this.id = id;
        this.ownerId = ownerId;
        this.ownerEmail = ownerEmail;
        this.name = name;
        this.slug = slug;
        this.posterUrl = posterUrl;
        this.googleReviewUrl = googleReviewUrl;
        this.active = active;
        this.pageViews = pageViews;
        this.draftsGenerated = draftsGenerated;
        this.googleClicks = googleClicks;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(UUID ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
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

    public String getPosterUrl() {
        return posterUrl;
    }

    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    public String getGoogleReviewUrl() {
        return googleReviewUrl;
    }

    public void setGoogleReviewUrl(String googleReviewUrl) {
        this.googleReviewUrl = googleReviewUrl;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public long getPageViews() {
        return pageViews;
    }

    public void setPageViews(long pageViews) {
        this.pageViews = pageViews;
    }

    public long getDraftsGenerated() {
        return draftsGenerated;
    }

    public void setDraftsGenerated(long draftsGenerated) {
        this.draftsGenerated = draftsGenerated;
    }

    public long getGoogleClicks() {
        return googleClicks;
    }

    public void setGoogleClicks(long googleClicks) {
        this.googleClicks = googleClicks;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
