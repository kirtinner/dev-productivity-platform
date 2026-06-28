package com.kzhastkou.devproductivityplatform.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private static final String DEMO_SECRET = "my-super-secret-key-my-super-secret-key";

    private final String secret;

    public JwtService(@Value("${jwt.secret}") String secret, Environment environment) {
        this.secret = secret;
        validateSecret(environment);
    }

    private void validateSecret(Environment environment) {
        if (environment.acceptsProfiles(Profiles.of("dev"))) {
            return;
        }

        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET is required outside the dev profile.");
        }

        if (DEMO_SECRET.equals(secret)) {
            throw new IllegalStateException("JWT_SECRET must be changed outside the dev profile.");
        }
    }

    private SecretKey getSignKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(Long userId) {
        return Jwts.builder()
                .subject(userId.toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))
                .signWith(getSignKey())
                .compact();
    }

    public Long extractUserId(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return Long.parseLong(claims.getSubject());
    }
}
