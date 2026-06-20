package com.resume.controller;

import com.resume.dto.response.ApiResponse;
import com.resume.dto.response.TemplateDetailResponse;
import com.resume.dto.response.TemplateResponse;
import com.resume.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    @GetMapping
    public ResponseEntity<ApiResponse> getAllTemplates() {
        List<TemplateResponse> templates = templateService.getAllTemplates();
        return ResponseEntity.ok(ApiResponse.success("Templates fetched successfully", templates));
    }

    @GetMapping("/{templateId}")
    public ResponseEntity<ApiResponse> getTemplateById(@PathVariable String templateId) {
        TemplateDetailResponse template = templateService.getTemplateById(templateId);
        return ResponseEntity.ok(ApiResponse.success("Template fetched successfully", template));
    }
}