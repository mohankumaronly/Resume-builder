package com.resume.service;

import com.resume.dto.response.TemplateDetailResponse;
import com.resume.dto.response.TemplateResponse;
import com.resume.exception.TemplateNotFoundException;
import com.resume.model.TemplateDefinition;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TemplateService {

    // Static template data - hardcoded for now
    private final List<TemplateDefinition> templates = List.of(
            new TemplateDefinition(
                    "modern-1",
                    "Modern Clean",
                    "Clean modern template for software roles",
                    "modern",
                    "/templates/modern-1.png",
                    false
            ),
            new TemplateDefinition(
                    "classic-1",
                    "Classic Professional",
                    "Traditional professional resume layout",
                    "classic",
                    "/templates/classic-1.png",
                    false
            ),
            new TemplateDefinition(
                    "minimal-1",
                    "Minimal Elegant",
                    "Minimal one-column resume template",
                    "minimal",
                    "/templates/minimal-1.png",
                    true
            )
    );

    public List<TemplateResponse> getAllTemplates() {
        return templates.stream()
                .map(this::mapToTemplateResponse)
                .collect(Collectors.toList());
    }

    public TemplateDetailResponse getTemplateById(String templateId) {
        TemplateDefinition template = templates.stream()
                .filter(t -> t.getId().equals(templateId))
                .findFirst()
                .orElseThrow(() -> new TemplateNotFoundException(
                        "Template not found with id: " + templateId
                ));

        return mapToTemplateDetailResponse(template);
    }

    public boolean isValidTemplate(String templateId) {
        return templates.stream()
                .anyMatch(t -> t.getId().equals(templateId));
    }

    private TemplateResponse mapToTemplateResponse(TemplateDefinition template) {
        return new TemplateResponse(
                template.getId(),
                template.getName(),
                template.getDescription(),
                template.getCategory(),
                template.getPreviewImageUrl(),
                template.isPremium()
        );
    }

    private TemplateDetailResponse mapToTemplateDetailResponse(TemplateDefinition template) {
        return new TemplateDetailResponse(
                template.getId(),
                template.getName(),
                template.getDescription(),
                template.getCategory(),
                template.getPreviewImageUrl(),
                template.isPremium()
        );
    }
}