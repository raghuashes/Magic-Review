package com.magicreview.integration;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.magicreview.enums.LanguageStyle;
import com.magicreview.util.CategoryDefaults;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
        return generateReview(storeName, category, null, null, attributes, customerNote, languageStyle, previousReviews, starRating, tone);
    }

    public Optional<String> generateReview(String storeName, String category, String businessCategory,
                                           String specialties, List<String> attributes,
                                           String customerNote, LanguageStyle languageStyle,
                                           List<String> previousReviews, Integer starRating, String tone) {
        if (!isConfigured()) {
            log.info("Gemini API key is not configured. Switching to Demo Mode fallback.");
            return Optional.empty();
        }

        String prompt = buildPrompt(storeName, category, businessCategory, specialties, attributes, customerNote, languageStyle, previousReviews, starRating, tone);
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

    /**
     * AI-powered attribute suggestions tailored specifically to the business category and specialties.
     */
    public List<String> suggestAttributes(String category, String storeName, String description,
                                          String specialties, List<String> existingAttributes) {
        if (!isConfigured()) {
            return CategoryDefaults.generateSmartFallbackAttributes(category, storeName, description, specialties, existingAttributes);
        }

        String prompt = buildAttributePrompt(category, storeName, description, specialties, existingAttributes);
        String url = String.format("%s/%s:generateContent?key=%s", apiUrl, model, apiKey);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.7,
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
                        List<String> parsed = parseAttributeList(rawText);
                        if (!parsed.isEmpty()) {
                            return parsed;
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to suggest attributes via Gemini API: {}. Falling back to smart defaults.", e.getMessage());
        }

        return CategoryDefaults.generateSmartFallbackAttributes(category, storeName, description, specialties, existingAttributes);
    }

    private String buildPrompt(String storeName, String category, String businessCategory, String specialties,
                               List<String> attributes, String customerNote, LanguageStyle languageStyle,
                               List<String> previousReviews, Integer starRating, String tone) {
        String attrsString = (attributes != null && !attributes.isEmpty()) ? String.join(", ", attributes) : "None";
        String noteString = (customerNote != null && !customerNote.isBlank()) ? customerNote.trim() : "None";
        String safeTone = (tone != null && !tone.isBlank()) ? tone : "FRIENDLY";
        int safeRating = (starRating != null && starRating >= 1 && starRating <= 5) ? starRating : 5;
        String mainCategory = (businessCategory != null && !businessCategory.isBlank()) ? businessCategory : category;

        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert customer review generator for local Indian businesses.\n");
        sb.append("Business Category: ").append(mainCategory).append("\n");
        sb.append("Business Name: ").append(storeName).append("\n");
        if (specialties != null && !specialties.isBlank()) {
            sb.append("Specialties / Offerings: ").append(specialties.trim()).append("\n");
        }
        sb.append("Visit / Purchase Reason: ").append(category).append("\n");
        sb.append("Target Language Style: ").append(languageStyle.name()).append("\n");
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
            sb.append("CRITICAL: You must generate an entirely NEW, FRESH, and DISTINCT review. Vary the opening sentence, sentence structure, and vocabulary.\n\n");
        }

        sb.append("RULES:\n");
        sb.append("1. Output ONLY the raw review text string in 1 to 3 short, natural, conversational sentences. Sound like a real, authentic human customer. Do NOT include quotes, intros, or markdown.\n");
        sb.append("2. If Language Style is TELUGU_ENGLISH_MIX: Combine natural spoken Telugu with common English words. You MUST use Roman/English letters ONLY. DO NOT use Telugu script (TELUGU UNICODE IS STRICTLY FORBIDDEN).\n");
        sb.append("3. If Language Style is HINGLISH: Combine natural spoken Hindi with common English words. You MUST use Roman/English letters ONLY. DO NOT use Devanagari script (DEVANAGARI UNICODE IS STRICTLY FORBIDDEN).\n");
        sb.append("4. Do NOT invent fake facts or claims. Use the customer's actual input.\n");
        sb.append("5. STRICT CATEGORY-AWARE VOCABULARY RULE:\n");
        sb.append("   - If category relates to Food / Dining / Cafe / Bakery: Focus strictly on taste, flavour, freshness, dishes, and dining experience. NEVER mention clothes, jewellery, devices, or fabric.\n");
        sb.append("   - If category relates to Jewellery: Focus strictly on jewellery designs, gold/diamond craftsmanship, collections, and purchasing experience. NEVER mention food, dining, or tailoring.\n");
        sb.append("   - If category relates to Clothing / Fashion / Footwear: Focus on fabric comfort, fit, design variety, and fashion style.\n");
        sb.append("   - If category relates to Gym / Fitness: Focus on workout atmosphere, equipment, trainers, and fitness routines.\n");
        sb.append("   - If category relates to Healthcare / Dental: Focus on doctor consultation, diagnosis, treatment, and clinic care.\n");
        sb.append("   - Ensure all vocabulary perfectly matches the business category: ").append(mainCategory).append(".\n");

        return sb.toString();
    }

    private String buildAttributePrompt(String category, String storeName, String description,
                                        String specialties, List<String> existingAttributes) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are a business consultant for local businesses in India.\n");
        sb.append("Business Category: ").append(category != null ? category : "General Business").append("\n");
        sb.append("Business Name: ").append(storeName).append("\n");
        if (description != null && !description.isBlank()) {
            sb.append("Description: ").append(description.trim()).append("\n");
        }
        if (specialties != null && !specialties.isBlank()) {
            sb.append("Specialties / Products: ").append(specialties.trim()).append("\n");
        }
        if (existingAttributes != null && !existingAttributes.isEmpty()) {
            sb.append("Existing attributes (do not repeat these): ").append(String.join(", ", existingAttributes)).append("\n");
        }
        sb.append("\nGenerate 6 to 8 concise, specific, and useful customer experience attributes (2 to 4 words each) that customers would appreciate highlighting in a Google review for this business.\n");
        sb.append("Examples for Restaurant: Biryani taste, Rice and meat quality, Spice level, Family seating, Dining ambience, Service speed\n");
        sb.append("Format: Return ONLY a plain numbered list (1. ..., 2. ...). No introductory text or conversational filler.\n");
        return sb.toString();
    }

    private List<String> parseAttributeList(String rawText) {
        List<String> result = new ArrayList<>();
        Pattern pattern = Pattern.compile("^\\s*(?:[\\d]+[.)-]|[-*•])\\s*(.+)$", Pattern.MULTILINE);
        Matcher matcher = pattern.matcher(rawText);
        while (matcher.find()) {
            String attr = matcher.group(1).trim().replaceAll("^\"|\"$", "").replaceAll("\\*\\*", "");
            if (attr.length() >= 3 && attr.length() <= 40 && !result.contains(attr)) {
                result.add(attr);
            }
        }
        // Fallback line-by-line split if numbered format wasn't strictly followed
        if (result.isEmpty()) {
            String[] lines = rawText.split("\n");
            for (String line : lines) {
                String clean = line.trim().replaceAll("^[^a-zA-Z0-9]+", "").replaceAll("^\"|\"$", "");
                if (clean.length() >= 3 && clean.length() <= 40 && !result.contains(clean)) {
                    result.add(clean);
                }
            }
        }
        return result;
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
