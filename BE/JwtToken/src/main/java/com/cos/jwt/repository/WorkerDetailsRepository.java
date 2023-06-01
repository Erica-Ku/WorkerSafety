package com.cos.jwt.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cos.jwt.domain.WorkerDetails;

public interface WorkerDetailsRepository extends JpaRepository<WorkerDetails, Integer> {
	public List<WorkerDetails> findByNo(Integer no);
	//List<WorkerDetails> findAllByOrderByTime(LocalTime time);
}