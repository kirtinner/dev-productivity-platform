package com.kzhastkou.devproductivityplatform.service;

import com.kzhastkou.devproductivityplatform.dto.SoftwareProductRequest;
import com.kzhastkou.devproductivityplatform.dto.SoftwareProductResponse;
import com.kzhastkou.devproductivityplatform.entity.SoftwareProduct;
import com.kzhastkou.devproductivityplatform.exception.NotFoundException;
import com.kzhastkou.devproductivityplatform.repository.SoftwareProductRepository;
import com.kzhastkou.devproductivityplatform.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SoftwareProductService {

    private final SoftwareProductRepository softwareProductRepository;
    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public List<SoftwareProductResponse> findAll() {
        return softwareProductRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SoftwareProductResponse findById(Long id) {
        return toResponse(findEntity(id));
    }

    @Transactional
    public SoftwareProductResponse create(SoftwareProductRequest request) {
        SoftwareProduct product = SoftwareProduct.builder()
                .shortName(request.getShortName().trim())
                .fullName(request.getFullName().trim())
                .build();

        return toResponse(softwareProductRepository.save(product));
    }

    @Transactional
    public SoftwareProductResponse update(Long id, SoftwareProductRequest request) {
        SoftwareProduct product = findEntity(id);
        product.setShortName(request.getShortName().trim());
        product.setFullName(request.getFullName().trim());
        return toResponse(softwareProductRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        if (taskRepository.existsBySoftwareProductId(id)) {
            throw new RuntimeException("Software Product is used in the system and cannot be deleted.");
        }

        softwareProductRepository.deleteById(id);
    }

    private SoftwareProduct findEntity(Long id) {
        return softwareProductRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Software Product not found"));
    }

    private SoftwareProductResponse toResponse(SoftwareProduct product) {
        return SoftwareProductResponse.builder()
                .id(product.getId())
                .shortName(product.getShortName())
                .fullName(product.getFullName())
                .build();
    }
}
