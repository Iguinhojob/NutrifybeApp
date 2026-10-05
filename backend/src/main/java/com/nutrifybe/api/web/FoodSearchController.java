package com.nutrifybe.api.web;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.nutrifybe.api.service.FoodSearchService;

@RestController
@RequestMapping("/api/alimentos")
public class FoodSearchController {
    private final FoodSearchService foods;
    public FoodSearchController(FoodSearchService foods) { this.foods = foods; }

    @GetMapping("/busca")
    public List<ApiDtos.FoodSearchResult> search(@RequestParam String query) {
        return foods.search(query);
    }
}
