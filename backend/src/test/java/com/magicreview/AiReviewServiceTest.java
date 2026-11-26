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
        when(geminiApiClient.generateReview(any(), any(), any(), any(), any(), any(), eq(LanguageStyle.ENGLISH), any(), any(), any()))
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
        when(geminiApiClient.generateReview(any(), any(), any(), any(), any(), any(), eq(LanguageStyle.TELUGU_ENGLISH_MIX), any(), any(), any()))
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
        when(geminiApiClient.generateReview(any(), any(), any(), any(), any(), any(), eq(LanguageStyle.HINGLISH), any(), any(), any()))
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
        assertTrue(lower.contains("bahut") || lower.contains("badhiya") || lower.contains("achha") || lower.contains("khas") || lower.contains("kafi"),
                "Should contain Romanized conversational Hindi words");
    }

    @Test
    @DisplayName("Should guarantee non-repetition when regenerate is clicked with previous reviews")
    void testNonRepetitionOnRegenerate() {
        when(storeRepository.findBySlugAndActiveTrue("sri-sai-jewellers"))
                .thenReturn(Optional.of(mockStore));
        when(geminiApiClient.generateReview(any(), any(), any(), any(), any(), any(), eq(LanguageStyle.TELUGU_ENGLISH_MIX), any(), any(), any()))
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
        when(geminiApiClient.generateReview(any(), any(), any(), any(), any(), any(), eq(LanguageStyle.TELUGU_ENGLISH_MIX), any(), any(), any()))
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
        assertTrue(restLower.contains("food") || restLower.contains("meal") || restLower.contains("dining") || restLower.contains("delicious") || restLower.contains("flavours") || restLower.contains("taste"),
                "Restaurant review should use culinary vocabulary");
        assertFalse(restLower.contains("jewellery") || restLower.contains("gold") || restLower.contains("diamond"),
                "Restaurant review must not contain jewellery terms");

        // Test Jewellery
        String jewelleryReview = demoReviewGenerator.generateReview(
                "Sri Sai Jewellers", "Gold Bangles", "Jewellery Store", "Gold & Diamond jewellery",
                List.of("Jewellery design", "Craftsmanship"), null, LanguageStyle.ENGLISH, List.of(), 5, "FRIENDLY"
        );
        assertNotNull(jewelleryReview);
        String jewLower = jewelleryReview.toLowerCase();
        assertTrue(jewLower.contains("jewellery") || jewLower.contains("craftsmanship") || jewLower.contains("designs") || jewLower.contains("shopping"),
                "Jewellery review should use jewellery vocabulary");
        assertFalse(jewLower.contains("delicious") || jewLower.contains("tasty") || jewLower.contains("flavour"),
                "Jewellery review must not contain culinary terms");
    }
}
