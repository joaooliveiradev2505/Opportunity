package com.example.FintechFiap.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.FintechFiap.model.Investimento;
import com.example.FintechFiap.model.Usuario;
import com.example.FintechFiap.repository.InvestimentoRepository;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class InvestimentoService {
    private final InvestimentoRepository investimentoRepository;
    private final UsuarioService usuarioService;

    public Investimento criar(String usuarioId, Investimento investimento) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        investimento.setUsuario(usuario);
        return investimentoRepository.save(investimento);

    }
    public List<Investimento> listarPorUsuario(String usuarioId) {
        return investimentoRepository.findByUsuarioId(usuarioId);
    }
    public Investimento buscarPorId(String id) {
        return investimentoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("O usuário não possui esse investimento."));
    }
}
