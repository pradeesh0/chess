package com.Chess.Service;

import com.Chess.Entity.User;
import com.Chess.Entity.UserDTO;
import com.Chess.Repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public ResponseEntity<Map<String,String>> registerUser(String name, String email, String password, String confirmPassword) {
        if (!password.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body(Map.of("error","Passwords do not match!"));
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error","Email already exists!"));
        }

        User newUser = new User();
        newUser.setName(name);
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(password)); // Encrypt password

        userRepository.save(newUser);
        return ResponseEntity.ok(Map.of("message","User registered successfully!"));
    }

    public ResponseEntity<Map<String,String>> loginUser(String email, String password, HttpServletRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error","Invalid credentials!"));
        }
        User user = userOptional.get();

        // Verify the password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error","Password is wrong!"));
        }
        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }
        HttpSession newSession = request.getSession(true);
        UserDTO userDTO = new UserDTO(user.getName(), user.getEmail(),null, null,user.getProfilePic(), user.getRating(), user.getGamesPlayed());
        newSession.setAttribute("user", userDTO);
        return ResponseEntity.ok(Map.of(
                "message", "Login successful!",
                "name", user.getName(),
                "email", user.getEmail(),
                "profilePic", user.getProfilePic()
        ));

    }

    public ResponseEntity<Map<String,String>> editprofile(String email,String newName, String newprofilepic,HttpServletRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error","User not found!"));
        }

        User user = userOptional.get();

        if (newName != null && !newName.isBlank()) {
            user.setName(newName);
        }

        if (newprofilepic != null && !newprofilepic.isBlank()) {
            user.setProfilePic(newprofilepic);
        }
        userRepository.save(user);

        HttpSession session = request.getSession(false);
        if (session != null) {
            UserDTO updatedUserDTO = new UserDTO(user.getName(), user.getEmail(), null, null, user.getProfilePic());
            session.setAttribute("user", updatedUserDTO);
        }
        return ResponseEntity.ok(Map.of("message","Profile updated successfully"));
    }

    private static final int K_FACTOR = 32; // Elo rating constant

    public ResponseEntity<String> updateRatings(String winnerEmail, String loserEmail) {
        Optional<User> winnerOpt = userRepository.findByEmail(winnerEmail);
        Optional<User> loserOpt = userRepository.findByEmail(loserEmail);

        if (winnerOpt.isEmpty() || loserOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid user provided.");
        }

        User winner = winnerOpt.get();
        User loser = loserOpt.get();

        double winnerExpected = 1 / (1 + Math.pow(10, (loser.getRating() - winner.getRating()) / 400.0));
        double loserExpected = 1 / (1 + Math.pow(10, (winner.getRating() - loser.getRating()) / 400.0));

        int winnerNewRating = (int) (winner.getRating() + K_FACTOR * (1 - winnerExpected));
        int loserNewRating = (int) (loser.getRating() + K_FACTOR * (0 - loserExpected));

        winner.setRating(winnerNewRating);
        winner.setGamesPlayed(winner.getGamesPlayed() + 1);

        loser.setRating(loserNewRating);
        loser.setGamesPlayed(loser.getGamesPlayed() + 1);

        userRepository.save(winner);
        userRepository.save(loser);

        return ResponseEntity.ok("Ratings updated successfully!");
    }

    public ResponseEntity<UserDTO> getprofile(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = userOptional.get();
        UserDTO userDTO = new UserDTO(user.getName(), user.getEmail(), user.getProfilePic(), user.getRating(), user.getGamesPlayed());
        return ResponseEntity.ok(userDTO);
    }
}
