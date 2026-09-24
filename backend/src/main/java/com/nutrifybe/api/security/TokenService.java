package com.nutrifybe.api.security;

import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class TokenService {
    private final JwtEncoder encoder;
    private final long expirationMinutes;

    public TokenService(JwtEncoder encoder, @Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
        this.encoder = encoder;
        this.expirationMinutes = expirationMinutes;
    }

    public String issue(long patientId, String email) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer("nutrifybe-api").issuedAt(now)
                .expiresAt(now.plusSeconds(expirationMinutes * 60)).subject(Long.toString(patientId))
                .claim("email", email).claim("role", "PATIENT").build();
        return encoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }
}
