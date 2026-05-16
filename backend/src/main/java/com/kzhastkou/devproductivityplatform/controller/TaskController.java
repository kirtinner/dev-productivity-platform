package com.kzhastkou.devproductivityplatform.controller;

import com.kzhastkou.devproductivityplatform.entity.Task;
import com.kzhastkou.devproductivityplatform.repository.DeveloperRepository;
import com.kzhastkou.devproductivityplatform.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskRepository repository;
    private final DeveloperRepository developerRepository;

    @GetMapping
    public List<Task> getAll() {
        return repository.findAll();
    }

    @GetMapping("/my")
    public List<Task> getMyTasks() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication != null ? authentication.getPrincipal() : null;

        Long userId = principal instanceof Long id
                ? id
                : developerRepository.findFirstByOrderByIdAsc()
                .map(dev -> dev.getId())
                .orElseThrow(() -> new IllegalStateException("No developer available for tasks"));

        return repository.findByDeveloperId(userId);
    }
}
