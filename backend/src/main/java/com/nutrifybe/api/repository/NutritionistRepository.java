package com.nutrifybe.api.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.nutrifybe.api.domain.Nutritionist;

public interface NutritionistRepository extends JpaRepository<Nutritionist, Long> {
    List<Nutritionist> findByStatusAndAtivoOrderByNomeAsc(String status, Integer ativo);
    Optional<Nutritionist> findByCrnIgnoreCaseAndStatusAndAtivo(String crn, String status, Integer ativo);
}
