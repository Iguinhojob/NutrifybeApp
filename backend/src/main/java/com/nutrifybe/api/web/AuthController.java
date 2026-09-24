package com.nutrifybe.api.web;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import com.nutrifybe.api.service.PatientService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final PatientService patients;
    public AuthController(PatientService patients) { this.patients = patients; }
    @PostMapping("/register") public ApiDtos.AuthResponse register(@Valid @RequestBody ApiDtos.RegisterRequest data) { return patients.register(data); }
    @PostMapping("/login") public ApiDtos.AuthResponse login(@Valid @RequestBody ApiDtos.LoginRequest data) { return patients.login(data); }
}
