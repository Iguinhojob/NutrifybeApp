package com.nutrifybe.api.service;

import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.nutrifybe.api.domain.Nutritionist;
import com.nutrifybe.api.repository.NutritionistRepository;
import com.nutrifybe.api.web.ApiDtos;

@Service
public class NutritionistService {
    private final NutritionistRepository nutritionists;
    private final PasswordEncoder passwords;

    public NutritionistService(NutritionistRepository nutritionists, PasswordEncoder passwords) {
        this.nutritionists = nutritionists; this.passwords = passwords;
    }

    @Transactional(readOnly = true)
    public List<ApiDtos.NutritionistResponse> approved() {
        return nutritionists.findByStatusAndAtivoOrderByNomeAsc("approved", 1).stream().map(ApiDtos.NutritionistResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ApiDtos.NutritionistResponse getApproved(long id) {
        Nutritionist n = nutritionists.findById(id).filter(value -> value.getAtivo() == 1 && "approved".equals(value.getStatus()))
                .orElseThrow(() -> ApiException.notFound("Nutricionista não encontrado."));
        return ApiDtos.NutritionistResponse.from(n);
    }

    @Transactional
    public ApiDtos.NutritionistResponse create(ApiDtos.NutritionistInput input) {
        Nutritionist n = new Nutritionist(); apply(n, input, true);
        return ApiDtos.NutritionistResponse.from(nutritionists.save(n));
    }

    @Transactional
    public ApiDtos.NutritionistResponse update(long id, ApiDtos.NutritionistInput input) {
        Nutritionist n = nutritionists.findById(id).orElseThrow(() -> ApiException.notFound("Nutricionista não encontrado."));
        apply(n, input, false);
        return ApiDtos.NutritionistResponse.from(nutritionists.save(n));
    }

    private void apply(Nutritionist n, ApiDtos.NutritionistInput input, boolean creating) {
        n.setNome(input.nome().trim()); n.setEmail(input.email().trim().toLowerCase()); n.setCrn(input.crn().trim().toUpperCase());
        n.setTelefone(input.telefone()); n.setEspecialidade(input.especialidade()); n.setDescricao(input.descricao()); n.setFoto(input.foto());
        if (input.senha() != null && !input.senha().isBlank()) n.setSenhaHash(passwords.encode(input.senha()));
        if (creating && n.getStatus() == null) n.setStatus("pending");
        if (input.status() != null) n.setStatus(input.status());
        if (input.ativo() != null) n.setAtivo(input.ativo() ? 1 : 0);
    }
}
