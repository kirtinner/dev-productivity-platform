package com.kzhastkou.devproductivityplatform.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ScheduledExportRunResponse {

    private boolean success;
    private String message;
    private String technicalDetails;
    private String fileName;
    private String filePath;
    private Long fileSizeBytes;
    private UserSettingsResponse settings;
}
