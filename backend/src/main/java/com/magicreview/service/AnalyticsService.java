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

        AnalyticsEvent event = new AnalyticsEvent(store, request.getEventType());
        analyticsEventRepository.save(event);
    }

    @Transactional(readOnly = true)
    public AnalyticsResponse getStoreAnalytics(UUID storeId, UUID userId) {
        Store store = storeService.findStoreAndValidateOwner(storeId, userId);

        long pageViews = analyticsEventRepository.countByStoreIdAndEventType(storeId, EventType.PAGE_VIEW);
        long draftsGenerated = analyticsEventRepository.countByStoreIdAndEventType(storeId, EventType.DRAFT_GENERATED);
        long googleClicks = analyticsEventRepository.countByStoreIdAndEventType(storeId, EventType.GOOGLE_LINK_CLICKED);

        double generationRate = (pageViews > 0)
                ? round((double) draftsGenerated / pageViews * 100.0, 1)
                : 0.0;

        double clickThroughRate = (draftsGenerated > 0)
                ? round((double) googleClicks / draftsGenerated * 100.0, 1)
                : 0.0;

        return new AnalyticsResponse(
                store.getId(),
                store.getName(),
                pageViews,
                draftsGenerated,
                googleClicks,
                generationRate,
                clickThroughRate
        );
    }

    private double round(double value, int places) {
        if (Double.isNaN(value) || Double.isInfinite(value)) return 0.0;
        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(places, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }
}
