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

    private final Random random = new Random();

    /**
     * Backward compatible generation without previous review history.
     */
    public String generateReview(String storeName, String category, List<String> attributes,
                                 String customerNote, LanguageStyle languageStyle) {
        return generateReview(storeName, category, attributes, customerNote, languageStyle, Collections.emptyList());
    }

    /**
     * Generates a humanized, natural customer review draft strictly using Latin script,
     * ensuring it does NOT repeat any review previously generated for this session.
     */
    public String generateReview(String storeName, String category, List<String> attributes,
                                 String customerNote, LanguageStyle languageStyle,
                                 List<String> previousReviews) {
        return generateReview(storeName, category, attributes, customerNote, languageStyle, previousReviews, 5, "FRIENDLY");
    }

    public String generateReview(String storeName, String category, List<String> attributes,
                                 String customerNote, LanguageStyle languageStyle,
                                 List<String> previousReviews, Integer starRating, String tone) {
        String safeStore = (storeName != null && !storeName.isBlank()) ? storeName.trim() : "this store";
        String safeCategory = (category != null && !category.isBlank()) ? category.trim() : "service";

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
                candidateReviews = buildTeluguEnglishCandidates(safeStore, safeCategory, attributes, customerNote);
                break;
            case HINGLISH:
                candidateReviews = buildHinglishCandidates(safeStore, safeCategory, attributes, customerNote);
                break;
            case ENGLISH:
            default:
                candidateReviews = buildEnglishCandidates(safeStore, safeCategory, attributes, customerNote);
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

        // Fallback: If all candidates were somehow cycled, append a fresh variation tag
        String fallback = sanitizeLatinScript(candidateReviews.get(0).trim());
        if (excluded.contains(fallback.toLowerCase())) {
            fallback = fallback + " Great experience overall!";
        }
        return fallback;
    }

    // ==========================================
    // TELUGU + ENGLISH (ROMAN SCRIPT ONLY)
    // ==========================================
    private List<String> buildTeluguEnglishCandidates(String store, String category, List<String> attrs, String note) {
        String noteStr = (note != null && !note.isBlank()) ? " " + note.trim() + "." : "";
        String attrStr = formatAttrsTelugu(attrs);

        List<String> templates = new ArrayList<>();

        templates.add(String.format("%s lo %s shopping experience nijamga chala bagundhi. %s.%s Definitely malli visit chesthamu!",
                store, category, attrStr, noteStr));

        templates.add(String.format("Today visited %s for %s and had a wonderful time. %s.%s Staff behavior and hospitality chala peaceful ga anipinchindi, highly recommended!",
                store, category, attrStr, noteStr));

        templates.add(String.format("%s lo %s collection aithe super undi! %s.%s Family tho visit cheyadaniki best shop, chala happy ga feel ayyamu.",
                store, category, attrStr, noteStr));

        templates.add(String.format("Customer care and service chala baaga nachindi at %s. %s.%s %s work chala neat ga chesaru. Friends and relatives ki guarantee ga suggest chestha!",
                store, attrStr, noteStr, category));

        templates.add(String.format("%s lo service chala honest and transparent ga undi. %s.%s Overall experience exceeded our expectations, thank you team!",
                store, attrStr, noteStr));

        templates.add(String.format("Had a really great experience exploring %s at %s. %s.%s Anni items chala opika tho explain chesaru, 5 stars for sure!",
                category, store, attrStr, noteStr));

        templates.add(String.format("%s lo customer satisfaction ki iche priority chala impress chesindi. %s.%s Shopping experience was so smooth and hassle-free!",
                store, attrStr, noteStr));

        templates.add(String.format("Very happy with our visit to %s today for %s. %s.%s Polite staff and quality service, malli ikkadike vastham!",
                store, category, attrStr, noteStr));

        return templates;
    }

    private String formatAttrsTelugu(List<String> attrs) {
        if (attrs == null || attrs.isEmpty()) {
            return "Staff chala respectful ga treat chesaru and pricing kuda fair ga undi";
        }
        String joined = String.join(", ", attrs);
        return "Mukhya ga " + joined + " chala impress chesindi";
    }

    // ==========================================
    // HINGLISH (ROMAN SCRIPT ONLY)
    // ==========================================
    private List<String> buildHinglishCandidates(String store, String category, List<String> attrs, String note) {
        String noteStr = (note != null && !note.isBlank()) ? " " + note.trim() + "." : "";
        String attrStr = formatAttrsHinglish(attrs);

        List<String> templates = new ArrayList<>();

        templates.add(String.format("Aaj %s visit kiya tha for %s, experience sach mein kafi achha raha! %s.%s Definitely sabhi ko recommend karunga.",
                store, category, attrStr, noteStr));

        templates.add(String.format("%s se %s lekar dil khush ho gaya. %s.%s Staff ka nature kafi humble tha aur shopping bilkul smooth rahi!",
                store, category, attrStr, noteStr));

        templates.add(String.format("Ambience aur service dono top class hain at %s! %s.%s Family ke sath aane ke liye best place hai, 5 stars!",
                store, attrStr, noteStr));

        templates.add(String.format("%s par %s ka experience bahut shandar raha. %s.%s Kisi bhi tarah ka rush nahi tha, sab kuch aaram se dikhaya.",
                store, category, attrStr, noteStr));

        templates.add(String.format("Customer satisfaction ka pura dhyan rakhte hain %s wale. %s.%s %s requirement ko perfectly handle kiya!",
                store, attrStr, noteStr, category));

        templates.add(String.format("Bohot hi cooperative staff aur transparent dealing at %s. %s.%s Truly impressed by their professionalism!",
                store, attrStr, noteStr));

        templates.add(String.format("Superb experience visiting %s for %s today. %s.%s Har ek sawal ka jawab patience ke sath diya, loved it!",
                store, category, attrStr, noteStr));

        templates.add(String.format("%s mein %s service ekdum top-notch hai. %s.%s Will definitely visit again soon!",
                store, category, attrStr, noteStr));

        return templates;
    }

    private String formatAttrsHinglish(List<String> attrs) {
        if (attrs == null || attrs.isEmpty()) {
            return "Staff ka behavior kafi polite tha aur dealing ekdum fair thi";
        }
        String joined = String.join(", ", attrs);
        return "Khas karke " + joined + " humein sabse zyada pasand aaya";
    }

    // ==========================================
    // ENGLISH (CONVERSATIONAL & HUMANIZED)
    // ==========================================
    private List<String> buildEnglishCandidates(String store, String category, List<String> attrs, String note) {
        String noteStr = (note != null && !note.isBlank()) ? " " + note.trim() + "." : "";
        String attrStr = formatAttrsEnglish(attrs);

        List<String> templates = new ArrayList<>();

        templates.add(String.format("Had a truly delightful experience at %s today for %s. %s.%s The team went above and beyond to assist us!",
                store, category.toLowerCase(), attrStr, noteStr));

        templates.add(String.format("Visited %s and was genuinely impressed by their warm hospitality. %s.%s Honest guidance and quick service throughout.",
                store, attrStr, noteStr));

        templates.add(String.format("Such a smooth and pleasant visit to %s for %s. %s.%s Highly recommend their service to anyone looking for genuine quality!",
                store, category.toLowerCase(), attrStr, noteStr));

        templates.add(String.format("The entire experience at %s was top notch. %s.%s %s was handled with great care and attention to detail.",
                store, attrStr, noteStr, category));

        templates.add(String.format("Exceptional customer care at %s! %s.%s The staff was patient, polite, and never rushed us. Will definitely be returning.",
                store, attrStr, noteStr));

        templates.add(String.format("Everything about our visit to %s was wonderful. %s.%s A trustworthy business that truly values its customers.",
                store, attrStr, noteStr));

        templates.add(String.format("From the moment we walked into %s for %s, the service was effortless. %s.%s Outstanding professionalism and transparent pricing!",
                store, category.toLowerCase(), attrStr, noteStr));

        templates.add(String.format("Genuinely satisfied with the experience at %s. %s.%s Courteous staff and great atmosphere all around.",
                store, attrStr, noteStr));

        return templates;
    }

    private String formatAttrsEnglish(List<String> attrs) {
        if (attrs == null || attrs.isEmpty()) {
            return "The staff was remarkably attentive and the service was prompt";
        }
        String joined = String.join(", ", attrs);
        return "Particularly loved the " + joined;
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
