#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
===============================================================================
FINTECH OPPORTUNITY — THE OPPORTUNITY LEDGER (PROJETO ANUAL FIAP)
Módulo de Algoritmos Financeiros, Custo de Oportunidade & Consultoria IA
Requisitos atendidos: RF-05, RF-06, RF-07, RF-08 e RNF-03 (Stack Python/IA)
===============================================================================
"""

from __future__ import annotations
import argparse
import json
import math
from dataclasses import dataclass, asdict
from datetime import datetime
from typing import List, Dict, Any


@dataclass
class ResultadoOrcamentoReverso:
    renda_mensal: float
    aportes_metas: float
    despesas_fixas: float
    parcelas_dividas: float
    teto_gastos_livres: float
    taxa_poupanca_pct: float
    comprometimento_fixo_pct: float
    status_orcamento: str


@dataclass
class ReciboCustoOportunidade:
    descricao_gasto: str
    valor_gasto: float
    meta_impactada: str
    aporte_diario_meta: float
    dias_atraso: int
    meses_ate_alvo: int
    taxa_anual_pct: float
    valor_futuro_perdido: float
    juros_perdidos: float


@dataclass
class ProjecaoMicroHabito:
    descricao: str
    gasto_mensal: float
    taxa_anual_pct: float
    horizonte_1_ano: Dict[str, float]
    horizonte_5_anos: Dict[str, float]
    horizonte_10_anos: Dict[str, float]


def calcular_orcamento_reverso(
    renda_mensal: float,
    aportes_metas: float,
    despesas_fixas: float,
    parcelas_dividas: float = 0.0,
) -> ResultadoOrcamentoReverso:
    """
    RF-05: Módulo de Orçamento Reverso (Pay Yourself First).
    Fórmula: Gastos Livres = Receitas - Aportes Metas - Despesas Fixas - Dívidas
    """
    teto_livre = round(renda_mensal - aportes_metas - despesas_fixas - parcelas_dividas, 2)
    taxa_poupanca = round((aportes_metas / renda_mensal) * 100, 2) if renda_mensal > 0 else 0.0
    comprometimento_fixo = (
        round(((despesas_fixas + parcelas_dividas) / renda_mensal) * 100, 2)
        if renda_mensal > 0
        else 0.0
    )

    if teto_livre < 0:
        status = "DEFICIT_ORCAMENTARIO"
    elif teto_livre < (renda_mensal * 0.10):
        status = "MARGEM_ESTREITA"
    else:
        status = "SUPERAVIT_SAUDAVEL"

    return ResultadoOrcamentoReverso(
        renda_mensal=round(renda_mensal, 2),
        aportes_metas=round(aportes_metas, 2),
        despesas_fixas=round(despesas_fixas, 2),
        parcelas_dividas=round(parcelas_dividas, 2),
        teto_gastos_livres=teto_livre,
        taxa_poupanca_pct=taxa_poupanca,
        comprometimento_fixo_pct=comprometimento_fixo,
        status_orcamento=status,
    )


def calcular_custo_oportunidade(
    descricao_gasto: str,
    valor_gasto: float,
    meta_impactada: str,
    aporte_mensal_meta: float,
    taxa_anual_pct: float,
    meses_ate_alvo: int,
) -> ReciboCustoOportunidade:
    """
    RF-06: Calculadora de Custo de Oportunidade e Juros Compostos.
    Espelha exatamente a regra de negócio da camada Java (TransacaoService.java):
      - Aporte Diário = Aporte Mensal / 30
      - Dias de Atraso = ceil(Valor Gasto / Aporte Diário)
      - Valor Futuro (FV) = PV * (1 + i)^n
    """
    aporte_diario = round(aporte_mensal_meta / 30.0, 2)
    dias_atraso = math.ceil(valor_gasto / aporte_diario) if aporte_diario > 0 else 0

    meses_efetivos = max(1, meses_ate_alvo)
    taxa_mensal = (taxa_anual_pct / 100.0) / 12.0
    fator_composto = (1.0 + taxa_mensal) ** meses_efetivos

    valor_futuro = round(valor_gasto * fator_composto, 2)
    juros_perdidos = round(valor_futuro - valor_gasto, 2)

    return ReciboCustoOportunidade(
        descricao_gasto=descricao_gasto,
        valor_gasto=round(valor_gasto, 2),
        meta_impactada=meta_impactada,
        aporte_diario_meta=aporte_diario,
        dias_atraso=dias_atraso,
        meses_ate_alvo=meses_efetivos,
        taxa_anual_pct=round(taxa_anual_pct, 2),
        valor_futuro_perdido=valor_futuro,
        juros_perdidos=juros_perdidos,
    )


def simular_micro_habito(
    descricao: str,
    valor_ocorrencia: float,
    frequencia_mensal: int,
    taxa_anual_pct: float = 12.0,
) -> ProjecaoMicroHabito:
    """
    RF-07: Analisador de Micro-hábitos (Gasto Recorrente) em horizontes de 1, 5 e 10 anos.
    Utiliza a fórmula de Série Uniforme de Pagamentos (Juros Compostos):
      FV = PMT * (((1 + i)^n - 1) / i)
    """
    gasto_mensal = round(valor_ocorrencia * frequencia_mensal, 2)
    taxa_mensal = (taxa_anual_pct / 100.0) / 12.0

    def projetar_horizonte(anos: int) -> Dict[str, float]:
        meses = anos * 12
        total_desembolsado = round(gasto_mensal * meses, 2)
        if taxa_mensal > 0:
            montante_investido = round(
                gasto_mensal * (((1.0 + taxa_mensal) ** meses - 1.0) / taxa_mensal), 2
            )
        else:
            montante_investido = total_desembolsado
        rendimento_juros = round(montante_investido - total_desembolsado, 2)
        return {
            "meses": meses,
            "total_gasto_nominal": total_desembolsado,
            "montante_se_investido": montante_investido,
            "juros_compostos_ganhos": rendimento_juros,
        }

    return ProjecaoMicroHabito(
        descricao=descricao,
        gasto_mensal=gasto_mensal,
        taxa_anual_pct=round(taxa_anual_pct, 2),
        horizonte_1_ano=projetar_horizonte(1),
        horizonte_5_anos=projetar_horizonte(5),
        horizonte_10_anos=projetar_horizonte(10),
    )


class ConsultorFinanceiroIA:
    """
    RF-08: Motor Preditivo & Assistente de Inteligência Artificial Financeira.
    Avalia assimetria entre juros de dívidas e rentabilidade da carteira,
    cobertura da Reserva de Emergência e viabilidade de gastos livres.
    """

    @staticmethod
    def diagnosticar_carteira(
        usuario_nome: str,
        orcamento: ResultadoOrcamentoReverso,
        recibos: List[ReciboCustoOportunidade],
        possui_reserva_emergencia: bool,
        maior_juros_divida_mensal_pct: float = 0.0,
        rentabilidade_media_anual_pct: float = 12.0,
    ) -> Dict[str, Any]:
        recomendacoes: List[str] = []
        score_saude = 100

        if not possui_reserva_emergencia:
            score_saude -= 25
            recomendacoes.append(
                "PRIORIDADE #1 (Reserva de Emergência): Aloque seus aportes mensais em ativos "
                "de liquidez diária e baixo risco (Tesouro Selic ou CDB 100% CDI) até formar "
                "6 meses do seu custo de vida."
            )
        else:
            recomendacoes.append(
                "RESERVA ATIVA: Sua Reserva de Emergência está estruturada e protegendo seu "
                "patrimônio contra imprevistos."
            )

        if orcamento.teto_gastos_livres < 0:
            score_saude -= 35
            recomendacoes.append(
                f"ALERTA DE DÉFICIT: Suas obrigações e aportes superam a renda em "
                f"R$ {abs(orcamento.teto_gastos_livres):.2f}. renegocie custos fixos ou ajuste "
                f"temporariamente o aporte mensal."
            )
        elif orcamento.taxa_poupanca_pct >= 20.0:
            recomendacoes.append(
                f"EXCELÊNCIA EM PAY YOURSELF FIRST: Você está direcionando "
                f"{orcamento.taxa_poupanca_pct:.1f}% da sua renda diretamente para suas metas."
            )

        taxa_mensal_carteira = rentabilidade_media_anual_pct / 12.0
        if maior_juros_divida_mensal_pct > taxa_mensal_carteira:
            score_saude -= 20
            recomendacoes.append(
                f"ASSIMETRIA DE JUROS DETECTADA: Você possui dívida com juros de "
                f"{maior_juros_divida_mensal_pct:.2f}% a.m., superior ao rendimento médio da "
                f"carteira ({taxa_mensal_carteira:.2f}% a.m.). Priorize amortizar esta dívida!"
            )

        total_dias_atraso = sum(r.dias_atraso for r in recibos)
        total_futuro_perdido = round(sum(r.valor_futuro_perdido for r in recibos), 2)

        if total_dias_atraso > 15:
            score_saude -= 15
            recomendacoes.append(
                f"IMPACTO DE CUSTO DE OPORTUNIDADE: Seus gastos livres recentes adicionaram "
                f"{total_dias_atraso} dias de espera à sua meta principal (R$ {total_futuro_perdido:.2f} "
                f"em valor futuro)."
            )

        return {
            "usuario": usuario_nome,
            "data_analise": datetime.now().isoformat(timespec="seconds"),
            "score_saude_financeira": max(0, score_saude),
            "resumo_impacto": {
                "quantidade_gastos_livres": len(recibos),
                "total_dias_atraso_metas": total_dias_atraso,
                "total_valor_futuro_perdido": total_futuro_perdido,
            },
            "recomendacoes_ia": recomendacoes,
        }


def executar_simulacao_homologada(formato_json: bool = False) -> None:
    """
    Executa a bateria de cálculos homologada com o mesmo cenário do README / Oracle FIAP.
    """
    orcamento = calcular_orcamento_reverso(
        renda_mensal=5000.00,
        aportes_metas=1500.00,
        despesas_fixas=1800.00,
        parcelas_dividas=350.00,
    )

    recibo_costelinha = calcular_custo_oportunidade(
        descricao_gasto="Costelinha na brasa de sábado",
        valor_gasto=150.00,
        meta_impactada="Reserva de Emergência",
        aporte_mensal_meta=1500.00,
        taxa_anual_pct=12.00,
        meses_ate_alvo=24,
    )

    micro_habito_delivery = simular_micro_habito(
        descricao="Delivery por impulso (R$ 35,00 x 12x/mês)",
        valor_ocorrencia=35.00,
        frequencia_mensal=12,
        taxa_anual_pct=12.00,
    )

    diagnostico_ia = ConsultorFinanceiroIA.diagnosticar_carteira(
        usuario_nome="João Gabriel",
        orcamento=orcamento,
        recibos=[recibo_costelinha],
        possui_reserva_emergencia=True,
        maior_juros_divida_mensal_pct=1.99,
        rentabilidade_media_anual_pct=12.00,
    )

    relatorio_completo = {
        "orcamento_reverso": asdict(orcamento),
        "recibo_custo_oportunidade": asdict(recibo_costelinha),
        "simulacao_micro_habito": asdict(micro_habito_delivery),
        "diagnostico_consultor_ia": diagnostico_ia,
    }

    if formato_json:
        print(json.dumps(relatorio_completo, indent=2, ensure_ascii=False))
        return

    print("=" * 78)
    print("  THE OPPORTUNITY LEDGER — MOTOR PYTHON DE CUSTO DE OPORTUNIDADE & IA (FIAP)")
    print("=" * 78)
    print(f"\n[1] EQUAÇÃO DO ORÇAMENTO REVERSO (Pay Yourself First)")
    print(f"    (+) Renda Mensal Total .......: R$ {orcamento.renda_mensal:>10.2f}")
    print(f"    (-) Aportes p/ Metas ({orcamento.taxa_poupanca_pct:>4.1f}%) : R$ {orcamento.aportes_metas:>10.2f}")
    print(f"    (-) Custos Fixos & Dívidas ...: R$ {(orcamento.despesas_fixas + orcamento.parcelas_dividas):>10.2f}")
    print(f"    (=) TETO LIVRE PARA GASTAR ...: R$ {orcamento.teto_gastos_livres:>10.2f} [{orcamento.status_orcamento}]")

    print(f"\n[2] RECIBO DE CUSTO DE OPORTUNIDADE (Homologado c/ TransacaoService.java)")
    print(f"    Gasto Livre Registrado .......: {recibo_costelinha.descricao_gasto}")
    print(f"    Valor Presente (PV) ..........: R$ {recibo_costelinha.valor_gasto:.2f}")
    print(f"    Meta Prioritária Impactada ...: {recibo_costelinha.meta_impactada} (R$ {recibo_costelinha.aporte_diario_meta:.2f}/dia)")
    print(f"    Impacto em Prazo .............: +{recibo_costelinha.dias_atraso} DIAS DE ATRASO")
    print(f"    Valor Futuro Perdido (24m) ...: R$ {recibo_costelinha.valor_futuro_perdido:.2f} (Juros: R$ {recibo_costelinha.juros_perdidos:.2f})")

    print(f"\n[3] SIMULADOR DE MICRO-HÁBITOS ({micro_habito_delivery.descricao})")
    print(f"    Gasto Mensal Recorrente ......: R$ {micro_habito_delivery.gasto_mensal:.2f}/mês (Taxa: {micro_habito_delivery.taxa_anual_pct:.1f}% a.a.)")
    print(f"    -> Em  1 Ano  (12m) ..........: Gasto R$ {micro_habito_delivery.horizonte_1_ano['total_gasto_nominal']:>9.2f} | Investido: R$ {micro_habito_delivery.horizonte_1_ano['montante_se_investido']:>10.2f}")
    print(f"    -> Em  5 Anos (60m) ..........: Gasto R$ {micro_habito_delivery.horizonte_5_anos['total_gasto_nominal']:>9.2f} | Investido: R$ {micro_habito_delivery.horizonte_5_anos['montante_se_investido']:>10.2f}")
    print(f"    -> Em 10 Anos (120m) .........: Gasto R$ {micro_habito_delivery.horizonte_10_anos['total_gasto_nominal']:>9.2f} | Investido: R$ {micro_habito_delivery.horizonte_10_anos['montante_se_investido']:>10.2f}")

    print(f"\n[4] PARECER DO CONSULTOR FINANCEIRO IA (Score: {diagnostico_ia['score_saude_financeira']}/100)")
    for idx, rec in enumerate(diagnostico_ia["recomendacoes_ia"], start=1):
        print(f"    {idx}. {rec}")
    print("=" * 78)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Motor Python de Custo de Oportunidade & IA — Fintech Opportunity FIAP"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Exporta o relatório completo em formato JSON estruturado.",
    )
    args = parser.parse_args()
    executar_simulacao_homologada(formato_json=args.json)
