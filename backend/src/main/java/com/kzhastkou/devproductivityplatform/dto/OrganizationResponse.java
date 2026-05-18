package com.kzhastkou.devproductivityplatform.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrganizationResponse {

    private Long id;
    private String shortName;
    private String fullName;
}
