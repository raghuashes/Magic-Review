package com.magicreview.controller;

import com.magicreview.dto.AdminStatsResponse;
import com.magicreview.dto.AdminStoreResponse;
import com.magicreview.dto.AdminUserResponse;
import com.magicreview.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Platform Administration", description = "Privileged endpoints for platform administrators to monitor and manage all tenants")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get platform-wide aggregate metrics (merchants, stores, scans, clicks)")
    public ResponseEntity<AdminStatsResponse> getPlatformStats() {
        AdminStatsResponse response = adminService.getPlatformStats();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    @Operation(summary = "List all registered merchants and administrators")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        List<AdminUserResponse> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/stores")
    @Operation(summary = "List all stores across all merchants with individual metrics")
    public ResponseEntity<List<AdminStoreResponse>> getAllStores() {
        List<AdminStoreResponse> stores = adminService.getAllStores();
        return ResponseEntity.ok(stores);
    }

    @PutMapping("/stores/{id}/toggle-status")
    @Operation(summary = "Enable or disable any merchant store")
    public ResponseEntity<AdminStoreResponse> toggleStoreStatus(@PathVariable UUID id) {
        AdminStoreResponse response = adminService.toggleStoreStatus(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/stores/{id}")
    @Operation(summary = "Delete any store across the platform")
    public ResponseEntity<Map<String, String>> deleteStore(@PathVariable UUID id) {
        adminService.deleteStore(id);
        return ResponseEntity.ok(Map.of("message", "Store deleted successfully", "id", id.toString()));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete any merchant account")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable UUID id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully", "id", id.toString()));
    }
}
