package com.kzhastkou.devproductivityplatform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SoftwareProductRequest {

    @NotBlank
    private String shortName;

    @NotBlank
    private String fullName;
}
