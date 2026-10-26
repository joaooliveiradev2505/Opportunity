package com.example.FintechFiap.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.example.FintechFiap.model.Usuario;
import com.example.FintechFiap.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
@Service 
@RequiredArgsConstructor 
public class UsuarioService {
    
    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Usuario cadastrar(Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com esse e-mail!");
        }
        usuario.setSenhaHash(passwordEncoder.encode(usuario.getSenhaHash()));
        return usuarioRepository.save(usuario);
    }

    public Usuario buscarPorId(String id) {
        return usuarioRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Usuario atualizar(String id, Usuario dados) {
        Usuario usuario = buscarPorId(id);
        if (dados.getNome() != null) usuario.setNome(dados.getNome());
        if (dados.getRenda() != null) usuario.setRenda(dados.getRenda());
        if (dados.getRendaVariavel() != null) usuario.setRendaVariavel(dados.getRendaVariavel());
        if (dados.getPerfilInvestidor() != null) usuario.setPerfilInvestidor(dados.getPerfilInvestidor());
        if (dados.getDiaFechamento() != null) usuario.setDiaFechamento(dados.getDiaFechamento());
        if (dados.getSexo() != null) usuario.setSexo(dados.getSexo());
        if (dados.getDataNascimento() != null) usuario.setDataNascimento(dados.getDataNascimento());
        return usuarioRepository.save(usuario);
    }

    public Usuario autenticar(String email, String senha) {
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("E-mail ou senha inválidos!"));
        
        String hashSalvo = usuario.getSenhaHash() != null ? usuario.getSenhaHash() : "";
        boolean senhaValida;

        if (hashSalvo.startsWith("$2a$") || hashSalvo.startsWith("$2b$")) {
            senhaValida = passwordEncoder.matches(senha, hashSalvo);
        } else {
            senhaValida = hashSalvo.equals(senha);
            if (senhaValida) {
                usuario.setSenhaHash(passwordEncoder.encode(senha));
                usuarioRepository.save(usuario);
            }
        }

        if (!senhaValida) {
            throw new IllegalArgumentException("E-mail ou senha inválidos!");
        }
        return usuario;
    }

}
