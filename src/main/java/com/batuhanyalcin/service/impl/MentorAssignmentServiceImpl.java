package com.batuhanyalcin.service.impl;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.batuhanyalcin.exception.AssignmentNotFoundException;
import com.batuhanyalcin.exception.FileUploadException;
import com.batuhanyalcin.exception.UnauthorizedAccessException;
import com.batuhanyalcin.model.Assignment;
import com.batuhanyalcin.model.Student;
import com.batuhanyalcin.model.User;
import com.batuhanyalcin.repository.AssignmentRepository;
import com.batuhanyalcin.repository.StudentRepository;
import com.batuhanyalcin.repository.UserRepository;
import com.batuhanyalcin.service.MentorAssignmentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MentorAssignmentServiceImpl implements MentorAssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    @Override
    public List<User> getStudentIds() {
        String mentorUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("getStudentIds çağrıldı - mentor: " + mentorUsername);
        
        List<User> result1 = userRepository.findByStudentMentorUserUsername(mentorUsername);
        List<User> result2 = userRepository.findAllStudentsByMentorUsername(mentorUsername);
        
        List<Student> students = studentRepository.findByMentorUsername(mentorUsername);
        
        System.out.println("findByMentorUsername sonucu: Öğrenci sayısı = " + students.size());
        for (Student student : students) {
            System.out.println("  - Öğrenci ID: " + student.getId() + ", User ID: " + 
                    (student.getUser() != null ? student.getUser().getId() : "null") + 
                    ", Ad: " + (student.getUser() != null ? student.getUser().getFirstName() : "null"));
        }
        
        Map<Long, User> combinedResults = new HashMap<>();
        
        for (User user : result1) {
            combinedResults.put(user.getId(), user);
        }
        
        for (User user : result2) {
            combinedResults.put(user.getId(), user);
        }
        
        for (Student student : students) {
            User user = student.getUser();
            if (user != null) {
                // Öğrenciyi mentore bağla (döngüsel ilişki olmaması için dikkatli yaklaşıyoruz)
                Student studentWithMentor = new Student();
                studentWithMentor.setId(student.getId());
                studentWithMentor.setStudentNumber(student.getStudentNumber());
                studentWithMentor.setDepartment(student.getDepartment());
                
                // Paketlenmiş User nesnesi oluştur
                User packagedUser = new User();
                packagedUser.setId(user.getId());
                packagedUser.setUsername(user.getUsername());
                packagedUser.setFirstName(user.getFirstName());
                packagedUser.setLastName(user.getLastName());
                packagedUser.setEmail(user.getEmail());
                packagedUser.setRole(user.getRole());
                packagedUser.setStudent(studentWithMentor);
                
                combinedResults.put(user.getId(), packagedUser);
            }
        }
        
        List<User> combinedList = new ArrayList<>(combinedResults.values());
        
        System.out.println("Mentor " + mentorUsername + " için bulunan öğrenci sayısı: " + combinedList.size());
        System.out.println("Birinci metot: " + result1.size() + " öğrenci");
        System.out.println("İkinci metot: " + result2.size() + " öğrenci");
        System.out.println("Student Repository: " + students.size() + " öğrenci");
        
        // Sonuç listesini yazdır
        for (User user : combinedList) {
            System.out.println("  - User ID: " + user.getId() + 
                    ", Ad: " + user.getFirstName() + " " + user.getLastName() + 
                    ", Öğrenci No: " + (user.getStudent() != null ? user.getStudent().getStudentNumber() : "null"));
        }
        
        return combinedList;
    }

    @Override
    public List<User> getAllMentorStudents() {
        String mentorUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("getAllMentorStudents çağrıldı - mentor: " + mentorUsername);
        
        List<Student> students = studentRepository.findByMentorUsername(mentorUsername);
        
        System.out.println("findByMentorUsername sonucu (getAllMentorStudents): Öğrenci sayısı = " + students.size());
        for (Student student : students) {
            System.out.println("  - Öğrenci ID: " + student.getId() + ", User ID: " + 
                    (student.getUser() != null ? student.getUser().getId() : "null") + 
                    ", Ad: " + (student.getUser() != null ? student.getUser().getFirstName() : "null"));
        }
        
        List<User> userList = new ArrayList<>();
        for (Student student : students) {
            User user = student.getUser();
            if (user != null) {
                // Döngüsel referansları önlemek için yeni bir User nesnesi oluşturalım
                User packagedUser = new User();
                packagedUser.setId(user.getId());
                packagedUser.setUsername(user.getUsername());
                packagedUser.setFirstName(user.getFirstName());
                packagedUser.setLastName(user.getLastName());
                packagedUser.setEmail(user.getEmail());
                packagedUser.setRole(user.getRole());
                
                // Öğrenci bilgisini ekleyelim ama döngüsel referans oluşturmadan
                Student packagedStudent = new Student();
                packagedStudent.setId(student.getId());
                packagedStudent.setStudentNumber(student.getStudentNumber());
                packagedStudent.setDepartment(student.getDepartment());
                packagedUser.setStudent(packagedStudent);
                
                userList.add(packagedUser);
            }
        }
        
        System.out.println("StudentRepository ile bulunan öğrenci sayısı: " + students.size());
        System.out.println("User listesine eklenen öğrenci sayısı: " + userList.size());
        
        return userList;
    }

    @Override
    public List<Assignment> getStudentAssignments(Long studentId) {
        String mentorUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new AssignmentNotFoundException("Öğrenci bulunamadı"));

        if (!student.getStudent().getMentor().getUser().getUsername().equals(mentorUsername)) {
            throw new UnauthorizedAccessException("Bu öğrencinin ödevlerine erişim yetkiniz yok");
        }

        return assignmentRepository.findByStudentId(studentId);
    }

    @Override
    public Assignment addFeedback(Long id, String feedback, Integer grade) {
        String mentorUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new AssignmentNotFoundException("Ödev bulunamadı"));

        if (!assignment.getStudent().getMentor().getUser().getUsername().equals(mentorUsername)) {
            throw new UnauthorizedAccessException("Bu ödeve geri bildirim bırakma yetkiniz yok");
        }

        assignment.setFeedback(feedback);
        assignment.setGrade(grade);
        return assignmentRepository.save(assignment);
    }

    @Override
    public ResponseEntity<byte[]> downloadAssignment(Long id) {
        String mentorUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new AssignmentNotFoundException("Ödev bulunamadı"));

        if (!assignment.getStudent().getMentor().getUser().getUsername().equals(mentorUsername)) {
            throw new UnauthorizedAccessException("Bu ödevi indirme yetkiniz yok");
        }

        try {
            Path filePath = Paths.get(assignment.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                throw new AssignmentNotFoundException("Dosya bulunamadı: " + assignment.getFileName());
            }

            byte[] fileContent = Files.readAllBytes(filePath);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + assignment.getFileName() + "\"")
                    .body(fileContent);
        } catch (MalformedURLException ex) {
            throw new FileUploadException("Dosya yolu geçersiz", ex);
        } catch (IOException ex) {
            throw new FileUploadException("Dosya indirilemedi", ex);
        }
    }
}