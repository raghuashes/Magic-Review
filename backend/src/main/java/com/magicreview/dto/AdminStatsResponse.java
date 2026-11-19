package com.magicreview.dto;

public class AdminStatsResponse {
    private long totalMerchants;
    private long totalStores;
    private long totalPageViews;
    private long totalDraftsGenerated;
    private long totalGoogleClicks;
    private double overallConversionRate;

    public AdminStatsResponse() {
    }

    public AdminStatsResponse(long totalMerchants, long totalStores, long totalPageViews,
                              long totalDraftsGenerated, long totalGoogleClicks, double overallConversionRate) {
        this.totalMerchants = totalMerchants;
        this.totalStores = totalStores;
        this.totalPageViews = totalPageViews;
        this.totalDraftsGenerated = totalDraftsGenerated;
        this.totalGoogleClicks = totalGoogleClicks;
        this.overallConversionRate = overallConversionRate;
    }

    public long getTotalMerchants() {
        return totalMerchants;
    }

    public void setTotalMerchants(long totalMerchants) {
        this.totalMerchants = totalMerchants;
    }

    public long getTotalStores() {
        return totalStores;
    }

    public void setTotalStores(long totalStores) {
        this.totalStores = totalStores;
    }

    public long getTotalPageViews() {
        return totalPageViews;
    }

    public void setTotalPageViews(long totalPageViews) {
        this.totalPageViews = totalPageViews;
    }

    public long getTotalDraftsGenerated() {
        return totalDraftsGenerated;
    }

    public void setTotalDraftsGenerated(long totalDraftsGenerated) {
        this.totalDraftsGenerated = totalDraftsGenerated;
    }

    public long getTotalGoogleClicks() {
        return totalGoogleClicks;
    }

    public void setTotalGoogleClicks(long totalGoogleClicks) {
        this.totalGoogleClicks = totalGoogleClicks;
    }

    public double getOverallConversionRate() {
        return overallConversionRate;
    }

    public void setOverallConversionRate(double overallConversionRate) {
        this.overallConversionRate = overallConversionRate;
    }
}
