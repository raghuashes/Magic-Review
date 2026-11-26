package com.magicreview.util;

import java.util.*;

public class CategoryDefaults {

    public static final List<String> ALL_CATEGORIES = List.of(
            "Restaurant",
            "Cafe / Coffee Shop",
            "Bakery / Sweets",
            "Hotel / Resort",
            "Jewellery Store",
            "Clothing / Fashion Store",
            "Footwear Store",
            "Supermarket / Grocery Store",
            "Electronics Store",
            "Mobile / Computer Store",
            "Salon / Beauty Parlour",
            "Spa / Wellness Centre",
            "Gym / Fitness Centre",
            "Healthcare / Clinic",
            "Dental Clinic",
            "Education / Coaching Centre",
            "Automobile / Car Service",
            "Travel / Tourism",
            "Real Estate",
            "Home Decor / Furniture",
            "Photography / Events",
            "E-commerce / Online Store",
            "Professional Services",
            "Other / Custom Business"
    );

    private static final Map<String, List<String>> DEFAULTS = new LinkedHashMap<>();

    static {
        // 1. Restaurant
        DEFAULTS.put("Restaurant", List.of(
                "Food taste", "Food quality", "Menu variety", "Portion size",
                "Staff service", "Ambience", "Cleanliness", "Value for money"
        ));

        // 2. Cafe / Coffee Shop
        DEFAULTS.put("Cafe / Coffee Shop", List.of(
                "Coffee taste", "Beverage quality", "Desserts", "Ambience",
                "Seating comfort", "Staff service", "Wi-Fi", "Value for money"
        ));

        // 3. Bakery / Sweets
        DEFAULTS.put("Bakery / Sweets", List.of(
                "Taste", "Freshness", "Product variety", "Presentation",
                "Quality", "Packaging", "Value for money", "Hygiene"
        ));

        // 4. Hotel / Resort
        DEFAULTS.put("Hotel / Resort", List.of(
                "Room cleanliness", "Room comfort", "Hospitality", "Staff service",
                "Food quality", "Facilities", "Location", "Overall stay"
        ));

        // 5. Jewellery Store
        DEFAULTS.put("Jewellery Store", List.of(
                "Jewellery design", "Collection variety", "Gold / silver / diamond quality",
                "Craftsmanship", "Staff assistance", "Pricing transparency", "Shopping experience"
        ));

        // 6. Clothing / Fashion Store
        DEFAULTS.put("Clothing / Fashion Store", List.of(
                "Clothing quality", "Fabric comfort", "Design variety", "Size availability",
                "Fitting", "Staff assistance", "Pricing", "Shopping experience"
        ));

        // 7. Footwear Store
        DEFAULTS.put("Footwear Store", List.of(
                "Footwear quality", "Comfort & fit", "Design variety", "Durability",
                "Size availability", "Staff assistance", "Pricing", "Shopping experience"
        ));

        // 8. Supermarket / Grocery Store
        DEFAULTS.put("Supermarket / Grocery Store", List.of(
                "Fresh produce", "Product availability", "Grocery variety", "Store cleanliness",
                "Billing speed", "Staff helpfulness", "Competitive pricing", "Easy aisles"
        ));

        // 9. Electronics Store
        DEFAULTS.put("Electronics Store", List.of(
                "Product quality", "Product variety", "Genuine products", "Staff knowledge",
                "Pricing", "Warranty support", "Customer service", "Demo experience"
        ));

        // 10. Mobile / Computer Store
        DEFAULTS.put("Mobile / Computer Store", List.of(
                "Device collection", "Genuine accessories", "Technical expertise", "Repair service",
                "Quick turnaround", "Fair pricing", "After-sales support", "Helpful staff"
        ));

        // 11. Salon / Beauty Parlour
        DEFAULTS.put("Salon / Beauty Parlour", List.of(
                "Haircut / styling", "Beauty services", "Staff expertise", "Hygiene",
                "Appointment experience", "Service quality", "Value for money", "Ambience"
        ));

        // 12. Spa / Wellness Centre
        DEFAULTS.put("Spa / Wellness Centre", List.of(
                "Relaxation ambience", "Therapist skill", "Hygiene & cleanliness", "Massage quality",
                "Aromatherapy", "Polite hospitality", "Value for money", "Peaceful environment"
        ));

        // 13. Gym / Fitness Centre
        DEFAULTS.put("Gym / Fitness Centre", List.of(
                "Equipment quality", "Equipment availability", "Trainer support", "Cleanliness",
                "Workout environment", "Membership experience", "Facilities", "Locker hygiene"
        ));

        // 14. Healthcare / Clinic
        DEFAULTS.put("Healthcare / Clinic", List.of(
                "Doctor consultation", "Diagnosis accuracy", "Staff compassion", "Clinic hygiene",
                "Waiting time", "Treatment explanation", "Affordable care", "Follow-up support"
        ));

        // 15. Dental Clinic
        DEFAULTS.put("Dental Clinic", List.of(
                "Painless treatment", "Dentist expertise", "Clinic hygiene", "Modern equipment",
                "Friendly staff", "Clear consultation", "Post-treatment care", "Appointment scheduling"
        ));

        // 16. Education / Coaching Centre
        DEFAULTS.put("Education / Coaching Centre", List.of(
                "Teaching quality", "Faculty support", "Concept clarity", "Study materials",
                "Doubt clearing", "Exam guidance", "Learning environment", "Classroom infrastructure"
        ));

        // 17. Automobile / Car Service
        DEFAULTS.put("Automobile / Car Service", List.of(
                "Service quality", "Technical knowledge", "Genuine spare parts", "On-time delivery",
                "Transparent pricing", "Customer communication", "Car wash & cleaning", "Billing clarity"
        ));

        // 18. Travel / Tourism
        DEFAULTS.put("Travel / Tourism", List.of(
                "Itinerary planning", "Tour coordination", "Hotel arrangements", "Guide knowledge",
                "Responsive support", "Smooth travel", "Value for money", "Booking assistance"
        ));

        // 19. Real Estate
        DEFAULTS.put("Real Estate", List.of(
                "Property options", "Location guidance", "Legal transparency", "Agent responsiveness",
                "Honest communication", "Smooth paperwork", "Trustworthy advice", "Fair market valuation"
        ));

        // 20. Home Decor / Furniture
        DEFAULTS.put("Home Decor / Furniture", List.of(
                "Furniture design", "Wood / material quality", "Durability & finish", "Showroom display",
                "Customization options", "Delivery & setup", "Value for money", "Customer guidance"
        ));

        // 21. Photography / Events
        DEFAULTS.put("Photography / Events", List.of(
                "Photo quality & creativity", "Friendly photographer", "Event coordination", "Editing & finishing",
                "Timely delivery of album", "Professional equipment", "Memorable coverage", "Patience with guests"
        ));

        // 22. E-commerce / Online Store
        DEFAULTS.put("E-commerce / Online Store", List.of(
                "Fast shipping", "Accurate product description", "Safe packaging", "Return / exchange ease",
                "Customer support", "Product quality", "Easy checkout", "Order tracking"
        ));

        // 23. Professional Services
        DEFAULTS.put("Professional Services", List.of(
                "Professional expertise", "Prompt communication", "Quality of advice", "Confidentiality",
                "Problem-solving skill", "Clear pricing", "Timely delivery", "Client dedication"
        ));

        // 24. Other / Custom Business
        DEFAULTS.put("Other / Custom Business", List.of(
                "Service quality", "Helpful staff", "Customer satisfaction", "Fair pricing",
                "Quick response", "Reliability", "Overall experience", "Trustworthy business"
        ));
    }

