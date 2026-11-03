package com.example.FintechFiap.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity 
@Table(name = "tb_fin_meta")
@Getter 
@Setter
@NoArgsConstructor 
@AllArgsConstructor 
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Meta {
    @Id 
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_meta", length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;  


    @Column(name = "nm_meta", nullable = false, length = 150)
    private String meta;

    @Column(name = "vl_alvo", precision = 12, scale = 2)
    private BigDecimal valorAlvo;

    @Column(name = "vl_atual", precision = 12, scale = 2)
    private BigDecimal valorAtual = BigDecimal.ZERO;

    @Column(name = "vl_aporte_mensal", precision = 12, scale = 2)
    private BigDecimal aporteMensal;

    @Column(name = "dt_alvo", nullable = false)
    private LocalDate dataAlvo;

    @Column(name = "nr_prioridade", nullable = false, length = 1)
    private Integer prioridade = 1;

    @Column(name = "tx_rendimento_anual", precision = 5, scale = 2)
    private BigDecimal taxaRendimentoAnual;

    @Column(name = "st_reserva_emergencia")
    private Boolean reservaEmergencia = false;

    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

}
