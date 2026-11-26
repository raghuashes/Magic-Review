package com.magicreview.controller;

import com.magicreview.dto.AttributeRequest;
import com.magicreview.dto.AttributeResponse;
import com.magicreview.dto.SuggestAttributesResponse;
import com.magicreview.security.UserDetailsImpl;
import com.magicreview.service.StoreAttributeService;
import com.magicreview.util.CategoryDefaults;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/stores/{storeId}/attributes")
@Tag(name = "Store Attributes", description = "CRUD and smart AI operations for store review attribute tags")
public class StoreAttributeController {

    private final StoreAttributeService attributeService;

    public StoreAttributeController(StoreAttributeService attributeService) {
        this.attributeService = attributeService;
    }

    @GetMapping
    @Operation(summary = "List all review attributes for a specific store")
    public ResponseEntity<List<AttributeResponse>> listAttributes(@AuthenticationPrincipal UserDetailsImpl userPrincipal,
                                                                 @PathVariable UUID storeId) {
        List<AttributeResponse> attributes = attributeService.getAttributesForStore(storeId, userPrincipal.getId());
        return ResponseEntity.ok(attributes);
    }

    @PostMapping
    @Operation(summary = "Create an attribute for a store")
    public ResponseEntity<AttributeResponse> createAttribute(@AuthenticationPrincipal UserDetailsImpl userPrincipal,
                                                             @PathVariable UUID storeId,
                                                             @Valid @RequestBody AttributeRequest request) {
        AttributeResponse response = attributeService.createAttribute(storeId, userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/batch")
    @Operation(summary = "Batch create multiple attributes for a store (e.g. from AI suggestions or templates)")
    public ResponseEntity<List<AttributeResponse>> batchCreateAttributes(@AuthenticationPrincipal UserDetailsImpl userPrincipal,
                                                                         @PathVariable UUID storeId,
                                                                         @RequestBody List<AttributeRequest> requests) {
        List<AttributeResponse> responses = attributeService.batchCreateAttributes(storeId, userPrincipal.getId(), requests);
        return ResponseEntity.status(HttpStatus.CREATED).body(responses);
    }

    @PostMapping("/suggest-ai")
    @Operation(summary = "Generate tailored attribute suggestions using AI based on category and store specialties")
    public ResponseEntity<SuggestAttributesResponse> suggestAttributesWithAi(@AuthenticationPrincipal UserDetailsImpl userPrincipal,
                                                                            @PathVariable UUID storeId) {
        SuggestAttributesResponse response = attributeService.suggestAttributesWithAi(storeId, userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/defaults")
    @Operation(summary = "Get default recommended attributes for a business category")
    public ResponseEntity<List<String>> getCategoryDefaults(@RequestParam(required = false) String category) {
        List<String> defaults = CategoryDefaults.getDefaultsForCategory(category);
        return ResponseEntity.ok(defaults);
    }

    @PostMapping("/apply-defaults")
    @Operation(summary = "Apply default attributes for the store's business category (preserves existing custom attributes)")
    public ResponseEntity<List<AttributeResponse>> applyCategoryDefaults(@AuthenticationPrincipal UserDetailsImpl userPrincipal,
                                                                         @PathVariable UUID storeId,
                                                                         @RequestParam(required = false) String category) {
        List<AttributeResponse> attributes = attributeService.applyCategoryDefaults(storeId, userPrincipal.getId(), category);
        return ResponseEntity.ok(attributes);
    }

    @PutMapping("/reorder")
    @Operation(summary = "Reorder attributes sequence")
    public ResponseEntity<List<AttributeResponse>> reorderAttributes(@AuthenticationPrincipal UserDetailsImpl userPrincipal,
                                                                     @PathVariable UUID storeId,
                                                                     @RequestBody List<UUID> attributeIdsInOrder) {
        List<AttributeResponse> reordered = attributeService.reorderAttributes(storeId, userPrincipal.getId(), attributeIdsInOrder);
        return ResponseEntity.ok(reordered);
    }

    @PutMapping("/{attributeId}")
    @Operation(summary = "Update an existing attribute")
    public ResponseEntity<AttributeResponse> updateAttribute(@AuthenticationPrincipal UserDetailsImpl userPrincipal,
                                                             @PathVariable UUID storeId,
                                                             @PathVariable UUID attributeId,
                                                             @Valid @RequestBody AttributeRequest request) {
        AttributeResponse response = attributeService.updateAttribute(storeId, attributeId, userPrincipal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{attributeId}")
    @Operation(summary = "Delete an attribute")
    public ResponseEntity<Void> deleteAttribute(@AuthenticationPrincipal UserDetailsImpl userPrincipal,
                                                @PathVariable UUID storeId,
                                                @PathVariable UUID attributeId) {
        attributeService.deleteAttribute(storeId, attributeId, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }
}
