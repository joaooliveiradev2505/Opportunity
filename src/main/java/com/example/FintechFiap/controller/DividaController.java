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

import com.example.FintechFiap.model.Divida;
import com.example.FintechFiap.service.DividaService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dividas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DividaController {

    private final DividaService dividaService;

    @PostMapping("/usuario/{usuarioId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Divida criar(@PathVariable String usuarioId, @RequestBody Divida divida) {
        return dividaService.criar(usuarioId, divida);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Divida> listarPorUsuario(@PathVariable String usuarioId) {
        return dividaService.listarPorUsuario(usuarioId);
    }

    @GetMapping("/{id}")
    public Divida buscarPorId(@PathVariable String id) {
        return dividaService.buscarPorId(id);
    }

}