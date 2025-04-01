package com.Chess.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDTO {
    private String name;
    private String email;

    private String password;

    private String confirmPassword;

    private String profilePic;

    private int rating;
    private int gamesPlayed;


    public UserDTO(String name, String email, String password, String confirmPassword,String profilePic) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.profilePic=profilePic;
    }

    public UserDTO(String name, String email, String password, String confirmPassword, String profilePic, int rating, int gamesPlayed) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.profilePic = profilePic;
        this.rating = rating;
        this.gamesPlayed = gamesPlayed;
    }

    public UserDTO(String email, String name, String profilePic, int rating, int gamesPlayed) {
        this.email = email;
        this.name = name;
        this.profilePic = profilePic;
        this.rating = rating;
        this.gamesPlayed = gamesPlayed;
    }

    public UserDTO() {

    }
}
