package com.batuhanyalcin.exception;

public class FileUploadException extends CustomException {
    public FileUploadException(String message) {
        super(message);
    }

    public FileUploadException(String message, Throwable cause) {
        super(message, cause);
    }
} 