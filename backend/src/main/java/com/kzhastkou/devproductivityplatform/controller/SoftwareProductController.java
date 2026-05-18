package com.kzhastkou.devproductivityplatform.controller;

import com.kzhastkou.devproductivityplatform.dto.SoftwareProductRequest;
import com.kzhastkou.devproductivityplatform.dto.SoftwareProductResponse;
import com.kzhastkou.devproductivityplatform.service.SoftwareProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/software-products")
@RequiredArgsConstructor
public class SoftwareProductController {

    private final SoftwareProductService service;

    @GetMapping
    public List<SoftwareProductResponse> list() {
        return service.findAll();
    }

    @GetMapping("/{id:\\d+}")
    public SoftwareProductResponse getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public SoftwareProductResponse create(@Valid @RequestBody SoftwareProductRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id:\\d+}")
    public SoftwareProductResponse update(@PathVariable Long id, @Valid @RequestBody SoftwareProductRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id:\\d+}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
