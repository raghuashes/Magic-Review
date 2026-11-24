package com.magicreview.controller;

import com.magicreview.dto.AnalyticsResponse;
import com.magicreview.security.UserDetailsImpl;
import com.magicreview.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
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
    @Operation(summary = "Fetch funnel analytics summary for a store with date range filter (tenant isolated)")
    public ResponseEntity<AnalyticsResponse> getStoreAnalytics(@AuthenticationPrincipal UserDetailsImpl userPrincipal,
                                                               @PathVariable UUID id,
                                                               @RequestParam(required = false, defaultValue = "all") String range,
                                                               @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
                                                               @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to) {
        AnalyticsResponse response = analyticsService.getStoreAnalytics(id, userPrincipal.getId(), range, from, to);
        return ResponseEntity.ok(response);
    }
}
