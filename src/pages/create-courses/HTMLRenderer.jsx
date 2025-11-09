import React from "react";

const HTMLRenderer = ({ content }) => {
  if (!content) return null;

  // Create a sanitized version of the HTML content
  const sanitizeHTML = (html) => {
    // Basic HTML sanitization - in production, you might want to use a library like DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove iframe tags
      .replace(/on\w+="[^"]*"/gi, "") // Remove event handlers
      .replace(/javascript:/gi, ""); // Remove javascript: URLs
  };

  const sanitizedContent = sanitizeHTML(content);

  return (
    <div
      className="prose prose-gray max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default HTMLRenderer;

