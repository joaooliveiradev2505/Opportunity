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
@Table(name = "tb_fin_divida")
@Getter 
@Setter
@NoArgsConstructor 
@AllArgsConstructor 
public class Divida {
    @Id 
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_divida", length = 36)
    private String id;    

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "ds_divida", nullable = false, length = 150)
    private String descricaoDivida;

    @Column(name = "vl_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorTotal;

    @Column(name = "vl_parcela", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorParcela;

    @Column(name = "nt_total_parcelas", nullable = false)
    private Integer totalParcelas;

    @Column(name = "nr_parcelas_pagas", nullable = false)
    private Integer parcelasPagas = 0;

    @Column(name = "dt_vencimento_mensal", nullable = false)
    private LocalDate dataVencimentoMensal;

    @Column(name = "tx_juros_atraso", precision = 5, scale = 2)
    private BigDecimal taxaJurosAtraso = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_divida", length = 20)
    private StatusDivida statusDivida = StatusDivida.EM_DIA;

}
