package com.kzhastkou.devproductivityplatform.repository;

import com.kzhastkou.devproductivityplatform.entity.TimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long> {

    List<TimeEntry> findByDeveloperId(Long developerId);

    List<TimeEntry> findByDeveloperIdAndDate(Long developerId, LocalDate date);

    List<TimeEntry> findByDeveloperIdAndDateBetweenOrderByDateAscIdAsc(Long developerId, LocalDate from, LocalDate to);

    List<TimeEntry> findByDeveloperIdAndTaskId(Long developerId, Long taskId);

    void deleteByDeveloperIdAndDate(Long developerId, LocalDate date);
}
