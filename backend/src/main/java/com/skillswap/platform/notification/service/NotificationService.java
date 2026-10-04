package com.skillswap.platform.notification.service;

import com.skillswap.platform.notification.dto.NotificationDto;
import com.skillswap.platform.notification.entity.Notification;
import com.skillswap.platform.notification.entity.NotificationType;
import com.skillswap.platform.notification.repository.NotificationRepository;
import com.skillswap.platform.user.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Notification sendNotification(User user, NotificationType type, String message) {
        if (user == null) {
            log.warn("Attempted to send notification with null user. Skipping.");
            return null;
        }
        Notification notification = new Notification(user, type, message);
        Notification saved = notificationRepository.save(notification);
        log.info("Notification sent to user {}: [{}] {}", user.getId(), type, message);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(Long userId) {
        return notificationRepository.findTop30ByUserIdOrderByCreatedAtDescIdDesc(userId)
                .stream()
                .map(NotificationDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public NotificationDto markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to access this notification");
        }

        notification.setRead(true);
        Notification updated = notificationRepository.save(notification);
        return NotificationDto.fromEntity(updated);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadForUser(userId);
    }
}
