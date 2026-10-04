package com.skillswap.platform.notification;

import com.skillswap.platform.notification.dto.NotificationDto;
import com.skillswap.platform.notification.entity.Notification;
import com.skillswap.platform.notification.entity.NotificationType;
import com.skillswap.platform.notification.repository.NotificationRepository;
import com.skillswap.platform.notification.service.NotificationService;
import com.skillswap.platform.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User alice;
    private User bob;

    @BeforeEach
    void setUp() {
        alice = new User("Alice", "alice@example.com", "hash", "Seattle");
        alice.setId(1L);

        bob = new User("Bob", "bob@example.com", "hash", "Portland");
        bob.setId(2L);
    }

    @Test
    @DisplayName("sendNotification saves new notification with false isRead")
    void shouldSendNotificationSuccessfully() {
        Notification savedNotification = new Notification(alice, NotificationType.REQUEST_RECEIVED, "New request from Bob");
        savedNotification.setId(10L);

        when(notificationRepository.save(any(Notification.class))).thenReturn(savedNotification);

        Notification result = notificationService.sendNotification(alice, NotificationType.REQUEST_RECEIVED, "New request from Bob");

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getMessage()).isEqualTo("New request from Bob");
        assertThat(result.getType()).isEqualTo(NotificationType.REQUEST_RECEIVED);
        assertThat(result.isRead()).isFalse();
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    @DisplayName("getUserNotifications returns mapped DTO list")
    void shouldGetUserNotifications() {
        Notification n1 = new Notification(alice, NotificationType.REQUEST_ACCEPTED, "Request accepted");
        n1.setId(101L);
        Notification n2 = new Notification(alice, NotificationType.BOOKING_SCHEDULED, "Session scheduled");
        n2.setId(102L);

        when(notificationRepository.findTop30ByUserIdOrderByCreatedAtDescIdDesc(1L)).thenReturn(List.of(n2, n1));

        List<NotificationDto> result = notificationService.getUserNotifications(1L);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(102L);
        assertThat(result.get(1).getId()).isEqualTo(101L);
    }

    @Test
    @DisplayName("getUnreadCount returns correct unread count")
    void shouldGetUnreadCount() {
        when(notificationRepository.countByUserIdAndIsReadFalse(1L)).thenReturn(3L);

        long count = notificationService.getUnreadCount(1L);

        assertThat(count).isEqualTo(3L);
        verify(notificationRepository).countByUserIdAndIsReadFalse(1L);
    }

    @Test
    @DisplayName("markAsRead updates notification read status when caller is owner")
    void shouldMarkAsReadWhenOwner() {
        Notification notification = new Notification(alice, NotificationType.REQUEST_RECEIVED, "Hello");
        notification.setId(50L);
        notification.setRead(false);

        when(notificationRepository.findById(50L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        NotificationDto result = notificationService.markAsRead(1L, 50L);

        assertThat(result.isRead()).isTrue();
        verify(notificationRepository).save(notification);
    }

    @Test
    @DisplayName("markAsRead throws 404 when notification does not exist")
    void shouldThrow404WhenNotFound() {
        when(notificationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.markAsRead(1L, 999L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404");
    }

    @Test
    @DisplayName("markAsRead throws 403 when caller is not owner")
    void shouldThrow403WhenNotOwner() {
        Notification notification = new Notification(bob, NotificationType.REQUEST_RECEIVED, "Bob's notification");
        notification.setId(60L);

        when(notificationRepository.findById(60L)).thenReturn(Optional.of(notification));

        assertThatThrownBy(() -> notificationService.markAsRead(1L, 60L)) // Alice tries to mark Bob's notification
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("403");
    }

    @Test
    @DisplayName("markAllAsRead delegates to repository update query")
    void shouldMarkAllAsRead() {
        notificationService.markAllAsRead(1L);

        verify(notificationRepository).markAllAsReadForUser(1L);
    }
}
