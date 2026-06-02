package com.kzhastkou.devproductivityplatform.service;

import com.kzhastkou.devproductivityplatform.dto.ExcelImportSheetSchema;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class FullDataExcelSchema {

    public static final List<String> REPLACED_DATA = List.of(
            "Organizations",
            "Clients",
            "Projects",
            "Software Products",
            "Tasks",
            "Time Entries"
    );

    public static final List<ExcelImportSheetSchema> SHEET_SCHEMAS = List.of(
            sheet("Organizations",
                    List.of("code", "short_name"),
                    List.of("full_name")),
            sheet("Clients",
                    List.of("code", "organization_code", "short_name"),
                    List.of("full_name", "not_displayed")),
            sheet("Projects",
                    List.of("code", "organization_code", "client_code", "short_name", "full_name"),
                    List.of("description", "completed")),
            sheet("SoftwareProducts",
                    List.of("code", "short_name"),
                    List.of("full_name")),
            sheet("Tasks",
                    List.of("code", "organization_code", "client_code", "project_code", "software_product_code", "task_number", "name", "created_at"),
                    List.of("comment", "description", "implementation_details", "estimated_hours", "completed", "task_link")),
            sheet("TimeEntries",
                    List.of("task_code", "entry_date", "hours"),
                    List.of("comment"))
    );

    public static final Map<String, ExcelImportSheetSchema> SCHEMA_BY_SHEET = SHEET_SCHEMAS.stream()
            .collect(LinkedHashMap::new, (map, schema) -> map.put(schema.getSheetName(), schema), LinkedHashMap::putAll);

    private FullDataExcelSchema() {
    }

    private static ExcelImportSheetSchema sheet(String sheetName, List<String> requiredColumns, List<String> optionalColumns) {
        return ExcelImportSheetSchema.builder()
                .sheetName(sheetName)
                .requiredColumns(requiredColumns)
                .optionalColumns(optionalColumns)
                .build();
    }
}
