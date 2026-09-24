package com.nutrifybe.api.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.nutrifybe.api.domain.Nutritionist;
import com.nutrifybe.api.domain.NutritionistRequest;
import com.nutrifybe.api.domain.Patient;
import com.nutrifybe.api.repository.NutritionistRepository;
import com.nutrifybe.api.repository.NutritionistRequestRepository;
import com.nutrifybe.api.repository.PatientRepository;
import com.nutrifybe.api.web.ApiDtos;

@Service
public class NutritionistRequestService {
    private final NutritionistRequestRepository requests;
    private final PatientRepository patients;
    private final NutritionistRepository nutritionists;

    public NutritionistRequestService(NutritionistRequestRepository requests, PatientRepository patients, NutritionistRepository nutritionists) {
        this.requests = requests; this.patients = patients; this.nutritionists = nutritionists;
    }

    @Transactional
    public ApiDtos.RequestResponse create(long patientId, ApiDtos.LinkRequest data) {
        Patient patient = patients.findById(patientId).orElseThrow(() -> ApiException.notFound("Paciente não encontrado."));
        Nutritionist nutritionist = nutritionists.findById(data.nutritionistId())
                .filter(n -> n.getAtivo() == 1 && "approved".equals(n.getStatus()))
                .orElseThrow(() -> ApiException.notFound("Nutricionista não encontrado."));
        if (requests.existsByPatientIdAndStatus(patientId, "pending")) throw ApiException.conflict("Você já tem uma solicitação pendente.");
        if (patient.getNutricionistaId() != null && "active".equals(patient.getStatus())) throw ApiException.conflict("Seu perfil já está vinculado a um nutricionista.");
        NutritionistRequest request = new NutritionistRequest();
        request.setPatientId(patientId); request.setNutritionistId(nutritionist.getId());
        patient.setNutricionistaId(nutritionist.getId()); patient.setStatus("pending");
        patients.save(patient);
        return ApiDtos.RequestResponse.from(requests.save(request), patient);
    }

    @Transactional(readOnly = true)
    public List<ApiDtos.RequestResponse> mine(long patientId) {
        Patient p = patients.findById(patientId).orElseThrow(() -> ApiException.notFound("Paciente não encontrado."));
        return requests.findByPatientIdOrderByDataCriacaoDesc(patientId).stream().map(r -> ApiDtos.RequestResponse.from(r, p)).toList();
    }

    @Transactional
    public void deleteMine(long requestId, long patientId) {
        NutritionistRequest r = requests.findById(requestId).orElseThrow(() -> ApiException.notFound("Solicitação não encontrada."));
        if (!r.getPatientId().equals(patientId)) throw ApiException.forbidden("Acesso negado.");
        if (!"pending".equals(r.getStatus())) throw ApiException.conflict("Somente solicitações pendentes podem ser canceladas.");
        Patient patient = patients.findById(patientId).orElseThrow(() -> ApiException.notFound("Paciente não encontrado."));
        if (r.getNutritionistId().equals(patient.getNutricionistaId())) { patient.setNutricionistaId(null); patient.setStatus("active"); }
        requests.delete(r);
    }

    @Transactional(readOnly = true)
    public List<ApiDtos.RequestResponse> pending() {
        return requests.findByStatusOrderByDataCriacaoAsc("pending").stream().map(r -> {
            Patient p = patients.findById(r.getPatientId()).orElseThrow(() -> ApiException.notFound("Paciente não encontrado."));
            return ApiDtos.RequestResponse.from(r, p);
        }).toList();
    }

    @Transactional
    public ApiDtos.RequestResponse review(long id, String status) {
        NutritionistRequest r = requests.findById(id).orElseThrow(() -> ApiException.notFound("Solicitação não encontrada."));
        if (!"pending".equals(r.getStatus())) throw ApiException.conflict("A solicitação já foi analisada.");
        Patient p = patients.findById(r.getPatientId()).orElseThrow(() -> ApiException.notFound("Paciente não encontrado."));
        r.setStatus(status);
        if ("approved".equals(status)) { p.setNutricionistaId(r.getNutritionistId()); p.setStatus("active"); }
        else if (r.getNutritionistId().equals(p.getNutricionistaId())) { p.setNutricionistaId(null); p.setStatus("active"); }
        patients.save(p);
        return ApiDtos.RequestResponse.from(requests.save(r), p);
    }
}
