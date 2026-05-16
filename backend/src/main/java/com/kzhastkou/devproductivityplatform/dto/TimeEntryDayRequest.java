package com.kzhastkou.devproductivityplatform.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TimeEntryDayRequest {

    private Long id;

    @NotNull
    private Long clientId;

    @NotNull
    private Long taskId;

    @NotNull
    @DecimalMin("0.01")
    @DecimalMax("24.0")
    private Double hours;

    @Size(max = 2000)
    private String comment;
}
