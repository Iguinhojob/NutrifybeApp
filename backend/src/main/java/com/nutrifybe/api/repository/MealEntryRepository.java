package com.nutrifybe.api.repository;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.nutrifybe.api.domain.MealEntry;

public interface MealEntryRepository extends JpaRepository<MealEntry, Long> {
    List<MealEntry> findByPatientIdAndEntryDateOrderByCreatedAtDesc(Long patientId, LocalDate date);
    void deleteByIdAndPatientId(Long id, Long patientId);
}
