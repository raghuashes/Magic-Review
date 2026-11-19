package com.magicreview.controller;

import com.magicreview.dto.GenerateReviewRequest;
import com.magicreview.dto.GenerateReviewResponse;
import com.magicreview.dto.PublicStoreResponse;
import com.magicreview.dto.RecordEventRequest;
import com.magicreview.service.AiReviewService;
import com.magicreview.service.AnalyticsService;
import com.magicreview.service.StoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public/stores")
@Tag(name = "Public Customer Review Flow", description = "Unauthenticated public endpoints for customers formulation reviews")
public class PublicStoreController {

    private final StoreService storeService;
    private final AiReviewService aiReviewService;
    private final AnalyticsService analyticsService;

    public PublicStoreController(StoreService storeService,
                                 AiReviewService aiReviewService,
                                 AnalyticsService analyticsService) {
        this.storeService = storeService;
        this.aiReviewService = aiReviewService;
        this.analyticsService = analyticsService;
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Fetch public store branding, categories, and attributes by slug")
    public ResponseEntity<PublicStoreResponse> getPublicStore(@PathVariable String slug) {
        PublicStoreResponse response = storeService.getPublicStoreBySlug(slug);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{slug}/generate-review")
    @Operation(summary = "Formulate natural customer review draft in selected Indian language style (Latin script)")
    public ResponseEntity<GenerateReviewResponse> generateReview(@PathVariable String slug,
                                                                 @Valid @RequestBody GenerateReviewRequest request) {
        GenerateReviewResponse response = aiReviewService.generateReviewForStore(slug, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{slug}/events")
    @Operation(summary = "Track customer conversion event (PAGE_VIEW, DRAFT_GENERATED, GOOGLE_LINK_CLICKED)")
    public ResponseEntity<Map<String, String>> recordEvent(@PathVariable String slug,
                                                           @Valid @RequestBody RecordEventRequest request) {
        analyticsService.recordEvent(slug, request);
        return ResponseEntity.ok(Map.of("status", "recorded", "event", request.getEventType().name()));
    }
}
