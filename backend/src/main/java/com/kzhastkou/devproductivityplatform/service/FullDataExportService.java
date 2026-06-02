package com.kzhastkou.devproductivityplatform.service;

import com.kzhastkou.devproductivityplatform.config.FullDataExportProperties;
import com.kzhastkou.devproductivityplatform.dto.ExcelImportSheetSchema;
import com.kzhastkou.devproductivityplatform.dto.FullDataExportFile;
import com.kzhastkou.devproductivityplatform.entity.Client;
import com.kzhastkou.devproductivityplatform.entity.Organization;
import com.kzhastkou.devproductivityplatform.entity.Project;
import com.kzhastkou.devproductivityplatform.entity.SoftwareProduct;
import com.kzhastkou.devproductivityplatform.entity.Task;
import com.kzhastkou.devproductivityplatform.entity.TimeEntry;
import com.kzhastkou.devproductivityplatform.repository.ClientRepository;
import com.kzhastkou.devproductivityplatform.repository.DeveloperRepository;
import com.kzhastkou.devproductivityplatform.repository.OrganizationRepository;
import com.kzhastkou.devproductivityplatform.repository.ProjectRepository;
import com.kzhastkou.devproductivityplatform.repository.SoftwareProductRepository;
import com.kzhastkou.devproductivityplatform.repository.TaskRepository;
import com.kzhastkou.devproductivityplatform.repository.TimeEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FullDataExportService {

    private static final DateTimeFormatter FILE_TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm");

    private final DeveloperRepository developerRepository;
    private final OrganizationRepository organizationRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final SoftwareProductRepository softwareProductRepository;
    private final TaskRepository taskRepository;
    private final TimeEntryRepository timeEntryRepository;
    private final FullDataExportProperties properties;

    @Transactional(readOnly = true)
    public FullDataExportFile exportForDownload(Long developerId) {
        return createExportFile(developerId, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public Path exportToConfiguredDirectory(Long developerId) {
        FullDataExportFile file = createExportFile(developerId, LocalDateTime.now());
        return saveToDirectory(file, Path.of(properties.getExportDir()));
    }

    public void cleanupOldExports() {
        if (properties.getRetentionDays() <= 0) {
            return;
        }

        Path exportDir = Path.of(properties.getExportDir());
        if (!Files.isDirectory(exportDir)) {
            return;
        }

        LocalDateTime threshold = LocalDateTime.now().minusDays(properties.getRetentionDays());
        try (var files = Files.list(exportDir)) {
            files
                    .filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().startsWith("dev_platform_full_export_"))
                    .filter(path -> path.getFileName().toString().endsWith(".xlsx"))
                    .filter(path -> isOlderThan(path, threshold))
                    .forEach(this::deleteQuietly);
        } catch (IOException error) {
            log.warn("Scheduled Full Data Export cleanup failed: {}", error.getMessage());
        }
    }

    private FullDataExportFile createExportFile(Long developerId, LocalDateTime createdAt) {
        developerRepository.findById(developerId)
                .orElseThrow(() -> new IllegalArgumentException("Developer not found: " + developerId));

        log.info("Full Data Export started for developerId={}", developerId);

        List<Organization> organizations = organizationRepository.findByDeveloperIdOrderByIdAsc(developerId);
        List<Client> clients = clientRepository.findByDeveloperIdOrderByIdAsc(developerId);
        List<Project> projects = projectRepository.findByDeveloperIdOrderByIdAsc(developerId);
        List<SoftwareProduct> softwareProducts = softwareProductRepository.findByDeveloperIdOrderByIdAsc(developerId);
        List<Task> tasks = taskRepository.findByDeveloperIdOrderByIdAsc(developerId);
        List<TimeEntry> timeEntries = timeEntryRepository.findByDeveloperIdOrderByDateAscIdAsc(developerId);

        Map<Long, String> organizationCodes = codesById(organizations);
        Map<Long, String> clientCodes = codesById(clients);
        Map<Long, String> projectCodes = codesById(projects);
        Map<Long, String> softwareProductCodes = codesById(softwareProducts);
        Map<Long, String> taskCodes = codesById(tasks);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            writeOrganizations(workbook, organizations, organizationCodes);
            writeClients(workbook, clients, organizationCodes, clientCodes);
            writeProjects(workbook, projects, organizationCodes, clientCodes, projectCodes);
            writeSoftwareProducts(workbook, softwareProducts, softwareProductCodes);
            writeTasks(workbook, tasks, organizationCodes, clientCodes, projectCodes, softwareProductCodes, taskCodes);
            writeTimeEntries(workbook, timeEntries, taskCodes);

            workbook.write(output);
            String fileName = "dev_platform_full_export_" + createdAt.format(FILE_TIMESTAMP_FORMAT) + ".xlsx";

            log.info("Organizations exported: {}", organizations.size());
            log.info("Clients exported: {}", clients.size());
            log.info("Projects exported: {}", projects.size());
            log.info("Software Products exported: {}", softwareProducts.size());
            log.info("Tasks exported: {}", tasks.size());
            log.info("Time Entries exported: {}", timeEntries.size());
            log.info("Full Data Export finished: fileName={}", fileName);

            return new FullDataExportFile(fileName, output.toByteArray());
        } catch (IOException error) {
            throw new RuntimeException("Unable to create full data export workbook.", error);
        }
    }

    private Path saveToDirectory(FullDataExportFile file, Path exportDir) {
        try {
            Files.createDirectories(exportDir);
            Path target = exportDir.resolve(file.fileName());
            Files.write(target, file.content());
            return target;
        } catch (IOException error) {
            throw new RuntimeException("Unable to save full data export file.", error);
        }
    }

    private void writeOrganizations(Workbook workbook, List<Organization> organizations, Map<Long, String> organizationCodes) {
        Sheet sheet = createSheet(workbook, "Organizations");
        int rowIndex = 1;
        for (Organization organization : organizations) {
            writeRow(sheet.createRow(rowIndex++),
                    organizationCodes.get(organization.getId()),
                    organization.getShortName(),
                    organization.getFullName());
        }
    }

    private void writeClients(Workbook workbook, List<Client> clients, Map<Long, String> organizationCodes, Map<Long, String> clientCodes) {
        Sheet sheet = createSheet(workbook, "Clients");
        int rowIndex = 1;
        for (Client client : clients) {
            writeRow(sheet.createRow(rowIndex++),
                    clientCodes.get(client.getId()),
                    organizationCodes.get(client.getOrganization().getId()),
                    client.getShortName(),
                    client.getFullName(),
                    Boolean.TRUE.equals(client.getNotDisplayed()));
        }
    }

    private void writeProjects(
            Workbook workbook,
            List<Project> projects,
            Map<Long, String> organizationCodes,
            Map<Long, String> clientCodes,
            Map<Long, String> projectCodes
    ) {
        Sheet sheet = createSheet(workbook, "Projects");
        int rowIndex = 1;
        for (Project project : projects) {
            writeRow(sheet.createRow(rowIndex++),
                    projectCodes.get(project.getId()),
                    organizationCodes.get(project.getOrganization().getId()),
                    clientCodes.get(project.getClient().getId()),
                    project.getShortName(),
                    project.getFullName(),
                    project.getDescription(),
                    Boolean.TRUE.equals(project.getCompleted()));
        }
    }

    private void writeSoftwareProducts(Workbook workbook, List<SoftwareProduct> products, Map<Long, String> productCodes) {
        Sheet sheet = createSheet(workbook, "SoftwareProducts");
        int rowIndex = 1;
        for (SoftwareProduct product : products) {
            writeRow(sheet.createRow(rowIndex++),
                    productCodes.get(product.getId()),
                    product.getShortName(),
                    product.getFullName());
        }
    }

    private void writeTasks(
            Workbook workbook,
            List<Task> tasks,
            Map<Long, String> organizationCodes,
            Map<Long, String> clientCodes,
            Map<Long, String> projectCodes,
            Map<Long, String> productCodes,
            Map<Long, String> taskCodes
    ) {
        Sheet sheet = createSheet(workbook, "Tasks");
        int rowIndex = 1;
        for (Task task : tasks) {
            writeRow(sheet.createRow(rowIndex++),
                    taskCodes.get(task.getId()),
                    organizationCodes.get(task.getOrganization().getId()),
                    clientCodes.get(task.getClient().getId()),
                    projectCodes.get(task.getProject().getId()),
                    task.getSoftwareProduct() == null ? "" : productCodes.get(task.getSoftwareProduct().getId()),
                    task.getTaskNumber(),
                    task.getName(),
                    task.getComment(),
                    task.getDescription(),
                    task.getImplementationDetails(),
                    task.getEstimatedHours(),
                    Boolean.TRUE.equals(task.getCompleted()),
                    task.getTaskLink());
        }
    }

    private void writeTimeEntries(Workbook workbook, List<TimeEntry> timeEntries, Map<Long, String> taskCodes) {
        Sheet sheet = createSheet(workbook, "TimeEntries");
        int rowIndex = 1;
        for (TimeEntry entry : timeEntries) {
            writeRow(sheet.createRow(rowIndex++),
                    taskCodes.get(entry.getTask().getId()),
                    entry.getDate(),
                    entry.getHours(),
                    entry.getComment());
        }
    }

    private Sheet createSheet(Workbook workbook, String sheetName) {
        ExcelImportSheetSchema schema = FullDataExcelSchema.SCHEMA_BY_SHEET.get(sheetName);
        Sheet sheet = workbook.createSheet(sheetName);
        Row header = sheet.createRow(0);
        List<String> columns = new java.util.ArrayList<>();
        columns.addAll(schema.getRequiredColumns());
        columns.addAll(schema.getOptionalColumns());
        for (int index = 0; index < columns.size(); index++) {
            header.createCell(index).setCellValue(columns.get(index));
            sheet.setColumnWidth(index, Math.min(Math.max(columns.get(index).length() + 4, 14), 40) * 256);
        }
        return sheet;
    }

    private void writeRow(Row row, Object... values) {
        for (int index = 0; index < values.length; index++) {
            Object value = values[index];
            if (value == null) {
                row.createCell(index).setCellValue("");
            } else if (value instanceof Number number) {
                row.createCell(index).setCellValue(number.doubleValue());
            } else if (value instanceof Boolean bool) {
                row.createCell(index).setCellValue(bool);
            } else if (value instanceof java.time.LocalDate date) {
                row.createCell(index).setCellValue(date.toString());
            } else {
                row.createCell(index).setCellValue(String.valueOf(value));
            }
        }
    }

    private <T> Map<Long, String> codesById(List<T> entities) {
        Map<Long, String> codes = new HashMap<>();
        for (T entity : entities) {
            Long id = entityId(entity);
            codes.put(id, String.valueOf(id));
        }
        return codes;
    }

    private Long entityId(Object entity) {
        if (entity instanceof Organization organization) {
            return organization.getId();
        }
        if (entity instanceof Client client) {
            return client.getId();
        }
        if (entity instanceof Project project) {
            return project.getId();
        }
        if (entity instanceof SoftwareProduct product) {
            return product.getId();
        }
        if (entity instanceof Task task) {
            return task.getId();
        }
        throw new IllegalArgumentException("Unsupported export entity: " + entity.getClass().getName());
    }

    private boolean isOlderThan(Path path, LocalDateTime threshold) {
        try {
            return Files.getLastModifiedTime(path)
                    .toInstant()
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDateTime()
                    .isBefore(threshold);
        } catch (IOException error) {
            log.warn("Unable to read export file timestamp: fileName={}, error={}", path.getFileName(), error.getMessage());
            return false;
        }
    }

    private void deleteQuietly(Path path) {
        try {
            Files.deleteIfExists(path);
            log.info("Deleted old Full Data Export file: fileName={}", path.getFileName());
        } catch (IOException error) {
            log.warn("Unable to delete old Full Data Export file: fileName={}, error={}", path.getFileName(), error.getMessage());
        }
    }
}
