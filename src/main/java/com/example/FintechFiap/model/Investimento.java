package com.example.FintechFiap.model;
import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@Table(name = "tb_fin_investimento")
@Getter 
@Setter
@NoArgsConstructor 
@AllArgsConstructor 
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Investimento {
    @Id 
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_investimento", length = 36)
    private String id;    

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_meta", nullable = true)
    private Meta meta;

    @Column(name = "nm_ativo", nullable = false, length = 100)
    private String nomeAtivo;

    @Enumerated(EnumType.STRING)
    @Column(name = "tp_modalidade", nullable = false, length = 20)
    private ModalidadeInvestimento modalidade;

    @Column(name = "tp_produto", nullable = false, length = 30)
    private String tipoProduto;

    @Column(name = "vl_investido", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorInvestido = BigDecimal.ZERO;

    @Column(name = "vl_saldo_atual", nullable = false, precision = 12, scale = 2)
    private BigDecimal saldoAtual = BigDecimal.ZERO;

    @Column(name = "ds_risco", nullable = false, length = 20)
    private String risco;

    @Column(name = "ds_liquidez", nullable = false, length = 20)
    private String liquidez;

    @Column(name = "st_isento_ir")
    private Boolean isentoIR = false;

    @Column(name = "dt_aplicacao", nullable = false)
    private LocalDate dataAplicacao = LocalDate.now();

}
