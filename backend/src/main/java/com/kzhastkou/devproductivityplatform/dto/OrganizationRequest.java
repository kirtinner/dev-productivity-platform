package com.kzhastkou.devproductivityplatform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrganizationRequest {

    @NotBlank
    private String shortName;

    @NotBlank
    private String fullName;
}
