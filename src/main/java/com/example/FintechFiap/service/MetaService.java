package com.example.FintechFiap.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.FintechFiap.model.Investimento;
import com.example.FintechFiap.model.LogOportunidade;
import com.example.FintechFiap.model.Meta;
import com.example.FintechFiap.model.Usuario;
import com.example.FintechFiap.repository.InvestimentoRepository;
import com.example.FintechFiap.repository.LogOportunidadeRepository;
import com.example.FintechFiap.repository.MetaRepository;

import lombok.RequiredArgsConstructor;
@Service 
@RequiredArgsConstructor 
public class MetaService {

    private final MetaRepository metaRepository;
    private final UsuarioService usuarioService;
    private final LogOportunidadeRepository logOportunidadeRepository;
    private final InvestimentoRepository investimentoRepository;

    @Transactional
    public Meta criar(String usuarioId, Meta meta) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        meta.setUsuario(usuario);
        if (meta.getValorAtual() == null) {
            meta.setValorAtual(BigDecimal.ZERO);
        }
        if (meta.getPrioridade() == null) {
            meta.setPrioridade(1);
        }
        if (meta.getTaxaRendimentoAnual() == null) {
            meta.setTaxaRendimentoAnual(BigDecimal.valueOf(12.0));
        }
        if (meta.getReservaEmergencia() == null) {
            meta.setReservaEmergencia(false);
        }
        if (meta.getDataAlvo() == null) {
            meta.setDataAlvo(LocalDate.now().plusYears(1));
        }
        if (meta.getCriadoEm() == null) {
            meta.setCriadoEm(LocalDateTime.now());
        }
        return metaRepository.save(meta);
    }
    public List<Meta> listarPorUsuario(String usuarioId) {
        return metaRepository.findByUsuarioIdOrderByPrioridadeAsc(usuarioId);
    }
    public Meta buscarPorId(String id) {
        return metaRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Meta não encontrada!"));
    }

    @Transactional
    public Meta atualizar(String id, Meta dados) {
        Meta meta = buscarPorId(id);
        if (dados.getMeta() != null) meta.setMeta(dados.getMeta());
        if (dados.getValorAlvo() != null) meta.setValorAlvo(dados.getValorAlvo());
        if (dados.getValorAtual() != null) meta.setValorAtual(dados.getValorAtual());
        if (dados.getAporteMensal() != null) meta.setAporteMensal(dados.getAporteMensal());
        if (dados.getDataAlvo() != null) meta.setDataAlvo(dados.getDataAlvo());
        if (dados.getPrioridade() != null) meta.setPrioridade(dados.getPrioridade());
        if (dados.getTaxaRendimentoAnual() != null) meta.setTaxaRendimentoAnual(dados.getTaxaRendimentoAnual());
        if (dados.getReservaEmergencia() != null) meta.setReservaEmergencia(dados.getReservaEmergencia());
        return metaRepository.save(meta);
    }

    public List<Meta> priorizarMeta(String id) {
        Meta metaEscolhida = buscarPorId(id);
        String usuarioId = metaEscolhida.getUsuario().getId();
        List<Meta> metasUsuario = metaRepository.findByUsuarioIdOrderByPrioridadeAsc(usuarioId);

        int ordem = 2;
        for (Meta m : metasUsuario) {
            if (m.getId().equals(metaEscolhida.getId())) {
                m.setPrioridade(1);
            } else {
                m.setPrioridade(ordem++);
            }
        }
        metaRepository.saveAll(metasUsuario);
        return metaRepository.findByUsuarioIdOrderByPrioridadeAsc(usuarioId);
    }

    public Meta adicionarAporte(String id, BigDecimal valorAporte) {
        Meta meta = buscarPorId(id);
        BigDecimal atual = meta.getValorAtual() != null ? meta.getValorAtual() : BigDecimal.ZERO;
        meta.setValorAtual(atual.add(valorAporte));
        return metaRepository.save(meta);
    }

    @Transactional
    public void excluirMeta(String id) {
        List<LogOportunidade> logs = logOportunidadeRepository.findByMetaImpactadaId(id);
        if (!logs.isEmpty()) {
            for (LogOportunidade log : logs) {
                log.setMetaImpactada(null);
            }
            logOportunidadeRepository.saveAll(logs);
            logOportunidadeRepository.flush();
        }
        List<Investimento> investimentos = investimentoRepository.findByMetaId(id);
        if (!investimentos.isEmpty()) {
            for (Investimento inv : investimentos) {
                inv.setMeta(null);
            }
            investimentoRepository.saveAll(investimentos);
            investimentoRepository.flush();
        }
        metaRepository.deleteById(id);
    }
}
