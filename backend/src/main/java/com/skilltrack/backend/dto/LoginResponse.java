package com.skilltrack.backend.dto;

public class LoginResponse {

    private String token;

    // REQUIRED constructor
    public LoginResponse(String token) {
        this.token = token;
    }

    // Getter
    public String getToken() {
        return token;
    }

    // Setter
    public void setToken(String token) {
        this.token = token;
    }
}
