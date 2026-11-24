package com.magicreview.repository;

import com.magicreview.entity.AnalyticsEvent;
import com.magicreview.enums.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT e.campaign, COUNT(e) FROM AnalyticsEvent e WHERE e.store.id = :storeId AND e.campaign IS NOT NULL AND e.campaign <> '' GROUP BY e.campaign ORDER BY COUNT(e) DESC")
    List<Object[]> countScansByCampaign(@Param("storeId") UUID storeId);
}
