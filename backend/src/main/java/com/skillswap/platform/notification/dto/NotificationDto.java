package com.skillswap.platform.notification.dto;

import com.skillswap.platform.notification.entity.Notification;
import com.skillswap.platform.notification.entity.NotificationType;

import java.time.Instant;

public class NotificationDto {
    private Long id;
    private String message;
    private NotificationType type;
    private boolean read;
    private Instant createdAt;

    public NotificationDto() {
    }

    public NotificationDto(Long id, String message, NotificationType type, boolean read, Instant createdAt) {
        this.id = id;
        this.message = message;
        this.type = type;
        this.read = read;
        this.createdAt = createdAt;
    }

    public static NotificationDto fromEntity(Notification notification) {
        return new NotificationDto(
                notification.getId(),
                notification.getMessage(),
                notification.getType(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
