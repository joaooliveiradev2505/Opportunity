package com.example.FintechFiap.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.FintechFiap.model.Meta;
import com.example.FintechFiap.service.MetaService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/metas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MetaController {

    private final MetaService metaService;

    @PostMapping("/usuario/{usuarioId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Meta criar(@PathVariable String usuarioId, @RequestBody Meta meta) {
        return metaService.criar(usuarioId, meta);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Meta> listarPorUsuario(@PathVariable String usuarioId) {
        return metaService.listarPorUsuario(usuarioId);
    }

    @GetMapping("/{id}")
    public Meta buscarPorId(@PathVariable String id) {
        return metaService.buscarPorId(id);
    }

    @PutMapping("/{id}/priorizar")
    public List<Meta> priorizar(@PathVariable String id) {
        return metaService.priorizarMeta(id);
    }

    @PutMapping("/{id}/aporte")
    public Meta adicionarAporte(@PathVariable String id, @RequestBody Map<String, BigDecimal> body) {
        BigDecimal valor = body.getOrDefault("valor", BigDecimal.ZERO);
        return metaService.adicionarAporte(id, valor);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable String id) {
        metaService.excluirMeta(id);
    }

}