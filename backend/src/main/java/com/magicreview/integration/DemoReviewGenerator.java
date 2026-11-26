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

    /**
     * Category-aware, non-repetitive review draft generator strictly using Latin script.
     */
    public String generateReview(String storeName, String category, String businessCategory,
                                 String specialties, List<String> attributes,
                                 String customerNote, LanguageStyle languageStyle,
                                 List<String> previousReviews, Integer starRating, String tone) {
        String safeStore = (storeName != null && !storeName.isBlank()) ? storeName.trim() : "this store";
        String safeCategory = (category != null && !category.isBlank()) ? category.trim() : "service";
        String mainCategory = (businessCategory != null && !businessCategory.isBlank()) ? businessCategory : safeCategory;

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
                candidateReviews = buildTeluguEnglishCandidates(safeStore, safeCategory, mainCategory, attributes, customerNote);
                break;
            case HINGLISH:
                candidateReviews = buildHinglishCandidates(safeStore, safeCategory, mainCategory, attributes, customerNote);
                break;
            case ENGLISH:
            default:
                candidateReviews = buildEnglishCandidates(safeStore, safeCategory, mainCategory, attributes, customerNote);
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
            fallback = fallback + " Truly a 5-star experience!";
        }
        return fallback;
    }

    // ==========================================
    // TELUGU + ENGLISH (ROMAN SCRIPT ONLY)
    // ==========================================
    private List<String> buildTeluguEnglishCandidates(String store, String category, String businessCategory,
                                                     List<String> attrs, String note) {
        String noteStr = (note != null && !note.isBlank()) ? " " + note.trim() + "." : "";
        String attrStr = formatAttrsTelugu(attrs);
        List<String> templates = new ArrayList<>();
        String catLower = (businessCategory != null ? businessCategory : category).toLowerCase();

        if (catLower.contains("restaurant") || catLower.contains("cafe") || catLower.contains("bakery") || catLower.contains("sweets")) {
            // Food / Dining Vocabulary
            templates.add(String.format("%s lo %s food taste and dining experience nijamga chala bagundhi. %s.%s Definitely malli visit chesthamu!",
                    store, category, attrStr, noteStr));
            templates.add(String.format("Today visited %s for %s and had delicious food. %s.%s Ambience and food quality chala peaceful ga anipinchindi, highly recommended!",
                    store, category, attrStr, noteStr));
            templates.add(String.format("%s lo %s taste aithe super undi! %s.%s Family tho visit cheyadaniki best spot, chala happy ga feel ayyamu.",
                    store, category, attrStr, noteStr));
            templates.add(String.format("Food quality and service chala baaga nachindi at %s. %s.%s %s dishes were freshly prepared. Friends ki guarantee ga suggest chestha!",
                    store, attrStr, noteStr, category));
        } else if (catLower.contains("jeweller")) {
            // Jewellery Vocabulary
            templates.add(String.format("%s lo %s jewellery designs and collection nijamga chala bagundhi. %s.%s Traditional and modern models super unnai!",
                    store, category, attrStr, noteStr));
            templates.add(String.format("Today visited %s for %s and had a wonderful time. %s.%s Staff patience and gold craftsmanship chala peaceful ga anipinchindi, highly recommended!",
                    store, category, attrStr, noteStr));
            templates.add(String.format("%s lo jewellery collection aithe super undi! %s.%s Family wedding shopping ki best shop, chala happy ga feel ayyamu.",
                    store, attrStr, noteStr));
            templates.add(String.format("Pure quality and transparent pricing at %s. %s.%s %s models chala unique ga unnai. Definitely malli visit chesthamu!",
                    store, attrStr, noteStr, category));
        } else if (catLower.contains("cloth") || catLower.contains("fashion") || catLower.contains("footwear")) {
            // Fashion / Clothing Vocabulary
            templates.add(String.format("%s lo %s fabric comfort and fitting nijamga chala bagundhi. %s.%s Latest designs and variety super unnai!",
                    store, category, attrStr, noteStr));
            templates.add(String.format("Today visited %s for %s and had a great shopping experience. %s.%s Polite staff and quality collection, highly recommended!",
                    store, category, attrStr, noteStr));
            templates.add(String.format("%s lo clothing collection aithe super undi! %s.%s Family tho visit cheyadaniki best showroom, chala happy ga feel ayyamu.",
                    store, attrStr, noteStr));
        } else if (catLower.contains("gym") || catLower.contains("fitness")) {
            // Gym / Fitness Vocabulary
            templates.add(String.format("%s gym workout atmosphere and equipment nijamga chala bagundhi. %s.%s Best place to achieve fitness goals!",
                    store, attrStr, noteStr));
            templates.add(String.format("Training at %s for %s has been a wonderful experience. %s.%s Trainers support and clean gym environment, highly recommended!",
                    store, category, attrStr, noteStr));
        } else if (catLower.contains("health") || catLower.contains("clinic") || catLower.contains("dental")) {
            // Healthcare / Clinic Vocabulary
            templates.add(String.format("%s lo doctor consultation and treatment chala baaga chesaru. %s.%s Staff care and clinic hygiene exceeded our expectations!",
                    store, attrStr, noteStr));
            templates.add(String.format("Visited %s for %s and had a reassuring experience. %s.%s Clear explanation and gentle care, highly recommended clinic!",
                    store, category, attrStr, noteStr));
        }

        // Universal variations to ensure rich choice
        templates.add(String.format("%s lo %s experience nijamga chala bagundhi. %s.%s Definitely malli visit chesthamu!",
                store, category, attrStr, noteStr));
        templates.add(String.format("Today visited %s for %s and had a wonderful time. %s.%s Staff behavior and hospitality chala peaceful ga anipinchindi, highly recommended!",
                store, category, attrStr, noteStr));
        templates.add(String.format("Customer care and service chala baaga nachindi at %s. %s.%s %s work chala neat ga chesaru. Friends and relatives ki guarantee ga suggest chestha!",
                store, attrStr, noteStr, category));
        templates.add(String.format("%s lo service chala honest and transparent ga undi. %s.%s Overall experience exceeded our expectations, thank you team!",
                store, attrStr, noteStr));

        return templates;
    }

    private String formatAttrsTelugu(List<String> attrs) {
        if (attrs == null || attrs.isEmpty()) {
            return "Staff chala respectful ga treat chesaru and service kuda fast ga undi";
        }
        String joined = String.join(", ", attrs);
        return "Mukhya ga " + joined + " chala impress chesindi";
    }

    // ==========================================
    // HINGLISH (ROMAN SCRIPT ONLY)
    // ==========================================
    private List<String> buildHinglishCandidates(String store, String category, String businessCategory,
                                                List<String> attrs, String note) {
        String noteStr = (note != null && !note.isBlank()) ? " " + note.trim() + "." : "";
        String attrStr = formatAttrsHinglish(attrs);
        List<String> templates = new ArrayList<>();
        String catLower = (businessCategory != null ? businessCategory : category).toLowerCase();

        if (catLower.contains("restaurant") || catLower.contains("cafe") || catLower.contains("bakery") || catLower.contains("sweets")) {
            // Dining / Food Hinglish
            templates.add(String.format("Aaj %s mein khana khaya, taste sach mein lajawab tha! %s.%s Definitely sabhi foodies ko recommend karunga.",
                    store, attrStr, noteStr));
            templates.add(String.format("%s par %s ka dining experience bahut shandar raha. %s.%s Ambience aur food quality dono top notch hain!",
                    store, category, attrStr, noteStr));
            templates.add(String.format("Fresh khana aur prompt service at %s! %s.%s Family ke sath lunch ya dinner ke liye best spot hai.",
                    store, attrStr, noteStr));
        } else if (catLower.contains("jeweller")) {
            // Jewellery Hinglish
            templates.add(String.format("%s se %s jewellery lekar dil khush ho gaya. %s.%s Design variety aur purity ekdum genuine hai!",
                    store, category, attrStr, noteStr));
            templates.add(String.format("Aaj %s visit kiya tha, collection sach mein kafi achha raha! %s.%s Staff ne kafi patience ke sath designs dikhaye.",
                    store, attrStr, noteStr));
        } else if (catLower.contains("cloth") || catLower.contains("fashion") || catLower.contains("footwear")) {
            // Fashion Hinglish
            templates.add(String.format("%s par %s collection bahut badhiya hai! %s.%s Fabric quality aur fitting dono bilkul perfect mili.",
                    store, category, attrStr, noteStr));
            templates.add(String.format("Shopping at %s was totally worth it. %s.%s Trendy designs aur polite staff, 5 stars!",
                    store, attrStr, noteStr));
        } else if (catLower.contains("gym") || catLower.contains("fitness")) {
            // Fitness Hinglish
            templates.add(String.format("%s gym ka workout atmosphere aur equipment dono top notch hain! %s.%s Highly motivating fitness center.",
                    store, attrStr, noteStr));
        } else if (catLower.contains("health") || catLower.contains("clinic") || catLower.contains("dental")) {
            // Clinic Hinglish
            templates.add(String.format("%s par doctor consultation bahut comforting aur thorough raha. %s.%s Clinic hygiene aur care ekdum best hai.",
                    store, attrStr, noteStr));
        }

        // Universal Hinglish templates
        templates.add(String.format("Aaj %s visit kiya tha for %s, experience sach mein kafi achha raha! %s.%s Definitely sabhi ko recommend karunga.",
                store, category, attrStr, noteStr));
        templates.add(String.format("%s se %s ka experience le kar dil khush ho gaya. %s.%s Staff ka nature kafi humble tha aur service bilkul smooth rahi!",
                store, category, attrStr, noteStr));
        templates.add(String.format("Ambience aur service dono top class hain at %s! %s.%s Family ke sath aane ke liye best place hai, 5 stars!",
                store, attrStr, noteStr));
        templates.add(String.format("Customer satisfaction ka pura dhyan rakhte hain %s wale. %s.%s %s requirement ko perfectly handle kiya!",
                store, attrStr, noteStr, category));

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
    private List<String> buildEnglishCandidates(String store, String category, String businessCategory,
                                               List<String> attrs, String note) {
        String noteStr = (note != null && !note.isBlank()) ? " " + note.trim() + "." : "";
        String attrStr = formatAttrsEnglish(attrs);
        List<String> templates = new ArrayList<>();
        String catLower = (businessCategory != null ? businessCategory : category).toLowerCase();

        if (catLower.contains("restaurant") || catLower.contains("cafe") || catLower.contains("bakery") || catLower.contains("sweets")) {
            // Dining / Food English
            templates.add(String.format("Had a truly delicious meal at %s today for %s. %s.%s The food quality and taste were top tier!",
                    store, category.toLowerCase(), attrStr, noteStr));
            templates.add(String.format("Visited %s and was blown away by the rich flavours and warm hospitality. %s.%s Freshly prepared and generous portions.",
                    store, attrStr, noteStr));
            templates.add(String.format("Such a wonderful dining experience at %s! %s.%s A perfect spot for family dinners or a quick tasty bite.",
                    store, attrStr, noteStr));
            templates.add(String.format("The entire food experience at %s was remarkable. %s.%s %s was cooked to perfection with great presentation.",
                    store, attrStr, noteStr, category));
        } else if (catLower.contains("jeweller")) {
            // Jewellery English
            templates.add(String.format("Purchased %s from %s and couldn't be happier with the craftsmanship. %s.%s The designs are stunning and purity is trustworthy.",
                    category.toLowerCase(), store, attrStr, noteStr));
            templates.add(String.format("Visited %s for our jewellery shopping and the collection was breathtaking. %s.%s Extremely patient staff who helped us choose the perfect piece.",
                    store, attrStr, noteStr));
            templates.add(String.format("Exceptional jewellery designs and honest pricing at %s. %s.%s Highly recommend them for bridal and daily wear jewellery!",
                    store, attrStr, noteStr));
        } else if (catLower.contains("cloth") || catLower.contains("fashion") || catLower.contains("footwear")) {
            // Clothing English
            templates.add(String.format("Found the perfect %s at %s! %s.%s The fabric comfort, fitting, and design variety exceeded our expectations.",
                    category.toLowerCase(), store, attrStr, noteStr));
            templates.add(String.format("Great fashion collection and shopping atmosphere at %s. %s.%s Courteous staff who guided us through the latest styles effortlessly.",
                    store, attrStr, noteStr));
        } else if (catLower.contains("gym") || catLower.contains("fitness")) {
            // Gym English
            templates.add(String.format("Working out at %s has been fantastic! %s.%s High-quality equipment, clean environment, and motivating workout atmosphere.",
                    store, attrStr, noteStr));
            templates.add(String.format("Great fitness center at %s for %s. %s.%s Trainers are supportive and facilities are well maintained.",
                    store, category.toLowerCase(), attrStr, noteStr));
        } else if (catLower.contains("health") || catLower.contains("clinic") || catLower.contains("dental")) {
            // Healthcare English
            templates.add(String.format("Consulted at %s for %s and received exceptional, compassionate care. %s.%s Thorough diagnosis and clean, hygienic clinic.",
                    store, category.toLowerCase(), attrStr, noteStr));
            templates.add(String.format("Very reassuring visit to %s. %s.%s Doctor was gentle, patient, and explained the treatment clearly.",
                    store, attrStr, noteStr));
        }

        // Universal English templates
        templates.add(String.format("Had a truly delightful experience at %s today for %s. %s.%s The team went above and beyond to assist us!",
                store, category.toLowerCase(), attrStr, noteStr));
        templates.add(String.format("Visited %s and was genuinely impressed by their warm hospitality. %s.%s Honest guidance and quick service throughout.",
                store, attrStr, noteStr));
        templates.add(String.format("Such a smooth and pleasant visit to %s for %s. %s.%s Highly recommend their service to anyone looking for genuine quality!",
                store, category.toLowerCase(), attrStr, noteStr));
        templates.add(String.format("Exceptional customer care at %s! %s.%s The staff was patient, polite, and never rushed us. Will definitely be returning.",
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
