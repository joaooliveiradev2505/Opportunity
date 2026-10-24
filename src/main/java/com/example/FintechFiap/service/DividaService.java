package com.example.FintechFiap.service;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.FintechFiap.model.Divida;
import com.example.FintechFiap.model.Usuario;
import com.example.FintechFiap.repository.DividaRepository;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class DividaService {
    private final UsuarioService usuarioService;
    private final DividaRepository dividaRepository;

    public Divida criar(String usuarioId, Divida divida) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        divida.setUsuario(usuario);
        return dividaRepository.save(divida);
    }
    public List<Divida> listarPorUsuario(String usuarioId) {
        return dividaRepository.findByUsuarioId(usuarioId);
    }
    public Divida buscarPorId(String id) {
        return dividaRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Usuario não possui esta dívida."));
    }
    
}
