package com.example.FintechFiap.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.FintechFiap.model.LogOportunidade;
import com.example.FintechFiap.model.Meta;
import com.example.FintechFiap.model.Usuario;
import com.example.FintechFiap.repository.LogOportunidadeRepository;
import com.example.FintechFiap.repository.MetaRepository;

import lombok.RequiredArgsConstructor;
@Service 
@RequiredArgsConstructor 
public class MetaService {

    private final MetaRepository metaRepository;
    private final UsuarioService usuarioService;
    private final LogOportunidadeRepository logOportunidadeRepository;

    public Meta criar(String usuarioId, Meta meta) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        meta.setUsuario(usuario);
        return metaRepository.save(meta);
    }
    public List<Meta> listarPorUsuario(String usuarioId) {
        return metaRepository.findByUsuarioIdOrderByPrioridadeAsc(usuarioId);
    }
    public Meta buscarPorId(String id) {
        return metaRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Meta não encontrada!"));
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
        metaRepository.deleteById(id);
    }
}
