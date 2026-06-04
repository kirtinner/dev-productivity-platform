package com.kzhastkou.devproductivityplatform.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserSettingsResponse {

    private Long id;
    private Long developerId;
    private Long currentOrganizationId;
    private String currentOrganizationName;
    private Double dailyHoursLimit;
    private String reportsSaveDirectory;
    private Boolean scheduledExportEnabled;
    private String scheduledExportFolder;
    private String scheduledExportTime;
    private Integer scheduledExportRetentionDays;
    private LocalDateTime scheduledExportLastRunAt;
    private LocalDateTime scheduledExportLastSuccessAt;
    private String scheduledExportLastErrorMessage;
}
