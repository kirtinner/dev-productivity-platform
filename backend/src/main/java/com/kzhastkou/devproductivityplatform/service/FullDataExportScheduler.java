package com.kzhastkou.devproductivityplatform.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class FullDataExportScheduler {

    private final UserSettingsService userSettingsService;

    @Scheduled(cron = "0 * * * * *")
    public void runScheduledExport() {
        userSettingsService.runDueScheduledExports(LocalDateTime.now());
    }
}
