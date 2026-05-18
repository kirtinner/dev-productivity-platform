package com.kzhastkou.devproductivityplatform.service;

import com.kzhastkou.devproductivityplatform.dto.OrganizationRequest;
import com.kzhastkou.devproductivityplatform.dto.OrganizationResponse;
import com.kzhastkou.devproductivityplatform.entity.Organization;
import com.kzhastkou.devproductivityplatform.exception.NotFoundException;
import com.kzhastkou.devproductivityplatform.repository.ClientRepository;
import com.kzhastkou.devproductivityplatform.repository.DeveloperRepository;
import com.kzhastkou.devproductivityplatform.repository.OrganizationRepository;
import com.kzhastkou.devproductivityplatform.repository.ProjectRepository;
import com.kzhastkou.devproductivityplatform.repository.TaskRepository;
import com.kzhastkou.devproductivityplatform.repository.TimeEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final DeveloperRepository developerRepository;
    private final TimeEntryRepository timeEntryRepository;

    @Transactional(readOnly = true)
    public List<OrganizationResponse> findAll() {
        return organizationRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrganizationResponse findById(Long id) {
        return toResponse(findEntity(id));
    }

    @Transactional
    public OrganizationResponse create(OrganizationRequest request) {
        Organization organization = Organization.builder()
                .shortName(request.getShortName().trim())
                .fullName(request.getFullName().trim())
                .build();

        return toResponse(organizationRepository.save(organization));
    }

    @Transactional
    public OrganizationResponse update(Long id, OrganizationRequest request) {
        Organization organization = findEntity(id);
        organization.setShortName(request.getShortName().trim());
        organization.setFullName(request.getFullName().trim());
        return toResponse(organizationRepository.save(organization));
    }

    @Transactional
    public void delete(Long id) {
        if (clientRepository.existsByOrganizationId(id)
                || projectRepository.existsByOrganizationId(id)
                || taskRepository.existsByOrganizationId(id)
                || developerRepository.existsByOrganizationId(id)
                || timeEntryRepository.existsByOrganizationId(id)) {
            throw new RuntimeException("Organization is used in the system and cannot be deleted.");
        }

        organizationRepository.deleteById(id);
    }

    private Organization findEntity(Long id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Organization not found"));
    }

    private OrganizationResponse toResponse(Organization organization) {
        return OrganizationResponse.builder()
                .id(organization.getId())
                .shortName(organization.getShortName())
                .fullName(organization.getFullName())
                .build();
    }
}
