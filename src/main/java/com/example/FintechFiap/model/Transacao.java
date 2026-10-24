package com.example.FintechFiap.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity 
@Table(name = "tb_fin_transacao")
@Getter 
@Setter
@NoArgsConstructor 
@AllArgsConstructor 
public class Transacao {
    @Id 
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_transacao", length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;
    
    @Column(name = "ds_descricao", nullable = false, length = 150)
    private String descricao;

    @Column(name = "vl_transacao", precision = 12, scale = 2)
    private BigDecimal valorTransacao = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "tp_transacao", nullable = false, length = 20)
    private TipoTransacao tipoTransacao;

    @Column(name = "ds_categoria", nullable = false, length = 50)
    private String categoria;

    @Column(name = "dt_transacao", nullable = false)
    private LocalDate dataTransacao = LocalDate.now();
}
