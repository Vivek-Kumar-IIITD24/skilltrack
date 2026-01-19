package com.skilltrack.backend.service;

import com.skilltrack.backend.dto.UserRequest;
import com.skilltrack.backend.dto.UserResponse;
import java.util.List;

public interface UserService {

    UserResponse createUser(UserRequest request);

    List<UserResponse> getAllUsers();
}
