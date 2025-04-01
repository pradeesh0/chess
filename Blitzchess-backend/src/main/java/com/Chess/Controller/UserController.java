package com.Chess.Controller;


import com.Chess.Entity.RatingUpdateRequest;
import com.Chess.Entity.User;
import com.Chess.Entity.UserDTO;
import com.Chess.Service.UserService;
import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<Map<String,String>> registerUser(@RequestBody UserDTO userDTO) {
        return userService.registerUser(userDTO.getName(), userDTO.getEmail(), userDTO.getPassword(), userDTO.getConfirmPassword());
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String,String>> loginUser(@RequestBody UserDTO userDTO, HttpServletRequest request) {
        return userService.loginUser(userDTO.getEmail(), userDTO.getPassword(),request);

    }

    @PostMapping("/logout")
    public ResponseEntity<String> logoutUser(HttpSession session, HttpServletResponse response) {
        session.invalidate(); // Destroy session
        Cookie cookie = new Cookie("JSESSIONID", null);
        cookie.setMaxAge(0);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        response.addCookie(cookie);
        return ResponseEntity.ok("User logged out successfully!");
    }

    @GetMapping("/session")
    public ResponseEntity<?> checkSession(HttpSession session) {
        UserDTO user = (UserDTO) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.ok("No active session found.");
        }

        return ResponseEntity.ok(Map.of(
                "name", user.getName(),
                "email", user.getEmail(),
                "profilePic", user.getProfilePic(),
                "rating",user.getRating(),
                "totalgames",user.getGamesPlayed()
        ));
    }

    @PutMapping("/Edit-profile")
    public ResponseEntity<Map<String, String>> getUserProfile(@RequestBody UserDTO userDTO, HttpServletRequest request) {
        return userService.editprofile(userDTO.getEmail(), userDTO.getName(),userDTO.getProfilePic(), request);
    }

    @PostMapping("/updateRating")
    public ResponseEntity<String> updateRating(@RequestBody RatingUpdateRequest request) {
        if (request == null || request.getWinnerEmail() == null || request.getLoserEmail() == null) {
            return ResponseEntity.badRequest().body("Missing required parameters!");
        }

        return userService.updateRatings(request.getWinnerEmail(), request.getLoserEmail());
    }

    @GetMapping("/{email}")
    public ResponseEntity<UserDTO> getUserProfile(@PathVariable String email) {
        ResponseEntity<UserDTO> userDTO = userService.getprofile(email);
        return userService.getprofile(email);
    }

}
