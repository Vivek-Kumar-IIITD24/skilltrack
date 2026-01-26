package com.skilltrack.backend.controller;

import com.skilltrack.backend.dto.UserRequest;
import com.skilltrack.backend.dto.UserResponse;
import com.skilltrack.backend.entity.User;
import com.skilltrack.backend.service.UserService;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    // ✅ REGISTER USER
    @PostMapping("/register")
    public ResponseEntity<UserResponse> registerUser(
            @Valid @RequestBody UserRequest request
    ) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());

        User savedUser = userService.registerUser(user);

        UserResponse response = new UserResponse();
        response.setId(savedUser.getId());
        response.setName(savedUser.getName());
        response.setEmail(savedUser.getEmail());
        response.setRole(savedUser.getRole().name());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // ✅ ADMIN: GET ALL USERS
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        List<UserResponse> users = userService.getAllUsers()
                .stream()
                .map(user -> {
                    UserResponse response = new UserResponse();
                    response.setId(user.getId());
                    response.setName(user.getName());
                    response.setEmail(user.getEmail());
                    response.setRole(user.getRole().name());
                    return response;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }

    // 🔥🔥🔥 ADMIN: DELETE USER (THIS FIXES FK ERROR)
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {

        userService.deleteUser(id); // ✅ IMPORTANT

        return ResponseEntity.ok("User deleted successfully");
    }
}
