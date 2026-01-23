package com.skilltrack.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.skilltrack.backend.entity.User;
import com.skilltrack.backend.repository.UserRepository;

@SpringBootApplication
public class SkilltrackBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SkilltrackBackendApplication.class, args);
	}

    // ✅ THIS IS THE NEW MAGIC PART
	@Bean
	CommandLineRunner run(UserRepository userRepository) {
		return args -> {
			try {
				User admin = new User();
				admin.setEmail("admin@test.com");
				admin.setName("Admin User");
				admin.setRole("ADMIN");
                // "password" encrypted
				admin.setPassword("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG"); 
				
				userRepository.save(admin);
				System.out.println("✅ ADMIN USER CREATED SUCCESSFULLY!");
			} catch (Exception e) {
				System.out.println("⚠️ Admin user likely already exists. Skipping.");
			}
		};
	}
}