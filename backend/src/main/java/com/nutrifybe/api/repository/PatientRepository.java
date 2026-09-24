package com.nutrifybe.api.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.nutrifybe.api.domain.Patient;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}
