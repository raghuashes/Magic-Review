package com.magicreview.controller;

import com.magicreview.dto.StoreRequest;
import com.magicreview.dto.StoreResponse;
import com.magicreview.security.UserDetailsImpl;
import com.magicreview.service.QrCodeService;
import com.magicreview.service.StoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/stores")
@Tag(name = "Store Management", description = "Endpoints for managing merchant stores, branding, and QR codes")
public class StoreController {

    private final StoreService storeService;
    private final QrCodeService qrCodeService;

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    public StoreController(StoreService storeService, QrCodeService qrCodeService) {
        this.storeService = storeService;
        this.qrCodeService = qrCodeService;
    }

    @GetMapping
    @Operation(summary = "List all stores belonging to the authenticated user")
    public ResponseEntity<List<StoreResponse>> listStores(@AuthenticationPrincipal UserDetailsImpl userPrincipal) {
        List<StoreResponse> stores = storeService.getStoresForUser(userPrincipal.getId());
        return ResponseEntity.ok(stores);
    }

    @PostMapping
    @Operation(summary = "Create a new store with branding and Google Review link")
    public ResponseEntity<StoreResponse> createStore(@AuthenticationPrincipal UserDetailsImpl userPrincipal,
                                                     @Valid @RequestBody StoreRequest request) {
        StoreResponse response = storeService.createStore(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Fetch store by ID (tenant isolated)")
    public ResponseEntity<StoreResponse> getStore(@AuthenticationPrincipal UserDetailsImpl userPrincipal,
                                                  @PathVariable UUID id) {
        StoreResponse response = storeService.getStoreById(id, userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update store details and branding (tenant isolated)")
    public ResponseEntity<StoreResponse> updateStore(@AuthenticationPrincipal UserDetailsImpl userPrincipal,
                                                     @PathVariable UUID id,
                                                     @Valid @RequestBody StoreRequest request) {
        StoreResponse response = storeService.updateStore(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete store by ID (tenant isolated)")
    public ResponseEntity<Void> deleteStore(@AuthenticationPrincipal UserDetailsImpl userPrincipal,
                                            @PathVariable UUID id) {
        storeService.deleteStore(id, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/qr")
    @Operation(summary = "Generate and return QR code PNG image byte stream or Base64 data URI")
    public ResponseEntity<?> getStoreQrCode(@AuthenticationPrincipal UserDetailsImpl userPrincipal,
                                            @PathVariable UUID id,
                                            @RequestParam(defaultValue = "350") int size,
                                            @RequestParam(defaultValue = "png") String format) {
        StoreResponse store = storeService.getStoreById(id, userPrincipal.getId());
        String targetUrl = frontendBaseUrl + "/s/" + store.getSlug();

        if ("base64".equalsIgnoreCase(format)) {
            String dataUri = qrCodeService.generateQrCodeDataUri(targetUrl, size, size);
            return ResponseEntity.ok(Map.of(
                    "storeId", id,
                    "targetUrl", targetUrl,
                    "qrCodeDataUri", dataUri
            ));
        }

        byte[] pngImage = qrCodeService.generateQrCodeImage(targetUrl, size, size);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentDispositionFormData("attachment", store.getSlug() + "-qr.png");
        return new ResponseEntity<>(pngImage, headers, HttpStatus.OK);
    }
}
