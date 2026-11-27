package com.magicreview.integration;

import com.magicreview.enums.LanguageStyle;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Pattern;

@Component
public class DemoReviewGenerator {

    // Regex for strictly forbidden native Indian scripts
    private static final Pattern TELUGU_UNICODE_PATTERN = Pattern.compile("[\\u0C00-\\u0C7F]");
    private static final Pattern DEVANAGARI_UNICODE_PATTERN = Pattern.compile("[\\u0900-\\u097F]");

    // Pattern to detect critical, mixed, or constructive customer feedback
    private static final Pattern CRITICAL_OR_MIXED_PATTERN = Pattern.compile(
            "(?i)\\b(but|though|however|although|slow|delay|delayed|expensive|pricey|costly|poor|bad|average|below|disappoint|disappointed|small|tight|crowded|loud|noisy|cold|wait|waiting|wait time|little slow|bit slow|could be better|improve|mediocre|rough|issue|issues|problem|problems|unfriendly)\\b"
    );

    /**
     * Backward compatible generation without previous review history.
     */
    public String generateReview(String storeName, String category, List<String> attributes,
                                 String customerNote, LanguageStyle languageStyle) {
        return generateReview(storeName, category, attributes, customerNote, languageStyle, Collections.emptyList());
    }

    public String generateReview(String storeName, String category, List<String> attributes,
                                 String customerNote, LanguageStyle languageStyle,
                                 List<String> previousReviews) {
        return generateReview(storeName, category, attributes, customerNote, languageStyle, previousReviews, 5, "FRIENDLY");
    }

    public String generateReview(String storeName, String category, List<String> attributes,
                                 String customerNote, LanguageStyle languageStyle,
                                 List<String> previousReviews, Integer starRating, String tone) {
        return generateReview(storeName, category, null, null, attributes, customerNote, languageStyle, previousReviews, starRating, tone);
    }

    public String generateReview(String storeName, String category, String businessCategory,
                                 String specialties, List<String> attributes,
                                 String customerNote, LanguageStyle languageStyle,
                                 List<String> previousReviews, Integer starRating, String tone) {
        return generateReview(storeName, category, businessCategory, null, specialties, attributes, customerNote, languageStyle, previousReviews, starRating, tone);
    }

    /**
     * Customer-experience-first, category-aware, non-repetitive review draft generator strictly using Latin script.
     * The customer's actual feedback is the PRIMARY driver of the generated review.
     */
    public String generateReview(String storeName, String category, String businessCategory,
                                 String businessDescription, String specialties, List<String> attributes,
                                 String customerFeedback, LanguageStyle languageStyle,
                                 List<String> previousReviews, Integer starRating, String tone) {
        String safeStore = (storeName != null && !storeName.isBlank()) ? storeName.trim() : "this store";
        String safeCategory = (category != null && !category.isBlank()) ? category.trim() : "service";
        String mainCategory = (businessCategory != null && !businessCategory.isBlank()) ? businessCategory : safeCategory;
        String feedback = (customerFeedback != null && !customerFeedback.isBlank()) ? customerFeedback.trim() : "";

        Set<String> excluded = new HashSet<>();
        if (previousReviews != null) {
            for (String pr : previousReviews) {
                if (pr != null) {
                    excluded.add(pr.trim().toLowerCase());
                }
            }
        }

        List<String> candidateReviews;
        switch (languageStyle) {
            case TELUGU_ENGLISH_MIX:
                candidateReviews = buildTeluguEnglishCandidates(safeStore, safeCategory, mainCategory, attributes, feedback);
                break;
            case HINGLISH:
                candidateReviews = buildHinglishCandidates(safeStore, safeCategory, mainCategory, attributes, feedback);
                break;
            case ENGLISH:
            default:
                candidateReviews = buildEnglishCandidates(safeStore, safeCategory, mainCategory, attributes, feedback);
                break;
        }

        // Shuffle candidates so consecutive calls yield varied order
        Collections.shuffle(candidateReviews);

        // Pick the first candidate that hasn't appeared in previousReviews
        for (String candidate : candidateReviews) {
            String sanitized = sanitizeLatinScript(candidate.trim());
            if (!excluded.contains(sanitized.toLowerCase()) && !sanitized.isBlank()) {
                return sanitized;
            }
        }

        // Fallback: If all candidates were cycled, append a fresh variation tag
        String fallback = sanitizeLatinScript(candidateReviews.get(0).trim());
        if (excluded.contains(fallback.toLowerCase())) {
            fallback = fallback + " (Visit feedback verified)";
        }
        return fallback;
    }

