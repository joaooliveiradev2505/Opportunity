package com.example.FintechFiap.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.FintechFiap.model.Investimento;
import com.example.FintechFiap.service.InvestimentoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/investimentos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InvestimentoController {

    private final InvestimentoService InvestimentoService;

    @PostMapping("/usuario/{usuarioId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Investimento criar(@PathVariable String usuarioId, @RequestBody Investimento investimento) {
        return InvestimentoService.criar(usuarioId, investimento);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Investimento> listarPorUsuario(@PathVariable String usuarioId) {
        return InvestimentoService.listarPorUsuario(usuarioId);
    }

    @GetMapping("/{id}")
    public Investimento buscarPorId(@PathVariable String id) {
        return InvestimentoService.buscarPorId(id);
    }

}