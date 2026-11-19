package com.magicreview.service;

import com.magicreview.dto.AdminStatsResponse;
import com.magicreview.dto.AdminStoreResponse;
import com.magicreview.dto.AdminUserResponse;
import com.magicreview.entity.Store;
import com.magicreview.entity.User;
import com.magicreview.enums.EventType;
import com.magicreview.exception.ResourceNotFoundException;
import com.magicreview.repository.AnalyticsEventRepository;
import com.magicreview.repository.StoreRepository;
import com.magicreview.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final AnalyticsEventRepository analyticsEventRepository;

    public AdminService(UserRepository userRepository,
                        StoreRepository storeRepository,
                        AnalyticsEventRepository analyticsEventRepository) {
        this.userRepository = userRepository;
        this.storeRepository = storeRepository;
        this.analyticsEventRepository = analyticsEventRepository;
    }

    @Transactional(readOnly = true)
    public AdminStatsResponse getPlatformStats() {
        long totalMerchants = userRepository.count();
        long totalStores = storeRepository.count();

        long totalPageViews = analyticsEventRepository.findAll().stream()
                .filter(e -> e.getEventType() == EventType.PAGE_VIEW)
                .count();

        long totalDrafts = analyticsEventRepository.findAll().stream()
                .filter(e -> e.getEventType() == EventType.DRAFT_GENERATED)
                .count();

        long totalGoogleClicks = analyticsEventRepository.findAll().stream()
                .filter(e -> e.getEventType() == EventType.GOOGLE_LINK_CLICKED)
                .count();

        double conversionRate = (totalDrafts > 0)
                ? BigDecimal.valueOf((double) totalGoogleClicks / totalDrafts * 100.0)
                .setScale(1, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        return new AdminStatsResponse(
                totalMerchants,
                totalStores,
                totalPageViews,
                totalDrafts,
                totalGoogleClicks,
                conversionRate
        );
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new AdminUserResponse(
                        u.getId(),
                        u.getEmail(),
                        u.getRole(),
                        u.getStores() != null ? u.getStores().size() : 0,
                        u.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdminStoreResponse> getAllStores() {
        return storeRepository.findAll().stream()
                .map(s -> {
                    long pv = analyticsEventRepository.countByStoreIdAndEventType(s.getId(), EventType.PAGE_VIEW);
                    long dg = analyticsEventRepository.countByStoreIdAndEventType(s.getId(), EventType.DRAFT_GENERATED);
                    long gc = analyticsEventRepository.countByStoreIdAndEventType(s.getId(), EventType.GOOGLE_LINK_CLICKED);

                    return new AdminStoreResponse(
                            s.getId(),
                            s.getOwner().getId(),
                            s.getOwner().getEmail(),
                            s.getName(),
                            s.getSlug(),
                            s.getPosterUrl(),
                            s.getGoogleReviewUrl(),
                            Boolean.TRUE.equals(s.getActive()),
                            pv,
                            dg,
                            gc,
                            s.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminStoreResponse toggleStoreStatus(UUID storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + storeId));

        store.setActive(!Boolean.TRUE.equals(store.getActive()));
        Store updated = storeRepository.save(store);

        long pv = analyticsEventRepository.countByStoreIdAndEventType(updated.getId(), EventType.PAGE_VIEW);
        long dg = analyticsEventRepository.countByStoreIdAndEventType(updated.getId(), EventType.DRAFT_GENERATED);
        long gc = analyticsEventRepository.countByStoreIdAndEventType(updated.getId(), EventType.GOOGLE_LINK_CLICKED);

        return new AdminStoreResponse(
                updated.getId(),
                updated.getOwner().getId(),
                updated.getOwner().getEmail(),
                updated.getName(),
                updated.getSlug(),
                updated.getPosterUrl(),
                updated.getGoogleReviewUrl(),
                Boolean.TRUE.equals(updated.getActive()),
                pv,
                dg,
                gc,
                updated.getCreatedAt()
        );
    }

    @Transactional
    public void deleteStore(UUID storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + storeId));
        storeRepository.delete(store);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        userRepository.delete(user);
    }
}
