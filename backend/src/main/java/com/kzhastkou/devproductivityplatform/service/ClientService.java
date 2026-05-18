package com.kzhastkou.devproductivityplatform.service;

import com.kzhastkou.devproductivityplatform.dto.ClientRequest;
import com.kzhastkou.devproductivityplatform.dto.ClientResponse;
import com.kzhastkou.devproductivityplatform.entity.Client;
import com.kzhastkou.devproductivityplatform.entity.Organization;
import com.kzhastkou.devproductivityplatform.exception.NotFoundException;
import com.kzhastkou.devproductivityplatform.repository.ClientRepository;
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
public class ClientService {

    private final ClientRepository clientRepository;
    private final OrganizationRepository organizationRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final TimeEntryRepository timeEntryRepository;

    @Transactional(readOnly = true)
    public List<ClientResponse> findAll() {
        return clientRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClientResponse findById(Long id) {
        return toResponse(findEntity(id));
    }

    @Transactional
    public ClientResponse create(ClientRequest request) {
        Organization organization = resolveOrganization(request.getOrganizationId());

        Client client = Client.builder()
                .organization(organization)
                .shortName(request.getShortName().trim())
                .fullName(request.getFullName().trim())
                .build();

        return toResponse(clientRepository.save(client));
    }

    @Transactional
    public ClientResponse update(Long id, ClientRequest request) {
        Client client = findEntity(id);
        Organization organization = resolveOrganization(request.getOrganizationId());

        client.setOrganization(organization);
        client.setShortName(request.getShortName().trim());
        client.setFullName(request.getFullName().trim());
        return toResponse(clientRepository.save(client));
    }

    @Transactional
    public void delete(Long id) {
        if (projectRepository.existsByClientId(id)
                || taskRepository.existsByClientId(id)
                || timeEntryRepository.existsByTaskClientId(id)) {
            throw new RuntimeException("Client is used in the system and cannot be deleted.");
        }

        clientRepository.deleteById(id);
    }

    private Client findEntity(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Client not found"));
    }

    private Organization resolveOrganization(Long organizationId) {
        return organizationRepository.findById(organizationId)
                .orElseThrow(() -> new NotFoundException("Organization not found"));
    }

    private ClientResponse toResponse(Client client) {
        return ClientResponse.builder()
                .id(client.getId())
                .organizationId(client.getOrganization().getId())
                .organizationName(client.getOrganization().getShortName())
                .shortName(client.getShortName())
                .fullName(client.getFullName())
                .build();
    }
}
