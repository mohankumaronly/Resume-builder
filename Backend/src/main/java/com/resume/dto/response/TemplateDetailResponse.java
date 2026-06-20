package com.resume.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TemplateDetailResponse {

    private String id;
    private String name;
    private String description;
    private String category;
    private String previewImageUrl;
    private boolean premium;
}