    public static List<String> getDefaultsForCategory(String category) {
        if (category == null || category.isBlank()) {
            return DEFAULTS.get("Other / Custom Business");
        }

        String trimmed = category.trim();
        // Exact match
        if (DEFAULTS.containsKey(trimmed)) {
            return DEFAULTS.get(trimmed);
        }

        // Case-insensitive match
        for (Map.Entry<String, List<String>> entry : DEFAULTS.entrySet()) {
            if (entry.getKey().equalsIgnoreCase(trimmed)) {
                return entry.getValue();
            }
        }

        // Substring match
        String lower = trimmed.toLowerCase();
        for (Map.Entry<String, List<String>> entry : DEFAULTS.entrySet()) {
            String entryLower = entry.getKey().toLowerCase();
            if (entryLower.contains(lower) || lower.contains(entryLower)) {
                return entry.getValue();
            }
        }

        return DEFAULTS.get("Other / Custom Business");
    }

    /**
     * Fallback smart attribute generator based on merchant details.
     */
    public static List<String> generateSmartFallbackAttributes(String category, String storeName,
                                                              String description, String specialties,
                                                              List<String> existingAttributes) {
        Set<String> existing = new HashSet<>();
        if (existingAttributes != null) {
            for (String ea : existingAttributes) {
                if (ea != null) existing.add(ea.trim().toLowerCase());
            }
        }

        List<String> baseDefaults = getDefaultsForCategory(category);
        Set<String> suggestions = new LinkedHashSet<>();

        // If specialties provided, parse and create dedicated specialty attributes
        if (specialties != null && !specialties.isBlank()) {
            String[] tokens = specialties.split("[,;•\n\r/]+");
            for (String tok : tokens) {
                String clean = tok.trim();
                if (clean.length() >= 3 && clean.length() <= 35 && !existing.contains(clean.toLowerCase())) {
                    // Capitalize first letter
                    String cap = clean.substring(0, 1).toUpperCase() + clean.substring(1);
                    suggestions.add(cap);
                    if (suggestions.size() >= 4) break;
                }
            }
        }

        // Add matching category defaults that are not already in existing attributes
        for (String def : baseDefaults) {
            if (!existing.contains(def.toLowerCase())) {
                suggestions.add(def);
            }
            if (suggestions.size() >= 8) break;
        }

        // If still under 6, add general high-value experience attributes
        List<String> highValue = List.of(
                "Staff hospitality", "Fair & honest pricing", "Prompt assistance",
                "Store hygiene", "Customer satisfaction", "Reliable quality"
        );
        for (String hv : highValue) {
            if (!existing.contains(hv.toLowerCase())) {
                suggestions.add(hv);
            }
            if (suggestions.size() >= 8) break;
        }

        return new ArrayList<>(suggestions);
    }
}
