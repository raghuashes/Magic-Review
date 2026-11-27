package com.magicreview.service;

import com.magicreview.dto.GenerateReviewRequest;
import com.magicreview.dto.GenerateReviewResponse;
import com.magicreview.entity.Store;
import com.magicreview.exception.ResourceNotFoundException;
import com.magicreview.integration.DemoReviewGenerator;
import com.magicreview.integration.GeminiApiClient;
import com.magicreview.repository.StoreRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;

@Service
public class AiReviewService {

    private static final Logger log = LoggerFactory.getLogger(AiReviewService.class);

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

        // Prioritize and merge customer-provided context with store details
        String businessName = hasText(request.getBusinessName()) ? request.getBusinessName().trim() : store.getName();
        String businessCategory = hasText(request.getBusinessCategory()) ? request.getBusinessCategory().trim() : store.getBusinessCategory();
        String businessDescription = hasText(request.getBusinessDescription()) ? request.getBusinessDescription().trim() : store.getDescription();
        String specialties = hasText(request.getSpecialties()) ? request.getSpecialties().trim() : store.getSpecialties();
        String customerFeedback = request.getEffectiveFeedback();
        String visitCategory = hasText(request.getCategory()) ? request.getCategory().trim() : (businessCategory != null ? businessCategory : "General Visit");

        // Structured logging (zero PII) confirming complete context flow
        log.info("Generating review for store slug='{}' [name='{}', category='{}', businessCategory='{}', attrsCount={}, hasFeedback={}, feedbackLen={}, rating={}, tone='{}', lang='{}']",
                slug,
                businessName,
                visitCategory,
                businessCategory,
                request.getAttributes() != null ? request.getAttributes().size() : 0,
                !customerFeedback.isBlank(),
                customerFeedback.length(),
                request.getStarRating(),
                request.getTone(),
                request.getLanguageStyle());

        String reviewText;
        String mode;

        Optional<String> aiGenerated = geminiApiClient.generateReview(
                businessName,
                visitCategory,
                businessCategory,
                businessDescription,
                specialties,
                request.getAttributes(),
                customerFeedback,
                request.getLanguageStyle(),
                request.getPreviousReviews(),
                request.getStarRating(),
                request.getTone()
        );

        if (aiGenerated.isPresent() && !aiGenerated.get().isBlank()) {
            reviewText = aiGenerated.get();
            mode = "ai";
        } else {
            // Customer-Experience-First Fallback Engine
            reviewText = demoReviewGenerator.generateReview(
                    businessName,
                    visitCategory,
                    businessCategory,
                    businessDescription,
                    specialties,
                    request.getAttributes(),
                    customerFeedback,
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

    private boolean hasText(String s) {
        return s != null && !s.trim().isBlank();
    }
}
