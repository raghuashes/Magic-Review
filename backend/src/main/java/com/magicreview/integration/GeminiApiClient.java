package com.magicreview.integration;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.magicreview.enums.LanguageStyle;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class GeminiApiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiApiClient.class);

    private final RestClient restClient;
    private final DemoReviewGenerator demoReviewGenerator;

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String model;

    @Value("${gemini.api-url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String apiUrl;

    public GeminiApiClient(RestClient restClient, DemoReviewGenerator demoReviewGenerator) {
        this.restClient = restClient;
        this.demoReviewGenerator = demoReviewGenerator;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public Optional<String> generateReview(String storeName, String category, List<String> attributes,
                                           String customerNote, LanguageStyle languageStyle) {
        return generateReview(storeName, category, attributes, customerNote, languageStyle, List.of());
    }

    public Optional<String> generateReview(String storeName, String category, List<String> attributes,
                                           String customerNote, LanguageStyle languageStyle,
                                           List<String> previousReviews) {
        return generateReview(storeName, category, attributes, customerNote, languageStyle, previousReviews, 5, "FRIENDLY");
    }

    public Optional<String> generateReview(String storeName, String category, List<String> attributes,
                                           String customerNote, LanguageStyle languageStyle,
                                           List<String> previousReviews, Integer starRating, String tone) {
        if (!isConfigured()) {
            log.info("Gemini API key is not configured. Switching to Demo Mode fallback.");
            return Optional.empty();
        }

        String prompt = buildPrompt(storeName, category, attributes, customerNote, languageStyle, previousReviews, starRating, tone);
        String url = String.format("%s/%s:generateContent?key=%s", apiUrl, model, apiKey);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.9,
                        "topP", 0.95,
                        "maxOutputTokens", 250
                )
        );

        try {
            GeminiResponse response = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(GeminiResponse.class);

            if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()) {
                Candidate candidate = response.getCandidates().get(0);
                if (candidate.getContent() != null && candidate.getContent().getParts() != null
                        && !candidate.getContent().getParts().isEmpty()) {
                    String rawText = candidate.getContent().getParts().get(0).getText();
                    if (rawText != null && !rawText.isBlank()) {
                        String cleaned = demoReviewGenerator.sanitizeLatinScript(rawText.trim());
                        // If model leaked forbidden script, warn and sanitize
                        if (demoReviewGenerator.containsForbiddenScripts(rawText)) {
                            log.warn("Gemini output contained native script characters. Sanitized to pure Latin script.");
                        }
                        return Optional.of(cleaned);
                    }
                }
            }
            log.warn("Gemini API returned an empty or invalid candidate structure.");
            return Optional.empty();
        } catch (Exception e) {
            log.error("Failed to generate review via Gemini API: {}. Falling back to demo mode.", e.getMessage());
            return Optional.empty();
        }
    }

    private String buildPrompt(String storeName, String category, List<String> attributes,
                               String customerNote, LanguageStyle languageStyle,
                               List<String> previousReviews) {
        return buildPrompt(storeName, category, attributes, customerNote, languageStyle, previousReviews, 5, "FRIENDLY");
    }

    private String buildPrompt(String storeName, String category, List<String> attributes,
                               String customerNote, LanguageStyle languageStyle,
                               List<String> previousReviews, Integer starRating, String tone) {
        String attrsString = (attributes != null && !attributes.isEmpty()) ? String.join(", ", attributes) : "None";
        String noteString = (customerNote != null && !customerNote.isBlank()) ? customerNote.trim() : "None";
        String safeTone = (tone != null && !tone.isBlank()) ? tone : "FRIENDLY";
        int safeRating = (starRating != null && starRating >= 1 && starRating <= 5) ? starRating : 5;

        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert customer review generator for local Indian businesses.\n");
        sb.append("Target Language Style: ").append(languageStyle.name()).append("\n");
        sb.append("Business Name: ").append(storeName).append("\n");
        sb.append("Category: ").append(category).append("\n");
        sb.append("Attributes Selected: ").append(attrsString).append("\n");
        sb.append("Customer Rating: ").append(safeRating).append(" out of 5 stars\n");
        sb.append("Desired Review Tone: ").append(safeTone).append("\n");
        sb.append("Customer Notes: ").append(noteString).append("\n\n");

        if (previousReviews != null && !previousReviews.isEmpty()) {
            sb.append("PREVIOUS REVIEWS ALREADY GENERATED (DO NOT REPEAT):\n");
            for (int i = 0; i < previousReviews.size(); i++) {
                sb.append(i + 1).append(". \"").append(previousReviews.get(i)).append("\"\n");
            }
            sb.append("\n");
            sb.append("CRITICAL: You must generate an entirely NEW, FRESH, and DISTINCT review. Do NOT repeat or paraphrase the sentence structures, openings, or word patterns used above.\n\n");
        }

        sb.append("RULES:\n");
        sb.append("1. Output ONLY the raw review text string in 1 to 3 short, natural, conversational sentences. Sound like a real, enthusiastic human customer. Do NOT include quotes, intros, or explanations.\n");
        sb.append("2. If Language Style is TELUGU_ENGLISH_MIX: Combine natural spoken Telugu with common English words. You MUST use Roman/English letters ONLY. DO NOT use Telugu script (TELUGU UNICODE IS STRICTLY FORBIDDEN).\n");
        sb.append("3. If Language Style is HINGLISH: Combine natural spoken Hindi with common English words. You MUST use Roman/English letters ONLY. DO NOT use Devanagari script (DEVANAGARI UNICODE IS STRICTLY FORBIDDEN).\n");
        sb.append("4. Do NOT invent facts, purchases, fake star ratings, discounts, or employee names not mentioned in the inputs.");

        return sb.toString();
    }

    // Helper DTOs for Jackson deserialization of Gemini response
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GeminiResponse {
        private List<Candidate> candidates;

        public List<Candidate> getCandidates() {
            return candidates;
        }

        public void setCandidates(List<Candidate> candidates) {
            this.candidates = candidates;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Candidate {
        private Content content;

        public Content getContent() {
            return content;
        }

        public void setContent(Content content) {
            this.content = content;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Content {
        private List<Part> parts;

        public List<Part> getParts() {
            return parts;
        }

        public void setParts(List<Part> parts) {
            this.parts = parts;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Part {
        private String text;

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }
    }
}
