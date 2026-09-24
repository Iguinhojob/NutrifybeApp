package com.nutrifybe.api.domain;

import java.time.Instant;
import jakarta.persistence.*;

@Entity
@Table(name = "app_nutritionist_requests")
public class NutritionistRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private Long patientId;
    @Column(nullable = false) private Long nutritionistId;
    @Column(nullable = false, length = 20) private String status = "pending";
    @Column(nullable = false, updatable = false) private Instant dataCriacao;

    @PrePersist void onCreate() { dataCriacao = Instant.now(); }
    public Long getId() { return id; }
    public Long getPatientId() { return patientId; } public void setPatientId(Long v) { patientId = v; }
    public Long getNutritionistId() { return nutritionistId; } public void setNutritionistId(Long v) { nutritionistId = v; }
    public String getStatus() { return status; } public void setStatus(String v) { status = v; }
    public Instant getDataCriacao() { return dataCriacao; }
}
