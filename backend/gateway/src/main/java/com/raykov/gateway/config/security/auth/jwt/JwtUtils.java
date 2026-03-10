package com.raykov.gateway.config.security.auth.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Optional;
import java.util.function.Function;

@Component
public class JwtUtils {
    private static final int tokenExpirationTime = 1000 * 60 * 60 * 24;
    private static final String TENANT_CLAIM = "tenantId";

    @Value("${secret.key}")
    private String secret;
    private SecretKey key;

    public String generateToken(String username, Long tenantId) {
        return Jwts.builder()
                   .subject(username)
                   .claim(TENANT_CLAIM, tenantId)
                   .issuedAt(new Date())
                   .expiration(new Date(System.currentTimeMillis() + tokenExpirationTime))
                   .signWith(key)
                   .compact();
    }

    public Optional<String> extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Optional<Long> extractTenantId(String token) {
        return extractClaim(token, claims -> claims.get(TENANT_CLAIM, Long.class));
    }

    public <T> Optional<T> extractClaim(String token, Function<Claims, T> claimsResolver) {
        try {
            final Claims claims = Jwts.parser().verifyWith(key).build()
                                      .parseSignedClaims(token).getPayload();
            return Optional.ofNullable(claimsResolver.apply(claims));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    @PostConstruct
    public void init() {
        key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }
}