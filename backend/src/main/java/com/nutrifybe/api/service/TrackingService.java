package com.nutrifybe.api.service;

import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.nutrifybe.api.domain.MealEntry;
import com.nutrifybe.api.domain.WaterEntry;
import com.nutrifybe.api.repository.MealEntryRepository;
import com.nutrifybe.api.repository.WaterEntryRepository;
import com.nutrifybe.api.web.ApiDtos;

@Service
public class TrackingService {
    private final MealEntryRepository meals;
    private final WaterEntryRepository water;
    public TrackingService(MealEntryRepository meals, WaterEntryRepository water) { this.meals = meals; this.water = water; }

    @Transactional(readOnly = true)
    public List<ApiDtos.MealResponse> meals(long patientId, LocalDate date) {
        return meals.findByPatientIdAndEntryDateOrderByCreatedAtDesc(patientId, date).stream().map(ApiDtos.MealResponse::from).toList();
    }

    @Transactional
    public ApiDtos.MealResponse addMeal(long patientId, ApiDtos.MealInput input) {
        MealEntry meal = new MealEntry();
        meal.setPatientId(patientId); meal.setMealType(input.mealType().trim());
        meal.setDescription(input.description().trim()); meal.setCalories(input.calories());
        meal.setEntryDate(input.entryDate() == null ? LocalDate.now() : input.entryDate());
        return ApiDtos.MealResponse.from(meals.save(meal));
    }

    @Transactional
    public void removeMeal(long patientId, long mealId) { meals.deleteByIdAndPatientId(mealId, patientId); }

    @Transactional(readOnly = true)
    public List<ApiDtos.WaterResponse> water(long patientId, LocalDate date) {
        return water.findByPatientIdAndEntryDateOrderByCreatedAtDesc(patientId, date).stream().map(ApiDtos.WaterResponse::from).toList();
    }

    @Transactional
    public ApiDtos.WaterResponse addWater(long patientId, ApiDtos.WaterInput input) {
        WaterEntry entry = new WaterEntry(); entry.setPatientId(patientId); entry.setAmountMl(input.amountMl());
        entry.setEntryDate(input.entryDate() == null ? LocalDate.now() : input.entryDate());
        return ApiDtos.WaterResponse.from(water.save(entry));
    }

    @Transactional
    public void resetWater(long patientId, LocalDate date) { water.deleteByPatientIdAndEntryDate(patientId, date); }
}
