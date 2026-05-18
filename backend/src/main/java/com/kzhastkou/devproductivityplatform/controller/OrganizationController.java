package com.kzhastkou.devproductivityplatform.controller;

import com.kzhastkou.devproductivityplatform.dto.OrganizationRequest;
import com.kzhastkou.devproductivityplatform.dto.OrganizationResponse;
import com.kzhastkou.devproductivityplatform.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService service;

    @GetMapping
    public List<OrganizationResponse> list() {
        return service.findAll();
    }

    @GetMapping("/{id:\\d+}")
    public OrganizationResponse getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public OrganizationResponse create(@Valid @RequestBody OrganizationRequest request) {
        System.out.println("request = " + request.toString());
        return service.create(request);
    }

    @PutMapping("/{id:\\d+}")
    public OrganizationResponse update(@PathVariable Long id, @Valid @RequestBody OrganizationRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id:\\d+}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
