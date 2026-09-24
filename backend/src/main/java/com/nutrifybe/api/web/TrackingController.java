package com.nutrifybe.api.web;

import java.time.LocalDate;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.nutrifybe.api.service.TrackingService;

@RestController
@RequestMapping("/api/diario")
public class TrackingController {
    private final TrackingService tracking;
    public TrackingController(TrackingService tracking) { this.tracking = tracking; }

    @GetMapping("/refeicoes")
    public List<ApiDtos.MealResponse> meals(@RequestParam LocalDate date, @AuthenticationPrincipal Jwt jwt) {
        return tracking.meals(patientId(jwt), date);
    }
    @PostMapping("/refeicoes")
    public ApiDtos.MealResponse addMeal(@Valid @RequestBody ApiDtos.MealInput input, @AuthenticationPrincipal Jwt jwt) {
        return tracking.addMeal(patientId(jwt), input);
    }
    @DeleteMapping("/refeicoes/{id}")
    public void removeMeal(@PathVariable long id, @AuthenticationPrincipal Jwt jwt) { tracking.removeMeal(patientId(jwt), id); }

    @GetMapping("/agua")
    public List<ApiDtos.WaterResponse> water(@RequestParam LocalDate date, @AuthenticationPrincipal Jwt jwt) {
        return tracking.water(patientId(jwt), date);
    }
    @PostMapping("/agua")
    public ApiDtos.WaterResponse addWater(@Valid @RequestBody ApiDtos.WaterInput input, @AuthenticationPrincipal Jwt jwt) {
        return tracking.addWater(patientId(jwt), input);
    }
    @DeleteMapping("/agua")
    public void resetWater(@RequestParam LocalDate date, @AuthenticationPrincipal Jwt jwt) { tracking.resetWater(patientId(jwt), date); }

    private long patientId(Jwt jwt) { return Long.parseLong(jwt.getSubject()); }
}
