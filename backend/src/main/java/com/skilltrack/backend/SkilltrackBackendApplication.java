package com.skilltrack.backend;

import com.skilltrack.backend.entity.Role; // ✅ Import Role Enum
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

    @Bean
    CommandLineRunner run(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            try {
                // Clean up old test user
                userRepository.findByEmail("manager@test.com").ifPresent(userRepository::delete);
                
                // Create Admin User
                User admin = new User();
                admin.setEmail("manager@test.com");
                admin.setName("Manager User");
                
                // ✅ FIXED: Use Role.ADMIN Enum
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