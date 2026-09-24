package com.nutrifybe.api.service;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.nutrifybe.api.domain.Patient;
import com.nutrifybe.api.repository.PatientRepository;
import com.nutrifybe.api.security.TokenService;
import com.nutrifybe.api.web.ApiDtos;

@Service
public class PatientService {
    private final PatientRepository patients;
    private final PasswordEncoder passwords;
    private final TokenService tokens;

    public PatientService(PatientRepository patients, PasswordEncoder passwords, TokenService tokens) {
        this.patients = patients; this.passwords = passwords; this.tokens = tokens;
    }

    @Transactional
    public ApiDtos.AuthResponse register(ApiDtos.RegisterRequest data) {
        String email = data.email().trim().toLowerCase(Locale.ROOT);
        if (patients.existsByEmailIgnoreCase(email)) throw ApiException.conflict("Este e-mail já está cadastrado.");
        Patient p = new Patient();
        p.setNome(data.name().trim()); p.setEmail(email); p.setSenhaHash(passwords.encode(data.password()));
        p.setDataNascimento(data.birthDate()); p.setIdade(calculateAge(data.birthDate())); p.setSexo(data.sexo());
        p.setPeso(data.weight()); p.setAltura(data.height()); p.setPesoMeta(data.targetWeight()); p.setMetaAgua(data.waterGoal());
        p.setObjetivo(data.goal()); p.setAtividade(data.activityLevel()); p.setMotivacao(data.motivation());
        p.setRestricoes(data.restrictions()); p.setCondicaoSaude(data.restrictions()); p.setObservacoes(data.healthNote());
        p.setOrigem(data.origin()); p.setPreferenciaAcompanhamento(data.followupPreference()); p.setStatus("active");
        Patient saved = patients.save(p);
        return new ApiDtos.AuthResponse(tokens.issue(saved.getId(), saved.getEmail()), ApiDtos.PatientResponse.from(saved));
    }

    @Transactional(readOnly = true)
    public ApiDtos.AuthResponse login(ApiDtos.LoginRequest data) {
        Patient p = patients.findByEmailIgnoreCase(data.email().trim()).filter(patient -> patient.getAtivo() == 1)
                .filter(patient -> passwords.matches(data.password(), patient.getSenhaHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos."));
        return new ApiDtos.AuthResponse(tokens.issue(p.getId(), p.getEmail()), ApiDtos.PatientResponse.from(p));
    }

    @Transactional(readOnly = true)
    public Patient getOwned(long id, long actorId) {
        if (id != actorId) throw ApiException.forbidden("Acesso negado.");
        return patients.findById(id).orElseThrow(() -> ApiException.notFound("Paciente não encontrado."));
    }

    @Transactional
    public Patient update(long id, long actorId, ApiDtos.ProfileUpdate data) {
        Patient p = getOwned(id, actorId);
        if (data.name() != null) p.setNome(data.name().trim());
        if (data.weight() != null) p.setPeso(data.weight());
        if (data.height() != null) p.setAltura(data.height());
        if (data.targetWeight() != null) p.setPesoMeta(data.targetWeight());
        if (data.waterGoal() != null) p.setMetaAgua(data.waterGoal());
        if (data.goal() != null) p.setObjetivo(data.goal());
        return patients.save(p);
    }

    private int calculateAge(String birthDate) {
        try {
            LocalDate date = LocalDate.parse(birthDate, DateTimeFormatter.ofPattern("dd/MM/uuuu"));
            int age = Period.between(date, LocalDate.now()).getYears();
            if (date.isAfter(LocalDate.now()) || age > 120) throw ApiException.badRequest("Data de nascimento inválida.");
            return age;
        } catch (DateTimeParseException e) { throw ApiException.badRequest("Data de nascimento inválida. Use DD/MM/AAAA."); }
    }
}
