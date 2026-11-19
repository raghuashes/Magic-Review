package com.magicreview.dto;

import java.util.UUID;

public class AnalyticsResponse {
    private UUID storeId;
    private String storeName;
    private long pageViews;
    private long draftsGenerated;
    private long googleClicks;
    private double generationRate;
    private double clickThroughRate;

    public AnalyticsResponse() {
    }

    public AnalyticsResponse(UUID storeId, String storeName, long pageViews, long draftsGenerated,
                             long googleClicks, double generationRate, double clickThroughRate) {
        this.storeId = storeId;
        this.storeName = storeName;
        this.pageViews = pageViews;
        this.draftsGenerated = draftsGenerated;
        this.googleClicks = googleClicks;
        this.generationRate = generationRate;
        this.clickThroughRate = clickThroughRate;
    }

    public UUID getStoreId() {
        return storeId;
    }

    public void setStoreId(UUID storeId) {
        this.storeId = storeId;
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
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

    public double getGenerationRate() {
        return generationRate;
    }

    public void setGenerationRate(double generationRate) {
        this.generationRate = generationRate;
    }

    public double getClickThroughRate() {
        return clickThroughRate;
    }

    public void setClickThroughRate(double clickThroughRate) {
        this.clickThroughRate = clickThroughRate;
    }
}
