package com.magicreview.service;

import com.magicreview.dto.AnalyticsResponse;
import com.magicreview.dto.RecordEventRequest;
import com.magicreview.entity.AnalyticsEvent;
import com.magicreview.entity.Store;
import com.magicreview.enums.EventType;
import com.magicreview.exception.ResourceNotFoundException;
import com.magicreview.repository.AnalyticsEventRepository;
import com.magicreview.repository.StoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AnalyticsService {

    private final AnalyticsEventRepository analyticsEventRepository;
    private final StoreRepository storeRepository;
    private final StoreService storeService;

    public AnalyticsService(AnalyticsEventRepository analyticsEventRepository,
                            StoreRepository storeRepository,
                            StoreService storeService) {
        this.analyticsEventRepository = analyticsEventRepository;
        this.storeRepository = storeRepository;
        this.storeService = storeService;
    }

    @Transactional
    public void recordEvent(String slug, RecordEventRequest request) {
        Store store = storeRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found or inactive: " + slug));

        AnalyticsEvent event = new AnalyticsEvent(store, request.getEventType(), request.getCampaign());
        analyticsEventRepository.save(event);
    }

    @Transactional(readOnly = true)
    public AnalyticsResponse getStoreAnalytics(UUID storeId, UUID userId) {
        return getStoreAnalytics(storeId, userId, "all", null, null);
    }

    @Transactional(readOnly = true)
    public AnalyticsResponse getStoreAnalytics(UUID storeId, UUID userId, String range,
                                               OffsetDateTime customFrom, OffsetDateTime customTo) {
        Store store = storeService.findStoreAndValidateOwner(storeId, userId);

        String activeRange = (range != null && !range.isBlank()) ? range.trim().toLowerCase() : "all";
        OffsetDateTime start = null;
        OffsetDateTime end = null;

        if ("today".equalsIgnoreCase(activeRange)) {
            start = OffsetDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        } else if ("7d".equalsIgnoreCase(activeRange)) {
            start = OffsetDateTime.now().minusDays(7);
        } else if ("30d".equalsIgnoreCase(activeRange)) {
            start = OffsetDateTime.now().minusDays(30);
        } else if ("custom".equalsIgnoreCase(activeRange)) {
            start = customFrom;
            end = customTo;
        }

        long pageViews = countEvents(storeId, EventType.PAGE_VIEW, start, end);
        long draftsGenerated = countEvents(storeId, EventType.DRAFT_GENERATED, start, end);
        long googleClicks = countEvents(storeId, EventType.GOOGLE_LINK_CLICKED, start, end);
        long whatsappClicks = countEvents(storeId, EventType.WHATSAPP_CLICKED, start, end);
        long instagramClicks = countEvents(storeId, EventType.INSTAGRAM_CLICKED, start, end);
        long facebookClicks = countEvents(storeId, EventType.FACEBOOK_CLICKED, start, end);
        long websiteClicks = countEvents(storeId, EventType.WEBSITE_CLICKED, start, end);

        double generationRate = (pageViews > 0)
                ? round((double) draftsGenerated / pageViews * 100.0, 1)
                : 0.0;

        double clickThroughRate = (draftsGenerated > 0)
                ? round((double) googleClicks / draftsGenerated * 100.0, 1)
                : 0.0;

        Map<String, Long> campaignBreakdown = new LinkedHashMap<>();
        try {
            List<Object[]> rawCampaigns = analyticsEventRepository.countScansByCampaign(storeId);
            if (rawCampaigns != null) {
                for (Object[] row : rawCampaigns) {
                    if (row != null && row.length >= 2 && row[0] != null) {
                        String camp = String.valueOf(row[0]);
                        Long cnt = ((Number) row[1]).longValue();
                        campaignBreakdown.put(camp, cnt);
                    }
                }
            }
        } catch (Exception ignored) {
            // Graceful handling if migration pending
        }

        return new AnalyticsResponse(
                store.getId(),
                store.getName(),
                pageViews,
                draftsGenerated,
                googleClicks,
                whatsappClicks,
                instagramClicks,
                facebookClicks,
                websiteClicks,
                generationRate,
                clickThroughRate,
                activeRange,
                campaignBreakdown
        );
    }

    private long countEvents(UUID storeId, EventType type, OffsetDateTime start, OffsetDateTime end) {
        if (start != null && end != null) {
            return analyticsEventRepository.countByStoreIdAndEventTypeAndCreatedAtBetween(storeId, type, start, end);
        } else if (start != null) {
            return analyticsEventRepository.countByStoreIdAndEventTypeAndCreatedAtGreaterThanEqual(storeId, type, start);
        } else {
            return analyticsEventRepository.countByStoreIdAndEventType(storeId, type);
        }
    }

    private double round(double value, int places) {
        if (Double.isNaN(value) || Double.isInfinite(value)) return 0.0;
        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(places, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }
}
