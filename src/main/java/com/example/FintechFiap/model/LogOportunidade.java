package com.example.FintechFiap.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "tb_fin_log_oportunidade")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LogOportunidade {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_log", length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_transacao", nullable = false)
    private Transacao transacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_meta_impactada", nullable = true)
    private Meta metaImpactada;

    @Column(name = "nr_dias_atraso", nullable = false)
    private Integer diasAtraso;

    @Column(name = "vl_futuro_perdido", precision = 12, scale = 2)
    private BigDecimal valorFuturoPerdido;

    @Column(name = "dt_calculo", updatable = false)
    private LocalDateTime dataCalculo = LocalDateTime.now();
    
}