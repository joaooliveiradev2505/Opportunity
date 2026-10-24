package com.example.FintechFiap.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.FintechFiap.model.LogOportunidade;

@Repository 
public interface LogOportunidadeRepository extends JpaRepository<LogOportunidade, String> {
    List<LogOportunidade> findByMetaImpactadaId(String metaId);

    List<LogOportunidade> findByTransacaoUsuarioId(String usuarioId);
    
}
