package com.example.FintechFiap.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.FintechFiap.model.LogOportunidade;
import com.example.FintechFiap.model.Meta;
import com.example.FintechFiap.model.TipoTransacao;
import com.example.FintechFiap.model.Transacao;
import com.example.FintechFiap.model.Usuario;
import com.example.FintechFiap.repository.LogOportunidadeRepository;
import com.example.FintechFiap.repository.MetaRepository;
import com.example.FintechFiap.repository.TransacaoRepository;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class TransacaoService {
    
    private final TransacaoRepository transacaoRepository;
    private final UsuarioService usuariosService;
    private final MetaRepository metaRepository;
    private final LogOportunidadeRepository logOportunidadeRepository;

    @Transactional
    public Transacao criar(String usuarioId, Transacao transacao) {
        Usuario usuario = usuariosService.buscarPorId(usuarioId);
        transacao.setUsuario(usuario);
        if (transacao.getDataTransacao() == null) {
            transacao.setDataTransacao(LocalDate.now());
        }
        if (transacao.getCategoria() == null || transacao.getCategoria().isBlank()) {
            transacao.setCategoria("GERAL");
        }
        Transacao transacaoSalva = transacaoRepository.save(transacao);

        if (transacaoSalva.getTipoTransacao() == TipoTransacao.GASTO_LIVRE) {
            gerarLogCustoOportunidade(usuarioId, transacaoSalva);
        } else if (transacaoSalva.getTipoTransacao() == TipoTransacao.APORTE_META) {
            aplicarAporteNaMetaPrincipal(usuarioId, transacaoSalva.getValorTransacao());
        }
        return transacaoSalva;
    }

    public List<Transacao> listarPorUsuario(String usuarioId) {
        return transacaoRepository.findByUsuarioId(usuarioId);
    }

    public List<LogOportunidade> listarLogsPorUsuario(String usuarioId) {
        return logOportunidadeRepository.findByTransacaoUsuarioId(usuarioId);
    }

    @Transactional
    public Transacao atualizar(String transacaoId, Transacao dados) {
        Transacao transacao = transacaoRepository.findById(transacaoId)
            .orElseThrow(() -> new IllegalArgumentException("Transação não encontrada!"));
        if (dados.getDescricao() != null) transacao.setDescricao(dados.getDescricao());
        if (dados.getValorTransacao() != null) transacao.setValorTransacao(dados.getValorTransacao());
        if (dados.getTipoTransacao() != null) transacao.setTipoTransacao(dados.getTipoTransacao());
        if (dados.getCategoria() != null) transacao.setCategoria(dados.getCategoria());
        if (dados.getDataTransacao() != null) transacao.setDataTransacao(dados.getDataTransacao());
        return transacaoRepository.save(transacao);
    }

    @Transactional
    public void excluirLogOportunidade(String logId) {
        LogOportunidade log = logOportunidadeRepository.findById(logId)
            .orElseThrow(() -> new IllegalArgumentException("Recibo de custo de oportunidade não encontrado!"));
        String transacaoId = log.getTransacao() != null ? log.getTransacao().getId() : null;
        logOportunidadeRepository.delete(log);
        logOportunidadeRepository.flush();
        if (transacaoId != null && transacaoRepository.existsById(transacaoId)) {
            transacaoRepository.deleteById(transacaoId);
        }
    }

    @Transactional
    public void excluirTransacao(String transacaoId) {
        Transacao transacao = transacaoRepository.findById(transacaoId)
            .orElseThrow(() -> new IllegalArgumentException("Transação não encontrada!"));

        if (transacao.getTipoTransacao() == TipoTransacao.APORTE_META && transacao.getUsuario() != null) {
            estornarAporteDaMetaPrincipal(transacao.getUsuario().getId(), transacao.getValorTransacao());
        }

        List<LogOportunidade> logs = logOportunidadeRepository.findByTransacaoId(transacaoId);
        if (!logs.isEmpty()) {
            logOportunidadeRepository.deleteAll(logs);
            logOportunidadeRepository.flush();
        }
        transacaoRepository.delete(transacao);
    }

    private void aplicarAporteNaMetaPrincipal(String usuarioId, BigDecimal valorAporte) {
        if (valorAporte == null || valorAporte.compareTo(BigDecimal.ZERO) <= 0) return;
        List<Meta> metas = metaRepository.findByUsuarioIdOrderByPrioridadeAsc(usuarioId);
        if (metas.isEmpty()) return;

        Meta metaPrincipal = metas.get(0);
        BigDecimal atual = metaPrincipal.getValorAtual() != null ? metaPrincipal.getValorAtual() : BigDecimal.ZERO;
        metaPrincipal.setValorAtual(atual.add(valorAporte));
        metaRepository.save(metaPrincipal);
    }

    private void estornarAporteDaMetaPrincipal(String usuarioId, BigDecimal valorEstorno) {
        if (valorEstorno == null || valorEstorno.compareTo(BigDecimal.ZERO) <= 0) return;
        List<Meta> metas = metaRepository.findByUsuarioIdOrderByPrioridadeAsc(usuarioId);
        if (metas.isEmpty()) return;

        Meta metaPrincipal = metas.get(0);
        BigDecimal atual = metaPrincipal.getValorAtual() != null ? metaPrincipal.getValorAtual() : BigDecimal.ZERO;
        BigDecimal novoValor = atual.subtract(valorEstorno);
        metaPrincipal.setValorAtual(novoValor.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : novoValor);
        metaRepository.save(metaPrincipal);
    }

    private void gerarLogCustoOportunidade(String usuarioId, Transacao gasto) {
        List<Meta> metas = metaRepository.findByUsuarioIdOrderByPrioridadeAsc(usuarioId);
        if (metas.isEmpty()) {
            return;
        }

        Meta metaPrincipal = metas.get(0);

        BigDecimal aporteDiario = metaPrincipal.getAporteMensal()
            .divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);

        int diasAtraso = gasto.getValorTransacao()
            .divide(aporteDiario, 0, RoundingMode.CEILING)
            .intValue();

        long mesesAteAlvo = Math.max(1, ChronoUnit.MONTHS.between(LocalDate.now(), metaPrincipal.getDataAlvo()));
        double taxaMensal = metaPrincipal.getTaxaRendimentoAnual().doubleValue() / 100.0 / 12.0;
        double fatorComposto = Math.pow(1.0 + taxaMensal, mesesAteAlvo);

        BigDecimal valorFuturoPerdido = gasto.getValorTransacao()
            .multiply(BigDecimal.valueOf(fatorComposto))
            .setScale(2, RoundingMode.HALF_UP);

        LogOportunidade log = new LogOportunidade();
        log.setTransacao(gasto);
        log.setMetaImpactada(metaPrincipal);
        log.setDiasAtraso(diasAtraso);
        log.setValorFuturoPerdido(valorFuturoPerdido);

        logOportunidadeRepository.save(log);
    }
}
