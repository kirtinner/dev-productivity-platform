package com.kzhastkou.devproductivityplatform.config;

import com.kzhastkou.devproductivityplatform.entity.SoftwareProduct;
import com.kzhastkou.devproductivityplatform.repository.SoftwareProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class SoftwareProductDataInitializer implements ApplicationRunner {

    private final SoftwareProductRepository softwareProductRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (softwareProductRepository.count() > 0) {
            return;
        }

        softwareProductRepository.saveAll(List.of(
                SoftwareProduct.builder()
                        .shortName("ERP")
                        .fullName("Enterprise Resource Planning")
                        .build(),
                SoftwareProduct.builder()
                        .shortName("CRM")
                        .fullName("Customer Relationship Management")
                        .build(),
                SoftwareProduct.builder()
                        .shortName("FIN")
                        .fullName("Financial Operations Suite")
                        .build(),
                SoftwareProduct.builder()
                        .shortName("HR")
                        .fullName("Human Resources Platform")
                        .build()
        ));
    }
}
