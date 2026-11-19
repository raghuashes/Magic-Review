package com.magicreview.dto;

import com.magicreview.enums.EventType;
import jakarta.validation.constraints.NotNull;

public class RecordEventRequest {

    @NotNull(message = "Event type is required and must be PAGE_VIEW, DRAFT_GENERATED, or GOOGLE_LINK_CLICKED")
    private EventType eventType;

    public RecordEventRequest() {
    }

    public RecordEventRequest(EventType eventType) {
        this.eventType = eventType;
    }

    public EventType getEventType() {
        return eventType;
    }

    public void setEventType(EventType eventType) {
        this.eventType = eventType;
    }
}
