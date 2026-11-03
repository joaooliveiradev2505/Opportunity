package com.example.FintechFiap.service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.FintechFiap.model.Divida;
import com.example.FintechFiap.model.StatusDivida;
import com.example.FintechFiap.model.Usuario;
import com.example.FintechFiap.repository.DividaRepository;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class DividaService {
    private final UsuarioService usuarioService;
    private final DividaRepository dividaRepository;

    @Transactional
    public Divida criar(String usuarioId, Divida divida) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        divida.setUsuario(usuario);
        if (divida.getParcelasPagas() == null) {
            divida.setParcelasPagas(0);
        }
        if (divida.getTotalParcelas() == null || divida.getTotalParcelas() < 1) {
            divida.setTotalParcelas(1);
        }
        if (divida.getDataVencimentoMensal() == null) {
            divida.setDataVencimentoMensal(LocalDate.now().plusMonths(1));
        }
        if (divida.getTaxaJurosAtraso() == null) {
            divida.setTaxaJurosAtraso(BigDecimal.ZERO);
        }
        if (divida.getStatusDivida() == null) {
            divida.setStatusDivida(StatusDivida.EM_DIA);
        }
        return dividaRepository.save(divida);
    }

    public List<Divida> listarPorUsuario(String usuarioId) {
        return dividaRepository.findByUsuarioId(usuarioId);
    }

    public Divida buscarPorId(String id) {
        return dividaRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Usuário não possui esta dívida."));
    }

    @Transactional
    public Divida pagarParcela(String id) {
        Divida divida = buscarPorId(id);
        int pagas = divida.getParcelasPagas() != null ? divida.getParcelasPagas() : 0;
        int total = divida.getTotalParcelas() != null ? divida.getTotalParcelas() : 1;

        if (pagas < total) {
            pagas++;
            divida.setParcelasPagas(pagas);
        }

        if (pagas >= total) {
            divida.setStatusDivida(StatusDivida.QUITADA);
        } else {
            divida.setStatusDivida(StatusDivida.EM_DIA);
            if (divida.getDataVencimentoMensal() != null) {
                divida.setDataVencimentoMensal(divida.getDataVencimentoMensal().plusMonths(1));
            }
        }
        return dividaRepository.save(divida);
    }

    @Transactional
    public Divida atualizar(String id, Divida dados) {
        Divida divida = buscarPorId(id);
        if (dados.getDescricaoDivida() != null) divida.setDescricaoDivida(dados.getDescricaoDivida());
        if (dados.getValorTotal() != null) divida.setValorTotal(dados.getValorTotal());
        if (dados.getValorParcela() != null) divida.setValorParcela(dados.getValorParcela());
        if (dados.getTotalParcelas() != null) divida.setTotalParcelas(dados.getTotalParcelas());
        if (dados.getParcelasPagas() != null) divida.setParcelasPagas(dados.getParcelasPagas());
        if (dados.getDataVencimentoMensal() != null) divida.setDataVencimentoMensal(dados.getDataVencimentoMensal());
        if (dados.getTaxaJurosAtraso() != null) divida.setTaxaJurosAtraso(dados.getTaxaJurosAtraso());
        if (dados.getStatusDivida() != null) divida.setStatusDivida(dados.getStatusDivida());
        return dividaRepository.save(divida);
    }

    @Transactional
    public void excluir(String id) {
        Divida divida = buscarPorId(id);
        dividaRepository.delete(divida);
    }
}
