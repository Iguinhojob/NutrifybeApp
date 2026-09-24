package com.nutrifybe.api.domain;

import java.math.BigDecimal;
import java.time.Instant;
import jakarta.persistence.*;

@Entity
@Table(name = "app_patients", uniqueConstraints = @UniqueConstraint(name = "uk_app_patient_email", columnNames = "email"))
public class Patient {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 100) private String nome;
    @Column(nullable = false, length = 254) private String email;
    @Column(nullable = false, length = 100) private String senhaHash;
    @Column(nullable = false) private Integer idade;
    @Column(length = 10) private String dataNascimento;
    @Column(length = 40) private String sexo;
    @Column(nullable = false, precision = 6, scale = 2) private BigDecimal peso;
    @Column(nullable = false, precision = 6, scale = 2) private BigDecimal altura;
    @Column(precision = 6, scale = 2) private BigDecimal pesoMeta;
    @Column(precision = 5, scale = 2) private BigDecimal metaAgua;
    @Column(nullable = false, length = 60) private String objetivo;
    @Column(length = 60) private String atividade;
    @Column(length = 250) private String motivacao;
    @Column(length = 500) private String restricoes;
    @Column(length = 1000) private String observacoes;
    @Column(length = 100) private String origem;
    @Column(length = 30) private String preferenciaAcompanhamento;
    @Column(length = 2000) private String condicaoSaude;
    private Long nutricionistaId;
    @Column(nullable = false, length = 20) private String status = "active";
    @Column(nullable = false) private Integer ativo = 1;
    @Column(columnDefinition = "nvarchar(max)") private String prescricaoSemanal;
    @Column(columnDefinition = "nvarchar(max)") private String calendario;
    @Column(nullable = false, updatable = false) private Instant dataCriacao;
    @Column(nullable = false) private Instant dataAtualizacao;

    @PrePersist void onCreate() { Instant now = Instant.now(); dataCriacao = now; dataAtualizacao = now; }
    @PreUpdate void onUpdate() { dataAtualizacao = Instant.now(); }

    public Long getId() { return id; }
    public String getNome() { return nome; } public void setNome(String v) { nome = v; }
    public String getEmail() { return email; } public void setEmail(String v) { email = v; }
    public String getSenhaHash() { return senhaHash; } public void setSenhaHash(String v) { senhaHash = v; }
    public Integer getIdade() { return idade; } public void setIdade(Integer v) { idade = v; }
    public String getDataNascimento() { return dataNascimento; } public void setDataNascimento(String v) { dataNascimento = v; }
    public String getSexo() { return sexo; } public void setSexo(String v) { sexo = v; }
    public BigDecimal getPeso() { return peso; } public void setPeso(BigDecimal v) { peso = v; }
    public BigDecimal getAltura() { return altura; } public void setAltura(BigDecimal v) { altura = v; }
    public BigDecimal getPesoMeta() { return pesoMeta; } public void setPesoMeta(BigDecimal v) { pesoMeta = v; }
    public BigDecimal getMetaAgua() { return metaAgua; } public void setMetaAgua(BigDecimal v) { metaAgua = v; }
    public String getObjetivo() { return objetivo; } public void setObjetivo(String v) { objetivo = v; }
    public String getAtividade() { return atividade; } public void setAtividade(String v) { atividade = v; }
    public String getMotivacao() { return motivacao; } public void setMotivacao(String v) { motivacao = v; }
    public String getRestricoes() { return restricoes; } public void setRestricoes(String v) { restricoes = v; }
    public String getObservacoes() { return observacoes; } public void setObservacoes(String v) { observacoes = v; }
    public String getOrigem() { return origem; } public void setOrigem(String v) { origem = v; }
    public String getPreferenciaAcompanhamento() { return preferenciaAcompanhamento; } public void setPreferenciaAcompanhamento(String v) { preferenciaAcompanhamento = v; }
    public String getCondicaoSaude() { return condicaoSaude; } public void setCondicaoSaude(String v) { condicaoSaude = v; }
    public Long getNutricionistaId() { return nutricionistaId; } public void setNutricionistaId(Long v) { nutricionistaId = v; }
    public String getStatus() { return status; } public void setStatus(String v) { status = v; }
    public Integer getAtivo() { return ativo; } public void setAtivo(Integer v) { ativo = v; }
    public String getPrescricaoSemanal() { return prescricaoSemanal; } public void setPrescricaoSemanal(String v) { prescricaoSemanal = v; }
    public String getCalendario() { return calendario; } public void setCalendario(String v) { calendario = v; }
    public Instant getDataCriacao() { return dataCriacao; }
}
