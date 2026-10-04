package com.skillswap.platform.notification.controller;

import com.skillswap.platform.auth.security.UserPrincipal;
import com.skillswap.platform.notification.dto.NotificationDto;
import com.skillswap.platform.notification.dto.UnreadCountDto;
import com.skillswap.platform.notification.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getUserNotifications(@AuthenticationPrincipal UserPrincipal principal) {
        List<NotificationDto> notifications = notificationService.getUserNotifications(principal.id());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<UnreadCountDto> getUnreadCount(@AuthenticationPrincipal UserPrincipal principal) {
        long count = notificationService.getUnreadCount(principal.id());
        return ResponseEntity.ok(new UnreadCountDto(count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDto> markAsRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        NotificationDto updated = notificationService.markAsRead(principal.id(), id);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markAllAsRead(principal.id());
        return ResponseEntity.ok().build();
    }
}
