package com.kzhastkou.devproductivityplatform.service;

import com.kzhastkou.devproductivityplatform.dto.FolderValidationResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
@Slf4j
public class FolderValidationService {

    public FolderValidationResponse validateFolder(String folder) {
        try {
            Path path = validateFolderOrThrow(folder);
            return FolderValidationResponse.builder()
                    .success(true)
                    .message("Folder is valid and writable.")
                    .path(path.toString())
                    .build();
        } catch (Exception error) {
            String message = error.getMessage() == null || error.getMessage().isBlank()
                    ? "Folder validation failed."
                    : error.getMessage();
            return FolderValidationResponse.builder()
                    .success(false)
                    .message(message)
                    .technicalDetails(error.getClass().getSimpleName() + ": " + message)
                    .build();
        }
    }

    public Path validateFolderOrThrow(String folder) {
        if (folder == null || folder.isBlank()) {
            throw new IllegalArgumentException("Path is required.");
        }

        String normalizedFolder = folder.trim();
        Path rawPath = Path.of(normalizedFolder);
        if (!rawPath.isAbsolute()) {
            throw new IllegalArgumentException("Path is not absolute.");
        }

        Path absolutePath = rawPath.toAbsolutePath().normalize();
        try {
            Files.createDirectories(absolutePath);
        } catch (IOException error) {
            throw new IllegalArgumentException("Folder does not exist and cannot be created.", error);
        } catch (SecurityException error) {
            throw new IllegalArgumentException("Access denied.", error);
        }

        if (!Files.exists(absolutePath)) {
            throw new IllegalArgumentException("Folder cannot be created.");
        }

        if (!Files.isDirectory(absolutePath)) {
            throw new IllegalArgumentException("Path is not a folder.");
        }

        if (!Files.isWritable(absolutePath)) {
            throw new IllegalArgumentException("Folder is not writable.");
        }

        Path probeFile = absolutePath.resolve(".dev-productivity-platform-write-test.tmp");
        try {
            Files.writeString(probeFile, "write-test");
            Files.deleteIfExists(probeFile);
        } catch (IOException error) {
            throw new IllegalArgumentException("Folder is not writable.", error);
        } catch (SecurityException error) {
            throw new IllegalArgumentException("Access denied.", error);
        }

        log.info("Folder validation succeeded: path={}", absolutePath);
        return absolutePath;
    }
}
