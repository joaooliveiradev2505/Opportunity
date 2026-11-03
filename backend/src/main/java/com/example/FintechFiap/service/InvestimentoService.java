package com.example.FintechFiap.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.FintechFiap.model.Investimento;
import com.example.FintechFiap.model.Usuario;
import com.example.FintechFiap.repository.InvestimentoRepository;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class InvestimentoService {
    private final InvestimentoRepository investimentoRepository;
    private final UsuarioService usuarioService;

    @Transactional
    public Investimento criar(String usuarioId, Investimento investimento) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        investimento.setUsuario(usuario);
        if (investimento.getValorInvestido() == null) {
            investimento.setValorInvestido(BigDecimal.ZERO);
        }
        if (investimento.getSaldoAtual() == null || investimento.getSaldoAtual().compareTo(BigDecimal.ZERO) == 0) {
            investimento.setSaldoAtual(investimento.getValorInvestido());
        }
        if (investimento.getDataAplicacao() == null) {
            investimento.setDataAplicacao(LocalDate.now());
        }
        if (investimento.getIsentoIR() == null) {
            investimento.setIsentoIR(false);
        }
        if (investimento.getRisco() == null || investimento.getRisco().isBlank()) {
            investimento.setRisco("BAIXO");
        }
        if (investimento.getLiquidez() == null || investimento.getLiquidez().isBlank()) {
            investimento.setLiquidez("ALTA");
        }
        return investimentoRepository.save(investimento);
    }

    public List<Investimento> listarPorUsuario(String usuarioId) {
        return investimentoRepository.findByUsuarioId(usuarioId);
    }

    public Investimento buscarPorId(String id) {
        return investimentoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("O usuário não possui esse investimento."));
    }

    @Transactional
    public Investimento atualizarSaldo(String id, BigDecimal novoSaldo, BigDecimal valorAporte) {
        Investimento inv = buscarPorId(id);
        BigDecimal saldoAtual = inv.getSaldoAtual() != null ? inv.getSaldoAtual() : BigDecimal.ZERO;
        BigDecimal valorInvestido = inv.getValorInvestido() != null ? inv.getValorInvestido() : BigDecimal.ZERO;

        if (valorAporte != null && valorAporte.compareTo(BigDecimal.ZERO) != 0) {
            BigDecimal calculado = saldoAtual.add(valorAporte);
            inv.setSaldoAtual(calculado.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : calculado);
            if (valorAporte.compareTo(BigDecimal.ZERO) > 0) {
                inv.setValorInvestido(valorInvestido.add(valorAporte));
            }
        } else if (novoSaldo != null) {
            inv.setSaldoAtual(novoSaldo.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : novoSaldo);
        }
        return investimentoRepository.save(inv);
    }

    @Transactional
    public Investimento atualizar(String id, Investimento dados) {
        Investimento inv = buscarPorId(id);
        if (dados.getNomeAtivo() != null) inv.setNomeAtivo(dados.getNomeAtivo());
        if (dados.getModalidade() != null) inv.setModalidade(dados.getModalidade());
        if (dados.getTipoProduto() != null) inv.setTipoProduto(dados.getTipoProduto());
        if (dados.getValorInvestido() != null) inv.setValorInvestido(dados.getValorInvestido());
        if (dados.getSaldoAtual() != null) inv.setSaldoAtual(dados.getSaldoAtual());
        if (dados.getRisco() != null) inv.setRisco(dados.getRisco());
        if (dados.getLiquidez() != null) inv.setLiquidez(dados.getLiquidez());
        if (dados.getIsentoIR() != null) inv.setIsentoIR(dados.getIsentoIR());
        return investimentoRepository.save(inv);
    }

    @Transactional
    public void excluir(String id) {
        Investimento inv = buscarPorId(id);
        investimentoRepository.delete(inv);
    }
}
