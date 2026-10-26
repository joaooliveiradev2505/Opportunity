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

import com.example.FintechFiap.model.Investimento;
import com.example.FintechFiap.service.InvestimentoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/investimentos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InvestimentoController {

    private final InvestimentoService investimentoService;

    @PostMapping("/usuario/{usuarioId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Investimento criar(@PathVariable String usuarioId, @RequestBody Investimento investimento) {
        return investimentoService.criar(usuarioId, investimento);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Investimento> listarPorUsuario(@PathVariable String usuarioId) {
        return investimentoService.listarPorUsuario(usuarioId);
    }

    @GetMapping("/{id}")
    public Investimento buscarPorId(@PathVariable String id) {
        return investimentoService.buscarPorId(id);
    }

    @PutMapping("/{id}/saldo")
    public Investimento atualizarSaldo(@PathVariable String id, @RequestBody Map<String, BigDecimal> body) {
        BigDecimal saldoAtual = body.get("saldoAtual");
        BigDecimal valorAporte = body.get("valorAporte");
        return investimentoService.atualizarSaldo(id, saldoAtual, valorAporte);
    }

    @PutMapping("/{id}")
    public Investimento atualizar(@PathVariable String id, @RequestBody Investimento investimento) {
        return investimentoService.atualizar(id, investimento);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable String id) {
        investimentoService.excluir(id);
    }

}