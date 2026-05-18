package com.kzhastkou.devproductivityplatform.repository;

import com.kzhastkou.devproductivityplatform.entity.SoftwareProduct;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SoftwareProductRepository extends JpaRepository<SoftwareProduct, Long> {
}
