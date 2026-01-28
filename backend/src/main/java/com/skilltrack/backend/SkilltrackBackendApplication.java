package com.skilltrack.backend;

import com.skilltrack.backend.entity.Role;
import com.skilltrack.backend.entity.User;
import com.skilltrack.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Optional;

@SpringBootApplication
public class SkilltrackBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(SkilltrackBackendApplication.class, args);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }

    // ✅ UPDATED: Safer Startup Script (No Deletion)
    @Bean
    CommandLineRunner run(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String managerEmail = "manager@test.com";
            
            // 1. Check if Manager exists
            Optional<User> existingManager = userRepository.findByEmail(managerEmail);

            if (existingManager.isPresent()) {
                System.out.println(">>> ✅ Manager already exists. Skipping cleanup. (Safe Mode)");
                // 🛑 WE DO NOT DELETE ANYTHING HERE ANYMORE
                // This prevents the "Ghost User" bug where ID 10 gets deleted and reused.
            } else {
                // 2. Only create if missing
                System.out.println(">>> 🆕 Creating Manager Account...");
                User manager = new User();
                manager.setName("Manager");
                manager.setEmail(managerEmail);
                manager.setPassword(passwordEncoder.encode("password"));
                manager.setRole(Role.ADMIN);
                userRepository.save(manager);
                System.out.println(">>> ✅ Manager created: " + managerEmail);
            }
        };
    }
}