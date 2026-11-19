package com.magicreview.repository;

import com.magicreview.entity.StoreAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StoreAttributeRepository extends JpaRepository<StoreAttribute, UUID> {
    List<StoreAttribute> findAllByStoreIdOrderByDisplayOrderAscCreatedAtAsc(UUID storeId);
    List<StoreAttribute> findAllByStoreIdAndActiveTrueOrderByDisplayOrderAscCreatedAtAsc(UUID storeId);
    Optional<StoreAttribute> findByIdAndStoreId(UUID id, UUID storeId);
}
