package com.example.FintechFiap.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.FintechFiap.model.Transacao;

@Repository 
public interface TransacaoRepository extends JpaRepository<Transacao, String> {

    List<Transacao> findByUsuarioId(String usuarioId);
    
    boolean existsByUsuarioId(String usuarioId);
}
