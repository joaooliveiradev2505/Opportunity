package com.example.FintechFiap.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.FintechFiap.model.Investimento;

@Repository 
public interface InvestimentoRepository extends JpaRepository<Investimento, String>{
    List<Investimento> findByUsuarioId(String usuarioId);

    boolean existsByUsuarioId(String usuarioId);
    
}
