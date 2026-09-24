package com.nutrifybe.api.domain;

import java.time.Instant;
import java.time.LocalDate;
import jakarta.persistence.*;

@Entity
@Table(name = "app_water_entries")
public class WaterEntry {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private Long patientId;
    @Column(nullable = false) private Integer amountMl;
    @Column(nullable = false) private LocalDate entryDate;
    @Column(nullable = false, updatable = false) private Instant createdAt;
    @PrePersist void onCreate() { createdAt = Instant.now(); if (entryDate == null) entryDate = LocalDate.now(); }
    public Long getId() { return id; }
    public Long getPatientId() { return patientId; } public void setPatientId(Long v) { patientId = v; }
    public Integer getAmountMl() { return amountMl; } public void setAmountMl(Integer v) { amountMl = v; }
    public LocalDate getEntryDate() { return entryDate; } public void setEntryDate(LocalDate v) { entryDate = v; }
    public Instant getCreatedAt() { return createdAt; }
}
