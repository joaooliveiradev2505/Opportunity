package com.example.FintechFiap.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.FintechFiap.model.Divida;

@Repository 

public interface DividaRepository extends JpaRepository<Divida, String>{
    List<Divida> findByUsuarioId(String usuarioId);

    boolean existsByUsuarioId(String usuarioId);
}
