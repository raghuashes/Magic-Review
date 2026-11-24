package com.magicreview.dto;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

public class AnalyticsResponse {
    private UUID storeId;
    private String storeName;
    private long pageViews;
    private long draftsGenerated;
    private long googleClicks;
    private long whatsappClicks;
    private long instagramClicks;
    private long facebookClicks;
    private long websiteClicks;
    private double generationRate;
    private double clickThroughRate;
    private String filterRange = "all";
    private Map<String, Long> campaignBreakdown = new LinkedHashMap<>();

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
        this.whatsappClicks = 0;
        this.instagramClicks = 0;
        this.facebookClicks = 0;
        this.websiteClicks = 0;
        this.filterRange = "all";
    }

    public AnalyticsResponse(UUID storeId, String storeName, long pageViews, long draftsGenerated,
                             long googleClicks, long whatsappClicks, long instagramClicks,
                             long facebookClicks, long websiteClicks,
                             double generationRate, double clickThroughRate, String filterRange) {
        this.storeId = storeId;
        this.storeName = storeName;
        this.pageViews = pageViews;
        this.draftsGenerated = draftsGenerated;
        this.googleClicks = googleClicks;
        this.whatsappClicks = whatsappClicks;
        this.instagramClicks = instagramClicks;
        this.facebookClicks = facebookClicks;
        this.websiteClicks = websiteClicks;
        this.generationRate = generationRate;
        this.clickThroughRate = clickThroughRate;
        this.filterRange = filterRange != null ? filterRange : "all";
    }

    public AnalyticsResponse(UUID storeId, String storeName, long pageViews, long draftsGenerated,
                             long googleClicks, long whatsappClicks, long instagramClicks,
                             long facebookClicks, long websiteClicks,
                             double generationRate, double clickThroughRate, String filterRange,
                             Map<String, Long> campaignBreakdown) {
        this(storeId, storeName, pageViews, draftsGenerated, googleClicks, whatsappClicks, instagramClicks,
                facebookClicks, websiteClicks, generationRate, clickThroughRate, filterRange);
        if (campaignBreakdown != null) {
            this.campaignBreakdown = campaignBreakdown;
        }
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

    public long getWhatsappClicks() {
        return whatsappClicks;
    }

    public void setWhatsappClicks(long whatsappClicks) {
        this.whatsappClicks = whatsappClicks;
    }

    public long getInstagramClicks() {
        return instagramClicks;
    }

    public void setInstagramClicks(long instagramClicks) {
        this.instagramClicks = instagramClicks;
    }

    public long getFacebookClicks() {
        return facebookClicks;
    }

    public void setFacebookClicks(long facebookClicks) {
        this.facebookClicks = facebookClicks;
    }

    public long getWebsiteClicks() {
        return websiteClicks;
    }

    public void setWebsiteClicks(long websiteClicks) {
        this.websiteClicks = websiteClicks;
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

    public String getFilterRange() {
        return filterRange;
    }

    public void setFilterRange(String filterRange) {
        this.filterRange = filterRange;
    }

    public Map<String, Long> getCampaignBreakdown() {
        return campaignBreakdown;
    }

    public void setCampaignBreakdown(Map<String, Long> campaignBreakdown) {
        this.campaignBreakdown = campaignBreakdown;
    }
}
