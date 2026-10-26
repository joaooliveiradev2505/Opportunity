package com.example.FintechFiap;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.FintechFiap.model.Divida;
import com.example.FintechFiap.model.LogOportunidade;
import com.example.FintechFiap.model.Meta;
import com.example.FintechFiap.model.StatusDivida;
import com.example.FintechFiap.model.TipoTransacao;
import com.example.FintechFiap.model.Transacao;
import com.example.FintechFiap.model.Usuario;
import com.example.FintechFiap.repository.DividaRepository;
import com.example.FintechFiap.repository.LogOportunidadeRepository;
import com.example.FintechFiap.repository.MetaRepository;
import com.example.FintechFiap.repository.TransacaoRepository;
import com.example.FintechFiap.repository.UsuarioRepository;
import com.example.FintechFiap.service.DividaService;
import com.example.FintechFiap.service.TransacaoService;
import com.example.FintechFiap.service.UsuarioService;

@ExtendWith(MockitoExtension.class)
class FintechFiapApplicationTests {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private TransacaoRepository transacaoRepository;

    @Mock
    private MetaRepository metaRepository;

    @Mock
    private LogOportunidadeRepository logOportunidadeRepository;

    @Mock
    private DividaRepository dividaRepository;

    @Mock
    private UsuarioService usuarioServiceMock;

    @InjectMocks
    private UsuarioService usuarioService;

    @InjectMocks
    private TransacaoService transacaoService;

    @InjectMocks
    private DividaService dividaService;

    @Test
    @DisplayName("RF-01 / RNF-06: Deve criptografar a senha com BCrypt ao cadastrar novo usuário")
    void deveCriptografarSenhaComBCryptAoCadastrarUsuario() {
        Usuario novoUsuario = new Usuario();
        novoUsuario.setNome("João Gabriel");
        novoUsuario.setEmail("joao@opportunity.com.br");
        novoUsuario.setSenhaHash("123456");

        when(usuarioRepository.existsByEmail("joao@opportunity.com.br")).thenReturn(false);
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        Usuario salvo = usuarioService.cadastrar(novoUsuario);

        assertNotNull(salvo.getSenhaHash());
        assertTrue(salvo.getSenhaHash().startsWith("$2a$") || salvo.getSenhaHash().startsWith("$2b$"),
                "A senha salva deve estar criptografada no formato BCrypt");
    }

