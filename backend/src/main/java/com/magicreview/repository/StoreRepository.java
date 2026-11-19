package com.magicreview.repository;

import com.magicreview.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StoreRepository extends JpaRepository<Store, UUID> {
    List<Store> findAllByOwnerIdOrderByCreatedAtDesc(UUID ownerId);
    Optional<Store> findByIdAndOwnerId(UUID id, UUID ownerId);
    Optional<Store> findBySlug(String slug);
    Optional<Store> findBySlugAndActiveTrue(String slug);
    boolean existsBySlug(String slug);
}
