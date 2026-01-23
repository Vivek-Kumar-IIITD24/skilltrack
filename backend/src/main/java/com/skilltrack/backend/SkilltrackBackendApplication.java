package com.skilltrack.backend;

import com.skilltrack.backend.entity.User;
import com.skilltrack.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class SkilltrackBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SkilltrackBackendApplication.class, args);
	}

    // 1️⃣ THE DOOR OPENER (CORS) - Allows Vercel to talk to Render
	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/**")
						.allowedOrigins("*") // Allow ALL websites (including Vercel)
						.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
			}
		};
	}

    // 2️⃣ THE KEY MAKER (User Creator) - Creates your account automatically
	@Bean
	CommandLineRunner run(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			try {
                // Check if user exists to avoid duplicates
                if (userRepository.findByEmail("manager@test.com").isEmpty()) {
                    User admin = new User();
                    admin.setEmail("manager@test.com");
                    admin.setName("Manager User");
                    admin.setRole("ADMIN");
                    admin.setPassword(passwordEncoder.encode("password"));
                    
                    userRepository.save(admin);
                    System.out.println("✅ MANAGER USER CREATED SUCCESSFULLY!");
                } else {
                    System.out.println("⚠️ User already exists.");
                }
			} catch (Exception e) {
				System.out.println("⚠️ Error creating user: " + e.getMessage());
			}
		};
	}
}