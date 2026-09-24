package com.nutrifybe.api.repository;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.nutrifybe.api.domain.WaterEntry;

public interface WaterEntryRepository extends JpaRepository<WaterEntry, Long> {
    List<WaterEntry> findByPatientIdAndEntryDateOrderByCreatedAtDesc(Long patientId, LocalDate date);
    void deleteByPatientIdAndEntryDate(Long patientId, LocalDate date);
}
