package com.Chess.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Gamers")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String name;  // Full Name

    @Column(name = "email", unique = true, nullable = false)
    private String email;  // Email as a unique identifier

    @Column(name = "password", nullable = false)
    private String password;

    @Transient
    private String confirmPassword;

    @Column(name="profile_pic")
    private String profilePic="default.png";

    @Column(name = "rating")
    private int rating = 1200;  // Default rating for new players

    @Column(name = "games_played")
    private int gamesPlayed = 0; // Track total games played


    @Override
    public String toString() {
        return "User{name='" + name + "', email='" + email + "'}";
    }
}