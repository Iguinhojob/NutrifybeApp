package com.nutrifybe.api.web;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.nutrifybe.api.service.NutritionistService;

@RestController
@RequestMapping("/api/nutricionistas")
public class NutritionistController {
    private final NutritionistService nutritionists;
    public NutritionistController(NutritionistService nutritionists) { this.nutritionists = nutritionists; }
    @GetMapping public List<ApiDtos.NutritionistResponse> list() { return nutritionists.approved(); }
    @GetMapping("/{id}") public ApiDtos.NutritionistResponse get(@PathVariable long id) { return nutritionists.getApproved(id); }
}
