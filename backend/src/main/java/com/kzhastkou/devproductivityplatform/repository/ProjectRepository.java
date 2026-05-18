package com.kzhastkou.devproductivityplatform.repository;

import com.kzhastkou.devproductivityplatform.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByOrganizationId(Long organizationId);

    List<Project> findByOrganizationIdAndClientId(Long organizationId, Long clientId);

    boolean existsByOrganizationId(Long organizationId);

    boolean existsByClientId(Long clientId);
}
