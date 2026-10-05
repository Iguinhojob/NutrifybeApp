package com.nutrifybe.api.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;
import com.fasterxml.jackson.databind.JsonNode;
import com.nutrifybe.api.web.ApiDtos;

@Service
public class FoodSearchService {
    private static final String FDC_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";
    private final RestClient client = RestClient.create();
    private final String apiKey;

    public FoodSearchService(@Value("${app.food-data-central.api-key:DEMO_KEY}") String apiKey) {
        this.apiKey = apiKey;
    }

    public List<ApiDtos.FoodSearchResult> search(String rawQuery) {
        String query = rawQuery == null ? "" : rawQuery.trim();
        if (query.length() < 2) throw ApiException.badRequest("Digite pelo menos 2 caracteres para buscar um alimento.");
        if (query.length() > 100) throw ApiException.badRequest("A busca deve ter no máximo 100 caracteres.");

        var uri = UriComponentsBuilder.fromUriString(FDC_SEARCH_URL)
                .queryParam("query", query)
                .queryParam("dataType", "Foundation,SR Legacy,Survey (FNDDS)")
                .queryParam("pageSize", 20)
                .queryParam("api_key", apiKey)
                .build().encode().toUri();
        try {
            JsonNode response = client.get().uri(uri).retrieve().body(JsonNode.class);
            JsonNode foods = response == null ? null : response.path("foods");
            if (foods == null || !foods.isArray()) return List.of();
            List<ApiDtos.FoodSearchResult> results = new ArrayList<>();
            for (JsonNode food : foods) {
                String description = text(food, "description");
                BigDecimal calories = nutrient(food, "energy");
                if (description.isBlank() || calories == null || calories.signum() < 0) continue;
                results.add(new ApiDtos.FoodSearchResult(
                        text(food, "fdcId"), description, text(food, "dataType"),
                        firstText(food, "brandName", "brandOwner"), calories,
                        nutrient(food, "carbohydrate"), nutrient(food, "protein"), nutrient(food, "total lipid"),
                        "USDA FoodData Central"));
            }
            return results;
        } catch (RestClientException e) {
            throw ApiException.badGateway("A base de alimentos está temporariamente indisponível. Tente novamente em instantes.");
        }
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node.path(field);
        return value.isMissingNode() || value.isNull() ? "" : value.asText("");
    }

    private static String firstText(JsonNode node, String first, String second) {
        String value = text(node, first);
        return value.isBlank() ? text(node, second) : value;
    }

    private static BigDecimal nutrient(JsonNode food, String namePart) {
        JsonNode values = food.path("foodNutrients");
        if (!values.isArray()) return null;
        for (JsonNode item : values) {
            String name = text(item, "nutrientName").toLowerCase(Locale.ROOT);
            if (!name.contains(namePart)) continue;
            JsonNode raw = item.get("value");
            if (raw == null || !raw.isNumber()) continue;
            BigDecimal amount = raw.decimalValue();
            String unit = text(item, "unitName");
            if (namePart.equals("energy") && unit.equalsIgnoreCase("kJ")) {
                amount = amount.divide(new BigDecimal("4.184"), 2, RoundingMode.HALF_UP);
            } else if (namePart.equals("energy") && !unit.equalsIgnoreCase("kcal")) {
                continue;
            }
            return amount;
        }
        return null;
    }
}
