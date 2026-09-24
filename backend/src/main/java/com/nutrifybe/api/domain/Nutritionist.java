package com.nutrifybe.api.domain;

import java.time.Instant;
import jakarta.persistence.*;

@Entity
@Table(name = "app_nutritionists", uniqueConstraints = {
        @UniqueConstraint(name = "uk_app_nutritionist_email", columnNames = "email"),
        @UniqueConstraint(name = "uk_app_nutritionist_crn", columnNames = "crn")})
public class Nutritionist {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 100) private String nome;
    @Column(nullable = false, length = 254) private String email;
    @Column(nullable = false, length = 40) private String crn;
    @Column(length = 200) private String senhaHash;
    @Column(nullable = false, length = 30) private String status = "pending";
    @Column(nullable = false) private Integer ativo = 1;
    @Column(length = 30) private String telefone;
    @Column(length = 100) private String especialidade;
    @Column(length = 1000) private String descricao;
    @Column(length = 500) private String foto;
    @Column(nullable = false, updatable = false) private Instant dataCriacao;

    @PrePersist void onCreate() { dataCriacao = Instant.now(); }
    public Long getId() { return id; }
    public String getNome() { return nome; } public void setNome(String v) { nome = v; }
    public String getEmail() { return email; } public void setEmail(String v) { email = v; }
    public String getCrn() { return crn; } public void setCrn(String v) { crn = v; }
    public String getSenhaHash() { return senhaHash; } public void setSenhaHash(String v) { senhaHash = v; }
    public String getStatus() { return status; } public void setStatus(String v) { status = v; }
    public Integer getAtivo() { return ativo; } public void setAtivo(Integer v) { ativo = v; }
    public String getTelefone() { return telefone; } public void setTelefone(String v) { telefone = v; }
    public String getEspecialidade() { return especialidade; } public void setEspecialidade(String v) { especialidade = v; }
    public String getDescricao() { return descricao; } public void setDescricao(String v) { descricao = v; }
    public String getFoto() { return foto; } public void setFoto(String v) { foto = v; }
    public Instant getDataCriacao() { return dataCriacao; }
}
