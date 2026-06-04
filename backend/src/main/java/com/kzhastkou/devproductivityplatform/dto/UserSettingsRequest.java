package com.kzhastkou.devproductivityplatform.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UserSettingsRequest {

    private Long currentOrganizationId;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private Double dailyHoursLimit;

    private String reportsSaveDirectory;

    private Boolean scheduledExportEnabled;

    private String scheduledExportFolder;

    @Pattern(regexp = "^$|^([01]\\d|2[0-3]):[0-5]\\d$", message = "must use HH:mm format")
    private String scheduledExportTime;

    @Min(0)
    private Integer scheduledExportRetentionDays;
}
