package com.magicreview.dto;

import com.magicreview.enums.Role;
import java.time.OffsetDateTime;
import java.util.UUID;

public class AdminUserResponse {
    private UUID id;
    private String email;
    private Role role;
    private int storeCount;
    private OffsetDateTime createdAt;

    public AdminUserResponse() {
    }

    public AdminUserResponse(UUID id, String email, Role role, int storeCount, OffsetDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.storeCount = storeCount;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public int getStoreCount() {
        return storeCount;
    }

    public void setStoreCount(int storeCount) {
        this.storeCount = storeCount;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
