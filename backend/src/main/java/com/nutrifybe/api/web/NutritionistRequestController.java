package com.nutrifybe.api.web;

import java.util.List;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.nutrifybe.api.service.NutritionistRequestService;

@RestController
@RequestMapping("/api/solicitacoesPendentes")
public class NutritionistRequestController {
    private final NutritionistRequestService requests;
    public NutritionistRequestController(NutritionistRequestService requests) { this.requests = requests; }
    @GetMapping public List<ApiDtos.RequestResponse> mine(@AuthenticationPrincipal Jwt jwt) { return requests.mine(Long.parseLong(jwt.getSubject())); }
    @PostMapping public ApiDtos.RequestResponse create(@Valid @RequestBody ApiDtos.LinkRequest data, @AuthenticationPrincipal Jwt jwt) {
        return requests.create(Long.parseLong(jwt.getSubject()), data);
    }
    @DeleteMapping("/{id}") public void delete(@PathVariable long id, @AuthenticationPrincipal Jwt jwt) { requests.deleteMine(id, Long.parseLong(jwt.getSubject())); }
}
