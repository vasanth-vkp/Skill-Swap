package com.skillswap.platform.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.platform.auth.dto.RegisterRequest;
import com.skillswap.platform.booking.repository.BookingRepository;
import com.skillswap.platform.exchange.repository.ExchangeRequestRepository;
import com.skillswap.platform.notification.entity.Notification;
import com.skillswap.platform.notification.entity.NotificationType;
import com.skillswap.platform.notification.repository.NotificationRepository;
import com.skillswap.platform.profile.repository.UserSkillRepository;
import com.skillswap.platform.review.repository.ReviewRepository;
import com.skillswap.platform.skill.repository.SkillRepository;
import com.skillswap.platform.user.entity.User;
import com.skillswap.platform.user.repository.UserRepository;
import com.skillswap.platform.wallet.repository.CreditTransactionRepository;
import com.skillswap.platform.wallet.repository.WalletRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ExchangeRequestRepository exchangeRequestRepository;

    @Autowired
    private CreditTransactionRepository creditTransactionRepository;

    @Autowired
    private UserSkillRepository userSkillRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    private String aliceToken;
    private Long aliceId;
    private String bobToken;
    private Long bobId;

    @BeforeEach
    void setUp() throws Exception {
        cleanDb();

        aliceToken = registerUser("Alice Member", "alice.notif@example.com", "Password123", "Seattle, WA");
        aliceId = getUserIdByEmail("alice.notif@example.com");

        bobToken = registerUser("Bob Member", "bob.notif@example.com", "Password123", "Seattle, WA");
        bobId = getUserIdByEmail("bob.notif@example.com");
    }

    @AfterEach
    void tearDown() {
        cleanDb();
    }

    private void cleanDb() {
        notificationRepository.deleteAll();
        reviewRepository.deleteAll();
        creditTransactionRepository.deleteAll();
        bookingRepository.deleteAll();
        exchangeRequestRepository.deleteAll();
        userSkillRepository.deleteAll();
        walletRepository.deleteAll();
        userRepository.deleteAll();
        skillRepository.deleteAll();
    }

    private String registerUser(String name, String email, String password, String location) throws Exception {
        RegisterRequest req = new RegisterRequest(name, email, password, location);
        MvcResult res = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(res.getResponse().getContentAsString()).get("token").asText();
    }

    private Long getUserIdByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow().getId();
    }

    @Test
    @DisplayName("GET /api/v1/notifications should return list of notifications for user")
    void shouldReturnNotificationsForUser() throws Exception {
        User alice = userRepository.findById(aliceId).orElseThrow();
        notificationRepository.save(new Notification(alice, NotificationType.REQUEST_RECEIVED, "First alert"));
        notificationRepository.save(new Notification(alice, NotificationType.BOOKING_SCHEDULED, "Second alert"));

        mockMvc.perform(get("/api/v1/notifications")
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].message").value("Second alert"))
                .andExpect(jsonPath("$[0].read").value(false))
                .andExpect(jsonPath("$[1].message").value("First alert"));
    }

    @Test
    @DisplayName("GET /api/v1/notifications/unread-count should return count of unread notifications")
    void shouldReturnUnreadCount() throws Exception {
        User alice = userRepository.findById(aliceId).orElseThrow();
        Notification n1 = new Notification(alice, NotificationType.REQUEST_RECEIVED, "Alert 1");
        Notification n2 = new Notification(alice, NotificationType.BOOKING_SCHEDULED, "Alert 2");
        n2.setRead(true);

        notificationRepository.save(n1);
        notificationRepository.save(n2);

        mockMvc.perform(get("/api/v1/notifications/unread-count")
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(1));
    }

    @Test
    @DisplayName("PATCH /api/v1/notifications/{id}/read should mark single notification as read")
    void shouldMarkSingleNotificationAsRead() throws Exception {
        User alice = userRepository.findById(aliceId).orElseThrow();
        Notification n = notificationRepository.save(new Notification(alice, NotificationType.REQUEST_RECEIVED, "Unread"));

        mockMvc.perform(patch("/api/v1/notifications/" + n.getId() + "/read")
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(n.getId()))
                .andExpect(jsonPath("$.read").value(true));
    }

    @Test
    @DisplayName("PATCH /api/v1/notifications/read-all should mark all notifications for user as read")
    void shouldMarkAllNotificationsAsRead() throws Exception {
        User alice = userRepository.findById(aliceId).orElseThrow();
        notificationRepository.save(new Notification(alice, NotificationType.REQUEST_RECEIVED, "Unread 1"));
        notificationRepository.save(new Notification(alice, NotificationType.BOOKING_SCHEDULED, "Unread 2"));

        mockMvc.perform(patch("/api/v1/notifications/read-all")
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isOk());

        // Verify unread count is now 0
        mockMvc.perform(get("/api/v1/notifications/unread-count")
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(0));
    }

    @Test
    @DisplayName("PATCH /api/v1/notifications/{id}/read on another user's notification returns 403 Forbidden")
    void shouldRejectMarkingOtherUsersNotification() throws Exception {
        User bob = userRepository.findById(bobId).orElseThrow();
        Notification bobNotif = notificationRepository.save(new Notification(bob, NotificationType.REQUEST_RECEIVED, "Bob only"));

        mockMvc.perform(patch("/api/v1/notifications/" + bobNotif.getId() + "/read")
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/v1/notifications without auth returns 401 Unauthorized")
    void shouldRejectUnauthenticatedRequest() throws Exception {
        mockMvc.perform(get("/api/v1/notifications"))
                .andExpect(status().isUnauthorized());
    }
}
