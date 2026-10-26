package com.example.FintechFiap.controller;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.FintechFiap.model.Usuario;
import com.example.FintechFiap.service.UsuarioService;

import lombok.RequiredArgsConstructor;

@RestController 
@RequestMapping("/api/auth")
@RequiredArgsConstructor 
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credenciais) {
        String email = credenciais.get("email");
        String senha = credenciais.get("senha");

        if (email == null || email.isBlank() || senha == null || senha.isBlank()) {
            throw new IllegalArgumentException("Informe o e-mail e a senha para entrar.");
        }

        Usuario usuario = usuarioService.autenticar(email.trim(), senha);

        String payloadJson = String.format(
            "{\"sub\":\"%s\",\"email\":\"%s\",\"iat\":%d}",
            usuario.getId(),
            usuario.getEmail(),
            Instant.now().getEpochSecond()
        );
        String token = Base64.getUrlEncoder()
            .withoutPadding()
            .encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));

        Map<String, Object> resposta = new LinkedHashMap<>();
        resposta.put("token", token);
        resposta.put("tipo", "Bearer");
        resposta.put("usuario", usuario);

        return ResponseEntity.ok(resposta);
    }
}
