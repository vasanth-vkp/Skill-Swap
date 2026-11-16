package com.skillswap.platform.core.config;

import com.skillswap.platform.profile.entity.UserSkill;
import com.skillswap.platform.profile.repository.UserSkillRepository;
import com.skillswap.platform.skill.entity.Skill;
import com.skillswap.platform.skill.repository.SkillRepository;
import com.skillswap.platform.user.entity.User;
import com.skillswap.platform.user.repository.UserRepository;
import com.skillswap.platform.wallet.entity.Wallet;
import com.skillswap.platform.wallet.repository.WalletRepository;
import com.skillswap.platform.wallet.service.WalletService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
public class DataInitializerConfig {

    private static final Logger log = LoggerFactory.getLogger(DataInitializerConfig.class);

    @Bean
    public CommandLineRunner initSkills(
            SkillRepository skillRepository,
            UserRepository userRepository,
            WalletRepository walletRepository,
            UserSkillRepository userSkillRepository,
            PasswordEncoder passwordEncoder,
            WalletService walletService
    ) {
        return args -> {
            // 1. Initialize standard skill catalog
            if (skillRepository.count() == 0) {
                log.info("Initializing default skill catalog...");
                List<Skill> initialSkills = List.of(
                        // 1. Technology
                        new Skill("Web Development", "Technology"),
                        new Skill("Python Programming", "Technology"),
                        new Skill("Mobile App Development", "Technology"),
                        new Skill("UI/UX Design", "Technology"),
                        new Skill("Data Analysis & SQL", "Technology"),
                        new Skill("Cybersecurity Basics", "Technology"),

                        // 2. Languages
                        new Skill("Spanish Conversation", "Languages"),
                        new Skill("French for Beginners", "Languages"),
                        new Skill("Conversational English", "Languages"),
                        new Skill("Mandarin Chinese", "Languages"),
                        new Skill("Japanese Basics", "Languages"),
                        new Skill("German", "Languages"),

                        // 3. Arts & Design
                        new Skill("Graphic Design & Branding", "Arts & Design"),
                        new Skill("Digital Photography", "Arts & Design"),
                        new Skill("Video Editing & Motion", "Arts & Design"),
                        new Skill("Acoustic Guitar", "Arts & Design"),
                        new Skill("Piano & Keyboard", "Arts & Design"),
                        new Skill("Digital Illustration", "Arts & Design"),

                        // 4. Academics
                        new Skill("Calculus & Linear Algebra", "Academics"),
                        new Skill("High School Physics", "Academics"),
                        new Skill("General Chemistry", "Academics"),
                        new Skill("College Essay Writing", "Academics"),
                        new Skill("SAT & ACT Math Prep", "Academics"),
                        new Skill("Microeconomics", "Academics"),

                        // 5. Trades & Practical
                        new Skill("Home Electrical & Plumbing Repairs", "Trades & Practical"),
                        new Skill("Bicycle Maintenance & Tune-up", "Trades & Practical"),
                        new Skill("Urban Gardening & Composting", "Trades & Practical"),
                        new Skill("Artisan Bread Baking", "Trades & Practical"),
                        new Skill("Basic Woodworking", "Trades & Practical"),
                        new Skill("Sewing & Clothing Alterations", "Trades & Practical"),

                        // 6. Health & Wellness
                        new Skill("Vinyasa Yoga", "Health & Wellness"),
                        new Skill("Functional Strength Training", "Health & Wellness"),
                        new Skill("Guided Meditation & Breathwork", "Health & Wellness"),
                        new Skill("Nutrition & Meal Prep", "Health & Wellness"),
                        new Skill("Mat Pilates", "Health & Wellness"),
                        new Skill("Self-Defense & Martial Arts", "Health & Wellness")
                );

                skillRepository.saveAll(initialSkills);
                log.info("Successfully seeded {} catalog skills.", initialSkills.size());
            }

            // 2. Initialize realistic demo users and skills if empty
            if (userRepository.count() == 0) {
                log.info("Seeding demo community members...");
                Map<String, Skill> skillMap = skillRepository.findAll().stream()
                        .collect(Collectors.toMap(Skill::getName, s -> s, (a, b) -> a));

                String defaultPasswordHash = passwordEncoder.encode("Password123!");

                // User 1: Alex Mercer (Hardware & Trades)
                if (!userRepository.existsByEmail("alex@example.com")) {
                    User alex = new User("Alex Mercer", "alex@example.com", defaultPasswordHash, "Downtown, Seattle");
                    alex.setBio("Laptop repairs, hardware troubleshooting, and home electronics specialist with 8+ years experience.");
                    alex.setAverageRating(4.9);
                    alex.setTotalReviews(28);
                    alex = userRepository.save(alex);
                    seedWalletAndGrant(alex, walletRepository, walletService);
                    seedUserSkill(alex.getId(), skillMap.get("Home Electrical & Plumbing Repairs"), "OFFERED", "ADVANCED", userSkillRepository);
                    seedUserSkill(alex.getId(), skillMap.get("Web Development"), "OFFERED", "INTERMEDIATE", userSkillRepository);
                    seedUserSkill(alex.getId(), skillMap.get("Calculus & Linear Algebra"), "WANTED", "BEGINNER", userSkillRepository);
                }

                // User 2: Elena Gomez (Languages)
                if (!userRepository.existsByEmail("elena@example.com")) {
                    User elena = new User("Elena Gomez", "elena@example.com", defaultPasswordHash, "Capitol Hill, Seattle");
                    elena.setBio("Native Spanish speaker and certified conversational language tutor. Passionate about cultural exchanges.");
                    elena.setAverageRating(5.0);
                    elena.setTotalReviews(42);
                    elena = userRepository.save(elena);
                    seedWalletAndGrant(elena, walletRepository, walletService);
                    seedUserSkill(elena.getId(), skillMap.get("Spanish Conversation"), "OFFERED", "ADVANCED", userSkillRepository);
                    seedUserSkill(elena.getId(), skillMap.get("Web Development"), "WANTED", "BEGINNER", userSkillRepository);
                }

                // User 3: Marcus Chen (Music & Arts)
                if (!userRepository.existsByEmail("marcus@example.com")) {
                    User marcus = new User("Marcus Chen", "marcus@example.com", defaultPasswordHash, "Ballard, Seattle");
                    marcus.setBio("Acoustic guitarist and composer passionate about teaching beginners fingerstyle fundamentals.");
                    marcus.setAverageRating(4.8);
                    marcus.setTotalReviews(19);
                    marcus = userRepository.save(marcus);
                    seedWalletAndGrant(marcus, walletRepository, walletService);
                    seedUserSkill(marcus.getId(), skillMap.get("Acoustic Guitar"), "OFFERED", "ADVANCED", userSkillRepository);
                    seedUserSkill(marcus.getId(), skillMap.get("Urban Gardening & Composting"), "WANTED", "BEGINNER", userSkillRepository);
                }

                // User 4: Dr. Sarah Patel (Academics)
                if (!userRepository.existsByEmail("sarah@example.com")) {
                    User sarah = new User("Dr. Sarah Patel", "sarah@example.com", defaultPasswordHash, "University District, Seattle");
                    sarah.setBio("University math educator with a passion for helping students master calculus, algebra, and exam prep.");
                    sarah.setAverageRating(4.95);
                    sarah.setTotalReviews(35);
                    sarah = userRepository.save(sarah);
                    seedWalletAndGrant(sarah, walletRepository, walletService);
                    seedUserSkill(sarah.getId(), skillMap.get("Calculus & Linear Algebra"), "OFFERED", "ADVANCED", userSkillRepository);
                    seedUserSkill(sarah.getId(), skillMap.get("Video Editing & Motion"), "WANTED", "BEGINNER", userSkillRepository);
                }

                // User 5: Tharanya (tharu@gmail.com)
                if (!userRepository.existsByEmail("tharu@gmail.com")) {
                    User tharu = new User("Tharanya", "tharu@gmail.com", passwordEncoder.encode("Tharanya@123456"), "Seattle, WA");
                    tharu.setBio("Community member & active skill exchanger.");
                    tharu.setAverageRating(5.0);
                    tharu.setTotalReviews(12);
                    tharu = userRepository.save(tharu);
                    seedWalletAndGrant(tharu, walletRepository, walletService);
                    seedUserSkill(tharu.getId(), skillMap.get("Web Development"), "OFFERED", "ADVANCED", userSkillRepository);
                    seedUserSkill(tharu.getId(), skillMap.get("Spanish Conversation"), "WANTED", "BEGINNER", userSkillRepository);
                }

                // User 6: Vasa (vasa@gmail.com)
                if (!userRepository.existsByEmail("vasa@gmail.com")) {
                    User vasa = new User("Vasa", "vasa@gmail.com", passwordEncoder.encode("Password123!"), "Seattle, WA");
                    vasa.setBio("Community member & technology enthusiast.");
                    vasa.setAverageRating(5.0);
                    vasa.setTotalReviews(10);
                    vasa = userRepository.save(vasa);
                    seedWalletAndGrant(vasa, walletRepository, walletService);
                    seedUserSkill(vasa.getId(), skillMap.get("Python Programming"), "OFFERED", "ADVANCED", userSkillRepository);
                    seedUserSkill(vasa.getId(), skillMap.get("UI/UX Design"), "WANTED", "BEGINNER", userSkillRepository);
                }

                log.info("Successfully seeded community members with initial time credits and skills.");
            }
        };
    }

    private void seedWalletAndGrant(User user, WalletRepository walletRepository, WalletService walletService) {
        Wallet wallet = new Wallet(user.getId(), new BigDecimal("5.00"));
        wallet = walletRepository.save(wallet);
        walletService.recordInitialGrant(user, wallet.getBalance());
    }

    private void seedUserSkill(Long userId, Skill skill, String type, String experience, UserSkillRepository repository) {
        if (skill != null) {
            repository.save(new UserSkill(userId, skill, type, experience));
        }
    }
}
