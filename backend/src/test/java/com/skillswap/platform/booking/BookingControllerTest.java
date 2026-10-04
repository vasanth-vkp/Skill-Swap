package com.skillswap.platform.booking;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.platform.auth.dto.RegisterRequest;
import com.skillswap.platform.booking.dto.ScheduleBookingRequest;
import com.skillswap.platform.booking.repository.BookingRepository;
import com.skillswap.platform.exchange.dto.CreateExchangeRequest;
import com.skillswap.platform.exchange.repository.ExchangeRequestRepository;
import com.skillswap.platform.profile.dto.AddUserSkillRequest;
import com.skillswap.platform.profile.repository.UserSkillRepository;
import com.skillswap.platform.skill.entity.Skill;
import com.skillswap.platform.skill.repository.SkillRepository;
import com.skillswap.platform.user.entity.User;
import com.skillswap.platform.user.repository.UserRepository;
import com.skillswap.platform.wallet.repository.WalletRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ExchangeRequestRepository exchangeRequestRepository;

    @Autowired
    private UserSkillRepository userSkillRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private com.skillswap.platform.wallet.repository.CreditTransactionRepository creditTransactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private com.skillswap.platform.notification.repository.NotificationRepository notificationRepository;

    private String aliceToken;
    private Long aliceId;

    private String bobToken;
    private Long bobId;

    private String charlieToken;
    private Long charlieId;

    private Skill pythonSkill;

    @BeforeEach
    void setUp() throws Exception {
        cleanDb();

        pythonSkill = skillRepository.save(new Skill("Python Programming", "Technology"));

        aliceToken = registerUser("Alice", "alice@example.com", "Password123", "Seattle, WA");
        aliceId = getUserIdByEmail("alice@example.com");

        bobToken = registerUser("Bob", "bob@example.com", "Password123", "Seattle, WA");
        bobId = getUserIdByEmail("bob@example.com");

        charlieToken = registerUser("Charlie", "charlie@example.com", "Password123", "Portland, OR");
        charlieId = getUserIdByEmail("charlie@example.com");

        // Bob offers Python
        mockMvc.perform(post("/api/v1/profile/skills")
                .header("Authorization", "Bearer " + bobToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new AddUserSkillRequest(pythonSkill.getId(), "Python Programming", "Technology", "OFFERED", "ADVANCED"))))
                .andExpect(status().isCreated());
    }

    @AfterEach
    void tearDown() {
        cleanDb();
    }

    private void cleanDb() {
        notificationRepository.deleteAll();
        creditTransactionRepository.deleteAll();
        bookingRepository.deleteAll();
        exchangeRequestRepository.deleteAll();
        userSkillRepository.deleteAll();
        walletRepository.deleteAll();
        userRepository.deleteAll();
        skillRepository.deleteAll();
    }

    private String registerUser(String name, String email, String password, String location) throws Exception {
        RegisterRequest request = new RegisterRequest(name, email, password, location);
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    private Long getUserIdByEmail(String email) {
        return userRepository.findByEmail(email).map(User::getId).orElseThrow();
    }

    private Long createAndAcceptExchange(String requesterToken, Long providerId, Long skillId, BigDecimal duration) throws Exception {
        CreateExchangeRequest createReq = new CreateExchangeRequest(providerId, skillId, duration, "Session test");
        MvcResult res = mockMvc.perform(post("/api/v1/exchanges")
                .header("Authorization", "Bearer " + requesterToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();

        Long exchangeId = objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asLong();

        // Bob accepts
        mockMvc.perform(put("/api/v1/exchanges/" + exchangeId + "/accept")
                .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isOk());

        return exchangeId;
    }

    @Test
    void shouldRejectUnauthenticatedAccess() throws Exception {
        mockMvc.perform(post("/api/v1/exchanges/1/book")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new ScheduleBookingRequest(Instant.now().plus(2, ChronoUnit.HOURS)))))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/bookings/upcoming"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldAllowParticipantToScheduleAcceptedExchange() throws Exception {
        Long exchangeId = createAndAcceptExchange(aliceToken, bobId, pythonSkill.getId(), new BigDecimal("1.50"));

        Instant startTime = Instant.now().plus(24, ChronoUnit.HOURS).truncatedTo(ChronoUnit.SECONDS);
        ScheduleBookingRequest bookingReq = new ScheduleBookingRequest(startTime);

        mockMvc.perform(post("/api/v1/exchanges/" + exchangeId + "/book")
                .header("Authorization", "Bearer " + aliceToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bookingReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.requestId", is(exchangeId.intValue())))
                .andExpect(jsonPath("$.status", is("SCHEDULED")))
                .andExpect(jsonPath("$.requesterName", is("Alice")))
                .andExpect(jsonPath("$.providerName", is("Bob")))
                .andExpect(jsonPath("$.skillName", is("Python Programming")));

        // Check exchange status is now SCHEDULED
        mockMvc.perform(get("/api/v1/exchanges/" + exchangeId)
                .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SCHEDULED")));
    }

    @Test
    void shouldForbidNonParticipantFromBooking() throws Exception {
        Long exchangeId = createAndAcceptExchange(aliceToken, bobId, pythonSkill.getId(), new BigDecimal("1.00"));

        Instant startTime = Instant.now().plus(24, ChronoUnit.HOURS);
        ScheduleBookingRequest bookingReq = new ScheduleBookingRequest(startTime);

        mockMvc.perform(post("/api/v1/exchanges/" + exchangeId + "/book")
                .header("Authorization", "Bearer " + charlieToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bookingReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", containsString("Only exchange participants")));
    }

    @Test
    void shouldRejectBookingWhenCalendarConflictExists() throws Exception {
        Long exchangeId1 = createAndAcceptExchange(aliceToken, bobId, pythonSkill.getId(), new BigDecimal("2.00"));

        Instant startTime = Instant.now().plus(24, ChronoUnit.HOURS).truncatedTo(ChronoUnit.SECONDS);
        mockMvc.perform(post("/api/v1/exchanges/" + exchangeId1 + "/book")
                .header("Authorization", "Bearer " + aliceToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new ScheduleBookingRequest(startTime))))
                .andExpect(status().isCreated());

        // Alice creates another exchange with Charlie
        // Charlie offers Python
        mockMvc.perform(post("/api/v1/profile/skills")
                .header("Authorization", "Bearer " + charlieToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new AddUserSkillRequest(pythonSkill.getId(), "Python Programming", "Technology", "OFFERED", "INTERMEDIATE"))))
                .andExpect(status().isCreated());

        CreateExchangeRequest createReq2 = new CreateExchangeRequest(charlieId, pythonSkill.getId(), new BigDecimal("1.00"), "Charlie exchange");
        MvcResult res2 = mockMvc.perform(post("/api/v1/exchanges")
                .header("Authorization", "Bearer " + aliceToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createReq2)))
                .andExpect(status().isCreated())
                .andReturn();
        Long exchangeId2 = objectMapper.readTree(res2.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(put("/api/v1/exchanges/" + exchangeId2 + "/accept")
                .header("Authorization", "Bearer " + charlieToken))
                .andExpect(status().isOk());

        // Attempt overlapping booking (starts 30 mins after first session)
        Instant overlappingStart = startTime.plus(30, ChronoUnit.MINUTES);
        mockMvc.perform(post("/api/v1/exchanges/" + exchangeId2 + "/book")
                .header("Authorization", "Bearer " + aliceToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new ScheduleBookingRequest(overlappingStart))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", containsString("Calendar conflict")));
    }

    @Test
    void shouldAllowParticipantToRescheduleBooking() throws Exception {
        Long exchangeId = createAndAcceptExchange(aliceToken, bobId, pythonSkill.getId(), new BigDecimal("1.00"));

        Instant initialStart = Instant.now().plus(24, ChronoUnit.HOURS).truncatedTo(ChronoUnit.SECONDS);
        MvcResult bookRes = mockMvc.perform(post("/api/v1/exchanges/" + exchangeId + "/book")
                .header("Authorization", "Bearer " + aliceToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new ScheduleBookingRequest(initialStart))))
                .andExpect(status().isCreated())
                .andReturn();

        Long bookingId = objectMapper.readTree(bookRes.getResponse().getContentAsString()).get("id").asLong();

        Instant rescheduledStart = initialStart.plus(4, ChronoUnit.HOURS);
        mockMvc.perform(put("/api/v1/bookings/" + bookingId + "/reschedule")
                .header("Authorization", "Bearer " + bobToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new ScheduleBookingRequest(rescheduledStart))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(bookingId.intValue())))
                .andExpect(jsonPath("$.status", is("SCHEDULED")));
    }

    @Test
    void shouldAllowParticipantToCancelBookingAndRevertExchange() throws Exception {
        Long exchangeId = createAndAcceptExchange(aliceToken, bobId, pythonSkill.getId(), new BigDecimal("1.00"));

        Instant initialStart = Instant.now().plus(24, ChronoUnit.HOURS).truncatedTo(ChronoUnit.SECONDS);
        MvcResult bookRes = mockMvc.perform(post("/api/v1/exchanges/" + exchangeId + "/book")
                .header("Authorization", "Bearer " + aliceToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new ScheduleBookingRequest(initialStart))))
                .andExpect(status().isCreated())
                .andReturn();

        Long bookingId = objectMapper.readTree(bookRes.getResponse().getContentAsString()).get("id").asLong();

        // Bob cancels booking
        mockMvc.perform(delete("/api/v1/bookings/" + bookingId)
                .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CANCELLED")));

        // Verify exchange status is restored to ACCEPTED (D-702)
        mockMvc.perform(get("/api/v1/exchanges/" + exchangeId)
                .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACCEPTED")));
    }

    @Test
    void shouldReturnUpcomingBookingsAndExchangeDetails() throws Exception {
        Long exchangeId = createAndAcceptExchange(aliceToken, bobId, pythonSkill.getId(), new BigDecimal("1.00"));

        Instant initialStart = Instant.now().plus(24, ChronoUnit.HOURS).truncatedTo(ChronoUnit.SECONDS);
        mockMvc.perform(post("/api/v1/exchanges/" + exchangeId + "/book")
                .header("Authorization", "Bearer " + aliceToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new ScheduleBookingRequest(initialStart))))
                .andExpect(status().isCreated());

        // Get upcoming bookings
        mockMvc.perform(get("/api/v1/bookings/upcoming")
                .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].skillName", is("Python Programming")));

        // Get exchange booking detail
        mockMvc.perform(get("/api/v1/exchanges/" + exchangeId + "/booking")
                .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requestId", is(exchangeId.intValue())))
                .andExpect(jsonPath("$.status", is("SCHEDULED")));
    }
}