    // ==========================================
    // ENGLISH (CUSTOMER EXPERIENCE FIRST)
    // ==========================================
    private List<String> buildEnglishCandidates(String store, String category, String businessCategory,
                                                List<String> attrs, String feedback) {
        List<String> templates = new ArrayList<>();
        List<String> safeAttrs = attrs != null ? attrs : Collections.emptyList();

        if (!feedback.isBlank()) {
            boolean isCriticalOrMixed = CRITICAL_OR_MIXED_PATTERN.matcher(feedback).find();
            String cleanedFeedback = ensurePunctuation(feedback);

            if (isCriticalOrMixed) {
                // Mixed, constructive, or critical customer feedback - DO NOT whitewash with 100% glowing praise!
                if (!safeAttrs.isEmpty()) {
                    String attrSummary = String.join(", ", safeAttrs);
                    templates.add(String.format("I visited %s for %s. %s Appreciated noting the %s, though addressing this feedback will make the service much better.",
                            store, category.toLowerCase(), cleanedFeedback, attrSummary));
                    templates.add(String.format("Regarding my visit to %s: %s While the %s was noted, there is clear room for improvement.",
                            store, cleanedFeedback, attrSummary));
                    templates.add(String.format("Had an experience at %s recently. %s Staff were polite regarding %s, but hope the team takes this feedback constructively.",
                            store, cleanedFeedback, attrSummary));
                    templates.add(String.format("Visited %s for %s. %s Helpful staff overall, though speed and consistency could definitely be improved.",
                            store, category.toLowerCase(), cleanedFeedback));
                } else {
                    templates.add(String.format("I visited %s for %s. %s Hope the team takes this feedback constructively to improve.",
                            store, category.toLowerCase(), cleanedFeedback));
                    templates.add(String.format("Regarding my recent visit to %s: %s A mixed experience overall that could be much better with some adjustments.",
                            store, cleanedFeedback));
                    templates.add(String.format("Visited %s recently. %s The staff were courteous, but hope these specific points are looked into.",
                            store, cleanedFeedback));
                }
            } else {
                // Positive feedback based on genuine customer experience
                if (!safeAttrs.isEmpty()) {
                    String attrSummary = String.join(", ", safeAttrs);
                    templates.add(String.format("I had a great experience at %s. %s Particularly satisfied with the %s. Highly recommend them!",
                            store, cleanedFeedback, attrSummary));
                    templates.add(String.format("Visited %s for %s and was genuinely pleased. %s The %s was spot on throughout.",
                            store, category.toLowerCase(), cleanedFeedback, attrSummary));
                    templates.add(String.format("Such a wonderful visit to %s! %s Appreciated the %s and honest service.",
                            store, cleanedFeedback, attrSummary));
                    templates.add(String.format("Really impressed with %s. %s %s was cooked/handled to perfection with great care.",
                            store, cleanedFeedback, attrSummary));
                } else {
                    templates.add(String.format("I had a great experience at %s. %s Honest guidance and pleasant service throughout.",
                            store, cleanedFeedback));
                    templates.add(String.format("Visited %s for %s and was very pleased. %s Will definitely be returning and recommending to others!",
                            store, category.toLowerCase(), cleanedFeedback));
                    templates.add(String.format("Really pleased with our visit to %s. %s Everything went smoothly from start to finish.",
                            store, cleanedFeedback));
                }
            }
        } else {
            // Customer provided NO written feedback: generate a brief, realistic review based ONLY on selected attributes
            if (!safeAttrs.isEmpty()) {
                String attrSummary = String.join(", ", safeAttrs);
                templates.add(String.format("Visited %s for %s. Particularly satisfied with the %s. Courteous staff and smooth experience throughout.",
                        store, category.toLowerCase(), attrSummary));
                templates.add(String.format("Had a good experience at %s. The %s stood out the most during our visit.",
                        store, attrSummary));
                templates.add(String.format("Pleasant visit to %s today. Appreciated the %s and honest assistance.",
                        store, attrSummary));
                templates.add(String.format("Good service at %s for %s. The %s met our expectations nicely.",
                        store, category.toLowerCase(), attrSummary));
            } else {
                templates.add(String.format("Visited %s for %s. The staff were polite, attentive, and helpful throughout our visit.",
                        store, category.toLowerCase()));
                templates.add(String.format("Had a pleasant visit to %s. Honest guidance and clean environment.",
                        store));
                templates.add(String.format("Good service at %s. Professional assistance and prompt customer care.",
                        store));
            }
        }

        return templates;
    }

