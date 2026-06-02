package com.kzhastkou.devproductivityplatform.service;

import com.kzhastkou.devproductivityplatform.config.FullDataExportProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.nio.file.Path;

@Component
@RequiredArgsConstructor
@Slf4j
public class FullDataExportScheduler {

    private final FullDataExportProperties properties;
    private final FullDataExportService fullDataExportService;

    @Scheduled(cron = "${app.full-data-export.scheduled.cron:0 0 2 * * *}")
    public void runScheduledExport() {
        if (!properties.isEnabled()) {
            log.info("Scheduled Full Data Export skipped because disabled");
            return;
        }

        try {
            Long developerId = properties.getDeveloperId();
            Path file = fullDataExportService.exportToConfiguredDirectory(developerId);
            fullDataExportService.cleanupOldExports();
            log.info("Scheduled Full Data Export finished: developerId={}, fileName={}", developerId, file.getFileName());
        } catch (Exception error) {
            log.error("Scheduled Full Data Export failed: {}", error.getMessage(), error);
        }
    }
}
