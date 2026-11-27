package com.magicreview;

import com.magicreview.dto.GenerateReviewRequest;
import com.magicreview.dto.GenerateReviewResponse;
import com.magicreview.entity.Store;
import com.magicreview.entity.User;
import com.magicreview.enums.LanguageStyle;
import com.magicreview.enums.Role;
import com.magicreview.integration.DemoReviewGenerator;
import com.magicreview.integration.GeminiApiClient;
import com.magicreview.repository.StoreRepository;
import com.magicreview.service.AiReviewService;
import com.magicreview.util.CategoryDefaults;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AiReviewServiceTest {

    private static final Pattern TELUGU_SCRIPT_PATTERN = Pattern.compile("[\\u0C00-\\u0C7F]");
    private static final Pattern DEVANAGARI_SCRIPT_PATTERN = Pattern.compile("[\\u0900-\\u097F]");

    @Mock
    private StoreRepository storeRepository;

    @Mock
    private GeminiApiClient geminiApiClient;

    private DemoReviewGenerator demoReviewGenerator;
    private AiReviewService aiReviewService;

    private Store mockStore;

    @BeforeEach
    void setUp() {
        demoReviewGenerator = new DemoReviewGenerator();
        aiReviewService = new AiReviewService(storeRepository, geminiApiClient, demoReviewGenerator);

        User mockOwner = new User("owner@srijewellers.in", "hashed_pwd", Role.BUSINESS_OWNER);
        mockStore = new Store(
                mockOwner,
                "Sri Sai Jewellers",
                "sri-sai-jewellers",
                "Fine gold and diamond jewellery in Hyderabad",
                "https://example.com/logo.png",
                "#4F46E5",
                "#06B6D4",
                "https://g.page/r/srisaijewellers/review",
                true
        );
        mockStore.setBusinessCategory("Jewellery Store");
        mockStore.setSpecialties("Bridal gold, diamond necklaces, light weight daily wear");
    }

    @Test
    @DisplayName("Should generate authentic ENGLISH review in pure Latin script")
    void testEnglishReviewGeneration() {
        when(storeRepository.findBySlugAndActiveTrue("sri-sai-jewellers"))
                .thenReturn(Optional.of(mockStore));
        when(geminiApiClient.generateReview(any(), any(), any(), any(), any(), any(), any(), eq(LanguageStyle.ENGLISH), any(), any(), any()))
                .thenReturn(Optional.empty()); // Triggers fallback demo generator

        GenerateReviewRequest request = new GenerateReviewRequest(
                "Bridal Jewellery",
                List.of("Helpful Staff", "Fair Pricing"),
                "Great bridal collection",
                LanguageStyle.ENGLISH
        );

        GenerateReviewResponse response = aiReviewService.generateReviewForStore("sri-sai-jewellers", request);

        assertNotNull(response);
        assertEquals("demo", response.getMode());
        assertEquals(LanguageStyle.ENGLISH, response.getLanguageStyle());
        assertFalse(response.getReviewText().isBlank());

        // Assert strictly pure Latin script - zero native scripts
        assertFalse(TELUGU_SCRIPT_PATTERN.matcher(response.getReviewText()).find(), "Telugu script must be absent");
        assertFalse(DEVANAGARI_SCRIPT_PATTERN.matcher(response.getReviewText()).find(), "Devanagari script must be absent");
        assertTrue(response.getReviewText().contains("Sri Sai Jewellers"));
    }

    @Test
    @DisplayName("Should generate authentic TELUGU_ENGLISH_MIX strictly in Roman letters without Telugu script")
    void testTeluguEnglishMixReviewGeneration() {
        when(storeRepository.findBySlugAndActiveTrue("sri-sai-jewellers"))
                .thenReturn(Optional.of(mockStore));
        when(geminiApiClient.generateReview(any(), any(), any(), any(), any(), any(), any(), eq(LanguageStyle.TELUGU_ENGLISH_MIX), any(), any(), any()))
                .thenReturn(Optional.empty()); // Triggers fallback demo generator

        GenerateReviewRequest request = new GenerateReviewRequest(
                "Traditional Gold",
                List.of("Quick Service", "Hygienic & Clean"),
                "Chala manchi collection",
                LanguageStyle.TELUGU_ENGLISH_MIX
        );

        GenerateReviewResponse response = aiReviewService.generateReviewForStore("sri-sai-jewellers", request);

        assertNotNull(response);
        assertEquals("demo", response.getMode());
        assertEquals(LanguageStyle.TELUGU_ENGLISH_MIX, response.getLanguageStyle());
        assertFalse(response.getReviewText().isBlank());

        // Assert strictly Latin characters - NO Telugu Unicode allowed!
        assertFalse(TELUGU_SCRIPT_PATTERN.matcher(response.getReviewText()).find(),
                "Telugu Unicode script is strictly forbidden in TELUGU_ENGLISH_MIX");
        assertFalse(DEVANAGARI_SCRIPT_PATTERN.matcher(response.getReviewText()).find(),
                "Devanagari Unicode script must be absent");

        // Verify colloquial Telugu Romanized phrases are present
        String lower = response.getReviewText().toLowerCase();
        assertTrue(lower.contains("chala") || lower.contains("bagundhi") || lower.contains("malli") || lower.contains("nachindi") || lower.contains("super"),
                "Should contain Romanized conversational Telugu words");
    }

    @Test
    @DisplayName("Should generate authentic HINGLISH strictly in Roman letters without Devanagari script")
    void testHinglishReviewGeneration() {
        when(storeRepository.findBySlugAndActiveTrue("sri-sai-jewellers"))
                .thenReturn(Optional.of(mockStore));
        when(geminiApiClient.generateReview(any(), any(), any(), any(), any(), any(), any(), eq(LanguageStyle.HINGLISH), any(), any(), any()))
                .thenReturn(Optional.empty()); // Triggers fallback demo generator

        GenerateReviewRequest request = new GenerateReviewRequest(
                "Diamond Rings",
                List.of("Helpful Staff", "Fair Pricing"),
                "Bahut accha staff tha",
                LanguageStyle.HINGLISH
        );

        GenerateReviewResponse response = aiReviewService.generateReviewForStore("sri-sai-jewellers", request);

        assertNotNull(response);
        assertEquals("demo", response.getMode());
        assertEquals(LanguageStyle.HINGLISH, response.getLanguageStyle());
        assertFalse(response.getReviewText().isBlank());

        // Assert strictly Latin characters - NO Devanagari Unicode allowed!
        assertFalse(DEVANAGARI_SCRIPT_PATTERN.matcher(response.getReviewText()).find(),
                "Devanagari Unicode script is strictly forbidden in HINGLISH");
        assertFalse(TELUGU_SCRIPT_PATTERN.matcher(response.getReviewText()).find(),
                "Telugu Unicode script must be absent");

        // Verify colloquial Hinglish Romanized phrases are present
        String lower = response.getReviewText().toLowerCase();
        assertTrue(lower.contains("bahut") || lower.contains("badhiya") || lower.contains("achha") || lower.contains("khas") || lower.contains("kafi") || lower.contains("shandar"),
                "Should contain Romanized conversational Hindi words");
    }

    @Test
    @DisplayName("Should guarantee non-repetition when regenerate is clicked with previous reviews")
    void testNonRepetitionOnRegenerate() {
        when(storeRepository.findBySlugAndActiveTrue("sri-sai-jewellers"))
                .thenReturn(Optional.of(mockStore));
        when(geminiApiClient.generateReview(any(), any(), any(), any(), any(), any(), any(), eq(LanguageStyle.TELUGU_ENGLISH_MIX), any(), any(), any()))
                .thenReturn(Optional.empty()); // Fallback demo engine

        List<String> seenReviews = new ArrayList<>();

        // Generate 4 consecutive variations
        for (int i = 0; i < 4; i++) {
            GenerateReviewRequest request = new GenerateReviewRequest(
                    "Bridal Jewellery",
                    List.of("Helpful Staff"),
                    null,
                    LanguageStyle.TELUGU_ENGLISH_MIX,
                    new ArrayList<>(seenReviews)
            );

            GenerateReviewResponse response = aiReviewService.generateReviewForStore("sri-sai-jewellers", request);

            assertNotNull(response.getReviewText());
            // Assert this new review was NOT in seenReviews
            assertFalse(seenReviews.contains(response.getReviewText()),
                    "Regenerated review #" + (i + 1) + " must not repeat any previously generated review!");

            seenReviews.add(response.getReviewText());
        }

        assertEquals(4, seenReviews.size());
    }

    @Test
    @DisplayName("Should successfully use Gemini AI output with mode 'ai' and sanitize any accidental native script")
    void testGeminiAiModeIntegration() {
        when(storeRepository.findBySlugAndActiveTrue("sri-sai-jewellers"))
                .thenReturn(Optional.of(mockStore));

        String mockAiOutput = "\"Sri Sai Jewellers lo bridal collection chala awesome ga undhi. Staff helped us patiently!\"";
        when(geminiApiClient.generateReview(any(), any(), any(), any(), any(), any(), any(), eq(LanguageStyle.TELUGU_ENGLISH_MIX), any(), any(), any()))
                .thenReturn(Optional.of(mockAiOutput));

        GenerateReviewRequest request = new GenerateReviewRequest(
                "Bridal Collection",
                List.of("Helpful Staff"),
                null,
                LanguageStyle.TELUGU_ENGLISH_MIX
        );

        GenerateReviewResponse response = aiReviewService.generateReviewForStore("sri-sai-jewellers", request);

        assertNotNull(response);
        assertEquals("ai", response.getMode());
        assertEquals(LanguageStyle.TELUGU_ENGLISH_MIX, response.getLanguageStyle());
        // Enclosing quotes should be sanitized
        assertFalse(response.getReviewText().startsWith("\""));
        assertFalse(response.getReviewText().endsWith("\""));
        assertFalse(TELUGU_SCRIPT_PATTERN.matcher(response.getReviewText()).find());
    }

    @Test
    @DisplayName("CategoryDefaults should supply all 24 categories with non-empty default attributes")
    void testCategoryDefaultsCoverage() {
        assertEquals(24, CategoryDefaults.ALL_CATEGORIES.size());

        for (String cat : CategoryDefaults.ALL_CATEGORIES) {
            List<String> defaults = CategoryDefaults.getDefaultsForCategory(cat);
            assertNotNull(defaults, "Defaults for " + cat + " must not be null");
            assertFalse(defaults.isEmpty(), "Defaults for " + cat + " must not be empty");
            assertTrue(defaults.size() >= 6, "Defaults for " + cat + " should have at least 6 attributes");
        }
    }

    @Test
    @DisplayName("Category-Aware Demo Review Generator should use restaurant terms for restaurant and jewellery terms for jewellery")
    void testCategoryAwareVocabularyGeneration() {
        // Test Restaurant
        String restaurantReview = demoReviewGenerator.generateReview(
                "Spice Garden", "Dinner", "Restaurant", "Biryani, Tandoori",
                List.of("Food taste", "Ambience"), "Loved the biryani", LanguageStyle.ENGLISH, List.of(), 5, "FRIENDLY"
        );
        assertNotNull(restaurantReview);
        String restLower = restaurantReview.toLowerCase();
        assertTrue(restLower.contains("biryani") || restLower.contains("food") || restLower.contains("taste"),
                "Restaurant review should contain feedback item or culinary vocabulary");
        assertFalse(restLower.contains("jewellery") || restLower.contains("gold") || restLower.contains("diamond"),
                "Restaurant review must not contain jewellery terms");

        // Test Jewellery
        String jewelleryReview = demoReviewGenerator.generateReview(
                "Sri Sai Jewellers", "Gold Bangles", "Jewellery Store", "Gold & Diamond jewellery",
                List.of("Jewellery design", "Craftsmanship"), null, LanguageStyle.ENGLISH, List.of(), 5, "FRIENDLY"
        );
        assertNotNull(jewelleryReview);
        String jewLower = jewelleryReview.toLowerCase();
        assertTrue(jewLower.contains("jewellery") || jewLower.contains("craftsmanship") || jewLower.contains("designs") || jewLower.contains("shopping") || jewLower.contains("experience"),
                "Jewellery review should use jewellery vocabulary");
        assertFalse(jewLower.contains("delicious") || jewLower.contains("tasty") || jewLower.contains("flavour") || jewLower.contains("recipe"),
                "Jewellery review must not contain culinary terms");
    }

    @Test
    @DisplayName("Customer actual experience must determine the review content across different customers for the same Restaurant category")
    void testCustomerFeedbackDeterminesReviewContentForSameCategory() {
        String store = "Spice Garden";
        String category = "Restaurant";

        // Customer A: Excellent food and fast service
        String reviewA = demoReviewGenerator.generateReview(
                store, "Dinner", category, "Family dining, biryani",
                List.of("Food taste", "Staff service"),
                "Excellent food and fast service.",
                LanguageStyle.ENGLISH, List.of(), 5, "FRIENDLY"
        );
        assertTrue(reviewA.toLowerCase().contains("excellent food and fast service"), "Review A must reflect Customer A's exact positive experience");

        // Customer B: Good food but slow service
        String reviewB = demoReviewGenerator.generateReview(
                store, "Dinner", category, "Family dining, biryani",
                List.of("Food taste", "Staff service"),
                "The biryani was tasty, portion was good, but service was a little slow.",
                LanguageStyle.ENGLISH, List.of(), 4, "FRIENDLY"
        );
        assertTrue(reviewB.toLowerCase().contains("service was a little slow"), "Review B must faithfully preserve the customer's mixed/slow service feedback");
        assertFalse(reviewB.toLowerCase().contains("blown away") || reviewB.toLowerCase().contains("top tier!"),
                "Review B must NOT whitewash slow service with generic high praise");

        // Customer C: Poor food quality but friendly staff
        String reviewC = demoReviewGenerator.generateReview(
                store, "Dinner", category, "Family dining, biryani",
                List.of("Food quality", "Staff service"),
                "Poor food quality but friendly staff.",
                LanguageStyle.ENGLISH, List.of(), 2, "PROFESSIONAL"
        );
        assertTrue(reviewC.toLowerCase().contains("poor food quality but friendly staff"), "Review C must preserve poor food quality feedback");

        // Customer D: Enjoyed the ambience but found prices expensive
        String reviewD = demoReviewGenerator.generateReview(
                store, "Dinner", category, "Family dining, biryani",
                List.of("Ambience", "Value for money"),
                "Enjoyed the ambience but found prices expensive.",
                LanguageStyle.ENGLISH, List.of(), 3, "SHORT"
        );
        assertTrue(reviewD.toLowerCase().contains("prices expensive"), "Review D must preserve expensive pricing feedback");

        // All 4 reviews must be distinct and specific to their customers
        assertNotEquals(reviewA, reviewB);
        assertNotEquals(reviewB, reviewC);
        assertNotEquals(reviewC, reviewD);
    }

    @Test
    @DisplayName("Should accurately reflect customer feedback across Jewellery, Clothing, Gym, and Electronics categories")
    void testCrossIndustryFeedbackPreservation() {
        // Jewellery
        String jewReview = demoReviewGenerator.generateReview(
                "Sri Krishna Jewellers", "Bridal Gold", "Jewellery Store", "Temple gold",
                List.of("Craftsmanship", "Pricing transparency"),
                "Loved the temple gold craftsmanship, pricing was clearly explained.",
                LanguageStyle.ENGLISH, List.of(), 5, "FRIENDLY"
        );
        assertTrue(jewReview.toLowerCase().contains("temple gold craftsmanship"), "Jewellery review must reflect specific feedback");
        assertFalse(jewReview.toLowerCase().contains("delicious") || jewReview.toLowerCase().contains("food"));

        // Clothing
        String clothReview = demoReviewGenerator.generateReview(
                "Trends Fashion", "Casual Wear", "Clothing / Fashion Store", "Cotton shirts",
                List.of("Fabric comfort", "Fitting"),
                "Fabric was super soft, but trial rooms were busy.",
                LanguageStyle.ENGLISH, List.of(), 4, "FRIENDLY"
        );
        assertTrue(clothReview.toLowerCase().contains("trial rooms were busy"), "Clothing review must reflect busy trial rooms feedback");

        // Gym
        String gymReview = demoReviewGenerator.generateReview(
                "PowerFit Gym", "Strength Training", "Gym / Fitness Centre", "Cardio and weights",
                List.of("Trainer support", "Equipment quality"),
                "Great trainers, but evening peak hours are crowded.",
                LanguageStyle.ENGLISH, List.of(), 4, "FRIENDLY"
        );
        assertTrue(gymReview.toLowerCase().contains("evening peak hours are crowded"), "Gym review must reflect crowded peak hours");

        // Electronics
        String elecReview = demoReviewGenerator.generateReview(
                "Apex Computers", "Laptop Purchase", "Electronics Store", "Laptops and desktops",
                List.of("Genuine products", "Customer service"),
                "Genuine laptop received, staff helped with OS setup.",
                LanguageStyle.ENGLISH, List.of(), 5, "FRIENDLY"
        );
        assertTrue(elecReview.toLowerCase().contains("staff helped with os setup"), "Electronics review must reflect OS setup feedback");

        // Verify Latin script for all
        for (String r : List.of(jewReview, clothReview, gymReview, elecReview)) {
            assertFalse(TELUGU_SCRIPT_PATTERN.matcher(r).find());
            assertFalse(DEVANAGARI_SCRIPT_PATTERN.matcher(r).find());
        }
    }
}
