package com.kzhastkou.devproductivityplatform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ClientRequest {

    @NotNull
    private Long organizationId;

    @NotBlank
    private String shortName;

    @NotBlank
    private String fullName;

    private Boolean notDisplayed = Boolean.FALSE;
}
