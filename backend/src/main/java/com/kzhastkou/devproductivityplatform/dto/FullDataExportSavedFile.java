package com.kzhastkou.devproductivityplatform.dto;

import java.nio.file.Path;

public record FullDataExportSavedFile(Path path, long sizeBytes) {
}