    @Test
    @DisplayName("RF-01 / RNF-06: Deve autenticar usuário com senha válida e recusar senha incorreta")
    void deveAutenticarUsuarioComBCryptEBloquearSenhaIncorreta() {
        Usuario usuario = new Usuario();
        usuario.setEmail("joao@opportunity.com.br");
        usuario.setSenhaHash("123456");

        when(usuarioRepository.existsByEmail("joao@opportunity.com.br")).thenReturn(false);
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));
        Usuario usuarioComHash = usuarioService.cadastrar(usuario);

        when(usuarioRepository.findByEmail("joao@opportunity.com.br")).thenReturn(Optional.of(usuarioComHash));

        Usuario autenticado = usuarioService.autenticar("joao@opportunity.com.br", "123456");
        assertEquals("joao@opportunity.com.br", autenticado.getEmail());

        assertThrows(IllegalArgumentException.class,
                () -> usuarioService.autenticar("joao@opportunity.com.br", "senha_errada"),
                "Deve lançar erro ao informar senha incorreta");
    }

    @Test
    @DisplayName("RF-06: Deve calcular Custo de Oportunidade (3 dias de atraso e R$ 190,46 em 24m) ao registrar GASTO_LIVRE")
    void deveCalcularCustoDeOportunidadeCorretamenteEmGastoLivre() {
        String usuarioId = "user-uuid-1";
        Usuario usuario = new Usuario();
        usuario.setId(usuarioId);

        Meta metaPrincipal = new Meta();
        metaPrincipal.setId("meta-uuid-1");
        metaPrincipal.setMeta("Reserva de Emergência");
        metaPrincipal.setAporteMensal(new BigDecimal("1500.00"));
        metaPrincipal.setTaxaRendimentoAnual(new BigDecimal("12.00"));
        metaPrincipal.setDataAlvo(LocalDate.now().plusMonths(24));
        metaPrincipal.setPrioridade(1);

        Transacao gasto = new Transacao();
        gasto.setId("tx-uuid-1");
        gasto.setDescricao("Costelinha na brasa de sábado");
        gasto.setValorTransacao(new BigDecimal("150.00"));
        gasto.setTipoTransacao(TipoTransacao.GASTO_LIVRE);

        when(usuarioServiceMock.buscarPorId(usuarioId)).thenReturn(usuario);
        when(transacaoRepository.save(any(Transacao.class))).thenAnswer(inv -> inv.getArgument(0));
        when(metaRepository.findByUsuarioIdOrderByPrioridadeAsc(usuarioId)).thenReturn(List.of(metaPrincipal));

        transacaoService.criar(usuarioId, gasto);

        ArgumentCaptor<LogOportunidade> logCaptor = ArgumentCaptor.forClass(LogOportunidade.class);
        verify(logOportunidadeRepository).save(logCaptor.capture());

        LogOportunidade logGerado = logCaptor.getValue();
        assertEquals(3, logGerado.getDiasAtraso(), "R$ 150,00 com aporte diário de R$ 50,00 deve gerar 3 dias de atraso");
        assertEquals(new BigDecimal("190.46"), logGerado.getValorFuturoPerdido(),
                "FV = 150 * (1 + 0.01)^24 deve resultar em R$ 190,46");
    }

    @Test
    @DisplayName("RF-02: Deve somar e estornar automaticamente APORTE_META no saldo da Meta Prioridade #1")
    void deveSomarEEstornarAporteAutomaticamenteNaMetaPrincipal() {
        String usuarioId = "user-uuid-1";
        Usuario usuario = new Usuario();
        usuario.setId(usuarioId);

        Meta metaPrincipal = new Meta();
        metaPrincipal.setId("meta-uuid-1");
        metaPrincipal.setValorAtual(new BigDecimal("3000.00"));
        metaPrincipal.setPrioridade(1);

        Transacao aporte = new Transacao();
        aporte.setId("tx-aporte-1");
        aporte.setUsuario(usuario);
        aporte.setValorTransacao(new BigDecimal("500.00"));
        aporte.setTipoTransacao(TipoTransacao.APORTE_META);

        when(usuarioServiceMock.buscarPorId(usuarioId)).thenReturn(usuario);
        when(transacaoRepository.save(any(Transacao.class))).thenReturn(aporte);
        when(metaRepository.findByUsuarioIdOrderByPrioridadeAsc(usuarioId)).thenReturn(List.of(metaPrincipal));

        transacaoService.criar(usuarioId, aporte);
        assertEquals(new BigDecimal("3500.00"), metaPrincipal.getValorAtual(),
                "O aporte deve somar R$ 500,00 ao saldo atual da meta principal");

        when(transacaoRepository.findById("tx-aporte-1")).thenReturn(Optional.of(aporte));
        when(logOportunidadeRepository.findByTransacaoId("tx-aporte-1")).thenReturn(List.of());

        transacaoService.excluirTransacao("tx-aporte-1");
        assertEquals(new BigDecimal("3000.00"), metaPrincipal.getValorAtual(),
                "A exclusão do aporte deve estornar os R$ 500,00 da meta principal");
    }

    @Test
    @DisplayName("RF-03: Deve incrementar parcelas pagas e quitar a dívida ao pagar a última parcela")
    void devePagarParcelaEQuitarDividaNaUltimaParcela() {
        Divida divida = new Divida();
        divida.setId("div-uuid-1");
        divida.setDescricaoDivida("Financiamento Notebook");
        divida.setTotalParcelas(10);
        divida.setParcelasPagas(9);
        divida.setStatusDivida(StatusDivida.EM_DIA);

        when(dividaRepository.findById("div-uuid-1")).thenReturn(Optional.of(divida));
        when(dividaRepository.save(any(Divida.class))).thenAnswer(inv -> inv.getArgument(0));

        Divida atualizada = dividaService.pagarParcela("div-uuid-1");

        assertEquals(10, atualizada.getParcelasPagas());
        assertEquals(StatusDivida.QUITADA, atualizada.getStatusDivida(),
                "Ao atingir a última parcela (10/10), o status deve mudar para QUITADA");
    }
}
