package com.magicreview.repository;

import com.magicreview.entity.AnalyticsEvent;
import com.magicreview.enums.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, UUID> {
    long countByStoreIdAndEventType(UUID storeId, EventType eventType);
    long countByStoreId(UUID storeId);
    long countByStoreIdAndEventTypeAndCreatedAtGreaterThanEqual(UUID storeId, EventType eventType, OffsetDateTime startDate);
    long countByStoreIdAndEventTypeAndCreatedAtBetween(UUID storeId, EventType eventType, OffsetDateTime startDate, OffsetDateTime endDate);
    List<AnalyticsEvent> findTop100ByStoreIdOrderByCreatedAtDesc(UUID storeId);
}
