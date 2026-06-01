package com.kzhastkou.devproductivityplatform.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClientResponse {

    private Long id;
    private Long organizationId;
    private String organizationName;
    private String shortName;
    private String fullName;
    private Boolean notDisplayed;
}
