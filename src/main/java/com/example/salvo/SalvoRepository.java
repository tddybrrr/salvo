package com.example.salvo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import javax.persistence.Id;

@RepositoryRestResource
public interface SalvoRepository extends JpaRepository<Salvo, Long> {



}

