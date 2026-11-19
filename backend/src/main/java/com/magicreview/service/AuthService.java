package com.magicreview.service;

import com.magicreview.dto.AuthResponse;
import com.magicreview.dto.LoginRequest;
import com.magicreview.dto.RegisterRequest;
import com.magicreview.dto.StoreRequest;
import com.magicreview.dto.UserResponse;
import com.magicreview.entity.User;
import com.magicreview.enums.Role;
import com.magicreview.exception.BadRequestException;
import com.magicreview.exception.ResourceNotFoundException;
import com.magicreview.repository.UserRepository;
import com.magicreview.security.JwtUtils;
import com.magicreview.security.UserDetailsImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final StoreService storeService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtils jwtUtils,
                       StoreService storeService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.storeService = storeService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("An account with this email already exists");
        }

        User user = new User(
                normalizedEmail,
                passwordEncoder.encode(request.getPassword()),
                Role.BUSINESS_OWNER
        );
        User savedUser = userRepository.save(user);

        // If merchant entered business details and poster during registration, auto-create their first store
        if (request.getBusinessName() != null && !request.getBusinessName().isBlank()) {
            StoreRequest storeReq = new StoreRequest();
            storeReq.setName(request.getBusinessName().trim());
            storeReq.setPosterUrl(request.getPosterUrl());
            storeReq.setGoogleReviewUrl(
                    (request.getGoogleReviewUrl() != null && !request.getGoogleReviewUrl().isBlank())
                            ? request.getGoogleReviewUrl().trim()
                            : "https://search.google.com/local/writereview"
            );
            storeReq.setDescription("Welcome to " + request.getBusinessName().trim() + "! Leave us a genuine Google review.");
            storeService.createStore(savedUser.getId(), storeReq);
        }

        UserDetailsImpl userPrincipal = UserDetailsImpl.build(savedUser);
        String token = jwtUtils.generateToken(userPrincipal);

        UserResponse userResponse = new UserResponse(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getCreatedAt()
        );

        return new AuthResponse(token, userResponse);
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        String token = jwtUtils.generateToken(userPrincipal);

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );

        return new AuthResponse(token, userResponse);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
