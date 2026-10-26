package com.example.FintechFiap.controller;

import java.util.List;

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

import com.example.FintechFiap.model.LogOportunidade;
import com.example.FintechFiap.model.Transacao;
import com.example.FintechFiap.service.TransacaoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/transacoes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransacaoController {

    private final TransacaoService transacaoService;

    @PostMapping("/usuario/{usuarioId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Transacao criar(@PathVariable String usuarioId, @RequestBody Transacao transacao) {
        return transacaoService.criar(usuarioId, transacao);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Transacao> listarPorUsuario(@PathVariable String usuarioId) {
        return transacaoService.listarPorUsuario(usuarioId);
    }

    @GetMapping("/usuario/{usuarioId}/custos-oportunidade")
    public List<LogOportunidade> listarLogsPorUsuario(@PathVariable String usuarioId) {
        return transacaoService.listarLogsPorUsuario(usuarioId);
    }

    @PutMapping("/{transacaoId}")
    public Transacao atualizar(@PathVariable String transacaoId, @RequestBody Transacao transacao) {
        return transacaoService.atualizar(transacaoId, transacao);
    }

    @DeleteMapping("/custos-oportunidade/{logId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirLogOportunidade(@PathVariable String logId) {
        transacaoService.excluirLogOportunidade(logId);
    }

    @DeleteMapping("/{transacaoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirTransacao(@PathVariable String transacaoId) {
        transacaoService.excluirTransacao(transacaoId);
    }

}