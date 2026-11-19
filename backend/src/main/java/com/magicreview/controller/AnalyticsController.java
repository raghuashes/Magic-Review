package com.magicreview.controller;

import com.magicreview.dto.AnalyticsResponse;
import com.magicreview.security.UserDetailsImpl;
import com.magicreview.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/stores/{id}/analytics")
@Tag(name = "Store Analytics", description = "Performance metrics and conversion tracking for merchant stores")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    @Operation(summary = "Fetch funnel analytics summary for a store (tenant isolated)")
    public ResponseEntity<AnalyticsResponse> getStoreAnalytics(@AuthenticationPrincipal UserDetailsImpl userPrincipal,
                                                               @PathVariable UUID id) {
        AnalyticsResponse response = analyticsService.getStoreAnalytics(id, userPrincipal.getId());
        return ResponseEntity.ok(response);
    }
}