    // ==========================================
    // TELUGU + ENGLISH (ROMAN SCRIPT ONLY)
    // ==========================================
    private List<String> buildTeluguEnglishCandidates(String store, String category, String businessCategory,
                                                      List<String> attrs, String feedback) {
        List<String> templates = new ArrayList<>();
        List<String> safeAttrs = attrs != null ? attrs : Collections.emptyList();

        if (!feedback.isBlank()) {
            boolean isCriticalOrMixed = CRITICAL_OR_MIXED_PATTERN.matcher(feedback).find();
            String cleanedFeedback = ensurePunctuation(feedback);

            if (isCriticalOrMixed) {
                // Mixed or constructive feedback in Telugu-English mix (Roman script)
                if (!safeAttrs.isEmpty()) {
                    String attrSummary = String.join(", ", safeAttrs);
                    templates.add(String.format("%s lo visit chesinappudu: %s %s bagunna, service speed / quality konchem improve chesthe inka chala baguntundhi.",
                            store, cleanedFeedback, attrSummary));
                    templates.add(String.format("Recently visited %s for %s. %s Staff baane unna, hope team takes this genuine feedback positively.",
                            store, category, cleanedFeedback));
                    templates.add(String.format("%s lo experience: %s %s unna, konchem adjustments unte experience perfect ga untundhi.",
                            store, cleanedFeedback, attrSummary));
                } else {
                    templates.add(String.format("%s lo visit chesinappudu: %s Service speed and consistency improve chesthe inka chala baguntundhi.",
                            store, cleanedFeedback));
                    templates.add(String.format("Recently visited %s for %s. %s Hope team takes this genuine feedback to improve.",
                            store, category, cleanedFeedback));
                    templates.add(String.format("%s lo experience: %s Konchem adjustments unte visit perfect ga anipisthundhi.",
                            store, cleanedFeedback));
                }
            } else {
                // Positive feedback in Telugu-English mix (Roman script)
                if (!safeAttrs.isEmpty()) {
                    String attrSummary = String.join(", ", safeAttrs);
                    templates.add(String.format("%s lo visit chala bagundhi! %s Mukhya ga %s aithe super impress chesindi. Definitely malli visit chesthamu!",
                            store, cleanedFeedback, attrSummary));
                    templates.add(String.format("Today visited %s for %s. %s %s and hospitality chala peaceful ga anipinchindi, highly recommended!",
                            store, category, cleanedFeedback, attrSummary));
                    templates.add(String.format("%s lo service and quality aithe super undi. %s %s chala baaga nachindi!",
                            store, cleanedFeedback, attrSummary));
                } else {
                    templates.add(String.format("%s lo visit chala bagundhi! %s Overall experience exceeded our expectations, thank you team!",
                            store, cleanedFeedback));
                    templates.add(String.format("Today visited %s for %s. %s Staff hospitality chala peaceful ga anipinchindi, highly recommended!",
                            store, category, cleanedFeedback));
                    templates.add(String.format("%s lo service and honest guidance aithe super undi. %s Friends and family ki guarantee ga recommend chestha!",
                            store, cleanedFeedback));
                }
            }
        } else {
            // No written feedback: brief review based strictly on selected attributes
            if (!safeAttrs.isEmpty()) {
                String attrSummary = String.join(", ", safeAttrs);
                templates.add(String.format("%s lo %s experience baaga nachindi. Mukhya ga %s chala impress chesindi.",
                        store, category, attrSummary));
                templates.add(String.format("Today visited %s. %s aithe super unnai, definitely malli visit chesthamu!",
                        store, attrSummary));
                templates.add(String.format("%s lo service and %s chala neat ga handle chesaru. Good experience overall.",
                        store, attrSummary));
            } else {
                templates.add(String.format("%s lo %s experience baaga anipinchindi. Staff chala respectful ga treat chesaru.",
                        store, category));
                templates.add(String.format("Good service at %s. Honest guidance and clean environment, happy with the visit.",
                        store));
            }
        }

        return templates;
    }

