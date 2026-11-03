package com.example.FintechFiap.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.FintechFiap.model.Meta;
@Repository 
public interface MetaRepository extends JpaRepository<Meta, String> {

    List<Meta> findByUsuarioId(String usuarioId);

    List<Meta> findByUsuarioIdOrderByPrioridadeAsc(String usuarioId);

    boolean existsByUsuarioId(String usuarioId);
    
    
}
