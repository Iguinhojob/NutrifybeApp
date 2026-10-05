package com.nutrifybe.api.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import jakarta.persistence.*;

@Entity
@Table(name = "app_meal_entries")
public class MealEntry {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private Long patientId;
    @Column(nullable = false, length = 40) private String mealType;
    @Column(nullable = false, length = 500) private String description;
    @Column(nullable = false, precision = 7, scale = 2) private BigDecimal calories;
    @Column(precision = 7, scale = 2) private BigDecimal carbs;
    @Column(precision = 7, scale = 2) private BigDecimal protein;
    @Column(precision = 7, scale = 2) private BigDecimal fat;
    @Lob private String items;
    @Column(nullable = false) private LocalDate entryDate;
    @Column(nullable = false, updatable = false) private Instant createdAt;
    @PrePersist void onCreate() { createdAt = Instant.now(); if (entryDate == null) entryDate = LocalDate.now(); }
    public Long getId() { return id; }
    public Long getPatientId() { return patientId; } public void setPatientId(Long v) { patientId = v; }
    public String getMealType() { return mealType; } public void setMealType(String v) { mealType = v; }
    public String getDescription() { return description; } public void setDescription(String v) { description = v; }
    public BigDecimal getCalories() { return calories; } public void setCalories(BigDecimal v) { calories = v; }
    public BigDecimal getCarbs() { return carbs; } public void setCarbs(BigDecimal v) { carbs = v; }
    public BigDecimal getProtein() { return protein; } public void setProtein(BigDecimal v) { protein = v; }
    public BigDecimal getFat() { return fat; } public void setFat(BigDecimal v) { fat = v; }
    public String getItems() { return items; } public void setItems(String v) { items = v; }
    public LocalDate getEntryDate() { return entryDate; } public void setEntryDate(LocalDate v) { entryDate = v; }
    public Instant getCreatedAt() { return createdAt; }
}
