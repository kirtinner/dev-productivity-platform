package com.kzhastkou.devproductivityplatform.service;

import com.kzhastkou.devproductivityplatform.dto.ProjectRequest;
import com.kzhastkou.devproductivityplatform.dto.ProjectResponse;
import com.kzhastkou.devproductivityplatform.entity.Client;
import com.kzhastkou.devproductivityplatform.entity.Organization;
import com.kzhastkou.devproductivityplatform.entity.Project;
import com.kzhastkou.devproductivityplatform.exception.NotFoundException;
import com.kzhastkou.devproductivityplatform.repository.ClientRepository;
import com.kzhastkou.devproductivityplatform.repository.OrganizationRepository;
import com.kzhastkou.devproductivityplatform.repository.ProjectRepository;
import com.kzhastkou.devproductivityplatform.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final OrganizationRepository organizationRepository;
    private final ClientRepository clientRepository;
    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public List<ProjectResponse> findAll() {
        return projectRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse findById(Long id) {
        return toResponse(findEntity(id));
    }

    @Transactional
    public ProjectResponse create(ProjectRequest request) {
        Organization organization = resolveOrganization(request.getOrganizationId());
        Client client = resolveClient(request.getClientId());
        validateClientBelongsToOrganization(client, organization);

        Project project = Project.builder()
                .organization(organization)
                .client(client)
                .shortName(request.getShortName().trim())
                .fullName(request.getFullName().trim())
                .description(request.getDescription())
                .build();

        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse update(Long id, ProjectRequest request) {
        Project project = findEntity(id);
        Organization organization = resolveOrganization(request.getOrganizationId());
        Client client = resolveClient(request.getClientId());
        validateClientBelongsToOrganization(client, organization);

        project.setOrganization(organization);
        project.setClient(client);
        project.setShortName(request.getShortName().trim());
        project.setFullName(request.getFullName().trim());
        project.setDescription(request.getDescription());
        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public void delete(Long id) {
        if (taskRepository.existsByProjectId(id)) {
            throw new RuntimeException("Project is used in the system and cannot be deleted.");
        }

        projectRepository.deleteById(id);
    }

    private Project findEntity(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Project not found"));
    }

    private Organization resolveOrganization(Long organizationId) {
        return organizationRepository.findById(organizationId)
                .orElseThrow(() -> new NotFoundException("Organization not found"));
    }

    private Client resolveClient(Long clientId) {
        return clientRepository.findById(clientId)
                .orElseThrow(() -> new NotFoundException("Client not found"));
    }

    private void validateClientBelongsToOrganization(Client client, Organization organization) {
        if (!client.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Client does not belong to the selected organization");
        }
    }

    private ProjectResponse toResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .organizationId(project.getOrganization().getId())
                .organizationName(project.getOrganization().getShortName())
                .clientId(project.getClient().getId())
                .clientName(project.getClient().getShortName())
                .shortName(project.getShortName())
                .fullName(project.getFullName())
                .description(project.getDescription())
                .build();
    }
}
