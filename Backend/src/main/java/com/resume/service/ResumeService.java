package com.resume.service;

import com.resume.dto.request.CreateResumeRequest;
import com.resume.dto.request.UpdateResumeRequest;
import com.resume.dto.response.ResumeResponse;
import com.resume.dto.response.ResumeSummaryResponse;
import com.resume.entity.Resume;
import com.resume.entity.User;
import com.resume.exception.ResumeNotFoundException;
import com.resume.exception.TemplateNotFoundException;
import com.resume.exception.UserNotFoundException;
import com.resume.repository.ResumeRepository;
import com.resume.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final TemplateService templateService;

    private User getCurrentLoggedInUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
    }

    @Transactional
    public ResumeResponse createResume(CreateResumeRequest request) {
        // Validate template exists
        if (!templateService.isValidTemplate(request.getTemplateId())) {
            throw new TemplateNotFoundException("Template not found with id: " + request.getTemplateId());
        }

        User currentUser = getCurrentLoggedInUser();

        Resume resume = new Resume();
        resume.setTitle(request.getTitle());
        resume.setTemplateId(request.getTemplateId());
        resume.setResumeDataJson(request.getResumeDataJson());
        resume.setUser(currentUser);

        Resume savedResume = resumeRepository.save(resume);

        return mapToResumeResponse(savedResume);
    }

    public List<ResumeSummaryResponse> getAllResumes() {
        User currentUser = getCurrentLoggedInUser();

        return resumeRepository.findAllByUserIdOrderByUpdatedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToResumeSummaryResponse)
                .collect(Collectors.toList());
    }

    public ResumeResponse getResumeById(Long resumeId) {
        User currentUser = getCurrentLoggedInUser();

        Resume resume = resumeRepository.findByIdAndUserId(resumeId, currentUser.getId())
                .orElseThrow(() -> new ResumeNotFoundException("Resume not found with id: " + resumeId));

        return mapToResumeResponse(resume);
    }

    @Transactional
    public ResumeResponse updateResume(Long resumeId, UpdateResumeRequest request) {
        // Validate template exists
        if (!templateService.isValidTemplate(request.getTemplateId())) {
            throw new TemplateNotFoundException("Template not found with id: " + request.getTemplateId());
        }

        User currentUser = getCurrentLoggedInUser();

        Resume resume = resumeRepository.findByIdAndUserId(resumeId, currentUser.getId())
                .orElseThrow(() -> new ResumeNotFoundException("Resume not found with id: " + resumeId));

        resume.setTitle(request.getTitle());
        resume.setTemplateId(request.getTemplateId());
        resume.setResumeDataJson(request.getResumeDataJson());

        Resume updatedResume = resumeRepository.save(resume);

        return mapToResumeResponse(updatedResume);
    }

    @Transactional
    public void deleteResume(Long resumeId) {
        User currentUser = getCurrentLoggedInUser();

        Resume resume = resumeRepository.findByIdAndUserId(resumeId, currentUser.getId())
                .orElseThrow(() -> new ResumeNotFoundException("Resume not found with id: " + resumeId));

        resumeRepository.delete(resume);
    }

    private ResumeResponse mapToResumeResponse(Resume resume) {
        return new ResumeResponse(
                resume.getId(),
                resume.getTitle(),
                resume.getTemplateId(),
                resume.getResumeDataJson(),
                resume.getCreatedAt(),
                resume.getUpdatedAt()
        );
    }

    private ResumeSummaryResponse mapToResumeSummaryResponse(Resume resume) {
        return new ResumeSummaryResponse(
                resume.getId(),
                resume.getTitle(),
                resume.getTemplateId(),
                resume.getUpdatedAt()
        );
    }
}