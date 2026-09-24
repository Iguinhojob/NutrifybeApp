package com.nutrifybe.api.web;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.nutrifybe.api.service.PatientService;

@RestController
@RequestMapping("/api/pacientes")
public class PatientController {
    private final PatientService patients;
    public PatientController(PatientService patients) { this.patients = patients; }
    @GetMapping("/{id}") public ApiDtos.PatientResponse get(@PathVariable long id, @AuthenticationPrincipal Jwt jwt) {
        return ApiDtos.PatientResponse.from(patients.getOwned(id, Long.parseLong(jwt.getSubject())));
    }
    @PutMapping("/{id}") public ApiDtos.PatientResponse update(@PathVariable long id, @Valid @RequestBody ApiDtos.ProfileUpdate data, @AuthenticationPrincipal Jwt jwt) {
        return ApiDtos.PatientResponse.from(patients.update(id, Long.parseLong(jwt.getSubject()), data));
    }
}
