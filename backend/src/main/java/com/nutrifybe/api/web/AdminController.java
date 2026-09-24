package com.nutrifybe.api.web;

import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.nutrifybe.api.service.ApiException;
import com.nutrifybe.api.service.NutritionistRequestService;
import com.nutrifybe.api.service.NutritionistService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final NutritionistService nutritionists;
    private final NutritionistRequestService requests;
    private final byte[] adminKey;

    public AdminController(NutritionistService nutritionists, NutritionistRequestService requests, @Value("${app.admin.key}") String adminKey) {
        this.nutritionists = nutritionists; this.requests = requests; this.adminKey = adminKey.getBytes(StandardCharsets.UTF_8);
        if (this.adminKey.length < 32) throw new IllegalStateException("ADMIN_API_KEY deve ter ao menos 32 bytes.");
    }

    @PostMapping("/nutricionistas")
    public ApiDtos.NutritionistResponse createNutritionist(@RequestHeader("X-Admin-Key") String key, @Valid @RequestBody ApiDtos.NutritionistInput data) {
        authorize(key); return nutritionists.create(data);
    }

    @PutMapping("/nutricionistas/{id}")
    public ApiDtos.NutritionistResponse updateNutritionist(@RequestHeader("X-Admin-Key") String key, @PathVariable long id, @Valid @RequestBody ApiDtos.NutritionistInput data) {
        authorize(key); return nutritionists.update(id, data);
    }

    @GetMapping("/solicitacoesPendentes")
    public List<ApiDtos.RequestResponse> pendingRequests(@RequestHeader("X-Admin-Key") String key) {
        authorize(key); return requests.pending();
    }

    @PatchMapping("/solicitacoesPendentes/{id}")
    public ApiDtos.RequestResponse reviewRequest(@RequestHeader("X-Admin-Key") String key, @PathVariable long id, @Valid @RequestBody ApiDtos.ReviewRequest data) {
        authorize(key); return requests.review(id, data.status());
    }

    private void authorize(String provided) {
        if (!MessageDigest.isEqual(adminKey, provided.getBytes(StandardCharsets.UTF_8))) throw new ApiException(HttpStatus.FORBIDDEN, "Chave administrativa inválida.");
    }
}
