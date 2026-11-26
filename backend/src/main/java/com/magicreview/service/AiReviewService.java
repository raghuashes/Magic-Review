package com.magicreview.service;

import com.magicreview.dto.GenerateReviewRequest;
import com.magicreview.dto.GenerateReviewResponse;
import com.magicreview.entity.Store;
import com.magicreview.exception.ResourceNotFoundException;
import com.magicreview.integration.DemoReviewGenerator;
import com.magicreview.integration.GeminiApiClient;
import com.magicreview.repository.StoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;

@Service
public class AiReviewService {

    private final StoreRepository storeRepository;
    private final GeminiApiClient geminiApiClient;
    private final DemoReviewGenerator demoReviewGenerator;

    public AiReviewService(StoreRepository storeRepository,
                           GeminiApiClient geminiApiClient,
                           DemoReviewGenerator demoReviewGenerator) {
        this.storeRepository = storeRepository;
        this.geminiApiClient = geminiApiClient;
        this.demoReviewGenerator = demoReviewGenerator;
    }

    @Transactional(readOnly = true)
    public GenerateReviewResponse generateReviewForStore(String slug, GenerateReviewRequest request) {
        Store store = storeRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found or inactive: " + slug));

        String reviewText;
        String mode;

        Optional<String> aiGenerated = geminiApiClient.generateReview(
                store.getName(),
                request.getCategory(),
                store.getBusinessCategory(),
                store.getSpecialties(),
                request.getAttributes(),
                request.getCustomerNote(),
                request.getLanguageStyle(),
                request.getPreviousReviews(),
                request.getStarRating(),
                request.getTone()
        );

        if (aiGenerated.isPresent() && !aiGenerated.get().isBlank()) {
            reviewText = aiGenerated.get();
            mode = "ai";
        } else {
            // Graceful Category-Aware Fallback Engine
            reviewText = demoReviewGenerator.generateReview(
                    store.getName(),
                    request.getCategory(),
                    store.getBusinessCategory(),
                    store.getSpecialties(),
                    request.getAttributes(),
                    request.getCustomerNote(),
                    request.getLanguageStyle(),
                    request.getPreviousReviews(),
                    request.getStarRating(),
                    request.getTone()
            );
            mode = "demo";
        }

        // Final sanity check: strictly Latin characters only
        reviewText = demoReviewGenerator.sanitizeLatinScript(reviewText);

        return new GenerateReviewResponse(
                reviewText,
                request.getLanguageStyle(),
                mode,
                OffsetDateTime.now()
        );
    }
}