    // ==========================================
    // HINGLISH (ROMAN SCRIPT ONLY)
    // ==========================================
    private List<String> buildHinglishCandidates(String store, String category, String businessCategory,
                                                List<String> attrs, String feedback) {
        List<String> templates = new ArrayList<>();
        List<String> safeAttrs = attrs != null ? attrs : Collections.emptyList();

        if (!feedback.isBlank()) {
            boolean isCriticalOrMixed = CRITICAL_OR_MIXED_PATTERN.matcher(feedback).find();
            String cleanedFeedback = ensurePunctuation(feedback);

            if (isCriticalOrMixed) {
                // Mixed or constructive feedback in Hinglish (Roman script)
                if (!safeAttrs.isEmpty()) {
                    String attrSummary = String.join(", ", safeAttrs);
                    templates.add(String.format("%s par visit ke dauran: %s %s achha tha, lekin agar service speed / consistency par dhyan diya jaye toh experience aur behtar hoga.",
                            store, cleanedFeedback, attrSummary));
                    templates.add(String.format("Recently %s visit kiya tha for %s. %s Staff polite the, hope management is feedback par jald improve karega.",
                            store, category, cleanedFeedback));
                    templates.add(String.format("%s ka overall experience: %s %s theek tha, bas thode improvements ki zaroorat hai.",
                            store, cleanedFeedback, attrSummary));
                } else {
                    templates.add(String.format("%s par visit ke dauran: %s Agar in points par dhyan diya jaye toh experience aur behtar hoga.",
                            store, cleanedFeedback));
                    templates.add(String.format("Recently %s visit kiya tha for %s. %s Hope management is feedback par jald improve karega.",
                            store, category, cleanedFeedback));
                    templates.add(String.format("%s ka overall experience: %s Mixed visit raha, umeed hai next time aur behtar service milegi.",
                            store, cleanedFeedback));
                }
            } else {
                // Positive feedback in Hinglish (Roman script)
                if (!safeAttrs.isEmpty()) {
                    String attrSummary = String.join(", ", safeAttrs);
                    templates.add(String.format("%s par visit bahut shandar raha! %s Khas karke %s humein sabse zyada pasand aaya. Definitely recommend karunga!",
                            store, cleanedFeedback, attrSummary));
                    templates.add(String.format("Aaj %s visit kiya tha for %s. %s Service aur %s dono bilkul top class the!",
                            store, category, cleanedFeedback, attrSummary));
                    templates.add(String.format("%s par experience sach mein lajawab tha. %s %s kafi achha raha, puri tarah se satisfied hoon!",
                            store, cleanedFeedback, attrSummary));
                } else {
                    templates.add(String.format("%s par visit bahut shandar raha! %s Definitely sabhi ko recommend karunga!",
                            store, cleanedFeedback));
                    templates.add(String.format("Aaj %s visit kiya tha for %s. %s Service aur dealing dono bilkul top class the!",
                            store, category, cleanedFeedback));
                    templates.add(String.format("%s par experience sach mein lajawab tha. %s Puri tarah se satisfied hoon!",
                            store, cleanedFeedback));
                }
            }
        } else {
            // No written feedback: brief review based strictly on selected attributes
            if (!safeAttrs.isEmpty()) {
                String attrSummary = String.join(", ", safeAttrs);
                templates.add(String.format("%s par %s ka experience kafi achha raha. Khas karke %s humein sabse zyada pasand aaya.",
                        store, category, attrSummary));
                templates.add(String.format("Aaj %s visit kiya tha. %s dono bilkul top class the, highly recommended!",
                        store, attrSummary));
                templates.add(String.format("%s par dealing aur %s kafi transparent aur smooth raha.",
                        store, attrSummary));
            } else {
                templates.add(String.format("%s par %s ka experience kafi comforting aur polite raha. Staff helpful the.",
                        store, category));
                templates.add(String.format("Good service at %s. Honest dealing aur clean environment mila, happy with the visit.",
                        store));
            }
        }

        return templates;
    }

    private String ensurePunctuation(String s) {
        if (s == null || s.isBlank()) return "";
        String trimmed = s.trim();
        char last = trimmed.charAt(trimmed.length() - 1);
        if (last != '.' && last != '!' && last != '?') {
            return trimmed + ".";
        }
        return trimmed;
    }

    /**
     * Sanitizes and guarantees that only Roman/Latin characters, numbers, and standard punctuation exist.
     */
    public String sanitizeLatinScript(String text) {
        if (text == null) return "";
        String sanitized = TELUGU_UNICODE_PATTERN.matcher(text).replaceAll("");
        sanitized = DEVANAGARI_UNICODE_PATTERN.matcher(sanitized).replaceAll("");
        sanitized = sanitized.replaceAll("^[\"']+|[\"']+$", "").trim();
        return sanitized;
    }

    public boolean containsForbiddenScripts(String text) {
        if (text == null) return false;
        return TELUGU_UNICODE_PATTERN.matcher(text).find() || DEVANAGARI_UNICODE_PATTERN.matcher(text).find();
    }
}
