package com.Chess.Entity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RatingUpdateRequest {
    private String winnerEmail;
    private String loserEmail;

    public RatingUpdateRequest() {}

    public RatingUpdateRequest(String winnerEmail, String loserEmail) {
        this.winnerEmail = winnerEmail;
        this.loserEmail = loserEmail;
    }
}
