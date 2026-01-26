package com.skilltrack.backend;

import com.skilltrack.backend.entity.Role;
import com.skilltrack.backend.entity.User;
import com.skilltrack.backend.repository.UserRepository;
import com.skilltrack.backend.repository.UserSkillRepository; // ✅ Import this
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

    // ✅ ADDED UserSkillRepository to arguments
    @Bean
    CommandLineRunner run(UserRepository userRepository, UserSkillRepository userSkillRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            try {
                // ✅ SAFE CLEANUP: Delete enrollments BEFORE deleting the user
                userRepository.findByEmail("manager@test.com").ifPresent(user -> {
                    System.out.println("Cleaning up old Manager data...");
                    userSkillRepository.deleteByUserId(user.getId()); // Delete enrollments
                    userRepository.delete(user);                      // Then delete user
                });
                
                // Create Admin User
                User admin = new User();
                admin.setEmail("manager@test.com");
                admin.setName("Manager User");
                admin.setRole(Role.ADMIN);
                admin.setPassword(passwordEncoder.encode("password"));
                
                userRepository.save(admin);
                System.out.println("✅ PASSWORD RESET SUCCESSFUL! Login with: manager@test.com / password");
            } catch (Exception e) {
                System.out.println("⚠️ Error: " + e.getMessage());
            }
        };
    }
}