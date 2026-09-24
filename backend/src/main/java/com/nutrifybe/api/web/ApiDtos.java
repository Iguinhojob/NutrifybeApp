package com.nutrifybe.api.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import jakarta.validation.constraints.*;
import com.nutrifybe.api.domain.Nutritionist;
import com.nutrifybe.api.domain.NutritionistRequest;
import com.nutrifybe.api.domain.Patient;

public final class ApiDtos {
    private ApiDtos() {}

    public record RegisterRequest(
            @NotBlank @Size(min = 2, max = 100) String name,
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(min = 6, max = 128) @Pattern(regexp = "(?s)(?=.*[A-Z])(?=.*[^A-Za-z0-9\\s]).+") String password,
            @NotBlank String birthDate, @NotBlank String sexo,
            @NotNull @DecimalMin("20") @DecimalMax("500") BigDecimal weight,
            @NotNull @DecimalMin("80") @DecimalMax("250") BigDecimal height,
            @NotNull @DecimalMin("20") @DecimalMax("500") BigDecimal targetWeight,
            @NotNull @DecimalMin("0.5") @DecimalMax("10") BigDecimal waterGoal,
            @NotBlank @Size(max = 60) String goal,
            @NotBlank @Size(max = 60) String activityLevel,
            @Size(max = 500) String restrictions,
            @Size(max = 1000) String healthNote,
            @Size(max = 250) String motivation,
            @Size(max = 100) String origin,
            @Size(max = 30) String followupPreference) {}

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
    public record AuthResponse(String token, PatientResponse paciente) {}

    public record ProfileUpdate(
            @Size(min = 2, max = 100) String name,
            @DecimalMin("20") @DecimalMax("500") BigDecimal weight,
            @DecimalMin("80") @DecimalMax("250") BigDecimal height,
            @DecimalMin("20") @DecimalMax("500") BigDecimal targetWeight,
            @DecimalMin("0.5") @DecimalMax("10") BigDecimal waterGoal,
            @Size(max = 60) String goal) {}

    public record LinkRequest(@NotNull Long nutritionistId) {}
    public record ReviewRequest(@NotBlank @Pattern(regexp = "approved|rejected") String status) {}
    public record MealInput(@NotBlank @Size(max = 40) String mealType,
            @NotBlank @Size(max = 500) String description,
            @NotNull @DecimalMin("1") @DecimalMax("10000") BigDecimal calories, LocalDate entryDate) {}
    public record MealResponse(Long id, String mealType, String description, BigDecimal calories, LocalDate entryDate, Instant createdAt) {
        public static MealResponse from(com.nutrifybe.api.domain.MealEntry m) {
            return new MealResponse(m.getId(), m.getMealType(), m.getDescription(), m.getCalories(), m.getEntryDate(), m.getCreatedAt());
        }
    }
    public record WaterInput(@NotNull @Min(1) @Max(5000) Integer amountMl, LocalDate entryDate) {}
    public record WaterResponse(Long id, Integer amountMl, LocalDate entryDate, Instant createdAt) {
        public static WaterResponse from(com.nutrifybe.api.domain.WaterEntry w) {
            return new WaterResponse(w.getId(), w.getAmountMl(), w.getEntryDate(), w.getCreatedAt());
        }
    }

    public record NutritionistInput(@NotBlank @Size(max = 100) String nome,
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(max = 40) String crn, @Size(max = 30) String telefone,
            @Size(max = 100) String especialidade, @Size(max = 1000) String descricao,
            @Size(max = 500) String foto, @Size(min = 8, max = 128) String senha,
            Boolean ativo, @Pattern(regexp = "approved|pending|rejected") String status) {}

    public record PatientResponse(Long id, String nome, String email, Integer idade, String dataNascimento,
            String sexo, BigDecimal peso, BigDecimal altura, BigDecimal pesoMeta, BigDecimal metaAgua,
            String objetivo, String atividade, String motivacao, String restricoes, String observacoes,
            String origem, String preferenciaAcompanhamento, String condicaoSaude, Long nutricionistaId,
            String status, Integer ativo, String prescricaoSemanal, String calendario, Instant dataCriacao) {
        public static PatientResponse from(Patient p) {
            return new PatientResponse(p.getId(), p.getNome(), p.getEmail(), p.getIdade(), p.getDataNascimento(),
                    p.getSexo(), p.getPeso(), p.getAltura(), p.getPesoMeta(), p.getMetaAgua(), p.getObjetivo(),
                    p.getAtividade(), p.getMotivacao(), p.getRestricoes(), p.getObservacoes(), p.getOrigem(),
                    p.getPreferenciaAcompanhamento(), p.getCondicaoSaude(), p.getNutricionistaId(), p.getStatus(),
                    p.getAtivo(), p.getPrescricaoSemanal(), p.getCalendario(), p.getDataCriacao());
        }
    }

    public record NutritionistResponse(Long id, String nome, String email, String crn, String status,
            Integer ativo, String telefone, String especialidade, String descricao, String foto, Instant dataCriacao) {
        public static NutritionistResponse from(Nutritionist n) {
            return new NutritionistResponse(n.getId(), n.getNome(), n.getEmail(), n.getCrn(), n.getStatus(),
                    n.getAtivo(), n.getTelefone(), n.getEspecialidade(), n.getDescricao(), n.getFoto(), n.getDataCriacao());
        }
    }

    public record RequestResponse(Long id, String nome, String email, Integer idade, BigDecimal peso,
            BigDecimal altura, String objetivo, String condicaoSaude, Long nutricionistaId, String status,
            Instant dataCriacao) {
        public static RequestResponse from(NutritionistRequest request, Patient patient) {
            return new RequestResponse(request.getId(), patient.getNome(), patient.getEmail(), patient.getIdade(),
                    patient.getPeso(), patient.getAltura(), patient.getObjetivo(), patient.getCondicaoSaude(),
                    request.getNutritionistId(), request.getStatus(), request.getDataCriacao());
        }
    }
}
