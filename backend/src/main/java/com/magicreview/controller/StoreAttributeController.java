package com.magicreview.controller;

import com.magicreview.dto.AttributeRequest;
import com.magicreview.dto.AttributeResponse;
import com.magicreview.security.UserDetailsImpl;
import com.magicreview.service.StoreAttributeService;
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
@Tag(name = "Store Attributes", description = "CRUD operations for store review attribute tags")
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
