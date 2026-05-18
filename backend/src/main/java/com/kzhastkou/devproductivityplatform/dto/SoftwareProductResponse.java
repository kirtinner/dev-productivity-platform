package com.kzhastkou.devproductivityplatform.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SoftwareProductResponse {

    private Long id;
    private String shortName;
    private String fullName;
}
