package com.nutrifybe.api.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.nutrifybe.api.domain.NutritionistRequest;

public interface NutritionistRequestRepository extends JpaRepository<NutritionistRequest, Long> {
    List<NutritionistRequest> findByPatientIdOrderByDataCriacaoDesc(Long patientId);
    List<NutritionistRequest> findByStatusOrderByDataCriacaoAsc(String status);
    boolean existsByPatientIdAndStatus(Long patientId, String status);
}
