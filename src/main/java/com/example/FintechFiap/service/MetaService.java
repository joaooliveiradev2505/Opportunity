package com.example.FintechFiap.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.FintechFiap.model.Meta;
import com.example.FintechFiap.model.Usuario;
import com.example.FintechFiap.repository.MetaRepository;

import lombok.RequiredArgsConstructor;
@Service 
@RequiredArgsConstructor 
public class MetaService {

    private final MetaRepository metaRepository;
    private final UsuarioService usuarioService;

    public Meta criar(String usuarioId, Meta meta) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        meta.setUsuario(usuario);
        return metaRepository.save(meta);
    }
    public List<Meta> listarPorUsuario(String usuarioId) {
        return metaRepository.findByUsuarioId(usuarioId);
    }
    public Meta buscarPorId(String id) {
        return metaRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Meta não encontrada!"));
    }
}
