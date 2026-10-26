package com.example.FintechFiap.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity 
@Table(name = "tb_fin_usuario")
@Getter 
@Setter
@NoArgsConstructor 
@AllArgsConstructor 
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Usuario {
    @Id 
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name= "id_usuario", length = 36)
    private String id;
    
    @Column(name = "nm_usuario", nullable = false, length = 150)
    private String nome;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "dt_nascimento", nullable = false)
    private LocalDate dataNascimento;

    @Enumerated(EnumType.STRING)
    @Column(name = "sexo", nullable = false, length = 10)
    private Sexo sexo = Sexo.MASCULINO;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "ds_senha_hash", nullable = false, length = 255)
    private String senhaHash;

    @Column(name = "renda", precision = 12, scale = 2)
    private BigDecimal renda;

    @Column(name = "renda_variavel", length = 1)
    private Boolean rendaVariavel;

    @Enumerated(EnumType.STRING)
    @Column(name = "tp_perfil_investidor", length = 20)
    private PerfilInvestidor perfilInvestidor = PerfilInvestidor.MODERADO;

    @Column(name = "dt_criacao", updatable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Column(name = "nr_dia_fechamento", length = 5)
    private Integer diaFechamento;

}
