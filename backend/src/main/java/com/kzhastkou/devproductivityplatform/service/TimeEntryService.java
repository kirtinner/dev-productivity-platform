package com.kzhastkou.devproductivityplatform.service;

import com.kzhastkou.devproductivityplatform.dto.TimeEntryDayRequest;
import com.kzhastkou.devproductivityplatform.dto.TimeEntryRequest;
import com.kzhastkou.devproductivityplatform.dto.TimeEntryResponse;
import com.kzhastkou.devproductivityplatform.entity.Developer;
import com.kzhastkou.devproductivityplatform.entity.Task;
import com.kzhastkou.devproductivityplatform.entity.TimeEntry;
import com.kzhastkou.devproductivityplatform.exception.NotFoundException;
import com.kzhastkou.devproductivityplatform.repository.DeveloperRepository;
import com.kzhastkou.devproductivityplatform.repository.TaskRepository;
import com.kzhastkou.devproductivityplatform.repository.TimeEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TimeEntryService {

    private final TimeEntryRepository repository;
    private final TaskRepository taskRepository;
    private final DeveloperRepository developerRepository;

    @Transactional
    public TimeEntryResponse create(TimeEntryRequest request, Long userId) {
        Developer dev = getDeveloper(userId);
        Task task = resolveTask(request.getTaskId(), dev);

        if (request.getHours() <= 0 || request.getHours() > 24) {
            throw new RuntimeException("Hours must be between 0 and 24");
        }

        TimeEntry entry = TimeEntry.builder()
                .date(request.getDate())
                .hours(request.getHours())
                .comment(request.getComment())
                .developer(dev)
                .task(task)
                .organization(dev.getOrganization())
                .build();

        TimeEntry saved = repository.save(entry);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TimeEntryResponse> getByDeveloper(Long developerId) {
        return repository.findByDeveloperId(developerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TimeEntryResponse> getByDate(LocalDate date, Long developerId) {
        return repository.findByDeveloperIdAndDate(developerId, date)
                .stream()
                .sorted(Comparator.comparing(TimeEntry::getId))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TimeEntryResponse> getByMonth(int year, int month, Long developerId) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate from = yearMonth.atDay(1);
        LocalDate to = yearMonth.atEndOfMonth();

        return repository.findByDeveloperIdAndDateBetweenOrderByDateAscIdAsc(developerId, from, to)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<TimeEntryResponse> saveDay(LocalDate date, List<TimeEntryDayRequest> requests, Long userId) {
        Developer dev = getDeveloper(userId);
        List<TimeEntryDayRequest> safeRequests = requests == null ? List.of() : requests;

        List<TimeEntry> nextEntries = safeRequests.stream()
                .map(request -> {
                    Task task = resolveTask(request.getTaskId(), dev);
                    validateClient(request.getClientId(), task);

                    return TimeEntry.builder()
                            .date(date)
                            .hours(request.getHours())
                            .comment(request.getComment())
                            .developer(dev)
                            .task(task)
                            .organization(dev.getOrganization())
                            .build();
                })
                .toList();

        repository.deleteByDeveloperIdAndDate(dev.getId(), date);
        List<TimeEntry> savedEntries = repository.saveAll(nextEntries);

        return savedEntries.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TimeEntryResponse update(Long id, TimeEntryRequest request, Long userId) {
        TimeEntry entry = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Time entry not found"));

        if (!entry.getDeveloper().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        Task task = resolveTask(request.getTaskId(), entry.getDeveloper());

        entry.setDate(request.getDate());
        entry.setHours(request.getHours());
        entry.setComment(request.getComment());
        entry.setTask(task);

        TimeEntry saved = repository.save(entry);
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private Developer getDeveloper(Long userId) {
        return developerRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Developer not found"));
    }

    private Task resolveTask(Long taskId, Developer developer) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Task not found"));

        if (!task.getOrganization().getId().equals(developer.getOrganization().getId())) {
            throw new NotFoundException("Cross-organization access is forbidden");
        }

        return task;
    }

    private void validateClient(Long clientId, Task task) {
        if (clientId == null) {
            throw new RuntimeException("Client is required");
        }

        if (!task.getClient().getId().equals(clientId)) {
            throw new RuntimeException("Task does not belong to the selected client");
        }
    }

    private TimeEntryResponse toResponse(TimeEntry entry) {
        Double totalTaskHours = repository.findByDeveloperIdAndTaskId(entry.getDeveloper().getId(), entry.getTask().getId())
                .stream()
                .mapToDouble(TimeEntry::getHours)
                .sum();

        return TimeEntryResponse.builder()
                .id(entry.getId())
                .date(entry.getDate())
                .clientId(entry.getTask().getClient().getId())
                .clientName(entry.getTask().getClient().getShortName())
                .hours(entry.getHours())
                .totalTaskHours(totalTaskHours)
                .comment(entry.getComment())
                .developerId(entry.getDeveloper().getId())
                .taskId(entry.getTask().getId())
                .taskName(entry.getTask().getName())
                .build();
    }
}
