package com.kzhastkou.devproductivityplatform.repository;

import com.kzhastkou.devproductivityplatform.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findAllByOrderByIdAsc();

    List<Task> findByOrganizationId(Long organizationId);

    List<Task> findByClientId(Long clientId);

    List<Task> findByProjectId(Long projectId);

    List<Task> findByDeveloperId(Long developerId);

    boolean existsByOrganizationId(Long organizationId);

    boolean existsByClientId(Long clientId);

    boolean existsByProjectId(Long projectId);

    boolean existsBySoftwareProductId(Long softwareProductId);
}
