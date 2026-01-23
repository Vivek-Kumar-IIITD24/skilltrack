package com.skilltrack.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.skilltrack.backend.entity.User;
import com.skilltrack.backend.repository.UserRepository; // ✅ New Import

@SpringBootApplication
public class SkilltrackBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SkilltrackBackendApplication.class, args);
	}

    // ✅ Inject PasswordEncoder to handle the encryption automatically
	@Bean
	CommandLineRunner run(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			try {
				// We use a NEW email to ensure a fresh start
				User admin = new User();
				admin.setEmail("manager@test.com"); 
				admin.setName("Manager User");
				admin.setRole("ADMIN");
				
                // ✅ This guarantees the password "password" will work
				admin.setPassword(passwordEncoder.encode("password")); 
				
				userRepository.save(admin);
				System.out.println("✅ MANAGER USER CREATED SUCCESSFULLY!");
			} catch (Exception e) {
				System.out.println("⚠️ User likely already exists. Skipping.");
			}
		};
	}
}